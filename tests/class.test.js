import * as acorn from 'acorn'
import {toJs} from 'estree-util-to-js'
import tacParser from '../src/tac-parser.js'

const parser = acorn.Parser.extend(tacParser())
const options = {
  ecmaVersion: 'latest',
  sourceType: 'module',
}

describe('class', () => {
  it.each([
    ['class PairClass { p }', 'class PairClass {\n  p\n}\n'],
    [
      `class PairClass {
      p: string
      // }
    }`,
      'class PairClass {\n  p\n}\n',
    ],
    [
      'class PairClass { p = { l: 1, r: 1 }}',
      'class PairClass {\n  p = {\n    l: 1,\n    r: 1\n  }\n}\n',
    ],
    [
      'class PairClass<T, U> { p: Pair<T, U> = { l: 1, r: 1 }}',
      'class PairClass {\n  p = {\n    l: 1,\n    r: 1\n  }\n}\n',
    ],
    ['class PairClass<T, U> { p: Pair<T, U> }', 'class PairClass {\n  p\n}\n'],
    ['class PairClass<T, U> { p: Pair<T, U>; b: string }', 'class PairClass {\n  p\n  b\n}\n'],
    ['class PairClass<T, U> { b: { a: string }}', 'class PairClass {\n  b\n}\n'],
    [
      'class PairClass<T liliil<ddd> class{}, U> { b: { a: string }}',
      'class PairClass {\n  b\n}\n',
    ],
  ])('should parse: %s', (source, expected) => {
    const ast = parser.parse(source, options)
    // Switch to a generator that supports class static fields https://github.com/estools/escodegen/issues/443
    expect(toJs(ast).value).toBe(expected)
  })
})
