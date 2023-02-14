const crypto = require('crypto')
const util = require('util')
const randomBytes = util.promisify(crypto.randomBytes)
const { AuthToken } = require('../mongo/auth')

module.exports.saveToken = async ({
  userId, accessToken, refreshToken, csrfToken,
  accessTokenExpiresIn, refreshTokenExpiresIn,
}) => {
  return AuthToken.create({
    access_token: accessToken,
    access_token_expires_in: accessTokenExpiresIn,
    refresh_token: refreshToken,
    refresh_token_expires_in: refreshTokenExpiresIn,
    csrf_token: csrfToken,
    user: userId,
  })
}

module.exports.updateToken = async (oldAccessToken, {
  accessToken, refreshToken, csrfToken,
  accessTokenExpiresIn, refreshTokenExpiresIn,
}) => {
  return AuthToken.updateOne({
    access_token: oldAccessToken,
  }, {
    access_token: accessToken,
    refresh_token: refreshToken,
    csrf_token: csrfToken,
    access_token_expires_in: accessTokenExpiresIn,
    refresh_token_expires_in: refreshTokenExpiresIn,
  }, {
    new: true,
  })
}

module.exports.findToken = async (token) => {
  return AuthToken.findOne({ access_token: token })
}

module.exports.createRandomToken = async (length = 128) => {
  const buffer = await randomBytes(length)

  return buffer.toString('base64')
}
