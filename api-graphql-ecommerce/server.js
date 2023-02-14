const dotenv = require('dotenv')
dotenv.config()

const mongo = require('../mongo')
const MONGO_CONFIG = require('../config/mongo')

const main = async () => {
  await mongo.connect('core', {
    host: process.env.MONGODB_CORE_HOST,
    dbName: process.env.MONGODB_CORE_NAME,
    username: process.env.MONGODB_CORE_USERNAME,
    password: process.env.MONGODB_CORE_PASSWORD,
    opts: MONGO_CONFIG.MONGOOSE_OPTS,
  })

  const { app } = require('./app')

  console.log('Connected to database...')

  const port = process.env.ECOMMERCE_PORT || 8000
  const webServer = app.listen(port, () => console.log(`Graphql listening to port ${port}...`))
  webServer.setTimeout(60000)
}

main()
