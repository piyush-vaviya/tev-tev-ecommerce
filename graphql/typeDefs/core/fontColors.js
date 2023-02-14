const { gql } = require('apollo-server-express')

const PUBLIC_QUERIES = gql`
  extend type Query {
    fontColors(paginator: PaginatorInput): Colors
  }
`

const PRIVATE_MUTATION = gql`
  extend type Mutation {
    createFontColor(input: CreateFontColorInput!): Color!
    updateFontColor(input: UpdateFontColorInput!): Color!
    deleteFontColor(id: ID!): String
  }
`

const INPUTS = gql`
  input CreateFontColorInput {
    name: String
    hex: String
  }

  input UpdateFontColorInput {
    id: ID
    name: String
    hex: String
  }
`

const TYPES = gql`
  type FontColors implements Pagination {
    total_count: Int
    page_info: PageInfo
    edges: [FontColor]!
  }

  type FontColor {
    id: ID
    name: String
    hex: String
  }
`

module.exports = {
  PUBLIC_QUERIES,
  PRIVATE_MUTATION,
  INPUTS,
  TYPES,
}
