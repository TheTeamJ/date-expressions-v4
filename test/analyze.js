/* eslint-env mocha */
const { assert } = require('chai')
const { registerSampleCustomMutations } = require('./custom')
const DateExp = require('../src/')

describe('Query expression analyzer', function () {
  it('There are zero mutations defined by user', function () {
    assert.equal(DateExp.customMutations.length, 0)
  })

  it('Correctly detect handled/unhandled expressions', function () {
    const { handled, unhandled } = DateExp.analyzeExpression('令和1年/夏/夜', '/')
    // handled expressions
    assert.equal(handled.length, 1)
    assert.equal(handled[0], '夏')
    // unhandled (unregistered) expressions
    assert.equal(unhandled.length, 2)
    assert.equal(unhandled[0], '令和1年')
    assert.equal(unhandled[1], '夜')
  })

  it('After analyzed, add a custom mutations', function () {
    const q = '夏/インターンシップ/午後'
    const { handled, unhandled } = DateExp.analyzeExpression(q, '/')
    // handled expressions
    assert.equal(handled.length, 2)
    assert.equal(handled[0], '夏')
    assert.equal(handled[1], '午後')
    // unhandled (unregistered) expressions
    assert.equal(unhandled.length, 1)
    assert.equal(unhandled[0], 'インターンシップ')

    // Register custom mutations
    registerSampleCustomMutations()
    const newResult = DateExp.analyzeExpression(q, '/')
    assert.equal(DateExp.customMutations.length, 5)
    assert.equal(newResult.handled.length, 3)
    assert.equal(newResult.unhandled.length, 0)
  })
})
