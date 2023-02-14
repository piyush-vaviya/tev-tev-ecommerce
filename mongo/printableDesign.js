const mongoose = require('mongoose')
const Schema = mongoose.Schema

const { connections, CONNECTION_NAMES } = require('./index')

const PrintablDesignSchema = new Schema({
  order_id: {
    type: mongoose.Types.ObjectId,
    ref: 'orders',
  },
  color: {
    type: mongoose.Types.ObjectId,
    ref: 'Color',
  },
  sku: String,
  order_item_no: String,
  images: [{
    side: String,
    index: Number,
    image_url: String,
    s3_keyname: String,
    ratio: String,
  }],
}, {
  collection: 'printable_designs',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})

module.exports.PrintablDesign = connections[CONNECTION_NAMES.CORE].model('PrintablDesign', PrintablDesignSchema)
module.exports.PrintablDesignSchema = PrintablDesignSchema
