const bwipjs = require('bwip-js')

module.exports.stringToBarcodeImage = async ({ bcodeText }) => {
  return bwipjs.toBuffer({
    bcid: 'code128',
    text: bcodeText,
    scale: 2,
    height: 10,
    includetext: true,
    textxalign: 'center',
  })
}
