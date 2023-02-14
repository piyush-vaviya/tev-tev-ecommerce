const { gql } = require('apollo-server-express')

const PUBLIC_QUERIES = gql`
  extend type Query {
    cart(user_id: ID): Cart
    shippingMethods(cart_id: ID): [ShippingMethod]
  }
`

const PUBLIC_MUTATIONS = gql`
  extend type Mutation {
    updateCart(input: ProductToCartInput): Cart
    addToCart(input: ProductToCartInput): Cart
    clearCart(input: ClearCartInput): Cart
    mergeCart(input: MergeCartInput): Cart
    clearProductsOnCart(user_id: ID): Boolean
    bulkAddToCart(input: BulkAddToCartInput): Cart
  }
`

const INPUTS = gql`
  input BulkAddToCartInput {
    user_id: ID
    cl_draft_id: ID
    size_quantity: [SizeQuantityInput]
    product_image: String
  }

  input SizeQuantityInput {
    size: String
    quantity: Int
  }

  input ClearCartInput {
    user_id: ID
    cart_id: ID
    cart_product_id: ID
  }

  input ProductToCartInput {
    user_id: ID
    product_id: ID
    custom_product_id: ID
    quantity: Int
    product_color: ID
    product_size: String
    product_image: String
  }

  input MergeCartInput {
    user_id: ID
    cart_items: [CartItemInput]
  }

  input CartItemInput {
    product_id: ID
    custom_product_id: ID
    quantity: Int
    product_color: ID
    product_size: String
    product_image: String
  }
`

const TYPES = gql`
  type Cart {
    id: ID
    user_id: ID
    products: [CartItem]
    sub_total: Float
    discount: Float
  }

  type CartItem {
    id: ID
    product: Product
    custom_product: CustomProduct
    quantity: Int
    product_color: Color
    product_size: String
    product_image: String
  }

  type ShippingMethod {
    header: String
    sub_header: String
    shipping_method: String
    shipping_fee: Float
  }
`
module.exports = {
  PUBLIC_QUERIES,
  PUBLIC_MUTATIONS,
  INPUTS,
  TYPES,
}
