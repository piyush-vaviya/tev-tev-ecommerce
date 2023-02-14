const { ApolloError, UserInputError, ForbiddenError, AuthenticationError } = require('apollo-server-express')
const DESIGN_CONSTANTS = require('../../constants/designs')

module.exports.designImageDimensionsNotSupported = () => {
  return new UserInputError(`Design image should not exceed ${DESIGN_CONSTANTS.DESIGN_IMAGE_MAX_WIDTH} pixels width x ${DESIGN_CONSTANTS.DESIGN_IMAGE_MAX_HEIGHT} pixels height.`)
}

module.exports.designImageMimeTypeNotSupported = () => {
  return new UserInputError(`Design image should be one of the following mime types ${DESIGN_CONSTANTS.DESIGN_IMAGE_ALLOWED_MIMETYPES.join(', ')}.`)
}
