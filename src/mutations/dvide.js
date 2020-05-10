const moment = require('moment-timezone')

const getLastDate = ({ y, m }) => {
  return moment().year(y).month(m).endOf('month').date()
}

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
    subRes[0][0] = subRes[0][0].clone().set('date', l.date()).set('hour', l.hour()).startOf('hour')
    const t = subRes.length - 1
    subRes[t][1] = subRes[t][1].clone().set('date', r.date()).set('hour', r.hour()).endOf('hour')
    res.push(...subRes)
  }
  return res
}

const divideD = ranges => {
  const res = []
  for (const range of ranges) {
    const [l, r] = range
    if (l.date() === r.date()) {
      res.push(range)
      continue
    }
    if (l.year() !== r.year() || l.month() !== r.month()) {
      res.push(range)
      continue
    }
    const lastDate = getLastDate({ y: l.year(), m: l.month() })
    for (let d = 1; d <= lastDate; d++) {

    }
  }
}

module.exports = {
  divideM
}
