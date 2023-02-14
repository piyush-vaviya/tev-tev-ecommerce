const mongoose = require('mongoose')
const Schema = mongoose.Schema

const { connections, CONNECTION_NAMES } = require('./index')

const MerchantWalletSchema = new Schema({
  order: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
  },
  amount: {
    type: Number,
    required: true,
  },
}, {
  collection: 'merchant_wallet',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})

module.exports.MerchantWallet = connections[CONNECTION_NAMES.CORE].model('MerchantWallet', MerchantWalletSchema)
module.exports.MerchantWalletSchema = MerchantWalletSchema
