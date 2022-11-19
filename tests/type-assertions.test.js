import * as acorn from 'acorn'
import {toJs} from 'estree-util-to-js'
import tacParser from '../src/tac-parser.js'

const parser = acorn.Parser.extend(tacParser())
const options = {
  ecmaVersion: 'latest',
  sourceType: 'module',
}

describe('type-assertions', () => {
  it.each([
    ['a = 1 as number', 'a = 1;\n'],
    ['1 as number, b = 1 as number', '(1, b = 1);\n'],
    ['a = 1 as number< 17', 'a = 1;\n'],
    ['a = 1 as (number)< 17', 'a = 1 < 17;\n'],
    ['a = 1 as as', 'a = 1;\n'],
    ['function a() { return result as const }', 'function a() {\n  return result;\n}\n'],
    [
      'a*(4 as string<foo***>) + foo((78 * 7) as lsjdfskhdf) + as as as, b ? b?c:4 as zoo[::::] : la',
      '(a * 4 + foo(78 * 7) + as, b ? b ? c : 4 : la);\n',
    ],
    ['(pet as Fish).swim', 'pet.swim;\n'],
    ['x!.a', 'x.a'], // TODO not supported yet
  ])('should parse: %s', (source, expected) => {
    const ast = parser.parse(source, options)
    expect(toJs(ast).value).toBe(expected)
  })
})
