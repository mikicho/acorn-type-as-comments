import { Parser, TokContext } from "acorn";

export default function (options = {}) {
  return plugin;
} 

/**
 * @param {Parser} parser 
 */
function plugin(parser) {
  const tt = parser.acorn.tokTypes;
  const contexts = Object.assign(parser.acorn.tokContexts, {
    a_stat: new TokContext("<", false),
    s_stat: new TokContext("[", false),
  })

  return class extends Parser {
    parseMaybeDefault = function(startPos, startLoc, left) {
      left = left || this.parseBindingAtom();
      if (this.eat(tt.colon)) {
        this.skipParameterType()
        this.next()
      }
      if (this.options.ecmaVersion < 6 || !this.eat(tt.eq)) { return left }
      var node = this.startNodeAt(startPos, startLoc);
      node.left = left;
      node.right = this.parseMaybeAssign();
      return this.finishNode(node, "AssignmentPattern")
    }

    skipParameterType() {
      let code = this.input.charCodeAt(this.pos);
      while (((!this.isComma(code) && !this.isEqual(code) && !this.isCloseParenthesis(code)) || [contexts.a_stat, contexts.p_stat, contexts.s_stat].includes(this.curContext())) && this.pos < this.input.length) {
        switch (code) {
          case 60: // <
            this.context.push(contexts.a_stat)
            break;
          case 40: // (
            this.context.push(contexts.p_stat)
            break;
          case 91: // [
            this.context.push(contexts.s_stat)
            break;
          case 62: // >
          case 41: // )
          case 93: // ]
            this.context.pop()
            break;
        }
        code = this.input.charCodeAt(++this.pos);
      }
      
      if (this.curContext() === contexts.a_stat) {
        this.unexpected()
      }
    }

    isComma(code) {
      return code === 44;
    }
    
    isEqual(code) {
      return code === 61;
    }

    isCloseParenthesis(code) {
      return code === 41
    }
  }
}
