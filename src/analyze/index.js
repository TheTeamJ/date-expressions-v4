const { parse } = require('../utils/')

const analyzeQueryExpression = ({ expression, delimiter, customMutations }) => {
  const { actions, unhandledExpression } = parse(expression, undefined, customMutations || [])
  const handled = actions.map(action => action.whole)
  let unhandled = unhandledExpression
  if (delimiter && delimiter.length > 0) {
    unhandled = unhandled.split(delimiter).filter(x => !!x)
  }
  return { handled, unhandled }
}

module.exports = {
  analyzeQueryExpression
}
