const mongoose = require('mongoose')
const { Schema } = mongoose
const Double = require('@mongoosejs/double')

const { ItemConfigSchema } = require('./subdocs/itemConfig')
const { DesignConfigSchema } = require('./subdocs/designConfig')

const { connections, CONNECTION_NAMES } = require('./index')

const OrderSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  order_no: {
    type: String,
    required: true,
    unique: true,
  },
  order_no_barcode: String,
  order_details: {
    products: [{
      /**
       * This is reference id for
       * the product (sellables) added to the cart.
       * Each entry in the cart should either be
       * a product or custom product only
       */
      product_id: {
        type: mongoose.Types.ObjectId,
        ref: 'Product',
      },
      /**
       * This is reference id for
       * the custom product (custom sellables from customizelab)
       * added to the cart.
       * Each entry in the cart should either be
       * a product or custom product only
       */
      custom_product_id: {
        type: mongoose.Types.ObjectId,
        ref: 'CustomProduct',
      },
      item: {
        type: mongoose.Types.ObjectId,
        ref: 'Item',
      },
      item_config: [ItemConfigSchema],
      design_config: [DesignConfigSchema],
      quantity: {
        type: Number,
        required: true,
      },
      product_color: {
        type: mongoose.Types.ObjectId,
        ref: 'Color',
      },
      product_size: { type: String },
      product_sku: { type: String },
      price: { type: Number },
      total_amount_to_pay: { type: Number },
      order_item_no: {
        type: String,
        unique: true,
      },
      product_name: String,
      product_image: String,
      order_item_no_barcode: String,
      printing_method: String,
    }],
    order_status: { type: String },
    order_payment_stripe_reference: { type: String, default: null },
    payment_date: { type: Date, default: null },
    shipping_fee: Double,
    sub_total: Double,
    discount: Double,
    total: Double,
  },
  shipping_info: {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipcode: { type: String, required: true },
  },
  billing_info: {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipcode: { type: String, required: true },
  },
  order_notes: String,
  shipping_method: { type: String, required: true },
  coupon_code: String,
  tracking_no: String,
  carrier: String,
  shipping_service: String,
  shipping_date: Date,
  label_created_at: Date,
}, {
  collection: 'orders',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})

module.exports.Order = connections[CONNECTION_NAMES.CORE].model('Order', OrderSchema)
module.exports.OrderSchema = OrderSchema
