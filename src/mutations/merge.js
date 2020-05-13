const { cloneDeep } = require('lodash')
const { isAbsNumsArray, isRelNumsArray, debug } = require('../lib')

// setA: [1, 2], setB: [3, 4] -> [[1, 2, 3], [1, 2, 4]]
const setCrtesian = (setA, setB) => {
  const result = []
  // for (let i = 0; i < setA.length; i++) {
    // const res = []
  for (let j = 0; j < setB.length; j++) {
    const res = cloneDeep(setA)
    res.push(setB[j])
    result.push(res)
  }
    // result.push(res)
  // }
  return result
}

// console.log('>>>', setCrtesian([1], [2, 3]))

// 数値配列, f, i, I の力比べなどを行いmutationsを確定する
// XXX: ひとまずkind=aのみを受け取る前提で考える
// XXX: rをaに作用させる処理はまだ書いていない
const fixMutationUnits = combedMutations => {
  const units = ['y', 'm', 'd', 'h']
  let minYear = 9999
  let maxYear = 0
  const absNumsArrayUnits = new Set()
  const relNumsArrayUnits = new Set()
  const fillUnits = new Set()

  for (const mut of combedMutations) {
    for (const unit of units) {
      const value = mut[unit]
      if (isAbsNumsArray(value)) {
        absNumsArrayUnits.add(unit)
        if (unit === 'y') {
          if (value[0] < minYear) minYear = value[0]
          if (value[1] > maxYear) maxYear = value[1]
        }
      } else if (isRelNumsArray(value)) {
        relNumsArrayUnits.add(unit)
      } else if (value === 'f') {
        fillUnits.add(unit)
      }
    }
  }

  const candidates = []
  for (const mut of combedMutations) {
    const newMut = cloneDeep(mut)
    for (const unit of units) {
      const value = mut[unit]
      switch (value) {
        case 'I':
        case 'i': {
          // 強いIか弱いiに応じて条件が異なる
          const cond = value === 'i'
            ? absNumsArrayUnits.has(unit) || fillUnits.has(unit)
            : absNumsArrayUnits.has(unit)
          if (cond) {
            // 少々広くなるが、後にintersectionをとるだけなので大丈夫だと思う
            if (unit === 'y') {
              newMut[unit] = [minYear, maxYear]
              if (isRelNumsArray(value)) {
                newMut[unit][0] += parseInt(value[0])
                newMut[unit][1] += parseInt(value[1])
              }
            } else {
              newMut[unit] = 'f'
            }
          } else {
            // inherit
            const inheritValue = mut._base[unit]
            newMut[unit] = [inheritValue, inheritValue]
            if (isRelNumsArray(value)) {
              newMut[unit][0] += parseInt(value[0])
              newMut[unit][1] += parseInt(value[1])
            }
          }
          break
        }
        case 'f':
          // このままでいい
          break
        default: { // 数値配列
          if (unit !== 'y') break // このままでいい
          if (isRelNumsArray(value)) {
            if (absNumsArrayUnits.has(unit)) {
              newMut[unit] = [
                minYear + parseInt(value[0]),
                maxYear + parseInt(value[1])
              ]
            } else {
              // inheirit
              const inheritValue = mut._base[unit]
              newMut[unit] = [
                inheritValue + parseInt(value[0]),
                inheritValue + parseInt(value[1])
              ]
            }
          }
          break
        }
      }
    }
    // 変容完了の合図として削除する
    delete newMut._base
    delete newMut._kind
    candidates.push(newMut)
  }

  // debug(combedMutations)
  // debug({ absNumsArrayUnits, relNumsArrayUnits, fillUnits })
  // debug(candidates)
  return candidates
}

// mutationGroup: [[{}, {}], [{}], ...]
const mergeMutations = mutationGroup => {
  let combinations = [mutationGroup[0]] // [{}, ...]
  for (let i = 1; i < mutationGroup.length; i++) {
    const newCombinations = []
    for (const combination of combinations) {
      newCombinations.push(...cloneDeep(setCrtesian(combination, mutationGroup[i])))
    }
    combinations = newCombinations
  }
  const res = []
  for (const combination of combinations) {
    res.push(fixMutationUnits(combination))
  }
  return res
}

module.exports = {
  mergeMutations
}
