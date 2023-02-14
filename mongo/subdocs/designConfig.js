const mongoose = require('mongoose')
const Schema = mongoose.Schema

const { LayerSchema } = require('./layer')

const DesignConfigSchema = new Schema({
  side: String,
  index: Number,
  layers: [LayerSchema],
})

module.exports.DesignConfigSchema = DesignConfigSchema
