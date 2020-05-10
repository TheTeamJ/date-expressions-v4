const Debug = require('debug')
const moment = require('moment-timezone')

const debug = () => {
  return Debug('date-expressions')
}

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
      moment(range[0], tz).format(formatForm),
      moment(range[1], tz).format(formatForm)
    ])
  }
  return res
}

module.exports = { debug, getDayRange, format }
