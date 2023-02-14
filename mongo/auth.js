/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
var Schema = mongoose.Schema

const { connections, CONNECTION_NAMES } = require('./index')

/**
 * Load related schemas
 */
require('./user')

/**
 * Schema definitions.
 */
const AuthTokenSchema = new Schema(
  {
    access_token: {
      type: String,
      unique: true,
      required: true,
    },
    access_token_expires_in: Date,
    refresh_token: {
      type: String,
      unique: true,
      required: true,
    },
    refresh_token_expires_in: Date,
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    csrf_token: {
      type: String,
      required: true,
    },
  },
  {
    collection: 'auth_tokens',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
)

module.exports.AuthTokenSchema = AuthTokenSchema
module.exports.AuthToken = connections[CONNECTION_NAMES.CORE].model(
  'AuthToken',
  AuthTokenSchema
)
