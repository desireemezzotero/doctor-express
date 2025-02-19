function errorsHandler(err, req, res, next) {
  res.status(500)
  res.json({
    messagge: err.message,
    status: 500,
    error: 'Internal Server Error'
  })
}

module.exports = errorsHandler