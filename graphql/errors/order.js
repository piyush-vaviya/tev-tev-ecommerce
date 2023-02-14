const { ApolloError, UserInputError, ForbiddenError, AuthenticationError } = require('apollo-server-express')
const { ORDER_NOT_CANCELABLE } = require('../../constants/errorMessages')

module.exports.notCancellable = () => {
  return new UserInputError(ORDER_NOT_CANCELABLE)
}

module.exports.duplicateItemImage = () => {
  return new UserInputError('Duplicate image for this side and color.')
}

module.exports.itemConfigNotFound = () => {
  return new UserInputError('Config for this side not found.')
}