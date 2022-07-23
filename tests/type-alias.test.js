import * as acorn from "acorn";
import { generate } from "escodegen";
import tacParser from "../src/tac-parser.js";

const parser = acorn.Parser.extend(tacParser())
const options = {
  ecmaVersion: 'latest',
  sourceType: "module",
}

describe('type alias', () => {
  it.each([
    ['type = 5', 'type = 5;'],
    ['a = 1; type MyString = string', 'a = 1;'],
    ['type Pair<T, U> = { l: T r: U }', ''],
    ['type Pair<T, U> = { l: T, r: U }; a = 1', 'a = 1;'],
  ])('should parse: %s', (source, expected) => {
    const ast = parser.parse(source, options)
    expect(generate(ast)).toBe(expected)
  });
});