/**
 * Utilities
 */
const { limitAndOffset } = require('../../utils/query')
const { inputValidator } = require('../../utils/inputValidator')
const { authorize } = require('../../utils/auth')

/**
 * Constants
 */
const { ROLES } = require('../../../constants/auth')

/**
 * Errors
 */
const { actionNotAllowed } = require('../../errors/auth')

/**
 * Validations
 */
const BULK_DISCOUNT_SETTINGS_VALIDATIONS = require('../../validations/bulkDiscountSettings')

/**
 * Schemas
 */
const { BulkDiscountSettings } = require('../../../mongo/bulkDiscountSettings')

module.exports = {
  Query: {
    bulkDiscountSettings: async (parent, { input }, context) => {
      const { paginator } = input

      const [limit, offset] = limitAndOffset(paginator)

      const countTask = BulkDiscountSettings.countDocuments({})
      const listTask = BulkDiscountSettings.find({}).limit(limit).skip(offset)

      const tasks = [
        countTask,
        listTask,
      ]

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

  },

  Mutation: {
    createBulkDiscountSettings: async (parent, { input }, context) => {
      if (!context.jwt || !authorize(context.jwt.roles, [ROLES.ADMIN])) {
        throw actionNotAllowed()
      }

      const values = inputValidator(input, BULK_DISCOUNT_SETTINGS_VALIDATIONS.CREATE)

      return BulkDiscountSettings.create(values)
    },

    updateBulkDiscountSettings: async (parent, { input }, context) => {
      if (!context.jwt || !authorize(context.jwt.roles, [ROLES.ADMIN])) {
        throw actionNotAllowed()
      }

      const values = inputValidator(input, BULK_DISCOUNT_SETTINGS_VALIDATIONS.UPDATE)

      const { id, ...rest } = values

      return BulkDiscountSettings.findByIdAndUpdate(id, rest, { new: true })
    },

    deleteBulkDiscountSettings: async (parent, { input }, context) => {
      if (!context.jwt || !authorize(context.jwt.roles, [ROLES.ADMIN])) {
        throw actionNotAllowed()
      }

      const values = inputValidator(input, BULK_DISCOUNT_SETTINGS_VALIDATIONS.UPDATE)

      const { id } = values

      await BulkDiscountSettings.deleteOne({ _id: id })

      return id
    },
  },
}
