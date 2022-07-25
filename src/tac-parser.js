import { Parser, TokContext, isIdentifierStart } from "acorn";

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
  const keywordsTypes = parser.acorn.keywordTypes

  // TODO: maybe we can duplicate parseIndent instead of both parseMaybeDefault and parseVar 
  return class extends Parser {
    readWord() {
      const word = this.readWord1();

      if (word === 'export') {
        this.skipSpace()
        const nextWord = this.peekWord();
        if (['type', 'interface'].includes(nextWord)) {
          this.skipTypeAlias()
          return
        }
      } else if (['type', 'interface'].includes(word) && this.skipSpace(), isIdentifierStart(this.fullCharCodeAtPos())) {
        this.skipTypeAlias()
        return
      }

      let type = tt.name
      if (this.keywords.test(word)) {
        type = keywordsTypes[word]
      }
      return this.finishToken(type, word)
   }

    parseMaybeDefault(startPos, startLoc, left) {
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

    skipParameterType() {
      let code = this.input.charCodeAt(this.pos)
      const contextsCount = this.context.length
      //        )   ,   ;   =   }
      while ((![41, 44, 59, 61, 125].includes(code) || contextsCount < this.context.length) && this.pos < this.input.length) {
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
          case 123: // {
            this.context.push(contexts.b_stat)
            break;
          case 62: // >
          case 41: // )
          case 93: // ]
          case 125: // }
            this.context.pop()
            break;
        }
        code = this.input.charCodeAt(++this.pos);
      }

      if ([contexts.a_stat, contexts.p_stat, contexts.s_stat].includes(this.curContext())) {
        this.unexpected()
      }

      this.next()
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

    skipTypeAlias() {
      this.pos = this.input.indexOf("{", this.pos) + 1
      let code = this.input.charCodeAt(this.pos)
      const contextsCount = this.context.length
      this.context.push(contexts.b_stat)
      while (contextsCount < this.context.length && this.pos < this.input.length) {
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
          case 123: // {
            this. context.push(contexts.b_stat)
            break;
          case 62: // >
          case 41: // )
          case 93: // ]
          case 125: // }
            this.context.pop()
            break;
        }
        code = this.input.charCodeAt(++this.pos);
      }

      if (code === 59) { // ;
        this.pos++
      }
      this.next()
    }

    parseClassId(node, isStatement) {
      super.parseClassId(node, isStatement)

      if (this.eat(tt.relational)) {
        this.parseClassGeneric()
      }

    }

    parseClassGeneric() {
      let code = this.value[0]
      const contextsCount = this.context.length
      this.context.push(contexts.a_stat)
      while (contextsCount < this.context.length && this.pos < this.input.length) {
        switch (code) {
          case 60: // <
            this.context.push(contexts.a_stat)
          case 62: // >
            this.context.pop()
            break;
        }
        code = this.input.charCodeAt(++this.pos);
      }
      this.next()
    }

    parseClassField(field) {
      if (this.eat(tt.colon)) {
        this.skipParameterType()
      }
      super.parseClassField(field)
    }

    peekWord() {
      return this.input.slice(this.pos, this.input.indexOf(" ", this.pos))
    }
  }
}
