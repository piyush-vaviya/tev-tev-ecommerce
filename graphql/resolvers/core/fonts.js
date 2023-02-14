/**
 * Local modules
 *
 */
const { limitAndOffset } = require('../../utils/query')

/**
 * Schemas
 *
 */
const { Font } = require('../../../mongo/font')

module.exports = {
  Query: {
    fonts: async (parent, { paginator, filter }, context) => {
      const [limit, offset] = limitAndOffset(paginator)

      const countTask = Font.countDocuments({})
      const listTask = Font.find({}).limit(limit).skip(offset)

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
}
