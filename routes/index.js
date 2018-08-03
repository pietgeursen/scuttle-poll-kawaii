var express = require('express')
var router = express.Router()
var h = require('hyperscript')
var pull = require('pull-stream')

var render = require('../views/')

function createRouter (sbot, poll) {
  return router.get('/', function (req, res, next) {
    pull(
      // TODO: make the query filter not blow up the poll.poll.pull. thing
      poll.poll.pull[req.query.filter || 'all']({reverse: true, live: false}),
      pull.asyncMap(function (msg, cb) {
        poll.poll.async.get(msg.key, cb)
      }),
      pull.collect(function (err, polls) {
        var content = h('div.Polls',
          [
            h('h1', 'Polls'),
            h('span', [
              Link('all'),
              Link('open'),
              Link('closed'),
              Link('mine'),
            ]),
            h('div.polls', polls.map(Poll))
          ]
        )
        res.send(render(content))
      })
    )

    function Link (name) {
      const filter = req.query.filter || 'all'
      return h('a', {
        href: `/polls?filter=${name}`,
        className: filter === name ? '-active' : '' },
        name
      )
    }
  })
}

function Poll (poll) {
  return h('div.Poll', [
    h('div.title', poll.title)
  ])
}

module.exports = createRouter
