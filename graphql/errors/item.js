const { ApolloError, UserInputError, ForbiddenError, AuthenticationError } = require('apollo-server-express')
const { VALIDATION_ERR_MSG } = require('../../constants/errorMessages')
const ITEM_CONSTANTS = require('../../constants/items')

module.exports.itemImageNotFound = () => {
  return new UserInputError('Image for this side and color not found.')
}

module.exports.duplicateItemImage = () => {
  return new UserInputError('Duplicate image for this side and color.')
}

module.exports.itemConfigNotFound = () => {
  return new UserInputError('Config for this side not found.')
}

module.exports.itemCannotBeCompleted = () => {
  return new UserInputError('Item cannot be published. Check if all required fields are provided.')
}

module.exports.duplicateSkuPrefix = () => {
  return new UserInputError('SKU prefix is already in use.')
}

module.exports.itemImageMaxFileSizeExceeded = () => {
  return new UserInputError(`Maximum file size of ${ITEM_CONSTANTS.ITEM_IMAGE_MAX_FILESIZE_BYTES} byte/s exceeded by item image.`)
}

module.exports.itemImageDimensionsNotSupported = () => {
  return new UserInputError(`Item image should be ${ITEM_CONSTANTS.ITEM_IMAGE_WIDTH} pixels width x ${ITEM_CONSTANTS.ITEM_IMAGE_HEIGHT} pixels height.`)
}

module.exports.itemImageMimeTypeNotSupported = () => {
  return new UserInputError(`Item image should be one of the following mime types ${ITEM_CONSTANTS.ITEM_IMAGE_ALLOWED_MIMETYPES.join(', ')}.`)
}

module.exports.itemSizingImageMimeTypeNotSupported = () => {
  return new UserInputError(`Item size image should be one of the following mime types ${ITEM_CONSTANTS.ITEM_SIZING_IMAGE_ALLOWED_MIMETYPES.join(', ')}.`)
}

module.exports.itemSizingImageMaxFileSizeExceeded = () => {
  return new UserInputError(`Maximum file size of ${ITEM_CONSTANTS.ITEM_SIZING_IMAGE_MAX_FILESIZE_BYTES} byte/s exceeded by item size image.`)
}

module.exports.itemSizingImageDimensionsNotSupported = () => {
  return new UserInputError(`Item size image should be ${ITEM_CONSTANTS.ITEM_SIZING_IMAGE_WIDTH} pixels width x ${ITEM_CONSTANTS.ITEM_SIZING_IMAGE_HEIGHT} pixels height.`)
}
