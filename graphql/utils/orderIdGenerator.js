const orderid = require('order-id')(process.env.ORDER_ID_SECRET)

module.exports.orderIdGenerator = () => {
  return orderid.generate()
}
