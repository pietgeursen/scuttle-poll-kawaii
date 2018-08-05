var h = require('hyperscript')
var {keyToBase64} = require('../lib/key-to-base64.js')

module.exports = {
  Polls,
  PollShow
}

function PollShow (poll, encodedPollKey) {
  var myPosition = poll.myPosition

  return h('div.Poll', [
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

  function editOrCreatePosition (myPosition) {
    return myPosition
      ? h('div', [
        h('h3', `You have already participated in this poll. Your current position is: ${myPosition.choice}`),
        h('a', { href: `/polls/${encodedPollKey}/positions/edit` }, 'Edit your position')
      ])
      : h('div', [
        h('h3', "You haven't participated in this poll yet."),
        h('a', { href: `/polls/${encodedPollKey}/positions/new` }, 'Have your say')
      ])
  }
}

function Polls (polls, filter) {
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
