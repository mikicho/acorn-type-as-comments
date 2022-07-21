import * as acorn from "acorn";
import tacParser from "../src/tac-parser.js";

const parser = acorn.Parser.extend(tacParser())
const options = {
  ecmaVersion: 'latest',
  sourceType: "module",
}

describe('Variable type', () => {
  it.each([
    ['let coord', {"type":"Program","start":0,"end":9,"body":[{"type":"VariableDeclaration","start":0,"end":9,"declarations":[{"type":"VariableDeclarator","start":4,"end":9,"id":{"type":"Identifier","start":4,"end":9,"name":"coord"},"init":null}],"kind":"let"}],"sourceType":"module"}],
    ['const coord = 5', {"type":"Program","start":0,"end":15,"body":[{"type":"VariableDeclaration","start":0,"end":15,"declarations":[{"type":"VariableDeclarator","start":6,"end":15,"id":{"type":"Identifier","start":6,"end":11,"name":"coord"},"init":{"type":"Literal","start":14,"end":15,"value":5,"raw":"5"}}],"kind":"const"}],"sourceType":"module"}],
    ['let coord: Pair<number>', {"type":"Program","start":0,"end":23,"body":[{"type":"VariableDeclaration","start":0,"end":15,"declarations":[{"type":"VariableDeclarator","start":4,"end":15,"id":{"type":"Identifier","start":4,"end":9,"name":"coord"},"init":null}],"kind":"let"}],"sourceType":"module"}],
    ['const coord: Pair<number> = 5', {"type":"Program","start":0,"end":29,"body":[{"type":"VariableDeclaration","start":0,"end":29,"declarations":[{"type":"VariableDeclarator","start":6,"end":29,"id":{"type":"Identifier","start":6,"end":11,"name":"coord"},"init":{"type":"Literal","start":28,"end":29,"value":5,"raw":"5"}}],"kind":"const"}],"sourceType":"module"}],
  ])('should parse: %s', (source, expectedAst) => {
    const ast = parser.parse(source, options)
    expect(ast).toEqual(expectedAst)
  });
});