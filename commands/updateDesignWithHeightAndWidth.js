#!/usr/bin/env node

const path = require('path')
const dotenv = require('dotenv')
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const logger = require('../utils/logger')
const async = require('async')
const util = require('util')

const uuid = require('uuid')
const aws = require('../utils/aws')
const sizeOf = util.promisify(require('image-size'))

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

  const { Design } = require('../mongo/design')

  let page = 1
  let hasNexPage = true
  const perBatch = 500

  try {
    await async.whilst(async () => hasNexPage, async () => {
      const designs = await Design.find()
        .skip((page - 1) * perBatch)
        .limit(perBatch)
        .sort({ _id: -1 })

      logger.info(`Processing ${designs.length} designs...`)

      await async.eachOfSeries(designs, async (p) => {
        const imagePath = await aws.S3.download({
          bucketName: process.env.AWS_BUCKET_MAIN,
          keyName: p.s3_keyname,
          localDest: `uploads/designs/${uuid.v4()}`,
        })
        console.log(imagePath)
        const dimensions = await sizeOf(imagePath)

        p.design_dimension.width = dimensions.width
        p.design_dimension.height = dimensions.height
        await p.save()
      })

      page++

      hasNexPage = designs.length > 0
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
