import * as acorn from "acorn";
import {generate} from "escodegen";
import tacParser from './tac-parser.js'

const sourceCode = 'let coord: Pair<number>'
const parser = acorn.Parser.extend(tacParser())
const ast = parser.parse(sourceCode, {
  ecmaVersion: 'latest',
  sourceType: "module",
});
console.log(JSON.stringify(ast, null));
console.log(generate(ast))