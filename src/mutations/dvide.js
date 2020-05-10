const moment = require('moment-timezone')

const getLastDate = ({ y, m }) => {
  return moment().year(y).month(m).endOf('month').date()
}

// [[2020/8/10, 2020/10/21]]
// -> [[2020/8/10, 2020/8/31], [2020/9/1, 2020/9/30], [2020/10/1, 2020/10/21]] に分割する
const divideM = ranges => {
  const res = []
  for (const range of ranges) {
    const [l, r] = range
    if (l.month() === r.month()) {
      res.push(range)
      continue
    }
    if (l.month() === 0 && l.date() === 1 && r.month() === 11 && r.date() === 31) {
      res.push(range)
      continue
    }
    if (l.year() !== r.year()) {
      // TODO: 今後の課題
      res.push(range)
      continue
    }

    const subRes = []
    for (let m = l.month(); m <= r.month(); m++) {
      subRes.push([
        l.clone().set('month', m).startOf('month'),
        l.clone().set('month', m).endOf('month')
      ])
    }
    // 区間の末端の辻褄合わせ
    subRes[0][0] = subRes[0][0].clone().set('date', l.date()).set('hour', l.hour()).startOf('hour')
    const t = subRes.length - 1
    subRes[t][1] = subRes[t][1].clone().set('date', r.date()).set('hour', r.hour()).endOf('hour')
    res.push(...subRes)
  }
  return res
}

// [[2020/8/10, 2020/8/31]] (divdeMを実行した後の姿)
// -> [[2020/8/10, 2020/8/10], [2020/8/11, 2020/8/11], ..., [2020/8/31, 2020/8/31]] に分割する
const divideD = ranges => {
  const res = []
  for (const range of ranges) {
    const [l, r] = range
    if (l.date() === r.date()) {
      res.push(range)
      continue
    }
    if (l.year() !== r.year() || l.month() !== r.month()) {
      // TODO: 今後の課題
      res.push(range)
      continue
    }
    const subRes = []
    // const lastDate = getLastDate({ y: l.year(), m: l.month() })
    for (let d = l.date(); d <= r.date(); d++) {
      subRes.push([
        l.clone().set('date', d).startOf('date'),
        l.clone().set('date', d).endOf('date')
      ])
    }
    // 区間の末端の辻褄合わせ
    subRes[0][0] = subRes[0][0].clone().set('hour', l.hour()).startOf('hour')
    const t = subRes.length - 1
    subRes[t][1] = subRes[t][1].clone().set('hour', r.hour()).endOf('hour')
    res.push(...subRes)
  }
  return res
}

module.exports = {
  divideM,
  divideD
}
