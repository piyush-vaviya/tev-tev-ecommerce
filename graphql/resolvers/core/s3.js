/**
 * Local modules
 *
 */
const aws = require('../../../utils/aws')

module.exports = {
  Query: {
    getPresignedUrl: async (parent, { input }, context) => {
      const params = {
        Bucket: input.bucket,
        Key: input.key,
      }

      if (input.acl) {
        params['ACL'] = input.acl
      } else {
        params['ACL'] = 'private'
      }

      if (input.content_type) {
        params['ContentType'] = input.content_type
      }

      if (input.content_disposition) {
        params['ContentDisposition'] = input.content_type
      } else {
        params['ContentDisposition'] = 'inline'
      }

      if (input.expires) {
        params['Expires'] = input.expires
      } else {
        params['Expires'] = 60
      }

      return aws.S3.getPresignedUrl(input.method, params)
    },
  },
}
