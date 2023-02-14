const mongoose = require('mongoose')
const { Schema } = mongoose
const Double = require('@mongoosejs/double')

const { connections, CONNECTION_NAMES } = require('./index')

const PaymentTransactionSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  order_no: {
    type: String,
    required: true,
  },
  order_no_barcode: String,
  order_payment_stripe_reference: {
    type: String,
    required: true,
    unique: true,
  },
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
  }],
  payment_date: { type: Date, required: true },
  shipping_fee: Double,
  sub_total: Double,
  discount: Double,
  total: Double,
}, {
  collection: 'payment_transactions',
  timestamps: true,
})

module.exports.PaymentTransaction = connections[CONNECTION_NAMES.CORE].model('PaymentTransaction', PaymentTransactionSchema)
module.exports.PaymentTransactionSchema = PaymentTransactionSchema
