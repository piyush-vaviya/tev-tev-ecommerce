/**
 * Native Modules
 */
const fs = require('fs')
const path = require('path')
const util = require('util')

/**
 * NPM modules
 */
const uuid = require('uuid')

/**
 * Utilities
 */
const aws = require('../utils/aws')
const logger = require('../utils/logger')
const common = require('../graphql/utils/common')
const { getFilesizeInBytes } = require('../utils/file')

/**
 * Constants
 */
const COLOR_CONSTANTS = require('../constants/color')

/**
 * Errors
 */
const {
  colorImageMaxFileSizeExceeded,
  colorImageMimeTypeNotSupported,
  nameAlreadyDefined,
} = require('../graphql/errors/color')

/**
 * Schemas
 */
const { Color } = require('../mongo/color')

module.exports.createOrUpdate = async (input) => {
  /**
   * Wait for upload of image from graphql client
   */
  const imageUpload = await input.image

  /**
   * Gather info about file uploaded
   *
   */
  let fileInfo, uuidFilename, tmpFilename, color
  const hexUpperCase = input.hex.toUpperCase()

  if (imageUpload) {
    fileInfo = path.parse(imageUpload.filename)
    uuidFilename = uuid.v4()
    tmpFilename = `uploads/designs/${uuidFilename}${fileInfo.ext}`

    /**
     * Create a writestream to create a temporary file in server.
     * We need to create a temporary file because we cannot check mime type
     * if it is not saved in the filesystem.
     */
    const writeStream = fs.createWriteStream(tmpFilename)

    /**
     * Create a readstream for S3
     *
     */
    imageUpload.createReadStream().pipe(writeStream)

    /**
     * Returns a promise.
     * The graphql server will return a reponse
     * once the promse resolves or in error cases rejects
     */
    return new Promise((resolve, reject) => {
      writeStream.on('finish', async (fd) => {
        if (!COLOR_CONSTANTS.COLOR_IMAGE_ALLOWED_MIMETYPES.includes(imageUpload.mimetype)) {
          return reject(colorImageMimeTypeNotSupported())
        }

        const filesizeMb = getFilesizeInBytes(tmpFilename)
        if (filesizeMb > COLOR_CONSTANTS.COLOR_IMAGE_MAX_FILESIZE_BYTES) {
          return reject(colorImageMaxFileSizeExceeded())
        }

        const session = await Color.startSession()

        if (!input.id) {
          // create
          color = await Color.findOne({ name: input.name }).session(session)

          if (color) return reject(nameAlreadyDefined(input.name))

          color = new Color({
            name: input.name,
            hex: hexUpperCase,
          })
        } else {
          // update
          color = await Color.findOne({ name: input.name }).session(session)

          if (color && color._id.toString() !== input.id) return reject(nameAlreadyDefined(input.name))

          color = await Color.findById(input.id).session(session)
          color.name = input.name
          color.hex = hexUpperCase
        }

        const imageFileName = common.toUrlSafeString(input.name) + fileInfo.ext
        const keyName = `colors/${color._id}/${imageFileName}`

        let s3Upload
        try {
          s3Upload = await aws.S3.upload({
            bucketName: process.env.AWS_BUCKET_MAIN,
            keyName: keyName,
            contentType: imageUpload.mimetype,
            contentDisposition: 'inline',
            acl: 'public-read',
            fileStream: fs.createReadStream(tmpFilename),
          })
        } catch (err) {
          // Delete the temporary file
          await util.promisify(fs.unlink)(tmpFilename)

          reject(err)
        }

        color.image_url = s3Upload.Location
        color.s3_keyname = keyName

        await session.withTransaction(async () => {
          try {
            await color.save({ session })
          } catch (err) {
            // Cleanup s3 for failure
            const s3CleanUpResponse = await aws.S3.deleteObject({
              bucketName: process.env.AWS_BUCKET_MAIN,
              keyName: keyName,
            })

            logger.info({ s3CleanUpResponse })

            throw err
          } finally {
            // Delete the temporary file
            await util.promisify(fs.unlink)(tmpFilename)
          }
        })

        // respond with the newly uploaded design
        resolve(color)
      })
    })
  } else {
    if (!input.id) {
      color = await Color.findOne({ name: input.name })

      if (color) throw nameAlreadyDefined(input.name)

      return Color.create({
        name: input.name,
        hex: hexUpperCase,
      })
    } else {
      color = await Color.findOne({ hex: input.name })

      if (color && color._id.toString() !== input.id) throw nameAlreadyDefined(input.name)

      return Color.findByIdAndUpdate(input.id, {
        name: input.name,
        hex: hexUpperCase,
      }, { new: true })
    }
  }
}
