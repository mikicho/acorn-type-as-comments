import * as acorn from 'acorn'
import {generate} from 'escodegen'
import tacParser from '../src/tac-parser.js'

const parser = acorn.Parser.extend(tacParser())
const options = {
  ecmaVersion: 'latest',
  sourceType: 'module',
}

describe('MemberExpression', () => {
  describe('MemberExpression :: TypeArguments', () => {
    it.each([
      ['this::<User>.hello()', 'this.hello();'],
      ['a::<User> = new User()', 'a = new User();'],
      ['await a::<User>()', 'await a();'],
    ])('should parse: %s', (source, expected) => {
      const ast = parser.parse(source, options)
      expect(generate(ast)).toBe(expected)
    })
  })

  describe('MemberExpression [no LineTerminator here] !', () => {
    it.each([
      ['a!', 'a;'],
      ['a!.hello()', 'a.hello();'],
    ])('should parse: %s', (source, expected) => {
      const ast = parser.parse(source, options)
      expect(generate(ast)).toBe(expected)
    })

    it.each([['a !']])('should parse: %s', (source) => {
      const parse = () => parser.parse(source, options)
      expect(parse).toThrow('Unexpected token')
    })
  })
})
