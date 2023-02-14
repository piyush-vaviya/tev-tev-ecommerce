/**
 * Local modules
 */
const { limitAndOffset } = require('../../utils/query')

/**
 * Schemas
 */
const { Sku } = require('../../../mongo/sku')
const { User } = require('../../../mongo/user')

/**
 * Dataloaders
 */
const { getItemsByIdLoader } = require('../../dataLoaders/item')

module.exports = {
  Query: {
    skus: async (parent, { paginator, filter = null, match }, context) => {
      const [limit, offset] = limitAndOffset(paginator)

      const countTask = User.countDocuments({})
      const listTask = User.find({}).limit(limit).skip(offset)

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

    sku: async (parent, { id }, context) => {
      const sku = await Sku.findById(id)

      if (!sku) return null

      return sku
    },
  },

  Sku: {
    id: async (parent, args, context) => {
      return parent._id || parent.id
    },

    item: async (parent, args, context) => {
      return getItemsByIdLoader.load(parent.item)
    },
  },

  Mutation: {

  },

}
