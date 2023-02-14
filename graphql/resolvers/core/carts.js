const mongoose = require('mongoose')
const { VALIDATION_ERR_MSG } = require('../../../constants/errorMessages')
const {
  UPDATE_CART,
  ADD_TO_CART,
  CLEAR_CART,
  BULK_ADD_TO_CART,
} = require('../../validations/carts')
const { inputValidator } = require('../../utils/inputValidator')
const { resourceNotFound } = require('../../errors/common')
const { actionNotAllowed } = require('../../errors/auth')

const { Cart } = require('../../../mongo/cart')

const {
  addProductToCart,
  mergeLSCartsToDB,
  clearProductsOnCart,
  calculateShippingFee,
  clearCart,
  getCartSubTotalAndTotalQuantity,
  calculateDiscountAndTotal,
  incrementQuantity,
} = require('../../../services/carts')
const customProductServices = require('../../../services/customProducts')
const { getProductsByIdLoader } = require('../../dataLoaders/product')
const {
  getOneSidesFromProductsDesign,
} = require('../../dataLoaders/customProduct')
const { getColorsByIdLoader } = require('../../dataLoaders/colors')

const ORDER_CONSTANTS = require('../../../constants/orders')

module.exports = {
  Query: {
    cart: async (parent, { user_id }, context) => {
      const carts = await Cart.findOne({ user_id: user_id })

      return carts
    },

    shippingMethods: async (parent, { cart_id }, context) => {
      const cart = await Cart.findById(cart_id)

      const shippingMethods = []

      for (const [key, s] of Object.entries(ORDER_CONSTANTS.SHIPPING_METHODS)) {
        shippingMethods.push({
          ...ORDER_CONSTANTS.SHIPPING_METHOD_DATA[s],
          shipping_fee: calculateShippingFee(cart, s),
        })
      }

      return shippingMethods
    },
  },

  Mutation: {
    updateCart: async (parent, { input }, context) => {
      const values = inputValidator(input, UPDATE_CART)

      const isValidUser = mongoose.isValidObjectId(values.user_id)

      if (isValidUser) {
        const carts = await addProductToCart(values)
        return carts
      } else {
        throw actionNotAllowed()
      }
    },

    addToCart: async (parent, { input }, context) => {
      const values = inputValidator(input, ADD_TO_CART)

      const isValidUser = mongoose.isValidObjectId(values.user_id)

      if (isValidUser) {
        const carts = await incrementQuantity(values)
        return carts
      } else {
        throw actionNotAllowed()
      }
    },

    bulkAddToCart: async (parent, { input }, context) => {
      const values = inputValidator(input, BULK_ADD_TO_CART)

      const cart = await Cart.findOneAndUpdate(
        { user_id: input.user_id },
        {},
        { upsert: true, new: true }
      )

      /**
       * Create custom product
       */
      const { customProduct } =
        await customProductServices.createCustomProductByDraftId({
          draftId: values.cl_draft_id,
          userId: values.user_id,
        })

      // const msg = JSON.stringify({
      //   custom_product_id: customProduct._id,
      //   item_config: itemConfig,
      //   side: featuredSide,
      //   color: customProduct.color,
      //   item_keyname: itemKeyname.s3_keyname,
      // })

      // amqp.publish('mp-img-merge', msg)

      /**
       * Upsert custom product to cart
       *
       */
      for (const sq of values.size_quantity) {
        if (sq.quantity > 0) {
          cart.products.push({
            custom_product_id: customProduct._id,
            quantity: sq.quantity,
            product_size: sq.size,
            product_color: customProduct.color,
          })
        }
      }

      const { subTotal, totalQuantity } = await getCartSubTotalAndTotalQuantity(
        cart
      )
      cart.sub_total = subTotal
      const { discount } = await calculateDiscountAndTotal({
        subTotal,
        totalQuantity,
      })
      cart.discount = discount

      await cart.save()

      return cart
    },

    clearCart: async (__, { input }, context) => {
      const values = inputValidator(input, CLEAR_CART, VALIDATION_ERR_MSG)

      const cart = await clearCart(
        values.cart_id,
        values.cart_product_id,
        values.user_id
      )

      return cart
    },

    clearProductsOnCart: async (__, { user_id: userId }, context) => {
      const clear = await clearProductsOnCart(userId)
      if (clear) return true
      throw resourceNotFound()
    },

    mergeCart: async (parent, { input }, context) => {
      return mergeLSCartsToDB(input)
    },
  },

  Cart: {
    id: async (parent, args, context) => {
      return parent._id || parent.id
    },
  },

  CartItem: {
    id: async (parent, args, context) => {
      return parent._id || parent.id
    },

    product: async (parent, __) => {
      if (!parent.product_id) {
        return null
      }
      return parent.product_id && getProductsByIdLoader.load(parent.product_id)
    },

    custom_product: async (parent, __) => {
      if (!parent.custom_product_id) {
        return null
      }
      return parent.custom_product_id && getOneSidesFromProductsDesign(parent)
    },

    product_color: async (parent, __) => {
      return (
        parent.product_color && getColorsByIdLoader.load(parent.product_color)
      )
    },
  },
}
