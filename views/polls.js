var h = require('hyperscript')
var {keyToBase64} = require('../lib/key-to-base64.js')

module.exports = function Polls (polls, filter) {
  return h('div.Polls',
    [
      h('h1', 'Polls'),
      h('span', [
        Link('all'),
        Link('open'),
        Link('closed'),
        Link('mine')
      ]),
      h('div.polls', polls.map(PollSummary))
    ]
  )
}

function Link (name, filter) {
  filter = filter || 'all'
  return h('a', {
    href: `/polls?filter=${name}`,
    className: filter === name ? '-active' : ''
  },
  name
  )
}

function PollSummary (poll) {
  var encodedKey = keyToBase64(poll.key)
  return h('div.Poll', [
    h('div.title',
      h('a', {href: `/polls/${encodedKey}`}, poll.title)
    )
  ])
}
