const csv = require('csv')

module.exports.csvReader = async ({ file, onChunkHandler, endHandler = null }) => {
  const parser = csv.parse({
    columns: true,
    skip_empty_lines: true,
  })

  // Use the readable stream api
  parser.on('readable', () => onChunkHandler(parser))

  // When we are done, test that the parsed output matched what expected
  if (endHandler) {
    parser.on('end', endHandler)
  }

  file.createReadStream().pipe(parser)
}
