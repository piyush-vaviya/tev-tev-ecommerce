/**
 * Native modules
 *
 */
const fs = require('fs')
const util = require('util')
const path = require('path')
const uuid = require('uuid')

/**
 * NPM modules
 *
 */
const mime = require('mime-types')
const { UserInputError } = require('apollo-server-express')
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

/**
 * Services
 */
const productService = require('../../../services/products')

/**
 * Validations
 */
const DESIGN_VALIDATIONS = require('../../validations/designs')

/**
 * Errors
 */
const { actionNotAllowed } = require('../../errors/auth')
const { resourceNotFound } = require('../../errors/common')
const {
  designImageDimensionsNotSupported, designImageMimeTypeNotSupported,
} = require('../../errors/design')

/**
 * Constants
 */
const { ROLES } = require('../../../constants/auth')
const APP_CONSTANTS = require('../../../constants/app')
const DESIGN_CONSTANTS = require('../../../constants/designs')

/**
 * Dataloaders
 */
const { getUsersByIdLoader } = require('../../dataLoaders/users')

/**
 * Schemas
 *
 */
const { Design } = require('../../../mongo/design')

const {
  AWS_BUCKET_MAIN,
} = process.env

module.exports = {
  Query: {
    designs: async (parent, { paginator, filter = null, match, owned = false }, context) => {
      if (owned && !context.jwt) {
        // You cannot query owned designs if you are not logged in
        throw actionNotAllowed()
      }

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
            should: [],
            filter: [],
          },
        },
      }

      if (match) {
        searchConfig.query.bool.must.push({
          multi_match: {
            query: match,
            fields: [
              'design_name^2', 'design_tags',
            ],
          },
        })
      }

      if (owned) {
        searchConfig.query.bool.filter = {
          term: {
            user: context.jwt.uid,
          },
        }
      }

      if (filter && filter.printing_methods && filter.printing_methods.length > 0) {
        searchConfig.query.bool.filter.push({
          terms: {
            printing_methods: filter.printing_methods,
          },
        })
      }

      /**
       * Remove from query deleted item_status.
       * So in Elasticsearch, only include completed and pending items
       */
      searchConfig.query.bool.filter.push({
        terms: {
          design_status: [APP_CONSTANTS.STATUS.COMPLETED, APP_CONSTANTS.STATUS.PENDING],
        },
      })

      logger.trace({
        'Search Config': searchConfig,
        'Query Params': queryParams,
      })

      const tasks = [
        aws.ES.search({
          indexName: APP_CONSTANTS.ELASTICSEARCH.DESIGNS_INDEX,
          searchConfig: {
            ...searchConfig,
            sort: [{
              created_at: { order: 'desc' },
            }],
          },
          queryParams: queryParams,
        }),
        aws.ES.count({
          indexName: APP_CONSTANTS.ELASTICSEARCH.DESIGNS_INDEX,
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

    design: async (parent, { id }, context) => {
      return Design.findById(id)
    },
  },

  Design: {
    id: async (parent, args, context) => {
      return parent._id || parent.id
    },

    user: async (parent, args, context) => {
      return getUsersByIdLoader.load(parent.user)
    },
  },

  Mutation: {
    uploadDesign: async (parent, { input }, context) => {
      if (!context.jwt || !authorize(context.jwt.roles, [ROLES.ADMIN, ROLES.USER])) {
        throw actionNotAllowed()
      }

      const values = inputValidator(input, DESIGN_VALIDATIONS.UPLOAD_DESIGN)

      const { image, ...otherInputs } = values

      /**
       * Wait for upload of image from graphql client
       */
      const imageUpload = await values.image

      /**
       * Gather info about file uploaded
       *
       */
      const fileInfo = path.parse(imageUpload.filename)
      const uuidFilename = uuid.v4()
      const tmpFilename = `uploads/designs/${uuidFilename}${fileInfo.ext}`

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
        writeStream.on('finish', async (fd) => {
          /**
          * Check if image is in valid mime type
          */
          if (!DESIGN_CONSTANTS.DESIGN_IMAGE_ALLOWED_MIMETYPES.includes(imageUpload.mimetype)) {
            return reject(designImageMimeTypeNotSupported())
          }

          /**
           * Check if image size less thatn 4K UHD
           */
          const imgDimensions = await imageSize(tmpFilename)
          logger.trace({ imgDimensions })
          if (imgDimensions.width > DESIGN_CONSTANTS.DESIGN_IMAGE_MAX_WIDTH ||
            imgDimensions.height > DESIGN_CONSTANTS.DESIGN_IMAGE_MAX_HEIGHT) {
            return reject(designImageDimensionsNotSupported())
          }

          const session = await Design.startSession()

          const design = new Design({
            ...otherInputs,
            alt: fileInfo.base,
            designer_id: context.jwt.uid,
          })

          const keyName = `designs/${context.jwt.uid}/${design._id}/${fileInfo.base}`

          let s3Upload
          try {
            s3Upload = await aws.S3.upload({
              bucketName: AWS_BUCKET_MAIN,
              keyName: keyName,
              contentType: imageUpload.mimetype,
              contentDisposition: 'inline',
              acl: 'public-read',
              fileStream: fs.createReadStream(tmpFilename),
            })
          } catch (err) {
            // Delete the temporary file
            await util.promisify(fs.unlink)(tmpFilename)

            reject(err)
          }

          design.design_image_url = s3Upload.Location
          design.s3_keyname = keyName
          design.user = context.jwt.uid
          design.design_dimension = values.design_dimension

          await session.withTransaction(async () => {
            try {
              await design.save({ session })
            } catch (err) {
              // Cleanup s3 for failure
              const s3CleanUpResponse = await aws.S3.deleteObject({
                bucketName: AWS_BUCKET_MAIN,
                keyName: keyName,
              })

              logger.info({ s3CleanUpResponse })

              throw err
            } finally {
              // Delete the temporary file
              await util.promisify(fs.unlink)(tmpFilename)
            }
          })

          // Send Message RabbitMQ to create appropriate sellables
          // and sync details of design to AWS Elasticsearch
          await amqp.batchPublish([
            {
              queue: 'mp-create-product',
              payload: JSON.stringify({
                design_id: design._id,
                design_keyname: design.s3_keyname,
              }),
            },
            {
              queue: 'mp-es-sync-design',
              payload: JSON.stringify({
                design_id: design._id,
                action: APP_CONSTANTS.ELASTICSEARCH_ACTIONS.UPDATE_INDEX,
              }),
            },
          ])

          // respond with the newly uploaded design
          resolve(design)
        })
      })
    },

    uploadUserDesign: async (parent, { input }) => {
      const file = await input.image
      const fileInfo = path.parse(file.filename)
      const tempFilename = `uploads/designs/${input.userId}${fileInfo.ext}`
      const writeStream = fs.createWriteStream(tempFilename)
      const readStream = file.createReadStream()
      readStream.pipe(writeStream)

      return new Promise((resolve, reject) => {
        writeStream.on('finish', async (fd) => {
          const mimeType = mime.lookup(tempFilename)

          if (!['image/jpg', 'image/jpeg', 'image/png', 'image/svg+xml'].includes(mimeType)) {
            return reject(new UserInputError('Mime type not supported'))
          }

          const keyName = `userimages/${input.userId}/${fileInfo.base}`

          let s3Upload
          try {
            s3Upload = await aws.S3.upload({
              bucketName: process.env.AWS_BUCKET_MAIN,
              keyName: keyName,
              contentType: mimeType,
              contentDisposition: 'inline',
              acl: 'public-read',
              fileStream: fs.createReadStream(tempFilename),
            })
          } catch (err) {
            await util.promisify(fs.unlink)(tempFilename)

            reject(err)
          }

          resolve(s3Upload.Location)
        })
      })
    },

    updateDesign: async (parent, { input }, context) => {
      if (!context.jwt || !authorize(context.jwt.roles, [ROLES.ADMIN, ROLES.USER])) {
        throw actionNotAllowed()
      }

      const values = inputValidator(input, DESIGN_VALIDATIONS.UPDATE)

      const { id, ...otherInputs } = values

      /**
       * Validate if design is existing
       */
      const match = await Design.findById(id)
      if (!match) {
        throw resourceNotFound()
      }

      /**
       * Block updating of design if you do not own the design or if you are not an admin
       */
      if (match.user.toString() !== context.jwt.uid && !authorize(context.jwt.roles, [ROLES.ADMIN])) {
        throw actionNotAllowed()
      }

      const design = await Design.findByIdAndUpdate(id, { ...otherInputs }, { new: true })

      /**
       * Propagate changes to related sellables and sync changes to AWS Elasticsearch
       */
      await amqp.batchPublish([{
        queue: 'mp-create-product',
        payload: JSON.stringify({
          design_id: design._id,
        }),
      }, {
        queue: 'mp-es-sync-design',
        payload: JSON.stringify({
          design_id: design._id,
          action: APP_CONSTANTS.ELASTICSEARCH_ACTIONS.UPDATE_INDEX,
        }),
      }])

      return design
    },

    deleteDesign: async (parent, { id }, context) => {
      if (!context.jwt || !authorize(context.jwt.roles, [ROLES.ADMIN, ROLES.USER])) {
        throw actionNotAllowed()
      }

      const values = inputValidator({ id }, DESIGN_VALIDATIONS.DELETE)

      const design = await Design.findById(values.id)

      if (!design) {
        throw resourceNotFound()
      }

      /**
       * Block deleting of design if you do not own the design or if you are not an admin
       */
      if (design.user.toString() !== context.jwt.uid && !authorize(context.jwt.roles, [ROLES.ADMIN])) {
        throw actionNotAllowed()
      }

      design.design_status = APP_CONSTANTS.STATUS.DELETED
      await design.save()

      /**
       * Send message to RabbitMQ to update AWS ES
       *
       */
      await amqp.publish('mp-es-sync-design', JSON.stringify({
        design_id: design._id,
        action: APP_CONSTANTS.ELASTICSEARCH_ACTIONS.UPDATE_INDEX,
      }))

      /**
       * Turn off all related sellables so they won't show in ecommerce
       */
      await productService.bulkUpdateByDesignId({
        designId: design._id,
        doc: {
          is_sellable: false,
          product_status: APP_CONSTANTS.STATUS.DELETED,
        },
      })

      return true
    },

    recreateProductImages: async (parent, { design_id }, context) => {
      if (!context.jwt || !authorize(context.jwt.roles, [ROLES.ADMIN, ROLES.USER])) {
        throw actionNotAllowed()
      }

      const design = await Design.findById(design_id)

      if (!design) {
        throw resourceNotFound()
      }

      /**
       * Block deleting of design if you do not own the design or if you are not an admin
       */
      if (design.user.toString() !== context.jwt.uid && !authorize(context.jwt.roles, [ROLES.ADMIN])) {
        throw actionNotAllowed()
      }

      await amqp.publish('mp-img-merge-generator', JSON.stringify({
        design_id: design_id,
      }))

      return true
    },
  },
}
