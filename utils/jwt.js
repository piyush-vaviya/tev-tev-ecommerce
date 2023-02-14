const jwt = require('jsonwebtoken')

// find the RSA pub key
const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) throw new Error('Missing JWT Secret in .env file!')

module.exports.verifyToken = (token, options = {}) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, { algorithm: 'HS256' }, function (err, decoded) {
      if (err) return reject(err)

      resolve(decoded)
    })
  })
}

module.exports.signWithJWT = (payload, options = {}) => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256', ...options }, function (err, token) {
      if (err) return reject(err)

      resolve(token)
    })
  })
}
