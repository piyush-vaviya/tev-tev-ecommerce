const mongoose = require('mongoose')
const Schema = mongoose.Schema

const { connections, CONNECTION_NAMES } = require('./index')

const FontSchema = new Schema({
  font_name: {
    type: String,
    required: true,
  },
  file_name: {
    type: String,
    required: true,
  },
}, {
  collection: 'fonts',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})

module.exports.Font = connections[CONNECTION_NAMES.CORE].model('Font', FontSchema)
module.exports.FontSchema = FontSchema
