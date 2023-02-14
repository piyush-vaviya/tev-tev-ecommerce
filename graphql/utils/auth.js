module.exports.hasRole = (currentRoles = [], allowedRole) => {
  return currentRoles.includes(allowedRole)
}

module.exports.authorize = (currentRoles = [], allowedRoles = []) => {
  for (const role of allowedRoles) {
    if (currentRoles.includes(role)) return true
  }

  return false
}
