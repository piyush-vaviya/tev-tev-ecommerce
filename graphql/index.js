const fs = require('fs')
const path = require('path')
const merge = require('lodash/merge')
const { GraphQLJSON, GraphQLJSONObject } = require('graphql-type-json')

const typeDefFiles = fs.readdirSync(path.join(__dirname, 'typeDefs'))
const typeDefs = typeDefFiles.map(file => require('./typeDefs/' + file))

const resolverFiles = fs.readdirSync(path.join(__dirname, 'resolvers'))
const resolvers = merge(...resolverFiles.map(file => require('./resolvers/' + file)), {
  JSON: GraphQLJSON,
  JSONObject: GraphQLJSONObject,
})

module.exports = { typeDefs, resolvers }
