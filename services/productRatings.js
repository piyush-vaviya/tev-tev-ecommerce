const mongoose = require('mongoose')
const { ProductRating } = require('../mongo/productRating')

module.exports.findProductRatingByUser = async (productId, userId) => {
  return ProductRating.findOne({ user: mongoose.Types.ObjectId(userId), product: mongoose.Types.ObjectId(productId) })
}
