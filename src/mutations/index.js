const { cloneDeep } = require('lodash')
const moment = require('moment-timezone')
const { debug } = require('../../src/lib')

const now = moment.tz('Asia/Tokyo')
const base = { y: now.year(), m: now.month() + 1, d: now.date(), h: now.hour() }
debug(base)

// 数値指定されているunitの要素数を2にするなど
// 増減量表現でない場合は数値型に変換する
const fmt = mutation => {
  for (const unit in mutation) {
    const value = mutation[unit]
    if (Array.isArray(value)) {
      if (value.length === 0 || value.length > 2) throw new Error(`Invalid value: ${unit}`)
      if (value.length === 1) {
        mutation[unit] = [value[0], value[0]]
      }
      for (let i = 0; i < 2; i++) {
        const value = `${mutation[unit][i]}`
        if (!value.startsWith('+') && !value.startsWith('-')) mutation[unit][i] = parseInt(value)
      }
    }
  }
  return mutation
}

// ユーザ定義のmutから、仕様上妥当なunitだけを拾い出す
const createMutaion = (mut, defaultValue) => {
  const mutation = {
    y: mut.y || defaultValue,
    m: mut.m || defaultValue,
    d: mut.d || defaultValue,
    h: mut.h || defaultValue
  }
  return mutation
}

// weak inherit
// 絶対表現に用いる型
const a = mutations => {
  if (!Array.isArray(mutations)) mutations = [mutations]
  const res = []
  for (const mut of mutations) {
    const mutation = fmt(createMutaion(mut, 'i'))
    mutation._kind = 'a'
    mutation._base = cloneDeep(base)
    res.push(mutation)
  }
  return res
}

// strong inherit
// 相対表現に用いる型
const r = mutations => {
  if (!Array.isArray(mutations)) mutations = [mutations]
  const res = []
  for (const mut of mutations) {
    const mutation = fmt(createMutaion(mut, 'I'))
    mutation._kind = 'r'
    mutation._base = cloneDeep(base)
    res.push(mutation)
  }
  return res
}

module.exports = {
  a,
  r
}
