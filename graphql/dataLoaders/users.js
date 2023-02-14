const DataLoader = require('dataloader')
const { objectIdMap } = require('../../utils/database')

const { User } = require('../../mongo/user')

const getUsersById = async (ids) => {
  try {
    const objectIds = objectIdMap(ids)

    const data = await User.find({
      _id: {
        $in: objectIds,
      },
    })

    return objectIds.map(id => {
      const user = data.find(d => d._id.toString() === id.toString())

      if (!user) return null

      return user
    })
  } catch (err) {
    console.error(err)
  }
}

const getUsersByIdLoader = new DataLoader(getUsersById)

module.exports = {
  getUsersByIdLoader,
}
