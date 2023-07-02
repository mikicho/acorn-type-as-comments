import * as acorn from 'acorn'
import {generate} from 'escodegen'
import tacParser from '../src/tac-parser.js'

const parser = acorn.Parser.extend(tacParser())
const options = {
  ecmaVersion: 'latest',
  sourceType: 'module',
}

describe('FunctionRestParameter', () => {
  it.each([
    ['function a(...rest: string[]) {}', 'function a(...rest) {\n}'],
    ['function a(...{a}: { a: string }[]) {}', 'function a(...{a}) {\n}'],
  ])('should parse: %s', (source, expected) => {
    const ast = parser.parse(source, options)
    expect(generate(ast)).toBe(expected)
  })
})
