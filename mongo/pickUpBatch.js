const mongoose = require('mongoose')
const { Schema } = mongoose

const APP_CONSTANTS = require('../constants/app')

const { connections, CONNECTION_NAMES } = require('./index')

const PickUpBatchSchema = new Schema({
  user: {
    type: mongoose.Types.ObjectId,
  },
  status: {
    type: String,
    default: APP_CONSTANTS.STATUS.PENDING,
    enum: [APP_CONSTANTS.STATUS.PENDING, APP_CONSTANTS.STATUS.COMPLETED],
  },
  printing_method: String,
  items: [{
    sku: String,
    total_quantity: Number,
    pickup_image_url: String,
    pickup_image_s3_keyname: String,
    ids: [{
      production_id: {
        type: mongoose.Types.ObjectId,
      },
      production_ref_no: String,
      status: {
        type: String,
        default: APP_CONSTANTS.STATUS.ASSIGNED,
        enum: [APP_CONSTANTS.STATUS.ASSIGNED, APP_CONSTANTS.STATUS.BARCODED],
      },
    }],
  }],
}, {
  collection: 'pickup_batches',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})

module.exports.PickUpBatch = connections[CONNECTION_NAMES.PRODUCTION].model('PickUpBatch', PickUpBatchSchema)
module.exports.PickUpBatchSchema = PickUpBatchSchema
