const merge = require('lodash/merge')

/**
 * Load the typedefs
 */
const colorsTypedefs = require('../graphql/typeDefs/core/colors')
const designsTypedefs = require('../graphql/typeDefs/core/designs')
const fontColorsTypedefs = require('../graphql/typeDefs/core/fontColors')
const fontTypedefs = require('../graphql/typeDefs/core/fonts')
const itemTypedefs = require('../graphql/typeDefs/core/items')
const orderTypedefs = require('../graphql/typeDefs/core/orders')
const printableDesignTypedefs = require('../graphql/typeDefs/core/printableDesigns')
const productTypedefs = require('../graphql/typeDefs/core/products')
const skuTypedefs = require('../graphql/typeDefs/core/skus')
const userTypedefs = require('../graphql/typeDefs/core/users')
const walletTypedefs = require('../graphql/typeDefs/core/wallet')
const itemImageTypedefs = require('../graphql/typeDefs/shared/itemImage')
const itemConfigTypedefs = require('../graphql/typeDefs/shared/itemConfig')
const designConfigTypedefs = require('../graphql/typeDefs/shared/designConfig')
const layerTypedefs = require('../graphql/typeDefs/shared/layer')

const typeDefs = [
  ...Object.values(require('../graphql/typeDefs/root')),
  ...Object.values(require('../graphql/typeDefs/core/auth')),
  ...Object.values(require('../graphql/typeDefs/core/carts')),
  ...Object.values(require('../graphql/typeDefs/core/cldraft')),
  ...Object.values(require('../graphql/typeDefs/core/customProducts')),
  ...Object.values(require('../graphql/typeDefs/core/ratings')),
  ...Object.values(require('../graphql/typeDefs/core/s3')),
  colorsTypedefs.PUBLIC_QUERIES, colorsTypedefs.TYPES,
  designsTypedefs.PUBLIC_QUERIES, designsTypedefs.TYPES, designsTypedefs.INPUTS,
  fontColorsTypedefs.PUBLIC_QUERIES, fontColorsTypedefs.TYPES,
  fontTypedefs.PUBLIC_QUERIES, fontTypedefs.TYPES,
  itemTypedefs.PUBLIC_QUERIES, itemTypedefs.INPUTS, itemTypedefs.TYPES,
  orderTypedefs.PUBLIC_QUERIES, orderTypedefs.PUBLIC_MUTATION, orderTypedefs.INPUTS, orderTypedefs.TYPES,
  printableDesignTypedefs.TYPES,
  productTypedefs.PUBLIC_QUERIES, productTypedefs.INPUTS, productTypedefs.TYPES,
  skuTypedefs.TYPES,
  userTypedefs.PUBLIC_MUTATIONS, userTypedefs.TYPES,
  walletTypedefs.PUBLIC_QUERIES, walletTypedefs.TYPES,
  itemImageTypedefs.TYPES,
  itemConfigTypedefs.TYPES, itemConfigTypedefs.INPUTS,
  designConfigTypedefs.TYPES,
  layerTypedefs.TYPES,
]

/**
 * Load resolvers
 */

// Load ALL
const resolvers = {}
const root = require('../graphql/resolvers/root')
const auth = require('../graphql/resolvers/core/auth')
const cart = require('../graphql/resolvers/core/carts')
const cldraft = require('../graphql/resolvers/core/cldraft')
const customProduct = require('../graphql/resolvers/core/customProducts')
const s3 = require('../graphql/resolvers/core/s3')
const rating = require('../graphql/resolvers/core/ratings')

// Load selected resolvers
const { Query: { colors }, Color } = require('../graphql/resolvers/core/colors')
const { Query: { designs, design }, Design } = require('../graphql/resolvers/core/designs')
const { Query: { fontColors } } = require('../graphql/resolvers/core/fontColors')
const { Query: { fonts } } = require('../graphql/resolvers/core/fonts')
const { Query: { items, item }, Item } = require('../graphql/resolvers/core/items')
const { Query: { order, orderHistory }, Mutation: { checkout }, Orders, ProductDetails } = require('../graphql/resolvers/core/orders')
const { Query: { products, product }, Product } = require('../graphql/resolvers/core/products')
const { Mutation: { generatePreRegisterUserId } } = require('../graphql/resolvers/core/users')
const { Query: { wallet }, Wallet } = require('../graphql/resolvers/core/wallet')

// Load types only
const { Layer } = require('../graphql/resolvers/core/layers')
const { Sku } = require('../graphql/resolvers/core/skus')

/**
 * Recursively combine resolvers to single object
 */
merge(
  resolvers,
  root,
  auth,
  cart,
  cldraft,
  customProduct,
  rating,
  s3,
  //
  {
    Query: {
      colors,
      designs,
      design,
      fontColors,
      fonts,
      items,
      item,
      order,
      orderHistory,
      products,
      product,
      wallet,
    },
    Mutation: {
      checkout,
      generatePreRegisterUserId,
    },
  },
  {
    Color,
    Design,
    Item,
    Orders,
    ProductDetails,
    Product,
    Wallet,
    Layer,
    Sku,
  },
)

module.exports = {
  typeDefs,
  resolvers,
}
