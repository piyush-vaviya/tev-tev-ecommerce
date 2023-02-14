const mongoose = require('mongoose')
const Schema = mongoose.Schema

const { connections, CONNECTION_NAMES } = require('./index')

const WalletSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  balance: {
    type: Number,
    required: true,
    default: 0.0,
  },
}, {
  collection: 'wallets',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})

module.exports.Wallet = connections[CONNECTION_NAMES.CORE].model('Wallet', WalletSchema)
module.exports.WalletSchema = WalletSchema
