/**
 * Local modules
 *
 */
const { limitAndOffset } = require('../../utils/query')
const { inputValidator } = require('../../utils/inputValidator')
const FONT_COLOR_VALIDATIONS = require('../../validations/fontColors')
const { authorize } = require('../../utils/auth')
const { actionNotAllowed } = require('../../errors/auth')
const { resourceNotFound } = require('../../errors/common')
const { ROLES } = require('../../../constants/auth')

/**
 * Schemas
 *
 */
const { FontColor } = require('../../../mongo/fontColor')

module.exports = {
  Query: {
    fontColors: async (parent, { paginator }, context) => {
      let limit = null
      let offset = null

      if (paginator) {
        [limit, offset] = limitAndOffset(paginator)
      }

      const countTask = FontColor.countDocuments({})
      const listTask = FontColor.find({}).skip(offset).limit(limit)

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
    createFontColor: async (parent, { input }, context) => {
      if (!context.jwt || !authorize(context.jwt.roles, [ROLES.ADMIN])) {
        throw actionNotAllowed()
      }

      const values = inputValidator(input, FONT_COLOR_VALIDATIONS.CREATE)

      return FontColor.create(values)
    },

    updateFontColor: async (parent, { input }, context) => {
      if (!context.jwt || !authorize(context.jwt.roles, [ROLES.ADMIN])) {
        throw actionNotAllowed()
      }

      const values = inputValidator(input, FONT_COLOR_VALIDATIONS.UPDATE)

      const { id, ...rest } = values

      return FontColor.findByIdAndUpdate(id, rest)
    },

    deleteFontColor: async (parent, { id }, context) => {
      if (!context.jwt || !authorize(context.jwt.roles, [ROLES.ADMIN])) {
        throw actionNotAllowed()
      }

      const values = inputValidator({ id }, FONT_COLOR_VALIDATIONS.DELETE)

      const fontColor = await FontColor.findByIdAndDelete(values.id)

      if (!fontColor) throw resourceNotFound()

      // const updateItems = Item.updateMany({}, { $pull: { item_colors: color.name } })
      // const updateProducts = Product.updateMany({}, { $pull: { product_colors: color.name } })

      // await Promise.all([updateItems, updateProducts])

      return id
    },
  },
}
