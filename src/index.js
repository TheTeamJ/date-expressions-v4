const { mergeMutations } = require('./mutations/merge')
const { calcRangesOr } = require('./expand/')
const { parse } = require('./utils/')
const { debug } = require('./lib')

const parsed = parse('ここ2年/今ごろ')
const mutations = parsed.actions.map(item => item.mutations)
const res = mergeMutations(mutations) // まだfを含む状態
debug('res: OR:')
debug(res)
debug('------------------')
const ranges = calcRangesOr(res) // moment-ranges group
console.log(ranges)
