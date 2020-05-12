const { mergeMutations } = require('./mutations/merge')
const { basicMutations } = require('./mutations/basics')
const { debug } = require('./lib')

const sample = [
  basicMutations['(午後)'],
  // basicMutations['(2015年)'],
  // basicMutations['(今日)']
  // basicMutations['(11日)'],
  // basicMutations['(夏)'],
  // basicMutations['(今月)']
  basicMutations['(インターン)']
]
// debug(sample)

const res = mergeMutations(sample)
// debug(res)
