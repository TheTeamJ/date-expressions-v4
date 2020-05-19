const { sortBy } = require('lodash')
const moment = require('moment-timezone')
const { basicMutations } = require('../mutations/basics')

const parse = (expression, baseMomentDate) => {
  // const patternTexts = Object.keys(basicMutations)
  // const patterns = patternTexts.map(p => new RegExp(p, 'i'))
  const patterns = basicMutations.map(m => m[0])
  const res = []
  for (const [idx, regexp] of patterns.entries()) {
    const matched = expression.match(regexp) || []
    if (matched.length === 0) continue
    const [whole] = matched
    const action = {
      indexOf: expression.indexOf(whole),
      regexp,
      mutations: basicMutations[idx][1],
      whole
    }
    if (typeof action.mutations === 'function') {
      action.mutations = action.mutations(matched, baseMomentDate.clone())
    }
    // 基準時刻を記録する
    for (let j = 0; j < action.mutations.length; j++) {
      action.mutations[j]._base = convertMomentDateToMutation(baseMomentDate)
    }
    expression = expression.replace(whole, '*'.repeat(whole.length))
    res.push(action)
  }
  const unhandledExpression = expression.replace(/\*/g, '')
  return { actions: sortBy(res, 'indexOf'), unhandledExpression }
}

const format = (ranges, timezone, fmt) => {
  const res = []
  // range: [momentObject, momentObject]
  for (const range of ranges) {
    res.push([
      moment.tz(range[0], timezone).format(fmt),
      moment.tz(range[1], timezone).format(fmt)
    ])
  }
  return res
}

const convertMutationToMomentDate = (mutation, timezone) => {
  const { y, m, d, h } = mutation
  if (y === undefined || m === undefined || d === undefined || h === undefined) {
    throw new Error('Invalid mutation')
  }
  return moment.tz(timezone).year(y).month(m - 1).date(d).hour(h).startOf('hour')
}

const convertMomentDateToMutation = momentDate => {
  return {
    y: momentDate.year(),
    m: momentDate.month() + 1, // human friendly month
    d: momentDate.date(),
    h: momentDate.hour()
  }
}

module.exports = {
  parse,
  format,
  convertMutationToMomentDate
}
