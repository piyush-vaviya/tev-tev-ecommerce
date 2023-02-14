const mongoose = require('mongoose')
const Schema = mongoose.Schema

const LayerSchema = new Schema({
  type: {
    type: String,
  },
  design: {
    type: Schema.Types.ObjectId,
    ref: 'Design',
  },
  text: String,
  orig_height: Number,
  orig_width: Number,
  topleft_x: Number,
  topleft_y: Number,
  scale: Number,
  rotate: Number,
  order: Number,
  width: Number,
  height: Number,
  font: {
    type: Schema.Types.ObjectId,
    ref: 'Font',
  },
  font_color: String,
  font_italic: Boolean,
  font_weight: Boolean,
  upload_image_url: String,
  text_height: Number,
  text_align: String,
})

module.exports.LayerSchema = LayerSchema
