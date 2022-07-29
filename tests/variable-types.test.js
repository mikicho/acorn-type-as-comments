import * as acorn from "acorn";
import { generate } from "escodegen";
import tacParser from "../src/tac-parser.js";

const parser = acorn.Parser.extend(tacParser())
const options = {
  ecmaVersion: 'latest',
  sourceType: "module",
}

describe('Variable type', () => {
  it.each([
    ['let coord', 'let coord;'],
    ['const coord = 5', 'const coord = 5;'],
    ['let coord: Pair<number>', 'let coord;'],
    ['let coord: { a: string }', 'let coord;'],
    ['const coord: Pair<number> = 5', 'const coord = 5;'],
    ['const coord: { a: string } = 5', 'const coord = 5;'],
  ])('should parse: %s', (source, expected) => {
    const ast = parser.parse(source, options)
    expect(generate(ast)).toBe(expected)
  });
});