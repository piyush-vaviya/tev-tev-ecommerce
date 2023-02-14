const Joi = require('@hapi/joi')
const { validateObjectId } = require('./utils/common')
const ITEM_CONSTANTS = require('../../constants/items')

const BULK_ADD_TO_CART = Joi.object({
  user_id: Joi.string().required().invalid('').custom(validateObjectId),
  product_id: Joi.string().optional().invalid('').custom(validateObjectId),
  custom_product_id: Joi.string().optional().invalid('').custom(validateObjectId),
  quantity: Joi.number().required(),
  product_color: Joi.string().required().invalid('').custom(validateObjectId),
  product_size: Joi.string().required(),
  product_image: Joi.string().optional().allow(null).invalid(''),
})
  .xor('product_id', 'custom_product_id')
  .messages({
    'object.xor': 'You can only use one of the two ["product_id", "custom_product_id"] per item in cart',
  })

const CLEAR_CART = Joi.object({
  user_id: Joi.string().required().invalid('').custom(validateObjectId),
  cart_id: Joi.string().required().invalid('').custom(validateObjectId),
  cart_product_id: Joi.string().required().invalid('').custom(validateObjectId),
})

const SIZE_QUANTITY = Joi.array().items(Joi.object().keys({
  quantity: Joi.number().required(),
  size: Joi.string().required().invalid('').allow(...ITEM_CONSTANTS.SIZES),
}))

const BULK_ADD_TO_CART = Joi.object({
  user_id: Joi.string().required().invalid('').custom(validateObjectId),
  cl_draft_id: Joi.string().required().invalid('').custom(validateObjectId),
  size_quantity: SIZE_QUANTITY,
  product_image: Joi.string().optional(),
})

module.exports = {
  UPDATE_CART,
  CLEAR_CART,
  BULK_ADD_TO_CART,
}
