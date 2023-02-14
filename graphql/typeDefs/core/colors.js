const { gql } = require('apollo-server-express')

const PUBLIC_QUERIES = gql`
  extend type Query {
    colors(paginator: PaginatorInput): Colors
  }
`

const PRIVATE_MUTATION = gql`
  extend type Mutation {
    createColor(input: CreateColorInput): Color
    updateColor(input: UpdateColorInput): Color
    deleteColor(input: DeleteColorInput): String
  }
`

const INPUTS = gql`
  input CreateColorInput {
    name: String
    hex: String
    image: Upload
  }

  input UpdateColorInput {
    id: ID
    name: String
    hex: String
    image: Upload
  }

  input DeleteColorInput {
    id: ID
  }
`

const TYPES = gql`
  type Colors implements Pagination {
    total_count: Int
    page_info: PageInfo
    edges: [Color]
  }

  type Color {
    id: ID
    name: String
    hex: String
    image_url: String
  }
`

module.exports = {
  PUBLIC_QUERIES,
  PRIVATE_MUTATION,
  INPUTS,
  TYPES,
}
