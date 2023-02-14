/**
 * Npm packages
 *
 */
const async = require('async')

/**
 * Schemas
 *
 */
const { Product } = require('../mongo/product')

/**
 * Local modules
 *
 */
const amqp = require('../utils/amqp')
const APP_CONSTANTS = require('../constants/app')

module.exports.getProductById = async (productId) => {
  return Product.findById(productId)
}

function changeRating (value, productId, score) {
  return Product.findByIdAndUpdate(productId, {
    $inc: {
      [`ratings.${score}`]: value,
    },
    $set: {
      es_status: APP_CONSTANTS.ELASTICSEARCH_SYNC_STATUS.OUTDATED,
    },
  }, {
    new: true,
  })
}

module.exports.incrementRating = async (productId, score) => {
  return changeRating(1, productId, score)
}

module.exports.decrementRating = async (productId, score) => {
  return changeRating(-1, productId, score)
}

module.exports.bulkUpdateByItemId = async ({ itemId, doc = {} }) => {
  let hasNexPage = true
  let page = 1
  const perBatch = 100

  /**
   * Paginated publish to RabbitMQ for syncing to AWS ES
   *
   */
  await async.whilst(async () => hasNexPage, async () => {
    const products = await Product.find({ item: itemId })
      .skip((page - 1) * perBatch)
      .limit(perBatch)

    if (products.length > 0) {
      /**
       * Change is_sellable status of all products
       * and sync changes to AWS ES
       */
      await Product.updateMany(
        { _id: { $in: products.map(p => p._id) } },
        { ...doc },
        { multi: true },
      )

      await amqp.batchPublish(products.map(p => ({
        queue: 'mp-es-sync-product',
        payload: JSON.stringify({
          product_id: p._id,
          action: APP_CONSTANTS.ELASTICSEARCH_ACTIONS.UPDATE_INDEX,
        }),
      })))
    }

    page++
    hasNexPage = products.length > 0
  })
}

module.exports.bulkUpdateByDesignId = async ({ designId, doc = {} }) => {
  let hasNexPage = true
  let page = 1
  const perBatch = 100

  /**
   * Paginated publish to RabbitMQ for syncing to AWS ES
   *
   */
  await async.whilst(async () => hasNexPage, async () => {
    const products = await Product.find({ design: designId })
      .skip((page - 1) * perBatch)
      .limit(perBatch)

    if (products.length > 0) {
      /**
       * Change is_sellable status of all products
       * and sync changes to AWS ES
       */
      await Product.updateMany(
        { _id: { $in: products.map(p => p._id) } },
        { ...doc },
        { multi: true },
      )

      await amqp.batchPublish(products.map(p => ({
        queue: 'mp-es-sync-product',
        payload: JSON.stringify({
          product_id: p._id,
          action: APP_CONSTANTS.ELASTICSEARCH_ACTIONS.UPDATE_INDEX,
        }),
      })))
    }

    page++
    hasNexPage = products.length > 0
  })
}
