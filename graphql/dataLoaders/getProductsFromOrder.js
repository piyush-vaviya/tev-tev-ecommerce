const DataLoader = require('dataloader')
const { objectIdMap } = require('../../utils/database')

const { Order } = require('../../mongo/order')

const getProductsFromOrderId = async (ids) => {
  try {
    const objectIds = objectIdMap(ids)

    const data = await Order.find({
      _id: {
        $in: objectIds,
      },
    })

    return objectIds.map(id => {
      const orders = data.find(d => id.equals(d._id))

      if (!orders) return null
      return orders.order_details.products
    })
  } catch (error) {
    throw new Error(error.message)
  }
}

const getProductsFromOrderLoader = new DataLoader(getProductsFromOrderId)

module.exports = {
  getProductsFromOrderLoader,
}
