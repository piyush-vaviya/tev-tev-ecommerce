#!/usr/bin/env node

const path = require('path')
const dotenv = require('dotenv')
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const logger = require('../utils/logger')
const async = require('async')

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
  logger.info('Start...')

  const database = require('../mongo')
  await database(MONGO_CONNECTION_CONFIG)

  const { Product } = require('../mongo/product')
  const { Item } = require('../mongo/item')

  let page = 1
  let hasNexPage = true
  const perBatch = 500

  try {
    async.whilst(async () => hasNexPage, async () => {
      // Query sellable product that are not yet in ES
      const products = await Product.find()
        .skip((page - 1) * perBatch)
        .limit(perBatch)
        .sort({ _id: -1 })

      logger.info(`Processing ${products.length} products...`)

      if (products.length > 0) {
        const productsToDelete = await async.filterSeries(products, async (p) => {
          const item = await Item.findById(p.item)

          if (!item) {
            return true
          }

          return false
        })

        const productIds = productsToDelete.map(p => p._id)

        await Product.updateMany({ _id: { $in: productIds } }, { es_status: APP_CONSTANTS.ELASTICSEARCH_SYNC_STATUS.DELETE })
      }

      page++

      hasNexPage = products.length > 0
    }, (err) => {
      if (err) throw err

      logger.info('End...')
      process.exit(0)
    })
  } catch (err) {
    logger.error(err)
  }
}

main()
