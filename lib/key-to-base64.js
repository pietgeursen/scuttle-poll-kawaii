module.exports = {
  keyToBase64: function (key) {
    return Buffer.from(key).toString('base64')
  },

  base64ToKey: function (encoded) {
    return Buffer.from(encoded, 'base64').toString('ascii')
  }
}
