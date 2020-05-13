const debug = require('debug')('DateExp')

const isAbsNumsArray = value => {
  if (!Array.isArray(value)) return false
  return value.every(v => Number.isInteger(v))
}

const isRelNumsArray = value => {
  if (!Array.isArray(value)) return false
  return value.every(v => `${v}`.startsWith('+') || `${v}`.startsWith('-'))
}

module.exports = {
  isAbsNumsArray,
  isRelNumsArray,
  debug
}
