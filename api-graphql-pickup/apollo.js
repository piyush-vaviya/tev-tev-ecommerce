const merge = require('lodash/merge')

/**
 * Load the typedefs
 */
const rootTypedefs = require('../graphql/typeDefs/root')
const pickUpTypedefs = require('../graphql/typeDefs/production/pickUp')
const productionTypedefs = require('../graphql/typeDefs/production/production')
const printableDesignTypedefs = require('../graphql/typeDefs/core/printableDesigns')
const productTypedefs = require('../graphql/typeDefs/core/products')
const customProductTypedefs = require('../graphql/typeDefs/core/customProducts')
const colorTypedefs = require('../graphql/typeDefs/core/colors')
const itemTypedefs = require('../graphql/typeDefs/core/items')
const designTypedefs = require('../graphql/typeDefs/core/designs')
const designConfigTypedefs = require('../graphql/typeDefs/shared/designConfig')
const userTypedefs = require('../graphql/typeDefs/core/users')
const ratingsTypedefs = require('../graphql/typeDefs/core/ratings')
const itemImageTypedefs = require('../graphql/typeDefs/shared/itemImage')
const itemConfigTypedefs = require('../graphql/typeDefs/shared/itemConfig')
const layerTypedefs = require('../graphql/typeDefs/shared/layer')
const orderTypedefs = require('../graphql/typeDefs/core/orders')
const boxingTypedefs = require('../graphql/typeDefs/production/boxing')
const boxingLogsDefs = require('../graphql/typeDefs/production/boxing-logs')

const typeDefs = [
  rootTypedefs.TYPES,
  rootTypedefs.INPUTS,
  pickUpTypedefs.PRIVATE_MUTATIONS,
  pickUpTypedefs.TYPES,
  pickUpTypedefs.INPUTS,
  productionTypedefs.PRIVATE_QUERIES,
  productionTypedefs.PRIVATE_MUTATIONS,
  productionTypedefs.INPUTS,
  productionTypedefs.TYPES,
  printableDesignTypedefs.TYPES,
  productTypedefs.TYPES,
  customProductTypedefs.TYPES,
  colorTypedefs.TYPES,
  itemTypedefs.TYPES,
  designTypedefs.TYPES,
  designConfigTypedefs.TYPES,
  userTypedefs.TYPES,
  ratingsTypedefs.TYPES,
  itemImageTypedefs.TYPES,
  itemConfigTypedefs.TYPES,
  layerTypedefs.TYPES,
  orderTypedefs.TYPES,
  boxingTypedefs.INPUTS,
  boxingTypedefs.PRIVATE_MUTATIONS,
  boxingTypedefs.PRIVATE_QUERIES,
  boxingTypedefs.TYPES,
  boxingLogsDefs.INPUTS,
  boxingLogsDefs.QUERY,
  boxingLogsDefs.TYPES,
]

/**
 * Load resolvers
 */
const resolvers = {}
const root = require('../graphql/resolvers/root')
const pickUp = require('../graphql/resolvers/production/pickUp')
const production = require('../graphql/resolvers/production/production')
const boxing = require('../graphql/resolvers/production/boxing')
const { CustomProduct } = require('../graphql/resolvers/core/customProducts')
const { Design } = require('../graphql/resolvers/core/designs')

/**
 * Recursively combine resolvers to single object
 */
merge(resolvers, root, pickUp, production, boxing, {
  CustomProduct,
  Design,
})

module.exports = {
  typeDefs,
  resolvers,
}
