const Moment = require('moment-timezone')
const MomentRange = require('moment-range')
const moment = MomentRange.extendMoment(Moment)
const { cloneDeep } = require('lodash')
const { transformMutaitons } = require('./transform')
const { isAbsNumsArray } = require('../lib')
const { convertToMomentRange } = require('../intersection/')

// ここから！！！
// いまのところfになりうるのはm,dだけなので、場合分けを全部記述しても3通りしかない
// const transformMutaitons = (mutations, finestUnit) => {
//   for (const mutation of mutations) {
//     const { y, m, d, h } = mutation
//     const range = [
//       moment.tz('Asia/Tokyo').year(y[0]).month(0).date(1).startOf('date'),
//       moment.tz('Asia/Tokyo').year(y[1]).month(11).date(31).endOf('date')
//     ]
//     if (m !== 'f') {
//       // 連続的
//     }
//     console.log("#", range)
//   }
// }

// 一部のunitの扱いを離散的にする必要があるため、
// 必要に応じて 'f' なunitを展開する
// 1回以上数値配列が与えられたunitの 'f' が展開される
const expandFillUnits = mutationGroup => {
  const units = ['h', 'd', 'm'] // 現状、yearは展開できない
  const newMutationGroup = []
  const ranges = []
  for (const mutations of mutationGroup) { // AND
    const absNumsArrayUnits = new Set()
    // 1回以上数値配列が指定されているunitsを集める
    for (const mutation of mutations) {
      for (const unit of units) {
        if (isAbsNumsArray(mutation[unit])) absNumsArrayUnits.add(unit)
      }
    }
    let finestUnit = ''
    for (const unit of units) {
      if (absNumsArrayUnits.has(unit)) {
        finestUnit = unit
        break
      }
    }
    console.log('finestUnit:', finestUnit)
    console.log('AND:', mutations) // f入りのmutations
    // https://gyazo.com/e377622058ebd3d70b0388672557c6e0
    const ranges = transformMutaitons(mutations, finestUnit) // ここが解けない
    console.log(ranges)
    console.log('-------------')

    // ranges.push(transformMutaitons(mutations, finestUnit))
    // 展開すべきunitsを決定する
    // 最小粒度以上のunitsをすべて展開する必要がある
    // たとえば、absNumsArrayUnitsにhのみやm,hが回収された場合、m,d,hが対象となる
    // let targetUnits = []
    // for (const [idx, unit] of units.entries()) {
    //   if (absNumsArrayUnits.has(unit)) {
    //     targetUnits = units.slice(idx, units.length)
    //     break
    //   }
    // }
    // // unitsを展開してnewMutationsを構築する
    // targetUnits = targetUnits.reverse()
    // const newMutations = []
    // for (const mutation of mutations) {
    //   newMutations.push(...expandF(mutation, targetUnits))
    // }
    // newMutationGroup.push(newMutations)
  }
  return ranges
}

module.exports = {
  expandFillUnits
}
