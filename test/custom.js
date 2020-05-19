const DateExp = require('../src/')

// sample mutations
const customMutations = [
  [
    /(学部3年|B3)/i,
    { y: [2015, 2016], m: [4, 3], d: [1, 31], h: 'f' },
    'a'
  ],
  [
    /旅行/,
    [
      { y: [2015], m: [9], d: [3, 4], h: 'f' },
      { y: [2017], m: [3], d: [5, 6], h: 'f' },
      { y: [2019], m: [2], d: [21, 25], h: 'f' },
      { y: [2019], m: [4], d: [5, 7], h: 'f' },
      { y: [2019], m: [9], d: [14, 16], h: 'f' }
    ],
    'a'
  ],
  [
    /(インターンシップ|インターン)/,
    [
      { y: [2015], m: [8, 9], d: [10, 4], h: 'f' },
      { y: [2017], m: [8, 9], d: [14, 29], h: 'f' }
    ],
    'a'
  ],
  [
    /ハッピーデー/,
    [
      { m: [8], d: [8], h: 'f' },
      { m: [11], d: [11], h: 'f' }
    ],
    'a'
  ],
  [
    /JSConf/i,
    { y: [2019], m: [11, 12], d: [30, 1], h: 'f' },
    'a'
  ]
]

const registerSampleCustomMutations = () => {
  DateExp.clearCustomMutations()
  for (const mut of customMutations) {
    const [expression, mutation, kind] = mut
    DateExp.addCustomMutation(expression, mutation, kind)
  }
}

module.exports = {
  registerSampleCustomMutations
}
