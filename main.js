const { exit } = require("process");
const prompt = require("prompt-sync")();
const fs = require("fs");
console.error = (x) => {console.log('\x1b[1m\x1b[31m' + x + '\x1b[0m'); exit();};

const tokenize = (str) =>
    `( ${str.trim()} )`
      .replaceAll(/;(.*?)\n/g, "")
      .match(/\(|\)|'|[^\s()]+/g)

const parse = (tokens, ast=[]) => {
    const t = tokens.shift();
    if (t === undefined)
        return ast.pop();
    else if (t === '(') {
        ast.push(parse(tokens, []))
        return parse(tokens, ast);
    }
    else if (t === ')')
        return ast;
    else
        return parse(tokens, [...ast, t]);
}

const isAtom = (expr) => !Array.isArray(expr) || !expr.length;
const parseQuote = (ast) => { //TODO:
    if (isAtom(ast)) return ast;
    const result = [];
    for (const n of ast) {
        if (result[result.length - 1] === "'")
            result.splice(result.length - 1, 1, ['quote', parseQuote(n)]);
        else result.push(parseQuote(n));
    }
    return result;
};

const evaluate = (ast, ctx) => { 
  if (isAtom(ast) && !isNaN(parseFloat(ast)))
    return parseFloat(ast);
  if (isAtom(ast)) {
    for (const [key, val] of ctx)
      if (key === ast) return val;
    console.error(`${ast} is not defined`);
  } else {
    const func = evaluate(ast[0], ctx);
    if (func instanceof Function) return func(ast.slice(1), ctx);
    console.error(`Not a function: ${ast[0]}`);
  }
};

const core = [
  ['quote', ([a]) => a],
  ['atom', ([a], ctx) => isAtom(evaluate(a, ctx)) ? 't' : []],
  [
    'eq',
    ([a, b], ctx) => {
      a = evaluate(a, ctx);
      b = evaluate(b, ctx);
      return (a === b || (!a.length && !b.length)) ? 't' : [];
    },
  ],
  ['car', ([a], ctx) => evaluate(a, ctx)[0]],
  ['cdr', ([a], ctx) => evaluate(a, ctx).slice(1)],
  ['cons', ([a, b], ctx) => [evaluate(a, ctx), ...evaluate(b, ctx)]],
  [
    'cond',
    (args, ctx) => {
      for (const [pred, expr] of args) {
        const v = evaluate(pred, ctx);
        if (v && (!Array.isArray(v) || v.length)) return evaluate(expr, ctx);
      }
    },
  ],
  [
    'lambda',
    ([argList, body]) =>
      (args, ctx) =>
        evaluate(body, 
          [...argList.map((arg, i) => [arg, evaluate(args[i], ctx)]), ...ctx]),
  ],
  [
    'defun',
    ([name, args, body], ctx) => [
      ...ctx,
      [name, evaluate(['lambda', args, body], ctx)],
    ],
  ],
  ['label', ([name, func], env) => [...env, [name, evaluate(func, env)]]],
  ['list', (args, ctx) => args.map((a) => evaluate(a, ctx))],

  ['+', (args, ctx) => 
    `${args.reduce((acc, val) => evaluate(acc, ctx) + evaluate(val, ctx))}`],
  ['-', (args, ctx) => 
    `${args.reduce((acc, val) => evaluate(acc, ctx) - evaluate(val, ctx))}`],
  ['/', (args, ctx) => 
    `${args.reduce((acc, val) => evaluate(acc, ctx) / evaluate(val, ctx))}`],
  ['*', (args, ctx) => 
    `${args.reduce((acc, val) => evaluate(acc, ctx) * evaluate(val, ctx))}`],
  ['%', (args, ctx) => 
    `${args.reduce((acc, val) => evaluate(acc, ctx) % evaluate(val, ctx))}`],
  ['^', (args, ctx) => 
    `${args.reduce((acc, val) => evaluate(acc, ctx) ** evaluate(val, ctx))}`],

  //['read', () => parseQuote(parse(tokenize(`'${prompt()}`)))] //TODO: Do I want it this way?
];

const execute = (exprs) =>
  exprs.reduce((ctx, line) => evaluate(line, ctx), core);

const main = (() => 
    console.log(execute(parseQuote(parse(tokenize(prompt('lisp > ')))))))();
    //console.log(execute(parseQuote(parse(tokenize(fs.readFileSync(process.argv[2], { encoding: "utf8", flag: "r" })))))))();