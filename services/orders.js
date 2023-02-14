const { Order } = require('../mongo/order')

const { UserInputError } = require('apollo-server-express')
const bwipjs = require('bwip-js')

const { ORDER_NOT_FOUND } = require('../constants/errorMessages')
const { getUsersByIdLoader } = require('../graphql/dataLoaders/users')

const aws = require('../utils/aws')
const { STATUS } = require('../constants/orders')

module.exports.findOrder = async (orderNo, userId) => {
  const order = await Order.findOne({ order_no: orderNo, user_id: userId })
  if (!order) throw new UserInputError(ORDER_NOT_FOUND)
  return order
}

module.exports.findOrderById = async (id) => {
  const order = await Order.findById(id)
  return order
}

module.exports.findOrders = async (userId, limit, offset) => {
  const totalOrders = await Order.find({ user_id: userId }).countDocuments()
  const orders = await Order.find({ user_id: userId }).limit(limit).skip(offset)
  if (orders.length === 0) throw new Error(ORDER_NOT_FOUND)

  const [orderCount, rows] = await Promise.all([totalOrders, orders])
  const hasNextPage = (limit + offset) < totalOrders

  return {
    orderCount,
    pageInfo: {
      has_next_page: hasNextPage,
    },
    edges: rows,
  }
}

module.exports.findAllOrders = async (limit, offset) => {
  const totalOrders = await Order.find({}).countDocuments()
  const orders = await Order.find().limit(limit).skip(offset)

  for (const order of orders) {
    const user = await getUsersByIdLoader.load(order.user_id)
    order.user_name = `${user.first_name} ${user.last_name}`
  }

  const [orderCount, rows] = await Promise.all([totalOrders, orders])
  const hasNextPage = (limit + offset) < totalOrders

  return {
    orderCount,
    pageInfo: {
      has_next_page: hasNextPage,
    },
    edges: rows,
  }
}

module.exports.searchOrders = async (term, limit, offset, sort) => {
  const totalOrders = await Order.find({}).countDocuments()
  if (!term && term !== '') {
    const orders = Order.find({}).limit(limit).skip(offset)

    if (sort && sort.criteria && sort.order) {
      orders.sort({ [sort.criteria]: sort.order })
    }

    const [orderCount, rows] = await Promise.all([totalOrders, orders])
    return {
      total_count: orderCount,
      edges: rows,
    }
  }

  const orders = Order.find({
    $or: [
      {
        order_no: {
          $regex: new RegExp(term, 'i'),
        },
      },
      {
        'billing_info.first_name': {
          $regex: new RegExp(term, 'i'),
        },
      },
      {
        'billing_info.last_name': {
          $regex: new RegExp(term, 'i'),
        },
      },
      {
        'billing_info.phone': {
          $regex: new RegExp(term, 'i'),
        },
      },
      {
        'billing_info.email': {
          $regex: new RegExp(term, 'i'),
        },
      },
    ],
  }).limit(limit).skip(offset)

  if (sort && sort.criteria && sort.order) {
    orders.sort({ [sort.criteria]: sort.order })
  }

  const [orderCount, rows] = await Promise.all([totalOrders, orders])
  return {
    total_count: orderCount,
    edges: rows,
  }
}

module.exports.generateBarCode = async (bcodeText) => {
  const barcodeLocation = bwipjs.toBuffer({
    bcid: 'code128',
    text: bcodeText,
    scale: 2,
    height: 10,
    includetext: true,
    textxalign: 'center',
  }).then(async (png) => {
    bcodeText = bcodeText.replace('/', '-')
    const s3Upload = await aws.S3.upload({
      bucketName: process.env.AWS_BUCKET_MAIN,
      keyName: `orders/barcodes/${bcodeText}.png`,
      contentType: 'image/png',
      acl: 'public-read',
      fileStream: png,
    })
    return s3Upload.Location
  }).catch(() => {
    /**
     * i didn't throw the err to make that so that
     * order will still go through w/o barcode generated
     */
    return 'FAILED TO GENERATE BARCODE'
  })
  return barcodeLocation
}

module.exports.updateOrderStatus = async (orderNo, userId, updateType) => {
  return await Order.findOneAndUpdate(
    {
      user_id: userId,
      orderNo: orderNo,
      'order_details.order_status': { $ne: STATUS.CANCELED },
    },
    {
      $set: {
        'order_details.order_status': updateType,
      },
    },
    { returnOriginal: false },
  )
}
