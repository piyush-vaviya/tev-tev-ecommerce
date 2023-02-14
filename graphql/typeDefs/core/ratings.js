const { gql } = require('apollo-server-express')

const PUBLIC_QUERIES = gql`
  extend type Query {
    ratingsByProductId(id: ID!, paginator: PaginatorInput!): ProductRatings
    ratingsByItemId(id: ID!, paginator: PaginatorInput!): ItemRatings
  }
`

const PUBLIC_MUTATIONS = gql`
  extend type Mutation {
    rateProduct(input: ProductRatingInput!): ProductRating
    rateItem(input: ItemRatingInput!): ItemRating
  }
`

const INPUTS = gql`
  input ProductRatingInput {
    product_id: ID!
    image_urls: [String!]
    score: Float
    remarks: String
    status: String
  }

  input ItemRatingInput {
    item_id: ID!
    image_urls: [String!]
    score: Float
    remarks: String
    status: String
  }
`

const TYPES = gql`
  type ProductRatings implements Pagination {
    total_count: Int
    page_info: PageInfo
    edges: [ProductRating]!
  }

  type ItemRatings implements Pagination {
    total_count: Int
    page_info: PageInfo
    edges: [ItemRating]!
  }

  type ProductRating {
    id: ID
    remarks: String
    image_urls: [String!]
    score: Float
    status: String
    product: Product
    user: User
    created_at: Date
    updated_at: Date
  }

  type ItemRating {
    id: ID
    remarks: String
    image_urls: [String!]
    score: Float
    status: String
    item: Item
    user: User
    created_at: Date
    updated_at: Date
  }
`

module.exports = {
  PUBLIC_QUERIES,
  PUBLIC_MUTATIONS,
  INPUTS,
  TYPES,
}
