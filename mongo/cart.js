const mongoose = require('mongoose')
const { Schema } = mongoose
const Double = require('@mongoosejs/double')

const { CartProductSchema } = require('./subdocs/cartProduct')
const { connections, CONNECTION_NAMES } = require('./index')

const CartSchema = new Schema(
  {
    user_id: {
      type: Schema.ObjectId,
      required: true,
    },
    products: {
      type: [CartProductSchema],
      default: [],
    },
    sub_total: Double,
    discount: Double,
  },
  {
    collection: 'carts',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
)

module.exports.Cart = connections[CONNECTION_NAMES.CORE].model(
  'Cart',
  CartSchema
)
module.exports.CartSchema = CartSchema
