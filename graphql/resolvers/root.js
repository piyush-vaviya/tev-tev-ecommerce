const { GraphQLScalarType } = require('graphql')
const { Kind } = require('graphql/language')

module.exports = {
  Pagination: {
    __resolveType () {
      return null
    },
  },
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue (value) {
      return new Date(value) // value from the client
    },
    serialize (value) {
      if (value instanceof Date) {
        return value.getTime() // value sent to the client
      } else {
        return value
      }
    },
    parseLiteral (ast) {
      try {
        return new Date(ast.value) // ast value is always in string format
      } catch (err) {
        return null
      }
    },
  }),
}
