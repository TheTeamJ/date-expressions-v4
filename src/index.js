const { mergeMutations } = require('./mutations/merge')
const { basicMutations } = require('./mutations/basics')
const { intersect } = require('./intersection/')
const { expandFillUnits } = require('./expand/')
const { debug } = require('./lib')
const util = require('util')

const log = x => {
  console.log(util.inspect(x, false, null, true))
}

const sample1 = [
  // basicMutations['(2015年)'],
  basicMutations['(今日)'],
  basicMutations['(午後)'],
  // basicMutations['(11日)'],
  // basicMutations['(夏)'],
  // basicMutations['(今月)']
  // basicMutations['(インターン)'],
  // basicMutations['(B3)']
]

const sample2 = [
  basicMutations['(2015年)'],
  // basicMutations['(今月)'],
  // basicMutations['(冬)'],
  basicMutations['(11日)']
  // basicMutations['(インターン)'],
]
// debug(sample)

const res = mergeMutations(sample2) // まだfを含む状態
console.log('res: OR:')
log(res)
console.log('------------------')
const rangesGroup = expandFillUnits(res) // moment-ranges group

