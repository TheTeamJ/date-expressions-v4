const { a } = require('./')
const { absoluteMutations } = require('./absolute')
const { relativeMutations } = require('./relative')

const basicMutations = [
  // Custom expressions
  [
    /旅行/,
    a([
      { y: [2015], m: [9], d: [3, 4], h: 'f' },
      { y: [2017], m: [3], d: [5, 6], h: 'f' },
      { y: [2019], m: [2], d: [21, 25], h: 'f' },
      { y: [2019], m: [4], d: [5, 7], h: 'f' },
      { y: [2019], m: [9], d: [14, 16], h: 'f' }
    ])
  ],
  [
    /(インターン|インターンシップ)/,
    a([
      { y: [2015], m: [8, 9], d: [10, 4], h: 'f' },
      { y: [2017], m: [8, 9], d: [14, 29], h: 'f' }
    ])
  ],
  [
    /ハッピーデー/,
    a([
      { m: [8], d: [8], h: 'f' },
      { m: [11], d: [11], h: 'f' }
    ])
  ],
  [
    /JSConf/i,
    a({ y: [2019], m: [11, 12], d: [30, 1], h: 'f' })
  ],

  ...absoluteMutations,
  ...relativeMutations
]

module.exports = {
  basicMutations
}
