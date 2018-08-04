var h = require('hyperscript')

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
  return h('div.Poll', [
    h('div.title',
      h('a', {href: `/polls/${poll.key}`}, poll.title)
    )
  ])
}
