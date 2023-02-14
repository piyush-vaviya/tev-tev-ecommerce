const { gql } = require('apollo-server-express')

const PRIVATE_QUERIES = gql`
  extend type Query {
    bulkDiscountSettings(input: BulkDiscountSettingsInput): BulkDiscountSettings
  }
`

const PRIVATE_MUTATIONS = gql`
  extend type Mutation {
    createBulkDiscountSettings(input: CreateBulkDiscountSettings): BulkDiscountSetting
    updateBulkDiscountSettings(input: UpdateBulkDiscountSettings): BulkDiscountSetting
    deleteBulkDiscountSettings(input: DeleteBulkDiscountSettings): String
  }
`

const INPUTS = gql`
  input BulkDiscountSettingsInput{
    paginator: PaginatorInput
  }

  input CreateBulkDiscountSettings {
    min_quantity: Int
    discount_percentage: Float
  }

  input UpdateBulkDiscountSettings {
    id: ID
    min_quantity: Int
    discount_percentage: Float
  }

  input DeleteBulkDiscountSettings {
    id: ID
  }
`

const TYPES = gql`
  type BulkDiscountSettings implements Pagination {
    total_count: Int
    page_info: PageInfo
    edges: [BulkDiscountSetting]
  }

  type BulkDiscountSetting {
    id: ID
    min_quantity: Int
    discount_percentage: Float
  }
`

module.exports = {
  PRIVATE_QUERIES,
  PRIVATE_MUTATIONS,
  INPUTS,
  TYPES,
}
