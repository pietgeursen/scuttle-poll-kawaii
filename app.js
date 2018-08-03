var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')

var IndexRouter = require('./routes/index')

var Poll = require('scuttle-poll')

function App (cb) {
  var sbot = require('./start-sbot')()
  var app = express()
  app.use(logger('dev'))
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(cookieParser())
  app.use(express.static(path.join(__dirname, 'public')))

  var poll = Poll(sbot)
  var indexRouter = IndexRouter(sbot, poll)

  app.use('/polls', indexRouter)
  cb(null, app)
}

module.exports = App
