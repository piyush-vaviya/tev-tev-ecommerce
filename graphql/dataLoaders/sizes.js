const DataLoader = require('dataloader')
const { Products } = require('../../models')

const getSizesByProductId = async (ids) => {
  try {
    const data = await Products.query()
      .withGraphJoined({
        sizes: true
      })
      .whereIn('products.id', ids)

    return ids.map(id => {
      const product = data.find(d => d.id == id)

      if (!product) return []

      return product.sizes
    })
  } catch (err) {
    console.error(err)
  }
}

const getSizesByProductIdLoader = new DataLoader(getSizesByProductId)

module.exports = {
  getSizesByProductIdLoader
}