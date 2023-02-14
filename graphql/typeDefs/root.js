const { gql } = require('apollo-server-express')

const INPUTS = gql`
  input XYInput {
    x: Float
    y: Float
  }

  input PriceRangeInput {
    min: Float!
    max: Float!
  }

  input PaginatorInput {
    first: Int!
    page: Int!
    sort: SortInput
  }

  input SortInput {
    criteria: String
    order: Int
  }
`

const TYPES = gql`
  type Query {
    _empty: String
  }
  type Mutation {
    _empty: String
  }

  interface Pagination {
    total_count: Int
    page_info: PageInfo
  }

  scalar Date
  scalar JSON
  scalar JSONObject

  type Point {
    type: String
    coordinates: [Float]!
  }

  type XY {
    x: Float
    y: Float
  }

  type PageInfo {
    has_next_page: Boolean
  }

  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }
`

module.exports = {
  INPUTS,
  TYPES,
}
