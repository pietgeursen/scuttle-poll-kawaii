var express = require('express')
var router = express.Router()
var pull = require('pull-stream')

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

  router.post('/:id/positions', function (req, res) {
    var encodedPollKey = req.params.id
    pull(
      pull.once(encodedPollKey),
      pull.map(base64ToKey),
      pull.asyncMap(poll.poll.async.get),
      pull.asyncMap(function (thisPoll, cb) {
        var choice = Number(req.body.choice)
        var reason = req.body.reason

        // TODO: ideally we'll use poll.actions.publishPosition in the future. It has a bug at the moment tho.
        var pollType = thisPoll.type
        if (pollType === 'chooseOne') {
          poll.position.async.publishChooseOne({poll: thisPoll, choice, reason}, cb)
        } else {
          cb(new Error('Only chooseOne Positions at the moment'))
        }
      }),
      pull.drain(function (poll) {
        console.log('published position ok')
        res.redirect(`/polls/${req.params.id}`)
      })
    )
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
