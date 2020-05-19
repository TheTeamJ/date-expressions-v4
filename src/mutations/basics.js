const { absoluteMutations } = require('./absolute')
const { relativeMutations } = require('./relative')

const basicMutations = [
  ...absoluteMutations,
  ...relativeMutations
]

module.exports = {
  basicMutations
}
