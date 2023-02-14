const { gql } = require('apollo-server-express')

const PUBLIC_QUERIES = gql`
  extend type Query {
    designs(paginator: PaginatorInput!, filter: DesignsFilterInput, match: String, owned: Boolean): Designs
    design(id: ID!): Design
  }
`

const PRIVATE_MUTATION = gql`
  extend type Mutation {
    uploadDesign(input: UploadDesignInput!): Design
    updateDesign(input: UpdateDesignInput!): Design
    uploadUserDesign(input: UploadUserDesignInput!): String
    deleteDesign(id: ID): Boolean
    recreateProductImages(design_id: String): Boolean
  }
`

const INPUTS = gql`
  input UploadUserDesignInput {
    image: Upload
    userId: String
  }

  input UploadDesignInput {
    image: Upload
    design_name: String
    design_description: String
    design_price: String
    is_free: Boolean
    design_tags: [String]
    printing_methods: [String]
    design_dimension: DimensionInput
  }

  input DimensionInput {
    width: Int
    height: Int
  }

  input UpdateDesignInput {
    id: ID
    design_name: String
    design_description: String
    design_price: String
    is_free: Boolean
    design_tags: [String]
    printing_methods: [String]
  }

  input DesignsFilterInput {
    printing_methods: [String]
  }
`

const TYPES = gql`
  type Designs implements Pagination {
    total_count: Int
    page_info: PageInfo
    edges: [Design]!
  }

  type Design {
    id: ID
    design_name: String
    design_description: String
    design_price: String
    is_free: Boolean
    user: User
    user_fullname: String
    design_tags: [String]
    design_image_url: String
    alt: String
    s3_keyname: String
    design_colors: [DesignColor]
    design_dimension: Dimension
    printing_methods: [String]
    created_at: Date
    updated_at: Date
  }

  type Dimension {
    width: Int
    height: Int
  }

  type DesignColor {
    image_url: String
    color: String
    alt: String
    s3_keyname: String
  }
`

module.exports = {
  PUBLIC_QUERIES,
  PRIVATE_MUTATION,
  INPUTS,
  TYPES,
}
