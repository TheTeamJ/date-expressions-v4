const debug = require('debug')('DateExp')
const moment = require('moment-timezone')

const getDayRange = (start, tz) => {
  start = start || moment.tz(tz)
  return [
    moment.tz(start, tz).startOf('date'),
    moment.tz(start, tz).endOf('date')
  ]
}

const format = (ranges, formatForm, tz) => {
  const res = []
  for (const range of ranges) {
    res.push([
      moment.tz(range[0], tz).format(formatForm),
      moment.tz(range[1], tz).format(formatForm)
    ])
  }
  return res
}

const clone = momentRanges => {
  const res = []
  for (const range of momentRanges) {
    res.push([range[0].clone(), range[1].clone()])
  }
  return res
}

module.exports = { debug, getDayRange, format, clone }
