const mongoose = require('mongoose')
const { connections, CONNECTION_NAMES } = require('.')
const { Date } = require('../graphql/resolvers/root')
const { Schema } = mongoose

const BoxingLogsSchema = new Schema(
  {
    bin_id: String,
    action: String,
    order_id: mongoose.Types.ObjectId,
  },
  {
    collection: 'boxing_logs',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
)

module.exports.BoxingLogs = connections[CONNECTION_NAMES.PRODUCTION].model(
  'BoxingLogs',
  BoxingLogsSchema
)
module.exports.BoxingLogsSchema = BoxingLogsSchema
