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

  // TODO: maybe we can duplicate parseIndent instead of both parseMaybeDefault and parseVar 
  return class extends Parser {
    parseMaybeDefault = function (startPos, startLoc, left) {
      left = left || this.parseBindingAtom();
      if (this.eat(tt.colon)) {
        this.skipParameterType()
      }
      if (this.options.ecmaVersion < 6 || !this.eat(tt.eq)) { return left }
      var node = this.startNodeAt(startPos, startLoc);
      node.left = left;
      node.right = this.parseMaybeAssign();
      return this.finishNode(node, "AssignmentPattern")
    }

    parseVar(node, isFor, kind) {
      node.declarations = []
      node.kind = kind
      for (; ;) {
        let decl = this.startNode()
        this.parseVarId(decl, kind)
        if (this.eat(tt.colon)) {
          this.skipParameterType()
        }
        if (this.eat(tt.eq)) {
          decl.init = this.parseMaybeAssign(isFor)
        } else if (kind === "const" && !(this.type === tt._in || (this.options.ecmaVersion >= 6 && this.isContextual("of")))) {
          this.unexpected()
        } else if (decl.id.type !== "Identifier" && !(isFor && (this.type === tt._in || this.isContextual("of")))) {
          this.raise(this.lastTokEnd, "Complex binding patterns require an initialization value")
        } else {
          decl.init = null
        }
        node.declarations.push(this.finishNode(decl, "VariableDeclarator"))
        if (!this.eat(tt.comma)) break
      }
      return node
    }

    skipParameterType() {
      let code = this.input.charCodeAt(this.pos)
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

      this.next()
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
