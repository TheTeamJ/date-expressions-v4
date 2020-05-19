const DateExp = require('./')
const { debug } = require('./lib')

const dateExp = new DateExp(process.env.TEXT || 'ここ2年/今ごろ/5日', 'Asia/Tokyo')
const momentRanges = dateExp.resolve().momentRanges
debug('OR: _mergedMutations:')
debug(dateExp._mergedMutations)
debug('------------------')
console.log(momentRanges)
