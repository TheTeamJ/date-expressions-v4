const moment = require('moment-timezone')
const { getDayRange, format } = require('./lib')

class DateExpressions {
  static customMutations = []
  static timezone = 'Asia/Tokyo'
  static _initialState = []

  static setInitialState (base) {
    base = moment(base)
    DateExpressions._initialState = [getDayRange(base, this.timezone)]
  }

  static getInitialState () {
    const initialState = DateExpressions._initialState
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
    this.unhandledExpression = this.rawExpression
    this.momentRanges = []
  }

  get dateRanges () {
    return toDate(this.momentRanges)
  }
}

module.exports = { DateExpressions }
