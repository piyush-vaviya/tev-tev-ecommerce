const { gql } = require('apollo-server-express')

module.exports.ORDER_BY_ID = gql`
  query OrderById($orderId: ID) {
    orderById(order_id: $orderId) {
      id
      user_id
      user_name
      order_no
      order_details {
        products {
          product_id
          product {
            design_config {
              index
              side
              layers {
                id
                type
                text
                orig_width
                orig_height
                topleft_x
                topleft_y
                scale
                rotate
                order
                text_height
                width
                height
                design {
                  id
                }
              }
            }
          }
          custom_product_id
          custom_product {
            item_config {
              side
              ratio
              top {
                x
                y
              }
              left {
                x
                y
              }
            }
            design_config {
              index
              side
              layers {
                id
                type
                text
                orig_width
                orig_height
                topleft_x
                topleft_y
                scale
                rotate
                order
                text_height
                width
                height
                design {
                  id
                }
              }
            }
          }
          quantity
          unique_item_no
          product_color {
            id
            hex
          }
          product_size
          product_sku
          product_name
          product_image
          printing_method
          item {
            item_images {
              image_url
              s3_keyname
              side
              color
            }
            item_config {
              side
              ratio
              top {
                x
                y
              }
              left {
                x
                y
              }
            }
          }
        }
      }
    }
  }
`
