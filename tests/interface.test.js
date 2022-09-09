import * as acorn from 'acorn'
import {generate} from 'escodegen'
import tacParser from '../src/tac-parser.js'

const parser = acorn.Parser.extend(tacParser())
const options = {
  ecmaVersion: 'latest',
  sourceType: 'module',
}

describe.only('interface', () => {
  it.each([
    // ['a = 1; interface User { name: string }', 'a = 1;'],
    ['interface Pair<T, U> = { l: T; r: U }', ''],
    // ['export interface Pair<T, U> = { l: T, r: U }', ''],
    // ['interface Pair<T or ddd<d>, U  or this!<[]>> = { l: T, r: U }; a = 1', 'a = 1;'],
    // ['export interface Pair<T, U> = { l: T, r: U }; a = 1', 'a = 1;'],
  ])('should parse: %s', (source, expected) => {
    const ast = parser.parse(source, options)
    expect(generate(ast)).toBe(expected)
  })
})
