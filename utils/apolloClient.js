const { execute, makePromise } = require('apollo-link')
const { HttpLink } = require('apollo-link-http')
const fetch = require('node-fetch')

const { request, gql } = require('graphql-request')

module.exports = async (uri, { query, variables = {} }) => {
  // const link = new HttpLink({ uri, fetch })

  // return makePromise(execute(link, {
  //   query,
  //   variables,
  //   operationName,
  //   context,
  //   extensions,
  // }))

  return request(uri, query, variables)
}
