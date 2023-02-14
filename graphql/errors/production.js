const {
  ApolloError,
  UserInputError,
  ForbiddenError,
  AuthenticationError,
} = require('apollo-server-express')
const {
  VALIDATION_ERR_MSG,
  INVALID_USER,
  CART_NOT_FOUND,
  INVALID_TOKEN,
} = require('../../constants/errorMessages')

module.exports.nothingToPickup = () => {
  return new UserInputError('There are no order to pickup.')
}

module.exports.skuNotFound = () => {
  return new UserInputError('SKU not found.')
}

module.exports.productionIdNotFound = () => {
  return new UserInputError('Production ID not found.')
}

module.exports.noBatchAssigned = () => {
  return new UserInputError('No batch is assigned to this user.')
}

module.exports.statusNotAllowed = () => {
  return new ApolloError(
    'This status is not allowed.',
    'INVALID_PRODUCTION_STATUS'
  )
}

module.exports.productionRefNoNotFound = () => {
  return new ApolloError(
    'Production reference number not found.',
    'INVALID_PRODUCTION_REF_NO'
  )
}

module.exports.orderNotFound = () => {
  return new ApolloError('Order not found.', 'ORDER_NOT_FOUND')
}

module.exports.itemIsAlreadyInBin = () => {
  return new ApolloError(
    'This item is already in to the bin.',
    'ITEM_IS_ALREADY_IN_BIN'
  )
}

module.exports.boxingIsFull = () => {
  return new ApolloError('The boxing is full.', 'BOXING_IS_FULL')
}
