/**
 * NPM modules
 *
 */
const _ = require('lodash')
const mongoose = require('mongoose')
const async = require('async')

/**
 * Local modules
 *
 */
const { limitAndOffset, sort } = require('../../utils/query')
const aws = require('../../../utils/aws')
const logger = require('../../../utils/logger')
const { inputValidator } = require('../../utils/inputValidator')
const APP_CONSTANTS = require('../../../constants/app')
const PRODUCT_VALIDATIONS = require('../../validations/products')
const amqp = require('../../../utils/amqp')
const { authorize } = require('../../utils/auth')

const { actionNotAllowed } = require('../../errors/auth')
const { resourceNotFound } = require('../../errors/common')
const { ROLES } = require('../../../constants/auth')

/**
 * Schemas
 *
 */
const { Product } = require('../../../mongo/product')
const { Item } = require('../../../mongo/item')
const { Design } = require('../../../mongo/design')

/**
 * Dataloaders
 *
 */
const {
  getUserReviewForProductsLoader,
} = require('../../dataLoaders/productRatings')
const { getItemsByIdLoader } = require('../../dataLoaders/item')
const { getDesignsByIdLoader } = require('../../dataLoaders/design')

const { getColorsByIdLoader } = require('../../dataLoaders/colors')

module.exports = {
  Query: {
    products: async (parent, { paginator, filter = null, match }, context) => {
      inputValidator({ filter }, PRODUCT_VALIDATIONS.QUERY_ALL)

      const [limit, offset] = limitAndOffset(paginator)

      const queryParams = {
        from: offset,
        size: limit,
      }

      /**
       * Requesting for filtered and searched data.
       * Use elastic search instead of calling database.
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
              'product_name^3',
              'product_description^3',
              'item_name^2',
              'product_tags^2',
              'product_categories',
              'product_colors',
              'product_sizes',
            ],
          },
        })
      }

      if (filter && filter.categories && filter.categories.length > 0) {
        searchConfig.query.bool.filter.push(
          ...filter.categories.map((cat) => ({
            match: {
              product_categories: cat,
            },
          }))
        )
      }

      if (filter && filter.sizes && filter.sizes.length > 0) {
        searchConfig.query.bool.must.push({
          bool: {
            should: filter.sizes.map((size) => ({
              match: {
                product_sizes: size,
              },
            })),
          },
        })
      }

      if (filter && filter.colors && filter.colors.length > 0) {
        searchConfig.query.bool.must.push({
          bool: {
            should: filter.colors.map((color) => ({
              match: {
                product_colors: color,
              },
            })),
          },
        })
      }

      if (filter && filter.product_tags && filter.product_tags.length > 0) {
        searchConfig.query.bool.must.push({
          bool: {
            should: filter.product_tags.map((tag) => ({
              match: {
                product_tags: tag,
              },
            })),
          },
        })
      }

      if (filter && filter.price) {
        searchConfig.query.bool.must.push({
          range: {
            product_price: {
              gte: filter.price.min,
              lte: filter.price.max,
            },
          },
        })
      }

      if (
        filter &&
        'is_sellable' in filter &&
        typeof filter.is_sellable === 'boolean'
      ) {
        searchConfig.query.bool.filter.push({
          term: {
            is_sellable: filter.is_sellable,
          },
        })
      }

      /**
       * Remove from query product_status = deleted products.
       * So product catalog would only be able to query not soft deleted products
       */
      searchConfig.query.bool.filter.push({
        terms: {
          product_status: [APP_CONSTANTS.STATUS.COMPLETED],
        },
      })

      logger.trace({
        'Search Config': searchConfig,
        'Query Params': queryParams,
      })

      const tasks = [
        aws.ES.search({
          indexName: APP_CONSTANTS.ELASTICSEARCH.PRODUCTS_INDEX,
          searchConfig: {
            ...searchConfig,
            sort: sort(paginator.sort),
            // collapse: {
            //   field: 'design.keyword',
            // }, removed because it's ommiting a lot of valid products from result. looks like random sorting via hash is the more desirable behavior
          },
          queryParams: queryParams,
        }),
        aws.ES.count({
          indexName: APP_CONSTANTS.ELASTICSEARCH.PRODUCTS_INDEX,
          searchConfig: searchConfig,
        }),
      ]

      const [responseSearch, responseCount] = await Promise.all(tasks)

      if (
        responseSearch.statusCode === 404 ||
        responseCount.statusCode === 404
      ) {
        return {
          edges: [],
          total_count: 0,
          page_info: {
            has_next_page: false,
          },
        }
      }

      if (
        responseSearch.statusCode !== 200 ||
        responseCount.statusCode !== 200
      ) {
        throw new Error(
          JSON.stringify(responseSearch.body) +
            '\n' +
            JSON.stringify(responseCount.body)
        )
      }

      const rows = responseSearch.body.hits.hits.map((p) => p['_source'])

      const hasNextPage = rows.length > 0

      return {
        edges: rows,
        total_count: responseCount.body.count,
        page_info: {
          has_next_page: hasNextPage,
        },
      }
    },

    product: async (parent, { id }, context) => {
      const values = inputValidator({ id }, PRODUCT_VALIDATIONS.QUERY_ONE)

      const product = await Product.findById(values.id)

      if (!product || product.product_status === APP_CONSTANTS.STATUS.DELETED) {
        throw resourceNotFound()
      }

      return product
    },

    productsByDesign: async (
      parent,
      { design_id: designId, is_sellable: isSellable = null, paginator },
      context
    ) => {
      const [limit, offset] = limitAndOffset(paginator)

      const design = await Design.findById(designId)

      const opts = {
        design: mongoose.Types.ObjectId(designId),
        product_status: APP_CONSTANTS.STATUS.COMPLETED,
        allowed_printing_methods: {
          $in: design.printing_methods,
        },
      }

      if (isSellable) {
        opts['is_sellable'] = isSellable
      }

      const products = await Product.find(opts)
        .skip(offset)
        .limit(limit)
        .sort({ created_at: -1 })
      const totalCount = await Product.countDocuments(opts)
      const hasNextPage = products.length > 0

      return {
        edges: products,
        total_count: totalCount,
        page_info: {
          has_next_page: hasNextPage,
        },
      }
    },
  },

  Product: {
    id: async (parent, args, context) => {
      return parent._id || parent.id
    },

    item: async (parent, args, context) => {
      return getItemsByIdLoader.load(parent.item)
    },

    design: async (parent, args, context) => {
      return getDesignsByIdLoader.load(parent.design)
    },

    average_score: async (parent, args, context) => {
      // return getAverageScoreByProductIdLoader.load(parent.id)
      if (!parent.ratings) return 0
      const totalReviews = _.sum(Object.values(parent.ratings))
      const summation = _.sum(
        _.map(Object.entries(parent.ratings), ([key, value]) => key * value)
      )
      return summation / totalReviews
    },

    total_reviews: async (parent, args, context) => {
      // return countTotalReviewsByProductIdLoader.load(parent.id)
      return parent.ratings ? _.sum(Object.values(parent.ratings)) : 0
    },

    my_review: async (parent, args, context) => {
      if (!context.user) return null

      // query review for product by context.user
      return getUserReviewForProductsLoader.load({
        productId: parent._id.toString(),
        userId: context.user._id.toString(),
      })
    },

    /**
     * Converts array of color strings to array of Color model.
     * To be used by frontend for displaying colors without looking up the hex value or image_url
     * of a specific color resource.
     *
     * @param   {[type]}  parent   original object of type Product
     * @param   {[type]}  args     [args description]
     * @param   {[type]}  context  graphql context
     *
     * @return  {[object]}           array of Colors model
     */
    product_colors_with_hex: async (parent, args, context) => {
      return getColorsByIdLoader.loadMany(parent.product_colors)
    },
  },

  Mutation: {
    createProduct: async (parent, { input }, context) => {
      if (!context.jwt || !authorize(context.jwt.roles, [ROLES.ADMIN])) {
        throw actionNotAllowed()
      }

      const values = inputValidator(input, PRODUCT_VALIDATIONS.CREATE)

      const findItem = Item.findById(values.item)
      const findDesign = Design.findById(values.design)

      const [item, design] = await Promise.all([findItem, findDesign])

      /**
       * Create the product using a transaction.
       * If the Elasticsearch indexing for the updated product fails,
       * the insert operation will not proceed
       */
      const session = await Product.startSession()

      let product

      await session.withTransaction(async () => {
        ;[product] = await Product.create(
          [
            {
              ...values,
              item_name: item.item_name,
              design_name: design.design_name,
              product_categories: item.item_categories,
            },
          ],
          {
            session: session,
          }
        )

        const {
          _id,
          created_at: createdAt,
          updated_at: updatedAt,
          ...rest
        } = product.toObject()
        await aws.ES.indexDocument({
          indexName: APP_CONSTANTS.ELASTICSEARCH.PRODUCTS_INDEX,
          id: product._id,
          documentObject: {
            id: _id,
            ...rest,
            created_at: createdAt.getTime(),
            updated_at: updatedAt.getTime(),
          },
        })

        return product
      })

      return product
    },

    updateProduct: async (parent, { input }, context) => {
      if (!context.jwt || !authorize(context.jwt.roles, [ROLES.ADMIN])) {
        throw actionNotAllowed()
      }

      const values = inputValidator(input, PRODUCT_VALIDATIONS.UPDATE)

      const { id, ...otherInputs } = values

      /**
       * Validate if product is existing
       */
      let product = await Product.findById(id)
      if (!product) {
        throw resourceNotFound()
      }

      /**
       * Update the product using a transaction.
       * If the Elasticsearch indexing for the updated product fails,
       * the update will not proceed
       */
      const session = await Product.startSession()

      await session.withTransaction(async () => {
        product = await Product.findByIdAndUpdate(
          id,
          {
            ...otherInputs,
          },
          {
            new: true,
          }
        ).session(session)

        const {
          _id,
          created_at: createdAt,
          updated_at: updatedAt,
          ...rest
        } = product.toObject()
        await aws.ES.indexDocument({
          indexName: APP_CONSTANTS.ELASTICSEARCH.PRODUCTS_INDEX,
          id: product._id,
          documentObject: {
            id: _id,
            ...rest,
            created_at: createdAt.getTime(),
            updated_at: updatedAt.getTime(),
          },
        })

        return product
      })

      return product
    },

    deleteProduct: async (parent, { id }, context) => {
      if (!context.jwt || !authorize(context.jwt.roles, [ROLES.ADMIN])) {
        throw actionNotAllowed()
      }

      const values = inputValidator({ id }, PRODUCT_VALIDATIONS.DELETE)

      /**
       * Validate if product is existing
       */
      const match = await Product.findById(values.id)
      if (!match) {
        throw resourceNotFound()
      }

      /**
       * Delete the item using a transaction.
       * If the Elasticsearch delete product fails,
       * the delete will not proceed
       */
      const session = await Product.startSession()

      await session.withTransaction(async () => {
        await aws.ES.deleteDocument({
          indexName: APP_CONSTANTS.ELASTICSEARCH.PRODUCTS_INDEX,
          id: id,
        })

        return Product.findByIdAndDelete(id, { session })
      })

      return id
    },

    updateFeaturedColorAndIsSellable: async (parent, { products }, context) => {
      if (
        !context.jwt ||
        !authorize(context.jwt.roles, [ROLES.ADMIN, ROLES.USER])
      ) {
        throw actionNotAllowed()
      }

      const values = inputValidator(
        { products },
        PRODUCT_VALIDATIONS.UPDATE_FEATURED_COLOR_IS_SELLABLE
      )

      const tasks = values.products.map((p) => {
        const { id, ...rest } = p
        return async () => {
          const product = await Product.findById(id).populate('design')

          /**
           * Block update of design if not your own or you are not an admin
           */
          if (
            product.design.user.toString() !== context.jwt.uid &&
            !authorize(context.jwt.roles, [ROLES.ADMIN])
          ) {
            throw actionNotAllowed()
          }

          const featuredImage = product.product_images.find(
            (x) =>
              (x.color.toString() === p.featured_color.toString() &&
                x.side === 'front') ||
              (x.color.toString() === p.featured_color.toString() &&
                x.index === 1)
          )

          if (!featuredImage) {
            return null
          }

          const url = featuredImage.image_url
          const s3KeynameFeaturedImage = featuredImage.s3_keyname
          const altFeaturedImage = featuredImage.alt

          return Product.findByIdAndUpdate(id, {
            ...rest,
            featured_image: url,
            s3_keyname_featured_image: s3KeynameFeaturedImage,
            alt_featured_image: altFeaturedImage,
          })
        }
      })

      /**
       * Do not run concurrently both promises because race condition would occur
       */

      // Update database
      await async.parallelLimit(tasks, 100)

      // Sync changes to AWS ES
      const params = values.products.map((p) => ({
        queue: 'mp-es-sync-product',
        payload: JSON.stringify({
          product_id: p.id,
          action: APP_CONSTANTS.ELASTICSEARCH_ACTIONS.UPDATE_INDEX,
        }),
      }))
      await amqp.batchPublish(params)

      return true
    },

    updateDesignConfig: async (parent, { input }, context) => {
      if (
        !context.jwt ||
        !authorize(context.jwt.roles, [ROLES.ADMIN, ROLES.USER])
      ) {
        throw actionNotAllowed()
      }

      const values = inputValidator(
        input,
        PRODUCT_VALIDATIONS.UPDATE_DESIGN_CONFIG
      )

      const { product_id, design_config } = values

      /**
       * Validate if product is existing
       */
      const product = await Product.findById(product_id).populate('design')
      if (!product) {
        throw resourceNotFound()
      }

      /**
       * Block update of design if not your own or you are not an admin
       */
      if (
        product.design.user.toString() !== context.jwt.uid &&
        !authorize(context.jwt.roles, [ROLES.ADMIN])
      ) {
        throw actionNotAllowed()
      }

      product.design_config = design_config
      product.markModified('design_config')

      await product.save()

      // Design Config is updated, generate new merged image
      const task1 = amqp.publish(
        'mp-img-merge-product',
        JSON.stringify({
          product_id: product._id,
        })
      )

      // Sync changes to AWS ES
      const task2 = amqp.publish(
        'mp-es-sync-product',
        JSON.stringify({
          product_id: product._id,
          action: APP_CONSTANTS.ELASTICSEARCH_ACTIONS.UPDATE_INDEX,
        })
      )

      await Promise.all([task1, task2])

      return true
    },

    updateMockUpDesignConfig: async (parent, { input }, context) => {
      if (
        !context.jwt ||
        !authorize(context.jwt.roles, [ROLES.ADMIN, ROLES.USER])
      ) {
        throw actionNotAllowed()
      }
      const values = inputValidator(
        input,
        PRODUCT_VALIDATIONS.UPDATE_MOCKUP_DESIGN_CONFIG
      )

      const { product_id, mock_up_design_config } = values

      /**
       * Validate if product is existing
       */
      const product = await Product.findById(product_id).populate('design')
      if (!product) {
        throw resourceNotFound()
      }

      /**
       * Block update of design if not your own or you are not an admin
       */
      if (
        product.design.user.toString() !== context.jwt.uid &&
        !authorize(context.jwt.roles, [ROLES.ADMIN])
      ) {
        throw actionNotAllowed()
      }

      product.mock_up_design_config = mock_up_design_config
      product.markModified('mock_up_design_config')

      await product.save()

      // Design Config is updated, generate new merged image
      const task1 = amqp.publish(
        'mp-img-merge-product',
        JSON.stringify({
          product_id: product._id,
        })
      )

      // Sync changes to AWS ES
      const task2 = amqp.publish(
        'mp-es-sync-product',
        JSON.stringify({
          product_id: product._id,
          action: APP_CONSTANTS.ELASTICSEARCH_ACTIONS.UPDATE_INDEX,
        })
      )

      await Promise.all([task1, task2])

      return true
    },
  },
}
