const { ApolloError, UserInputError, ForbiddenError, AuthenticationError } = require('apollo-server-express')

module.exports.invalidCredentials = () => {
  return new AuthenticationError('You have entered a wrong username or password.')
}

module.exports.sessionExpired = () => {
  return new ApolloError('Your session has expired.', 'SESSION_EXPIRED')
}

module.exports.passwordNotMatch = () => {
  return new UserInputError('Password does not match.')
}

module.exports.actionNotAllowed = () => {
  return new ForbiddenError('Action is not allowed.')
}

module.exports.userAlreadyVerified = () => {
  return new ApolloError('User is already verified.', 'USER_ALREADY_VERIFIED')
}
