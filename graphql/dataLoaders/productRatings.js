const DataLoader = require('dataloader')
const objectHash = require('object-hash')
const _ = require('lodash')
const { objectIdMap, toMongoObjectId } = require('../../utils/database')

const logger = require('../../utils/logger')

const { ProductRating } = require('../../mongo/productRating')
const APP_CONSTANTS = require('../../constants/app')

const countTotalReviewsByProductId = async (ids) => {
  try {
    const objectIds = objectIdMap(ids)

    const result = await ProductRating.aggregate([
      {
        $match: {
          product: {
            $in: objectIds,
          },
          status: APP_CONSTANTS.STATUS.APPROVED,
        },
      },
      {
        $group: {
          _id: '$product',
          count: {
            $sum: 1,
          },
        },
      },
    ])

    logger.debug({
      result,
    })

    return objectIds.map(id => {
      const totalReviews = result.find(d => d._id.equals(id))

      if (!totalReviews) return null

      return totalReviews.count
    })
  } catch (err) {
    logger.error(err)
  }
}

const getAverageScoreByProductId = async (ids) => {
  try {
    const objectIds = objectIdMap(ids)

    const result = await ProductRating.aggregate([
      {
        $match: {
          product: {
            $in: objectIds,
          },
          status: APP_CONSTANTS.STATUS.APPROVED,
        },
      },
      {
        $group: {
          _id: '$product',
          avg: {
            $avg: '$score',
          },
        },
      },
    ])

    logger.debug({
      result,
    })

    return objectIds.map(id => {
      const ratings = result.find(d => d._id.equals(id))

      if (!ratings) return null

      return ratings.avg
    })
  } catch (err) {
    logger.error(err)
  }
}

const getUserReviewForProducts = async (obj) => {
  try {
    const objectProductIds = []
    const objectUserIds = []

    for (const o of obj) {
      objectProductIds.push(toMongoObjectId(o.productId))
      objectUserIds.push(toMongoObjectId(o.userId))
    }

    const result = await ProductRating.find({ product: { $in: objectProductIds }, user: { $in: objectUserIds } })

    logger.debug({
      result,
    })

    return obj.map(({ productId, userId }) => {
      const review = result.find(d => d.product.toString() === productId && d.user.toString() === userId)

      if (!review) return null

      return review
    })
  } catch (err) {
    logger.error(err)
  }
}

const countTotalReviewsByProductIdLoader = new DataLoader(countTotalReviewsByProductId)
const getAverageScoreByProductIdLoader = new DataLoader(getAverageScoreByProductId)
const getUserReviewForProductsLoader = new DataLoader(getUserReviewForProducts, { cacheKeyFn: (key) => objectHash(key) })

module.exports = {
  countTotalReviewsByProductIdLoader,
  getAverageScoreByProductIdLoader,
  getUserReviewForProductsLoader,
}
