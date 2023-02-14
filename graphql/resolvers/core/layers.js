/**
 * Data Loaders
 */
const { getDesignsByIdLoader } = require('../../dataLoaders/design')

module.exports = {
  Layer: {
    design: async (parent, args, context) => {
      return parent.design ? getDesignsByIdLoader.load(parent.design) : null
    },
  },
}
