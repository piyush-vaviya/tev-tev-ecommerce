const Joi = require('@hapi/joi')
const {
  RATINGS,
} = require('../../constants/ratings')

const ALLOWED_RATINGS = [
  RATINGS.ONE, RATINGS.TWO,
  RATINGS.THREE, RATINGS.FOUR,
  RATINGS.FIVE,
]

const RATE_PRODUCT = Joi.object({
  product_id: Joi.string().required(),
  score: Joi.string().required().valid(...ALLOWED_RATINGS),
  remarks: Joi.string().optional(),
  image_urls: Joi.string().optional(),
})

module.exports = {
  RATE_PRODUCT,
}
