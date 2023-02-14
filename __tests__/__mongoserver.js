const { MongoMemoryReplSet } = require('mongodb-memory-server')
const mongoose = require('mongoose')

const replSet = new MongoMemoryReplSet({
  replSet: { storageEngine: 'wiredTiger' },
})

module.exports.connect = async () => {
  await replSet.waitUntilRunning()
  return replSet.getUri()
}

module.exports.disconnect = async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  replSet.close()
}

/**
 * Remove all the data for all db collections.
 */
module.exports.clearDatabase = async () => {
  const collections = mongoose.connection.collections

  for (const key in collections) {
    const collection = collections[key]
    await collection.deleteMany()
  }
}
