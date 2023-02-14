#!/usr/bin/env node

const path = require('path')
const dotenv = require('dotenv')
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const logger = require('../utils/logger')
const async = require('async')

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

  const { Color } = require('../mongo/color')
  const { Product } = require('../mongo/product')
  const { Item } = require('../mongo/item')

  let page = 1
  let hasNexPage = true
  const perBatch = 500

  try {
    await async.whilst(async () => hasNexPage, async () => {
      // Query sellable product that are not yet in ES
      const colors = await Color.find()
        .skip((page - 1) * perBatch)
        .limit(perBatch)
        .sort({ _id: -1 })

      logger.info(`Processing ${colors.length} colors...`)

      await async.eachOfSeries(colors, async (color) => {
        await Product.updateMany(
          {
            product_colors: color.name,
          },
          {
            $addToSet: {
              product_colors_temp: color._id,
            },
          },
        )

        await Product.updateMany(
          {
            featured_color: color.name,
          },
          {
            $set: {
              featured_color_temp: color._id,
            },
          },
        )
      })

      page++

      hasNexPage = colors.length > 0
    })

    page = 1
    hasNexPage = true

    await async.whilst(async () => hasNexPage, async () => {
      // Query sellable product that are not yet in ES
      const colors = await Color.find()
        .skip((page - 1) * perBatch)
        .limit(perBatch)
        .sort({ _id: -1 })

      logger.info(`Processing ${colors.length} colors...`)

      await async.eachOfSeries(colors, async (color) => {
        await Item.updateMany(
          {
            item_colors: color.name,
          },
          {
            $addToSet: {
              item_colors_temp: color._id,
            },
          },
        )

        await Item.updateMany(
          {
            featured_color: color.name,
          },
          {
            $set: {
              featured_color_temp: color._id,
            },
          },
        )

        await Item.updateMany(
          {
            'item_images.color': color.name,
          },
          {
            $set: {
              'item_images.$[].color': color._id,
            },
          },
          {
            multi: true,
          },
        )
      })

      page++

      hasNexPage = colors.length > 0
    })

    process.exit(0)
  } catch (err) {
    logger.error(err)
  }
}

main()
