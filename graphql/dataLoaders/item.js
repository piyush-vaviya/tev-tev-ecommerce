const DataLoader = require('dataloader')
const { objectIdMap } = require('../../utils/database')

const { Item } = require('../../mongo/item')

const getItemsById = async (ids) => {
  try {
    const objectIds = objectIdMap(ids)

    const data = await Item.find({
      _id: {
        $in: objectIds,
      },
    })

    return objectIds.map(id => {
      const item = data.find(d => id.equals(d._id))

      if (!item) return null

      return item
    })
  } catch (err) {
    console.error(err)
  }
}

const getItemsByIdLoader = new DataLoader(getItemsById)

module.exports = {
  getItemsByIdLoader,
}
