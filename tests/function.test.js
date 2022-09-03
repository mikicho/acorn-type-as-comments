import * as acorn from "acorn";
import { generate } from "escodegen";
import tacParser from "../src/tac-parser.js";

const parser = acorn.Parser.extend(tacParser())
const options = {
  ecmaVersion: 'latest',
  sourceType: "module",
}

describe('Function', () => {
  it.each([
    ['function a(arg) {}', 'function a(arg) {\n}'],
    ['function a(arg = 5) {}', 'function a(arg = 5) {\n}'],
    ['function a(arg: string) {}', 'function a(arg) {\n}'],
    ['function a(arg: Pick<A, "a">) {}', 'function a(arg) {\n}'],
    ['function a(arg: Pick<A, "a">, arg1) {}', 'function a(arg, arg1) {\n}'],
    ['function a(arg: Pick<A, "a"> = 5) {}', 'function a(arg = 5) {\n}'],
    ['function a(arg: Pick(A, "a") = 5) {}', 'function a(arg = 5) {\n}'],
    ['function a(arg: Pick[A, "a"] = 5) {}', 'function a(arg = 5) {\n}'],
    ['function a(arg: string = 5, arg1): Pick<{a: string}, "a"> {}', 'function a(arg = 5, arg1) {\n}'],
    ['function a(arg: string = 5, arg1): {a: string} {}', 'function a(arg = 5, arg1) {\n}'],
    ['export function a() {}', 'export function a() {\n}'],
    // ['function a(): string {}', 'function a() {\n}'], // TODO function return type
    // ['function a(x?: optional-type) {}', 'function a(x) {\n}'], // TODO optional parameters
    // ['function a<T>() {}', 'function a(x) {\n}'], // TODO generics
  ])('should parse: %s', (source, expected) => {
    const ast = parser.parse(source, options)
    expect(generate(ast)).toBe(expected)
  });
});