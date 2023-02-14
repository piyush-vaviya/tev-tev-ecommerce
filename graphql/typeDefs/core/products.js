const { gql } = require('apollo-server-express')

const PUBLIC_QUERIES = gql`
  extend type Query {
    product(id: ID): Product
    products(
      paginator: PaginatorInput
      filter: ProductFilterInput
      match: String
    ): Products
  }
`

const PRIVATE_QUERIES = gql`
  extend type Query {
    productsByDesign(
      design_id: ID
      is_sellable: Boolean
      paginator: PaginatorInput
    ): Products
  }
`

const PRIVATE_MUTATION = gql`
  extend type Mutation {
    createProduct(input: CreateProductInput): Product
    updateProduct(input: UpdateProductInput): Product
    deleteProduct(id: ID): ID
    updateFeaturedColorAndIsSellable(
      products: [UpdateFeaturedColorAndIsSellable]
    ): Boolean
  }
`

const INPUTS = gql`
  input CreateProductInput {
    product_name: String
    product_description: String
    product_regular_price: String
    product_special_price: String
    product_colors: [ID]
    product_sizes: [String]
    product_categories: [String]
    product_tags: [String]
    item: String
    design: String
  }

  input UpdateProductInput {
    id: ID
    product_name: String
    product_description: String
    product_regular_price: String
    product_special_price: String
    product_colors: [ID]
    product_sizes: [String]
    product_categories: [String]
    product_tags: [String]
    design_name: String
  }

  input UpdateFeaturedColorAndIsSellable {
    id: ID
    featured_color: ID
    is_sellable: Boolean
  }

  input ProductFilterInput {
    categories: [String]
    sizes: [String]
    colors: [ID]
    product_tags: [String]
    price: PriceRangeInput
    is_sellable: Boolean
  }
`

const TYPES = gql`
  type Products implements Pagination {
    total_count: Int
    page_info: PageInfo
    edges: [Product]!
  }

  type Product {
    id: ID
    product_name: String!
    product_description: String
    product_regular_price: String
    product_special_price: String
    product_colors: [ID]
    product_colors_with_hex: [Color]
    product_sizes: [String]
    product_categories: [String]
    product_images: [ProductImage]
    product_tags: [String]
    is_sellable: Boolean
    item: Item
    item_name: String
    design: Design
    design_config: [DesignConfig]
    mock_up_design_config: [DesignConfig]
    designer: User
    featured_color: ID
    featured_image: String
    s3_keyname_featured_image: String
    alt_featured_image: String
    allowed_printing_methods: [String]
    printing_method: String
    created_at: Date
    updated_at: Date
    #
    average_score: Float
    total_reviews: Int
    my_review: ProductRating

    wilson_score: Float
  }

  type ProductImage {
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
  PUBLIC_QUERIES,
  PRIVATE_QUERIES,
  PRIVATE_MUTATION,
  INPUTS,
  TYPES,
}
