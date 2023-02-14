const { gql } = require('apollo-server-express')

const PRIVATE_QUERIES = gql`
  extend type Query {
    skus(paginator: PaginatorInput!, filter: SkuFilterInput, match: String): Skus
    sku: Sku!
  }
`
const INPUTS = gql`
  input SkuFilterInput {
    items: [ID]
    sizes: [String]
    colors: [String]
  }
`

const TYPES = gql`
  type Skus implements Pagination {
    total_count: Int
    page_info: PageInfo
    edges: [Sku]!
  }

  type Sku {
    id: ID
    sku: String
    item: ID
    color: String
    size: String
    quantity: Int
    barcode: String
    created_at: Date
    updated_at: Date
  }
`

module.exports = {
  PRIVATE_QUERIES,
  INPUTS,
  TYPES,
}
