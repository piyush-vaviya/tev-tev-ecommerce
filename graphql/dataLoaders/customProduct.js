const { CustomProduct } = require('../../mongo/customProduct')

const getSidesWithDesign = async (parent) => {
  try {
    const customProductId = parent.custom_product ? parent.custom_product : parent.custom_product_id
    const withDesignSides = []
    const designSides = []

    if (customProductId) {
      parent.design_config.forEach(config => {
        withDesignSides.push(config.side)
      })
    }

    const customProducts = await CustomProduct.findById(customProductId)
    customProducts.product_images.forEach(image => {
      if (withDesignSides.includes(image.side)) {
        designSides.push(image)
      }
    })
    return {
      product_images: designSides,
    }
  } catch (err) {
    console.error(err)
  }
}

const getOneSidesFromProductsDesign = async (parent) => {
  try {
    const customProductId = parent.custom_product_id
    const sidesWithDesign = []
    const withDesignSides = []
    // const selectedProductSide
    const prioritySides = ['front', 'back', 'right', 'left']

    const customProducts = await CustomProduct.findById(customProductId)
    // take side(s) with design only
    customProducts.design_config.forEach(config => {
      withDesignSides.push(config.side)
    })

    // loop into product_images then takes sides with design
    for (const image of customProducts.product_images) {
      if (withDesignSides.includes(image.side)) {
        sidesWithDesign.push(image)
      }
    }

    // return only 1 side product design by priority
    for (const design of sidesWithDesign) {
      if (prioritySides.includes(design.side.toLowerCase())) {
        customProducts.image_url = design.image_url
        return customProducts
      }
    }
  } catch (err) {
    console.error(err)
  }
}

module.exports = {
  getSidesWithDesign,
  getOneSidesFromProductsDesign,
}
