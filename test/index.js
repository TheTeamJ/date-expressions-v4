
/* eslint-env mocha */
const { assert } = require('chai')
const { DateExpressions, format } = require('../src/')

function testRanges (source, results) {
  const res = DateExpressions(source).resolve()
  const ranges = res.momentRanges
  assert.deepEqual(res, format(ranges))
}

describe('Resolve date ranges', function () {
  it('resolve correctly', function () {
    testRanges('2015年', [['2015/01/01 00:00', '2015/12/31 23:59']])
  })
})
