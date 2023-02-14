const mongoose = require('mongoose')
const Schema = mongoose.Schema

const { PRINTING_METHODS, STATUS } = require('../constants/app')

const { connections, CONNECTION_NAMES } = require('./index')

const DesignSchema = new Schema({
  design_name: String,
  design_description: String,
  design_price: {
    type: Number,
    default: 0,
  },
  is_free: {
    type: Boolean,
    default: false,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  user_fullname: String,
  design_tags: [String],
  design_image_url: String,
  alt: String,
  s3_keyname: String,
  design_colors: [{
    image_url: String,
    color: {
      type: mongoose.Types.ObjectId,
      ref: 'Color',
    },
    alt: String,
    s3_keyname: String,
  }],
  printing_methods: [{
    type: String,
    enum: Object.values(PRINTING_METHODS),
  }],
  design_dimension: {
    width: Number,
    height: Number,
  },
  design_status: {
    type: String,
    default: STATUS.COMPLETED,
    enum: [
      STATUS.COMPLETED, STATUS.DELETED,
    ],
  },
}, {
  collection: 'designs',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})

module.exports.Design = connections[CONNECTION_NAMES.CORE].model('Design', DesignSchema)
module.exports.DesignSchema = DesignSchema
