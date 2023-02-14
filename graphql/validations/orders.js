const Joi = require('@hapi/joi')
const { validateObjectId } = require('./utils/common')

const ORDER_CONSTANTS = require('../../constants/orders')

const CREATE_ORDER_VALIDATION = Joi.object({
  user_id: Joi.string().required().invalid('').custom(validateObjectId),
  order_details: Joi.object().required().keys({
    products: Joi.array().required().items(
      Joi.object().required().keys({
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
        }),
    ),
  }),
  shipping_info: Joi.object().optional().keys({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    street: Joi.string().required(),
    state: Joi.string().required(),
    city: Joi.string().required(),
    zipcode: Joi.string().required(),
  }),
  billing_info: Joi.object().required().keys({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    street: Joi.string().required(),
    state: Joi.string().required(),
    city: Joi.string().required(),
    zipcode: Joi.string().required(),
  }),
  order_notes: Joi.string().optional(),
  shipping_method: Joi.string().required().allow(...Object.values(ORDER_CONSTANTS.SHIPPING_METHODS)),
  coupon_code: Joi.string().optional(),
  stripe_card_token: Joi.string().required(),
})

const UPDATE_STATUS_VALIDATION = Joi.object({
  user_id: Joi.string().required(),
  order_no: Joi.string().required(),
  update_type: Joi.string().required(),
})

module.exports = {
  CREATE_ORDER_VALIDATION,
  UPDATE_STATUS_VALIDATION,
}
