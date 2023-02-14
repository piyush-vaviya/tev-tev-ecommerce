const { UserInputError } = require('apollo-server-express')
const _ = require('lodash')
const async = require('async')

const { Sku } = require('../mongo/sku')
const { Color } = require('../mongo/color')

const { SKU_NOT_FOUND } = require('../constants/errorMessages')

module.exports.findSku = async (item, color, size) => {
  const itemSku = await Sku.findOne({
    item: item,
    color: color,
    size: size,
  })

  if (!itemSku) throw new UserInputError(SKU_NOT_FOUND)
  return itemSku
}

/**
 * Bulk insert the new color + size combination for this item
 *
 * @param   {string}  itemId     [itemId description]
 * @param   {string}  skuPrefix  [skuPrefix description]
 * @param   {Array<string>}  colorIds   [colorIds description]
 * @param   {Array<string>}  sizeIds    [sizeIds description]
 *
 * @return  {Promise}             [return description]
 */
module.exports.createSkusByColorAndSize = async ({ itemId, skuPrefix, colorIds, sizeIds }) => {
  const colors = await Color.find({ _id: { $in: colorIds } })

  const colorSizeList = _.flatten(colors.map(color => sizeIds.map(size => [color, size])))

  return async.each(colorSizeList, async ([color, size]) => {
    const santizedColorName = _.upperCase(color.name.replace(/\s/g, '-'))
    try {
      await Sku.updateOne({
        sku: `${skuPrefix}-${santizedColorName}-${size}`,
      }, {
        sku: `${skuPrefix}-${santizedColorName}-${size}`,
        item: itemId,
        color: color._id,
        size: size,
      }, {
        upsert: true,
      })
    } catch (err) {
      // swallow error
    }
  })
}
