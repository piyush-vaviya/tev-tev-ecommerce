const { ApolloError, UserInputError, ForbiddenError, AuthenticationError } = require('apollo-server-express')
const { VALIDATION_ERR_MSG } = require('../../constants/errorMessages')
const COLOR_CONSTANTS = require('../../constants/color')

module.exports.colorImageMaxFileSizeExceeded = () => {
  return new UserInputError(`Maximum file size of ${COLOR_CONSTANTS.ITEM_IMAGE_MAX_FILESIZE_BYTES} byte/s exceeded by color image.`)
}

module.exports.colorImageMimeTypeNotSupported = () => {
  return new UserInputError(`Color image should be one of the following mime types ${COLOR_CONSTANTS.ITEM_IMAGE_ALLOWED_MIMETYPES.join(', ')}.`)
}

module.exports.nameAlreadyDefined = (name) => {
  return new UserInputError(`${name} is already defined`)
}
