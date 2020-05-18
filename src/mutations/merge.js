const { cloneDeep } = require('lodash')
const { isAbsNumsArray, isRelNumsArray } = require('../lib')

// setA: [1, 2], setB: [3, 4] -> [[1, 2, 3], [1, 2, 4]]
const setCrtesian = (setA, setB) => {
  const result = []
  for (let j = 0; j < setB.length; j++) {
    const res = cloneDeep(setA)
    res.push(setB[j])
    result.push(res)
  }
  return result
}

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
    // 複数個に展開されるケースもある
    // const newMuts = []
    // 変容完了の合図として削除する
    delete newMut._base
    delete newMut._kind

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
              // mが具体的に指定されている場合は年またぎしたくない
              if (isAbsNumsArray(mut.m)) {
                // valueをそのまま残す
              } else {
                newMut[unit] = [minYear, maxYear]
                if (isRelNumsArray(value)) {
                  newMut[unit][0] += parseInt(value[0])
                  newMut[unit][1] += parseInt(value[1])
                }
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
    candidates.push(newMut)
  }

  return {
    resolved: candidates.filter(mut => isAbsNumsArray(mut.y)),
    unresolved: candidates.filter(mut => !isAbsNumsArray(mut.y)),
    yearRange: [minYear, maxYear]
  }
}

// mutationGroup: [[{}, {}], [{}], ...]
const mergeMutations = mutationGroup => {
  let combinations = mutationGroup[0].map(mut => [mut]) // [[{}], ...]
  for (let i = 1; i < mutationGroup.length; i++) {
    const newCombinations = []
    for (const combination of combinations) {
      newCombinations.push(...cloneDeep(setCrtesian(combination, mutationGroup[i])))
    }
    combinations = newCombinations
  }
  const res = []
  for (const combination of combinations) {
    const { resolved, unresolved, yearRange } = fixMutationUnits(combination)
    // unit「y」だけiを含む可能性がある
    if (unresolved.length > 0) {
      for (let y = yearRange[0]; y <= yearRange[1]; y++) {
        const _resolved = cloneDeep(resolved)
        for (let mut of unresolved) {
          mut = cloneDeep(mut)
          mut.y = [y, y]
          _resolved.push(mut)
        }
        res.push(_resolved)
      }
    } else {
      res.push(resolved)
    }
  }
  return res
}

module.exports = {
  mergeMutations
}
