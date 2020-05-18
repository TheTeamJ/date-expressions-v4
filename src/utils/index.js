const { sortBy } = require('lodash')
const moment = require('moment-timezone')
const { basicMutations } = require('../mutations/basics')

const tz = 'Asia/Tokyo'
const now = moment.tz(tz)

const parse = (expression) => {
  const patternTexts = Object.keys(basicMutations)
  const patterns = patternTexts.map(p => new RegExp(p, 'i'))
  const res = []
  for (const [idx, regexp] of patterns.entries()) {
    const matched = expression.match(regexp) || []
    if (matched.length === 0) continue
    const [whole] = matched
    const action = {
      indexOf: expression.indexOf(whole),
      regexp,
      mutations: basicMutations[patternTexts[idx]],
      whole
    }
    if (typeof action.mutations === 'function') {
      action.mutations = action.mutations(matched, now.clone())
    }
    expression = expression.replace(whole, '*'.repeat(whole.length))
    res.push(action)
  }
  const unhandledExpression = expression.replace(/\*/g, '')
  return { actions: sortBy(res, 'indexOf'), unhandledExpression }
}

const format = (ranges, fmt = 'YYYY/MM/DD HH:mm') => {
  const res = []
  // range: [momentObject, momentObject]
  for (const range of ranges) {
    res.push([
      moment.tz(range[0], tz).format(fmt),
      moment.tz(range[1], tz).format(fmt)
    ])
  }
  return res
}

module.exports = {
  parse,
  format
}
