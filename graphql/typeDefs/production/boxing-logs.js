const { gql } = require('apollo-server-express')

const TYPES = gql`
  type BoxingLogs {
    bin_id: String
    action: String
    order_id: ID
    created_at: Date
    updated_at: Date
  }
`

const INPUTS = gql`
  input getBinLogsFromOrderRefNum {
    order_ref_no: String!
  }

  input addEntryToBoxingLogs {
    bin_id: String
    order_id: String
  }
`
const QUERY = gql`
  extend type Query {
    getBinLogsFromOrderRefNum(input: getBinLogsFromOrderRefNum): BoxingLogs
  }
`

// const MUTATIONS = gql`
//   extend type Mutation {
//     addEntryToBoxingLogs(input: addEntryToBoxingLogs): BoxingLogs
//   }
// `

module.exports = {
  TYPES,
  INPUTS,
  QUERY,
}
