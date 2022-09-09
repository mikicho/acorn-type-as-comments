import * as acorn from 'acorn'
import {toJs} from 'estree-util-to-js'
import tacParser from '../src/tac-parser.js'

const parser = acorn.Parser.extend(tacParser())
const options = {
  ecmaVersion: 'latest',
  sourceType: 'module',
}

describe.skip('qa', () => {
  it('should parse lotsa crazy code', () => {
    const source = `
let x: string
let y: (whatever is necessary);
let z: whatever is necessary = 4

function f(x: this<is-[really]-{good}>, y: (string extends State
  ? ParserError<"EatWhitespace got generic string type">
  : State extends \` \${x}\` | \`\${infer State}\`
    ? EatWhitespace<State>
    : State))  {}
interface A {
  a: !!!^^^hello!
}
type B = {a: string!hello?&&&, [[]]}
class C {
  a: string;
  constructor(a: <>) {}
  foo(a: !!![]) {}
};
function optional(x?: string) {}
    `.trim()
    const ast = parser.parse(source, options)
    expect(toJs(ast).value).toBe('')
  })
})
