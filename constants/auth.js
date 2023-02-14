module.exports.ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  DESIGNER: 'designer',
  SHIPPING: 'shipping',
}

/**
 * Expirations in seconds
 */
module.exports.EXPIRATIONS = {
  VERIFICATION_TOKEN: 86400, // 24 hours
  RESET_TOKEN: 86400, // 24 hours
}

module.exports.PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
