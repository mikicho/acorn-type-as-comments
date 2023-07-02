import {Parser, TokContext} from 'acorn'

// Let- or const-style binding
const BIND_LEXICAL = 2

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
          this.next()
          return
        }
      } else if (word === 'import') {
        this.skipSpace()
        if (this.peekWord() === 'type') {
          // TODO: parse the statement instead of ignore it completely
          this.skipType([])
          this.next()
          this.semicolon()
          return
        }
      } else if (['type', 'interface'].includes(word) && this.context.length === 1) {
        this.skipType([])
        this.next()

        return
      }

      const type = this.keywords.test(word) ? keywordsTypes[word] : tt.name

      return this.finishToken(type, word)
    }

    parseMaybeAssign(forInit, refDestructuringErrors) {
      const expr = super.parseMaybeAssign(forInit, refDestructuringErrors)
      if (this.type === tt.name && this.value === 'as') {
        this.skipType([',', '}', ':', ')'])
        this.next()
      }
      return expr
    }

    parseExprAtom(refDestructuringErrors, forInit) {
      if (this.type === tt.name && this.input[this.pos] === '!') {
        this.pos++
      }

      const expr = super.parseExprAtom(refDestructuringErrors, forInit)
      // hack. We should have a double-colon token or something TODO
      if (this.type === tt.colon && this.input[this.pos] === ':') {
        this.skipType(['(', '.', '='])
        this.next()
      }
      return expr
    }

    parseSubscript(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit) {
      if (this.type === tt.colon && this.input[this.pos] === ':') {
        this.skipType(['('])
        this.next()
      }
      return super.parseSubscript(
        base,
        startPos,
        startLoc,
        noCalls,
        maybeAsyncArrow,
        optionalChained,
        forInit,
      )
    }

    parseMaybeDefault(startPos, startLoc, left) {
      left = left || this.parseBindingAtom()
      if (this.type === tt.question) {
        this.eat(tt.question)
      }
      if (this.type === tt.colon) {
        this.skipType([')', ',', '='])
        this.next()
      }
      if (this.options.ecmaVersion < 6 || !this.eat(tt.eq)) {
        return left
      }
      const node = this.startNodeAt(startPos, startLoc)
      node.left = left
      node.right = this.parseMaybeAssign()
      return this.finishNode(node, 'AssignmentPattern')
    }

    skipType(stopCharacters, {ignoreFirstBraces = false, startsWith = undefined} = {}) {
      const finalStopCharacters = [...stopCharacters, ';', '\n']
      const contextsCount = this.context.length
      const startedWith = startsWith

      const foundStopCharacter = (char) =>
        finalStopCharacters.includes(char) && (!ignoreFirstBraces || char !== '{')

      this.skipSpace()

      loop: for (
        let char = startsWith || this.input[this.pos];
        (!foundStopCharacter(char) || contextsCount < this.context.length) &&
        this.pos < this.input.length;
        char = this.input[startsWith ? this.pos : ++this.pos],
          ignoreFirstBraces = false,
          startsWith = undefined
      ) {
        switch (char) {
          case '<':
            this.context.push(contexts.a_stat)
            break
          case '(':
            this.context.push(contexts.p_stat)
            break
          case '[':
            this.context.push(contexts.s_stat)
            break
          case '{':
            this.context.push(contexts.b_stat)
            break
          case '>':
            this.context.pop()
            if (startedWith === '<' && contextsCount === this.context.length) {
              ++this.pos
              break loop
            }
            break
          case ')':
          case ']':
            this.context.pop()
            break
          case '}':
            this.context.pop()
        }
      }

      if (contextsCount > this.context.length) {
        this.unexpected()
      }
    }

    parseVar(node, isFor, kind) {
      node.declarations = []
      node.kind = kind
      for (;;) {
        let decl = this.startNode()
        this.parseVarId(decl, kind)
        if (this.type === tt.colon) {
          this.skipType([')', ',', '='])
          this.next()
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

    // Parses a comma-separated list of module imports.
    parseImportSpecifiers() {
      let nodes = [],
        first = true
      if (this.type === tt.name) {
        // import defaultObj, { x, y as z } from '...'
        let node = this.startNode()
        node.local = this.parseIdent()
        this.checkLValSimple(node.local, BIND_LEXICAL)
        nodes.push(this.finishNode(node, 'ImportDefaultSpecifier'))
        if (!this.eat(tt.comma)) return nodes
      }
      if (this.type === tt.star) {
        let node = this.startNode()
        this.next()
        this.expectContextual('as')
        node.local = this.parseIdent()
        this.checkLValSimple(node.local, BIND_LEXICAL)
        nodes.push(this.finishNode(node, 'ImportNamespaceSpecifier'))
        return nodes
      }
      this.expect(tt.braceL)
      while (!this.eat(tt.braceR)) {
        if (!first) {
          this.expect(tt.comma)
          if (this.afterTrailingComma(tt.braceR)) break
        } else first = false

        let node = this.startNode()
        node.imported = this.parseModuleExportName()
        if (this.eatContextual('as')) {
          node.local = this.parseIdent()
        } else {
          this.checkUnreserved(node.imported)
          node.local = node.imported
        }
        this.checkLValSimple(node.local, BIND_LEXICAL)

        // Skip import { type Pair }
        if (node.imported.name === 'type' && this.type === tt.name) {
          this.skipType([',', '}'])
          this.next()
        } else {
          nodes.push(this.finishNode(node, 'ImportSpecifier'))
        }
      }
      return nodes
    }

    parseClassId(node, isStatement) {
      super.parseClassId(node, isStatement)

      // hack. We should have a token AngleBracketLt (or any other bracket?) TODO
      if (this.type === tt.relational) {
        this.skipType([], {startsWith: '<'})
        this.next()
      }
    }

    parseClassField(field) {
      if (this.type === tt.colon) {
        this.skipType([',', ';', '=', '}'])
        this.next()
      }
      super.parseClassField(field)
    }

    parseFunctionParams(node) {
      // hack. We should have a token AngleBracketLt (or any other bracket?) TODO
      if (this.type === tt.relational) {
        this.skipType([], {startsWith: '<'})
        this.next()
      }
      super.parseFunctionParams(node)

      if (this.type === tt.colon) {
        this.skipType(['{'], {ignoreFirstBraces: true})
        this.next()
      }
    }

    parseRestBinding() {
      const rest = super.parseRestBinding()
      if (this.type === tt.colon) {
        this.skipType([')'])
        this.next()
      }

      return rest
    }

    peekWord() {
      return this.input.slice(this.pos, this.input.indexOf(' ', this.pos))
    }
  }
}
