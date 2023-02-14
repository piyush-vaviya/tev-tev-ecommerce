const { gql } = require('apollo-server-express')

const PRIVATE_MUTATION = gql`
  extend type Mutation {
    uploadItemImage(input: UploadItemImageInput): ItemImage
    deleteItemImage(input: DeleteItemImageInput): Boolean
  }
`

const INPUTS = gql`
  input UploadItemImageInput {
    item_id: ID 
    color: ID
    side: String
    image: Upload
  }

  input DeleteItemImageInput {
    item_id: ID
    color: ID
    side: String
  }
`

const TYPES = gql`
  type ItemImage {
    image_url: String
    alt: String
    side: String
    color: ID
    s3_keyname: String
  }
`

module.exports = {
  PRIVATE_MUTATION,
  INPUTS,
  TYPES,
}
