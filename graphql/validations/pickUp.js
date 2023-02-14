const Joi = require('@hapi/joi')
const {
  STATUS,
  PRINTING_METHODS,
} = require('../../constants/app')
const PICK_UP_CONSTANTS = require('../../constants/pickUp')
const { validateObjectId } = require('./utils/common')

const ALLOWED_BATCH_TYPES = Object.values(PICK_UP_CONSTANTS.BATCH_TYPES)

const ASSIGN_BATCH = Joi.object({
  batch_type: Joi.string().required().allow(...ALLOWED_BATCH_TYPES),
  batch_size: Joi.number().required(),
  printing_method: Joi.string().required().allow(...Object.values(PRINTING_METHODS)),
  user_id: Joi.string().required().custom(validateObjectId),
})

const UPDATE_BARCODE_STATUS = Joi.object({
  pickup_batch_id: Joi.string().required().custom(validateObjectId),
  sku: Joi.string().required(),
  production_id: Joi.string().required().custom(validateObjectId),
  status: Joi.string().required().valid(STATUS.ASSIGNED, STATUS.BARCODED),
})

const END_BATCH = Joi.object({
  pickup_batch_id: Joi.string().required().custom(validateObjectId),
})

module.exports = {
  UPDATE_BARCODE_STATUS,
  END_BATCH,
  ASSIGN_BATCH,
}
