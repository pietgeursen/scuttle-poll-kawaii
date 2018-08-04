var express = require('express')
var router = express.Router()
var pull = require('pull-stream')

var render = require('../views/')
var Polls = require('../views/polls')

function createRouter (sbot, poll) {
  return router.get('/', function (req, res, next) {
    pull(
      // TODO: make the query filter not blow up the poll.poll.pull. thing
      poll.poll.pull[req.query.filter || 'all']({reverse: true, live: false}),
      pull.filter(poll.poll.sync.isPoll),
      pull.asyncMap(getPoll),
      pull.collect(renderPolls)
    )
    function renderPolls (err, polls) {
      // if (err) { return 500 }
      console.log(err)
      res.send(render(Polls(polls)))
    }
  })

  function getPoll (msg, cb) {
    poll.poll.async.get(msg.key, cb)
  }
}

module.exports = createRouter
