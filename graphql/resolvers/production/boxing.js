const { Boxing } = require('../../../mongo/boxing')
const { Order } = require('../../../mongo/order')
const { BIN_STATUS, STATUS } = require('../../../constants/app')
const {
  boxingIsFull,
  productionRefNoNotFound,
  orderNotFound,
} = require('../../errors/production')
const { addEntryToBoxingLogs } = require('../../../services/boxing_logs')
const { Production } = require('../../../mongo/production')
const { updateProductionStatus } = require('../../../services/production')
const { GraphQLError } = require('graphql')

module.exports = {
  Mutation: {
    getBinNumber: async (parent, { input }, context) => {
      const { production_ref_no } = input
      const response = { bin_number: '', status: BIN_STATUS.NOT_status }

      // mutation returns the number of empty bin from the boxing collection
      // It also watches for the order items in to the bin items field, if number of items and bin is same as
      // items in order then it the status of bin is changed to "ready" in background
      // It updates the status of production item in production collection
      const production = await Production.findOne({ production_ref_no })

      if (!production) {
        throw productionRefNoNotFound()
      }

      const productionId = production._id

      const binWithOrderId = await Boxing.findOne({
        order_id: production.order,
      })

      const orderDetails = await Order.findById({ _id: production.order })

      if (!orderDetails) {
        throw orderNotFound()
      }

      const numberOfItemsInOrder = orderDetails.order_details.products.length

      if (orderDetails.order_details.products.length <= 1) {
        response.bin_number = '0'
        response.status = BIN_STATUS.SEND_TO_BOXING
        updateProductionStatus({
          production,
          bin_number: '0',
          status: STATUS.SHIPPED,
        })
        return response
      }

      if (binWithOrderId) {
        if (binWithOrderId.items.includes(productionId)) {
          response.bin_number = binWithOrderId.bin_id
          response.status = BIN_STATUS.BINNED
        } else {
          binWithOrderId.order_id = production.order
          binWithOrderId.items.push(productionId)
          if (numberOfItemsInOrder === binWithOrderId.items.length) {
            binWithOrderId.status = BIN_STATUS.READY
          }
          const binData = await binWithOrderId.save()
          response.bin_number = binData.bin_id
          response.status = BIN_STATUS.BINNED
          updateProductionStatus({
            production,
            bin_number: binData.bin_id,
            status: BIN_STATUS.BINNED,
          })
        }
        addEntryToBoxingLogs({
          order_id: production.order,
          bin_id: binWithOrderId.bin_id,
        })
        return response
      } else {
        const emptyBin = await Boxing.findOne({
          status: BIN_STATUS.EMPTY,
        })
        if (emptyBin) {
          emptyBin.status = BIN_STATUS.WAITING
          emptyBin.order_id = production.order
          emptyBin.items.push(productionId)
          if (numberOfItemsInOrder === emptyBin.items.length) {
            emptyBin.status = BIN_STATUS.READY
          }
          const binData = await emptyBin.save()
          binData &&
            addEntryToBoxingLogs({
              order_id: production.order,
              bin_id: binData.bin_id,
            })
          response.bin_number = binData.bin_id
          response.status = BIN_STATUS.BINNED
          updateProductionStatus({
            production,
            bin_number: binData.bin_id,
            status: STATUS.BINNED,
          })
          return response
        } else {
          throw boxingIsFull()
        }
      }

      // insert bins data in Boxing collection
      // for (let i = 1; i <= 50; i++) {
      //   const data = {
      //     bin_id: i.toString(),
      //     status: 'empty',
      //     order_id: '',
      //     items: [],
      //   }

      //   const binData = new Boxing(data)
      //   await binData.save()
      // }
    },
  },

  Query: {
    getBoxingDetails: async (parent, { input }, context) => {
      try {
        const boxing = await Boxing.find({}).sort({ bin_id: 1 })
        return boxing
      } catch (error) {
        throw new GraphQLError('Failed to resolve your request!')
      }
    },
  },
}
