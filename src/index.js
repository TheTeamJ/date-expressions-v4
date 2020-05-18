const moment = require('moment-timezone')
const { cloneDeep } = require('lodash')
const { parse, format, convertMutationToMomentDate } = require('./utils/')
const { mergeMutations } = require('./mutations/merge')
const { calcRangesOr } = require('./expand/')
const { debug } = require('./lib')

class DateExp {
  constructor (expression, timezone = 'Asia/Tokyo', base = {}) {
    const now = moment.tz(timezone).startOf('hour')
    this.rawExpression = expression
    this.tz = timezone
    this.base = {
      y: base.y > 0 ? base.y : now.year(),
      m: base.m > 0 ? base.m : now.month() + 1, // human friendly month
      d: base.d > 0 ? base.d : now.date(),
      h: base.h >= 0 ? base.h : now.hour()
    }

    // TODO: private class fields にする
    this._parsed = parse(expression, convertMutationToMomentDate(this.base, this.tz))
    this._ranges = []
    debug(this)
  }

  get unhandledExpression () {
    return this._parsed.unhandledExpression
  }

  get momentRanges () {
    return cloneDeep(this._ranges)
  }

  get dateRanges () {
    return this.momentRanges.map(range => [range[0].toDate(), range[1].toDate()])
  }

  format (fmt = 'YYYY/MM/DD HH:mm') {
    return format(this._ranges, this.tz, fmt)
  }

  resolve () {
    if (this._parsed.length === 0) return []
    const mutations = this._parsed.actions.map(item => item.mutations)
    const mergedMuts = mergeMutations(mutations)
    this._ranges = calcRangesOr(mergedMuts)
    return this.dateRanges
  }
}

module.exports = DateExp

// const dateExp = new DateExp('今日', 'Asia/Tokyo', { y: 2020, m: 5, d: 10, h: 0 })
// console.log(dateExp.unhandledExpression)
// console.log('>>', dateExp.resolve())
// console.log('>>', dateExp.format())
