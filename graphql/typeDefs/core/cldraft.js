const { gql } = require('apollo-server-express')

const PUBLIC_QUERIES = gql`
  extend type Query {
    findDraft(userId: ID): LayersState
  }
`

const PUBLIC_MUTATIONS = gql`
  extend type Mutation {
    saveToDraft(input: LayersStateInput!): LayersState
  }
`

const INPUTS = gql`
  input LayersStateInput {
    user_id: ID
    color: ID
    item: ID
    printing_method: String
    item_configs: [ItemConfigInput]
    layers: [LayersInput]
  }

  input LayersInput {
    center: CenterInput
    color: ID
    coordinates: XYInput
    font_color: String
    font_family: String
    font: ID
    font_italic: Boolean
    font_weight: Boolean
    height: Float
    image_url: String
    item_config: ItemConfigInput
    item_images: [ItemImagesInput]
    design: DesignInput
    offset: XYInput
    order: Int
    rotate: Float
    s3_keyname: String
    scale: Float
    side: String
    text: String
    topleft_x: Float
    topleft_y: Float
    type: String
    width: Float
    text_align: String
    text_height: Float
  }

  input DesignInput {
    design_dimension: DesignDimension
    design_image_url: String
    design_name: String
    design_price: String
    design_tags: [String]
    id: ID
    s3_keyname: String
  }

  input DesignDimension {
    width: Int
    height: Int
  }

  input CenterInput {
    coordinates: XYInput
    x: Float
    y: Float
  }

  input ItemImagesInput {
    color: ID
    image_url: String
    s3_keyname: String
    side: String
  }

  input RefInput {
    current: String
  }
`

const TYPES = gql`
  type LayersState {
    id: ID
    user_id: ID
    color: ID
    item: ID
    item_configs: [ItemConfig]
    layers: [DraftLayer]
  }

  type DraftLayer {
    center: Center
    color: ID
    coordinates: XY
    font: ID
    font_color: String
    font_family: String
    font_id: ID
    font_italic: Boolean
    font_weight: Boolean
    height: Float
    image_url: String
    item_config: ItemConfig
    item_images: [ItemImages]
    design: Design
    offset: XY
    order: Int
    rotate: Float
    s3_keyname: String
    scale: Float
    side: String
    text: String
    topleft_x: Float
    topleft_y: Float
    type: String
    width: Float
    text_align: String
    text_height: Float
  }

  type Center {
    coordinates: XY
    x: Float
    y: Float
  }

  type ItemImages {
    color: ID
    image_url: String
    s3_keyname: String
    side: String
  }
`

module.exports = {
  PUBLIC_QUERIES,
  PUBLIC_MUTATIONS,
  INPUTS,
  TYPES,
}
