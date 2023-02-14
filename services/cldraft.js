const { CL_Draft } = require('../mongo/cldraft')

module.exports.saveToDraft = async (input) => {
  const saveDraft = await CL_Draft.findOneAndUpdate({
    user_id: input.user_id,
  }, {
    $set: {
      color: input.color,
      item: input.item,
      item_configs: input.item_configs,
      layers: input.layers,
    },
  }, {
    upsert: true,
    new: true,
  })
  return saveDraft
}

module.exports.myDraft = async (user_id) => {
  const myDraft = await CL_Draft.findOne({ user_id })
  return myDraft
}
