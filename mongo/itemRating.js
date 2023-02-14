const mongoose = require('mongoose')
const Schema = mongoose.Schema

const { connections, CONNECTION_NAMES } = require('./index')

const ItemRatingSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  item: {
    type: Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  image_urls: [String],
  remarks: String,
  score: Number,
}, {
  collection: 'item_ratings',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})

module.exports.ItemRating = connections[CONNECTION_NAMES.CORE].model('ItemRating', ItemRatingSchema)
module.exports.ItemRatingSchema = ItemRatingSchema
