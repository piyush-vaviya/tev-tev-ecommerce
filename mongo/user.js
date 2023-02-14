const mongoose = require('mongoose')
const Schema = mongoose.Schema

const { connections, CONNECTION_NAMES } = require('./index')

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: String,
  first_name: String,
  last_name: String,
  gender: {
    type: String,
    default: null,
  },
  date_of_birth: {
    type: Date,
    default: null,
  },
  verification_token: String,
  verification_token_created_at: Date,
  is_verified: {
    type: Boolean,
    default: false,
  },
  verified_at: Date,
  reset_token: String,
  reset_token_created_at: Date,
  shipping_info: {
    first_name: String,
    last_name: String,
    street: String,
    city: String,
    state: String,
    zipcode: String,
  },
  billing_info: {
    first_name: String,
    last_name: String,
    street: String,
    city: String,
    state: String,
    zipcode: String,
  },
  roles: [{
    type: String,
  }],
}, {
  collection: 'users',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})

UserSchema.method('toJSON', function () {
  var user = this.toObject()
  user.id = user._id
  delete user._id
  delete user.password
  delete user.verification_token
  delete user.verification_token_created_at
  delete user.reset_token
  delete user.reset_token_created_at
  delete user.created_at
  delete user.updated_at
  delete user.__v
  return user
})

module.exports.User = connections[CONNECTION_NAMES.CORE].model('User', UserSchema)
module.exports.UserSchema = UserSchema
