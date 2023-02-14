const { createTestClient } = require('apollo-server-testing')
const { gql } = require('apollo-server-express')

const { apollo, database } = require('../../app')

const mongo = require('../__mongoserver')

const CREATE_ITEM = gql`
  mutation($input: CreateItemInput!) {
    createItem(input: $input) {
      id
      item_name
      item_description
      item_regular_price
      item_special_price
      item_vendor
      item_country
      item_material
      item_categories
      item_colors
      item_sizes
      sku_prefix
      average_score
      total_reviews
    }
  }
`

const ITEM_CONSTANTS = require('../../constants/items')

describe('Items API', () => {
  const client = createTestClient(apollo)
  beforeAll(async () => {
    const URI = await mongo.connect()

    await database({
      host: URI,
    })
  })

  it('create a new item', async () => {
    const res = await client.mutate({
      query: CREATE_ITEM,
      variables: {
        input: {
          item_name: 'Men Premium T-shirt',
          item_description: 'A cotton tshirt for men',
          item_regular_price: 9.99,
          item_special_price: 9.99,
          sku_prefix: 'mpt',
          item_colors: ['blue', 'royalblue', 'white_n_green', 'forestgreen'],
          item_sizes: ITEM_CONSTANTS.SIZES,
          item_categories: ITEM_CONSTANTS.CATEGORIES,
        },
      },
    })

    expect(res).toMatchSnapshot()
  })
})
