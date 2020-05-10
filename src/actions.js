const { sortBy } = require('lodash')
const { getDefaultMutations } = require('./mutations/')

// 選択された表現を登場順に返す
const divideIntoActions = (expression, customMutations = []) => {
  const res = []
  for (const mut of [...customMutations, ...getDefaultMutations()]) {
    const regexp = mut[0]
    const matched = expression.match(regexp) || []
    if (matched.length === 0) continue
    const [whole] = matched
    const action = {
      indexOf: expression.indexOf(whole),
      mutation: {
        regexp: mut[0],
        func: mut[1]
      },
      whole
    }
    expression = expression.replace(whole, '*'.repeat(whole.length))
    res.push(action)
  }
  const unhandledExpression = expression.replace(/\*/g, '')
  return { actions: sortBy(res, 'indexOf'), unhandledExpression }
}

module.exports = {
  divideIntoActions
}
