import * as acorn from 'acorn'
import {generate} from 'escodegen'
import tacParser from '../src/tac-parser.js'

const parser = acorn.Parser.extend(tacParser())
const options = {
  ecmaVersion: 'latest',
  sourceType: 'module',
}

describe('OptionalChain', () => {
  describe('OptionalChain :: TypeArguments', () => {
    it.each([
      ['a?.hello::<User>()', 'a?.hello();'],
      // ['a?.::<User>()', ';'], TODO: Is this supported by spec?
    ])('should parse: %s', (source, expected) => {
      const ast = parser.parse(source, options)
      expect(generate(ast)).toBe(expected)
    })
  })
})
