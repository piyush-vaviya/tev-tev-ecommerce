const mongoose = require('mongoose')
const { connections, CONNECTION_NAMES } = require('./index')
const { Schema } = mongoose

const BoxingSchema = new Schema(
  {
    bin_id: {
      type: Number,
      require: true,
    },
    status: {
      type: String,
      default: 'empty',
    },
    items: [mongoose.Types.ObjectId],
    order_id: mongoose.Types.ObjectId,
  },
  {
    collection: 'boxing',
    timeStamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
)

module.exports.Boxing = connections[CONNECTION_NAMES.PRODUCTION].model(
  'Boxing',
  BoxingSchema
)

module.exports.BoxingSchema = BoxingSchema
