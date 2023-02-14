/**
 * NPM modules
 *
 */
const mongoose = require('mongoose')
const moment = require('moment')
const uuid = require('uuid')

/**
 * Local modules
 *
 */
const argon2 = require('../../../utils/argon2')
const jwt = require('../../../utils/jwt')
const { inputValidator } = require('../../utils/inputValidator')
const authErrors = require('../../errors/auth')
const {
  EMAIL_ALREADY_INUSE,
} = require('../../../constants/errorMessages')
const {
  ME_INPUT_VALIDATION,
  CHANGE_PASSWORD_VALIDATION,
  REGISTER_VALIDATION,
  CHECK_RESET_TOKEN,
  VERIFY_REGISTRATION,
  LOGIN,
  RESET_PASSWORD,
  RESEND_VERIFICATION,
} = require('../../validations/auth.js')
const APP_CONSTANTS = require('../../../constants/app')
const AUTH_CONSTANTS = require('../../../constants/auth')
const { mailVerification, mailResetPassword } = require('../../../services/email')
const { fieldValidationError, resourceNotFound } = require('../../errors/common')
const { ROLES } = require('../../../constants/auth')

/**
 * Schemas
 *
 */
const UserService = require('../../../services/users')
const { User } = require('../../../mongo/user')

/**
 * Services
 */
const { createUser } = require('../../../services/users')
const { updatePreRegistrationCartDetails } = require('../../../services/carts')

const createToken = async (user) => {
  const token = await jwt.signWithJWT({
    uid: user._id,
    roles: user.roles,
    iss: APP_CONSTANTS.AUTH.JWT.ISS,
    exp: moment().add(1, 'months').valueOf(),
  })

  return Buffer.from(token).toString('base64')
}

module.exports = {
  Query: {
    me: async (__, { ___ }, context) => {
      if (!context.jwt) {
        throw authErrors.actionNotAllowed()
      }
      const user = await User.findById(context.jwt.uid)
      return user
    },

    checkResetToken: async (parent, { input }, context) => {
      const values = inputValidator(input, CHECK_RESET_TOKEN)

      const user = await UserService.findByResetToken(values.reset_token)

      if (!user || moment().diff(moment(user.reset_token_created_at), 'seconds') > AUTH_CONSTANTS.EXPIRATIONS.RESET_TOKEN) return false

      return true
    },
  },

  Mutation: {
    login: async (parent, { input }, context) => {
      const values = inputValidator(input, LOGIN)

      const user = await UserService.findByEmail({ email: values.username })

      if (!user) throw authErrors.invalidCredentials()

      const isPasswordOk = await argon2.verify(user.password, values.password)
      if (!isPasswordOk) throw authErrors.invalidCredentials()

      const base64Token = await createToken(user)

      return {
        token: base64Token,
        me: user,
      }
    },

    register: async (parent, { input }, context) => {
      const values = inputValidator(input, REGISTER_VALIDATION)

      let user = await UserService.findByEmail({ email: values.email })

      if (user) {
        throw fieldValidationError('email', EMAIL_ALREADY_INUSE)
      }

      const hashPassword = await argon2.hash(values.password)

      const { id, ...rest } = values

      user = await createUser({
        ...rest,
        _id: mongoose.Types.ObjectId(id),
        password: hashPassword,
        verification_token: Buffer.from(uuid.v4()).toString('base64'),
        verification_token_created_at: new Date(),
        roles: [ROLES.USER],
      })

      await updatePreRegistrationCartDetails(true, id)

      const base64Token = await createToken(user)

      /**
       * Email verification
       */
      await mailVerification(user)

      return {
        token: base64Token,
        me: user,
      }
    },

    verifyRegistration: async (parent, { input }, context) => {
      const values = inputValidator(input, VERIFY_REGISTRATION)

      const user = await UserService.findByVerificationToken(values.verification_token)

      if (!user || moment().diff(moment(user.verification_token_created_at), 'seconds') > AUTH_CONSTANTS.EXPIRATIONS.VERIFICATION_TOKEN) return false

      user.verification_token = null
      user.verification_token_created_at = null
      user.is_verified = true
      user.verified_at = new Date()
      await user.save()

      return true
    },

    resendVerification: async (parent, { input }, context) => {
      const values = inputValidator(input, RESEND_VERIFICATION)

      const user = await UserService.findByVerificationToken(values.verification_token)

      if (!user) return false

      if (user.is_verified) throw authErrors.userAlreadyVerified()

      user.verification_token = Buffer.from(uuid.v4()).toString('base64')
      user.verification_token_created_at = new Date()
      await user.save()

      /**
       * Email verification
       */
      await mailVerification(user)

      return true
    },

    me: async (__, { input }, context) => {
      if (!context.jwt) {
        throw authErrors.actionNotAllowed()
      }

      const values = inputValidator(input, ME_INPUT_VALIDATION)

      const user = await UserService.findOneUserAndUpdate(context.jwt.uid, values)

      if (!user) throw resourceNotFound()

      return user
    },

    forgotPassword: async (parent, { email }, context) => {
      const resetToken = Buffer.from(uuid.v4()).toString('base64')
      const user = await UserService.findAndUpdateByEmail(email, {
        reset_token: resetToken,
        reset_token_created_at: new Date(),
      })

      if (!user) return true

      /**
       * Email the token
       */
      await mailResetPassword(user)

      return true
    },

    resetPassword: async (parent, { input }, context) => {
      const values = inputValidator(input, RESET_PASSWORD)

      const user = await UserService.findByResetToken(values.reset_token)

      if (!user || moment().diff(moment(user.reset_token_created_at), 'seconds') > AUTH_CONSTANTS.EXPIRATIONS.RESET_TOKEN) {
        return false
      }

      if (values.password !== values.confirm_password) throw authErrors.passwordNotMatch()

      user.password = await argon2.hash(values.password)
      user.reset_token = null
      user.reset_token_created_at = null
      await user.save()

      const base64Token = await createToken(user)

      return {
        token: base64Token,
        me: user,
      }
    },

    changePassword: async (parent, { input }, context) => {
      if (!context.jwt) {
        throw authErrors.actionNotAllowed()
      }

      const values = inputValidator(input, CHANGE_PASSWORD_VALIDATION)

      const user = await User.findById(context.jwt.uid)

      if (!user) throw resourceNotFound()

      user.password = await argon2.hash(values.password)
      await user.save()

      return true
    },

    test: async (parent, args, context) => {
      console.log(context.req.cookies)
      return JSON.stringify(context.req.cookies)
    },
  },
}
