const express = require('express')
const router = express.Router()
const fs = require('fs')
const jose = require('node-jose')
const moment = require('moment')

const argon2 = require('../utils/argon2')
const jwt = require('../utils/jwt')
const AUTH_VALIDATIONS = require('../graphql/validations/auth')
const authErrors = require('../graphql/errors/auth')
const UserService = require('../services/users')
const AuthService = require('../services/auth')

const TOKEN_EXPIRED = 'Token is already expired.'

async function generateTokens () {
  return Promise.all([
    AuthService.createRandomToken(128),
    AuthService.createRandomToken(128),
    AuthService.createRandomToken(128),
  ])
}

function getNewExpiration () {
  /**
   * Set expiration to 1 week
   */
  return moment().add(1, 'weeks')
}

// router.get('/jwks', async (req, res) => {
//   const ks = fs.readFileSync('./keys.json')
//   const keyStore = await jose.JWK.asKeyStore(ks.toString())

//   res.send(keyStore.toJSON())
// })

router.post('/auth/token', async (req, res) => {
  const { error, value } = AUTH_VALIDATIONS.LOGIN.validate(req.body, { abortEarly: true })
  if (error) {
    return res.status(401).end()
  }

  const user = await UserService.findByEmail({ email: value.username })

  if (!user) throw authErrors.invalidCredentials()

  const isPasswordOk = await argon2.verify(user.password, value.password)
  if (!isPasswordOk) throw authErrors.invalidCredentials()

  /**
   * Set expiration to 1 week
   */
  const dateTokenExpires = getNewExpiration()

  const [accessToken, refreshToken, csrfToken] = await Promise.all([
    jwt.signWithJWT({
      user_id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
    }, {
      issuer: '.tevtev.com',
      expiresIn: dateTokenExpires.valueOf(),
    }),
    AuthService.createRandomToken(128),
    AuthService.createRandomToken(128),
  ])

  const authToken = await AuthService.saveToken({
    userId: user._id,
    accessToken: accessToken,
    accessTokenExpiresIn: dateTokenExpires.toDate(),
    refreshToken: refreshToken,
    refreshTokenExpiresIn: dateTokenExpires.toDate(),
    csrfToken: csrfToken,
  })

  return res.status(200).json({
    access_token: authToken.access_token,
    access_token_expires_in: authToken.access_token_expires_in,
    refresh_token: authToken.refresh_token,
    refresh_token_expires_in: authToken.refresh_token_expires_in,
    csrf_token: authToken.csrf_token,
  })
})

router.post('/auth/token/refresh', async (req, res) => {
  const { error, value } = AUTH_VALIDATIONS.REFRESH_TOKEN.validate(req.body, { abortEarly: true })
  if (error) {
    return res.status(401).end()
  }

  const { access_token, refresh_token } = value
  const csrfTokenHeader = req.header('X-CSRF-Protection')

  const authToken = await AuthService.findToken(access_token)

  /**
   * Check if provided tokens matches the one stored in database
   */
  if (!authToken || authToken.refresh_token !== refresh_token ||
    authToken.csrf_token !== csrfTokenHeader) {
    return res.status(401).end()
  }

  /**
   * Check expiration of refresh_token
   */
  const refreshTokenExpiresIn = moment(authToken.refresh_token_expires_in)
  if (refreshTokenExpiresIn.isBefore(moment())) {
    return res.status(401).json({
      code: 'token_expired',
      error: TOKEN_EXPIRED,
    })
  }

  /**
   * Set expiration to 1 week
   */
  const dateTokenExpires = getNewExpiration()

  await authToken.populate('user').execPopulate()
  const [accessToken, refreshToken, csrfToken] = await Promise.all([
    jwt.signWithJWT({
      payload: {
        user_id: authToken.user._id,
        first_name: authToken.user.first_name,
        last_name: authToken.user.last_name,
        issuer: '.tevtev.com',
        exp: dateTokenExpires.valueOf(),
      },
    }),
    AuthService.createRandomToken(128),
    AuthService.createRandomToken(128),
  ])

  authToken.set({
    access_token: accessToken,
    refresh_token: refreshToken,
    csrf_token: csrfToken,
    access_token_expires_in: dateTokenExpires,
    refresh_token_expires_in: dateTokenExpires,
  })
  await authToken.save()

  return res.status(200).json({
    access_token: authToken.access_token,
    access_token_expires_in: authToken.access_token_expires_in,
    refresh_token: authToken.refresh_token,
    refresh_token_expires_in: authToken.refresh_token_expires_in,
    csrf_token: authToken.csrf_token,
  })
})

router.post('/auth/userinfo', async (req, res) => {
  const { error, value } = AUTH_VALIDATIONS.USER_INFO.validate(req.body, { abortEarly: true })
  if (error) {
    return res.status(401).end()
  }

  const { access_token } = value
  const csrfTokenHeader = req.header('X-CSRF-Protection')

  /**
   * Decode token first to minimize backpressure
   */
  try {
    const decodedToken = await jwt.verifyToken(access_token, {
      issuer: '.tevtev.com',
    })
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        code: 'token_expired',
        error: TOKEN_EXPIRED,
      })
    } else {
      return res.status(401).end()
    }
  }

  const authToken = await AuthService.findToken(access_token)

  /**
   * Check if provided tokens matches the one stored in database
   */
  if (!authToken ||
    authToken.csrf_token !== csrfTokenHeader) {
    return res.status(401).end()
  }

  /**
   * Check if token is expired
   */
  const accessTokenExpiresIn = moment(authToken.access_token_expires_in)
  if (accessTokenExpiresIn.isBefore(moment())) {
    return res.status(401).json({
      code: 'token_expired',
      error: TOKEN_EXPIRED,
    })
  }

  await authToken.populate('user').execPopulate()

  return res.status(200).json({
    user: authToken.user.toJSON(),
  })
})

module.exports = router
