const { Seeder } = require("mongoose-data-seed");
const { Product } = require("../mongo/product")
const { Design } = require("../mongo/design")
const ITEMS = require('../constants/items')
const _ = require('lodash')

class DesignAndProductDesignSeeder extends Seeder {

  async shouldRun () {
    return Design.countDocuments({}) === 0
  }

  async run () {
    const designsData = [
      {
        design_name: "Every Butt Loves a Good Rub",
        design_price: 12.5,
        designer_id: 1,
        design_metadata: [
          {
            type: "image",
            image_url: `https://monarcsoft-marketplace-dev.s3.amazonaws.com/designs/every_butt_loves_a_good_rub.jpg`,
          }
        ],
      },
      {
        design_name: "I Sugar Coat Everything",
        design_price: 7.00,
        designer_id: 1,
        design_metadata: [
          {
            type: "image",
            image_url: `https://monarcsoft-marketplace-dev.s3.amazonaws.com/designs/i_sugar_coat_everything.jpg`,
          }
        ],
      },
      {
        design_name: "Mermaid",
        design_price: 8.00,
        designer_id: 1,
        design_metadata: [
          {
            type: "image",
            image_url: `https://monarcsoft-marketplace-dev.s3.amazonaws.com/designs/mermaid.jpg`,
          }
        ],
      },
      {
        design_name: "My Dad Knows Best",
        design_price: 9.99,
        designer_id: 1,
        design_metadata: [
          {
            type: "image",
            image_url: `https://monarcsoft-marketplace-dev.s3.amazonaws.com/designs/my_dad_knows_best.jpg`,
          }
        ],
      },
      {
        design_name: "Peace Love Tacos",
        design_price: 15.99,
        designer_id: 1,
        design_metadata: [
          {
            type: "image",
            image_url: `https://monarcsoft-marketplace-dev.s3.amazonaws.com/designs/peace_love_tacos.jpg`,
          }
        ],
      },
      {
        design_name: "Public Enemy",
        design_price: 13.99,
        designer_id: 1,
        design_metadata: [
          {
            type: "image",
            image_url: `https://monarcsoft-marketplace-dev.s3.amazonaws.com/designs/public_enemy.jpg`,
          }
        ],
      },
      {
        design_name: "Sorry I'm Late I didn't want to Come",
        design_price: 15.99,
        designer_id: 1,
        design_metadata: [
          {
            type: "image",
            image_url: `https://monarcsoft-marketplace-dev.s3.amazonaws.com/designs/sorry_im_late_i_didnt_want_to_come.jpg`,
          }
        ],
      },
      {
        design_name: "Tag Heuer",
        design_price: 5.99,
        designer_id: 1,
        design_metadata: [
          {
            type: "image",
            image_url: `https://monarcsoft-marketplace-dev.s3.amazonaws.com/designs/tag_heuer.jpg`,
          }
        ],
      },
      {
        design_name: "The Beat Goes On",
        design_price: 4.99,
        designer_id: 1,
        design_metadata: [
          {
            type: "image",
            image_url: `https://monarcsoft-marketplace-dev.s3.amazonaws.com/designs/the_best_goes_on.jpg`,
          }
        ],
      },
      {
        design_name: "This is the Way",
        design_price: 2.99,
        designer_id: 1,
        design_metadata: [
          {
            type: "image",
            image_url: `https://monarcsoft-marketplace-dev.s3.amazonaws.com/designs/this_is_the_way.jpg`,
          }
        ],
      },
      {
        design_name: "Yellowstone",
        design_price: 1.99,
        designer_id: 1,
        design_metadata: [
          {
            type: "image",
            image_url: `https://monarcsoft-marketplace-dev.s3.amazonaws.com/designs/yellowstone.jpg`,
          }
        ],
      },
    ]

    const designs = await Design.insertMany(designsData)

    const products = await Product.find()

    const productDesigns = products.map(p => {
      const design = designs.find(d => d.design_name === p.product_name)
      if (!design) return;

      const designPerSide = _.sampleSize(ITEMS.SIZES, _.random(2, ITEMS.SIZES.length))

      return {
        product: p.id,
        designs: designPerSide.map(side => ({
          design: design.id,
          side: side,
          upperleft_x: 0,
          upperleft_y: 0,
          design_width: 100,
          design_height: 100,
        }))
      }
    })
  }
}

module.exports = DesignAndProductDesignSeeder;
