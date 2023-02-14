const DataLoader = require('dataloader')
const { objectIdMap } = require('../../utils/database')

const { Product } = require('../../mongo/product')

const getProductsById = async (ids) => {
  try {
    const objectIds = objectIdMap(ids)

    const data = await Product.find({
      _id: {
        $in: objectIds,
      },
    })

    return objectIds.map((id) => {
      const prod = data.find((d) => id.equals(d._id))

      if (!prod) return null

      return prod
    })
  } catch (err) {
    console.error(err)
  }
}

const getProductsByIdLoader = new DataLoader(getProductsById)

module.exports = {
  getProductsByIdLoader,
}
