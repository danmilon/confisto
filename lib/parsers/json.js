module.exports = function (data, cb) {
  try {
    data = JSON.parse(data)
  } catch (ex) {
    return cb(ex)
  }
  cb(null, data)
}