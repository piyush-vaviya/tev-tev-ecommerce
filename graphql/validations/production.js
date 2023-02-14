const Joi = require('@hapi/joi')
const { validateObjectId } = require('./utils/common')

const APP_CONSTANTS = require('../../constants/app')

const ALLOWED_STATUS = [
  APP_CONSTANTS.STATUS.NO_STOCK,
  APP_CONSTANTS.STATUS.IN_STOCK,
  APP_CONSTANTS.STATUS.PRE_TREATED,
  APP_CONSTANTS.STATUS.PRINTED,
  APP_CONSTANTS.STATUS.QA_PASSED,
  APP_CONSTANTS.STATUS.SHIPPED,
]

const CREATE_PRODUCTIONS_FOR_ORDER = Joi.object({
  order_id: Joi.string().required().custom(validateObjectId),
})

const UPDATE_PRODUCTION_STATUS = Joi.object({
  production_ref_no: Joi.string().required(),
  status: Joi.string().required().allow(...ALLOWED_STATUS),
})

module.exports = {
  CREATE_PRODUCTIONS_FOR_ORDER,
  UPDATE_PRODUCTION_STATUS,
}
