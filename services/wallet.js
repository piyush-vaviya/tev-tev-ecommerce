const mongoose = require('mongoose')
const { Wallet } = require('../mongo/wallet')
const { MerchantWallet } = require('../mongo/merchantWallet')

module.exports.findByUserId = async (userId) => {
  return Wallet.findOne({ user: mongoose.Types.ObjectId(userId) })
}

module.exports.mechantWalletBalance = async () => {
  return MerchantWallet.aggregate([{
    $group: {
      _id: null,
      amount: {
        $sum: '$amount',
      },
    },
  }])
}
