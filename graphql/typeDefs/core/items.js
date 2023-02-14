const { gql } = require('apollo-server-express')

const PUBLIC_QUERIES = gql`
  extend type Query {
    items(paginator: PaginatorInput, filter: ItemFilterInput, match: String): Items
    item(id: ID): Item
  }
`

const PRIVATE_MUTATION = gql`
  extend type Mutation {
    createItem(input: CreateItemInput): Item
    updateItem(input: UpdateItemInput): Item
    deleteItem(id: ID): ID
    updateItemStatus(input: UpdateItemStatusInput): Item
    publishItem(input: PublishItemInput): Item
    unpublishItem(input: PublishItemInput): Item
    #
    uploadSizingImage(input: UploadSizingImage): SizingImage
    #
    uploadMockUpImage(input: UploadMockUpImageInput): MockUpImage
    deleteMockUpImage(input: DeleteMockUpImageInput): Boolean
  }
`

const INPUTS = gql`
  input CreateItemInput {
    item_name: String
    item_description: String
    item_status: String
    item_regular_price: String
    item_special_price: String
    item_vendor: String
    item_country: String
    item_material: String
    item_categories: [String]
    item_colors: [ID!]
    item_sizes: [String]
    item_sides: [String]
    sizing: JSONObject
    care_instructions: String
    sku_prefix: String
    featured_color: ID
    printing_methods: [String]
    image: Upload
    item_config: [ItemConfigInput]
    mock_up_item_config: [MockUpItemConfigInput]
    mock_up_indexes: [Int]
  }

  input UpdateItemInput {
    id: ID
    item_name: String
    item_description: String
    item_status: String
    item_regular_price: String
    item_special_price: String
    item_vendor: String
    item_country: String
    item_material: String
    item_categories: [String]
    item_colors: [ID]
    item_sizes: [String]
    item_sides: [String]
    sizing: JSONObject
    care_instructions: String
    featured_color: ID
    printing_methods: [String]
    image: Upload
    item_config: [ItemConfigInput]
    mock_up_item_config: [MockUpItemConfigInput]
    mock_up_indexes: [Int]
  }

  input SizeChartInput {
    size: String
    a: Float
    b: Float
    c: Float
    d: Float
  }

  input ItemFilterInput {
    categories: [String]
    sizes: [String]
    colors: [ID]
    price: PriceRangeInput
    item_status: [String]
  }

  input UpdateItemStatusInput {
    id: ID
    item_status: String
  }

  input UploadSizingImage {
    item_id: ID
    image: Upload
  }

  input PublishItemInput {
    item_id: ID
  }

  input UploadMockUpImageInput {
    item_id: ID
    image: Upload
    color: ID
    index: Int
  }

  input DeleteMockUpImageInput {
    item_id: ID
    color: ID
    index: Int
  }
`

const TYPES = gql`
  type Items implements Pagination {
    total_count: Int
    page_info: PageInfo
    edges: [Item]
  }

  type Item {
    id: ID
    item_name: String
    item_description: String
    item_status: String
    item_regular_price: String
    item_special_price: String
    item_vendor: String
    item_country: String
    item_material: String
    item_categories: [String]
    item_colors: [ID]
    item_colors_with_hex: [Color]
    item_sizes: [String]
    item_sides: [String]
    item_images: [ItemImage]
    mock_up_images: [MockUpImage]
    item_config: [ItemConfig]
    mock_up_item_config: [MockUpItemConfig]
    mock_up_indexes: [Int]
    sizing: JSONObject
    sizing_image: SizingImage
    care_instructions: String
    sku_prefix: String
    featured_color: ID
    printing_methods: [String]
    created_at: Date
    updated_at: Date

    average_score: Float
    total_reviews: Int
  }

  type SizingImage {
    image_url: String
    s3_keyname: String
    alt: String
  }

  type MockUpImage {
    image_url: String
    s3_keyname: String
    alt: String
    index: Int
    color: String
  }
`

module.exports = {
  PUBLIC_QUERIES,
  PRIVATE_MUTATION,
  INPUTS,
  TYPES,
}
