const Joi = require('@hapi/joi')

const {
  STATUS,
  PRINTING_METHODS,
} = require('../../constants/app')
const ITEM_CONSTANTS = require('../../constants/items')
const { validateObjectId } = require('./utils/common')

const ALLOWED_STATUS = [
  STATUS.PENDING, STATUS.COMPLETED,
]

const ALLOWED_PRINTING_METHODS = Object.values(PRINTING_METHODS)

const SKU_REGEX = /^[A-Z0-9]+$/

const XY = Joi.object().required().keys({
  x: Joi.number().required(),
  y: Joi.number().required(),
})

const ITEM_CONFIG_JOI = Joi.object().required().keys({
  side: Joi.string().required(),
  top: XY,
  left: XY,
  ratio: Joi.string().required(),
})

const MOCK_UP_ITEM_CONFIG_JOI = Joi.object().required().keys({
  index: Joi.number().integer().min(0).required(),
  top: XY,
  left: XY,
  ratio: Joi.string().required(),
})

const QUERY_ONE = Joi.object({
  id: Joi.string().required().custom(validateObjectId),
})

const QUERY_ALL = Joi.object({
  filter: Joi.object().optional().allow(null).keys({
    categories: Joi.array().optional().allow(null).items(Joi.string().optional().invalid('')),
    sizes: Joi.array().optional().allow(null).items(Joi.string().optional().invalid('').valid(...ITEM_CONSTANTS.SIZES)),
    colors: Joi.array().optional().allow(null).items(Joi.string().optional().invalid('').custom(validateObjectId)),
    price: Joi.object().optional().allow(null).keys({
      min: Joi.number().required(),
      max: Joi.number().required(),
    }),
    item_status: Joi.array().optional().allow(null).items(Joi.string().optional().allow('').invalid('').valid(...ALLOWED_STATUS)),
  }),
})

const CREATE = Joi.object({
  item_name: Joi.string().required(),
  item_description: Joi.string().optional(),
  item_status: Joi.string().optional().valid(...ALLOWED_STATUS),
  item_regular_price: Joi.string().required(),
  item_special_price: Joi.string().optional(),
  item_vendor: Joi.string().optional(),
  item_country: Joi.string().optional(),
  item_material: Joi.string().optional(),
  item_colors: Joi.array().required().items(Joi.string().invalid('').custom(validateObjectId)),
  item_sizes: Joi.array().required().items(Joi.string().invalid('').valid(...ITEM_CONSTANTS.SIZES)),
  item_sides: Joi.array().required().items(Joi.string().invalid('').valid(...ITEM_CONSTANTS.SIDES)),
  item_categories: Joi.array().optional().items(Joi.string().invalid('')),
  sizing: Joi.object().optional().allow(null),
  care_instructions: Joi.string().optional(),
  sku_prefix: Joi.string().required().pattern(SKU_REGEX).messages({
    'string.pattern.base': 'Only uppercase letters and numbers are allowed',
  }),
  featured_color: Joi.string().required().custom(validateObjectId),
  printing_methods: Joi.array().optional().items(Joi.string().invalid('').valid(...ALLOWED_PRINTING_METHODS)),
  sizing_image: Joi.any().optional(),
  item_config: Joi.array().optional().items(ITEM_CONFIG_JOI),
  mock_up_item_config: Joi.array().optional().items(MOCK_UP_ITEM_CONFIG_JOI),
  mock_up_indexes: Joi.array().optional().items(Joi.number()),
})

const UPDATE = Joi.object({
  id: Joi.string().required().custom(validateObjectId),
  item_name: Joi.string().optional(),
  item_description: Joi.string().optional(),
  item_status: Joi.string().optional().valid(...ALLOWED_STATUS),
  item_regular_price: Joi.string().optional(),
  item_special_price: Joi.string().optional(),
  item_vendor: Joi.string().optional(),
  item_country: Joi.string().optional(),
  item_material: Joi.string().optional(),
  item_colors: Joi.array().optional().items(Joi.string().invalid('').custom(validateObjectId)),
  item_sizes: Joi.array().optional().items(Joi.string().invalid('').valid(...ITEM_CONSTANTS.SIZES)),
  item_sides: Joi.array().optional().items(Joi.string().invalid('').valid(...ITEM_CONSTANTS.SIDES)),
  item_categories: Joi.array().optional().items(Joi.string().invalid('')),
  sizing: Joi.object().optional().allow(null),
  care_instructions: Joi.string().optional(),
  featured_color: Joi.string().optional().custom(validateObjectId),
  printing_methods: Joi.array().optional().items(Joi.string().invalid('').valid(...ALLOWED_PRINTING_METHODS)),
  sizing_image: Joi.any().optional(),
  item_config: Joi.array().optional().items(ITEM_CONFIG_JOI),
  mock_up_item_config: Joi.array().optional().items(MOCK_UP_ITEM_CONFIG_JOI),
  mock_up_indexes: Joi.array().optional().items(Joi.number()),
})

const DELETE = Joi.object({
  id: Joi.string().required().custom(validateObjectId),
})

const UPDATE_ITEM_CONFIG = Joi.object({
  item_id: Joi.string().required().custom(validateObjectId),
  item_config: Joi.array().required().items(ITEM_CONFIG_JOI),
})

const DELETE_ITEM_CONFIG = Joi.object({
  item_id: Joi.string().required().custom(validateObjectId),
  side: Joi.string().required(),
})

const UPLOAD_ITEM_IMAGE = Joi.object({
  item_id: Joi.string().required().custom(validateObjectId),
  color: Joi.string().required().custom(validateObjectId),
  side: Joi.string().required().valid(...ITEM_CONSTANTS.SIDES),
  image: Joi.any().required(),
})

const DELETE_ITEM_IMAGE = Joi.object({
  item_id: Joi.string().required().custom(validateObjectId),
  color: Joi.string().required().custom(validateObjectId),
  side: Joi.string().required().valid(...ITEM_CONSTANTS.SIDES),
})

const UPDATE_ITEM_STATUS = Joi.object({
  id: Joi.string().required().custom(validateObjectId),
  item_status: Joi.string().required().valid(STATUS.PENDING, STATUS.COMPLETED),
})

const UPLOAD_SIZING_IMAGE = Joi.object({
  item_id: Joi.string().required().custom(validateObjectId),
  image: Joi.any().required(),
})

const PUBLISH_ITEM = Joi.object({
  item_id: Joi.string().required().custom(validateObjectId),
})

const UNPUBLISH_ITEM = Joi.object({
  item_id: Joi.string().required().custom(validateObjectId),
})

const UPLOAD_MOCK_UP_IMAGE = Joi.object({
  item_id: Joi.string().required().custom(validateObjectId),
  color: Joi.string().required().custom(validateObjectId),
  index: Joi.number().integer().required(),
  image: Joi.any().required(),
})

const DELETE_MOCK_UP_IMAGE = Joi.object({
  item_id: Joi.string().required().custom(validateObjectId),
  color: Joi.string().required().custom(validateObjectId),
  index: Joi.number().integer().required(),
})

module.exports = {
  QUERY_ONE,
  QUERY_ALL,
  CREATE,
  UPDATE,
  DELETE,
  UPDATE_ITEM_CONFIG,
  DELETE_ITEM_CONFIG,
  UPLOAD_ITEM_IMAGE,
  DELETE_ITEM_IMAGE,
  UPDATE_ITEM_STATUS,
  UPLOAD_SIZING_IMAGE,
  PUBLISH_ITEM,
  UNPUBLISH_ITEM,
  UPLOAD_MOCK_UP_IMAGE,
  DELETE_MOCK_UP_IMAGE,
}
