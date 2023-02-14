const { fieldValidationError } = require('../errors/common')

module.exports.inputValidator = (input, joiSchema) => {
  const { value, error } = joiSchema.validate(input, { abortEarly: true })

  if (error) throw fieldValidationError(error.details[0].context.key, error.message)

  return value
}
