const DateExp = require('./')
const { debug } = require('./lib')

// const parsed = parse('ここ2年/今ごろ/5日')
// const mutations = parsed.actions.map(item => item.mutations)
// const res = mergeMutations(mutations) // まだfを含む状態
// debug('res: OR:')
// debug(res)
// debug('------------------')
// const ranges = calcRangesOr(res) // moment-ranges group
// console.log(ranges)

const dateExp = new DateExp('ここ2年/今ごろ/5日', 'Asia/Tokyo')
const momentRanges = dateExp.resolve().momentRanges
debug('OR: _mergedMutations:')
debug(dateExp._mergedMutations)
debug('------------------')
debug(momentRanges)
