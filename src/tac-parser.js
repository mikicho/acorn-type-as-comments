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
        else this.expect(tt.comma, tt.colon)
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
        } else  if (this.curContext() === tc_type) {
          this.parseType();
        } else {
          let elem = this.parseMaybeDefault(this.start, this.startLoc)
          this.parseBindingListItem(elem)
          elts.push(elem)
        }
      }
      return elts
    }

    updateContext(prevType) {
      const context = this.curContext() 
      if (this.type === tt.colon) {
        this.context.push(tc_type);
      } else if (context === tc_type && this.type === tt.comma) {
        this.context.pop()
      } else {
        super.updateContext(prevType)
      }
    }

    parseType() {
      const node = this.startNode();
      node.name = this.value
      this.next();
      this.finishNode(node, "Type");
      return node;
    }

    checkLValPattern(expr, bindingType, checkClashes) {
      if (expr.type === 'Type') {
        // TODO: rules for type
      } else {
        super.checkLValPattern(expr, bindingType, checkClashes);
      }
    }

    expect(...types) {
      types.some(type => this.eat(type)) || this.unexpected();
    }
  }
}
