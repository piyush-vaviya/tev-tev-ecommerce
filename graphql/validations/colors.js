const Joi = require('@hapi/joi')

const { validateObjectId } = require('./utils/common')
const COLOR_CONSTANTS = require('../../constants/color')

const INVALID_NAME_MESSAGE = 'Name is invalid. Must be letters and spaces only.'
const INVALID_HTML_COLOR_CODE = 'Must be a valid HTML color code'

const CREATE = Joi.object({
  name: Joi.string().required().regex(COLOR_CONSTANTS.COLOR_NAME_REGEX).message(INVALID_NAME_MESSAGE),
  hex: Joi.string().required().length(7).regex(COLOR_CONSTANTS.COLOR_HEX_REGEX).message(INVALID_HTML_COLOR_CODE),
  image: Joi.any().optional(),
})

const UPDATE = Joi.object({
  id: Joi.string().required().custom(validateObjectId),
  name: Joi.string().required().regex(COLOR_CONSTANTS.COLOR_NAME_REGEX).message(INVALID_NAME_MESSAGE),
  hex: Joi.string().required().length(7).regex(COLOR_CONSTANTS.COLOR_HEX_REGEX).message(INVALID_HTML_COLOR_CODE),
  image: Joi.any().optional(),
})

const DELETE = Joi.object({
  id: Joi.string().required().custom(validateObjectId),
})

module.exports = {
  CREATE, UPDATE, DELETE,
}
