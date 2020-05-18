const moment = require('moment-timezone')
const { parse, format } = require('./utils/')

// delimiter

class DateExp {
  constructor (expression, timezone = 'Asia/Tokyo') {
    this.rawExpression = expression
    this.tz = timezone
    this.base = {}
    // TODO: private class fields にする
    this._now = moment.tz(timezone).startOf('hour')
    this._parsed = parse(expression)
    this._ranges = []
  }

  get unhandledExpression () {
    return this._parsed.unhandledExpression
  }

  format () {
    return format(this._ranges, this.tz)
  }

  resolve (base = {}) {
    this.base = {
      y: base.y || this._now.year(),
      m: base.m || this._now.month() + 1, // human friendly month
      d: base.d || this._now.date(),
      h: base.h || this._now.hour()
    }
  }
}

module.exports = DateExp

const dateExp = new DateExp('ここ2年の夏')
dateExp.resolve()
console.log(dateExp)
