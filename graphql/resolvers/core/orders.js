const _ = require('lodash')

const { inputValidator } = require('../../utils/inputValidator')
const {
  CREATE_ORDER_VALIDATION,
  UPDATE_STATUS_VALIDATION,
} = require('../../validations/orders')
const { orderIdGenerator } = require('../../utils/orderIdGenerator')
const { STATUS } = require('../../../constants/orders')

const { Order } = require('../../../mongo/order')
const { PrintablDesign } = require('../../../mongo/printableDesign')

const { getProductById } = require('../../../services/products')
const customProductService = require('../../../services/customProducts')
const { findOrder, findOrders, updateOrderStatus, findAllOrders, findOrderById, searchOrders, generateBarCode } = require('../../../services/orders')
const { calculateShippingFee, calculateDiscountAndTotal } = require('../../../services/carts')
const { createChargesPayment } = require('../../utils/stripe')
const { PaymentTransaction } = require('../../../services/transactions')
const { checkUserIfAlreadyExist } = require('../../../services/users')
const { limitAndOffset } = require('../../utils/query')
const { findSku } = require('../../../services/skus')

const { getUsersByIdLoader } = require('../../dataLoaders/users')
const { getProductsByIdLoader } = require('../../dataLoaders/product')
const { getSidesWithDesign } = require('../../dataLoaders/customProduct')
const amqp = require('../../../utils/amqp')
const { authorize } = require('../../utils/auth')
const { actionNotAllowed } = require('../../errors/auth')
const { notCancellable } = require('../../errors/order')
const { ROLES } = require('../../../constants/auth')

const { getColorsByIdLoader } = require('../../dataLoaders/colors')
const { getItemsByIdLoader } = require('../../dataLoaders/item')

const client = require('../../../utils/apolloClient')

const ORDER_QUERIES = require('../../queries/order')

module.exports = {

  Query: {
    order: async (parent, { input }, context) => {
      if (!context.jwt) {
        throw actionNotAllowed()
      }

      const order = await findOrder(input.order_no, input.user_id)
      return order
    },

    orderHistory: async (parent, { input }, context) => {
      if (!context.jwt) {
        throw actionNotAllowed()
      }

      const [limit, offset] = limitAndOffset(input.paginator)
      const { orderCount, pageInfo, edges } = await findOrders(input.user_id, limit, offset)

      return {
        total_count: orderCount,
        page_info: pageInfo,
        edges,
      }
    },

    ordersAll: async (parent, { paginator }, context) => {
      if (!context.jwt || !authorize(context.jwt.roles, [ROLES.ADMIN, ROLES.SHIPPING])) {
        throw actionNotAllowed()
      }

      const [limit, offset] = limitAndOffset(paginator)

      const { orderCount, pageInfo, edges } = await findAllOrders(limit, offset)
      return {
        total_count: orderCount,
        page_info: pageInfo,
        edges,
      }
    },

    orderById: async (parent, { order_id: orderId }, context) => {
      // if (!context.jwt || !authorize(context.jwt.roles, [ROLES.ADMIN, ROLES.SHIPPING])) {
      //   throw actionNotAllowed()
      // }

      const order = await findOrderById(orderId)
      return order
    },

    ordersSearch: async (parent, { input }, context) => {
      if (!context.jwt || !authorize(context.jwt.roles, [ROLES.ADMIN, ROLES.SHIPPING])) {
        throw actionNotAllowed()
      }

      const [limit, offset] = limitAndOffset(input.paginator)
      const orders = await searchOrders(input.term, limit, offset, input.paginator.sort)
      return orders
    },
  },

  Mutation: {
    checkout: async (parent, { input }, context) => {
      const values = inputValidator(input, CREATE_ORDER_VALIDATION)

      const orderPayload = values
      const orderId = orderIdGenerator()
      const { products } = orderPayload.order_details
      let subTotal = 0
      let totalQuantity = 0

      for (const [i, product] of products.entries()) {
        /**
         * when adding / removing field(s) in here
         * kindly double check if changes can be applied to
         * PaymentTransaction() service also
         */
        const overValue = i + 1
        const orderIdPrefix = `${overValue}/${products.length}` // e.g 1/5
        const orderNo = `${orderId}-${orderIdPrefix}`

        const info = product.product_id
          ? await getProductById(product.product_id)
          : await customProductService.getByCustomProductId(product.custom_product_id)

        /**
         * check if product_id is used in order details,
         * if yes use special price or regular price of sellables.
         * If custom_product_id is used in order details,
         * just use the price of custom product
         *
         */
        product.price = product.product_id
          ? info.product_special_price || info.productRegularPrice
          : info.price

        /**
         * Summation of total order price
         *
         */
        const totalAmountToPay = product.quantity * product.price
        subTotal += totalAmountToPay

        product.total_amount_to_pay = _.floor(totalAmountToPay, 2)
        product.order_item_no = orderNo
        product.product_name = info.product_name
        product.order_item_no_barcode = await generateBarCode(orderNo)

        let productImg = null

        if (product.product_id) {
          const findImg = info.product_images.find(x => x.index === 1 && x.color.toString() === product.product_color.toString())
          productImg = findImg ? findImg.image_url : null
        } else {
          productImg = info.image_url
        }

        product.product_image = productImg

        const itemId = info.item

        // add sku to order details
        const sku = await findSku(itemId, product.product_color, product.product_size)
        product.product_sku = sku.sku

        /**
         * Save the current printing method of the product/custom product
         * TODO: Implement setting printing method in customizelab and filtering
         * searcheable designs based on printing method
         */
        product.printing_method = info.printing_method ? info.printing_method : 'digital'
        product.item = info.item

        /**
         * Save current item_config and design_config to avoid problems
         * when admin tool updates the product and the product is being
         * produced in chemical station. There will be discrepancies in
         * data because of update. We are going to use these data in
         * product manufacturing.
         *
         */
        if (product.product_id) {
          await info.populate('item').execPopulate()
        }
        product.item_config = product.product_id ? info.item.mock_up_item_config : info.item_config
        product.design_config = info.design_config

        totalQuantity += product.quantity
      }

      /**
       * Order ref number for whole transaction
       */
      orderPayload.order_no = `${orderId}-${products.length}-${totalQuantity}`
      orderPayload.order_no_barcode = await generateBarCode(orderPayload.order_no)
      subTotal = _.floor(subTotal, 2)
      const { discount } = await calculateDiscountAndTotal({ subTotal, totalQuantity })
      const shippingFee = calculateShippingFee({ products }, values.shipping_method)
      orderPayload.order_details.sub_total = subTotal
      orderPayload.order_details.discount = discount
      orderPayload.order_details.total = _.floor((subTotal - discount) + shippingFee, 2)

      // create acct when user don't exist
      await checkUserIfAlreadyExist(values)

      // create payment charges
      const charge = await createChargesPayment(
        (orderPayload.order_details.total * 100).toFixed(0),
        'usd',
        orderPayload.order_no,
        orderPayload.stripe_card_token,
      )

      if (charge.status === 'succeeded') {
        const paymentDate = Date.now()
        const orderPaymentStripeReference = charge.id

        orderPayload.order_details.order_status = STATUS.PAID
        orderPayload.order_details.order_payment_stripe_reference = orderPaymentStripeReference
        orderPayload.order_details.payment_date = paymentDate
        orderPayload.order_details.shipping_fee = shippingFee

        // for payment transactions
        const paymentTransactionInputs = {
          user_id: orderPayload.user_id,
          order_payment_stripe_reference: orderPaymentStripeReference,
          products: orderPayload.order_details.products,
          payment_date: paymentDate,
          order_no: orderPayload.order_no,
          order_no_barcode: orderPayload.order_no_barcode,
          shipping_fee: orderPayload.order_details.shipping_fee,
          sub_total: subTotal,
          total: orderPayload.order_details.total,
          discount: orderPayload.order_details.discount,
        }

        const orderCreatedPromise = Order.create(orderPayload)
        const creatingTransactionPromise = PaymentTransaction(paymentTransactionInputs)
        const [order] = await Promise.all([orderCreatedPromise, creatingTransactionPromise])

        const createProduction = client(process.env.PRODUCTION_GRAPHQL, {
          query: ORDER_QUERIES.CREATE_PRODUCTIONS_FOR_ORDER,
          variables: {
            input: {
              order_id: order._id,
            },
          },
        })

        const printableDesign = amqp.publish('mp-printable-design', JSON.stringify({
          order_id: order._id,
          products: order.order_details.products,
        }))

        // const earnings = amqp.publish('mp-distribute-earnings', JSON.stringify({
        //   order_id: order._id,
        // }))

        await Promise.all([createProduction, printableDesign])

        return charge.status
      } else {
        return charge.status
      }
    },

    updateOrderStatus: async (parent, { input }, context) => {
      if (!context.jwt) {
        throw actionNotAllowed()
      }

      const values = inputValidator(input, UPDATE_STATUS_VALIDATION)

      const updateOrderStatusResponse = await updateOrderStatus(values.order_no, values.user_id, values.update_type)
      if (!updateOrderStatusResponse) {
        throw notCancellable()
      }
      return updateOrderStatusResponse.order_details.order_status
    },
  },

  Orders: {
    edges: async (parent, __) => {
      for (const order of parent.edges) {
        order.toObject()
        const userDetails = await getUsersByIdLoader.load(order.user_id)
        order.user_name = `${userDetails.first_name} ${userDetails.last_name}`
      }
      return parent.edges
    },
  },

  ProductDetails: {
    printable_design: async (parent, { order_id_sub: orderSubId }) => {
      parent.toObject()
      const printables = await PrintablDesign.find({ order_id: orderSubId })
      for (const design of printables) {
        if (design.order_item_no === parent.order_item_no) {
          return design
        }
      }
    },

    product_color: async (parent, args) => {
      return getColorsByIdLoader.load(parent.product_color)
    },

    item: async (parent, args) => {
      return getItemsByIdLoader.load(parent.item)
    },

    product: async (parent, args, context) => {
      if (!parent.product_id) {
        return null
      }

      return getProductsByIdLoader.load(parent.product_id)
    },

    custom_product: async (parent, args, context) => {
      if (!parent.custom_product_id) {
        return null
      }

      return getSidesWithDesign(parent)
    },
  },
}
