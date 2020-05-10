const Moment = require('moment-timezone')
const MomentRange = require('moment-range')
const moment = MomentRange.extendMoment(Moment)
const { debug, unique } = require('../lib')

const tz = 'Asia/Tokyo'

// const rangeY = year => {
//   return moment.range(
//     moment.tz(tz).year(year).startOf('year'),
//     moment.tz(tz).year(year).endOf('year')
//   )
// }

// const startOf = (d, unit, value) => {
//   return d.clone().set(unit, value).startOf(unit)
// }

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
      if (currentLockUnits.y) return []
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
      if (currentLockUnits.m) return []
      const month = parseInt(matched[1]) - 1
      const resRanges = []
      for (const currentRange of currentRanges) {
        const ranges = [[
          currentRange[0].clone().month(month).startOf('month'),
          currentRange[1].clone().month(month).endOf('month')
        ]]
        if (currentLockUnits.y) inheritY(ranges, currentRange)
        if (currentLockUnits.d) inheritD(ranges, currentRange)
        resRanges.push(...ranges)
      }
      return { ranges: resRanges, lockUnits: ['m'] }
    }
  ],
  [
    /(\d{1,2})日/,
    function (matched, currentRanges, currentLockUnits) {
      if (currentLockUnits.d) return []
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
      if (currentLockUnits.h) return []
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
        // ranges.forEach(range => resRanges.add(range))
      }
      return { ranges: Array.from(resRanges), lockUnits: ['h'] }
    }
  ]
]

module.exports = {
  basicMutations
}



// note
// const myRanges = [rangeY(parseInt(matched[1]))]
// currentRange = moment.range(currentRange[0], currentRange[1])
// for (const myRange of myRanges) {
//   debug(currentRange),
// }
