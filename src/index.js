const { mergeMutations } = require('./mutations/merge')
const { intersect } = require('./intersection/')
const { basicMutations } = require('./mutations/basics')
// const { debug } = require('./lib')

const sample1 = [
  basicMutations['(午後)'],
  // basicMutations['(2015年)'],
  // basicMutations['(今日)']
  // basicMutations['(11日)'],
  // basicMutations['(夏)'],
  // basicMutations['(今月)']
  basicMutations['(インターン)'],
  basicMutations['(B3)']
]

const sample2 = [
  basicMutations['(2015年)'],
  basicMutations['(今月)'],
  basicMutations['(11日)']
]
// debug(sample)

const res = mergeMutations(sample2)
intersect(res)
// debug(res)
