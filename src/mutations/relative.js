const { r } = require('./')

const relativeMutations = [
  [
    /2年前/,
    r([{ y: 'I-2', m: 'f', d: 'f', h: 'f' }])
  ],
  [
    /2[ヶヵか]月前/,
    r([{ m: 'I-2', d: 'f', h: 'f' }])
  ]
]

module.exports = {
  relativeMutations
}
