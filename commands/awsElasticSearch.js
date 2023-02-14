#!/usr/bin/env node

const dotenv = require('dotenv')
dotenv.config()

const logger = require('../utils/logger')
const commander = require('commander')
const async = require('async')

const aws = require('../utils/aws')

const program = new commander.Command()
program.version('0.2.0')

const APP_CONSTANTS = require('../constants/app')
const MONGO_CONFIG = require('../config/mongo')

const MONGO_CONNECTION_CONFIG = {
  host: process.env.MONGODB_CORE_HOST,
  dbName: process.env.MONGODB_CORE_NAME,
  username: process.env.MONGODB_CORE_USERNAME,
  password: process.env.MONGODB_CORE_PASSWORD,
  opts: MONGO_CONFIG.MONGOOSE_OPTS,
}

program
  .command('reindex-products')
  .description('Delete current index and create a new index for existing products at database.')
  .action(async () => {
    logger.info('Reindex AWS Elastic search start...')

    const mongo = require('../mongo')
    await mongo.connect('core', MONGO_CONNECTION_CONFIG)

    const { Product } = require('../mongo/product')

    try {
      await aws.ES.clearIndex(APP_CONSTANTS.ELASTICSEARCH.PRODUCTS_INDEX)
    } catch (err) {
      logger.error(err)
    }

    let page = 1
    let hasNexPage = true
    const perBatch = 100

    try {
      await async.whilst(async () => hasNexPage, async () => {
        const products = await Product.find({}).skip((page - 1) * perBatch).limit(perBatch)

        if (products.length > 0) {
          const documentsArray = products.map(p => {
            const { _id, created_at, updated_at, ...rest } = p.toObject()
            return [
              p.id,
              {
                ...rest,
                id: _id,
                created_at: created_at.getTime(),
                updated_at: updated_at.getTime(),
              },
            ]
          })

          logger.debug(documentsArray)

          const response = await aws.ES.bulkIndex({
            indexName: APP_CONSTANTS.ELASTICSEARCH.PRODUCTS_INDEX,
            documentsArray: documentsArray,
          })

          logger.debug({ Response: response })
        }

        page++

        hasNexPage = products.length > 0
      })
    } catch (err) {
      logger.error(err)
    }

    logger.info('Reindex AWS Elastic search end...')

    process.exit(0)
  })

program
  .command('reindex-items')
  .description('Delete current index and create a new index for existing items at database.')
  .action(async () => {
    logger.info('Reindex AWS Elastic search start...')

    const mongo = require('../mongo')
    await mongo.connect('core', MONGO_CONNECTION_CONFIG)

    const { Item } = require('../mongo/item')

    try {
      await aws.ES.clearIndex(APP_CONSTANTS.ELASTICSEARCH.ITEMS_INDEX)
    } catch (err) {
      logger.error(err)
    }

    let page = 1
    let hasNexPage = true
    const perBatch = 100

    try {
      await async.whilst(async () => hasNexPage, async () => {
        const items = await Item.find().skip((page - 1) * perBatch).limit(perBatch)

        if (items.length > 0) {
          const documentsArray = items.map(i => {
            const { _id, created_at, updated_at, ...rest } = i.toObject()
            return [
              i.id,
              {
                ...rest,
                id: _id,
                created_at: created_at.getTime(),
                updated_at: updated_at.getTime(),
              },
            ]
          })

          logger.debug(documentsArray)

          const response = await aws.ES.bulkIndex({
            indexName: APP_CONSTANTS.ELASTICSEARCH.ITEMS_INDEX,
            documentsArray: documentsArray,
          })

          logger.debug({ Response: response })
        }

        page++

        hasNexPage = items.length > 0
      })
    } catch (err) {
      logger.error(err)
    }

    logger.info('Reindex AWS Elastic search end...')

    process.exit(0)
  })

program
  .command('reindex-designs')
  .description('Delete current index and create a new index for existing designs at database.')
  .action(async () => {
    logger.info('Reindex AWS Elastic search start...')

    const mongo = require('../mongo')
    await mongo.connect('core', MONGO_CONNECTION_CONFIG)

    const { Design } = require('../mongo/design')

    try {
      await aws.ES.clearIndex(APP_CONSTANTS.ELASTICSEARCH.DESIGNS_INDEX)
    } catch (err) {
      logger.error(err)
    }

    let page = 1
    let hasNexPage = true
    const perBatch = 100

    try {
      await async.whilst(async () => hasNexPage, async () => {
        const designs = await Design.find().skip((page - 1) * perBatch).limit(perBatch)

        if (designs.length > 0) {
          const documentsArray = designs.map(i => {
            const { _id, created_at, updated_at, ...rest } = i.toObject()
            return [
              i.id,
              {
                ...rest,
                id: _id,
                created_at: created_at.getTime(),
                updated_at: updated_at.getTime(),
              },
            ]
          })

          logger.debug(documentsArray)

          const response = await aws.ES.bulkIndex({
            indexName: APP_CONSTANTS.ELASTICSEARCH.DESIGNS_INDEX,
            documentsArray: documentsArray,
          })

          logger.debug({ Response: response })
        }

        page++

        hasNexPage = designs.length > 0
      })
    } catch (err) {
      logger.error(err)
    }

    logger.info('Reindex AWS Elastic search end...')

    process.exit(0)
  })

program.parse(process.argv)
