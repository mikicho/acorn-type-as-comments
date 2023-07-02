import * as acorn from 'acorn'
import {generate} from 'escodegen'
import tacParser from '../src/tac-parser.js'

const parser = acorn.Parser.extend(tacParser())
const options = {
  ecmaVersion: 'latest',
  sourceType: 'module',
}

describe('CallExpression', () => {
  describe('CallExpression :: TypeArguments', () => {
    it.each([
      ['a.foo::<number>(1)', 'a.foo(1);'],
      ['foo::<number>(1)', 'foo(1);'],
      ['foo::<Pick<A, "a">>(1)', 'foo(1);'],
      ['(foo[4])::<Pick<A, "a">>(1)', 'foo[4](1);'],
      ['(foo[4])::<Pick<A, "a">>\n(1)', 'foo[4](1);'],
      // ['(foo[4])::\n<Pick<A, "a">>(1)', 'foo[4](1);'], // Not supported yet.
      ['(foo[4]) ::<Pick<A, "a">>(1)', 'foo[4](1);'],
      ['(foo[4]):: <Pick<A, "a">>(1)', 'foo[4](1);'],
      ['(foo[4])::<Pick<A, "a">> (1)', 'foo[4](1);'],
      ['await (foo[4])::<Pick<A, "a">> (1)', 'await foo[4](1);'],
    ])('should parse: %s', (source, expected) => {
      const ast = parser.parse(source, options)
      expect(generate(ast)).toBe(expected)
    })
  })
})
