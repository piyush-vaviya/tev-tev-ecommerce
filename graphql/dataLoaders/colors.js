const DataLoader = require('dataloader')
const { objectIdMap } = require('../../utils/database')

const { Color } = require('../../mongo/color')

const getColorsByName = async (names = []) => {
  const data = await Color.find({
    name: {
      $in: names,
    },
  })

  return names.map(name => {
    const color = data.find(d => name === d.name)

    if (!color) return null

    return color
  })
}

const getColorsById = async (ids = []) => {
  const objectIds = objectIdMap(ids)

  const data = await Color.find({
    _id: {
      $in: objectIds,
    },
  })

  return objectIds.map(id => {
    const color = data.find(d => id.equals(d._id))

    if (!color) return null

    return color
  })
}

const getColorsByNameLoader = new DataLoader(getColorsByName)
const getColorsByIdLoader = new DataLoader(getColorsById)

module.exports = {
  getColorsByNameLoader,
  getColorsByIdLoader,
}
