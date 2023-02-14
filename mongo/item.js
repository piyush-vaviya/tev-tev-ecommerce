const mongoose = require('mongoose')
const Double = require('@mongoosejs/double')
const Schema = mongoose.Schema

const { ItemConfigSchema } = require('./subdocs/itemConfig')
const { MockUpItemConfigSchema } = require('./subdocs/mockUpItemConfig')

const { STATUS, PRINTING_METHODS } = require('../constants/app')

const { connections, CONNECTION_NAMES } = require('./index')

const ItemSchema = new Schema({
  item_name: String,
  item_description: String,
  item_status: {
    type: String,
    default: STATUS.PENDING,
    enum: [
      STATUS.PENDING, STATUS.COMPLETED, STATUS.DELETED,
    ],
  },
  item_regular_price: Double,
  item_special_price: Double,
  item_vendor: String,
  item_country: String,
  item_material: String,
  item_categories: [String],
  item_colors: [{
    type: Schema.Types.ObjectId,
    ref: 'Color',
  }],
  item_sizes: [String],
  item_sides: [String],
  item_images: [{
    image_url: String,
    alt: String,
    s3_keyname: String,
    side: String,
    color: {
      type: mongoose.Types.ObjectId,
      ref: 'Color',
    },
  }],
  mock_up_images: [{
    image_url: String,
    alt: String,
    s3_keyname: String,
    color: {
      type: mongoose.Types.ObjectId,
      ref: 'Color',
    },
    index: Number,
  }],
  item_config: [ItemConfigSchema],
  mock_up_item_config: [MockUpItemConfigSchema],
  mock_up_indexes: [Number],
  sizing: {
    type: mongoose.Schema.Types.Mixed,
  },
  sizing_image: {
    image_url: String,
    s3_keyname: String,
    alt: String,
  },
  care_instructions: String,
  sku_prefix: {
    type: String,
    unique: true,
    sparse: true,
  },
  featured_color: {
    type: Schema.Types.ObjectId,
    ref: 'Color',
  },
  printing_methods: [{
    type: String,
    enum: Object.values(PRINTING_METHODS),
  }],
}, {
  collection: 'items',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})

module.exports.Item = connections[CONNECTION_NAMES.CORE].model('Item', ItemSchema)
module.exports.ItemSchema = ItemSchema
