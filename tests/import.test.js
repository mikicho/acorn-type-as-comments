import * as acorn from 'acorn'
import {generate} from 'escodegen'
import tacParser from '../src/tac-parser.js'

const parser = acorn.Parser.extend(tacParser())
const options = {
  ecmaVersion: 'latest',
  sourceType: 'module',
}

describe('import', () => {
  it.each([
    ['import { Pair } from "./a.js"', "import { Pair } from './a.js';"],
    ['import type { Pair } from "./a.js"\na = 1', 'a = 1;'],
    ['import type * as schema from "schema";a = 1', 'a = 1;'],
    ['import { type Pair } from "./a.js"\na = 1', "import './a.js';\na = 1;"],
    [
      'import { type Pair, nextToken } from "./a.js"\na = 1',
      "import { nextToken } from './a.js';\na = 1;",
    ],
    [
      'import { type Pair as P, nextToken } from "./a.js"\na = 1',
      "import { nextToken } from './a.js';\na = 1;",
    ],
  ])('should parse: %s', (source, expected) => {
    const ast = parser.parse(source, options)
    expect(generate(ast)).toBe(expected)
  })
})
