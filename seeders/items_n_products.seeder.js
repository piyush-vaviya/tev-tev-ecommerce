const { Seeder } = require("mongoose-data-seed");
const { Product } = require("../mongo/product")
const { Item } = require("../mongo/item")
const { Color } = require("../mongo/color");
const _ = require("lodash")
const faker = require("faker")

const PRODUCTS = require('../constants/products')
const ITEMS = require('../constants/items')


class ItemsAndProductsSeeder extends Seeder {

  async shouldRun () {
    return Item.countDocuments({}) === 0
  }

  async run () {
    const colorDocs = await Color.find()
    const colors = colorDocs.map(c => c.name)

    const items = [
      {
        item_image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/bpb/1/main.jpg',
        item_name: "Adjustable Apron",
        item_description: faker.lorem.sentences(),
        item_price: _.random(0.1, 50.0),
        item_colors: _.sampleSize(colors, _.random(1, 5)),
        item_sizes: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        item_categories: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)],
      },
      {
        item_image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/bpb/2/main.jpg',
        item_name: "Baseball T-Shirt",
        item_description: faker.lorem.sentences(),
        item_price: _.random(0.1, 50.0),
        item_colors: _.sampleSize(colors, _.random(1, 5)),
        item_sizes: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        item_categories: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)]
      },
      {
        item_image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/bpb/3/main.jpg',
        item_name: "Canvas Backpack",
        item_description: faker.lorem.sentences(),
        item_price: _.random(0.1, 50.0),
        item_colors: _.sampleSize(colors, _.random(1, 5)),
        item_sizes: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        item_categories: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)]
      },
      {
        item_image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/bpb/4/main.jpg',
        item_name: "Computer Backpack",
        item_description: faker.lorem.sentences(),
        item_price: _.random(0.1, 50.0),
        item_colors: _.sampleSize(colors, _.random(1, 5)),
        item_sizes: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        item_categories: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)]
      },
      {
        item_image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/bpb/5/main.jpg',
        item_name: "Full Color Mug",
        item_description: faker.lorem.sentences(),
        item_price: _.random(0.1, 50.0),
        item_colors: _.sampleSize(colors, _.random(1, 5)),
        item_sizes: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        item_categories: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)]
      },
      {
        item_image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/bpb/6/main.jpg',
        item_name: "iPhone XXS Case",
        item_description: faker.lorem.sentences(),
        item_price: _.random(0.1, 50.0),
        item_colors: _.sampleSize(colors, _.random(1, 5)),
        item_sizes: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        item_categories: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)]
      },
      {
        item_image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/bpb/7/main.jpg',
        item_name: "Kid's Vintage Sport T-Shirt",
        item_description: faker.lorem.sentences(),
        item_price: _.random(0.1, 50.0),
        item_colors: _.sampleSize(colors, _.random(1, 5)),
        item_sizes: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        item_categories: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)]
      },
      {
        item_image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/bpb/8/main.jpg',
        item_name: "Kid's Premium Hoodie",
        item_description: faker.lorem.sentences(),
        item_price: _.random(0.1, 50.0),
        item_colors: _.sampleSize(colors, _.random(1, 5)),
        item_sizes: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        item_categories: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)]
      },
      {
        item_image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/bpb/9/main.jpg',
        item_name: "Men's Moisture Wicking Performance T-Shirt",
        item_description: faker.lorem.sentences(),
        item_price: _.random(0.1, 50.0),
        item_colors: _.sampleSize(colors, _.random(1, 5)),
        item_sizes: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        item_categories: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)]
      },
      {
        item_image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/bpb/10/main.jpg',
        item_name: "Men's Premium T-shirt",
        item_description: faker.lorem.sentences(),
        item_price: _.random(0.1, 50.0),
        item_colors: _.sampleSize(colors, _.random(1, 5)),
        item_sizes: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        item_categories: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)]
      },
      {
        item_image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/bpb/11/main.jpg',
        item_name: "Men's Ringer T-Shirt",
        item_description: faker.lorem.sentences(),
        item_price: _.random(0.1, 50.0),
        item_colors: _.sampleSize(colors, _.random(1, 5)),
        item_sizes: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        item_categories: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)]
      },
      {
        item_image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/bpb/12/main.jpg',
        item_name: "Snap-back Baseball Cap",
        item_description: faker.lorem.sentences(),
        item_price: _.random(0.1, 50.0),
        item_colors: _.sampleSize(colors, _.random(1, 5)),
        item_sizes: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        item_categories: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)]
      },
      {
        item_image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/bpb/13/main.jpg',
        item_name: "Unisex Camouflage T-Shirt",
        item_description: faker.lorem.sentences(),
        item_price: _.random(0.1, 50.0),
        item_colors: _.sampleSize(colors, _.random(1, 5)),
        item_sizes: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        item_categories: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)]
      },
      {
        item_image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/bpb/14/main.jpg',
        item_name: "Unisex Lightweight Terry Hoodie",
        item_description: faker.lorem.sentences(),
        item_price: _.random(0.1, 50.0),
        item_colors: _.sampleSize(colors, _.random(1, 5)),
        item_sizes: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        item_categories: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)]
      },
      {
        item_image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/bpb/15/main.jpg',
        item_name: "Unisex Tri-Blend T-Shirt",
        item_description: faker.lorem.sentences(),
        item_price: _.random(0.1, 50.0),
        item_colors: _.sampleSize(colors, _.random(1, 5)),
        item_sizes: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        item_categories: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)]
      },
      {
        item_image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/bpb/16/main.jpg',
        item_name: "Women’s Flowy T-Shirt",
        item_description: faker.lorem.sentences(),
        item_price: _.random(0.1, 50.0),
        item_colors: _.sampleSize(colors, _.random(1, 5)),
        item_sizes: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        item_categories: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)]
      },
      {
        item_image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/bpb/17/main.jpg',
        item_name: "Women's Cropped Hoodie",
        item_description: faker.lorem.sentences(),
        item_price: _.random(0.1, 50.0),
        item_colors: _.sampleSize(colors, _.random(1, 5)),
        item_sizes: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        item_categories: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)]
      },
      {
        item_image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/bpb/18/main.jpg',
        item_name: "Women's Cropped T-Shirt",
        item_description: faker.lorem.sentences(),
        item_price: _.random(0.1, 50.0),
        item_colors: _.sampleSize(colors, _.random(1, 5)),
        item_sizes: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        item_categories: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)]
      },
      {
        item_image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/bpb/19/main.jpg',
        item_name: "Women's Longer Length Fitted Tank",
        item_description: faker.lorem.sentences(),
        item_price: _.random(0.1, 50.0),
        item_colors: _.sampleSize(colors, _.random(1, 5)),
        item_sizes: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        item_categories: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)]
      },
      {
        item_image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/bpb/20/main.jpg',
        item_name: "Women's T-Shirt Dress",
        item_description: faker.lorem.sentences(),
        item_price: _.random(0.1, 50.0),
        item_colors: _.sampleSize(colors, _.random(1, 5)),
        item_sizes: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        item_categories: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)]
      },
      {
        item_image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/bpb/21/main.jpg',
        item_name: "Women's V-Neck T-Shirt",
        item_description: faker.lorem.sentences(),
        item_price: _.random(0.1, 50.0),
        item_colors: _.sampleSize(colors, _.random(1, 5)),
        item_sizes: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        item_categories: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)]
      },
      {
        item_image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/bpb/22/main.jpg',
        item_name: "Kid's T-Shirt",
        item_description: faker.lorem.sentences(),
        item_price: _.random(0.1, 50.0),
        item_colors: _.sampleSize(colors, _.random(1, 5)),
        item_sizes: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        item_categories: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)]
      },
      {
        item_image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/bpb/23/main.jpg',
        item_name: "Men's Premium Long Sleeve T-shirt",
        item_description: faker.lorem.sentences(),
        item_price: _.random(0.1, 50.0),
        item_colors: _.sampleSize(colors, _.random(1, 5)),
        item_sizes: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        item_categories: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)]
      },
      {
        item_image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/bpb/24/main.jpg',
        item_name: "Men's Premium Tank Top",
        item_description: faker.lorem.sentences(),
        item_price: _.random(0.1, 50.0),
        item_colors: _.sampleSize(colors, _.random(1, 5)),
        item_sizes: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        item_categories: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)]
      },
      {
        item_image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/bpb/25/main.jpg',
        item_name: "Women's Premium Tank Top",
        item_description: faker.lorem.sentences(),
        item_price: _.random(0.1, 50.0),
        item_colors: _.sampleSize(colors, _.random(1, 5)),
        item_sizes: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        item_categories: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)]
      },
      {
        item_image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/bpb/26/main.jpg',
        item_name: "Women's Premium Long Sleeve T-shirt",
        item_description: faker.lorem.sentences(),
        item_price: _.random(0.1, 50.0),
        item_colors: _.sampleSize(colors, _.random(1, 5)),
        item_sizes: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        item_categories: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)]
      },
      {
        item_image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/bpb/27/main.jpg',
        item_name: "Women's Pique Polo Shirt",
        item_description: faker.lorem.sentences(),
        item_price: _.random(0.1, 50.0),
        item_colors: _.sampleSize(colors, _.random(1, 5)),
        item_sizes: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        item_categories: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)]
      },
    ]

    const products = [
      {
        // item_id: 1,
        item_name: "Adjustable Apron",
        item_description: faker.lorem.sentences(),
        product_image_url: `https://monarcsoft-marketplace-dev.s3.amazonaws.com/product_designs/1.jpg`,
        product_name: "Every Butt Loves a Good Rub",
        product_description: faker.lorem.sentences(),
        product_price: _.random(0.1, 50.0),
        design_styles: _.sampleSize(PRODUCTS.DESIGN_STYLES, _.random(1, PRODUCTS.DESIGN_STYLES.length)),
        // colors: _.sampleSize(colors, _.random(1, 5)),
        // ITEMS.SIZES: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        // ITEMS.CATEGORIES: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)],
      },
      {
        // item_id: 26,
        item_name: "Women's Premium Long Sleeve T-shirt",
        item_description: faker.lorem.sentences(),
        product_image_url: `https://monarcsoft-marketplace-dev.s3.amazonaws.com/product_designs/2.jpg`,
        product_name: "I Sugar Coat Everything",
        product_description: faker.lorem.sentences(),
        product_price: _.random(0.1, 50.0),
        design_styles: _.sampleSize(PRODUCTS.DESIGN_STYLES, _.random(1, PRODUCTS.DESIGN_STYLES.length)),
        // colors: _.sampleSize(colors, _.random(1, 5)),
        // ITEMS.SIZES: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        // ITEMS.CATEGORIES: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)],
      },
      {
        // item_id: 10,
        item_name: "Men's Premium T-shirt",
        item_description: faker.lorem.sentences(),
        product_image_url: `https://monarcsoft-marketplace-dev.s3.amazonaws.com/product_designs/3.jpg`,
        product_name: "I Sugar Coat Everything",
        product_description: faker.lorem.sentences(),
        product_price: _.random(0.1, 50.0),
        design_styles: _.sampleSize(PRODUCTS.DESIGN_STYLES, _.random(1, PRODUCTS.DESIGN_STYLES.length)),
        // colors: _.sampleSize(colors, _.random(1, 5)),
        // ITEMS.SIZES: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        // ITEMS.CATEGORIES: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)],
      },
      {
        // item_id: 22,
        item_name: "Kid's T-Shirt",
        item_description: faker.lorem.sentences(),
        product_image_url: `https://monarcsoft-marketplace-dev.s3.amazonaws.com/product_designs/4.jpg`,
        product_name: "Mermaid",
        product_description: faker.lorem.sentences(),
        product_price: _.random(0.1, 50.0),
        design_styles: _.sampleSize(PRODUCTS.DESIGN_STYLES, _.random(1, PRODUCTS.DESIGN_STYLES.length)),
        // colors: _.sampleSize(colors, _.random(1, 5)),
        // ITEMS.SIZES: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        // ITEMS.CATEGORIES: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)],
      },
      {
        // item_id: 24,
        item_name: "Men's Premium Tank Top",
        item_description: faker.lorem.sentences(),
        product_image_url: `https://monarcsoft-marketplace-dev.s3.amazonaws.com/product_designs/5.jpg`,
        product_name: "My Dad Knows Best",
        product_description: faker.lorem.sentences(),
        product_price: _.random(0.1, 50.0),
        design_styles: _.sampleSize(PRODUCTS.DESIGN_STYLES, _.random(1, PRODUCTS.DESIGN_STYLES.length)),
        // colors: _.sampleSize(colors, _.random(1, 5)),
        // ITEMS.SIZES: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        // ITEMS.CATEGORIES: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)],
      },
      {
        // item_id: 25,
        item_name: "Women's Premium Tank Top",
        item_description: faker.lorem.sentences(),
        product_image_url: `https://monarcsoft-marketplace-dev.s3.amazonaws.com/product_designs/6.jpg`,
        product_name: "Peace Love Tacos",
        product_description: faker.lorem.sentences(),
        product_price: _.random(0.1, 50.0),
        design_styles: _.sampleSize(PRODUCTS.DESIGN_STYLES, _.random(1, PRODUCTS.DESIGN_STYLES.length)),
        // colors: _.sampleSize(colors, _.random(1, 5)),
        // ITEMS.SIZES: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        // ITEMS.CATEGORIES: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)],
      },
      {
        // item_id: 12,
        item_name: "Snap-back Baseball Cap",
        item_description: faker.lorem.sentences(),
        product_image_url: `https://monarcsoft-marketplace-dev.s3.amazonaws.com/product_designs/7.jpg`,
        product_name: "Public Enemy",
        product_description: faker.lorem.sentences(),
        product_price: _.random(0.1, 50.0),
        design_styles: _.sampleSize(PRODUCTS.DESIGN_STYLES, _.random(1, PRODUCTS.DESIGN_STYLES.length)),
        // colors: _.sampleSize(colors, _.random(1, 5)),
        // ITEMS.SIZES: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        // ITEMS.CATEGORIES: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)],
      },
      {
        // item_id: 23,
        item_name: "Men's Premium Long Sleeve T-shirt",
        item_description: faker.lorem.sentences(),
        product_image_url: `https://monarcsoft-marketplace-dev.s3.amazonaws.com/product_designs/8.jpg`,
        product_name: "Sorry I'm Late I did'nt want to Come",
        product_description: faker.lorem.sentences(),
        product_price: _.random(0.1, 50.0),
        design_styles: _.sampleSize(PRODUCTS.DESIGN_STYLES, _.random(1, PRODUCTS.DESIGN_STYLES.length)),
        // colors: _.sampleSize(colors, _.random(1, 5)),
        // ITEMS.SIZES: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        // ITEMS.CATEGORIES: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)],
      },
      {
        // item_id: 10,
        item_name: "Men's Premium T-shirt",
        item_description: faker.lorem.sentences(),
        product_image_url: `https://monarcsoft-marketplace-dev.s3.amazonaws.com/product_designs/9.jpg`,
        product_name: "Tag Heuer",
        product_description: faker.lorem.sentences(),
        product_price: _.random(0.1, 50.0),
        design_styles: _.sampleSize(PRODUCTS.DESIGN_STYLES, _.random(1, PRODUCTS.DESIGN_STYLES.length)),
        // colors: _.sampleSize(colors, _.random(1, 5)),
        // ITEMS.SIZES: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        // ITEMS.CATEGORIES: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)],
      },
      {
        // item_id: 10,
        item_name: "Men's Premium T-shirt",
        item_description: faker.lorem.sentences(),
        product_image_url: `https://monarcsoft-marketplace-dev.s3.amazonaws.com/product_designs/10.jpg`,
        product_name: "The Beat Goes On",
        product_description: faker.lorem.sentences(),
        product_price: _.random(0.1, 50.0),
        design_styles: _.sampleSize(PRODUCTS.DESIGN_STYLES, _.random(1, PRODUCTS.DESIGN_STYLES.length)),
        // colors: _.sampleSize(colors, _.random(1, 5)),
        // ITEMS.SIZES: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        // ITEMS.CATEGORIES: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)],
      },
      {
        // item_id: 24,
        item_name: "Men's Premium Tank Top",
        item_description: faker.lorem.sentences(),
        product_image_url: `https://monarcsoft-marketplace-dev.s3.amazonaws.com/product_designs/11.jpg`,
        product_name: "This is the Way",
        product_description: faker.lorem.sentences(),
        product_price: _.random(0.1, 50.0),
        design_styles: _.sampleSize(PRODUCTS.DESIGN_STYLES, _.random(1, PRODUCTS.DESIGN_STYLES.length)),
        // colors: _.sampleSize(colors, _.random(1, 5)),
        // ITEMS.SIZES: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        // ITEMS.CATEGORIES: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)],
      },
      {
        // item_id: 27,
        item_name: "Women's Pique Polo Shirt",
        item_description: faker.lorem.sentences(),
        product_image_url: `https://monarcsoft-marketplace-dev.s3.amazonaws.com/product_designs/12.jpg`,
        product_name: "Yellowstone",
        product_description: faker.lorem.sentences(),
        product_price: _.random(0.1, 50.0),
        design_styles: _.sampleSize(PRODUCTS.DESIGN_STYLES, _.random(1, PRODUCTS.DESIGN_STYLES.length)),
        // colors: _.sampleSize(colors, _.random(1, 5)),
        // ITEMS.SIZES: _.sampleSize(ITEMS.SIZES, _.random(1, ITEMS.SIZES.length)),
        // ITEMS.CATEGORIES: [_.sample(ITEMS.PRODUCT_TYPES), ..._.sampleSize(ITEMS.CATEGORIES, 2)],
      },
    ];

    const itemDocs = await Item.insertMany(items)

    const productsInsert = products.map(p => {
      const match = itemDocs.find(v => v.item_name === p.item_name)
      if (!match) return

      return {
        ...p,
        ["item_id"]: match.id,
        ["product_colors"]: match.item_colors,
        ["product_sizes"]: match.item_sizes,
        ["product_categories"]: match.item_categories,
        ["product_images"]: []
      }
    })

    return Product.insertMany(productsInsert);
  }
}

module.exports = ItemsAndProductsSeeder;
