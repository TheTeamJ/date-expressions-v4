const Moment = require('moment-timezone')
const MomentRange = require('moment-range')
const moment = MomentRange.extendMoment(Moment)
const { expandArray, getFillArray } = require('./lib')
const { intersect } = require('../intersect/')
const tz = 'Asia/Tokyo'

// y, m, d, h に関して、
// fを数値配列で挟んでいる時、fに隣接する数値配列の大小関係は xL =< xR である
// Valid
// - y: [2015, 2016], m: f, d: f, h: [11, 13]
//     - 2015/*/* 11:00 ~ 13:00
//     - 2016/*/* 11:00 ~ 13:00
// - y: [2015, 2016], m: [2, 4], d: f, h: [11, 13]
//     - 2015/3/* 11:00 ~ 13:00
//     - 2015/4/* 11:00 ~ 13:00
//     - 2015/5/* 11:00 ~ 13:00
//     - 2016/3/* 11:00 ~ 13:00
//     - 2016/4/* 11:00 ~ 13:00
//     - 2016/5/* 11:00 ~ 13:00
// - y: [2015, 2016], m: f, d: [19, 21], h: [11, 13]
//     - 2015/*/19 11:00 ~ 13:00
//     - 2015/*/20 11:00 ~ 13:00
//     - 2015/*/21 11:00 ~ 13:00
//     - 2016/*/19 11:00 ~ 13:00
//     - 2016/*/20 11:00 ~ 13:00
//     - 2016/*/21 11:00 ~ 13:00
// Invalid
// - y: [2015, 2016], m: f, d: f, h: [13, 11]
// - y: [2015, 2016], m: f, d: [21, 19], h: f
//    - mをfで展開する場合、先月の21日から19日のような表現はできない

// 無関係
// - y: [2015, 2016], m: [4, 2], d: f, h: f
//     - fを挟む状態でないのでOK

// hの解釈は特殊
// { y: [2015], m: f, d: [19, 20], h: [11, 13] } の読み方
//   - 正: 2015/*/19 11:00 ~ 13:00, 2015/*/20 11:00 ~ 13:00
//   - 誤: 2015/*/19 11:00 ~ 2015/*/20 13:00

const detectFillUnits = finestUnit => {
  switch (finestUnit) {
    case 'h': return ['m', 'd']
    case 'd': return ['m', 'd']
    case 'm': return ['m']
    case 'y': return ['y']
  }
  return []
}

const expandConstY = mutation => {
  const res = []
  const { y } = mutation
  const range = moment.range(
    moment.tz(tz).year(y[0]).startOf('year'),
    moment.tz(tz).year(y[1]).endOf('year')
  )
  for (const date of range.by('year')) {
    const y = date.year()
    res.push({ y: [y, y], m: [1, 12], d: [1, 31], h: [0, 23] })
  }
  return res
}

const expandM = mutation => {
  const res = []
  const { y, m } = mutation

  if (m === 'f') {
    const range = moment.range(
      moment.tz(tz).year(y[0]).startOf('year'),
      moment.tz(tz).year(y[1]).endOf('year')
    )
    // すべてのdateを受理してよい
    for (const date of range.by('month')) {
      const y = date.year()
      const m = date.month()
      res.push({ y: [y, y], m: [m + 1, m + 1], d: [1, date.endOf('month').date()], h: [0, 23] })
    }
    return res
  } else {
    const range = moment.range(
      moment.tz(tz).year(y[0]).month(m[0] - 1).startOf('month'),
      moment.tz(tz).year(y[1]).month(m[1] - 1).endOf('month')
    )
    for (const date of range.by('month')) {
      const y = date.year()
      const m = date.month()
      res.push({ y: [y, y], m: [m + 1, m + 1], d: [1, date.endOf('month').date()], h: [0, 23] })
    }
    return res
  }
}

const expandMD = mutation => {
  const res = []
  const { y, m, d, h } = mutation
  const hours = (h === 'f') ? [0, 23] : h

  if (m === 'f') {
    const range = moment.range(
      moment.tz(tz).year(y[0]).startOf('year'),
      moment.tz(tz).year(y[1]).endOf('year')
    )
    const acceptMonths = getFillArray('m')
    const acceptDays = (d === 'f') ? getFillArray('d') : expandArray(d)
    // 一日ごとに見て、条件を満たすdateであるかを確認する
    for (const date of range.by('day')) {
      const y = date.year()
      const m = date.month()
      const d = date.date()
      if (acceptMonths.includes(m) && acceptDays.includes(d)) {
        res.push({ y: [y, y], m: [m + 1, m + 1], d: [d, d], h: hours })
      }
    }
    return res
  }

  if (d === 'f') {
    // mが固定されているケース
    const range = moment.range(
      moment.tz(tz).year(y[0]).month(m[0] - 1).startOf('month'),
      moment.tz(tz).year(y[1]).month(m[1] - 1).endOf('month')
    )
    for (const date of range.by('day')) {
      const y = date.year()
      const m = date.month()
      const d = date.date()
      res.push({ y: [y, y], m: [m + 1, m + 1], d: [d, d], h: hours })
    }
    return res
  } else {
    // m,dともに固定されているケース
    const range = moment.range(
      moment.tz(tz).year(y[0]).month(m[0] - 1).date(d[0]).startOf('day'),
      moment.tz(tz).year(y[1]).month(m[1] - 1).date(d[1]).endOf('day')
    )
    for (const date of range.by('day')) {
      const y = date.year()
      const m = date.month()
      const d = date.date()
      res.push({ y: [y, y], m: [m + 1, m + 1], d: [d, d], h: hours })
    }
    return res
  }
}

// return mutation array
const transformMutaiton = (mutation, fillUnits) => {
  let res = [mutation]
  if (fillUnits.includes('d')) {
    res = expandMD(mutation) // YMD
  } else if (fillUnits.includes('m')) {
    res = expandM(mutation) // YM
  } else if (fillUnits.includes('y')) {
    res = expandConstY(mutation)
  }
  return res
}

// mutations: AND set
const transformMutaitons = (mutations, finestUnit) => {
  const fillUnits = detectFillUnits(finestUnit)
  if (fillUnits.length === 0) return mutations
  const subRes = []
  for (const mutation of mutations) {
    const newMutations = transformMutaiton(mutation, fillUnits)
    // console.log(JSON.stringify(newMutations, null, 2))
    // console.log(newMutations)
    subRes.push(newMutations)
  }
  const interRange = intersect(subRes)
}

module.exports = {
  transformMutaitons
}

// transformMutaiton({ y: [2015, 2016], m: [11, 1], d: 'f', h: [12, 23] })
// transformMutaiton({ y: [2015, 2016], m: [11, 1], d: [23, 4], h: [12, 23] }, ['m', 'd'])
// transformMutaiton({ y: [2015, 2016], m: [11, 1], d: 'f', h: 'f' }, ['m'])
// transformMutaitons([{ y: [2015, 2016], m: [11, 1], d: 'f', h: 'f' }], 'm')
// transformMutaitons([{ y: [2015, 2015], m: [5, 5], d: 'f', h: [11] }], 'd')
