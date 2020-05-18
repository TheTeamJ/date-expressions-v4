const { transformMutaitons } = require('./transform')
const { isAbsNumsArray, debug } = require('../lib')

// 一部のunitの扱いを離散的にする必要があるため、
// 必要に応じて 'f' なunitを展開する
// 1回以上数値配列が与えられたunitの 'f' が展開される
const calcRangesOr = mutationGroup => {
  const units = ['h', 'd', 'm'] // 現状、yearは展開できない
  const rangesOr = []
  for (const mutations of mutationGroup) { // AND
    const absNumsArrayUnits = new Set()
    // 1回以上数値配列が指定されているunitsを集める
    for (const mutation of mutations) {
      for (const unit of units) {
        if (isAbsNumsArray(mutation[unit])) absNumsArrayUnits.add(unit)
      }
    }
    let finestUnit = 'y'
    for (const unit of units) {
      if (absNumsArrayUnits.has(unit)) {
        finestUnit = unit
        break
      }
    }
    debug('finestUnit:', finestUnit)
    debug('AND:')
    debug(mutations) // f入りのmutations
    const ranges = transformMutaitons(mutations, finestUnit)
    // debug('Expanded:')
    // debug(ranges)
    debug('-------------')
    if (ranges.length > 0) {
      rangesOr.push(...ranges)
    }
  }
  return rangesOr.map(range => [range.start, range.end])
}

module.exports = {
  calcRangesOr
}
