const merge = require('lodash/merge')

/**
 * Load the typedefs
 */

const typeDefs = [
  ...Object.values(require('../graphql/typeDefs/root')),
  ...Object.values(require('../graphql/typeDefs/core/auth')),
  ...Object.values(require('../graphql/typeDefs/core/carts')),
  ...Object.values(require('../graphql/typeDefs/core/cldraft')),
  ...Object.values(require('../graphql/typeDefs/core/colors')),
  ...Object.values(require('../graphql/typeDefs/core/customProducts')),
  ...Object.values(require('../graphql/typeDefs/core/designs')),
  ...Object.values(require('../graphql/typeDefs/core/fontColors')),
  ...Object.values(require('../graphql/typeDefs/core/fonts')),
  ...Object.values(require('../graphql/typeDefs/core/items')),
  ...Object.values(require('../graphql/typeDefs/core/orders')),
  ...Object.values(require('../graphql/typeDefs/core/printableDesigns')),
  ...Object.values(require('../graphql/typeDefs/core/products')),
  ...Object.values(require('../graphql/typeDefs/core/ratings')),
  ...Object.values(require('../graphql/typeDefs/core/s3')),
  ...Object.values(require('../graphql/typeDefs/core/skus')),
  ...Object.values(require('../graphql/typeDefs/core/users')),
  ...Object.values(require('../graphql/typeDefs/core/wallet')),
  ...Object.values(require('../graphql/typeDefs/core/bulkDiscountSettings')),
  ...Object.values(require('../graphql/typeDefs/shared/itemImage')),
  ...Object.values(require('../graphql/typeDefs/shared/itemConfig')),
  ...Object.values(require('../graphql/typeDefs/shared/designConfig')),
  ...Object.values(require('../graphql/typeDefs/shared/layer')),
]

/**
 * Load resolvers
 */
const resolvers = {}
const root = require('../graphql/resolvers/root')
const auth = require('../graphql/resolvers/core/auth')
const cart = require('../graphql/resolvers/core/carts')
const cldraft = require('../graphql/resolvers/core/cldraft')
const color = require('../graphql/resolvers/core/colors')
const customProduct = require('../graphql/resolvers/core/customProducts')
const design = require('../graphql/resolvers/core/designs')
const fontColor = require('../graphql/resolvers/core/fontColors')
const font = require('../graphql/resolvers/core/fonts')
const item = require('../graphql/resolvers/core/items')
const layer = require('../graphql/resolvers/core/layers')
const order = require('../graphql/resolvers/core/orders')
const printableDesign = require('../graphql/resolvers/core/printableDesigns')
const product = require('../graphql/resolvers/core/products')
const rating = require('../graphql/resolvers/core/ratings')
const s3 = require('../graphql/resolvers/core/s3')
const sku = require('../graphql/resolvers/core/skus')
const user = require('../graphql/resolvers/core/users')
const wallet = require('../graphql/resolvers/core/wallet')
const bulkDiscountSettings = require('../graphql/resolvers/core/bulkDiscountSettings')

/**
 * Recursively combine resolvers to single object
 */
merge(
  resolvers,
  root,
  auth,
  cart,
  cldraft,
  color,
  customProduct,
  design,
  fontColor,
  font,
  item,
  layer,
  order,
  printableDesign,
  product,
  rating,
  s3,
  sku,
  user,
  wallet,
  bulkDiscountSettings
)

module.exports = {
  typeDefs,
  resolvers,
}
