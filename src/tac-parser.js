import { Parser, TokContext } from "acorn";

export default function (options = {}) {
  return plugin;
} 

/**
 * @param {Parser} parser 
 */
function plugin(parser) {
  const tt = parser.acorn.tokTypes;
  const tc_type = new TokContext('type', false);

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
        this.checkType()
        this.next()
      }
      if (this.options.ecmaVersion < 6 || !this.eat(tt.eq)) { return left }
      var node = this.startNodeAt(startPos, startLoc);
      node.left = left;
      node.right = this.parseMaybeAssign();
      return this.finishNode(node, "AssignmentPattern")
    }

    checkType() {
      // check syntax rules for function parameter type
    }
  }
}
