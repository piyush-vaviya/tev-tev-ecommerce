const { Order } = require('../mongo/order')
const { Production } = require('../mongo/production')

module.exports.getProductionQueues = async (limit, offset, order) => {
  const productionQueuesCount = Production.find({
    order_item_no: { $ne: undefined },
  }).countDocuments()
  const productionQueues = Production.find({
    order_item_no: { $ne: undefined },
  })
    .limit(limit)
    .skip(offset)
    .sort({ created_at: order })

  const [queuesCount, queues] = await Promise.all([
    productionQueuesCount,
    productionQueues,
  ])
  const hasNextPage = limit + offset < queuesCount

  return {
    total_count: queuesCount,
    page_info: {
      has_next_page: hasNextPage,
    },
    edges: queues,
  }
}

module.exports.searchProductionQueues = async (
  limit,
  offset,
  term,
  order = -1
) => {
  if (term.trim() !== '') {
    const productionQueuesSearchResults = await Production.find({
      $and: [
        {
          production_ref_no: {
            $regex: new RegExp(term, 'i'),
          },
        },
        {
          order_item_no: { $ne: undefined },
        },
      ],
    })
      .limit(limit)
      .skip(offset)
      .sort({ created_at: order })
    const totalCount = productionQueuesSearchResults.length

    const hasNextPage = limit + offset < totalCount

    return {
      total_count: totalCount,
      page_info: {
        has_next_page: hasNextPage,
      },
      edges: productionQueuesSearchResults,
    }
  }

  const { total_count, page_info, edges } = await this.getProductionQueues(
    limit,
    offset,
    order
  )

  return {
    total_count,
    page_info,
    edges,
  }
}

module.exports.productionQueuesOrder = async (productions) => {
  const edges = []
  for (const production of productions) {
    const order = await Order.findById(production.order)

    for (const product of order.order_details.products) {
      if (product.order_item_no === production.order_item_no) {
        product.production_details = {
          production_id: production._id,
          status: production.status,
          pickup_image_url: production.pickup_image_url,
          pickup_image_s3_keyname: production.pickup_image_s3_keyname,
          production_ref_no: production.production_ref_no,
          created_at: production.created_at,
          updated_at: production.updated_at,
        }
        edges.push(product)
      }
    }
  }
  return edges
}

module.exports.updateProductionStatus = async (productionData) => {
  const { production, bin_number, status } = productionData
  production.status = status
  production.bin_number = bin_number
  await production.save()
}
