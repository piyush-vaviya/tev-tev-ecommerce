/**
 * NPM modules
 *
 */
const mongoose = require('mongoose')

/**
 * Local modules
 *
 */
const { limitAndOffset } = require('../../utils/query')
const { inputValidator } = require('../../utils/inputValidator')
const { getProductsByIdLoader } = require('../../dataLoaders/product')
const { getItemsByIdLoader } = require('../../dataLoaders/item')
const { getUsersByIdLoader } = require('../../dataLoaders/users')
const aws = require('../../../utils/aws')
const APP_CONSTANTS = require('../../../constants/app')
const RATINGS_CONSTANTS = require('../../../constants/ratings')
const RATINGS_VALIDATION = require('../../validations/ratings')
const { actionNotAllowed } = require('../../errors/auth')

const productRatingService = require('../../../services/productRatings')
const productService = require('../../../services/products')
/**
 * Schemas
 *
 */
const { ProductRating } = require('../../../mongo/productRating')
const { ItemRating } = require('../../../mongo/itemRating')

module.exports = {
  Query: {
    ratingsByProductId: async (parent, { id, paginator }, context) => {
      const [limit, offset] = limitAndOffset(paginator)

      const countTask = ProductRating.countDocuments({})
      const listTask = ProductRating.find({ product: mongoose.Types.ObjectId(id), status: APP_CONSTANTS.STATUS.APPROVED })
        .skip(offset)
        .limit(limit)

      const tasks = [
        countTask,
        listTask,
      ]

      const [totalCount, rows] = await Promise.all(tasks)
      const hasNextPage = rows.length > 0

      return {
        edges: rows,
        total_count: totalCount,
        page_info: {
          has_next_page: hasNextPage,
        },
      }
    },

    ratingsByItemId: async (parent, { id, paginator }, context) => {
      const [limit, offset] = limitAndOffset(paginator)

      const countTask = ItemRating.countDocuments({})
      const listTask = ItemRating.find({ product: mongoose.Types.ObjectId(id), status: APP_CONSTANTS.STATUS.APPROVED })
        .skip(offset)
        .limit(limit)

      const tasks = [
        countTask,
        listTask,
      ]

      const [totalCount, rows] = await Promise.all(tasks)
      const hasNextPage = rows.length > 0

      return {
        edges: rows,
        total_count: totalCount,
        page_info: {
          has_next_page: hasNextPage,
        },
      }
    },
  },

  ProductRating: {
    product: async (parent, args, context) => {
      return getProductsByIdLoader.load(parent.product)
    },

    user: async (parent, args, context) => {
      return getUsersByIdLoader.load(parent.user)
    },
  },

  ItemRating: {
    item: async (parent, args, context) => {
      return getItemsByIdLoader.load(parent.item)
    },

    user: async (parent, args, context) => {
      return getUsersByIdLoader.load(parent.user)
    },
  },

  Mutation: {
    rateProduct: async (parent, { input }, context) => {
      if (!context.jwt) {
        throw actionNotAllowed()
      }

      /**
       * Validate parameters before processing request
       */
      const values = inputValidator(input, RATINGS_VALIDATION.RATE_PRODUCT)

      let rating = await productRatingService.findProductRatingByUser(values.product_id, context.jwt.uid)

      if (rating) {
        /**
         * Decrement the old ratings counter for product
         *
         */
        await productService.decrementRating(values.product_id, rating.score)

        rating.image_urls = values.image_urls
        rating.score = values.score
        rating.remarks = values.remarks
        rating.status = values.status

        await rating.save()
      } else {
        rating = await ProductRating.create({
          user: context.jwt.uid,
          product: values.product_id,
          image_urls: values.image_urls,
          score: values.score,
          remarks: values.remarks,
        })
      }

      /**
        * Increment the counter ratings for product
        */
      const product = await productService.incrementRating(values.product_id, values.score)

      /**
       * Call AWS Elasticsearch script to compute and update wilson_score of product
       */
      const { _id, created_at, updated_at, ...rest } = product.toObject()
      await aws.ES.bulk([
        { update: { _id: _id, _index: APP_CONSTANTS.ELASTICSEARCH.PRODUCTS_INDEX } },
        {
          doc: {
            ...rest,
            id: _id,
            created_at: created_at.getTime(),
            updated_at: updated_at.getTime(),
          },
        },
        { update: { _id: _id, _index: APP_CONSTANTS.ELASTICSEARCH.PRODUCTS_INDEX } },
        {
          script: {
            id: RATINGS_CONSTANTS.ES.UPDATE_PRODUCT_RATING_FUNC,
            params: {
              rating: values.score,
            },
          },
        },
      ])

      return rating
    },

    rateItem: async (parent, { input }, context) => {
      if (!context.jwt) {
        throw actionNotAllowed()
      }

      return ItemRating.create({
        user: context.user._id,
        item: input.item_id,
        image_urls: input.image_urls,
        score: input.score,
        remarks: input.remarks,
      })
    },
  },
}
