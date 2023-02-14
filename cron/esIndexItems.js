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
  logger.info('CRON Indexing blank items start...')

  const database = require('../mongo')
  await database(MONGO_CONNECTION_CONFIG)

  const { Item } = require('../mongo/item')

  let page = 1
  let hasNexPage = true
  const perBatch = 200

  try {
    async.whilst(async () => hasNexPage, async () => {
      // Query blank items that are not yet in ES
      const items = await Item.find({
        es_status: APP_CONSTANTS.ELASTICSEARCH_SYNC_STATUS.OUTDATED,
      })
        .skip((page - 1) * perBatch)
        .limit(perBatch)
        .sort({ updated_at: -1 })

      logger.info(`Processing ${items.length} items...`)

      if (items.length > 0) {
        const itemIds = items.map(p => mongoose.Types.ObjectId(p._id))

        // mark items as being synced
        await Item.updateMany({ _id: { $in: itemIds } }, { es_status: APP_CONSTANTS.ELASTICSEARCH_SYNC_STATUS.SYNCING })

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

        // mark products as synced done
        await Item.updateMany({ _id: { $in: itemIds } }, { es_status: APP_CONSTANTS.ELASTICSEARCH_SYNC_STATUS.LATEST })
      }

      page++

      hasNexPage = items.length > 0
    }, (err) => {
      if (err) throw err

      logger.info('CRON Indexing blank items end...')
      process.exit(0)
    })
  } catch (err) {
    logger.error(err)
  }
}

main()
