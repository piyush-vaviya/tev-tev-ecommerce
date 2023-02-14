const { gql } = require('apollo-server-express')

module.exports.CREATE_PRODUCTIONS_FOR_ORDER = gql`
mutation CreateProductionsForOrder($input: CreateProductionsForOrderInput) {
  createProductionsForOrder(input: $input)
}
`
