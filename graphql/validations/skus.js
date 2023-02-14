const Joi = require('@hapi/joi')
const ITEM_CONSTANTS = require('../../constants/items')

const SKU_DATA_JOI = Joi.object().required().keys({
  sku: Joi.string().required(),
  item: Joi.string().required(),
  color: Joi.string().required(),
  size: Joi.string().required().valid(...ITEM_CONSTANTS.SIZES),
})

const BULK_CREATE = Joi.object({
  input: Joi.array().required().items(SKU_DATA_JOI),
})

const UPDATE = Joi.object({
  sku: Joi.string().required(),
  item: Joi.string().optional(),
  color: Joi.string().optional(),
  size: Joi.string().optional().valid(...ITEM_CONSTANTS.SIZES),
})

const DELETE = Joi.object({
  id: Joi.string().required(),
})

module.exports = {
  BULK_CREATE, UPDATE, DELETE,
}
