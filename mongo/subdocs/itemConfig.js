const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ItemConfigSchema = new Schema({
  side: String,
  index: Number,
  ratio: String,
  top: {
    x: {
      type: Number,
      required: true,
    },
    y: {
      type: Number,
      required: true,
    },
  },
  left: {
    x: {
      type: Number,
      required: true,
    },
    y: {
      type: Number,
      required: true,
    },
  },
})

module.exports.ItemConfigSchema = ItemConfigSchema
