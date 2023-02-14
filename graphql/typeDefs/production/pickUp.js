const { gql } = require('apollo-server-express')

const PRIVATE_MUTATIONS = gql`
  extend type Mutation {
    updatePrintBarcodeStatus(input: UpdatePrintBarcodeInput): PickUpBatch
    assignBatch(input: AssignBatchInput): PickUpBatch
    endBatch(input: EndBatchInput): PickUpBatch
  }
`

const INPUTS = gql`
  input AssignBatchInput {
    printing_method: String
    batch_type: String
    batch_size: Int
    user_id: ID
  }

  input UpdatePrintBarcodeInput {
    pickup_batch_id: ID
    sku: String
    production_id: ID
    status: String
  }

  input EndBatchInput {
    pickup_batch_id: ID
  }

  input GetCompletedPrintBarcode {
    paginator: PaginatorInput
    user_id: ID
  }
`

const TYPES = gql`
  type PickUpBatch {
    id: ID
    user: ID
    status: String
    printing_method: String
    items: [PickUp]
    created_at: Date
    updated_at: Date
  }
  
  type PickUp {
    sku: String
    total_quantity: Int
    pickup_image_url: String
    pickup_image_s3_keyname: String
    ids: [PrintBarcode]
  }

  type PrintBarcode {
    production_id: ID
    production_ref_no: String
    status: String
  }
`

module.exports = {
  PRIVATE_MUTATIONS,
  INPUTS,
  TYPES,
}
