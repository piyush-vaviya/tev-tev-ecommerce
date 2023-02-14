const DataLoader = require('dataloader')
const axios = require('axios')
const qs = require('qs')
const REST_API_URL = process.env.BACKEND_API_URL

const getSidesByProductImageId = async (ids) => {
  try {
    const { data: {data, meta} } = await axios.get(`${REST_API_URL}/product_image?include[]=sides&id=${JSON.stringify({$in: ids})}`)
    
    return ids.map(id => {
      const product = data.find(d => d.id == id)

      if(!product) return []

      return product.sides
    })
  } catch (err) {
    console.err(err)
  }
}

const getSidesByProductImageIdLoader = new DataLoader(getSidesByProductImageId)

module.exports = {
    getSidesByProductImageIdLoader
}