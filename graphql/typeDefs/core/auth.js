const { gql } = require('apollo-server-express')

const PUBLIC_QUERIES = gql`
  extend type Query {
    me: User
    checkResetToken(input: CheckResetTokenInput!): Boolean
  }
`

const PUBLIC_MUTATIONS = gql`
  extend type Mutation {
    login(input: LoginInput!): Credentials
    register(input: RegisterInput!): Credentials
    me(input: MeInput!): User
    verifyRegistration(input: VerifyRegistrationInput!): Boolean
    resendVerification(input: ResendVerificationInput!): Boolean
    forgotPassword(email: String!): Boolean
    resetPassword(input: ResetPasswordInput!): Credentials
    changePassword(input: ChangePasswordInput!): Boolean
    test: String
  }
`

const INPUTS = gql`
  input MeInput {
    first_name: String
    last_name: String
    gender: String
    date_of_birth: Date
    shipping_info: ShippingInfoInput
    billing_info: BillingInfoInput
  }

  input LoginInput {
    username: String!
    password: String!
  }

  input RegisterInput {
    id: String!
    first_name: String!
    last_name: String!
    email: String!
    password: String!
  }

  input ResetPasswordInput {
    reset_token: String!
    password: String!
    confirm_password: String!
  }

  input ChangePasswordInput {
    password: String!
    confirm_password: String!
  }

  input CheckResetTokenInput {
    reset_token: String
  }

  input CheckVerificationTokenInput {
    verification_token: String
  }

  input VerifyRegistrationInput {
    verification_token: String
  }

  input ResendVerificationInput {
    verification_token: String
  }
`

const TYPES = gql`
  type Credentials {
    token: String!
    me: User!
  }
`
module.exports = {
  PUBLIC_QUERIES,
  PUBLIC_MUTATIONS,
  INPUTS,
  TYPES,
}
