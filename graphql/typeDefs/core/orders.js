const { gql } = require('apollo-server-express')

const PUBLIC_QUERIES = gql`
  extend type Query {
    order(input: FindOrder): OrderDetails
    orderHistory(input: OrderHistoryInput): Orders
  }
`

const PRIVATE_QUERIES = gql`
  extend type Query {
    ordersAll(paginator: PaginatorInput): Orders
    orderById(order_id: ID): OrderDetails
    ordersSearch(input: OrderSearchInput): Orders
  }
`

const PUBLIC_MUTATION = gql`
  extend type Mutation {
    checkout(input: CheckoutInput): String
  }
`

const PRIVATE_MUTATION = gql`
  extend type Mutation {
    updateOrderStatus(input: OrderRef): String
  }
`

const INPUTS = gql`
  input OrderRef {
    user_id: ID
    order_no: String
    update_type: String
  }

  input OrderHistoryInput {
    user_id: ID
    paginator: PaginatorInput
  }

  input CheckoutInput {
    user_id: ID
    order_details: OrderDetailsInput
    shipping_info: ShippingInfoInput
    billing_info: BillingInfoInput
    order_notes: String
    shipping_method: String
    coupon_code: String
    stripe_card_token: String
  }

  input OrderMetaData {
    order_no: String
    user_id: ID
  }

  input FindOrder {
    order_no: String
    user_id: ID
  }

  input OrderDetailsInput {
    products: [ProductInput]
  }

  input ProductInput {
    product_id: ID
    custom_product_id: ID
    quantity: Int
    product_color: ID
    product_size: String
    product_image: String
  }

  input ShippingInfoInput {
    first_name: String
    last_name: String
    street: String
    city: String
    state: String
    zipcode: String
  }

  input BillingInfoInput {
    first_name: String
    last_name: String
    street: String
    city: String
    state: String
    zipcode: String
  }

  input OrderSearchInput {
    term: String
    paginator: PaginatorInput
  }
`

const TYPES = gql`
  type Orders implements Pagination {
    total_count: Int
    page_info: PageInfo
    edges: [OrderDetails!]
  }

  type OrderDetails {
    id: ID
    user_id: ID
    user_name: String
    order_no: String
    order_details: ProductOrdered
    shipping_info: ShippingInfo
    billing_info: BillingInfo
    order_notes: String
    shipping_method: String
    coupon_code: String
    created_at: String
    updated_at: String
  }

  type ProductOrdered {
    products: [ProductDetails],
    order_status: String
    order_payment_stripe_reference: String
    payment_date: Date
    shipping_fee: Float,
    discount: Float
    sub_total: Float
    total: Float
  }

  type ProductDetails {
    product_id: ID
    product: Product
    custom_product_id: ID
    custom_product: CustomProduct
    item: Item
    printing_method: String
    quantity: Int
    total_amount_to_pay: Float
    price: Float
    order_item_no: String
    product_color: Color,
    product_size: String,
    product_sku: String
    product_name: String
    product_image: String
    order_item_no_barcode: String
    printable_design(order_id_sub: ID): PrintableDesign
  }

  type ShippingInfo {
    first_name: String
    last_name: String
    street: String
    city: String
    state: String
    zipcode: String
  }

  type BillingInfo {
    first_name: String
    last_name: String
    street: String
    city: String
    state: String
    zipcode: String
  }
`

module.exports = {
  PUBLIC_QUERIES,
  PRIVATE_QUERIES,
  PUBLIC_MUTATION,
  PRIVATE_MUTATION,
  INPUTS,
  TYPES,
}
