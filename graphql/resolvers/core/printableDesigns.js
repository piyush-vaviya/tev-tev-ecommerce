/**
 * Local modules
 *
 */
const amqp = require('../../../utils/amqp')

/**
 * Schemas
 *
 */
const { PrintablDesign } = require('../../../mongo/printableDesign')
const { Order } = require('../../../mongo/order')

module.exports = {
  Query: {
    printableDesigns: async (parent, { order_id }, context) => {
      return PrintablDesign.find({
        order_id: order_id,
      }).sort([['created_at', -1]])
    },
  },

  Mutation: {
    recreatePrintableDesigns: async (parent, { order_id }, context) => {
      const order = await Order.findById(order_id)

      await amqp.publish('mp-printable-design', JSON.stringify({
        order_id: order._id,
        products: order.order_details.products,
      }))

      return true
    },
  },
}
