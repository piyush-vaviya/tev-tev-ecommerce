const APP_CONSTANTS = require('../../constants/app')

/**
 * Returns an array [limit, offset] based on paginator object given
 * Destructure returned array for easier use
 *
 * @param   {[Object]}  paginator  object of type {page, first}
 *
 * @return  {[Array]}         return [limit, offset] config
 */
module.exports.limitAndOffset = function (paginator) {
  let offset = 0
  let limit = 10
  if (paginator && paginator.first && paginator.first > 0) {
    limit = paginator.first
  }

  if (paginator && paginator.page && paginator.page > 0) {
    offset = (paginator.page - 1) * limit
  }

  return [limit, offset]
}

/**
 * Returns an array of object defining the sorting fiels elasticsearch will use
 *
 * @param   {[object]}sort      object of type {criteria, order}
 * @param   {date}  criteria  field name to sort to, defaults to date
 * @param   {desc}  order     asc/descending, defaults to desc
 *
 * @return  {[object]}          [return description]
 */
module.exports.sort = (sort = { criteria: 'date', order: 'desc' }) => {
  if (sort.criteria === APP_CONSTANTS.ELASTICSEARCH_SORT.POPULARITY) {
    return [{
      wilson_score: {
        order: sort.order,
      },
      created_at: {
        order: 'desc',
      },
    }]
  } else if (sort.criteria === APP_CONSTANTS.ELASTICSEARCH_SORT.PRICE) {
    return [{
      product_regular_price: sort.order,
    }]
  } else {
    // if none is provided, the default is sort by relevance
    return [{
      _score: sort.order,
    }]
  }
}
