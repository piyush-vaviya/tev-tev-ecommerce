const express = require('express')
const router = express.Router()
const xmlbuilder = require('xmlbuilder2')
const moment = require('moment')

const { Order } = require('../mongo/order')
const ORDER_CONSTANTS = require('../constants/orders')

const shipstationDateFormat = 'MM/DD/YYYY HH:mm'

function formatDate (date) {
  return moment(date).format('MM/DD/YYYY HH:mm')
}

function isAuthorized (req) {
  const header = req.headers.authorization

  if (!header) return false

  const basicAuth = header.split(' ')

  if (basicAuth.length < 2) return false

  const basicToken = basicAuth[1]

  const [username, password] = Buffer.from(basicToken, 'base64').toString().split(':')

  if (username !== process.env.SHIPSTATION_BASIC_USERNAME ||
    password !== process.env.SHIPSTATION_BASIC_PASSWORD) {
    return false
  }

  return true
}

router.get('', async (req, res) => {
  // action=export&start_date=[Start Date]&end_date=[End Date]&page=1
  // [Your Web Endpoint]?action=export&start_date=[Start Date]&amp;end_date=[End Date]&amp;page=1
  if (!isAuthorized(req)) return res.status(401).end()

  // count number of pages for specified date range, we are going to return 10 records per page only
  const params = req.query
  console.log(params)

  const startDate = moment(params.start_date, shipstationDateFormat).toDate()
  const endDate = moment(params.end_date, shipstationDateFormat).toDate()
  const totalRecordsPerDate = await Order.countDocuments({ updated_at: { $gte: startDate, $lte: endDate } })

  const perPage = 10
  const offset = (params.page - 1) * perPage

  const orders = await Order.find({ updated_at: { $gte: startDate, $lte: endDate } }).limit(perPage).skip(offset).populate('user_id')

  const xmlObject = xmlbuilder.create()
  const ordersTag = xmlObject.ele('Orders', { pages: Math.floor(totalRecordsPerDate / 10) + 1 })

  for (const order of orders) {
    const orderTag = ordersTag.ele('Order')
    orderTag.ele('OrderID').txt(order._id.toString())
    orderTag.ele('OrderNumber').txt(order.order_no)
    orderTag.ele('OrderDate').txt(formatDate(order.created_at))
    orderTag.ele('OrderStatus').txt(order.order_details.order_status)
    orderTag.ele('LastModified').txt(formatDate(order.updated_at))
    orderTag.ele('ShippingMethod').txt('USPSPriorityMail')
    orderTag.ele('PaymentMethod').txt('Credit Card')
    orderTag.ele('OrderTotal').txt(order.order_details.total_amount_of_orders)
    orderTag.ele('TaxAmount').txt(0.00)
    orderTag.ele('ShippingAmount').txt(0.00)
    orderTag.ele('CustomerNotes').txt(order.order_notes)
    orderTag.ele('InternalNotes').txt('')
    orderTag.ele('Gift').txt(false)
    orderTag.ele('GiftMessage').txt('')
    orderTag.ele('CustomField1').txt('')
    orderTag.ele('CustomField2').txt('')
    orderTag.ele('CustomField3').txt('')

    const customerTag = orderTag.ele('Customer')
    customerTag.ele('CustomerCode').txt(order.user_id.email)
    const billToTag = customerTag.ele('BillTo')
    billToTag.ele('Name').txt(`${order.billing_info.first_name} ${order.billing_info.last_name}`)
    billToTag.ele('Email').txt(order.user_id.email)
    const shipToTag = customerTag.ele('ShipTo')
    shipToTag.ele('Name').txt(`${order.shipping_info.first_name} ${order.shipping_info.last_name}`)
    shipToTag.ele('Address1').txt(order.shipping_info.street)
    shipToTag.ele('City').txt(order.shipping_info.city)
    shipToTag.ele('State').txt(order.shipping_info.state)
    shipToTag.ele('PostalCode').txt(order.shipping_info.zipcode)
    shipToTag.ele('Country').txt('US')

    const itemsTag = orderTag.ele('Items')
    for (const p of order.order_details.products) {
      const itemTag = itemsTag.ele('Item')
      itemTag.ele('SKU').txt(p.product_sku)
      itemTag.ele('Name').txt(p.product_name)
      itemTag.ele('ImageUrl').txt(p.product_image)
      itemTag.ele('Quantity').txt(p.quantity)
      itemTag.ele('UnitPrice').txt(p.product_regular_price)
    }
  }

  res.header('Content-Type', 'text/xml')
  return res.send(xmlObject.end())
})

router.post('', (req, res) => {
  if (!isAuthorized(req)) return res.status(401).end()

  let body = ''

  req.on('data', chunk => {
    body += chunk.toString() // convert Buffer to string
  })

  req.on('end', async () => {
    const xmlObject = xmlbuilder.convert(body, { format: 'object' })

    console.log(require('util').inspect(xmlObject, { depth: null }))

    const order = await Order.findById(xmlObject.ShipNotice.OrderID)

    order.order_details.order_status = ORDER_CONSTANTS.STATUS.SHIPPED
    order.tracking_no = xmlObject.ShipNotice.TrackingNumber
    order.carrier = xmlObject.ShipNotice.Carrier
    order.shipping_service = typeof xmlObject.ShipNotice.Servicenode === 'string' && xmlObject.ShipNotice.Service
    order.shipping_date = moment(xmlObject.ShipNotice.ShipDate, shipstationDateFormat).toDate()
    order.label_created_at = moment(xmlObject.ShipNotice.LabelCreateDate, shipstationDateFormat).toDate()

    await order.save()

    return res.end()
  })
})

module.exports = router
