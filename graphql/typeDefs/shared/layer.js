const { gql } = require('apollo-server-express')

const INPUTS = gql`
  input LayerInput {
    type: String
    design: ID
    orig_width: Float
    orig_height: Float
    topleft_x: Float
    topleft_y: Float
    scale: Float
    rotate: Float
    order: Int
    text_height: Float
    width: Float
    height: Float
  }
`

const TYPES = gql`
  type Layer {
    id: ID
    type: String
    design: Design
    text: String
    orig_width: Float
    orig_height: Float
    topleft_x: Float
    topleft_y: Float
    scale: Float
    rotate: Float
    order: Int
    text_height: Float
    width: Float
    height: Float
  }
`

module.exports = {
  INPUTS,
  TYPES,
}
