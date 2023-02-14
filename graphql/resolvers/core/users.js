/**
 * NPM modules
 */
const mongoose = require('mongoose')

/**
 * Local modules
 */
const { limitAndOffset } = require('../../utils/query')

/**
 * Schemas
 */
const { User } = require('../../../mongo/user')

module.exports = {
  Query: {
    users: async (parent, { paginator }, context) => {
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

    user: async (parent, { id }, context) => {
      return User.findById(id)
    },
  },

  Mutation: {
    createUser: async (parent, { input }, context) => {
      return User.create({ ...input })
    },

    updateUser: async (parent, { id, input }, context) => {
      return User.findByIdAndUpdate(id, { ...input }, { new: true })
    },

    deleteUser: async (parent, { id }, context) => {
      return User.findByIdAndDelete(id)
    },

    generatePreRegisterUserId: async () => {
      return mongoose.Types.ObjectId()
    },
  },
}
