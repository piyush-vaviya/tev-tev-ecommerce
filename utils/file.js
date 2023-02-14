const fs = require('fs')

module.exports.getFilesizeInBytes = (filename) => {
  var stats = fs.statSync(filename)
  var fileSizeInBytes = stats.size
  return fileSizeInBytes
}

module.exports.replaceWhitespaceAndUnderscore = (filename, replacementCharacter) => {
  return filename.replace(/\s|_/g, replacementCharacter)
}
