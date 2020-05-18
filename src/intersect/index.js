const { cloneDeep } = require('lodash')
const Moment = require('moment-timezone')
const MomentRange = require('moment-range')
const moment = MomentRange.extendMoment(Moment)
const tz = 'Asia/Tokyo'

// setA: [1, 2], setB: [3, 4] -> [[1, 2, 3], [1, 2, 4]]
const setCrtesian = (setA, setB) => {
  const result = []
  for (let j = 0; j < setB.length; j++) {
    const res = cloneDeep(setA)
    res.push(setB[j])
    // intersectionを計算して、空でなければ追加する
    const interRange = intersectRanges(...res)
    if (interRange !== null) result.push(interRange)
  }
  return result
}

const convertToMomentRanges = mutations => {
  const ranges = []
  // mutation: hまで充填済み
  for (const mutation of mutations) {
    const { y, m, d, h } = mutation
    const start = moment.tz(tz).year(y[0]).month(m[0] - 1).date(d[0]).hour(h[0]).startOf('hour')
    const end = moment.tz(tz).year(y[1]).month(m[1] - 1).date(d[1]).hour(h[1]).endOf('hour')
    const range = moment.range(start, end)
    ranges.push(range)
  }
  return ranges
}

const intersectRanges = (rangeA, rangeB) => {
  return rangeA.intersect(rangeB)
}

// 日付が連続している場合はグループ化する
const createGroup = ranges => {
  // start, endをメモしていおく
  let group = []
  const initGroup = (start, end) => {
    group = [start, end]
  }
  const res = []
  const addToRes = () => {
    res.push(moment.range(group[0], group[1]))
    group = []
  }

  for (let i = 0; i < ranges.length; i++) {
    const { start, end } = ranges[i]
    if (group.length === 0) initGroup(start, end)

    const nextRange = ranges[i + 1]
    if (!nextRange) {
      group[1] = end
      addToRes()
      continue
    }

    const nextDay = end.clone().add(1, 'day')
    if ((end.hour() === 23 && end.minute() === 59 && end.second() === 59) &&
      (nextDay.year() === nextRange.start.year() && nextDay.month() === nextRange.start.month() && nextDay.date() === nextRange.start.date()) &&
      (nextRange.start.hour() === 0 && nextRange.start.minute() === 0 && nextRange.start.second() === 0) &&
      (nextRange.end.hour() === 23 && nextRange.end.minute() === 59 && nextRange.end.second() === 59)) {
      group[1] = end
    } else {
      addToRes()
    }
  }

  return res
}

const intersect = mutationGroup => {
  if (mutationGroup.length === 0) return []
  let orRes = convertToMomentRanges(mutationGroup[0])
  for (let i = 1; i < mutationGroup.length; i++) {
    const targetRanges = convertToMomentRanges(mutationGroup[i])
    const newRes = []
    for (const baseRange of orRes) {
      newRes.push(...setCrtesian([baseRange], targetRanges))
    }
    orRes = cloneDeep(newRes)
  }
  // 挙動が不安定な場合はここを確認
  // console.log("##", orRes)
  return createGroup(orRes)
}

module.exports = {
  intersect
}
