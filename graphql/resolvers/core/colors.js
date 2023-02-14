/**
 * Local modules
 *
 */
const { limitAndOffset } = require('../../utils/query')
const { inputValidator } = require('../../utils/inputValidator')
const service = require('../../../services/colors')
const COLOR_VALIDATIONS = require('../../validations/colors')
const { authorize } = require('../../utils/auth')
const { actionNotAllowed } = require('../../errors/auth')
const { resourceNotFound } = require('../../errors/common')
const { ROLES } = require('../../../constants/auth')

/**
 * Schemas
 *
 */
const { Color } = require('../../../mongo/color')
const { Product } = require('../../../mongo/product')
const { Item } = require('../../../mongo/item')

module.exports = {
  Query: {
    colors: async (parent, { paginator }, context) => {
      let limit = null
      let offset = null

      if (paginator) {
        [limit, offset] = limitAndOffset(paginator)
      }

      const countTask = Color.countDocuments({})
      const listTask = Color.find({}).skip(offset).limit(limit)

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
    createColor: async (parent, { input }, context) => {
      if (!context.jwt || !authorize(context.jwt.roles, [ROLES.ADMIN])) {
        throw actionNotAllowed()
      }

      const values = inputValidator(input, COLOR_VALIDATIONS.CREATE)

      return service.createOrUpdate(values)
    },

    updateColor: async (parent, { id, input }, context) => {
      if (!context.jwt || !authorize(context.jwt.roles, [ROLES.ADMIN])) {
        throw actionNotAllowed()
      }

      const values = inputValidator(input, COLOR_VALIDATIONS.UPDATE)

      return service.createOrUpdate(values)
    },

    deleteColor: async (parent, { input }, context) => {
      if (!context.jwt || !authorize(context.jwt.roles, [ROLES.ADMIN])) {
        throw actionNotAllowed()
      }

      const values = inputValidator(input, COLOR_VALIDATIONS.DELETE)

      const color = await Color.findByIdAndDelete(values.id)

      if (!color) throw resourceNotFound()

      const updateItems = Item.updateMany({}, { $pull: { item_colors: color._id } })
      const updateProducts = Product.updateMany({}, { $pull: { product_colors: color._id } })

      await Promise.all([updateItems, updateProducts])

      return values.id
    },
  },

  Color: {
    id: async (parent, args, context) => {
      return parent._id || parent.id
    },
  },
}
