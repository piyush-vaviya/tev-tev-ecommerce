const pino = require('pino')

const logger = pino({
  level: process.env.APP_LOG || 'info',
})

module.exports = logger
