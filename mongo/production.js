const mongoose = require('mongoose')
const { Schema } = mongoose

const { ItemConfigSchema } = require('./subdocs/itemConfig')
const { DesignConfigSchema } = require('./subdocs/designConfig')

const APP_CONSTANTS = require('../constants/app')

const { connections, CONNECTION_NAMES } = require('./index')

const ProductionSchema = new Schema(
  {
    order: {
      type: Schema.ObjectId,
      ref: 'Order',
    },
    customer: {
      type: Schema.ObjectId,
      ref: 'User',
    },
    product: {
      type: mongoose.Types.ObjectId,
      ref: 'Product',
    },
    custom_product: {
      type: mongoose.Types.ObjectId,
      ref: 'CustomProduct',
    },
    item_config: [ItemConfigSchema],
    design_config: [DesignConfigSchema],
    printing_method: String,
    product_color: {
      type: mongoose.Types.ObjectId,
      ref: 'Color',
    },
    product_size: {
      type: String,
    },
    sku: {
      type: String,
    },
    pickup_image_url: String,
    pickup_image_s3_keyname: String,
    status: {
      type: String,
      default: APP_CONSTANTS.STATUS.IN_STOCK,
    },
    pickup_batch: {
      type: mongoose.Types.ObjectId,
      ref: 'PickUpBatch',
    },
    user: {
      type: mongoose.Types.ObjectId,
    },
    order_item_no: String,
    production_ref_no: String,
    bin_number: String,
  },
  {
    collection: 'productions',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
)

module.exports.Production = connections[CONNECTION_NAMES.PRODUCTION].model(
  'Production',
  ProductionSchema
)
module.exports.ProductionSchema = ProductionSchema
