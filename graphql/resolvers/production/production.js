/**
 * Utilities
 */
const { limitAndOffset } = require('../../utils/query')
const { inputValidator } = require('../../utils/inputValidator')
const { authorize } = require('../../utils/auth')

/**
 * Errors
 */
const { noBatchAssigned } = require('../../errors/production')

/**
 * Constants
 */
const APP_CONSTANTS = require('../../../constants/app')
const { ROLES } = require('../../../constants/auth')

/**
 * Validations
 */
const PRODUCTION_VALIDATIONS = require('../../validations/production')

/**
 * Schemas
 *
 */
const { Production } = require('../../../mongo/production')
const { PickUpBatch } = require('../../../mongo/pickUpBatch')
const { Order } = require('../../../mongo/order')
const { Item } = require('../../../mongo/item')

/**
 * Services
 */
const printableDesignService = require('../../../services/printableDesign')
const {
  searchProductionQueues,
  productionQueuesOrder,
} = require('../../../services/production')

/**
 * Dataloaders
 *
 */
const { getProductsByIdLoader } = require('../../dataLoaders/product')
const { getSidesWithDesign } = require('../../dataLoaders/customProduct')
const { getColorsByIdLoader } = require('../../dataLoaders/colors')

/**
 * Errors
 */
const {
  statusNotAllowed,
  productionRefNoNotFound,
} = require('../../errors/production')
const { actionNotAllowed } = require('../../errors/auth')

module.exports = {
  Query: {
    getCompletedPrintBarcode: async (parent, { input }, context) => {
      const { paginator, user_id } = input

      const [limit, offset] = limitAndOffset(paginator)

      const batch = await PickUpBatch.findOne({
        user: user_id,
        status: APP_CONSTANTS.STATUS.PENDING,
      })

      if (!batch) throw noBatchAssigned()

      const criteria = {
        pickup_batch: batch._id,
        status: APP_CONSTANTS.STATUS.BARCODED,
      }
      const countTask = Production.find(criteria).countDocuments({})
      const listTask = Production.find(criteria).skip(offset).limit(limit)

      const tasks = [countTask, listTask]

      const [totalCount, rows] = await Promise.all(tasks)
      const hasNextPage = rows.length > 0

      return {
        edges: rows,
        total_count: totalCount,
        page_info: {
          has_next_page: hasNextPage,
        },
      }
    },

    findProductionByRefNum: async (parent, { input }, context) => {
      const { production_ref_no } = input

      const production = await Production.findOne({
        production_ref_no,
      })

      if (!production) {
        throw productionRefNoNotFound()
      }

      return production
    },

    getProductionQueues: async (parent, { input }, context) => {
      if (!context.jwt || !authorize(context.jwt.roles, [ROLES.ADMIN])) {
        throw actionNotAllowed()
      }
      const [limit, offset] = limitAndOffset(input.paginator)

      const { total_count, page_info, edges } = await searchProductionQueues(
        limit,
        offset,
        input.term,
        input.order
      )

      return {
        total_count,
        page_info,
        edges,
      }
    },
  },

  Mutation: {
    createProductionsForOrder: async (parent, { input }, context) => {
      const values = inputValidator(
        input,
        PRODUCTION_VALIDATIONS.CREATE_PRODUCTIONS_FOR_ORDER
      )

      const { order_id } = values

      const order = await Order.findById(order_id)

      if (order && order.order_details.products.length > 0) {
        const docs = []
        for (const p of order.order_details.products) {
          const item = await Item.findById(p.item)

          const imgUrl = p.product_id
            ? item.mock_up_images.find(
                (x) =>
                  x.color.toString() === p.product_color.toString() &&
                  x.index === 1
              )
            : item.item_images.find(
                (x) =>
                  x.color.toString() === p.product_color.toString() &&
                  x.side === 'front'
              )

          const designConfig = p.design_config

          const itemConfig = p.item_config

          for (let n = 0; n < p.quantity; n++) {
            docs.push({
              order: order_id,
              customer: order.user_id,
              product: p.product_id,
              custom_product: p.custom_product_id,
              item_config: itemConfig,
              design_config: designConfig,
              product_color: p.product_color,
              product_size: p.product_size,
              sku: p.product_sku,
              printing_method: p.printing_method,
              pickup_image_url: imgUrl.image_url,
              pickup_image_s3_keyname: imgUrl.s3_keyname,
              order_item_no: p.order_item_no,
              production_ref_no: `${p.order_item_no}-${n + 1}`,
            })
          }
        }

        await Production.insertMany(docs)
      }

      return true
    },

    updateProductionStatus: async (parent, { input }, context) => {
      const values = inputValidator(
        input,
        PRODUCTION_VALIDATIONS.UPDATE_PRODUCTION_STATUS
      )

      const { production_ref_no, status } = values

      const production = await Production.findOne({ production_ref_no })

      const allowStatuses = {
        [APP_CONSTANTS.STATUS.IN_STOCK]: [
          APP_CONSTANTS.STATUS.PRE_TREATED,
          APP_CONSTANTS.STATUS.NO_STOCK,
        ],
        [APP_CONSTANTS.STATUS.PRE_TREATED]: [
          APP_CONSTANTS.STATUS.PRINTED,
          APP_CONSTANTS.STATUS.IN_STOCK,
        ],
        [APP_CONSTANTS.STATUS.PRINTED]: [
          APP_CONSTANTS.STATUS.QA_PASSED,
          APP_CONSTANTS.STATUS.PRE_TREATED,
        ],
        [APP_CONSTANTS.STATUS.QA_PASSED]: [
          APP_CONSTANTS.STATUS.BINNED,
          APP_CONSTANTS.STATUS.PRINTED,
        ],
      }

      /**
       * Enforce next status allowed for current status
       */
      if (!allowStatuses[production.status].includes(status)) {
        throw statusNotAllowed()
      }

      production.status = status
      await production.save()

      return production
    },
  },

  Production: {
    id: async (parent, args, context) => {
      return parent._id || parent.id
    },

    product: async (parent, args, context) => {
      if (!parent.product) {
        return null
      }

      return getProductsByIdLoader.load(parent.product)
    },

    custom_product: async (parent, args, context) => {
      if (!parent.custom_product) {
        return null
      }
      return getSidesWithDesign(parent)
    },

    printable_design: async (parent, args, context) => {
      return printableDesignService.findOnePrintableDesignByOrderRefNo(
        parent.order_item_no
      )
    },

    product_color: async (parent, args, context) => {
      return getColorsByIdLoader.load(parent.product_color)
    },
  },

  ProductionQueues: {
    edges: async (parent, args, context) => {
      const productionQueuesOrders = await productionQueuesOrder(parent.edges)
      return productionQueuesOrders
    },
  },

  ProductOrderDetails: {
    isFromCL: async (parent, args, context) => {
      if (parent.custom_product_id) {
        return true
      } else {
        // from products [ecommerce site]
        return false
      }
    },

    product_color: async (parent, args, context) => {
      return getColorsByIdLoader.load(parent.product_color)
    },

    printable_design: async (parent, args, context) => {
      return printableDesignService.findOnePrintableDesignByOrderRefNo(
        parent.order_item_no
      )
    },

    custom_product: async (parent, args, context) => {
      if (!parent.custom_product_id) {
        return null
      }

      return getSidesWithDesign(parent)
    },
  },
}
