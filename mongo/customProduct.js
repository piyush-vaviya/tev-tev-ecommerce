const mongoose = require('mongoose')
const Schema = mongoose.Schema

const { connections, CONNECTION_NAMES } = require('./index')

const { ItemConfigSchema } = require('./subdocs/itemConfig')
const { DesignConfigSchema } = require('./subdocs/designConfig')

const CustomProductSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  // Item related data
  item: {
    type: Schema.Types.ObjectId,
    ref: 'Item',
  },
  printing_method: String,
  color: {
    type: Schema.Types.ObjectId,
    ref: 'Color',
  },
  cl_draft_id: {
    type: Schema.Types.ObjectId,
    ref: 'CL_Draft',
  },
  design_config: [DesignConfigSchema],
  item_config: [ItemConfigSchema],
  product_name: String,
  price: Number,
  image_url: String,
  alt: String,
  s3_keyname: String,
  product_images: [{
    image_url: String,
    side: String,
    color: {
      type: Schema.Types.ObjectId,
      ref: 'Color',
    },
    alt: String,
    s3_keyname: String,
    order: Number,
  }],
}, {
  collection: 'custom_products',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})

module.exports = (mongooseConnection) => {
  return {
    CustomProduct: mongooseConnection.model('CustomProduct', CustomProductSchema),
    CustomProductSchema,
  }
}

module.exports.CustomProduct = connections[CONNECTION_NAMES.CORE].model('CustomProduct', CustomProductSchema)
module.exports.CustomProductSchema = CustomProductSchema
