/**
 * Local modules
 */
const { actionNotAllowed } = require('../../errors/auth')
const { resourceNotFound } = require('../../errors/common')
const { getUsersByIdLoader } = require('../../dataLoaders/users')

/**
 * Schemas
 */
const walletService = require('../../../services/wallet')

module.exports = {
  Query: {
    wallet: async (parent, args, context) => {
      if (!context.jwt) {
        throw actionNotAllowed()
      }

      const wallet = await walletService.findByUserId(context.jwt.uid)

      if (!wallet) {
        return {
          balance: 0,
          user: context.jwt.uid,
        }
      }

      return wallet
    },

    merchantWallet: async (parent, args, context) => {
      if (!context.jwt) {
        throw actionNotAllowed()
      }

      const [wallet] = await walletService.mechantWalletBalance()

      if (!wallet) {
        throw resourceNotFound()
      }

      return {
        balance: wallet.amount,
      }
    },
  },

  Wallet: {
    user: async (parent, args, context) => {
      return getUsersByIdLoader.load(parent.user)
    },
  },

  Mutation: {

  },
}
