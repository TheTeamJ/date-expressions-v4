const { a, r } = require('./')

const basicMutations = {
  '(2015年)': a([{ y: [2015], m: 'f', d: 'f', h: 'f' }]),
  '(夏)': a([{ m: [6, 8], d: 'f', h: 'f' }]),
  '(冬)': a([{ y: ['+0', '+1'], m: [12, 2], d: 'f', h: 'f' }]),
  '(今日)': a({ m: 'I', d: [10], h: 'f' }), // 「今日」は5月10日としてシミュレート
  '(今月)': a({ m: [5], d: 'f', h: 'f' }), // 「今月」は5月としてシミュレート
  '(11日)': a({ d: [11], h: 'f' }),
  '(インターン)': a([
    { y: [2015], m: [8, 9], d: [10, 4], h: 'f' },
    { y: [2017], m: [8, 9], d: [14, 29], h: 'f' }
  ]),
  '(午後)': a({ h: [12, 23] }),
  '(2年前)': r([{ y: 'I-2', m: 'f', d: 'f', h: 'f' }]),
  '(2ヶ月前)': r([{ m: 'I-2', d: 'f', h: 'f' }])
}

// console.log(basicMutations)

module.exports = {
  basicMutations
}
