const mongoose = require('mongoose')
const Schema = mongoose.Schema

const { connections, CONNECTION_NAMES } = require('./index')

const FontColorSchema = new Schema({
  font_name: {
    type: String,
    required: true,
    unique: true,
  },
  hex: {
    type: String,
    required: true,
  },
}, {
  collection: 'font_colors',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})

module.exports = (mongooseConnection) => {
  return {
    FontColor: mongooseConnection.model('FontColor', FontColorSchema),
    FontColorSchema,
  }
}

module.exports.FontColor = connections[CONNECTION_NAMES.CORE].model('FontColor', FontColorSchema)
module.exports.FontColorSchema = FontColorSchema
