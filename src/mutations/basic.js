const Moment = require('moment-timezone')
const MomentRange = require('moment-range')
const moment = MomentRange.extendMoment(Moment)
const { divideM, divideD } = require('./dvide')
const { debug, emptyRanges } = require('../lib')

const mRange = ({ m }) => {
  return function (matched, currentRanges, currentLockUnits) {
    const resRanges = []
    for (const currentRange of currentRanges) {
      let ranges = [[
        currentRange[0].clone().month(m[0] - 1).startOf('month'),
        currentRange[1].clone().month(m[1] - 1).endOf('month')
      ]]
      if (currentLockUnits.m || currentLockUnits.d || currentLockUnits.h) {
        ranges = divideM(ranges)
      }
      if (currentLockUnits.h) {
        ranges = divideD(ranges)
      }
      // if (currentLockUnits.y) inheritY(ranges, currentRange)
      // if (currentLockUnits.m) {
      //   inheritM(ranges, currentRange)
      //   // if (currentLockUnits.d || currentLockUnits.h) {
      //   ranges = intersection(currentRange, ranges)
      //   // }
      // } else {
        // if (currentLockUnits.d) inheritD(ranges, currentRange)
        // if (currentLockUnits.h) inheritH(ranges, currentRange)
      // }
      if (currentLockUnits.d) inheritD(ranges, currentRange)
      if (currentLockUnits.h) inheritH(ranges, currentRange)
      if (currentLockUnits.m) {
        debug('>>>>', currentRange, ranges)
        ranges = intersection(currentRange, ranges)
      }
      resRanges.push(...ranges)
    }
    return { ranges: resRanges, lockUnits: ['m'] }
  }
}

const hRange = ({ h }) => {
  return function (matched, currentRanges, currentLockUnits) {
    const resRanges = []
    if (currentLockUnits.m) { // この条件部いるのかな？
      currentRanges = divideD(divideM(currentRanges))
    }
    for (const currentRange of currentRanges) {
      let ranges = [[
        currentRange[0].clone().hour(h[0]).startOf('hour'),
        currentRange[1].clone().hour(h[1]).endOf('hour')
      ]]
      if (currentLockUnits.y) inheritY(ranges, currentRange)

      if (currentLockUnits.m) {
        inheritM(ranges, currentRange)
      } else {
        if (currentLockUnits.y) {
          ranges = expandM(ranges, 'minute', true)
        }
      }

      if (currentLockUnits.d) {
        inheritD(ranges, currentRange)
      } else {
        if (currentLockUnits.y && !currentLockUnits.m) {
          ranges = expandD(ranges, 'minute', true)
        }
      }
      if (currentLockUnits.h) {
        ranges = intersection(currentRange, ranges)
      }
      resRanges.push(...ranges)
    }
    return { ranges: resRanges, lockUnits: ['h'] }
  }
}

const inheritY = (ranges, currentRange) => {
  for (let i = 0; i < ranges.length; i++) {
    ranges[i][0] = ranges[i][0].set('year', currentRange[0].year())
    ranges[i][1] = ranges[i][1].set('year', currentRange[1].year())
  }
}

const inheritM = (ranges, currentRange) => {
  for (let i = 0; i < ranges.length; i++) {
    ranges[i][0] = ranges[i][0].set('month', currentRange[0].month())
    ranges[i][1] = ranges[i][1].set('month', currentRange[1].month())
  }
}

const inheritD = (ranges, currentRange) => {
  for (let i = 0; i < ranges.length; i++) {
    ranges[i][0] = ranges[i][0].set('date', currentRange[0].date())
    ranges[i][1] = ranges[i][1].set('date', currentRange[1].date())
  }
}

const inheritH = (ranges, currentRange) => {
  for (let i = 0; i < ranges.length; i++) {
    ranges[i][0] = ranges[i][0].set('hour', currentRange[0].hour())
    ranges[i][1] = ranges[i][1].set('hour', currentRange[1].hour())
  }
}

// TODO: 両端のyearが異なる場合の処理
// Y,D固定でMを展開する
const expandM = (ranges, finestUnit, useLastMonthOfYear) => {
  const res = []
  for (const range of ranges) {
    const [l, r] = range
    const vEnd = useLastMonthOfYear ? 11 : r.month()
    for (let v = l.month(); v <= vEnd; v++) {
      res.push([
        l.clone().set('month', v).set('hour', l.hour()).startOf(finestUnit),
        l.clone().set('month', v).set('hour', r.hour()).set('minute', 59).endOf(finestUnit)
      ])
    }
  }
  return res
}

// M,H固定でDを展開する
const expandD = (ranges, finestUnit, useLastDateOfMonth = false) => {
  const res = []
  for (const range of ranges) {
    const [l, r] = range
    const vEnd = useLastDateOfMonth ? l.clone().endOf('month').date() : r.date()
    for (let v = l.date(); v <= vEnd; v++) {
      res.push([
        l.clone().set('date', v).set('hour', l.hour()).startOf(finestUnit),
        l.clone().set('date', v).set('hour', r.hour()).set('minute', 59).endOf(finestUnit)
      ])
    }
  }
  return res
}

const expandY = (ranges, finestUnit, lrY) => {
  const res = []
  for (const range of ranges) {
    const [l, r] = range
    for (let v = lrY[0]; v <= lrY[1]; v++) {
      res.push([
        l.clone().set('year', v).startOf(finestUnit),
        r.clone().set('year', v).endOf(finestUnit)
      ])
    }
  }
  return res
}

const basicMutations = [
  // 絶対的な表現
  [
    /(\d{4})年?/,
    function (matched, currentRanges, currentLockUnits) {
      // if (currentLockUnits.y) return emptyRanges()
      const year = parseInt(matched[1])
      const resRanges = []
      for (const currentRange of currentRanges) {
        let ranges = [[
          currentRange[0].clone().year(year).startOf('year'),
          currentRange[1].clone().year(year).endOf('year')
        ]]
        if (currentLockUnits.m) inheritM(ranges, currentRange)
        if (currentLockUnits.y) {
          ranges = intersection(currentRange, ranges)
        }
        resRanges.push(...ranges)
      }
      return { ranges: resRanges, lockUnits: ['y'] }
    }
  ],
  [
    /(\d{1,2})月/,
    function (matched, currentRanges, currentLockUnits) {
      // if (currentLockUnits.m) return emptyRanges()
      const month = parseInt(matched[1]) - 1
      const resRanges = []
      for (const currentRange of currentRanges) {
        let ranges = [[
          currentRange[0].clone().month(month).startOf('month'),
          currentRange[1].clone().month(month).endOf('month')
        ]]
        if (currentLockUnits.y) inheritY(ranges, currentRange)
        if (currentLockUnits.d) inheritD(ranges, currentRange)
        if (currentLockUnits.h) inheritH(ranges, currentRange)
        if (currentLockUnits.m) {
          // すでにmが固定されている場合は共通部分を求める
          ranges = intersection(currentRange, ranges)
        }

        resRanges.push(...ranges)
      }
      return { ranges: resRanges, lockUnits: ['m'] }
    }
  ],
  [
    /(\d{1,2})日/,
    function (matched, currentRanges, currentLockUnits) {
      // if (currentLockUnits.d) return emptyRanges()
      const date = parseInt(matched[1])
      const resRanges = []
      currentRanges = divideM(currentRanges)
      for (const currentRange of currentRanges) {
        let ranges = [[
          currentRange[0].clone().date(date).startOf('date'),
          currentRange[1].clone().date(date).endOf('date')
        ]]
        if (currentLockUnits.m) {
          inheritM(ranges, currentRange)
        } else {
          if (currentLockUnits.y) {
            ranges = expandM(ranges, 'date')
          }
        }
        if (currentLockUnits.d) {
          ranges = intersection(currentRange, ranges)
        }
        if (currentLockUnits.h) inheritH(ranges, currentRange)
        resRanges.push(...ranges)
      }
      return { ranges: resRanges, lockUnits: ['d'] }
    }
  ],
  [
    /(\d{1,2})時/,
    function (matched, currentRanges, currentLockUnits) {
      // if (currentLockUnits.h) return emptyRanges()
      const hour = parseInt(matched[1])
      const resRanges = []
      if (currentLockUnits.m) {
        currentRanges = divideM(currentRanges)
        currentRanges = divideD(currentRanges)
      }
      for (const currentRange of currentRanges) {
        let ranges = [[
          currentRange[0].clone().hour(hour).startOf('hour'),
          currentRange[1].clone().hour(hour).endOf('hour')
        ]]
        if (currentLockUnits.d) {
          inheritD(ranges, currentRange)
        } else {
          if (currentLockUnits.m) {
            ranges = expandD(ranges, 'hour')
          } else if (currentLockUnits.y) {
            ranges = expandM(ranges, 'hour', true)
            ranges = expandD(ranges, 'hour', true)
          }
        }
        if (currentLockUnits.h) {
          ranges = intersection(currentRange, ranges)
        }
        resRanges.push(...ranges)
      }
      return { ranges: resRanges, lockUnits: ['h'] }
    }
  ],
  // m,d固定型
  [
    /(元旦|元日)/,
    function (matched, currentRanges, currentLockUnits) {
      // if (currentLockUnits.m || currentLockUnits.d) return emptyRanges()
      const resRanges = []
      for (const currentRange of currentRanges) {
        let ranges = [[
          currentRange[0].clone().month(0).date(1).startOf('date'),
          currentRange[1].clone().month(0).date(1).endOf('date')
        ]]
        if (currentLockUnits.y) inheritY(ranges, currentRange)
        if (currentLockUnits.h) inheritH(ranges, currentRange)
        if (currentLockUnits.m || currentLockUnits.d) {
          ranges = intersection(currentRange, ranges)
        }
        resRanges.push(...ranges)
      }
      return { ranges: resRanges, lockUnits: ['m', 'd'] }
    }
  ],
  [
    /(ハッピーデー)/,
    function (matched, currentRanges, currentLockUnits) {
      const resRanges = []
      for (const currentRange of currentRanges) {
        let ranges = [[
          // 8/8
          currentRange[0].clone().month(7).date(8).startOf('date'),
          currentRange[0].clone().month(7).date(8).endOf('date')
        ], [
          // 11/11
          currentRange[0].clone().month(10).date(11).startOf('date'),
          currentRange[1].clone().month(10).date(11).endOf('date')
        ]]
        if (currentLockUnits.y) inheritY(ranges, currentRange)
        if (currentLockUnits.h) inheritH(ranges, currentRange)
        if (currentLockUnits.m || currentLockUnits.d) {
          ranges = intersection(currentRange, ranges)
        }
        resRanges.push(...ranges)
      }
      return { ranges: resRanges, lockUnits: ['m', 'd'] }
    }
  ],
  // y,m,d固定型
  [
    /(インターンシップ)/,
    function (matched, currentRanges, currentLockUnits) {
      const resRanges = []
      if (!currentLockUnits.y) {
        currentRanges = expandY(currentRanges, detectFinestUnit(currentLockUnits), [2015, 2017])
      }
      if (currentLockUnits.m) currentRanges = divideM(currentRanges)
      for (const currentRange of currentRanges) {
        let ranges = [[
          // 2015/08/10 ~ 2015/09/04
          currentRange[0].clone().year(2015).month(7).date(10).startOf('date'),
          currentRange[0].clone().year(2015).month(8).date(4).endOf('date')
        ], [
          // 2017/08/14 ~ 2017/09/29
          currentRange[0].clone().year(2017).month(7).date(14).startOf('date'),
          currentRange[1].clone().year(2017).month(8).date(29).endOf('date')
        ]]
        if (currentLockUnits.h) inheritH(ranges, currentRange)
        if (currentLockUnits.y || currentLockUnits.m || currentLockUnits.d) {
          ranges = intersection(currentRange, ranges)
        }
        resRanges.push(...ranges)
      }
      return { ranges: resRanges, lockUnits: ['y', 'm', 'd'] }
    }
  ],
  [
    /(B3)/,
    function (matched, currentRanges, currentLockUnits) {
      const resRanges = []
      if (!currentLockUnits.y) {
        currentRanges = expandY(currentRanges, detectFinestUnit(currentLockUnits), [2015, 2015])
      }
      if (currentLockUnits.m) currentRanges = divideM(currentRanges)
      for (const currentRange of currentRanges) {
        let ranges = [[
          // 2015/04/01 ~ 2016/03/31
          currentRange[0].clone().year(2015).month(3).date(1).startOf('date'),
          currentRange[0].clone().year(2015).month(11).date(31).endOf('date') // 年またぎはあとで検証
        ]]
        if (currentLockUnits.h) inheritH(ranges, currentRange)
        if (currentLockUnits.y || currentLockUnits.m || currentLockUnits.d) {
          ranges = intersection(currentRange, ranges)
        }
        resRanges.push(...ranges)
      }
      return { ranges: resRanges, lockUnits: ['y', 'm', 'd'] }
    }
  ],
  [/(午前中|午前)/, hRange({ h: [0, 11] })],
  [/(午後)/, hRange({ h: [12, 23] })],
  [/(春)/, mRange({ m: [3, 5] })],
  [/(夏)/, mRange({ m: [6, 8] })]
]

const intersection = (baseRange, targetRanges) => {
  const res = []
  const seedRange = [baseRange[0].clone(), baseRange[1].clone()]
  for (const range of targetRanges) {
    const range1 = moment.range(seedRange[0], seedRange[1])
    const range2 = moment.range(range[0], range[1])
    const interRange = range1.intersect(range2)
    if (!interRange || !interRange.start || !interRange.end) continue
    res.push([interRange.start, interRange.end])
  }
  return res
}

const detectFinestUnit = currentLockUnits => {
  const units = {
    y: 'year',
    m: 'month',
    d: 'date',
    h: 'hour'
  }
  for (const unit of Object.keys(units).reverse()) {
    if (currentLockUnits[unit]) return units[unit]
  }
}

module.exports = {
  basicMutations
}
