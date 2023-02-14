const { gql } = require('apollo-server-express')

const PRIVATE_QUERIES = gql`
  extend type Query {
    printableDesigns(order_id: String): [PrintableDesign]
  }
`

const PRIVATE_MUTATIONS = gql`
  extend type Mutation {
    recreatePrintableDesigns(order_id: String): Boolean
  }
`

const TYPES = gql`
  type PrintableDesign {
    id: ID
    order_id: String
    order_item_no: String
    color: String
    sku: String
    images: [PrintableDesignPerSide]
    created_at: Date
    updated_at: Date
  }

  type PrintableDesignPerSide {
    side: String
    index: Int
    image_url: String
    s3_keyname: String
    ratio: String
  }
`

module.exports = {
  PRIVATE_QUERIES,
  PRIVATE_MUTATIONS,
  TYPES,
}
