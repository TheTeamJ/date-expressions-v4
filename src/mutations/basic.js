const Moment = require('moment-timezone')
const MomentRange = require('moment-range')
const moment = MomentRange.extendMoment(Moment)
const { debug, emptyRanges } = require('../lib')

const tz = 'Asia/Tokyo'

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
const extendsM = (ranges, finestUnit, useLastMonthOfYear) => {
  const res = []
  for (const range of ranges) {
    const [l, r] = range
    const vEnd = useLastMonthOfYear ? 11 : r.month()
    for (let v = l.month(); v <= vEnd; v++) {
      res.push([
        l.clone().set('month', v).startOf(finestUnit),
        l.clone().set('month', v).endOf(finestUnit)
      ])
    }
  }
  return res
}

// M,H固定でDを展開する
const extendsD = (ranges, finestUnit, useLastDateOfMonth = false) => {
  const res = []
  for (const range of ranges) {
    const [l, r] = range
    const vEnd = useLastDateOfMonth ? l.clone().endOf('month').date() : r.date()
    for (let v = l.date(); v <= vEnd; v++) {
      res.push([
        l.clone().set('date', v).startOf(finestUnit),
        l.clone().set('date', v).endOf(finestUnit)
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
      if (currentLockUnits.y) return emptyRanges()
      const year = parseInt(matched[1])
      const resRanges = []
      for (const currentRange of currentRanges) {
        const ranges = [[
          currentRange[0].clone().year(year).startOf('year'),
          currentRange[1].clone().year(year).endOf('year')
        ]]
        if (currentLockUnits.m) inheritM(ranges, currentRange)
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
      if (currentLockUnits.d) return emptyRanges()
      const date = parseInt(matched[1])
      const resRanges = []
      for (const currentRange of currentRanges) {
        let ranges = [[
          currentRange[0].clone().date(date).startOf('date'),
          currentRange[1].clone().date(date).endOf('date')
        ]]
        if (currentLockUnits.m) {
          inheritM(ranges, currentRange)
        } else {
          if (currentLockUnits.y) {
            ranges = extendsM(ranges, 'date')
          }
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
      if (currentLockUnits.h) return emptyRanges()
      const hour = parseInt(matched[1])
      const resRanges = []
      for (const currentRange of currentRanges) {
        let ranges = [[
          currentRange[0].clone().hour(hour).startOf('hour'),
          currentRange[1].clone().hour(hour).endOf('hour')
        ]]
        if (currentLockUnits.d) {
          inheritD(ranges, currentRange)
        } else {
          if (currentLockUnits.m) {
            ranges = extendsD(ranges, 'hour')
          } else if (currentLockUnits.y) {
            ranges = extendsM(ranges, 'hour', true)
            ranges = extendsD(ranges, 'hour', true)
          }
        }
        resRanges.push(...ranges)
      }
      return { ranges: resRanges, lockUnits: ['h'] }
    }
  ],
  [
    /(元旦|元日)/,
    function (matched, currentRanges, currentLockUnits) {
      if (currentLockUnits.m || currentLockUnits.d) return emptyRanges()
      const resRanges = []
      for (const currentRange of currentRanges) {
        const ranges = [[
          currentRange[0].clone().month(0).date(1).startOf('date'),
          currentRange[1].clone().month(0).date(1).endOf('date')
        ]]
        if (currentLockUnits.y) inheritY(ranges, currentRange)
        if (currentLockUnits.h) inheritH(ranges, currentRange)
        resRanges.push(...ranges)
      }
      return { ranges: resRanges, lockUnits: ['m', 'd'] }
    }
  ],
  [
    /(春)/,
    function (matched, currentRanges, currentLockUnits) {
      const resRanges = []
      for (const currentRange of currentRanges) {
        let ranges = [[
          currentRange[0].clone().month(2).startOf('month'), // 3月
          currentRange[1].clone().month(4).endOf('month') // 5月
        ]]
        if (currentLockUnits.y) inheritY(ranges, currentRange)
        if (currentLockUnits.m || currentLockUnits.d || currentLockUnits.h) {
          ranges = intersection(currentRange, ranges)
        }
        resRanges.push(...ranges)
      }
      return { ranges: resRanges, lockUnits: ['m'] }
    }
  ]
]

const intersection = (baseRange, targetRanges) => {
  let seedRange = [
    baseRange[0].clone(),
    baseRange[1].clone()
  ]
  for (const range of targetRanges) {
    const range1 = moment.range(seedRange[0], seedRange[1])
    const range2 = moment.range(range[0], range[1])
    const interRange = range1.intersect(range2)
    if (!interRange || !interRange.start || !interRange.end) return [[]]
    seedRange = [interRange.start, interRange.end]
  }
  return [seedRange]
  // const range1 = moment.range(lr1[0], lr1[1])
  // const range2 = moment.range(lr2[0], lr2[1])
  // const interRange = range1.intersect(range2)
  // if (!interRange || !interRange.start || !interRange.end) return []
  // return [interRange.start, interRange.end]
}

module.exports = {
  basicMutations
}

// note
// const myRanges = [rangeY(parseInt(matched[1]))]
// currentRange = moment.range(currentRange[0], currentRange[1])
// for (const myRange of myRanges) {
//   debug(currentRange),
// }
