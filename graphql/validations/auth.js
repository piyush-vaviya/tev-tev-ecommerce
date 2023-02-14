const common = require('./utils/common')

let Joi = require('@hapi/joi')
Joi = Joi.extend(common.customJoiSanitizeHtml)

const {
  INVALID_PASSWORD,
  PASSWORD_NOT_MATCH,
} = require('../../constants/errorMessages')
const { validateObjectId } = require('./utils/common')

const AUTH_CONSTANTS = require('../../constants/auth')

const LOGIN = Joi.object({
  username: Joi.string().required().min(4, 'utf8').max(128, 'utf8'),
  password: Joi.string().required().min(8, 'utf8').max(128, 'utf8'),
})

const REFRESH_TOKEN = Joi.object({
  access_token: Joi.string().required(),
  refresh_token: Joi.string().required(),
})

const USER_INFO = Joi.object({
  access_token: Joi.string().required(),
})

const ME_INPUT_VALIDATION = Joi.object({
  first_name: Joi.string().sanitizeHtml({ allowedTags: [] }).optional().allow(null, ''),
  last_name: Joi.string().sanitizeHtml({ allowedTags: [] }).optional().allow(null, ''),
  gender: Joi.string().sanitizeHtml({ allowedTags: [] }).optional().allow(null, ''),
  date_of_birth: Joi.date().optional().allow(null),
  shipping_info: Joi.object().optional().allow(null).keys({
    first_name: Joi.string().sanitizeHtml({ allowedTags: [] }).required(),
    last_name: Joi.string().sanitizeHtml({ allowedTags: [] }).required(),
    street: Joi.string().sanitizeHtml({ allowedTags: [] }).required(),
    city: Joi.string().sanitizeHtml({ allowedTags: [] }).required(),
    state: Joi.string().sanitizeHtml({ allowedTags: [] }).required(),
    zipcode: Joi.string().sanitizeHtml({ allowedTags: [] }).required(),
  }),
  billing_info: Joi.object().optional().allow(null).keys({
    first_name: Joi.string().sanitizeHtml({ allowedTags: [] }).required(),
    last_name: Joi.string().sanitizeHtml({ allowedTags: [] }).required(),
    street: Joi.string().sanitizeHtml({ allowedTags: [] }).required(),
    city: Joi.string().sanitizeHtml({ allowedTags: [] }).required(),
    state: Joi.string().sanitizeHtml({ allowedTags: [] }).required(),
    zipcode: Joi.string().sanitizeHtml({ allowedTags: [] }).required(),
  }),
})

const REGISTER_VALIDATION = Joi.object({
  id: Joi.string().required().custom(validateObjectId),
  first_name: Joi.string().sanitizeHtml({ allowedTags: [] }).required().max(50),
  last_name: Joi.string().sanitizeHtml({ allowedTags: [] }).required().max(50),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(8, 'utf8').max(128, 'utf8')
    .pattern(AUTH_CONSTANTS.PASSWORD_REGEX)
    .messages({
      'string.pattern.base': INVALID_PASSWORD,
    }),
})

const CHANGE_PASSWORD_VALIDATION = Joi.object({
  password: Joi.string().required().min(8, 'utf8').max(128, 'utf8')
    .pattern(AUTH_CONSTANTS.PASSWORD_REGEX)
    .messages({
      'string.pattern.base': INVALID_PASSWORD,
    }),
  confirm_password: Joi.string().required().min(8, 'utf8').max(128, 'utf8').valid(Joi.ref('password')).messages({
    'any.valid': PASSWORD_NOT_MATCH,
  }),
})

const CHECK_RESET_TOKEN = Joi.object({
  reset_token: Joi.string().required(),
})

const VERIFY_REGISTRATION = Joi.object({
  verification_token: Joi.string().required(),
})

const RESET_PASSWORD = Joi.object({
  reset_token: Joi.string().required(),
  password: Joi.string().required().min(8, 'utf8').max(128, 'utf8')
    .pattern(AUTH_CONSTANTS.PASSWORD_REGEX)
    .messages({
      'string.pattern.base': INVALID_PASSWORD,
    }),
  confirm_password: Joi.string().required().min(8, 'utf8').max(128, 'utf8').valid(Joi.ref('password')).messages({
    'any.valid': PASSWORD_NOT_MATCH,
  }),
})

const RESEND_VERIFICATION = Joi.object({
  verification_token: Joi.string().required(),
})

module.exports = {
  ME_INPUT_VALIDATION,
  REGISTER_VALIDATION,
  CHANGE_PASSWORD_VALIDATION,
  CHECK_RESET_TOKEN,
  VERIFY_REGISTRATION,
  LOGIN,
  USER_INFO,
  REFRESH_TOKEN,
  RESET_PASSWORD,
  RESEND_VERIFICATION,
}
