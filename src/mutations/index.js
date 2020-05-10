const { basicMutations } = require('./basic')

const getReservedExpressions = () => {
  return basicMutations.map(item => item[0])
}

const getDefaultMutations = () => {
  return basicMutations
}

module.exports = {
  getReservedExpressions,
  getDefaultMutations
}
