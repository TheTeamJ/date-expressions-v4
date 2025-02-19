const { a } = require('./')

const absoluteMutations = [
  [
    // YYYY/MM/DD
    /(\d{4})[/-](\d{1,2})[/-](\d{1,2})/,
    matched => a([{ y: [matched[1]], m: [matched[2]], d: [matched[3]], h: 'f' }])
  ],
  [
    // YYYY/MM
    /(\d{4})[/-](\d{1,2})/,
    matched => a([{ y: [matched[1]], m: [matched[2]], d: 'f', h: 'f' }])
  ],
  [
    // MM/DD
    /(\d{1,2})[/-](\d{1,2})/,
    matched => a([{ m: [matched[1]], d: [matched[2]], h: 'f' }])
  ],
  [
    // HH:00
    /(\d{1,2}):00/,
    matched => a({ h: [matched[1]] })
  ],
  [
    /(\d{4})年?/,
    matched => a([{ y: [matched[1]], m: 'f', d: 'f', h: 'f' }])
  ],
  [
    /(\d{1,2})月/,
    matched => a([{ m: [matched[1]], d: 'f', h: 'f' }])
  ],
  [
    /(\d{1,2})日/,
    matched => a({ d: [matched[1]], h: 'f' })
  ],
  [
    /(\d{1,2})時/,
    matched => a({ h: [matched[1]] })
  ],
  [
    /春/,
    a([{ m: [3, 5], d: 'f', h: 'f' }])
  ],
  [
    /夏/,
    a([{ m: [6, 8], d: 'f', h: 'f' }])
  ],
  [
    /秋/,
    a([{ m: [9, 11], d: 'f', h: 'f' }])
  ],
  [
    /冬/,
    a([{ m: [1, 2], d: 'f', h: 'f' }, { m: [12], d: 'f', h: 'f' }])
  ],
  [
    /今日/,
    (_, base) => a({ m: 'I', d: [base.date()], h: 'f' })
  ],
  [
    /今月/,
    (_, base) => {
      const m = base.month() + 1
      return a({ m: [m], d: 'f', h: 'f' })
    }
  ],
  [
    /先月/,
    (_, base) => {
      const lastMonth = base.clone().add(-1, 'month')
      const m = lastMonth.month() + 1
      if (lastMonth.year() === base.year()) {
        return a({ m: [m], d: 'f', h: 'f' })
      } else {
        return a({ y: ['-1'], m: [m], d: 'f', h: 'f' })
      }
    }
  ],
  [
    /(今年|本年)/,
    (_, base) => a({ y: [base.year()], m: 'f', d: 'f', h: 'f' })
  ],
  [
    /(去年|昨年)/,
    (_, base) => a({ y: [base.year() - 1], m: 'f', d: 'f', h: 'f' })
  ],
  [
    /(年末)/,
    a({ m: [12], d: [26, 31], h: 'f' })
  ],
  [
    /(元旦|元日)/,
    a({ m: [1], d: [1], h: 'f' })
  ],
  [
    /(午前中?)/,
    a({ h: [0, 11] })
  ],
  [
    /午後/,
    a({ h: [12, 23] })
  ],
  [
    /未明/,
    a({ h: [0, 2] })
  ],
  [
    /朝/,
    a({ h: [6, 8] })
  ],
  [
    /昼頃?/,
    a({ h: [11, 12] })
  ],
  [
    /夕方/,
    a({ h: [15, 17] })
  ],
  [
    /夜/,
    a({ h: [18, 23] })
  ],
  [
    /ここ(\d+)年/,
    (matched, base) => {
      const delta = parseInt(matched[1]) - 1
      return a({ y: [base.year() - delta, base.year()], m: 'f', d: 'f', h: 'f' })
    }
  ],
  [
    /(今頃|今ごろ)/,
    (_, base) => {
      const l = base.clone().add(-1, 'month')
      const mL = l.month() + 1
      const r = base.clone().add(+1, 'month')
      const mR = r.month() + 1
      if (l.year() !== base.year()) {
        return a({ y: ['-1', '+0'], m: [mL, mR], d: 'f', h: 'f' })
      } else if (r.year() !== base.year()) {
        return a({ y: ['+0', '+1'], m: [mL, mR], d: 'f', h: 'f' })
      } else {
        return a({ m: [mL, mR], d: 'f', h: 'f' })
      }
    }
  ]
]

module.exports = {
  absoluteMutations
}
