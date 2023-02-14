const _ = require('lodash')
const { UserInputError } = require('apollo-server-express')

const { Cart } = require('../mongo/cart')
const { BulkDiscountSettings } = require('../mongo/bulkDiscountSettings')
const productService = require('../services/products')
const customProductService = require('../services/customProducts')

const {
  PRODUCT_NOT_FOUND_ON_CART,
  CART_NOT_FOUND,
} = require('../constants/errorMessages')
const { invalidQuantity } = require('../graphql/errors/cart')

const ORDER_CONSTANTS = require('../constants/orders')

module.exports.clearCart = async (cartId, cartProductId, userId) => {
  const cart = await Cart.findOne({ _id: cartId, user_id: userId })
  if (!cart) throw new UserInputError(CART_NOT_FOUND)

  const productOnCart = cart.products.find(
    (product) => product._id.toString() === cartProductId
  )
  if (!productOnCart) throw new UserInputError(PRODUCT_NOT_FOUND_ON_CART)

  const updatedProductOnCart = cart.products.filter(
    (product) => product._id.toString() !== cartProductId
  )
  cart.products = updatedProductOnCart

  const { subTotal, totalQuantity } =
    await this.getCartSubTotalAndTotalQuantity(cart)
  cart.sub_total = subTotal
  const { discount } = await this.calculateDiscountAndTotal({
    subTotal,
    totalQuantity,
  })
  cart.discount = discount

  await cart.save()

  return cart
}

module.exports.clearProductsOnCart = async (userId) => {
  const cart = await Cart.findOneAndUpdate(
    { user_id: userId },
    { products: [], sub_total: 0, discount: 0, total: 0 }
  )
  if (cart) return true
  return false
}

module.exports.findCartById = async (cartId) => {
  const cart = await Cart.findById(cartId)
  return cart
}

module.exports.addProductToCart = async (input) => {
  const cart = await Cart.findOneAndUpdate(
    { user_id: input.user_id },
    { user_id: input.user_id },
    { upsert: true, new: true }
  )

  const index = input.product_id
    ? cart.products.findIndex(
        (p) =>
          p.product_id &&
          p.product_id.toString() === input.product_id &&
          p.product_color.toString() === input.product_color &&
          p.product_size === input.product_size
      )
    : cart.products.findIndex(
        (p) =>
          p.custom_product_id &&
          p.custom_product_id.toString() === input.custom_product_id &&
          p.product_size === input.product_size
      )

  if (input.product_id && index > -1) {
    cart.products[index].quantity = input.quantity
    cart.products[index].product_image = input.product_image
  } else if (input.custom_product_id && index > -1) {
    cart.products[index].quantity = input.quantity
  } else {
    /**
     * If no matches, insert the new data
     *
     */
    const data = {
      quantity: input.quantity,
      product_size: input.product_size,
      product_image: input.product_image,
    }

    if (input.product_id) {
      data['product_id'] = input.product_id
      data['product_color'] = input.product_color
    } else if (input.custom_product_id) {
      data['custom_product_id'] = input.custom_product_id
    }

    cart.products.push(data)
  }

  /**
   * Validate if update to quantity is correct
   * Qty must be greater than 0 but less than or equal to 100
   */
  if (index > -1 && !_.inRange(cart.products[index].quantity, 1, 101)) {
    throw invalidQuantity()
  }

  const { subTotal, totalQuantity } =
    await this.getCartSubTotalAndTotalQuantity(cart)
  cart.sub_total = subTotal
  const { discount } = await this.calculateDiscountAndTotal({
    subTotal,
    totalQuantity,
  })
  cart.discount = discount

  await cart.save()

  return cart
}

module.exports.incrementQuantity = async (input) => {
  const cart = await Cart.findOneAndUpdate(
    { user_id: input.user_id },
    { user_id: input.user_id },
    { upsert: true, new: true }
  )

  console.log('Here')

  const index = input.product_id
    ? cart.products.findIndex(
        (p) =>
          p.product_id &&
          p.product_id.toString() === input.product_id &&
          p.product_color.toString() === input.product_color &&
          p.product_size === input.product_size
      )
    : cart.products.findIndex(
        (p) =>
          p.custom_product_id &&
          p.custom_product_id.toString() === input.custom_product_id &&
          p.product_size === input.product_size
      )

  if (input.product_id && index > -1) {
    cart.products[index].quantity += input.quantity
    cart.products[index].product_image = input.product_image
  } else if (input.custom_product_id && index > -1) {
    cart.products[index].quantity += input.quantity
  } else {
    /**
     * If no matches, insert the new data
     *
     */
    const data = {
      quantity: input.quantity,
      product_size: input.product_size,
      product_image: input.product_image,
    }

    if (input.product_id) {
      data['product_id'] = input.product_id
      data['product_color'] = input.product_color
    } else if (input.custom_product_id) {
      data['custom_product_id'] = input.custom_product_id
    }

    cart.products.push(data)
  }

  /**
   * Validate if update to quantity is correct
   * Qty must be greater than 0 but less than or equal to 100
   */
  if (index > -1 && !_.inRange(cart.products[index].quantity, 1, 101)) {
    throw invalidQuantity()
  }

  const { subTotal, totalQuantity } =
    await this.getCartSubTotalAndTotalQuantity(cart)

  cart.sub_total = subTotal

  const { discount } = await this.calculateDiscountAndTotal({
    subTotal,
    totalQuantity,
  })
  cart.discount = discount

  await cart.save()

  return cart
}

module.exports.calculateShippingFee = (
  carts,
  shippingMethod = ORDER_CONSTANTS.SHIPPING_METHODS.STANDARD
) => {
  let minimumShippingFee = 6.99
  let perItemShippingFee = 1
  let totalQuantities = 0
  let minimumQuantity = 1

  switch (shippingMethod) {
    case ORDER_CONSTANTS.SHIPPING_METHODS.PREMIUM:
      /**
       * 12.99 based shipping fee (min 1 item)
       * then $4 per item
       */
      minimumShippingFee = 12.99
      perItemShippingFee = 4
      minimumQuantity = 1
      break

    case ORDER_CONSTANTS.SHIPPING_METHODS.EXPRESS:
      /**
       * 30.99 based shipping fee (min 1 item)
       * then $8 per item
       */
      minimumShippingFee = 30.99
      perItemShippingFee = 8
      minimumQuantity = 1
      break

    case ORDER_CONSTANTS.SHIPPING_METHODS.STANDARD:
    default:
      /**`
       * 6`.99 based shipping fee (min 1 item)
       * then $1 per item
       */
      minimumShippingFee = 6.99
      perItemShippingFee = 1
      minimumQuantity = 1
      break
  }

  for (const cart of carts.products) {
    totalQuantities += cart.quantity
  }

  if (totalQuantities === minimumQuantity) {
    return minimumShippingFee
  }

  return _.floor(
    minimumShippingFee +
      (totalQuantities - minimumQuantity) * perItemShippingFee,
  )
}

module.exports.mergeLSCartsToDB = async (input) => {
  const cart = await Cart.findOneAndUpdate(
    { user_id: input.user_id },
    { user_id: input.user_id },
    { upsert: true, new: true }
  )

  for (const [i, product] of input.cart_items.entries()) {
    let index = -1

    if (product.product_id) {
      index = cart.products.findIndex(
        (c) =>
          c.product_id &&
          product.product_id.toString() === c.product_id.toString() &&
          product.product_color.toString().toLowerCase() ===
            c.product_color.toString().toLowerCase() &&
          product.product_size.toLowerCase() === c.product_size.toLowerCase()
      )
    } else if (product.custom_product_id) {
      index = cart.products.findIndex(
        (c) =>
          c.custom_product_id &&
          product.custom_product_id.toString() ===
            c.custom_product_id.toString() &&
          product.product_size.toLowerCase() === c.product_size.toLowerCase()
      )
    }

    if (index < 0) {
      cart.products.push(product)
    } else {
      cart.products[i].quantity += product.quantity
    }
  }

  const { subTotal, totalQuantity } =
    await this.getCartSubTotalAndTotalQuantity(cart)
  cart.sub_total = subTotal
  const { discount } = await this.calculateDiscountAndTotal({
    subTotal,
    totalQuantity,
  })
  cart.discount = discount

  await cart.save()

  return cart
}

module.exports.updatePreRegistrationCartDetails = async (status, userId) => {
  const updated = await Cart.findOneAndUpdate(
    {
      user_id: userId,
    },
    {
      'user_registration_status.is_registered': status,
    }
  )
  return updated
}

module.exports.getCartSubTotalAndTotalQuantity = async (cart) => {
  let subTotal = 0
  let totalQuantity = 0
  for (const product of cart.products) {
    const info = product.product_id
      ? await productService.getProductById(product.product_id)
      : await customProductService.getByCustomProductId(
          product.custom_product_id
        )

    if (product.product_id) {
      subTotal += info.product_special_price
        ? _.multiply(info.product_special_price, product.quantity)
        : _.multiply(info.product_regular_price, product.quantity)
    } else {
      subTotal += _.multiply(info.price, product.quantity)
    }

    totalQuantity += product.quantity
  }

  return {
    subTotal: _.floor(subTotal, 2),
    totalQuantity,
  }
}

module.exports.calculateDiscountAndTotal = async ({
  subTotal,
  totalQuantity,
}) => {
  const bulkDiscount = await BulkDiscountSettings.findOne({
    min_quantity: { $lte: totalQuantity },
  }).sort({ min_quantity: -1 })
  let discount = 0
  if (bulkDiscount) {
    discount = _.floor(
      _.multiply(subTotal, _.divide(bulkDiscount.discount_percentage, 100)),
      2
    )
  } else{
    discount = _.floor(_.subtract(subTotal, discount), 2)
  }

  return {
    discount,
  }
}
