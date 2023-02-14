const Joi = require('@hapi/joi')

module.exports.REGISTER = Joi.object({
  id: Joi.string().required(),
  first_name: Joi.string().required().max(50),
  last_name: Joi.string().required().max(50),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(8, 'utf8').max(64, 'utf8'),
})

module.exports.CHANGE_PASSWORD = Joi.object({
  reset_token: Joi.string().required(),
  password: Joi.string().required().min(8, 'utf8').max(64, 'utf8'),
  confirm_password: Joi.string().required().min(8, 'utf8').max(64, 'utf8'),
})
