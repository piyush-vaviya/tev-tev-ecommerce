#!/usr/bin/env node

const path = require('path')
const dotenv = require('dotenv')
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const logger = require('../utils/logger')
const async = require('async')
const mongoose = require('mongoose')

const aws = require('../utils/aws')

const APP_CONSTANTS = require('../constants/app')
const MONGO_CONFIG = require('../config/mongo')

const MONGO_CONNECTION_CONFIG = {
  host: process.env.MONGODB_HOST,
  dbName: process.env.MONGODB_NAME,
  username: process.env.MONGODB_USERNAME,
  password: process.env.MONGODB_PASSWORD,
  opts: MONGO_CONFIG.MONGOOSE_OPTS,
}

async function main () {
  logger.info('CRON Indexing non-sellables start...')

  const database = require('../mongo')
  await database(MONGO_CONNECTION_CONFIG)

  const { Product } = require('../mongo/product')

  let page = 1
  let hasNexPage = true
  const perBatch = 200

  try {
    async.whilst(async () => hasNexPage, async () => {
      // Query non-sellable product that are not yet in ES
      const products = await Product.find({
        es_status: APP_CONSTANTS.ELASTICSEARCH_SYNC_STATUS.OUTDATED,
        is_sellable: false,
      })
        .skip((page - 1) * perBatch)
        .limit(perBatch)
        .sort({ updated_at: -1 })

      logger.info(`Processing ${products.length} products...`)

      if (products.length > 0) {
        const productIds = products.map(p => mongoose.Types.ObjectId(p._id))

        // mark products as being synced
        await Product.updateMany({ _id: { $in: productIds } }, { es_status: APP_CONSTANTS.ELASTICSEARCH_SYNC_STATUS.SYNCING })

        const documentsArray = products.map(p => p._id)

        logger.debug(documentsArray)

        const response = await aws.ES.bulkDeleteIndex({
          indexName: APP_CONSTANTS.ELASTICSEARCH.PRODUCTS_INDEX,
          documentsArray: documentsArray,
        })

        logger.debug({ Response: response })

        // mark products as synced done
        await Product.updateMany({ _id: { $in: productIds } }, { es_status: APP_CONSTANTS.ELASTICSEARCH_SYNC_STATUS.LATEST })
      }

      page++

      hasNexPage = products.length > 0
    }, (err) => {
      if (err) throw err

      logger.info('CRON Indexing non-sellables end...')
      process.exit(0)
    })
  } catch (err) {
    logger.error(err)
  }
}

main()
