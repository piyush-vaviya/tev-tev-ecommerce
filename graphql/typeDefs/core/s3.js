const { gql } = require('apollo-server-express')

const PUBLIC_QUERIES = gql`
  extend type Query {
    getPresignedUrl(input: GetPresignedUrlInput!): String!
  }
`

const INPUTS = gql`
  input GetPresignedUrlInput {
    method: String!
    bucket: String!
    key: String!
    acl: String
    content_type: String
    content_disposition: String
    expires: Int
  }
`

module.exports = {
  PUBLIC_QUERIES,
  INPUTS,
}
