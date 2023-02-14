const mongoose = require('mongoose')
const Joi = require('@hapi/joi')
const sanitizeHtml = require('sanitize-html')

module.exports.validateObjectId = (value, helpers) => {
  if (!mongoose.isValidObjectId(value)) {
    return helpers.error('any.invalid')
  }

  return value
}

module.exports.customJoiSanitizeHtml = (joi) => {
  return {
    type: 'string',
    base: joi.string(),
    rules: {
      sanitizeHtml: {
        validate: function (value, helpers, args, options) {
          if (args) {
            return sanitizeHtml(value, args)
          }

          return sanitizeHtml(value)
        },
      },
    },
  }
}
