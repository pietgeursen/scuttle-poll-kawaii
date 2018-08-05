var h = require('hyperscript')
var {keyToBase64} = require('../lib/key-to-base64.js')

module.exports = {
  Polls,
  PollShow,
  PollNew
}

function PollNew (pollType) {
  var renderers = {
    chooseOne
  }

  function chooseOne () {
    return h('h1', [
      'Create a new Choose One poll',
      h('form', {}, [
        h('input', {type: 'text'})
      ])
    ])
  }

  function defaultRenderer () {
    return h('div', [
      h('h1', 'What sort of Poll would you like to create?'),
      h('div.pollDescription', [
        h('h2', [
          h('a', {href: '/polls/new?type=chooseOne'}, 'Choose One')
        ]),
        h('p', 'A poll with multiple choices. Participants must choose only one of the options.')
      ]),
      h('div.pollDescription', [
        h('h2', [
          h('a', {href: '/polls/new?type=dot'}, 'Dot vote')
        ]),
        h('p', 'A poll with multiple choices. Participants have a fixed number of votes which they spread across the options.')
      ]),
      h('div.pollDescription', [
        h('h2', [
          h('a', {href: '/polls/new?type=range'}, 'Range Vote')
        ]),
        h('p', 'A poll with multiple choices. Participants give each option a score according to their relative preference.')
      ]),
      h('div.pollDescription', [
        h('h2', [
          h('a', {href: '/polls/new?type=proposal'}, 'Proposal')
        ]),
        h('p', 'A poll with one choice. Participants can agree, disagree, abstain or block.')
      ])
    ])
  }

  var renderer = renderers[pollType]

  return renderer ? renderer() : defaultRenderer()
}

function PollShow (poll, encodedPollKey) {
  var myPosition = poll.myPosition
  var choices = poll.value.content.details.choices

  return h('div.Poll', [
    h('div.title',
      h('h1', poll.title)
    ),
    h('div.body', poll.body),
    h('div.choices', [
      h('h2', 'Choices: '),
      choices.map(function (choice) {
        return h('div.choice', choice)
      })
    ]),
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
      h('div.new', [
        h('a', {href: '/polls/new'}, 'Create a new poll')
      ]),
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
