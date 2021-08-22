# COMP

The COMment Processor language written for https://github.com/langjam/jam0001

This language celebrates the multitude of comment syntaxes in programming languages and uses them to encode a simple stack based interpreter.

## Basic Usage

This project requires a recent version of node/npm to be installed (developed on 7.20.3), see https://nodejs.org/en/download/

To run tests issue the following command:

`npm t`

To run a script issue the following command:

`TODO`

## Line based comments

| Comment | Origin   | Function  | Args      |
| ------- | -------- | --------- | --------- |
| `REM`   | Basic    | push      | value     |
| `--`    | haskell  | pop       | -         |
| `#`     | perl     | call      | proc name |
| `//`    | C-style  | duplicate | -         |
| `;`     | assembly | roll      | -         |
| `%`     | matlab   | swap      | -         |

## Values

Currently only integers are supported as input although regular JavaScript numbers are used on the stack.

## Procedures

When you issue a `#` comment you can follow that comment with `add`, `sub`, `mul`, or `div` to perform the given procedure on the top two values.

## Examples

See `test/resources/` for examples.