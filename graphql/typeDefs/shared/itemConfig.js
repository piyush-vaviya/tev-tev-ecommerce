const { gql } = require('apollo-server-express')

const PRIVATE_MUTATION = gql`
  extend type Mutation {
    updateItemConfig(input: UpdateItemConfigInput): [ItemConfig]
    deleteItemConfig(input: DeleteItemConfigInput): Boolean
  }
`
const INPUTS = gql`
  input ItemConfigInput {
    side: String
    top: XYInput
    left: XYInput
    ratio: String
  }

  input MockUpItemConfigInput {
    index: Int
    top: XYInput
    left: XYInput
    ratio: String
  }

  input UpdateItemConfigInput {
    item_id: ID
    item_config: [ItemConfigInput]
  }

  input DeleteItemConfigInput {
    item_id: ID
    side: String
  }
`

const TYPES = gql`
  type ItemConfig {
    index: Int
    side: String
    top: XY
    left: XY
    ratio: String
  }

  type MockUpItemConfig {
    index: Int
    top: XY
    left: XY
    ratio: String
  }
`

module.exports = {
  PRIVATE_MUTATION,
  INPUTS,
  TYPES,
}
