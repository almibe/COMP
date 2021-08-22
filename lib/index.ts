/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createToken, CstParser, Lexer } from 'chevrotain'
import { debug, TODO } from './debug'
import { interpret, StackValue } from './interpreter'
import { Operation, PushOperation } from './operations'

const WHITE_SPACE_T = createToken({name: "WhiteSpace", pattern: /\s+/, group: Lexer.SKIPPED })

const NEW_LINE_T = createToken({name: "NewLine", pattern: /\r?\n/, pop_mode: true })

const NOT_NEW_LINE_T = createToken({name: "NotNewLine", pattern: /[^(?:\r?\n)]+/ })

const COMMENT_BODY_T = createToken({ name: "CommentBody", pattern: /\w+/ }) //TODO this is wrong

const ARGUMENT_T = createToken({ name: "ArgumentBody", pattern: /\d+/ }) //TODO this only supports integers for now

//Single Line Comment Tokens
const BASIC_COMMENT_T = createToken({ name: "BasicComment", pattern: /REM /, push_mode: "basic_mode" })
const C_COMMENT_T = createToken({name: "CComment", pattern: /\/\// })
const PERL_COMMENT_T = createToken({name: "PerlComment", pattern: /#/ })
const HASKELL_COMMENT_T = createToken({name: "HaskellComment", pattern: /--/ })
const ASSEMBLY_COMMENT_T = createToken({name: "AssemblyComment", pattern: /;/ })
const MATLAB_COMMENT_T = createToken({name: "MatlabComment", pattern: /%/})

//TODO add multi-line comments

const allTokens = {
    modes: {
        outside_mode: [
            WHITE_SPACE_T,
            BASIC_COMMENT_T,
            C_COMMENT_T,
            PERL_COMMENT_T,
            HASKELL_COMMENT_T,
            ASSEMBLY_COMMENT_T,
            MATLAB_COMMENT_T,
        ],
        basic_mode: [
            ARGUMENT_T,
            COMMENT_BODY_T,
            NOT_NEW_LINE_T,
            NEW_LINE_T
        ]
    },
    defaultMode: "outside_mode"
}

class COMPParser extends CstParser {
    constructor() {
        super(allTokens, {maxLookahead: 4}) //TODO this probably doesn't need to be 4

        const $ = this

        $.RULE('script', () => {
            $.MANY(() => {
                $.SUBRULE($.topLevel)
            })
        })

        $.RULE('topLevel', () => {
            $.OR([
                { ALT: () => $.SUBRULE($.singleLineComment) },
                //{ ALT: () => $.SUBRULE2($.multiLineComment) }
            ])
        })

        $.RULE('singleLineComment', () => {
            $.OR([
                { ALT: () => $.SUBRULE($.basicComment) },
                { ALT: () => $.CONSUME(C_COMMENT_T) },
                { ALT: () => $.CONSUME(PERL_COMMENT_T) },
                { ALT: () => $.CONSUME(HASKELL_COMMENT_T) },
                { ALT: () => $.CONSUME(ASSEMBLY_COMMENT_T) },
                { ALT: () => $.CONSUME(MATLAB_COMMENT_T) }
            ])
        })

        $.RULE('basicComment', () => {
            $.CONSUME(BASIC_COMMENT_T)
            $.CONSUME(ARGUMENT_T)
           $.OPTION(() => { $.CONSUME(COMMENT_BODY_T) })
        })

        // $.RULE('multiLineComment', () => {
        //     //TODO
        // })

        this.performSelfAnalysis()
    }

    //properties below just exist to make TS happy
    script: any
    topLevel: any
    singleLineComment: any
    basicComment: any
//    multiLineComment: any
}

const compLexer = new Lexer(allTokens)
const compParser = new COMPParser()
const BaseCOMPVisitor = compParser.getBaseCstVisitorConstructor()

/**
 * A visitor for COMP that focuses on converting Chevrotain's CTS to an internal AST.
 */
class COMPVisitor extends BaseCOMPVisitor {
    constructor() {
        super()
        this.validateVisitor()
    }

    script(ctx: any): Array<Operation> {
        //debug("script", ctx)
        let operations = Array<Operation>()
        if (ctx.topLevel != undefined) {
            for (let ts of ctx.topLevel) {
                operations.push(this.topLevel(ts.children))
            }
        }
        return operations
    }

    topLevel(ctx: any): Operation { //TODO will probably return an array eventually
        if (ctx.singleLineComment != undefined) {
            return this.visit(ctx.singleLineComment)
        } else if (ctx.multiLineComment != undefined) {
            return this.visit(ctx.multiLineComment)
        } else {
            throw new Error("Not implemented.")
        }
    }

    singleLineComment(ctx: any): any {
        return this.visit(ctx.basicComment);
    }

    basicComment(ctx: any): Operation {
        let value = Number(ctx.ArgumentBody[0].image)
        return new PushOperation(value)
    }

    // multiLineComment(ctx: any): any {
    //     return TODO()
    // }
}

export class COMPError { 
    readonly message: string 
    constructor(message: string) {
        this.message = message
    }
}

const compVisitor = new COMPVisitor()

export class COMPInterpreter {
    run(script: string): Array<StackValue> | COMPError {
        const res = this.createAst(script)
        if (res instanceof COMPError) {
            return res
        } else {
            return interpret(res)
        }
    }

    createAst(script: string): Array<Operation> | COMPError  {
        const lexResult = compLexer.tokenize(script);
        if (lexResult.errors.length > 0) {
            return new COMPError(`Lexing Error: ${lexResult.errors}`); //TODO make message better/multiple messages?
        }
        
        compParser.input = lexResult.tokens;
        let parseResult = compParser.script()
        if (compParser.errors.length > 0) {
            return new COMPError(`Parsing Error: ${compParser.errors}`) //TODO make message better/multiple messages?
        }

        const res = compVisitor.visit(parseResult);
        return res;
    }
}
