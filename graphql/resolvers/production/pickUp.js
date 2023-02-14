/**
 * NPM modules
 *
 */
const _ = require('lodash')

/**
 * Constants
 */
const APP_CONSTANTS = require('../../../constants/app')
const PICK_UP_CONSTANTS = require('../../../constants/pickUp')

/**
 * Errors
 */
const {
  nothingToPickup,
  skuNotFound,
  productionIdNotFound,
} = require('../../errors/production')

/**
 * Validations
 */
const PICKUP_VALIDATIONS = require('../../validations/pickUp')

/**
 * Utilities
 */
const { inputValidator } = require('../../utils/inputValidator')

/**
 * Schemas
 *
 */
const { Production } = require('../../../mongo/production')
const { PickUpBatch } = require('../../../mongo/pickUpBatch')

module.exports = {
  Query: {

  },

  Mutation: {
    assignBatch: async (parent, { input }, context) => {
      const values = inputValidator(input, PICKUP_VALIDATIONS.ASSIGN_BATCH)

      const { batch_type, batch_size, printing_method, user_id } = values

      const batch = await PickUpBatch.findOne({ user: user_id, status: APP_CONSTANTS.STATUS.PENDING })

      if (batch) {
        return batch
      }

      const session = await Production.startSession()
      let productionIds = []
      let newBatch = null

      await session.withTransaction(async () => {
        [newBatch] = await PickUpBatch.create([{
          user: user_id,
          printing_method: printing_method,
        }], { session })

        let productions

        if (batch_type === PICK_UP_CONSTANTS.BATCH_TYPES.MULTI_ITEM) {
          productions = await Production.find({
            printing_method: printing_method,
            status: APP_CONSTANTS.STATUS.IN_STOCK,
          }).sort({ created_at: 1 })
            .limit(batch_size)
            .session(session)
        } else if (batch_type === PICK_UP_CONSTANTS.BATCH_TYPES.SINGLE_ITEM) {
          productions = await Production.find({
            printing_method: printing_method,
            status: APP_CONSTANTS.STATUS.IN_STOCK,
          }).sort({ created_at: 1 })
            .limit(1)
            .session(session)
        } else if (batch_type === PICK_UP_CONSTANTS.BATCH_TYPES.SINGLE_ORDER) {
          const firstInLine = await Production.findOne({
            printing_method: printing_method,
            status: APP_CONSTANTS.STATUS.IN_STOCK,
          }).sort({ created_at: 1 })
            .session(session)

          const orderId = firstInLine.orderId

          productions = await Production.find({
            printing_method: printing_method,
            status: APP_CONSTANTS.STATUS.IN_STOCK,
            order: orderId,
          }).session(session)
        }

        if (productions.length < 1) {
          throw nothingToPickup()
        }

        productionIds = productions.map(p => p._id)

        await Production.updateMany({
          _id: {
            $in: productionIds,
          },
        }, {
          status: APP_CONSTANTS.STATUS.ASSIGNED,
          pickup_batch: newBatch._id,
        })

        newBatch.items = _.map(_.groupBy(productions, 'sku'), (value, index) => {
          return {
            sku: index,
            total_quantity: value.length,
            pickup_image_url: value[0].pickup_image_url,
            pickup_image_s3_keyname: value[0].pickup_image_s3_keyname,
            ids: value.map(v => {
              return {
                production_id: v._id,
                production_ref_no: v.production_ref_no,
              }
            }),
          }
        })

        await newBatch.save()
      })

      return newBatch
    },

    updatePrintBarcodeStatus: async (parent, { input }, context) => {
      const values = inputValidator(input, PICKUP_VALIDATIONS.UPDATE_BARCODE_STATUS)

      const { pickup_batch_id, sku, production_id, status } = values

      const batch = await PickUpBatch.findById(pickup_batch_id)

      const itemIndex = batch.items.findIndex(x => x.sku === sku)

      if (itemIndex < 0) {
        throw skuNotFound()
      }

      const idIndex = batch.items[itemIndex].ids.findIndex(x => x.production_id.equals(production_id))

      if (idIndex < 0) {
        throw productionIdNotFound()
      }

      batch.items[itemIndex].ids[idIndex].status = status

      await batch.save()

      /**
       * Tag production record as completed
       */
      await Production.findByIdAndUpdate(production_id, { status: status }, { new: true })

      return batch
    },

    endBatch: async (parent, { input }, context) => {
      const values = inputValidator(input, PICKUP_VALIDATIONS.END_BATCH)

      const { pickup_batch_id } = values

      const batch = await PickUpBatch.findOneAndUpdate(
        { _id: pickup_batch_id },
        { status: APP_CONSTANTS.STATUS.COMPLETED },
        { new: true },
      )

      const assignedProductionIds = []

      for (const item of batch.items) {
        for (const id of item.ids) {
          if (id.status === APP_CONSTANTS.STATUS.ASSIGNED) {
            assignedProductionIds.push(id.production_id)
          }
        }
      }

      /**
       * Tagged assigned productions as in_stock for reprocessing
       *
       */
      await Production.updateMany({
        _id: {
          $in: assignedProductionIds,
        },
      }, {
        status: APP_CONSTANTS.STATUS.IN_STOCK,
      })

      return batch
    },
  },

  PickUpBatch: {
    id: async (parent, args, context) => {
      return parent._id || parent.id
    },
  },
}
