const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { DesignConfigSchema } = require('./subdocs/designConfig')
const APP_CONSTANTS = require('../constants/app')
const { connections, CONNECTION_NAMES } = require('./index')
const ProductSchema = new Schema(
  {
    product_name: String,
    product_description: String,
    product_regular_price: Number,
    product_special_price: Number,
    product_colors: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Color',
      },
    ],
    product_sizes: [String],
    product_categories: [String],
    product_images: [
      {
        image_url: String,
        side: String,
        index: Number,
        color: {
          type: Schema.Types.ObjectId,
          ref: 'Color',
        },
        alt: String,
        s3_keyname: String,
        order: Number,
      },
    ],
    product_tags: [String],
    is_sellable: {
      type: Boolean,
      default: false,
    },
    // Item related data
    item: {
      type: Schema.Types.ObjectId,
      ref: 'Item',
    },
    item_name: String,
    //
    // Design related data
    design: {
      type: Schema.Types.ObjectId,
      ref: 'Design',
    },
    design_config: [DesignConfigSchema],
    mock_up_design_config: [DesignConfigSchema],
    featured_color: {
      type: Schema.Types.ObjectId,
      ref: 'Color',
    },
    featured_image: String,
    s3_keyname_featured_image: String,
    alt_featured_image: String,
    ratings: {
      1: {
        type: Number,
        default: 0,
      },
      2: {
        type: Number,
        default: 0,
      },
      3: {
        type: Number,
        default: 0,
      },
      4: {
        type: Number,
        default: 0,
      },
      5: {
        type: Number,
        default: 0,
      },
    },
    wilson_score: {
      type: Number,
      default: 0,
    },
    allowed_printing_methods: [String],
    printing_method: {
      type: String,
      default: null,
    },
    designer: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    product_status: {
      type: String,
      default: APP_CONSTANTS.STATUS.COMPLETED,
      enum: [APP_CONSTANTS.STATUS.COMPLETED, APP_CONSTANTS.STATUS.DELETED],
    },
  },
  {
    collection: 'products',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    strict: false,
  }
)

module.exports.Product = connections[CONNECTION_NAMES.CORE].model(
  'Product',
  ProductSchema
)
module.exports.ProductSchema = ProductSchema
