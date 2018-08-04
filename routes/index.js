var express = require('express')
var router = express.Router()
var pull = require('pull-stream')
var h = require('hyperscript')

var render = require('../views/')
var Polls = require('../views/polls')
var {base64ToKey} = require('../lib/key-to-base64.js')

function createRouter (sbot, poll) {
  router.get('/:id/positions/new', function (req, res, next) {
    var encodedPollKey = req.params.id
    pull(
      pull.once(encodedPollKey),
      pull.map(base64ToKey),
      pull.drain(function (key) {
        res.send(key)
      })
    )
  })
  router.get('/:id', function (req, res, next) {
    var encodedPollKey = req.params.id
    pull(
      pull.once(encodedPollKey),
      pull.map(base64ToKey),
      pull.asyncMap(poll.poll.async.get),
      pull.through(console.log),
      pull.drain(function (poll) {
        var myPosition = poll.myPosition
        function editOrCreatePosition (myPosition) {
          return myPosition
            ? h('div', [
              h('h3', `You have already participatd in this poll. Your current position is: ${myPosition.choice}`),
              h('a', { href: `/polls/${encodedPollKey}/positions/new`}, 'Edit your position')
            ])
            : h('div', [
              h('h3', "You haven't participated in this poll yet."),
              h('a', { href: `/polls/${encodedPollKey}/positions/edit`}, 'Have your say')
            ])
        }

        var elem = h('div.Poll', [
          h('div.title',
            h('h1', poll.title)
          ),
          h('div.body', poll.body),
          editOrCreatePosition(myPosition),
          h('section.PollResults', [
            h('h3', 'Current Results'),
            poll.results.map(function (result) {
              var count = Object.keys(result.voters).length
              return h('div.choice', [
                h('div.header', [
                  result.choice,
                  h('span.count', ['(', count, ')'])
                ]),
                h('div.positions', Object.keys(result.voters).map(function (voter) {
                  return h('div.voter', voter)
                }))
              ])
            })
          ])
        ])
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
