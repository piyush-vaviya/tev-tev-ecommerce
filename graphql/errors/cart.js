const { ApolloError, UserInputError, ForbiddenError, AuthenticationError } = require('apollo-server-express')
const { VALIDATION_ERR_MSG, INVALID_USER, CART_NOT_FOUND, INVALID_TOKEN } = require('../../constants/errorMessages')

module.exports.cartNotFound = () => {
  return new UserInputError(CART_NOT_FOUND)
}

module.exports.invalidQuantity = () => {
  return new UserInputError('Quantity must be at least 1 and not more than 100')
}
