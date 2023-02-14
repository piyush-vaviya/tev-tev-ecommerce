const { Seeder } = require('mongoose-data-seed')
const { Color } = require('../mongo/color')

const colors = [
  {
    name: 'black',
    image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/colors/black.png',
    hex: '#000000',
  },
  {
    name: 'red',
    image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/colors/red.png',
    hex: '#FF0000',
  },
  {
    name: 'royalblue',
    image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/colors/royalblue.png',
  },
  {
    name: 'kellygreen',
    image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/colors/kellygreen.png',
    hex: '#4cbb17',
  },
  {
    name: 'sunyellow',
    image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/colors/sunyellow.png',
    hex: '#f9d71c',
  },
  {
    name: 'darkpink',
    image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/colors/darkpink.png',
    hex: '#e75480',
  },
  {
    name: 'gray_n_brown',
    image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/colors/gray_brown.png',
    hex: '#808080',
  },
  {
    name: 'heathergray_n_red',
    image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/colors/heathergray_red.png',
    hex: '#9aa297',
  },
  {
    name: 'heathericeblue',
    image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/colors/heathericeblue.png',
    hex: '#3f4868',
  },
  {
    name: 'ivory_n_brown',
    image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/colors/ivory_brown.png',
    hex: '#fffff0',
  },
  {
    name: 'white_n_kellygreen',
    image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/colors/white_kellygreen.png',
    hex: '#ffffff',
  },
  {
    name: 'white_n_navy',
    image_url: 'https://monarcsoft-marketplace-dev.s3.amazonaws.com/colors/white_navy.png',
    hex: '#ffffff',
  },
]

class ColorsSeeder extends Seeder {
  async shouldRun () {
    return Color.countDocuments({}) === 0
  }

  async run () {
    return Color.insertMany(colors)
  }
}

module.exports = ColorsSeeder
