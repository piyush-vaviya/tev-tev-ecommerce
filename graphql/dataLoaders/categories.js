const DataLoader = require('dataloader')
const { Products } = require('../../models')

const getCategoriesByProductId = async (ids) => {
  try {
    const data = await Products.query()
      .withGraphJoined({
        categories: true
      })
      .whereIn('products.id', ids)

    return ids.map(id => {
      const product = data.find(d => d.id == id)

      if (!product) return []

      return product.categories
    })
  } catch (err) {
    console.error(err)
  }
}

const getCategoriesByProductIdLoader = new DataLoader(getCategoriesByProductId)

module.exports = {
  getCategoriesByProductIdLoader
}