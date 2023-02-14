const dotenv = require('dotenv')
dotenv.config()

const { ApolloServer } = require('apollo-server-express')
const Sentry = require('@sentry/node')
const { SENTRY_DSN, APP_ENV } = process.env

if (!SENTRY_DSN) throw new Error('Sentry DSN not specified in .env file')

Sentry.init({
  dsn: SENTRY_DSN,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,

  attachStacktrace: true,
  environment: APP_ENV,
})

const { requestDidStart } = require('../utils/apolloServer')
const { typeDefs, resolvers } = require('./apollo')
const authMiddleware = require('../middlewares/auth')
const apollo = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
  plugins: [
    {
      requestDidStart,
    },
  ],
})

const mongo = require('../mongo')

const helmet = require('helmet')
const express = require('express')
const app = express()

/**
 * Setup helmet middleware for disabling
 * security vulnerabilities of express framework
 */
app.use(helmet({
  contentSecurityPolicy: false,
}))

/**
 * Sentry logging for requests
 */
app.use(Sentry.Handlers.requestHandler())

app.use(express.json({
  limit: '1mb',
}))

app.use(express.urlencoded({
  extended: true,
  limit: '5mb',
}))

app.use('/shipping', require('../api-rest-shipping/shipping'))

/**
 * Sentry error logging
 */
app.use(Sentry.Handlers.errorHandler())

apollo.applyMiddleware({ app })

module.exports.apollo = apollo
module.exports.mongo = mongo
module.exports.app = app
