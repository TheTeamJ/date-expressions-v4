/* eslint-env mocha */
const { assert } = require('chai')
const moment = require('moment-timezone')
const DateExp = require('../src/')

// 2020/5/10
// const today = moment.tz(DateExpressions.timezone).year(2020).month(4).date(10)
// const todayRange = [
//   '2020/05/10 00:00',
//   '2020/05/10 23:59'
// ]

const tz = 'Asia/Tokyo'

function testRanges (source, results) {
  const dateExp = new DateExp(source, tz, { y: 2020, m: 5, d: 10, h: 0 })
  dateExp.resolve()
  assert.deepEqual(dateExp.format(), results)
}

const getLastDate = ({ y, m }) => {
  return moment.tz(tz).year(parseInt(y)).month(parseInt(m) - 1).endOf('month').date()
}

const expandD = ({ y, m, h, start, end }) => {
  let lH = h
  let rH = h
  if (Array.isArray(h)) {
    lH = h[0]
    rH = h[1]
  }
  const res = []
  const lastDate = getLastDate({ y, m })
  for (let j = (start || 1); j <= (end || lastDate); j++) {
    const strD = `${j}`.padStart(2, '0')
    const range = [
      `${y}/${m}/${strD} ${lH}:00`,
      `${y}/${m}/${strD} ${rH}:59`
    ]
    res.push(range)
  }
  return res
}

const expandMD = ({ y, h }) => {
  let lH = h
  let rH = h
  if (Array.isArray(h)) {
    lH = h[0]
    rH = h[1]
  }
  const res = []
  for (let m = 0; m <= 11; m++) {
    const strM = `${m + 1}`.padStart(2, '0')
    const lastDate = getLastDate({ y, m: m + 1 })
    for (let d = 1; d <= lastDate; d++) {
      const strD = `${d}`.padStart(2, '0')
      const range = [
        `${y}/${strM}/${strD} ${lH}:00`,
        `${y}/${strM}/${strD} ${rH}:59`
      ]
      res.push(range)
    }
  }
  return res
}

module.exports = {
  // today,
  // todayRange,
  expandD,
  expandMD,
  testRanges
}
