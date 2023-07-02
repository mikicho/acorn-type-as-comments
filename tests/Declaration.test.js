import * as acorn from 'acorn'
import tacParser from '../src/tac-parser.js'
import {generate} from 'escodegen'

const parser = acorn.Parser.extend(tacParser())
const options = {
  ecmaVersion: 'latest',
  sourceType: 'module',
}

describe('Declaration', () => {
  describe('TypeDeclaration', () => {
    it.each([
      ['type = 5', ''],
      ['a = 1; type MyString = string', 'a = 1;'],
      ['a = 1;\ntype MyString = string\nb=1', 'a = 1;\nb = 1;'],
      ['type Pair<T, U> = { l: T r: U }', ''],
      ['type Pair<T, U> = { l: T, r: U }; a = 1', ';\na = 1;'],
      ['type Pair<T, U> = { l: T, r: U } a = 1', ''], // this is controversial!
      ['export type Pair<T, U> = { l: T, r: U }; a = 1', ';\na = 1;'],
      [
        'export type Pair<T!! or die or [[(())]], U?!?!?!?!? right?> = { l: T, r: U }; a = 1',
        ';\na = 1;',
      ],
      ['export type { Pair }\na = 1', 'a = 1;'],
      ['export type { Pair as Triplet}\na = 1', 'a = 1;'],
    ])('should parse: %s', (source, expected) => {
      const ast = parser.parse(source, options)
      expect(generate(ast)).toBe(expected)
    })
  })

  describe('InterfaceDeclaration', () => {
    it.each([
      ['a = 1; interface User { name: string }', 'a = 1;'],
      ['interface Pair<T, U> = { l: T; r: U }', ''],
      ['interface Pair<T, U> extends User = { l: T; r: U }', ''],
      ['export interface Pair<T, U> = { l: T, r: U }', ''],
      ['interface Pair<T or ddd<d>, U  or this!<[]>> = { l: T, r: U }; a = 1', ';\na = 1;'],
      ['export interface Pair<T, U> = { l: T, r: U }; a = 1', ';\na = 1;'],
    ])('should parse: %s', (source, expected) => {
      const ast = parser.parse(source, options)
      expect(generate(ast)).toBe(expected)
    })
  })
})
