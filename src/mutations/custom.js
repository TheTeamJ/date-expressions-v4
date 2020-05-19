const { a, r } = require('./')

const acceptKinds = ['a', 'r']

const createMutation = (expression, mutation, kind) => {
  if (!acceptKinds.includes(kind)) {
    throw new Error('Invalid mutation kind')
  }
  if (!(expression instanceof RegExp)) {
    throw new Error('Invalid expression')
  }
  switch (kind) {
    case 'a':
      return [expression, a(mutation)]
    case 'r':
      return [expression, r(mutation)]
  }
}

module.exports = {
  createMutation
}
