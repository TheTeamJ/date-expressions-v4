/* eslint-env mocha */
const { assert } = require('chai')
const { divideIntoActions } = require('../src/actions')

const testActions = (expression, wholes, unhandeledText) => {
  const { actions, unhandledExpression } = divideIntoActions(expression)
  const matched = actions.map(action => action.whole)
  assert.deepEqual(matched, wholes)
  assert.equal(unhandledExpression, unhandeledText)
}

describe('Actions', function () {
  it('divideIntoActions', function () {
    testActions('2015年のインターン', ['2015年'], 'のインターン')
  })
})
