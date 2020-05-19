const moment = require('moment-timezone')
const { cloneDeep } = require('lodash')
const { parse, format, convertMutationToMomentDate } = require('./utils/')
const { analyzeQueryExpression } = require('./analyze/')
const { mergeMutations } = require('./mutations/merge')
const { calcRangesOr } = require('./expand/')
const { createMutation } = require('./mutations/custom')
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
    const customMutations = DateExp.customMutations
    this._parsed = parse(expression, convertMutationToMomentDate(this.base, this.tz), customMutations)
    this._ranges = []
    this._mergedMutations = []
    debug(this)
  }

  static get customMutations () {
    return DateExp._customMutations || []
  }

  static clearCustomMutations () {
    DateExp._customMutations = []
  }

  static addCustomMutation (exporession, mutation, kind = 'a') {
    if (DateExp._customMutations === undefined) DateExp._customMutations = []
    DateExp._customMutations.push(createMutation(exporession, mutation, kind))
  }

  static analyzeExpression (expression, delimiter = '/') {
    return analyzeQueryExpression({ expression, delimiter, customMutations: DateExp.customMutations })
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
    this._mergedMutations = mergeMutations(mutations) // まだfを含む状態
    this._ranges = calcRangesOr(this._mergedMutations) // moment-ranges group
    return this
  }
}

module.exports = DateExp
