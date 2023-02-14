const argon2 = require('argon2')

const algo = argon2.argon2id

module.exports.hash = async (password) => {
  return argon2.hash(password, {
    type: algo,
  })
}

module.exports.verify = async (hashedPassword, plainPassword) => {
  return argon2.verify(hashedPassword, plainPassword)
}
