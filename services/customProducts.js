/**
 * Npm packages
 *
 */
const _ = require('lodash')

/**
 * Local modules
 */
const {
  draftNotFound, itemConfigForSideNotFound,
} = require('../graphql/errors/customProduct')

/**
 * Schemas
 *
 */
const { CL_Draft } = require('../mongo/cldraft')
const { CustomProduct } = require('../mongo/customProduct')
const { Design } = require('../mongo/design')

/**
 * Utilities
 */
const amqp = require('../utils/amqp')

const calculateCustomProductPrice = async (designConfig, item) => {
  let totalPrice = 0

  /**
   * Flat rate for production is
   * Front side $6
   * Back side $6
   * Sides $2
   */
  const numSides = designConfig.length

  if (numSides > 0) totalPrice += 6

  if (numSides > 1) totalPrice += 6

  if (numSides > 2) totalPrice += (numSides - 2) * 2

  /**
   * Price of item
   * Use special price as priority
   */
  if (item.item_special_price) {
    totalPrice += item.item_special_price
  } else {
    totalPrice += item.item_regular_price
  }

  for (const designSide of designConfig) {
    for (const l of designSide.layers) {
      if (l.type === 'design' && l.design) {
        // Charge design price for designs sold by designers
        // Design uploaded by user is free
        const design = await Design.findById(l.design)
        totalPrice += design.design_price
      }
    }
  }

  return _.floor(totalPrice, 2)
}

module.exports.createCustomProductByDraftId = async ({ draftId, userId }) => {
  const draft = await CL_Draft.findById(draftId).populate('item')

  if (!draft) {
    throw draftNotFound()
  }

  /**
   * Validate item and check if item_images is not found
   */
  const featuredSide = draft.layers.length > 0 && draft.layers[0] ? draft.layers[0].side : 'front'
  const itemConfig = draft.item_configs.find(x => x.side === featuredSide)
  // const itemKeyname = draft.item.item_images.find(x => x.side === featuredSide && draft.color.equals(x.color))

  if (!itemConfig) {
    throw itemConfigForSideNotFound({ side: featuredSide, itemId: draft.item._id })
  }

  /**
   * Parse draft layers and create custom_products record in mongodb
   */
  const design_config = []
  for (const l of draft.layers) {
    const i = design_config.findIndex(x => x.side === l.side)

    const layerData = {
      type: l.type,
      order: l.order,
      rotate: l.rotate,
      scale: l.scale,
      topleft_x: l.topleft_x,
      topleft_y: l.topleft_y,
      text: l.text,
      width: l.width,
      height: l.height,
    }

    if (l.design && l.design.id) {
      layerData['design'] = l.design.id
    } else if (l.design && l.design.design_image_url) {
      layerData['upload_image_url'] = l.design.design_image_url
      layerData['upload_image_width'] = l.design.design_dimension.width
      layerData['upload_image_height'] = l.design.design_dimension.height
    }

    if (l.font) {
      layerData['font'] = l.font
    }

    if (l.font_color) {
      layerData['font_color'] = l.font_color
    }

    if (l.font_italic) {
      layerData['font_italic'] = l.font_italic
    }

    if (l.font_weight) {
      layerData['font_weight'] = l.font_weight
    }

    if (l.text_height) {
      layerData['text_height'] = l.text_height
    }

    if (l.text_align) {
      layerData['text_align'] = l.text_align
    }

    if (i !== -1) {
      design_config[i].layers.push(layerData)
    } else {
      design_config.push({
        side: l.side,
        layers: [layerData],
      })
    }
  }

  const customProduct = await CustomProduct.create({
    design_config,
    item: draft.item,
    printing_method: draft.printing_method,
    color: draft.color,
    item_config: draft.item_configs,
    user: userId,
    price: await calculateCustomProductPrice(design_config, draft.item),
    product_name: draft.item.item_name,
    cl_draft_id: draft._id,
  })

  const messages = draft.item.item_sides.map(side => {
    const match = draft.item.item_images.find(x => x.side === side && draft.color.equals(x.color))

    return {
      custom_product_id: customProduct._id,
      side: side,
      color: draft.color,
      item_config: itemConfig,
      item_keyname: match.s3_keyname,
      is_main: side === featuredSide,
    }
  })

  await amqp.batchPublish(messages.map(msg => ({
    queue: 'mp-img-merge',
    payload: JSON.stringify(msg),
  })))

  return {
    customProduct,
    featuredSide,
    itemConfig,
    // itemKeyname,
  }
}

module.exports.getByCustomProductId = async (customProductId) => {
  return CustomProduct.findById(customProductId)
}
