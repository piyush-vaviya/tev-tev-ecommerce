const { gql } = require('apollo-server-express')

const PRIVATE_MUTATION = gql`
  extend type Mutation {
    updateDesignConfig(input: UpdateDesignConfigInput): Boolean
    updateMockUpDesignConfig(input: UpdateMockUpDesignConfigInput): Boolean
  }
`

const INPUTS = gql`
  input DesignConfigInput {
    index: Int
    side: String
    layers: [LayerInput!]
  }

  input UpdateDesignConfigInput {
    product_id: ID
    design_config: [DesignConfigInput!]
  }

  input UpdateMockUpDesignConfigInput {
    product_id: ID
    mock_up_design_config: [DesignConfigInput!]
  }
`

const TYPES = gql`
  type DesignConfig {
    index: Int
    side: String
    layers: [Layer]
  }
`

module.exports = {
  PRIVATE_MUTATION,
  INPUTS,
  TYPES,
}
