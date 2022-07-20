import { readFile } from "fs/promises";
import * as acorn from "acorn";
import {generate} from "escodegen";
import tacParser from './tac-parser.js'

const sourceCode = await readFile('./src/example.js', 'utf-8');
const parser = acorn.Parser.extend(tacParser())
const ast = parser.parse(sourceCode, {
  ecmaVersion: 'latest',
  sourceType: "module",
});
// console.log(JSON.stringify(ast, null));
console.log(generate(ast))