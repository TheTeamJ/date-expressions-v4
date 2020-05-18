const { a, r } = require('./')

const basicMutations = {
  '(\\d{4}年?)': matched => {
    return a([{ y: [matched[1]], m: 'f', d: 'f', h: 'f' }])
  },
  '(\\d{1,2}月)': matched => {
    return a([{ m: [matched[1]], d: 'f', h: 'f' }])
  },
  '(\\d{1,2}日)': matched => {
    return a({ d: [matched[1]], h: 'f' })
  },
  '(\\d{1,2}時)': matched => {
    return a({ h: [matched[1]] })
  },
  '(B3)': a({ y: [2015, 2016], m: [4, 3], d: [1, 31], h: 'f' }),
  '(春)': a([{ m: [3, 5], d: 'f', h: 'f' }]),
  '(夏)': a([{ m: [6, 8], d: 'f', h: 'f' }]),
  '(秋)': a([{ m: [9, 11], d: 'f', h: 'f' }]),
  // '(冬)': a([{ y: ['+0', '+1'], m: [12, 2], d: 'f', h: 'f' }]),
  '(冬)': a([
    { m: [1, 2], d: 'f', h: 'f' },
    { m: [12], d: 'f', h: 'f' }
  ]),
  '(今日)': a({ m: 'I', d: [10], h: 'f' }), // 「今日」は5月10日としてシミュレート
  '(今月)': (_, base) => {
    const m = base.month() + 1
    return a({ m: [m], d: 'f', h: 'f' })
  },
  '(先月)': (_, base) => {
    const lastMonth = base.clone().add(-1, 'month')
    const m = lastMonth.month() + 1
    if (lastMonth.year() === base.year()) {
      return a({ m: [m], d: 'f', h: 'f' })
    } else {
      return a({ y: ['-1'], m: [m], d: 'f', h: 'f' })
    }
  },
  '(去年)': (_, base) => {
    return a({ y: [base.year() - 1], m: 'f', d: 'f', h: 'f' })
  },
  '(旅行)': a([
    { y: [2015], m: [9], d: [3, 4], h: 'f' },
    { y: [2017], m: [3], d: [5, 6], h: 'f' },
    { y: [2019], m: [2], d: [21, 25], h: 'f' },
    { y: [2019], m: [4], d: [5, 7], h: 'f' },
    { y: [2019], m: [9], d: [14, 16], h: 'f' }
  ]),
  '(インターン)': a([
    { y: [2015], m: [8, 9], d: [10, 4], h: 'f' },
    { y: [2017], m: [8, 9], d: [14, 29], h: 'f' }
  ]),
  '(ハッピーデー)': a([
    { m: [8], d: [8], h: 'f' },
    { m: [11], d: [11], h: 'f' }
  ]),
  '(JSConf)': a({ y: [2019], m: [11, 12], d: [30, 1], h: 'f' }),
  '(元旦|元日)': a({ m: [1], d: [1], h: 'f' }),
  '(午前中?)': a({ h: [0, 11] }),
  '(午後)': a({ h: [12, 23] }),
  'ここ(\\d+)年': matched => {
    const delta = parseInt(matched[1]) - 1
    return a({ y: [2020 - delta, 2020], m: 'f', d: 'f', h: 'f' })
  },
  '(2年前)': r([{ y: 'I-2', m: 'f', d: 'f', h: 'f' }]),
  '(2ヶ月前)': r([{ m: 'I-2', d: 'f', h: 'f' }])
}

module.exports = {
  basicMutations
}
