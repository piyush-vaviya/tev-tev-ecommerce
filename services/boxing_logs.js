const { BIN_ACTIONS } = require('../constants/app')
const { BoxingLogs } = require('../mongo/boxing-logs')

module.exports.addEntryToBoxingLogs = async (data) => {
  const { order_id, bin_id } = data
  const logData = new BoxingLogs({
    bin_id,
    action: BIN_ACTIONS.ITEM_ADDED,
    order_id,
    time: new Date().toUTCString(),
  })
  await logData.save()
}
