#!/usr/bin/env node

const path = require('path')
const dotenv = require('dotenv')
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const logger = require('../utils/logger')
const async = require('async')
const _ = require('lodash')

const MONGO_CONFIG = require('../config/mongo')

const MONGO_CONNECTION_CONFIG = {
  host: process.env.MONGODB_HOST,
  dbName: process.env.MONGODB_NAME,
  username: process.env.MONGODB_USERNAME,
  password: process.env.MONGODB_PASSWORD,
  opts: MONGO_CONFIG.MONGOOSE_OPTS,
}

async function main() {
  logger.info('Start...')

  const database = require('../mongo')
  await database(MONGO_CONNECTION_CONFIG)

  const { Product } = require('../mongo/product')

  let page = 1
  let hasNexPage = true
  const perBatch = 500

  try {
    await async.whilst(
      async () => hasNexPage,
      async () => {
        // Query sellable product that are not yet in ES
        const products = await Product.find()
          .populate('item')
          .populate('design')
          .skip((page - 1) * perBatch)
          .limit(perBatch)
          .sort({ _id: -1 })

        logger.info(`Processing ${products.length} products...`)

        await async.eachOfSeries(products, async (p) => {
          const allowedPrintingMethods = _.intersection(
            p.item.printing_methods,
            p.design.printing_methods
          )
          p.allowed_printing_methods = allowedPrintingMethods
          p.printing_method = allowedPrintingMethods.includes('digital')
            ? 'digital'
            : allowedPrintingMethods.pop()
          await p.save()
        })

        page++

        hasNexPage = products.length > 0
      },
      (err) => {
        if (err) throw err

        logger.info('End...')
        process.exit(0)
      }
    )
  } catch (err) {
    logger.error(err)
  }
}

main()
