var express = require('express')
var router = express.Router()
var pull = require('pull-stream')
var h = require('hyperscript')

var render = require('../views/')
var {Polls, PollShow, PollNew} = require('../views/polls')
var { PositionEdit } = require('../views/positions')
var {base64ToKey} = require('../lib/key-to-base64.js')

var editOrNewRegex = '/:id/positions/edit|/:id/positions/new'

function createRouter (sbot, poll) {
  router.get('/new', function (req, res) {
    var pollType = req.query.type
    var elem = PollNew(pollType)
    res.send(render(elem))
  })

  router.post('/', function (req, res) {

  })
  router.get(editOrNewRegex, function (req, res, next) {
    var encodedPollKey = req.params.id

    pull(
      pull.once(encodedPollKey),
      pull.map(base64ToKey),
      pull.asyncMap(poll.poll.async.get),
      pull.drain(function (poll) {
        var elem = PositionEdit[poll.type](poll)
        res.send(render(elem))
      })
    )
  })
  router.get('/:id', function (req, res, next) {
    var encodedPollKey = req.params.id
    pull(
      pull.once(encodedPollKey),
      pull.map(base64ToKey),
      pull.asyncMap(poll.poll.async.get),
      pull.drain(function (poll) {
        var elem = PollShow(poll, encodedPollKey)
        res.send(render(elem))
      })
    )
  })

  router.get('/', function (req, res, next) {
    pull(
      // TODO: make the query filter not blow up the poll.poll.pull. thing
      poll.poll.pull[req.query.filter || 'all']({reverse: true, live: false}),
      pull.filter(poll.poll.sync.isPoll),
      pull.asyncMap(getPoll),
      pull.collect(renderPolls)
    )
    function renderPolls (err, polls) {
      // if (err) { return res.send(500)}
      console.log(err)
      res.send(render(Polls(polls)))
    }
  })

  function getPoll (msg, cb) {
    poll.poll.async.get(msg.key, cb)
  }

  return router
}

module.exports = createRouter
