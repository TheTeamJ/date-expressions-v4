const { cloneDeep } = require('lodash')
const moment = require('moment-timezone')
const { divideIntoActions } = require('./actions')
const { debug, getDayRange, format, clone } = require('./lib')

class DateExpressions {
  static customMutations = []
  static timezone = 'Asia/Tokyo'
  static _initialState = []

  static setInitialState (base) {
    base = moment(base)
    DateExpressions._initialState = [getDayRange(base, this.timezone)]
  }

  static getInitialState () {
    const initialState = clone(DateExpressions._initialState)
    if (initialState.length > 0) return initialState
    return [getDayRange(null, DateExpressions.timezone)]
  }

  static format (ranges, formatForm = 'YYYY/MM/DD HH:mm') {
    return format(ranges, formatForm, DateExpressions.timezone)
  }

  constructor (expression) {
    this.rawExpression = expression
    this.initialize()
  }

  initialize () {
    this._currentRanges = DateExpressions.getInitialState()
    this._currentLockUnits = {
      y: false,
      m: false,
      d: false,
      h: false
    }
    this._currentRangeStrs = []
    this.base = clone(this._currentRanges)[0]
    this.unhandledExpression = this.rawExpression
  }

  get dateRanges () {
    return toDate(this.momentRanges)
  }

  get momentRanges () {
    return this._currentRanges
  }

  addToCurrentRanges (ranges) {
    this._currentRanges = []
    this._currentRangeStrs = []
    const fmt = 'YYYYMMDDHHmm'

    for (const [l, r] of ranges) {
      if (!l || !r) continue
      const rangeStr = `${l.clone().format(fmt)}_${r.clone().format(fmt)}`
      if (!this._currentRangeStrs.includes(rangeStr)) {
        this._currentRangeStrs.push(rangeStr)
        this._currentRanges.push([l, r])
      }
    }
  }

  resolve () {
    this.initialize()
    const { actions, unhandledExpression } = divideIntoActions(this.rawExpression, DateExpressions.customMutations)
    const newRanges = []
    // currentRangesに対してactionsを順に作用させ、currentRangesを更新する
    for (const action of actions) {
      const { whole, mutation } = action
      const matched = whole.match(mutation.regexp)
      const res = mutation.func(
        matched, cloneDeep(this._currentRanges), cloneDeep(this._currentLockUnits), cloneDeep(this.base))
      // 結果が存在するとき、currentLockUnitsを更新
      if (res.ranges.length > 0) {
        for (const unit of Object.keys(this._currentLockUnits)) {
          if (res.lockUnits.includes(unit)) this._currentLockUnits[unit] = true
        }
      }
      // newRanges.push(...res.ranges)

      // this._currentRanges = [...res.ranges]
      this.addToCurrentRanges(res.ranges)
    }
    // currentRangesを更新
    // this._currentRanges = [...newRanges]
    return this
  }
}

module.exports = { DateExpressions }
