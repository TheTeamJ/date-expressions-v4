/* eslint-env mocha */
const { assert } = require('chai')
const moment = require('moment-timezone')
const { DateExpressions } = require('../src/')

// 2020/5/10
const today = moment.tz(DateExpressions.timezone).year(2020).month(4).date(10)
const todayRange = ['2020/05/10 00:00', '2020/05/10 23:59']

function testRanges (source, results) {
  const de = new DateExpressions(source)
  assert.equal(de.base[0].format('YYYY/MM/DD HH:mm'), todayRange[0])
  assert.deepEqual(DateExpressions.format(de._currentRanges), [todayRange])

  const res = de.resolve()
  assert.deepEqual(DateExpressions.format(res.momentRanges), results)
}

const getLastDate = ({ y, m }) => {
  return moment.tz(DateExpressions.timezone).year(parseInt(y)).month(parseInt(m) - 1).endOf('month').date()
}

const expandD = ({ y, m, h }) => {
  const res = []
  const lastDate = getLastDate({ y, m })
  for (let j = 1; j <= lastDate; j++) {
    const strD = `${j}`.padStart(2, '0')
    const range = [
      `${y}/${m}/${strD} ${h}:00`,
      `${y}/${m}/${strD} ${h}:59`
    ]
    res.push(range)
  }
  return res
}

const expandMD = ({ y, h }) => {
  const res = []
  for (let m = 0; m <= 11; m++) {
    const strM = `${m + 1}`.padStart(2, '0')
    const lastDate = getLastDate({ y, m: m + 1 })
    for (let d = 1; d <= lastDate; d++) {
      const strD = `${d}`.padStart(2, '0')
      const range = [
        `${y}/${strM}/${strD} ${h}:00`,
        `${y}/${strM}/${strD} ${h}:59`
      ]
      res.push(range)
    }
  }
  return res
}

module.exports = {
  today,
  todayRange,
  expandD,
  expandMD,
  testRanges
}
