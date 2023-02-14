const { Seeder } = require("mongoose-data-seed");
const { Product } = require('../mongo/product')
const { ProductRating } = require('../mongo/productRating')
const _ = require('lodash')
const async = require('async')
const faker = require('faker')

class ProductRatingsSeeder extends Seeder {

  async shouldRun () {
    return ProductRating.countDocuments({}) === 0
  }

  async run () {
    const products = await Product.find()

    return async.eachOfSeries(_.range(1, 50), async n => {
      const selectedP = _.sampleSize(products, _.random(1, products.length))

      const forInsert = selectedP.map(p => {
        return {
          product: p._id,
          customer: n,
          score: _.random(1, 5, true),
          remarks: faker.lorem.sentences(),
        }
      })

      await ProductRating.insertMany(forInsert)
    })
  }
}

module.exports = ProductRatingsSeeder;
