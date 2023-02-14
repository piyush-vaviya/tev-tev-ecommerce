const Joi = require('@hapi/joi')

const { validateObjectId } = require('./utils/common')

const CREATE = Joi.object({
  min_quantity: Joi.number().integer().required(),
  discount_percentage: Joi.number().max(100).required(),
})

const UPDATE = Joi.object({
  id: Joi.string().required().custom(validateObjectId),
  min_quantity: Joi.number().integer().required(),
  discount_percentage: Joi.number().max(100).required(),
})

const DELETE = Joi.object({
  id: Joi.string().required().custom(validateObjectId),
})

module.exports = {
  CREATE,
  UPDATE,
  DELETE,
}
