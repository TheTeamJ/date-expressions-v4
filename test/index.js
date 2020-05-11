
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

describe('Check', function () {
  it('Ok', function () {
    // testRanges('15日/夏/インターンシップ/8月', [])
    testRanges('B3/夏/インターンシップ', [['2015/08/10 00:00', '2015/08/31 23:59']])
    testRanges('夏/B3/インターンシップ', [['2015/08/10 00:00', '2015/08/31 23:59']])
    testRanges('インターンシップ/夏', [])
  })
})
return
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

  it('inheritX', function () {
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

  it('expandX', function () {
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
    testRanges('4月/13時', expandD({ y: '2020', m: '04', h: '13' }))
    testRanges('2015年/4月/13時', expandD({ y: '2015', m: '04', h: '13' }))
    testRanges('2015年/13時', expandMD({ y: '2015', h: '13' }))
    testRanges('2015年/11日/15時/6月', [['2015/06/11 15:00', '2015/06/11 15:59']])
  })

  it('mRange: fixed month range', function () {
    testRanges('春', [['2020/03/01 00:00', '2020/05/31 23:59']])
    testRanges('春/4月', [['2020/04/01 00:00', '2020/04/30 23:59']])
    testRanges('2015/春', [['2015/03/01 00:00', '2015/05/31 23:59']])
    testRanges('2015/春/4月', [['2015/04/01 00:00', '2015/04/30 23:59']])
    testRanges('2015/4月/春', [['2015/04/01 00:00', '2015/04/30 23:59']])
    testRanges('2015/3月/春/9日', [['2015/03/09 00:00', '2015/03/09 23:59']])
    testRanges('春/6日', [
      ['2020/03/06 00:00', '2020/03/06 23:59'],
      ['2020/04/06 00:00', '2020/04/06 23:59'],
      ['2020/05/06 00:00', '2020/05/06 23:59']
    ])
    testRanges('6日/夏', [
      ['2020/06/06 00:00', '2020/06/06 23:59'],
      ['2020/07/06 00:00', '2020/07/06 23:59'],
      ['2020/08/06 00:00', '2020/08/06 23:59']
    ])
    testRanges('春/6日/23時', [
      ['2020/03/06 23:00', '2020/03/06 23:59'],
      ['2020/04/06 23:00', '2020/04/06 23:59'],
      ['2020/05/06 23:00', '2020/05/06 23:59']
    ])
    testRanges('2001/春/15時', [
      ...expandD({ y: '2001', m: '03', h: '15' }),
      ...expandD({ y: '2001', m: '04', h: '15' }),
      ...expandD({ y: '2001', m: '05', h: '15' })
    ])
    testRanges('15時/春', [
      ...expandD({ y: '2020', m: '03', h: '15' }),
      ...expandD({ y: '2020', m: '04', h: '15' }),
      ...expandD({ y: '2020', m: '05', h: '15' })
    ])
    testRanges('夏/午後', [
      ...expandD({ y: '2020', m: '06', h: ['12', '23'] }),
      ...expandD({ y: '2020', m: '07', h: ['12', '23'] }),
      ...expandD({ y: '2020', m: '08', h: ['12', '23'] })
    ])
  })

  it('hRange', function () {
    testRanges('午前', [['2020/05/10 00:00', '2020/05/10 11:59']])
    testRanges('2000年/4月/午前', expandD({ y: '2000', m: '04', h: ['00', '11'] }))
    testRanges('6日/午前', [['2020/05/06 00:00', '2020/05/06 11:59']])
    testRanges('6日/午前/10時', [['2020/05/06 10:00', '2020/05/06 10:59']])
    testRanges('1990年/午後', expandMD({ y: '1990', h: ['12', '23'] }))
  })

  it('fixed day: month and day', function () {
    // 単数
    testRanges('元旦', [['2020/01/01 00:00', '2020/01/01 23:59']])
    testRanges('元旦/13時', [['2020/01/01 13:00', '2020/01/01 13:59']])
    testRanges('2013年/元日', [['2013/01/01 00:00', '2013/01/01 23:59']])
    testRanges('2013年/元日/13時', [['2013/01/01 13:00', '2013/01/01 13:59']])
    // 複数
    testRanges('ハッピーデー', [
      ['2020/08/08 00:00', '2020/08/08 23:59'],
      ['2020/11/11 00:00', '2020/11/11 23:59']
    ])
    testRanges('夏/ハッピーデー', [['2020/08/08 00:00', '2020/08/08 23:59']])
    testRanges('ハッピーデー/夏', [['2020/08/08 00:00', '2020/08/08 23:59']])
    testRanges('2015年/ハッピーデー', [
      ['2015/08/08 00:00', '2015/08/08 23:59'],
      ['2015/11/11 00:00', '2015/11/11 23:59']
    ])
    testRanges('2015年/8月/ハッピーデー', [['2015/08/08 00:00', '2015/08/08 23:59']])
    testRanges('8月/ハッピーデー', [['2020/08/08 00:00', '2020/08/08 23:59']])
    testRanges('ハッピーデー/11月', [['2020/11/11 00:00', '2020/11/11 23:59']])
    testRanges('11月/ハッピーデー/午後', [['2020/11/11 12:00', '2020/11/11 23:59']])
  })

  it('fixed ranges: year, month and day', function () {
    testRanges('インターンシップ', [
      ['2015/08/10 00:00', '2015/09/04 23:59'],
      ['2017/08/14 00:00', '2017/09/29 23:59']
    ])
    testRanges('8月/インターンシップ', [
      ['2015/08/10 00:00', '2015/08/31 23:59'],
      ['2017/08/14 00:00', '2017/08/31 23:59']
    ])
    testRanges('夏/インターンシップ', [
      ['2015/08/10 00:00', '2015/08/31 23:59'],
      ['2017/08/14 00:00', '2017/08/31 23:59']
    ])
    testRanges('インターンシップ/11日', [
      ['2015/08/11 00:00', '2015/08/11 23:59'],
      ['2017/09/11 00:00', '2017/09/11 23:59']
    ])
    testRanges('インターンシップ/11日/2015年', [['2015/08/11 00:00', '2015/08/11 23:59']])
    testRanges('9月/15日/インターンシップ', [['2017/09/15 00:00', '2017/09/15 23:59']])
    testRanges('2017年/インターンシップ', [['2017/08/14 00:00', '2017/09/29 23:59']])
    testRanges('2015年/インターンシップ/13時', [
      ...expandD({ y: '2015', m: '08', h: '13', start: 10, end: 31 }),
      ...expandD({ y: '2015', m: '09', h: '13', start: 1, end: 4 })
    ])
    testRanges('インターンシップ/午後', [
      ...expandD({ y: '2015', m: '08', h: ['12', '23'], start: 10, end: 31 }),
      ...expandD({ y: '2015', m: '09', h: ['12', '23'], start: 1, end: 4 }),
      ...expandD({ y: '2017', m: '08', h: ['12', '23'], start: 14, end: 31 }),
      ...expandD({ y: '2017', m: '09', h: ['12', '23'], start: 1, end: 29 })
    ])
  })

  it('should return empty range', function () {
    testRanges('2月/元旦', [])
    testRanges('春/7月', [])
    testRanges('6日/午前中/13時', [])
    testRanges('午前/午後', [])
    testRanges('9月/ハッピーデー', [])
    testRanges('2000年/インターンシップ', [])
  })
})

describe('Resolve date ranges with customMutations', function () {
  it('resolve correctly', function () { })
})
