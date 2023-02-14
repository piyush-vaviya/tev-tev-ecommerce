const DataLoader = require('dataloader')
const { objectIdMap } = require('../../utils/database')

const logger = require('../../utils/logger')

const { ItemRating } = require('../../mongo/itemRating')

const countTotalReviewsByItemId = async (ids) => {
  try {
    const objectIds = objectIdMap(ids)

    const result = await ItemRating.aggregate([
      {
        $match: {
          item: {
            $in: objectIds,
          },
        },
      },
      {
        $group: {
          _id: '$item',
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

const getAverageScoreByItemId = async (ids) => {
  try {
    const objectIds = objectIdMap(ids)

    const result = await ItemRating.aggregate([
      {
        $match: {
          item: {
            $in: objectIds,
          },
        },
      },
      {
        $group: {
          _id: '$item',
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

const countTotalReviewsByItemIdLoader = new DataLoader(countTotalReviewsByItemId)
const getAverageScoreByItemIdLoader = new DataLoader(getAverageScoreByItemId)

module.exports = {
  countTotalReviewsByItemIdLoader,
  getAverageScoreByItemIdLoader,
}
