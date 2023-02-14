const mongoose = require('mongoose')
const { UserInputError } = require('apollo-server-express')

const { User } = require('../mongo/user')

const { USER_PASSWORD_REQUIRED } = require('../constants/errorMessages')
const argon2 = require('../utils/argon2')

module.exports.findByEmail = async ({ email }) => {
  return User.findOne({ email })
}

module.exports.findById = async (id) => {
  return User.findById(id)
}

module.exports.createUser = async (input) => {
  return User.create(input)
}

module.exports.validateUser = async function (id) {
  const userId = mongoose.Types.ObjectId(id)
  const user = await User.findById(userId)
  if (!user) {
    return false
  }
  return true
}

module.exports.checkUserIfAlreadyExist = async (input) => {
  const userExists = await User.findOne({
    $or: [{ _id: input.user_id }, { email: input.billing_info.email }],
  })
  if (!userExists) {
    if (!input.billing_info.password) throw new UserInputError(USER_PASSWORD_REQUIRED)
    const hashedPassword = await argon2.hash(input.billing_info.password)

    // delete we don't need it anymore in billing_info
    delete input.billing_info.password

    const userPayload = {
      _id: mongoose.Types.ObjectId(input.user_id),
      email: input.billing_info.email,
      password: hashedPassword,
      first_name: input.billing_info.first_name,
      last_name: input.billing_info.last_name,
      gender: null,
      date_of_birth: null,
      shipping_info: input.shipping_info,
      billing_info: input.billing_info,
    }

    await this.createUser(userPayload)
  }
}

module.exports.findOneUserAndUpdate = async (userId, input) => {
  const user = await User.findById(userId)

  if (!user) return null

  return User.findByIdAndUpdate(userId, {
    ...input,
  }, {
    new: true,
  })
}

module.exports.findByVerificationToken = async (token) => {
  return User.findOne({ verification_token: token })
}

module.exports.findAndUpdateByEmail = async (email, update = {}) => {
  return User.findOneAndUpdate({ email: email }, { ...update }, { new: true })
}

module.exports.findByResetToken = async (token) => {
  return User.findOne({ reset_token: token })
}
