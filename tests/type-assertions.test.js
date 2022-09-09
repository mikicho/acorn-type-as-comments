import * as acorn from 'acorn'
import {toJs} from 'estree-util-to-js'
import tacParser from '../src/tac-parser.js'

const parser = acorn.Parser.extend(tacParser())
const options = {
  ecmaVersion: 'latest',
  sourceType: 'module',
}

describe.skip('type-assertions', () => {
  it.each([
    // ['a = 1 as number', 'a = 1'] // TODO not supported yet
    // ['x!.a', 'x.a'] // TODO not supported yet
  ])('should parse: %s', (source, expected) => {
    const ast = parser.parse(source, options)
    expect(toJs(ast).value).toBe(expected)
  })
})
