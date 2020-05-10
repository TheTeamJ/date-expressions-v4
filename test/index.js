
/* eslint-env mocha */
const { assert } = require('chai')
const { DateExpressions } = require('../src/')

function testRanges (source, results) {
  const res = DateExpressions(source).resolve()
  assert.deepEqual(res, results)
}

describe('Resolve date ranges', function () {
  it('resolve correctly', function () {
  })
})
