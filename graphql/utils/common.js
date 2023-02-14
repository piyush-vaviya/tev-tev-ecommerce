module.exports.toUrlSafeString = (text) => {
  return text.replace(/\s|_/, '-').replace(/[^a-zA-Z\d-]/, '')
}
