import * as acorn from "acorn";
import { generate } from "escodegen";
import tacParser from "../src/tac-parser.js";

const parser = acorn.Parser.extend(tacParser())
const options = {
  ecmaVersion: 'latest',
  sourceType: "module",
}

describe('Function argument type', () => {
  it.each([
    ['function a(arg) {}', 'function a(arg) {\n}'],
    ['function a(arg = 5) {}', 'function a(arg = 5) {\n}'],
    ['function a(arg: string) {}', 'function a(arg) {\n}'],
    ['function a(arg: Pick<A, "a">) {}', 'function a(arg) {\n}'],
    ['function a(arg: Pick<A, "a">, arg1) {}', 'function a(arg, arg1) {\n}'],
    ['function a(arg: Pick<A, "a"> = 5) {}', 'function a(arg = 5) {\n}'],
    ['function a(arg: Pick(A, "a") = 5) {}', 'function a(arg = 5) {\n}'],
    ['function a(arg: Pick[A, "a"] = 5) {}', 'function a(arg = 5) {\n}'],
    ['function a(arg: string = 5, arg1) {}', 'function a(arg = 5, arg1) {\n}'],
  ])('should parse: %s', (source, expected) => {
    const ast = parser.parse(source, options)
    expect(generate(ast)).toBe(expected)
  });
});