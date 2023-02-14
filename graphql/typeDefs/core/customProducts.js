const { gql } = require('apollo-server-express')

const TYPES = gql`
  type CustomProduct {
    id: ID
    user: User
    item: Item
    color: Color
    design_config: [DesignConfig]
    item_config: [ItemConfig]
    price: Float
    image_url: String
    alt: String
    s3_keyname: String
    product_images: [CustomProductImage]
  }

  type CustomProductImage {
    image_url: String
    side: String
    color: ID
    alt: String
    s3_keyname: String
    order: Int
    index: Int
  }
`

module.exports = {
  TYPES,
}
