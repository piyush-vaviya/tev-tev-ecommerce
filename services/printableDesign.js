/**
 * Schemas
 *
 */
const { PrintablDesign } = require('../mongo/printableDesign')

module.exports.findAllPrintableDesignsByOrderId = (orderId) => {
  return PrintablDesign.find({ order_id: orderId })
}

module.exports.findOnePrintableDesignByOrderRefNo = (orderRefNo) => {
  return PrintablDesign.findOne({ order_item_no: orderRefNo })
}
