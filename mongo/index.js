const mongoose = require('mongoose')
mongoose.Promise = Promise

module.exports.CONNECTION_NAMES = {
  CORE: 'core',
  PRODUCTION: 'production',
}

module.exports.connections = {}

module.exports.connect = async (
  name,
  { host, dbName, username, password, opts = {} }
) => {
  if (!Object.values(this.CONNECTION_NAMES).includes(name)) {
    throw Error(
      'The specified connection name is not defined in mongo/index.js'
    )
  }

  if (process.env.APP_DEBUG) {
    mongoose.set('debug', true)
  }

  if (mongoose.connection.readyState) {
    return
  }

  const newOpts = { ...opts }

  if (dbName) {
    newOpts['dbName'] = dbName
  }

  if (username) {
    newOpts['auth'] = {
      user: username,
      password: password,
    }
  }

  this.connections[name] = await mongoose.createConnection(host, newOpts)
  // return mongoose.connect(host, newOpts)

  return this.connections[name]
}
