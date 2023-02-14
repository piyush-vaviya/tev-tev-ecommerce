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
const cookieParser = require('cookie-parser')
const express = require('express')
const app = express()

app.use(cookieParser())

/**
 * Setup helmet middleware for disabling
 * security vulnerabilities of express framework
 */
app.use(helmet({
  contentSecurityPolicy: false,
}))

const whitelist = ['https://tevtev.com', 'https://customizelab.tevtev.com', 'http://localhost:3000', 'http://localhost:8080', "http://localhost:5000"]
const corsOptionsDelegate = (req, callback) => {
  let corsOptions
  const origin = req.header('Origin')
  console.log(origin)
  const isDomainAllowed = whitelist.indexOf(origin) !== -1

  if (isDomainAllowed) {
    // Enable CORS for this request
    corsOptions = { origin: origin, credentials: true }
  } else {
    // Disable CORS for this request
    corsOptions = { origin: false }
  }
  console.log(corsOptions)
  callback(null, corsOptions)
}

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

/**
 * Sentry error logging
 */
app.use(Sentry.Handlers.errorHandler())

/**
 * Bind /graphql to ApolloServer
 * and enable CORS
 *
 */
apollo.applyMiddleware({ app, cors: corsOptionsDelegate })

module.exports.apollo = apollo
module.exports.mongo = mongo
module.exports.app = app
