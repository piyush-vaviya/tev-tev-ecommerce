const { saveToDraft, myDraft } = require('../../../services/cldraft')

module.exports = {
  Query: {
    findDraft: async (parent, { userId }, context) => {
      const draftResult = await myDraft(userId)
      if (draftResult) {
        return draftResult
      }
    },
  },
  Mutation: {
    saveToDraft: async (parent, { input }, context) => {
      const draftSaved = await saveToDraft(input)
      if (draftSaved) {
        return draftSaved
      }
    },
  },
}
