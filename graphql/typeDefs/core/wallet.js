const { gql } = require('apollo-server-express')

const PUBLIC_QUERIES = gql`
  extend type Query {
    wallet: Wallet
  }
`

const PRIVATE_QUERIES = gql`
  extend type Query {
    merchantWallet: MerchantWallet
  }
`

const TYPES = gql`
  type Wallet {
    balance: Float
    user: User
  }

  type MerchantWallet {
    balance: Float
  }
`

module.exports = {
  PUBLIC_QUERIES,
  PRIVATE_QUERIES,
  TYPES,
}
