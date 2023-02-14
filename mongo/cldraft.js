const mongoose = require('mongoose')
const { Schema } = mongoose

const { connections, CONNECTION_NAMES } = require('./index')

const ClDraftSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  color: {
    type: Schema.Types.ObjectId,
    ref: 'Color',
  },
  item: {
    type: Schema.Types.ObjectId,
    ref: 'Item',
  },
  printing_method: String,
  item_configs: [{
    left: { x: Number, y: Number },
    ratio: String,
    side: String,
    top: { x: Number, y: Number },
  }],
  layers: [{
    center: {
      x: Number,
      y: Number,
      coordinates: { x: Number, y: Number },
    },
    color: {
      type: Schema.Types.ObjectId,
      ref: 'Color',
    },
    coordinates: { x: Number, y: Number },
    font_color: String,
    font_family: String,
    font_id: {
      type: Schema.Types.ObjectId,
      ref: 'FontColor',
    },
    font_italic: Boolean,
    font_weight: Boolean,
    height: Number,
    image_url: String,
    item_config: {
      left: { x: Number, y: Number },
      ratio: String,
      side: String,
      top: { x: Number, y: Number },
    },
    item_images: [{
      color: {
        type: Schema.Types.ObjectId,
        ref: 'Color',
      },
      image_url: String,
      s3_keyname: String,
      side: String,
    }],
    design: {
      design_dimension: {
        width: Number,
        height: Number,
      },
      design_image_url: String,
      design_name: String,
      design_price: String,
      design_tags: [String],
      id: {
        type: Schema.Types.ObjectId,
        ref: 'Design',
      },
      s3_keyname: String,
    },
    offset: { x: Number, y: Number },
    order: Number,
    rotate: Number,
    s3_keyname: String,
    scale: Number,
    side: String,
    text: String,
    topleft_x: Number,
    topleft_y: Number,
    type: {
      type: String,
    },
    width: Number,
    font: {
      type: Schema.Types.ObjectId,
      ref: 'Font',
    },
    text_align: String,
    text_height: Number,
  }],
}, {
  collection: 'cl_drafts',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})

module.exports.CL_Draft = connections[CONNECTION_NAMES.CORE].model('CL_Draft', ClDraftSchema)
module.exports.ClDraftSchema = ClDraftSchema
