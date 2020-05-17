const Moment = require('moment-timezone')
const MomentRange = require('moment-range')
const moment = MomentRange.extendMoment(Moment)
const { debug } = require('../lib')

const convertToMomentRange = (mutation, timezone) => {
  const units = ['y', 'm', 'd', 'h']
  const start = moment.tz(timezone)
  const end = start.clone()
  for (const unit of units) {
    const lr = mutation[unit]
    switch (unit) {
      case 'y': {
        start.year(lr[0])
        end.year(lr[1])
        break
      }
      case 'm': {
        if (lr === 'f') {
          start.month(0) // 1月
          end.month(11) // 12月
        } else {
          start.month(lr[0] - 1)
          end.month(lr[1] - 1)
        }
        break
      }
      case 'd': {
        if (lr === 'f') {
          start.date(1) // 1日
          end.endOf('month') // 月の最終日
        } else {
          start.date(lr[0])
          end.date(lr[1])
        }
        break
      }
      case 'h': {
        if (lr === 'f') {
          start.hour(0)
          end.hour(23)
        } else {
          start.hour(lr[0])
          end.hour(lr[1])
        }
        start.startOf('hour')
        end.endOf('hour')
        break
      }
    }
  }
  return moment.range(start, end)
}

const intersectMomentRange = ranges => {
  const inter = (range1, range2) => range1.intersect(range2)

  if (ranges.length === 0) return null
  let interRange = ranges[0]
  for (let i = 1; i < ranges.length; i++) {
    interRange = inter(interRange, ranges[i])
  }
  return interRange
}

const _intersect = mutationGroup => {
  const res = []
  for (const mutations of mutationGroup) {
    // TODO: 1回以上そのunitに数値配列が与えられている場合は、fをexpandしてから共通部分をとるべき
    // ぜんぶfならそのままでかまわない
    // TODO: いわゆるfのexpand
    const ranges = []
    for (const mutation of mutations) {
      ranges.push(convertToMomentRange(mutation, 'Asia/Tokyo'))
    }
    debug(ranges)
    const interRange = intersectMomentRange(ranges)
    // debug(interRange)
    if (interRange) res.push(interRange)
  }
  debug('intersections:', res)
  return res
}

const intersect = momentRangesGroup => {
  const res = []
  for (const ranges of momentRangesGroup) {
    console.log("###", ranges)
    const interRange = intersectMomentRange(ranges)
    if (interRange) res.push(interRange)
  }
  console.log('intersections:', res)
  return res
}

module.exports = {
  intersect,
  convertToMomentRange
}
