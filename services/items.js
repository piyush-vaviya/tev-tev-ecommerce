const { Item } = require('../mongo/item')

module.exports.findById = async (itemId) => {
  return Item.findById(itemId)
}
