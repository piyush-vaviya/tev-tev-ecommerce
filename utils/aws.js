'use strict'

const AWS = require('aws-sdk')
const querystring = require('querystring')
const fs = require('fs')

const region = process.env.AWS_ES_REGION
const domain = process.env.AWS_ES_DOMAIN
const accessKeyId = process.env.AWS_ACCESS_KEY_ID
const accessKeySecret = process.env.AWS_SECRET_ACCESS_KEY

const awsConfig = new AWS.Config()
awsConfig.update({
  region: region,
  accessKeyId: accessKeyId,
  accessKeySecret: accessKeySecret,
})

const signRequest = (request) => {
  const credentials = new AWS.EnvironmentCredentials('AWS')
  const signer = new AWS.Signers.V4(request, 'es')
  signer.addAuthorization(credentials, new Date())
}

const createRequest = () => {
  const endpoint = new AWS.Endpoint(domain)
  return new AWS.HttpRequest(endpoint, region)
}

module.exports.ES = {

  indexDocument: async ({ indexName, id, documentObject }) => {
    const request = createRequest()

    request.method = 'PUT'
    request.path += indexName + '/' + '_doc' + '/' + id
    request.body = JSON.stringify(documentObject)
    request.headers['host'] = domain
    request.headers['Content-Type'] = 'application/json'
    // Content-Length is only needed for DELETE requests that include a request
    // body, but including it for all requests doesn't seem to hurt anything.
    request.headers['Content-Length'] = Buffer.byteLength(request.body)

    signRequest(request)

    const client = new AWS.HttpClient()

    return new Promise((resolve, reject) => {
      client.handleRequest(request, null, function (response) {
        // console.log(response.statusCode + ' ' + response.statusMessage)
        let responseBody = ''
        response.on('data', function (chunk) {
          responseBody += chunk
        })
        response.on('end', function (chunk) {
          // console.log('Response body: ' + responseBody)

          resolve({
            statusCode: response.statusCode,
            statusMessage: response.statusMessage,
            body: JSON.parse(responseBody),
          })
        })
      }, function (error) {
        reject(error)
      })
    })
  },

  deleteDocument: async ({ indexName, id }) => {
    const request = createRequest()

    request.method = 'DELETE'
    request.path += indexName + '/' + '_doc' + '/' + id
    request.headers['host'] = domain
    request.headers['Content-Type'] = 'application/json'
    // Content-Length is only needed for DELETE requests that include a request
    // body, but including it for all requests doesn't seem to hurt anything.
    request.headers['Content-Length'] = Buffer.byteLength(request.body)

    signRequest(request)

    const client = new AWS.HttpClient()

    return new Promise((resolve, reject) => {
      client.handleRequest(request, null, function (response) {
        // console.log(response.statusCode + ' ' + response.statusMessage)
        let responseBody = ''
        response.on('data', function (chunk) {
          responseBody += chunk
        })
        response.on('end', function (chunk) {
          // console.log('Response body: ' + responseBody)

          resolve({
            statusCode: response.statusCode,
            statusMessage: response.statusMessage,
            body: JSON.parse(responseBody),
          })
        })
      }, function (error) {
        reject(error)
      })
    })
  },

  deleteIndex: async (indexName) => {
    const request = createRequest()

    request.method = 'DELETE'
    request.path += indexName
    request.headers['host'] = domain
    request.headers['Content-Type'] = 'application/json'
    // Content-Length is only needed for DELETE requests that include a request
    // body, but including it for all requests doesn't seem to hurt anything.
    request.headers['Content-Length'] = Buffer.byteLength(request.body)

    signRequest(request)

    const client = new AWS.HttpClient()

    return new Promise((resolve, reject) => {
      client.handleRequest(request, null, function (response) {
        // console.log(response.statusCode + ' ' + response.statusMessage)
        let responseBody = ''
        response.on('data', function (chunk) {
          responseBody += chunk
        })
        response.on('end', function (chunk) {
          // console.log('Response body: ' + responseBody)

          resolve({
            statusCode: response.statusCode,
            statusMessage: response.statusMessage,
            body: JSON.parse(responseBody),
          })
        })
      }, function (error) {
        reject(error)
      })
    })
  },

  clearIndex: async (indexName) => {
    const request = createRequest()

    request.method = 'POST'
    request.path += indexName + '/_delete_by_query'
    request.body = JSON.stringify({
      query: {
        match_all: {},
      },
    })
    request.headers['host'] = domain
    request.headers['Content-Type'] = 'application/json'
    // Content-Length is only needed for DELETE requests that include a request
    // body, but including it for all requests doesn't seem to hurt anything.
    request.headers['Content-Length'] = Buffer.byteLength(request.body)

    signRequest(request)

    const client = new AWS.HttpClient()

    return new Promise((resolve, reject) => {
      client.handleRequest(request, null, function (response) {
        // console.log(response.statusCode + ' ' + response.statusMessage)
        let responseBody = ''
        response.on('data', function (chunk) {
          responseBody += chunk
        })
        response.on('end', function (chunk) {
          // console.log('Response body: ' + responseBody)

          resolve({
            statusCode: response.statusCode,
            statusMessage: response.statusMessage,
            body: JSON.parse(responseBody),
          })
        })
      }, function (error) {
        reject(error)
      })
    })
  },

  bulkIndex: async ({ indexName, documentsArray = [] }) => {
    const request = createRequest()

    request.method = 'POST'
    request.path += indexName + '/_bulk'
    request.headers['host'] = domain
    request.headers['Content-Type'] = 'application/x-ndjson'

    for (const [docId, docBody] of documentsArray) {
      request.body += JSON.stringify({
        index: {
          _id: docId,
        },
      }) + '\n'

      request.body += JSON.stringify(docBody) + '\n'
    }

    /**
     * Added because of HTTP 400 Bad Request error
     * {"type":"action_request_validation_exception","reason":"Validation Failed: 1: no requests added;"
     */
    request.body += '\n\n'
    // Content-Length is only needed for DELETE requests that include a request
    // body, but including it for all requests doesn't seem to hurt anything.
    // request.headers['Content-Length'] = Buffer.byteLength(request.body)

    signRequest(request)

    const client = new AWS.HttpClient()

    return new Promise((resolve, reject) => {
      client.handleRequest(request, null, function (response) {
        // console.log(response.statusCode + ' ' + response.statusMessage)
        let responseBody = ''
        response.on('data', function (chunk) {
          responseBody += chunk
        })
        response.on('end', function (chunk) {
          // console.log('Response body: ' + responseBody)

          resolve({
            statusCode: response.statusCode,
            statusMessage: response.statusMessage,
            body: JSON.parse(responseBody),
          })
        })
      }, function (error) {
        reject(error)
      })
    })
  },

  bulk: async (arrayOfJson = []) => {
    const request = createRequest()

    request.method = 'POST'
    request.path += '_bulk'
    request.headers['host'] = domain
    request.headers['Content-Type'] = 'application/x-ndjson'

    for (const json of arrayOfJson) {
      request.body += JSON.stringify(json) + '\n'
    }

    /**
     * Added because of HTTP 400 Bad Request error
     * {"type":"action_request_validation_exception","reason":"Validation Failed: 1: no requests added;"
     */
    request.body += '\n\n'
    // Content-Length is only needed for DELETE requests that include a request
    // body, but including it for all requests doesn't seem to hurt anything.
    // request.headers['Content-Length'] = Buffer.byteLength(request.body)

    signRequest(request)

    const client = new AWS.HttpClient()

    return new Promise((resolve, reject) => {
      client.handleRequest(request, null, function (response) {
        // console.log(response.statusCode + ' ' + response.statusMessage)
        let responseBody = ''
        response.on('data', function (chunk) {
          responseBody += chunk
        })
        response.on('end', function (chunk) {
          // console.log('Response body: ' + responseBody)

          resolve({
            statusCode: response.statusCode,
            statusMessage: response.statusMessage,
            body: JSON.parse(responseBody),
          })
        })
      }, function (error) {
        reject(error)
      })
    })
  },

  bulkDeleteIndex: async ({ indexName, documentsArray = [] }) => {
    const request = createRequest()

    request.method = 'POST'
    request.path += indexName + '/_bulk'
    request.headers['host'] = domain
    request.headers['Content-Type'] = 'application/x-ndjson'

    for (const docId of documentsArray) {
      request.body += JSON.stringify({
        delete: {
          _id: docId,
          _index: indexName,
        },
      }) + '\n'
    }

    /**
     * Added because of HTTP 400 Bad Request error
     * {"type":"action_request_validation_exception","reason":"Validation Failed: 1: no requests added;"
     */
    request.body += '\n\n'
    // Content-Length is only needed for DELETE requests that include a request
    // body, but including it for all requests doesn't seem to hurt anything.
    // request.headers['Content-Length'] = Buffer.byteLength(request.body)

    signRequest(request)

    const client = new AWS.HttpClient()

    return new Promise((resolve, reject) => {
      client.handleRequest(request, null, function (response) {
        // console.log(response.statusCode + ' ' + response.statusMessage)
        let responseBody = ''
        response.on('data', function (chunk) {
          responseBody += chunk
        })
        response.on('end', function (chunk) {
          // console.log('Response body: ' + responseBody)

          resolve({
            statusCode: response.statusCode,
            statusMessage: response.statusMessage,
            body: JSON.parse(responseBody),
          })
        })
      }, function (error) {
        reject(error)
      })
    })
  },

  search: async ({ indexName, searchConfig = {}, queryParams = {} }) => {
    const request = createRequest()

    request.method = 'GET'
    request.path += indexName + '/_search' + '?' + querystring.stringify(queryParams)
    request.body = JSON.stringify(searchConfig)

    request.headers['host'] = domain
    request.headers['Content-Type'] = 'application/json'
    // Content-Length is only needed for DELETE requests that include a request
    // body, but including it for all requests doesn't seem to hurt anything.
    request.headers['Content-Length'] = Buffer.byteLength(request.body)

    signRequest(request)

    const client = new AWS.HttpClient()

    return new Promise((resolve, reject) => {
      client.handleRequest(request, null, function (response) {
        // console.log(response.statusCode + ' ' + response.statusMessage)
        let responseBody = ''
        response.on('data', function (chunk) {
          responseBody += chunk
        })
        response.on('end', function (chunk) {
          // console.log('Response body: ' + responseBody)

          resolve({
            statusCode: response.statusCode,
            statusMessage: response.statusMessage,
            body: JSON.parse(responseBody),
          })
        })
      }, function (error) {
        reject(error)
      })
    })
  },

  count: async ({ indexName, searchConfig = {} }) => {
    const request = createRequest()

    request.method = 'GET'
    request.path += indexName + '/_count'
    request.body = JSON.stringify(searchConfig)

    request.headers['host'] = domain
    request.headers['Content-Type'] = 'application/json'
    // Content-Length is only needed for DELETE requests that include a request
    // body, but including it for all requests doesn't seem to hurt anything.
    request.headers['Content-Length'] = Buffer.byteLength(request.body)

    signRequest(request)

    const client = new AWS.HttpClient()

    return new Promise((resolve, reject) => {
      client.handleRequest(request, null, function (response) {
        // console.log(response.statusCode + ' ' + response.statusMessage)
        let responseBody = ''
        response.on('data', function (chunk) {
          responseBody += chunk
        })
        response.on('end', function (chunk) {
          // console.log('Response body: ' + responseBody)

          resolve({
            statusCode: response.statusCode,
            statusMessage: response.statusMessage,
            body: JSON.parse(responseBody),
          })
        })
      }, function (error) {
        reject(error)
      })
    })
  },

  settings: async ({ indexName, settings = {} }) => {
    const request = createRequest()

    request.method = 'PUT'
    request.path += indexName
    request.body = JSON.stringify(settings)
    request.headers['host'] = domain
    request.headers['Content-Type'] = 'application/json'
    // Content-Length is only needed for DELETE requests that include a request
    // body, but including it for all requests doesn't seem to hurt anything.
    request.headers['Content-Length'] = Buffer.byteLength(request.body)

    signRequest(request)

    const client = new AWS.HttpClient()

    return new Promise((resolve, reject) => {
      client.handleRequest(request, null, function (response) {
        // console.log(response.statusCode + ' ' + response.statusMessage)
        let responseBody = ''
        response.on('data', function (chunk) {
          responseBody += chunk
        })
        response.on('end', function (chunk) {
          // console.log('Response body: ' + responseBody)

          resolve({
            statusCode: response.statusCode,
            statusMessage: response.statusMessage,
            body: JSON.parse(responseBody),
          })
        })
      }, function (error) {
        reject(error)
      })
    })
  },
}

module.exports.S3 = {
  download: ({ bucketName, keyName, localDest }) => {
    const s3 = new AWS.S3()

    if (typeof localDest === 'undefined') {
      localDest = keyName
    }

    const params = {
      Bucket: bucketName,
      Key: keyName,
    }

    const file = fs.createWriteStream(localDest)

    return new Promise((resolve, reject) => {
      s3.getObject(params).createReadStream()
        .on('end', async () => {
          return resolve(file.path)
        })
        .on('error', (error) => {
          return reject(error)
        }).pipe(file)
    })
  },

  upload: ({
    bucketName, keyName, fileStream, contentType,
    contentDisposition = 'inline', acl = 'public-read',
  }) => {
    const s3 = new AWS.S3()

    return new Promise((resolve, reject) => {
      s3.upload({
        Bucket: bucketName,
        Key: keyName,
        Body: fileStream,
        ContentType: contentType,
        ContentDisposition: contentDisposition,
        ACL: acl,
      }, async (err, data) => {
        if (err) return reject(err)

        return resolve(data)
      })
    })
  },

  deleteObject: async ({ bucketName, keyName }) => {
    const s3 = new AWS.S3()

    return s3.deleteObject({
      Bucket: bucketName,
      Key: keyName,
    }).promise()
  },

  deleteObjects: async ({ bucketName, objects }) => {
    const s3 = new AWS.S3()

    return s3.deleteObjects({
      Bucket: bucketName,
      Delete: {
        Objects: objects,
      },
    }).promise()
  },

  getPresignedUrl: async (method, params = {}) => {
    const s3 = new AWS.S3()

    return s3.getSignedUrlPromise(method, params)
  },
}

module.exports.SQS = {
  bulkSendMessage: async ({ messages = {} }) => {
    const SQS = new AWS.SQS({
      region,
    })

    return SQS.sendMessageBatch(messages).promise()
  },

  sendMessage: async ({ message = {} }) => {
    const SQS = new AWS.SQS({
      region,
    })

    return SQS.sendMessage(message).promise()
  },
}
