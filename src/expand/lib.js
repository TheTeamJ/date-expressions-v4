const getFillArray = fillUnit => {
  switch (fillUnit) {
    case 'm': return [...Array(12).keys()]
    case 'd': return [...Array(31).keys()].map(x => x + 1)
    case 'h': return [...Array(24).keys()]
  }
  return []
}

const expandArray = lr => {
  const res = []
  for (let i = lr[0]; i <= lr[1]; i++) res.push(i)
  return res
}

module.exports = {
  getFillArray,
  expandArray
}
