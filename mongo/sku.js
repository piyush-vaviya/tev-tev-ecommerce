const mongoose = require('mongoose')
const Schema = mongoose.Schema

const { connections, CONNECTION_NAMES } = require('./index')

const SkuSchema = new Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    item: {
      type: Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    color: {
      type: mongoose.Types.ObjectId,
      ref: 'Color',
    },
    size: {
      type: String,
      required: true,
    },
  },
  {
    collection: 'skus',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
)

module.exports.Sku = connections[CONNECTION_NAMES.CORE].model('Sku', SkuSchema)
module.exports.SkuSchema = SkuSchema
