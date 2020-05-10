
/* eslint-env mocha */
const { assert } = require('chai')
const { DateExpressions } = require('../src/')
const { today, todayRange, testRanges, expandD, expandMD } = require('./lib')

const DateExp = DateExpressions

// 2020/5/10
DateExp.setInitialState(today.toDate())

describe('Check static variables', function () {
  describe('DateExpressions', function () {
    it('timezone', function () {
      assert.equal(DateExp.timezone, 'Asia/Tokyo')
    })
    it('initialState is 2010/05/10', function () {
      const ranges = DateExp.format(DateExp.getInitialState())
      assert.equal(ranges.length, 1)
      assert.deepEqual(ranges[0], todayRange)
    })
  })
})

describe('Resolve date ranges', function () {
  it('customMutations is empty', function () {
    assert.isEmpty(DateExp.customMutations)
  })

  it('resolve correctly', function () {
    testRanges('2015年', [['2015/01/01 00:00', '2015/12/31 23:59']])
    testRanges('4月', [['2020/04/01 00:00', '2020/04/30 23:59']])
    testRanges('12日', [['2020/05/12 00:00', '2020/05/12 23:59']])
    testRanges('13時', [['2020/05/10 13:00', '2020/05/10 13:59']])
  })

  it('inheritX: resolve correctly', function () {
    testRanges('2015年/4月', [['2015/04/01 00:00', '2015/04/30 23:59']])
    testRanges('4月/2015年', [['2015/04/01 00:00', '2015/04/30 23:59']])

    testRanges('4月/12日', [['2020/04/12 00:00', '2020/04/12 23:59']])
    testRanges('12日/4月', [['2020/04/12 00:00', '2020/04/12 23:59']])

    testRanges('12日/13時', [['2020/05/12 13:00', '2020/05/12 13:59']])
    testRanges('13時/12日', [['2020/05/12 13:00', '2020/05/12 13:59']])

    testRanges('2015年/4月/12日', [['2015/04/12 00:00', '2015/04/12 23:59']])
    testRanges('2015年/4月/12日/13時', [['2015/04/12 13:00', '2015/04/12 13:59']])
    testRanges('4月/12日/13時', [['2020/04/12 13:00', '2020/04/12 13:59']])
  })

  it('expandX: resolve correctly', function () {
    testRanges('2015年/11日', [
      ['2015/01/11 00:00', '2015/01/11 23:59'],
      ['2015/02/11 00:00', '2015/02/11 23:59'],
      ['2015/03/11 00:00', '2015/03/11 23:59'],
      ['2015/04/11 00:00', '2015/04/11 23:59'],
      ['2015/05/11 00:00', '2015/05/11 23:59'],
      ['2015/06/11 00:00', '2015/06/11 23:59'],
      ['2015/07/11 00:00', '2015/07/11 23:59'],
      ['2015/08/11 00:00', '2015/08/11 23:59'],
      ['2015/09/11 00:00', '2015/09/11 23:59'],
      ['2015/10/11 00:00', '2015/10/11 23:59'],
      ['2015/11/11 00:00', '2015/11/11 23:59'],
      ['2015/12/11 00:00', '2015/12/11 23:59']
    ])
    testRanges('2015年/11日/15時', [
      ['2015/01/11 15:00', '2015/01/11 15:59'],
      ['2015/02/11 15:00', '2015/02/11 15:59'],
      ['2015/03/11 15:00', '2015/03/11 15:59'],
      ['2015/04/11 15:00', '2015/04/11 15:59'],
      ['2015/05/11 15:00', '2015/05/11 15:59'],
      ['2015/06/11 15:00', '2015/06/11 15:59'],
      ['2015/07/11 15:00', '2015/07/11 15:59'],
      ['2015/08/11 15:00', '2015/08/11 15:59'],
      ['2015/09/11 15:00', '2015/09/11 15:59'],
      ['2015/10/11 15:00', '2015/10/11 15:59'],
      ['2015/11/11 15:00', '2015/11/11 15:59'],
      ['2015/12/11 15:00', '2015/12/11 15:59']
    ])
    testRanges('4月/13時', expandD([1, 30], { y: '2020', m: '04', h: '13' }))
    testRanges('2015年/4月/13時', expandD([1, 30], { y: '2015', m: '04', h: '13' }))
    testRanges('2015年/13時', expandMD({ y: '2015', h: '13' }))
    // testRanges('2015年/11日/15時/6月', [['2015/06/11 15:00', '2015/06/11 15:59']])
  })
})

describe('Resolve date ranges with customMutations', function () {
  it('resolve correctly', function () { })
})
