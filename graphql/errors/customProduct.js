const { ApolloError, UserInputError, ForbiddenError, AuthenticationError } = require('apollo-server-express')

module.exports.draftNotFound = () => {
  return new UserInputError('Draft is not found')
}

module.exports.itemConfigForSideNotFound = ({ itemId, side }) => {
  return new UserInputError(`Item config for item ${itemId} at ${side} side not found`)
}

module.exports.itemImageForSideAndColorNotFound = ({ itemId, side, color }) => {
  return new UserInputError(`Item image for item ${itemId} at ${side} side with ${color} color not found`)
}
