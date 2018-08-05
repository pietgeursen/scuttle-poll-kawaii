var h = require('hyperscript')

module.exports = {
  PositionEdit: {
    chooseOne: function (poll) {
      var myChoice = (poll.myPosition && poll.myPosition.value.content.details.choice) || 0
      var myReason = (poll.myPosition && poll.myPosition.reason) || ''
      return h('form.newposition', { }, [
        h('div.field -choices', [
          h('label', 'choose one'),
          h('div.inputs', poll.value.content.details.choices.map((choice, index) => {
            var id = `choice-${index}`
            var checkbox = h('input', { type: 'radio', name: 'choices' })

            // this is needed because checkboxes and the "checked" property are annoying.
            if (myChoice === index) { checkbox.checked = true }

            return h('div.choice', {}, [
              checkbox,
              h('label', { for: id }, choice)
            ])
          })
          )
        ]),
        h('div.field -reason', [
          h('label', 'reason'),
          h('textarea', myReason)
        ]),
        h('div.actions', [
          h('input.-save', {type: 'submit', value: 'Publish your position'})
        ])
      ])
    }
  }
}
