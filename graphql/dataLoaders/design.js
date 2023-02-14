const DataLoader = require('dataloader')
const { objectIdMap } = require('../../utils/database')

const { Design } = require('../../mongo/design')

const getDesignsById = async (ids) => {
  try {
    const objectIds = objectIdMap(ids)

    const data = await Design.find({
      _id: {
        $in: objectIds,
      },
    })

    return objectIds.map(id => {
      const design = data.find(d => id.equals(d._id))

      if (!design) return null

      return design
    })
  } catch (err) {
    console.error(err)
  }
}

const getDesignsByIdLoader = new DataLoader(getDesignsById)

module.exports = {
  getDesignsByIdLoader,
}
