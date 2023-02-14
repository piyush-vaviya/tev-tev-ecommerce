#!/usr/bin/env node

const path = require('path')
const dotenv = require('dotenv')
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const logger = require('../utils/logger')
const async = require('async')
const moment = require('moment')

const MONGO_CONFIG = require('../config/mongo')

const MONGO_CORE_CONNECTION_CONFIG = {
  host: process.env.MONGODB_CORE_HOST,
  dbName: process.env.MONGODB_CORE_NAME,
  username: process.env.MONGODB_CORE_USERNAME,
  password: process.env.MONGODB_CORE_PASSWORD,
  opts: MONGO_CONFIG.MONGOOSE_OPTS,
}

const MONGODB_PRODUCTION_CONNECTION_CONFIG = {
  host: process.env.MONGODB_PRODUCTION_HOST,
  dbName: process.env.MONGODB_PRODUCTION_NAME,
  username: process.env.MONGODB_PRODUCTION_USERNAME,
  password: process.env.MONGODB_PRODUCTION_PASSWORD,
  opts: MONGO_CONFIG.MONGOOSE_OPTS,
}

async function main () {
  logger.info('CRON Enqueueing to production start...')

  const { connect, CONNECTION_NAMES } = require('../mongo')
  await connect(CONNECTION_NAMES.CORE, MONGO_CORE_CONNECTION_CONFIG)
  await connect(CONNECTION_NAMES.PRODUCTION, MONGODB_PRODUCTION_CONNECTION_CONFIG)

  const { Order } = require('../mongo/order')
  const { Production } = require('../mongo/production')

  let page = 1
  let hasNexPage = true
  const perBatch = 10

  const today = moment()

  try {
    async.whilst(async () => hasNexPage, async () => {
      // Query one order and enqueue each bought products to pickup database
      const orders = await Order.find({
        created_at: {
          $gte: today.startOf('day').toDate(),
          $lte: today.endOf('day').toDate(),
        },
      }).skip((page - 1) * perBatch)
        .limit(perBatch)
        .sort({ created_at: 1 })
        .populate('order_details.products.item') // ascending by created at

      logger.info(`Processing ${orders.length} orders...`)

      if (orders.length > 0) {
        const docs = []

        orders.forEach(async (order) => {
          if (order.order_details.products.length > 0) {
            for (const p of order.order_details.products) {
              const imgUrl = p.item.item_images.find(x => x.color.equals(p.product_color) && x.side === 'front')

              for (let n = 0; n < p.quantity; n++) {
                docs.push({
                  customer: order.user_id,
                  product: p.product_id,
                  custom_product: p.custom_product_id,
                  item_config: p.item_config,
                  design_config: p.design_config,
                  product_color: p.product_color,
                  product_size: p.product_size,
                  sku: p.product_sku,
                  printing_method: p.printing_method,
                  pick_up_image_url: imgUrl.image_url,
                  production_ref_no: `${p.order_no}-${n + 1}`,
                })
              }
            }
          }
        })

        await Production.insertMany(docs)
      }

      page++

      hasNexPage = orders.length > 0
    }, (err) => {
      if (err) throw err

      logger.info('CRON Enqueueing to production end...')
      process.exit(0)
    })
  } catch (err) {
    logger.error(err)
  }
}

main()
