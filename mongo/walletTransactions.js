const mongoose = require('mongoose')
const Schema = mongoose.Schema

const { connections, CONNECTION_NAMES } = require('./index')

const WalletTransactionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    default: 0.0,
  },
}, {
  collection: 'wallet_transactions',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})

module.exports.WalletTransaction = connections[CONNECTION_NAMES.CORE].model('WalletTransaction', WalletTransactionSchema)
module.exports.WalletTransactionSchema = WalletTransactionSchema
