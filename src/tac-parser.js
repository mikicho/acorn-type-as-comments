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
  })

  return class extends Parser {
    parseBindingList(close, allowEmpty, allowTrailingComma) {
      let elts = [], first = true
      while (!this.eat(close)) {
        if (first) first = false
        else this.expect(tt.comma)
        if (allowEmpty && this.type === tt.comma) {
          elts.push(null)
        } else if (allowTrailingComma && this.afterTrailingComma(close)) {
          break
        } else if (this.type === tt.ellipsis) {
          let rest = this.parseRestBinding()
          this.parseBindingListItem(rest)
          elts.push(rest)
          if (this.type === tt.comma) this.raise(this.start, "Comma is not permitted after the rest element")
          this.expect(close)
          break
        } else {
          let elem = this.parseMaybeDefault(this.start, this.startLoc)
          this.parseBindingListItem(elem)
          elts.push(elem)
        }
      }
      return elts
    }

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
      while (((!this.isComma(code) && !this.isEqual(code) && !this.isCloseParenthesis(code)) || this.curContext() === contexts.a_stat) && this.pos < this.input.length) {
        if (code === 60) { // < 
          this.context.push(contexts.a_stat)
        } else if (code === 62) { // >
          this.context.pop()
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
