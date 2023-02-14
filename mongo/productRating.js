const mongoose = require('mongoose')
const Schema = mongoose.Schema

const APP_CONSTANTS = require('../constants/app')

const { connections, CONNECTION_NAMES } = require('./index')

const ProductRatingSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  image_urls: [String],
  remarks: String,
  score: Number,
  status: {
    type: String,
    default: APP_CONSTANTS.STATUS.FOR_APPROVAL,
  },
}, {
  collection: 'product_ratings',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})

module.exports.ProductRating = connections[CONNECTION_NAMES.CORE].model('ProductRating', ProductRatingSchema)
module.exports.ProductRatingSchema = ProductRatingSchema
