const { a, r } = require('./')

const basicMutations = {
  '(夏)': a([{ m: [6, 8], d: 'f', h: 'f' }]),
  '(2年前)': r([{ y: 'I-2', m: 'f', d: 'f', h: 'f' }]),
  '(2ヶ月前)': r([{ m: 'I-2', d: 'f', h: 'f' }])
}

console.log(basicMutations)

module.exports = {
  basicMutations
}
