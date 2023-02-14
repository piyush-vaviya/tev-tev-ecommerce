const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()

const mongoURL = process.env.MONGODB_HOST || 'mongodb://localhost:27017/dbname'

const ColorsSeeder = require('./seeders/colors.seeder')
const ItemsAndProductsSeeder = require('./seeders/items_n_products.seeder')
const DesignAndProductDesignSeeder = require('./seeders/design_n_product_design.seeder')
const ProductRatingsSeeder = require('./seeders/product_ratings.seeder')
const UsersSeeder = require('./seeders/users.seeder')
/**
 * Seeders List
 * order is important
 * @type {Object}
 */
module.exports.seedersList = {
  // ColorsSeeder,
  UsersSeeder,
  // ItemsAndProductsSeeder,
  // DesignAndProductDesignSeeder,
  // ProductRatingsSeeder,
}
/**
 * Connect to mongodb implementation
 * @return {Promise}
 */
module.exports.connect = async () =>
  mongoose.connect(mongoURL, {
    dbName: process.env.MONGODB_NAME,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    auth: {
      user: process.env.MONGODB_USERNAME,
      password: process.env.MONGODB_PASSWORD,
    },
  })
/**
 * Drop/Clear the database implementation
 * @return {Promise}
 */
module.exports.dropdb = async () => mongoose.connection.db.dropDatabase()
