/**
 * Native modules
 *
 */
const fs = require('fs')
const path = require('path')
const util = require('util')

/**
 * NPM modules
 *
 */
const _ = require('lodash')
const imageSize = util.promisify(require('image-size'))

/**
 * Utilities
 */
const { limitAndOffset } = require('../../utils/query')
const aws = require('../../../utils/aws')
const logger = require('../../../utils/logger')
const { inputValidator } = require('../../utils/inputValidator')
const amqp = require('../../../utils/amqp')
const { authorize } = require('../../utils/auth')
const { getFilesizeInBytes, replaceWhitespaceAndUnderscore } = require('../../../utils/file')

/**
 * Validations
 */
const ITEM_VALIDATIONS = require('../../validations/items')

/**
 * Errors
 */
const { actionNotAllowed } = require('../../errors/auth')
const {
  itemImageNotFound, duplicateItemImage, itemConfigNotFound,
  itemCannotBeCompleted, duplicateSkuPrefix, itemImageMaxFileSizeExceeded,
  itemImageDimensionsNotSupported, itemImageMimeTypeNotSupported,
  itemSizingImageMimeTypeNotSupported, itemSizingImageMaxFileSizeExceeded,
  itemSizingImageDimensionsNotSupported,
} = require('../../errors/item')
const { fieldValidationError, resourceNotFound } = require('../../errors/common')

/**
 * Services
 */
const skuService = require('../../../services/skus')
const productService = require('../../../services/products')

/**
 * Constants
 */
const APP_CONSTANTS = require('../../../constants/app')
const ITEM_CONSTANTS = require('../../../constants/items')
const { ROLES } = require('../../../constants/auth')

/**
 * Schemas
 *
 */
const { Item } = require('../../../mongo/item')
const { Color } = require('../../../mongo/color')

/**
 * Dataloaders
 */
const {
  getAverageScoreByItemIdLoader,
  countTotalReviewsByItemIdLoader,
} = require('../../dataLoaders/itemRatings')
const {
  getColorsByIdLoader,
} = require('../../dataLoaders/colors')

module.exports = {
  Query: {
    items: async (parent, { paginator, filter = null, match }, context) => {
      const { error, hasError } = inputValidator({ filter }, ITEM_VALIDATIONS.QUERY_ALL)
      if (hasError) throw fieldValidationError(error.details[0].context.key, error.message)

      const [limit, offset] = limitAndOffset(paginator)

      const queryParams = {
        from: offset,
        size: limit,
      }
      /**
       * Requesting for filtered and searched data.
       * Use elastic search instead of calling database.
       *
       */
      const searchConfig = {
        query: {
          bool: {
            must: [],
            filter: [],
          },
        },
      }

      if (match && match !== '') {
        searchConfig.query.bool.must.push({
          multi_match: {
            query: match,
            fields: [
              'item_name^2', 'item_description^2',
              'item_categories', 'item_colors', 'item_sizes',
            ],
          },
        })
      }

      if (filter && filter.categories && filter.categories.length > 0) {
        searchConfig.query.bool.must.push(...filter.categories.map(cat => ({
          match: {
            item_categories: cat,
          },
        })))
      }

      if (filter && filter.sizes && filter.sizes.length > 0) {
        searchConfig.query.bool.must.push({
          bool: {
            should: filter.sizes.map(size => ({
              match: {
                item_sizes: size,
              },
            })),
          },
        })
      }

      if (filter && filter.colors && filter.colors.length > 0) {
        searchConfig.query.bool.must.push({
          bool: {
            should: filter.colors.map(color => ({
              match: {
                item_colors: color,
              },
            })),
          },
        })
      }

      if (filter && filter.price) {
        searchConfig.query.bool.must.push({
          range: {
            item_price: {
              gte: filter.price.min,
              lte: filter.price.max,
            },
          },
        })
      }

      if (filter && filter.item_status && filter.item_status.length > 0) {
        searchConfig.query.bool.must.push({
          bool: {
            should: filter.item_status.map(item_status => ({
              match: {
                item_status: item_status,
              },
            })),
          },
        })
      }

      /**
       * Remove from query deleted item_status.
       * So in Elasticsearch, only include completed and pending items
       */
      searchConfig.query.bool.filter.push({
        terms: {
          item_status: [APP_CONSTANTS.STATUS.COMPLETED, APP_CONSTANTS.STATUS.PENDING],
        },
      })

      logger.trace({
        'Search Config': searchConfig,
        'Query Params': queryParams,
      })

      const tasks = [
        aws.ES.search({
          indexName: APP_CONSTANTS.ELASTICSEARCH.ITEMS_INDEX,
          searchConfig: {
            ...searchConfig,
            sort: [{
              created_at: { order: 'desc' },
            }],
          },
          queryParams: queryParams,
        }),
        aws.ES.count({
          indexName: APP_CONSTANTS.ELASTICSEARCH.ITEMS_INDEX,
          searchConfig: searchConfig,
        }),
      ]

      const [responseSearch, responseCount] = await Promise.all(tasks)

      if (responseSearch.statusCode === 404 || responseCount.statusCode === 404) {
        return {
          edges: [],
          total_count: 0,
          page_info: {
            has_next_page: false,
          },
        }
      }

      if (responseSearch.statusCode !== 200 || responseCount.statusCode !== 200) {
        throw new Error(JSON.stringify(responseSearch.body) + '\n' + JSON.stringify(responseCount.body))
      }

      const rows = responseSearch.body.hits.hits.map(p => p['_source'])

      const hasNextPage = rows.length > 0

      return {
        edges: rows,
        total_count: responseCount.body.count,
        page_info: {
          has_next_page: hasNextPage,
        },
      }
    },

    item: async (parent, { id }, context) => {
      const { error, hasError } = inputValidator({ id }, ITEM_VALIDATIONS.QUERY_ONE)
      if (hasError) throw fieldValidationError(error.details[0].context.key, error.message)

      const item = await Item.findById(id)

      if (!item) {
        throw resourceNotFound()
      }

      return item
    },
  },

  Item: {
    id: async (parent, args, context) => {
      return parent._id || parent.id
    },

    average_score: async (parent, args, context) => {
      return getAverageScoreByItemIdLoader.load(parent.id)
    },

    total_reviews: async (parent, args, context) => {
      return countTotalReviewsByItemIdLoader.load(parent.id)
    },

    /**
     * Converts array of color strings to array of Color model.
     * To be used by frontend for displaying colors without looking up the hex value or image_url
     * of a specific color resource.
     *
     * @param   {[type]}  parent   original object of type Item
     * @param   {[type]}  args     [args description]
     * @param   {[type]}  context  graphql context
     *
     * @return  {[object]}           array of Colors models
     */
    item_colors_with_hex: async (parent, args, context) => {
      return getColorsByIdLoader.loadMany(parent.item_colors)
    },
  },

  Mutation: {
    createItem: async (parent, { input }, context) => {
      if (!context.jwt || !authorize(context.jwt.roles, [ROLES.ADMIN])) {
        throw actionNotAllowed()
      }

      const values = inputValidator(input, ITEM_VALIDATIONS.CREATE)

      const { sizing_image, ...rest } = values

      /**
       * Create the item using a transaction.
       * If the Elasticsearch indexing for the updated item fails,
       * the insert operation will not proceed
       */
      const session = await Item.startSession()

      let item

      await session.withTransaction(async () => {
        /**
         * Check if sku prefix is still available for use
         */
        item = await Item.findOne({ sku_prefix: rest.sku_prefix })
        if (item) throw duplicateSkuPrefix()

        const docs = await Item.create([{
          ...rest,
          item_status: APP_CONSTANTS.STATUS.PENDING,
        }], {
          session: session,
        })

        item = _.head(docs)
      })

      if (!sizing_image) {
        /**
         * Handles scenario when no image for item sizing is uploaded
         */

        await amqp.publish('mp-es-sync-item', JSON.stringify({
          item_id: item._id,
          action: APP_CONSTANTS.ELASTICSEARCH_ACTIONS.UPDATE_INDEX,
        }))

        return item
      } else {
        /**
         * Handles scenario when image upload for item sizing is included
         */

        /**
         * Wait for upload of image from graphql client
         */
        const imageUpload = await sizing_image

        /**
         * Gather info about file uploaded
         *
         */
        const tmpFilename = `uploads/item_sizing/${Date.now() + imageUpload.filename}`

        /**
         * Create a writestream to create a temporary file in server.
         * We need to create a temporary file because we cannot check mime type
         * if it is not saved in the filesystem.
         */
        const writeStream = fs.createWriteStream(tmpFilename)

        /**
         * Create a readstream for S3
         *
         */
        imageUpload.createReadStream().pipe(writeStream)

        /**
         * Returns a promise.
         * The graphql server will return a reponse
         * once the promse resolves or in error cases rejects
         */
        return new Promise((resolve, reject) => {
          writeStream.on('finish', async () => {
            if (!ITEM_CONSTANTS.ITEM_SIZING_IMAGE_ALLOWED_MIMETYPES.includes(imageUpload.mimetype)) {
              return reject(itemSizingImageMimeTypeNotSupported())
            }

            const filesizeMb = getFilesizeInBytes(tmpFilename)
            if (filesizeMb > ITEM_CONSTANTS.ITEM_SIZING_IMAGE_MAX_FILESIZE_BYTES) {
              return reject(itemSizingImageMaxFileSizeExceeded())
            }

            /**
             * Check if image size is exceeds 1200x1200
             */
            const imgDimensions = await imageSize(tmpFilename)
            logger.trace({ imgDimensions })
            if (imgDimensions.width > ITEM_CONSTANTS.ITEM_SIZING_IMAGE_WIDTH ||
              imgDimensions.height > ITEM_CONSTANTS.ITEM_SIZING_IMAGE_HEIGHT) {
              return reject(itemSizingImageDimensionsNotSupported())
            }

            try {
              /**
               * Upload the image to S3 be using the created reastream.
               * It is also uploaded with the detected mime type and placed
               * to the appropriate path in S3 for public read.
               */
              const newFileName = `${imageUpload.filename}`
              const keyName = `item_sizing/${item._id}/${newFileName}`
              const s3Upload = await aws.S3.upload({
                bucketName: process.env.AWS_BUCKET_MAIN,
                keyName: keyName,
                contentType: imageUpload.mimetype,
                contentDisposition: 'inline',
                acl: 'public-read',
                fileStream: fs.createReadStream(tmpFilename),
              })

              logger.trace({ s3Upload })

              // save the image to appropriate item
              item.sizing_image = {
                image_url: s3Upload.Location,
                s3_keyname: keyName,
                alt: newFileName,
              }
              await item.save()

              amqp.publish('mp-es-sync-item', JSON.stringify({
                item_id: item._id,
                action: APP_CONSTANTS.ELASTICSEARCH_ACTIONS.UPDATE_INDEX,
              }))

              // and respond with the URL to S3
              resolve({
                ...item.sizing_image,
              })
            } catch (err) {
              reject(err)
            } finally {
              // Delete the temporary file
              await util.promisify(fs.unlink)(tmpFilename)
            }
          })
        })
      }
    },

    updateItem: async (parent, { input }, context) => {
      if (!context.jwt || !authorize(context.jwt.roles, [ROLES.ADMIN])) {
        throw actionNotAllowed()
      }

      const values = inputValidator(input, ITEM_VALIDATIONS.UPDATE)

      const { id, sizing_image, ...otherInputs } = values

      /**
       * Validate if item is existing
       */
      let item = await Item.findById(id)
      if (!item) {
        throw resourceNotFound()
      }

      /**
       * Update the item and sync changes to AWS ES
       * by sending RabbitMQ message
       */
      item = await Item.findByIdAndUpdate(id, {
        ...otherInputs,
        item_status: APP_CONSTANTS.STATUS.PENDING,
      }, { new: true })

      /**
       * Turn off all related sellables so they won't show in ecommerce
       */
      await productService.bulkUpdateByItemId({
        itemId: item._id,
        doc: { product_status: APP_CONSTANTS.STATUS.DELETED },
      })

      if (!sizing_image) {
        /**
         * Handles scenario when no image for item sizing is uploaded
         */

        await amqp.publish('mp-es-sync-item', JSON.stringify({
          item_id: item._id,
          action: APP_CONSTANTS.ELASTICSEARCH_ACTIONS.UPDATE_INDEX,
        }))

        return item
      } else {
        /**
         * Handles scenario when image upload for item sizing is included
         */

        /**
         * Wait for upload of image from graphql client
         */
        const imageUpload = await sizing_image

        /**
         * Gather info about file uploaded
         *
         */
        const tmpFilename = `uploads/item_sizing/${Date.now() + imageUpload.filename}`

        /**
         * Create a writestream to create a temporary file in server.
         * We need to create a temporary file because we cannot check mime type
         * if it is not saved in the filesystem.
         */
        const writeStream = fs.createWriteStream(tmpFilename)

        /**
         * Create a readstream for S3
         *
         */
        imageUpload.createReadStream().pipe(writeStream)

        /**
         * Returns a promise.
         * The graphql server will return a reponse
         * once the promse resolves or in error cases rejects
         */
        return new Promise((resolve, reject) => {
          writeStream.on('finish', async () => {
            if (!ITEM_CONSTANTS.ITEM_SIZING_IMAGE_ALLOWED_MIMETYPES.includes(imageUpload.mimetype)) {
              return reject(itemSizingImageMimeTypeNotSupported())
            }

            const filesizeMb = getFilesizeInBytes(tmpFilename)
            if (filesizeMb > ITEM_CONSTANTS.ITEM_SIZING_IMAGE_MAX_FILESIZE_BYTES) {
              return reject(itemSizingImageMaxFileSizeExceeded())
            }

            /**
             * Check if image size is exceeds 1200x1200
             */
            const imgDimensions = await imageSize(tmpFilename)
            logger.trace({ imgDimensions })
            if (imgDimensions.width > ITEM_CONSTANTS.ITEM_SIZING_IMAGE_WIDTH ||
              imgDimensions.height > ITEM_CONSTANTS.ITEM_SIZING_IMAGE_HEIGHT) {
              return reject(itemSizingImageDimensionsNotSupported())
            }

            try {
              /**
               * Upload the image to S3 be using the created reastream.
               * It is also uploaded with the detected mime type and placed
               * to the appropriate path in S3 for public read.
               */
              const newFileName = `${imageUpload.filename}`
              const keyName = `item_sizing/${item._id}/${newFileName}`
              const s3Upload = await aws.S3.upload({
                bucketName: process.env.AWS_BUCKET_MAIN,
                keyName: keyName,
                contentType: imageUpload.mimetype,
                contentDisposition: 'inline',
                acl: 'public-read',
                fileStream: fs.createReadStream(tmpFilename),
              })

              logger.trace({ s3Upload })

              // save the image to appropriate item
              item.sizing_image = {
                image_url: s3Upload.Location,
                s3_keyname: keyName,
                alt: newFileName,
              }
              await item.save()

              amqp.publish('mp-es-sync-item', JSON.stringify({
                item_id: item._id,
                action: APP_CONSTANTS.ELASTICSEARCH_ACTIONS.UPDATE_INDEX,
              }))

              // and respond with the URL to S3
              resolve({
                ...item.sizing_image,
              })
            } catch (err) {
              reject(err)
            } finally {
              // Delete the temporary file
              await util.promisify(fs.unlink)(tmpFilename)
            }
          })
        })
      }
    },

    deleteItem: async (parent, { id }, context) => {
      if (!context.jwt || !authorize(context.jwt.roles, [ROLES.ADMIN])) {
        throw actionNotAllowed()
      }

      const values = inputValidator({ id }, ITEM_VALIDATIONS.DELETE)

      /**
       * Validate if item is existing
       */
      const item = await Item.findById(values.id)
      if (!item) {
        throw resourceNotFound()
      }

      /**
       * Tag item as dirty and remove sellables related to item until published
       *
       */
      item.item_status = APP_CONSTANTS.STATUS.DELETED
      await item.save()

      /**
       * Turn off all related sellables so they won't show in ecommerce
       */
      await productService.bulkUpdateByItemId({
        itemId: item._id,
        doc: {
          is_sellable: false,
          product_status: APP_CONSTANTS.STATUS.DELETED,
        },
      })

      await amqp.publish('mp-es-sync-item', JSON.stringify({
        item_id: item._id,
        action: APP_CONSTANTS.ELASTICSEARCH_ACTIONS.UPDATE_INDEX,
      }))

      return id
    },

    updateItemConfig: async (parent, { input }, context) => {
      if (!context.jwt || !authorize(context.jwt.roles, [ROLES.ADMIN])) {
        throw actionNotAllowed()
      }

      const values = inputValidator(input, ITEM_VALIDATIONS.UPDATE_ITEM_CONFIG)

      const { item_id, item_config } = values

      const item = await Item.findById(item_id)

      /**
       * Validate that item is existing
       */
      if (!item) {
        throw resourceNotFound()
      }

      item.item_config = item_config
      item.item_status = APP_CONSTANTS.STATUS.PENDING
      await item.save()

      // Send Message to image merge generator for all designs for this item
      const task1 = amqp.publish('mp-img-merge-generator', JSON.stringify({
        item_id: item._id,
      }))

      const task2 = amqp.publish('mp-es-sync-item', JSON.stringify({
        item_id: item._id,
        action: APP_CONSTANTS.ELASTICSEARCH_ACTIONS.UPDATE_INDEX,
      }))

      await Promise.all([task1, task2])

      return item.item_config
    },

    deleteItemConfig: async (parent, { input }, context) => {
      if (!context.jwt || !authorize(context.jwt.roles, [ROLES.ADMIN])) {
        throw actionNotAllowed()
      }

      const values = inputValidator(input, ITEM_VALIDATIONS.DELETE_ITEM_CONFIG)

      const { item_id, side } = values

      const item = await Item.findById(item_id)
      if (!item) {
        throw resourceNotFound()
      }

      const config = item.item_config.find(e => e.side === side)
      if (!config) {
        throw itemConfigNotFound()
      }

      try {
        /**
         * Remove config from database and save
         */
        item.item_config.pull({ _id: config._id })
        item.item_status = APP_CONSTANTS.STATUS.PENDING
        await item.save()

        await amqp.publish('mp-es-sync-item', JSON.stringify({
          item_id: item._id,
          action: APP_CONSTANTS.ELASTICSEARCH_ACTIONS.UPDATE_INDEX,
        }))

        return true
      } catch (err) {
        logger.error({ err })
        return false
      }
    },

    uploadItemImage: async (parent, { input }, context) => {
      if (!context.jwt || !authorize(context.jwt.roles, [ROLES.ADMIN])) {
        throw actionNotAllowed()
      }

      const values = inputValidator(input, ITEM_VALIDATIONS.UPLOAD_ITEM_IMAGE)

      const { item_id, color, side, image } = values

      /**
       * Verify first that item is valid before processing file upload
       * to avoid garbage files
       */
      const item = await Item.findById(item_id)

      if (!item) {
        // Item is not found in database
        throw resourceNotFound()
      }

      /**
       * Validate duplicate color + side
       */
      if (item.item_images && item.item_images.find(i => i.color === color && i.side === side)) {
        throw duplicateItemImage()
      }

      /**
       * Wait for upload of image from graphql client
       */
      const imageUpload = await image

      /**
       * Gather info about file uploaded
       *
       */
      const ext = path.extname(imageUpload.filename)
      const tmpFilename = `uploads/item_images/${Date.now() + imageUpload.filename}${ext}`

      /**
       * Create a writestream to create a temporary file in server.
       * We need to create a temporary file because we cannot check mime type
       * if it is not saved in the filesystem.
       */
      const writeStream = fs.createWriteStream(tmpFilename)

      /**
       * Create a readstream for S3
       *
       */
      imageUpload.createReadStream().pipe(writeStream)

      /**
       * Returns a promise.
       * The graphql server will return a reponse
       * once the promse resolves or in error cases rejects
       */
      return new Promise((resolve, reject) => {
        writeStream.on('finish', async () => {
          /**
          * Check if image is in valid mime type
          */
          if (!ITEM_CONSTANTS.ITEM_IMAGE_ALLOWED_MIMETYPES.includes(imageUpload.mimetype)) {
            return reject(itemImageMimeTypeNotSupported())
          }

          const filesizeMb = getFilesizeInBytes(tmpFilename)
          if (filesizeMb > ITEM_CONSTANTS.ITEM_IMAGE_MAX_FILESIZE_BYTES) {
            return reject(itemImageMaxFileSizeExceeded())
          }

          /**
           * Check if image size is 1200x1200
           */
          const imgDimensions = await imageSize(tmpFilename)
          logger.trace({ imgDimensions })
          if (imgDimensions.width !== ITEM_CONSTANTS.ITEM_IMAGE_WIDTH ||
            imgDimensions.height !== ITEM_CONSTANTS.ITEM_IMAGE_HEIGHT) {
            return reject(itemImageDimensionsNotSupported())
          }

          const colorDoc = await Color.findById(color)

          try {
            /**
             * Upload the image to S3 be using the created reastream.
             * It is also uploaded with the detected mime type and placed
             * to the appropriate path in S3 for public read.
             */
            const newFileName = `${color}-${replaceWhitespaceAndUnderscore(colorDoc.name, '-')}-${side}${ext}`
            const keyName = `items/${item._id}/${newFileName}`
            const s3Upload = await aws.S3.upload({
              bucketName: process.env.AWS_BUCKET_MAIN,
              keyName: keyName,
              contentType: imageUpload.mimetype,
              contentDisposition: 'inline',
              acl: 'public-read',
              fileStream: fs.createReadStream(tmpFilename),
            })

            logger.trace({ s3Upload })

            /**
             * Check if side and color is already existing to prevent duplicates
             */
            const index = item.item_images.findIndex(i => i.side === side && i.color.toString() === color)

            if (index > -1) {
              item.item_images[index] = {
                s3_keyname: keyName,
                alt: newFileName,
                image_url: s3Upload.Location,
                side: side,
                color: color,
              }
            } else {
              // save the image to appropriate item
              item.item_images.push({
                s3_keyname: keyName,
                alt: newFileName,
                image_url: s3Upload.Location,
                side: side,
                color: color,
              })
            }

            item.item_status = APP_CONSTANTS.STATUS.PENDING
            await item.save()

            await amqp.publish('mp-es-sync-item', JSON.stringify({
              item_id: item._id,
              action: APP_CONSTANTS.ELASTICSEARCH_ACTIONS.UPDATE_INDEX,
            }))

            // and respond with the URL to S3
            resolve({
              image_url: s3Upload.Location,
              side: side,
              color: color,
            })
          } catch (err) {
            reject(err)
          } finally {
            // Delete the temporary file
            await util.promisify(fs.unlink)(tmpFilename)
          }
        })
      })
    },

    deleteItemImage: async (parent, { input }, context) => {
      if (!context.jwt || !authorize(context.jwt.roles, [ROLES.ADMIN])) {
        throw actionNotAllowed()
      }

      const values = inputValidator(input, ITEM_VALIDATIONS.DELETE_ITEM_IMAGE)

      const { item_id, side, color } = values

      const item = await Item.findById(item_id)

      if (!item) {
        throw resourceNotFound()
      }

      const itemImage = item.item_images.find(e => e.side === side && e.color.toString() === color)
      if (!itemImage) {
        throw itemImageNotFound()
      }

      try {
        /**
         * Delete from S3
         */
        await aws.S3.deleteObject({
          bucketName: process.env.AWS_BUCKET_MAIN,
          keyName: itemImage.s3_keyname,
        })

        /**
         * Remove config from database and save
         */
        item.item_images.pull({ _id: itemImage._id })
        item.item_status = APP_CONSTANTS.STATUS.PENDING
        await item.save()

        await amqp.publish('mp-es-sync-item', JSON.stringify({
          item_id: item._id,
          action: APP_CONSTANTS.ELASTICSEARCH_ACTIONS.UPDATE_INDEX,
        }))

        return true
      } catch (err) {
        logger.error({ err })
        return false
      }
    },

    updateItemStatus: async (parent, { input }, context) => {
      if (!context.jwt || !authorize(context.jwt.roles, [ROLES.ADMIN])) {
        throw actionNotAllowed()
      }

      const values = inputValidator(input, ITEM_VALIDATIONS.UPDATE_ITEM_STATUS)

      const item = await Item.findById(values.id)

      if (values.item_status === APP_CONSTANTS.STATUS.COMPLETED) {
        // validate item if all required data are provided

        /**
         * item_images length must be equal to or greater
         * than item_colors times item_sides
         */
        if (item.item_images.length < item.item_colors.length * item.item_sides.length) {
          throw itemCannotBeCompleted()
        }

        if (item.item_config.length < item.item_sides.length) {
          throw itemCannotBeCompleted()
        }
      }

      item.item_status = values.item_status
      await item.save()

      let task1 = null
      if (values.item_status === APP_CONSTANTS.STATUS.COMPLETED) {
        // Send Message to pre-create sellables for all designs for this item
        task1 = amqp.publish('mp-create-product', JSON.stringify({
          item_id: item._id,
        }))
      }

      const task2 = amqp.publish('mp-es-sync-item', JSON.stringify({
        item_id: item._id,
        action: APP_CONSTANTS.ELASTICSEARCH_ACTIONS.UPDATE_INDEX,
      }))

      await Promise.all([task1, task2])

      return item
    },

    uploadSizingImage: async (parent, { input }, context) => {
      if (!context.jwt || !authorize(context.jwt.roles, [ROLES.ADMIN])) {
        throw actionNotAllowed()
      }

      const values = inputValidator(input, ITEM_VALIDATIONS.UPLOAD_SIZING_IMAGE)

      const { image, item_id } = values

      /**
       * Verify first that item is valid before processing file upload
       * to avoid garbage files
       */
      const item = await Item.findById(item_id)

      if (!item) {
        // SKU is not found in database
        throw resourceNotFound()
      }

      /**
       * Wait for upload of image from graphql client
       */
      const imageUpload = await image

      /**
       * Gather info about file uploaded
       *
       */
      const tmpFilename = `uploads/item_sizing/${Date.now() + imageUpload.filename}`

      /**
       * Create a writestream to create a temporary file in server.
       * We need to create a temporary file because we cannot check mime type
       * if it is not saved in the filesystem.
       */
      const writeStream = fs.createWriteStream(tmpFilename)

      /**
       * Create a readstream for S3
       *
       */
      imageUpload.createReadStream().pipe(writeStream)

      /**
       * Returns a promise.
       * The graphql server will return a reponse
       * once the promse resolves or in error cases rejects
       */
      return new Promise((resolve, reject) => {
        writeStream.on('finish', async () => {
          if (!ITEM_CONSTANTS.ITEM_SIZING_IMAGE_ALLOWED_MIMETYPES.includes(imageUpload.mimetype)) {
            return reject(itemSizingImageMimeTypeNotSupported())
          }

          const filesizeMb = getFilesizeInBytes(tmpFilename)
          if (filesizeMb > ITEM_CONSTANTS.ITEM_SIZING_IMAGE_MAX_FILESIZE_BYTES) {
            return reject(itemSizingImageMaxFileSizeExceeded())
          }

          /**
           * Check if image size is exceeds 1200x1200
           */
          const imgDimensions = await imageSize(tmpFilename)
          logger.trace({ imgDimensions })
          if (imgDimensions.width > ITEM_CONSTANTS.ITEM_SIZING_IMAGE_WIDTH ||
            imgDimensions.height > ITEM_CONSTANTS.ITEM_SIZING_IMAGE_HEIGHT) {
            return reject(itemSizingImageDimensionsNotSupported())
          }

          try {
            /**
             * Upload the image to S3 be using the created reastream.
             * It is also uploaded with the detected mime type and placed
             * to the appropriate path in S3 for public read.
             */
            const newFileName = `${imageUpload.filename}`
            const keyName = `item_sizing/${item._id}/${newFileName}`
            const s3Upload = await aws.S3.upload({
              bucketName: process.env.AWS_BUCKET_MAIN,
              keyName: keyName,
              contentType: imageUpload.mimetype,
              contentDisposition: 'inline',
              acl: 'public-read',
              fileStream: fs.createReadStream(tmpFilename),
            })

            logger.trace({ s3Upload })

            // save the image to appropriate item
            item.sizing_image = {
              image_url: s3Upload.Location,
              s3_keyname: keyName,
              alt: newFileName,
            }
            await item.save()

            amqp.publish('mp-es-sync-item', JSON.stringify({
              item_id: item._id,
              action: APP_CONSTANTS.ELASTICSEARCH_ACTIONS.UPDATE_INDEX,
            }))

            // and respond with the URL to S3
            resolve({
              ...item.sizing_image,
            })
          } catch (err) {
            reject(err)
          } finally {
            // Delete the temporary file
            await util.promisify(fs.unlink)(tmpFilename)
          }
        })
      })
    },

    publishItem: async (parent, { input }, context) => {
      if (!context.jwt || !authorize(context.jwt.roles, [ROLES.ADMIN])) {
        throw actionNotAllowed()
      }

      const values = inputValidator(input, ITEM_VALIDATIONS.PUBLISH_ITEM)

      const item = await Item.findById(values.item_id)

      if (!item) {
        throw resourceNotFound()
      }

      /**
       * item_images length must be equal to or greater
       * than item_colors times item_sides
       */
      if (item.item_images.length < item.item_colors.length * item.item_sides.length ||
        item.item_config.length < item.item_sides.length) {
        throw itemCannotBeCompleted()
      }

      item.item_status = APP_CONSTANTS.STATUS.COMPLETED
      await item.save()

      /**
       * Bulk upsert SKUS
       *
       */
      const skuTask = skuService.createSkusByColorAndSize({
        itemId: item._id,
        skuPrefix: item.sku_prefix,
        colorIds: item.item_colors,
        sizeIds: item.item_sizes,
      })

      /**
       * Turn on all related sellables so they show in ecommerce
       */
      const productsTask = productService.bulkUpdateByItemId({
        itemId: item._id,
        doc: { product_status: APP_CONSTANTS.STATUS.COMPLETED },
      })

      await Promise.all([skuTask, productsTask])

      // Send Message to pre-create sellables for all designs for this item
      const task1 = amqp.publish('mp-create-product', JSON.stringify({
        item_id: item._id,
      }))

      const task2 = amqp.publish('mp-es-sync-item', JSON.stringify({
        item_id: item._id,
        action: APP_CONSTANTS.ELASTICSEARCH_ACTIONS.UPDATE_INDEX,
      }))

      await Promise.all([task1, task2])

      return item
    },

    unpublishItem: async (parent, { input }, context) => {
      if (!context.jwt || !authorize(context.jwt.roles, [ROLES.ADMIN])) {
        throw actionNotAllowed()
      }

      const values = inputValidator(input, ITEM_VALIDATIONS.UNPUBLISH_ITEM)

      const item = await Item.findById(values.item_id)

      if (!item) {
        throw resourceNotFound()
      }

      /**
       * Tag item as dirty and remove sellables related to item until published
       *
       */
      item.item_status = APP_CONSTANTS.STATUS.PENDING
      await item.save()

      /**
       * Turn off all related sellables so they won't show in ecommerce
       */
      await productService.bulkUpdateByItemId({
        itemId: item._id,
        doc: { product_status: APP_CONSTANTS.STATUS.DELETED },
      })

      /**
       * Sync updating of status to AWS ES
       *
       */
      await amqp.publish('mp-es-sync-item', JSON.stringify({
        item_id: item._id,
        action: APP_CONSTANTS.ELASTICSEARCH_ACTIONS.UPDATE_INDEX,
      }))

      return item
    },

    uploadMockUpImage: async (parent, { input }, context) => {
      if (!context.jwt || !authorize(context.jwt.roles, [ROLES.ADMIN])) {
        throw actionNotAllowed()
      }

      const values = inputValidator(input, ITEM_VALIDATIONS.UPLOAD_MOCK_UP_IMAGE)

      const { item_id, color, index, image } = values

      /**
       * Verify first that item is valid before processing file upload
       * to avoid garbage files
       */
      const item = await Item.findById(item_id)

      if (!item) {
        // Item is not found in database
        throw resourceNotFound()
      }

      /**
       * Wait for upload of image from graphql client
       */
      const imageUpload = await image

      /**
       * Gather info about file uploaded
       *
       */
      const ext = path.extname(imageUpload.filename)
      const tmpFilename = `uploads/mock_up_images/${Date.now() + imageUpload.filename}${ext}`

      /**
       * Create a writestream to create a temporary file in server.
       * We need to create a temporary file because we cannot check mime type
       * if it is not saved in the filesystem.
       */
      const writeStream = fs.createWriteStream(tmpFilename)

      /**
       * Create a readstream for S3
       *
       */
      imageUpload.createReadStream().pipe(writeStream)

      /**
       * Returns a promise.
       * The graphql server will return a reponse
       * once the promse resolves or in error cases rejects
       */
      return new Promise((resolve, reject) => {
        writeStream.on('finish', async () => {
          /**
          * Check if image is in valid mime type
          */
          if (!ITEM_CONSTANTS.ITEM_IMAGE_ALLOWED_MIMETYPES.includes(imageUpload.mimetype)) {
            return reject(itemImageMimeTypeNotSupported())
          }

          const filesizeMb = getFilesizeInBytes(tmpFilename)
          if (filesizeMb > ITEM_CONSTANTS.ITEM_IMAGE_MAX_FILESIZE_BYTES) {
            return reject(itemImageMaxFileSizeExceeded())
          }

          /**
           * Check if image size is 1200x1200
           */
          const imgDimensions = await imageSize(tmpFilename)
          logger.trace({ imgDimensions })
          if (imgDimensions.width !== ITEM_CONSTANTS.ITEM_IMAGE_WIDTH ||
            imgDimensions.height !== ITEM_CONSTANTS.ITEM_IMAGE_HEIGHT) {
            return reject(itemImageDimensionsNotSupported())
          }

          const colorDoc = await Color.findById(color)

          try {
            /**
             * Upload the image to S3 be using the created reastream.
             * It is also uploaded with the detected mime type and placed
             * to the appropriate path in S3 for public read.
             */
            const newFileName = `${color}-${replaceWhitespaceAndUnderscore(colorDoc.name, '-')}-${index}${ext}`
            const keyName = `mock_up_images/${item._id}/${newFileName}`
            const s3Upload = await aws.S3.upload({
              bucketName: process.env.AWS_BUCKET_MAIN,
              keyName: keyName,
              contentType: imageUpload.mimetype,
              contentDisposition: 'inline',
              acl: 'public-read',
              fileStream: fs.createReadStream(tmpFilename),
            })

            logger.trace({ s3Upload })

            /**
             * Check if order and color is already existing to prevent duplicates
             */
            const i = item.mock_up_images.findIndex(i => i.index === index && i.color.toString() === color)

            if (i > -1) {
              item.mock_up_images[i] = {
                s3_keyname: keyName,
                alt: newFileName,
                image_url: s3Upload.Location,
                index: index,
                color: color,
              }
            } else {
              // save the image to appropriate item
              item.mock_up_images.push({
                s3_keyname: keyName,
                alt: newFileName,
                image_url: s3Upload.Location,
                index: index,
                color: color,
              })
            }

            item.item_status = APP_CONSTANTS.STATUS.PENDING
            await item.save()

            await amqp.publish('mp-es-sync-item', JSON.stringify({
              item_id: item._id,
              action: APP_CONSTANTS.ELASTICSEARCH_ACTIONS.UPDATE_INDEX,
            }))

            // and respond with the URL to S3
            resolve({
              image_url: s3Upload.Location,
              s3_keyname: keyName,
              index: index,
              color: color,
            })
          } catch (err) {
            reject(err)
          } finally {
            // Delete the temporary file
            await util.promisify(fs.unlink)(tmpFilename)
          }
        })
      })
    },

    deleteMockUpImage: async (parent, { input }, context) => {
      if (!context.jwt || !authorize(context.jwt.roles, [ROLES.ADMIN])) {
        throw actionNotAllowed()
      }

      const values = inputValidator(input, ITEM_VALIDATIONS.DELETE_MOCK_UP_IMAGE)

      const { item_id, index, color } = values

      const item = await Item.findById(item_id)

      if (!item) {
        throw resourceNotFound()
      }

      const mockUpImage = item.mock_up_images.filter(e => e.index === index)

      if (!mockUpImage) {
        throw itemImageNotFound()
      }

      const s3Keynames = []
      const mockupImageIds = []

      mockUpImage.forEach((item) => {
        s3Keynames.push({
          Key: item.s3_keyname,
        })
        mockupImageIds.push(item._id)
      })

      try {
        /**
         * Delete from S3
         */
        await aws.S3.deleteObjects({
          bucketName: process.env.AWS_BUCKET_MAIN,
          objects: s3Keynames,
        })

        /**
         * Remove config from database and save
         */
        mockupImageIds.forEach((mockupImageId) => {
          item.mock_up_images.pull({ _id: mockupImageId })
        })
        item.item_status = APP_CONSTANTS.STATUS.PENDING

        await item.save()

        await amqp.publish('mp-es-sync-item', JSON.stringify({
          item_id: item._id,
          action: APP_CONSTANTS.ELASTICSEARCH_ACTIONS.UPDATE_INDEX,
        }))

        return true
      } catch (err) {
        logger.error({ err })
        return false
      }
    },
  },

}
