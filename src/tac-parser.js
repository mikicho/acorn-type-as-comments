import {Parser, TokContext} from 'acorn'

export default function (_options = {}) {
  return plugin
}

/**
 * @param {Parser} parser
 */
function plugin(parser) {
  const tt = parser.acorn.tokTypes
  const contexts = Object.assign(parser.acorn.tokContexts, {
    a_stat: new TokContext('<', false),
    s_stat: new TokContext('[', false),
  })
  const keywordsTypes = parser.acorn.keywordTypes

  // TODO: maybe we can duplicate parseIndent instead of both parseMaybeDefault and parseVar
  return class extends Parser {
    readWord() {
      const word = this.readWord1()

      if (word === 'export') {
        this.skipSpace()
        const nextWord = this.peekWord()
        if (['type', 'interface'].includes(nextWord)) {
          this.skipType([])
          return
        }
      } else if (word === 'import') {
        this.skipSpace()
        if (this.peekWord() === 'type') {
          // TODO: parse the statement instead of ignore it completely
          this.skipLineComment(0)
          this.next()
          return
        }
      } else if (['type', 'interface'].includes(word)) {
        this.skipType([])
        return
      }

      let type = tt.name
      if (this.keywords.test(word)) {
        type = keywordsTypes[word]
      }
      return this.finishToken(type, word)
    }

    parseMaybeDefault(startPos, startLoc, left) {
      left = left || this.parseBindingAtom()
      if (this.type === tt.colon) {
        this.skipType([ascii(')'), ascii(','), ascii(';'), ascii('='), ascii('>'), ascii('}')])
      }
      if (this.options.ecmaVersion < 6 || !this.eat(tt.eq)) {
        return left
      }
      var node = this.startNodeAt(startPos, startLoc)
      node.left = left
      node.right = this.parseMaybeAssign()
      return this.finishNode(node, 'AssignmentPattern')
    }

    skipType(stopCharacters) {
      const finalStopCharacters = [...stopCharacters, ascii(';'), ascii('\n')]

      let code = this.input.charCodeAt(this.pos)
      const contextsCount = this.context.length

      while (
        (!finalStopCharacters.includes(code) || contextsCount < this.context.length) &&
        this.pos < this.input.length
      ) {
        switch (code) {
          case ascii('<'):
            this.context.push(contexts.a_stat)
            break
          case ascii('('):
            this.context.push(contexts.p_stat)
            break
          case ascii('['):
            this.context.push(contexts.s_stat)
            break
          case ascii('{'):
            this.context.push(contexts.b_stat)
            break
          case ascii('>'):
          case ascii(')'):
          case ascii(']'):
          case ascii('}'):
            this.context.pop()
            break
        }
        code = this.input.charCodeAt(++this.pos)
      }

      if (contextsCount > this.context.length) {
        this.unexpected()
      }

      this.next()
    }

    parseVar(node, isFor, kind) {
      node.declarations = []
      node.kind = kind
      for (;;) {
        let decl = this.startNode()
        this.parseVarId(decl, kind)
        if (this.type === tt.colon) {
          this.skipType([ascii(')'), ascii(','), ascii('='), ascii('>'), ascii('}')])
        }
        if (this.eat(tt.eq)) {
          decl.init = this.parseMaybeAssign(isFor)
        } else if (
          kind === 'const' &&
          !(this.type === tt._in || (this.options.ecmaVersion >= 6 && this.isContextual('of')))
        ) {
          this.unexpected()
        } else if (
          decl.id.type !== 'Identifier' &&
          !(isFor && (this.type === tt._in || this.isContextual('of')))
        ) {
          this.raise(this.lastTokEnd, 'Complex binding patterns require an initialization value')
        } else {
          decl.init = null
        }
        node.declarations.push(this.finishNode(decl, 'VariableDeclarator'))
        if (!this.eat(tt.comma)) break
      }
      return node
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
            break
          case 62: // >
            this.context.pop()
            break
        }
        code = this.input.charCodeAt(++this.pos)
      }
      this.next()
    }

    parseClassField(field) {
      if (this.type === tt.colon) {
        this.skipType([ascii(')'), ascii(','), ascii(';'), ascii('='), ascii('>'), ascii('}')])
      }
      super.parseClassField(field)
    }

    parseFunctionParams(node) {
      super.parseFunctionParams(node)

      if (this.type === tt.colon) {
        this.skipType([ascii('{')])
      }
    }

    peekWord() {
      return this.input.slice(this.pos, this.input.indexOf(' ', this.pos))
    }
  }
}

/**@param {string} character */
function ascii(character) {
  return character.charCodeAt(0)
}
