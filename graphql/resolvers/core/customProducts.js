/**
 * Local modules
 *
 */
const { getUsersByIdLoader } = require('../../dataLoaders/users')
const { getItemsByIdLoader } = require('../../dataLoaders/item')
const { getColorsByIdLoader } = require('../../dataLoaders/colors')

module.exports = {
  CustomProduct: {
    id: async (parent, args, context) => {
      return parent._id || parent.id
    },

    user: async (parent, args, context) => {
      return getUsersByIdLoader.load(parent.user)
    },

    item: async (parent, args, context) => {
      return getItemsByIdLoader.load(parent.item)
    },

    color: async (parent, args, context) => {
      return getColorsByIdLoader.load(parent.color)
    },
  },
}
