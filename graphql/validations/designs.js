const Joi = require('@hapi/joi')

const {
  PRINTING_METHODS,
} = require('../../constants/app')
const { validateObjectId } = require('./utils/common')

const ALLOWED_PRINTING_METHODS = Object.values(PRINTING_METHODS)

const UPDATE = Joi.object({
  id: Joi.string().required().custom(validateObjectId),
  design_name: Joi.string().optional(),
  design_description: Joi.string().optional(),
  design_price: Joi.string().optional(),
  is_free: Joi.boolean().optional(),
  design_tags: Joi.array().optional().items(Joi.string().invalid('')),
  printing_methods: Joi.array().required().items(Joi.string().invalid('').valid(...ALLOWED_PRINTING_METHODS)),
})

const DELETE = Joi.object({
  id: Joi.string().required().custom(validateObjectId),
})

const UPLOAD_DESIGN = Joi.object({
  image: Joi.any().required(),
  design_name: Joi.string().optional(),
  design_description: Joi.string().optional(),
  design_price: Joi.string().optional(),
  design_tags: Joi.array().optional().items(Joi.string().invalid('')),
  is_free: Joi.boolean().optional(),
  designer_id: Joi.number().optional(),
  color: Joi.string().optional(),
  text_content: Joi.string().optional(),
  text_align: Joi.string().optional(),
  text_style: Joi.string().optional(),
  design_dimension: Joi.object().optional().keys({
    width: Joi.number().required(),
    height: Joi.number().required(),
  }),
  printing_methods: Joi.array().required().items(Joi.string().valid(...ALLOWED_PRINTING_METHODS)),
})

module.exports = {
  UPDATE, DELETE, UPLOAD_DESIGN,
}
