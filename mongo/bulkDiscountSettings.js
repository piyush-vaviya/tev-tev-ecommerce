const mongoose = require('mongoose')
const { Schema } = mongoose

const { connections, CONNECTION_NAMES } = require('./index')

const BulkDiscountSettingsSchema = new Schema(
  {
    min_quantity: Number,
    discount_percentage: Number,
  },
  {
    collection: 'bulk_discount_settings',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
)

module.exports.BulkDiscountSettings = connections[CONNECTION_NAMES.CORE].model(
  'BulkDiscountSettings',
  BulkDiscountSettingsSchema
)
module.exports.BulkDiscountSettingsSchema = BulkDiscountSettingsSchema
