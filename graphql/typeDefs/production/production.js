const { gql } = require('apollo-server-express')

const PRIVATE_QUERIES = `
  extend type Query {
    getCompletedPrintBarcode(input: GetCompletedPrintBarcode): Productions
    findProductionByRefNum(input: FindProductionByRefNumInput): Production
    getProductionQueues(input: ProductionQueuesSearchInput): ProductionQueues
  }
`

const PRIVATE_MUTATIONS = gql`
  extend type Mutation {
    createProductionsForOrder(input: CreateProductionsForOrderInput): Boolean
    updateProductionStatus(input: UpdateProductionStatusInput): Production
  }
`

const INPUTS = gql`
  input CreateProductionsForOrderInput {
    order_id: ID
  }

  input FindProductionByRefNumInput {
    production_ref_no: String
  }

  input UpdateProductionStatusInput {
    production_ref_no: String
    status: String
  }

  input ProductionQueuesSearchInput {
    term: String
    paginator: PaginatorInput
    order: Int
  }
`

const TYPES = gql`
  type Production {
    id: ID
    product: Product
    custom_product: CustomProduct
    sku: String
    status: String
    printing_method: String
    pickup_image_url: String
    pickup_image_s3_keyname: String
    order_item_no: String
    production_ref_no: String
    printable_design: PrintableDesign
    product_color: Color
    product_size: String
    item_config: [ItemConfig]
    design_config: [DesignConfig]
    bin_number: String
    created_at: Date
    updated_at: Date
  }

  type ProductionQueues implements Pagination {
    total_count: Int
    page_info: PageInfo
    edges: [ProductOrderDetails]
  }

  type ProductOrderDetails {
    isFromCL: Boolean
    product_id: ID
    printing_method: String
    quantity: Int
    total_amount_to_pay: Float
    price: Float
    order_item_no: String
    product_size: String
    product_sku: String
    product_name: String
    product_image: String
    order_item_no_barcode: String
    printable_design(order_id_sub: ID): PrintableDesign
    production_details: ProductionDetails
    product_color: Color
    custom_product: CustomProduct
  }

  type ProductionDetails {
    production_id: ID
    status: String
    pickup_image_url: String
    pickup_image_s3_keyname: String
    production_ref_no: String
    created_at: Date
    updated_at: Date
  }

  type Productions implements Pagination {
    total_count: Int
    page_info: PageInfo
    edges: [Production]!
  }
`

module.exports = {
  PRIVATE_QUERIES,
  PRIVATE_MUTATIONS,
  INPUTS,
  TYPES,
}
