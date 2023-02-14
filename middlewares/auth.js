const jwt = require('../utils/jwt')
const APP_CONSTANTS = require('../constants/app')
const authErrors = require('../graphql/errors/auth')

module.exports = async ({ req, res }) => {
  const context = {
    req,
    res,
    jwt: null,
  }

  if (!req.headers.authorization) {
    return context
  }

  const [bearer, token] = req.headers.authorization.split(' ')

  if (bearer !== 'Bearer' || !token) {
    return context
  }

  /**
   * Verify if the provided token passes security layer
   *
   */
  const base64DecodedToken = Buffer.from(token, 'base64').toString('ascii')

  let decoded
  try {
    decoded = await jwt.verifyToken(base64DecodedToken)
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw authErrors.sessionExpired()
    }

    if (err.name === 'JsonWebTokenError') {
      throw authErrors.actionNotAllowed()
    }

    throw err
  }

  if (decoded.iss !== APP_CONSTANTS.AUTH.JWT.ISS) {
    throw authErrors.actionNotAllowed()
  }

  context.jwt = decoded

  return context
}
