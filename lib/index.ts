/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createToken, CstParser, Lexer } from 'chevrotain';
import { debug, TODO } from './debug';
import { interpret, StackValue } from './interpreter';
import { Operation } from './operations';

const WHITE_SPACE_T = createToken({name: "WhiteSpace", pattern: /\s+/, group: Lexer.SKIPPED });

//Single Line Comment Tokens
const REM_T = createToken({ name: "REMComment", pattern: /REM/ }); //TODO make sure REMEMBER isn't matched
const C_COMMENT_T = createToken({name: "CComment", pattern: /\/\// });
const PERL_COMMENT_T = createToken({name: "PerlComment", pattern: /#/ });
const HASKELL_COMMENT_T = createToken({name: "HaskellComment", pattern: /--/ });
const ASSEMBLY_COMMENT_T = createToken({name: "AssemblyComment", pattern: /;/ });
const MATLAB_COMMENT_T = createToken({name: "MatlabComment", pattern: /%/});

//TODO add comment body token

//TODO add multi-line comments

const allTokens = [
    WHITE_SPACE_T,
    REM_T,
    C_COMMENT_T,
    PERL_COMMENT_T,
    HASKELL_COMMENT_T,
    ASSEMBLY_COMMENT_T,
    MATLAB_COMMENT_T,
];

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
                { ALT: () => $.SUBRULE($.multiLineComment) }
            ])
        })

        $.RULE('singleLineComment', () => {
            $.OR([
                { ALT: () => $.CONSUME(REM_T) },
                { ALT: () => $.CONSUME(C_COMMENT_T) },
                { ALT: () => $.CONSUME(PERL_COMMENT_T) },
                { ALT: () => $.CONSUME(HASKELL_COMMENT_T) },
                { ALT: () => $.CONSUME(ASSEMBLY_COMMENT_T) },
                { ALT: () => $.CONSUME(MATLAB_COMMENT_T) }
            ])
        })

        $.RULE('multiLineComment', () => {
            //TODO
        })

        this.performSelfAnalysis()
    }

    //properties below just exist to make TS happy
    script: any
    topLevel: any
    singleLineComment: any
    multiLineComment: any
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
        let operations = Array<Operation>()
        if (ctx.topLevel != undefined) {
            for (let ts of ctx.topLevel) {
                operations.push(this.topLevel(ts.children))
            }
        }
        return operations
    }

    topLevel(ctx: any): Operation { //TODO will probably return an array eventually
        if (ctx.expression != undefined) {
            return this.visit(ctx.expression)
        } else if (ctx.letStatement != undefined) {
            return this.visit(ctx.letStatement)
        } else {
            throw new Error("Not implemented.")
        }
    }

    singleLineComment(ctx: any): any {
        return TODO()
    }

    multiLineComment(ctx: any): any {
        return TODO()
    }
}

export class COMPError { 
    readonly message: string 
    constructor(message: string) {
        this.message = message
    }
}

const compVisitor = new COMPVisitor()

export class COMPInterpreter {
    run(script: string): StackValue | COMPError {
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
