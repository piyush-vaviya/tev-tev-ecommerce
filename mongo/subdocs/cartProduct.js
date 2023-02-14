const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CartProductSchema = new Schema({
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
  product_image: { type: String },
})

module.exports.CartProductSchema = CartProductSchema
