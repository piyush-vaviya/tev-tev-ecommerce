const mongoose = require('mongoose')
const Schema = mongoose.Schema

const { connections, CONNECTION_NAMES } = require('./index')

const ColorSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  hex: {
    type: String,
    required: true,
  },
  image_url: String,
  s3_keyname: String,
}, {
  collection: 'colors',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})

module.exports.Color = connections[CONNECTION_NAMES.CORE].model('Color', ColorSchema)
module.exports.ColorSchema = ColorSchema
