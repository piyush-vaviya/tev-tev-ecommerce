const { gql } = require('apollo-server-express')

const INPUTS = gql`
  input getBinNumber {
    production_ref_no: String
  }
`

const PRIVATE_MUTATIONS = gql`
  extend type Mutation {
    getBinNumber(input: getBinNumber): Boxing
  }
`
const PRIVATE_QUERIES = gql`
  extend type Query {
    getBoxingDetails: [BoxingDetails]
  }
`

const TYPES = gql`
  type Boxing {
    bin_number: String
    status: String
  }
  type BoxingDetails {
    id: ID
    items: [ID]
    bin_id: String
    status: String
    order_id: ID
  }
`

module.exports = {
  TYPES,
  INPUTS,
  PRIVATE_MUTATIONS,
  PRIVATE_QUERIES,
}
