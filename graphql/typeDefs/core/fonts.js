const { gql } = require('apollo-server-express')

const PUBLIC_QUERIES = gql`
  extend type Query {
    fonts(paginator: PaginatorInput): Fonts
  }
`

const TYPES = gql`
  type Fonts implements Pagination {
    total_count: Int
    page_info: PageInfo
    edges: [Font]!
  }

  type Font {
    id: ID
    font_name: String
    file_name: String
    created_at: Date
    updated_at: Date
  }
`

module.exports = {
  PUBLIC_QUERIES,
  TYPES,
}
