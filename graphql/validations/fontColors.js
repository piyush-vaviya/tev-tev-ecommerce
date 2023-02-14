const Joi = require('@hapi/joi')

const INVALID_NAME_MESSAGE = 'Name is invalid. Must be letters and spaces only.'
const INVALID_HTML_COLOR_CODE = 'Must be a valid HTML color code'

const CREATE = Joi.object({
  name: Joi.string().required().regex(/^[a-zA-Z\s]+$/i).message(INVALID_NAME_MESSAGE),
  hex: Joi.string().required().length(7).regex(/^#[a-zA-Z\d]{6}$/i).message(INVALID_HTML_COLOR_CODE),
})

const UPDATE = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required().regex(/^[a-zA-Z\s]+$/i).message(INVALID_NAME_MESSAGE),
  hex: Joi.string().required().length(7).regex(/^#[a-zA-Z\d]{6}$/i).message(INVALID_HTML_COLOR_CODE),
})

const DELETE = Joi.object({
  id: Joi.string().required(),
})

module.exports = {
  CREATE, UPDATE, DELETE,
}
