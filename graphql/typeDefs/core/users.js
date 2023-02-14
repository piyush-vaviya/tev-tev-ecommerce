const { gql } = require('apollo-server-express')

const PRIVATE_QUERIES = gql`
  extend type Query {
    users(paginator: PaginatorInput): Users
    user(id: ID!): User
  }
`

const PUBLIC_MUTATIONS = gql`
  extend type Mutation {
    generatePreRegisterUserId: ID!
  }
`

const PRIVATE_MUTATIONS = gql`
  extend type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): String!
    
  }
`

const INPUTS = gql`
  input CreateUserInput {
    first_name: String!
    last_name: String!
    gender: String
    date_of_birth: String
  }

  input UpdateUserInput {
    first_name: String!
    last_name: String!
    gender: String
    date_of_birth: String
  }
`

const TYPES = gql`
  type Users implements Pagination {
    total_count: Int
    page_info: PageInfo
    edges: [User]!
  }

  type User {
    id: ID
    email: String
    first_name: String
    last_name: String
    gender: String
    date_of_birth: String
    is_verified: Boolean
    shipping_info: ShippingInfo
    billing_info: BillingInfo
    roles: [String!]
    created_at: Date
    updated_at: Date
  }
`

module.exports = {
  PRIVATE_QUERIES,
  PUBLIC_MUTATIONS,
  PRIVATE_MUTATIONS,
  INPUTS,
  TYPES,
}
