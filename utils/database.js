const mongoose = require('mongoose')

const objectIdMap = (ids = []) => ids.map(id => mongoose.Types.ObjectId(id))
const toMongoObjectId = (id) => mongoose.Types.ObjectId(id)

module.exports = {
  objectIdMap,
  toMongoObjectId,
}
