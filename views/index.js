var h = require('hyperscript')

module.exports = function render (content) {
  return h('html', [
    h('head', [
      h('title', 'Scuttle Polls!'),
      h('link', {rel: 'stylesheet', href: '/stylesheets/style.css'})
    ]),
    h('body', [
      content
    ])
  ])
    .outerHTML
}
