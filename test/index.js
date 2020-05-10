
/* eslint-env mocha */
const { assert } = require('chai')
const moment = require('moment-timezone')
const { DateExpressions } = require('../src/')

const DateExp = DateExpressions

function testRanges (source, results) {
  const res = new DateExp(source).resolve()
  const ranges = res.momentRanges
  assert.deepEqual(res, format(ranges))
}

// 2020/5/10
const today = moment.tz(DateExp.timezone).year(2020).month(4).date(10)
DateExp.setInitialState(today.toDate())

describe('Check static variables', function () {
  describe('DateExpressions', function () {
    it('timezone', function () {
      assert.equal(DateExp.timezone, 'Asia/Tokyo')
    })
    it('initialState is 2010/05/10', function () {
      const ranges = DateExp.format(DateExp.getInitialState())
      assert.equal(ranges.length, 1)
      assert.deepEqual(ranges[0], ['2020/05/10 00:00', '2020/05/10 23:59'])
    })
  })
})

describe('Resolve date ranges', function () {
  it('customMutations is empty', function () {
    assert.isEmpty(DateExp.customMutations)
  })
  it('resolve correctly', function () {
    // testRanges('2015年', [['2015/01/01 00:00', '2015/12/31 23:59']])
  })
})

describe('Resolve date ranges with customMutations', function () {
  it('resolve correctly', function () { })
})
