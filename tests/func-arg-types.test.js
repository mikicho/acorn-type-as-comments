import * as acorn from "acorn";
import tacParser from "../src/tac-parser.js";

const parser = acorn.Parser.extend(tacParser())
const options = {
  ecmaVersion: 'latest',
  sourceType: "module",
}

describe('Function argument type', () => {
  it.each([
    ['function a(arg) {}', {"type":"Program","start":0,"end":18,"body":[{"type":"FunctionDeclaration","start":0,"end":18,"id":{"type":"Identifier","start":9,"end":10,"name":"a"},"expression":false,"generator":false,"async":false,"params":[{"type":"Identifier","start":11,"end":14,"name":"arg"}],"body":{"type":"BlockStatement","start":16,"end":18,"body":[]}}],"sourceType":"module"}],
    ['function a(arg: string) {}', {"type":"Program","start":0,"end":26,"body":[{"type":"FunctionDeclaration","start":0,"end":26,"id":{"type":"Identifier","start":9,"end":10,"name":"a"},"expression":false,"generator":false,"async":false,"params":[{"type":"Identifier","start":11,"end":14,"name":"arg"}],"body":{"type":"BlockStatement","start":24,"end":26,"body":[]}}],"sourceType":"module"}],
    ['function a(arg: Pick<A, "a">) {}', {"type":"Program","start":0,"end":32,"body":[{"type":"FunctionDeclaration","start":0,"end":32,"id":{"type":"Identifier","start":9,"end":10,"name":"a"},"expression":false,"generator":false,"async":false,"params":[{"type":"Identifier","start":11,"end":14,"name":"arg"}],"body":{"type":"BlockStatement","start":30,"end":32,"body":[]}}],"sourceType":"module"}],
    ['function a(arg: Pick<A, "a">, arg1) {}', {"type":"Program","start":0,"end":38,"body":[{"type":"FunctionDeclaration","start":0,"end":38,"id":{"type":"Identifier","start":9,"end":10,"name":"a"},"expression":false,"generator":false,"async":false,"params":[{"type":"Identifier","start":11,"end":14,"name":"arg"},{"type":"Identifier","start":30,"end":34,"name":"arg1"}],"body":{"type":"BlockStatement","start":36,"end":38,"body":[]}}],"sourceType":"module"}],
    ['function a(arg: Pick<A, "a"> = 5) {}', {"type":"Program","start":0,"end":36,"body":[{"type":"FunctionDeclaration","start":0,"end":36,"id":{"type":"Identifier","start":9,"end":10,"name":"a"},"expression":false,"generator":false,"async":false,"params":[{"type":"AssignmentPattern","start":11,"end":32,"left":{"type":"Identifier","start":11,"end":14,"name":"arg"},"right":{"type":"Literal","start":31,"end":32,"value":5,"raw":"5"}}],"body":{"type":"BlockStatement","start":34,"end":36,"body":[]}}],"sourceType":"module"}],
    ['function a(arg: Pick(A, "a") = 5) {}', {"type":"Program","start":0,"end":36,"body":[{"type":"FunctionDeclaration","start":0,"end":36,"id":{"type":"Identifier","start":9,"end":10,"name":"a"},"expression":false,"generator":false,"async":false,"params":[{"type":"AssignmentPattern","start":11,"end":32,"left":{"type":"Identifier","start":11,"end":14,"name":"arg"},"right":{"type":"Literal","start":31,"end":32,"value":5,"raw":"5"}}],"body":{"type":"BlockStatement","start":34,"end":36,"body":[]}}],"sourceType":"module"}],
    ['function a(arg: Pick[A, "a"] = 5) {}', {"type":"Program","start":0,"end":36,"body":[{"type":"FunctionDeclaration","start":0,"end":36,"id":{"type":"Identifier","start":9,"end":10,"name":"a"},"expression":false,"generator":false,"async":false,"params":[{"type":"AssignmentPattern","start":11,"end":32,"left":{"type":"Identifier","start":11,"end":14,"name":"arg"},"right":{"type":"Literal","start":31,"end":32,"value":5,"raw":"5"}}],"body":{"type":"BlockStatement","start":34,"end":36,"body":[]}}],"sourceType":"module"}],
    ['function a(arg: string = 5, arg1) {}', {"type":"Program","start":0,"end":36,"body":[{"type":"FunctionDeclaration","start":0,"end":36,"id":{"type":"Identifier","start":9,"end":10,"name":"a"},"expression":false,"generator":false,"async":false,"params":[{"type":"AssignmentPattern","start":11,"end":26,"left":{"type":"Identifier","start":11,"end":14,"name":"arg"},"right":{"type":"Literal","start":25,"end":26,"value":5,"raw":"5"}},{"type":"Identifier","start":28,"end":32,"name":"arg1"}],"body":{"type":"BlockStatement","start":34,"end":36,"body":[]}}],"sourceType":"module"}],
  ])('should parse: %s', (source, expectedAst) => {
    const ast = parser.parse(source, options)
    expect(ast).toEqual(expectedAst)
  });
});