const { exit } = require("process");
const prompt = require("prompt-sync")();
const fs = require("fs");
console.error = (x) => {console.log('\x1b[1m\x1b[31m' + x + '\x1b[0m'); exit();};

const tokenize = (str) =>
  `( ${str.trim()} )`
    .replace(/;(.*?)\n/g, "")
    .match(/"(.*?)"|\(|\)|'|[^\s()]+/g)

const parse = (tokens, ast=[]) => {
  const t = tokens.shift();
  return t === undefined
    ? ast.pop()
    : t === '('
    ? (ast.push(parse(tokens, [])), parse(tokens, ast))
    : t === ')'
    ? ast
    : parse(tokens, [...ast, t]);
}

const isAtom = (expr) => !Array.isArray(expr) || !expr.length;
const parseQuote = (ast) => {
  if (isAtom(ast)) return ast;
  const result = [];
  ast.map(n => 
    result[result.length - 1] === "'" 
      ? result.splice(result.length - 1, 1, ['quote', parseQuote(n)])
      : n[0] === '"' && n[n.length - 1] === '"'
      ? result.push(['quote', n.slice(1, -1)])
      : result.push(parseQuote(n))
  );
  return result;
}

const evaluate = (ast, ctx=core) => {
  if (isAtom(ast) && !isNaN(parseFloat(ast)))
    return parseFloat(ast);
  else if (isAtom(ast)) {
    for (const [key, val] of ctx)
      if (key === ast) return val;
    console.error(`${ast} is not defined`);
  } else {
    const func = evaluate(ast[0], ctx);
    return func instanceof Function ? func(ast.slice(1), ctx) : func;
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
    'cond', (args, ctx) => {
      for (const [pred, expr] of args) {
        const v = evaluate(pred, ctx);
        if (v && (!Array.isArray(v) || v.length)) return evaluate(expr, ctx);
      }
    },
  ],
  [
    'lambda', ([argList, body]) =>
      (args, ctx) =>
        evaluate(body, 
          [...argList.map((arg, i) => [arg, evaluate(args[i], ctx)]), ...ctx]),
  ],
  [
    'defun', ([name, args, body], ctx) => [
      ...ctx, [name, evaluate(['lambda', args, body], ctx)],
    ],
  ],
  ['set', ([name, func], env) => [...env, [name, evaluate(func, env)]]],
  ['setq', ([name, func], env) => [...env, [name, evaluate(['quote', func], env)]]],
  ['list', (args, ctx) => args.map((a) => evaluate(a, ctx))],
  ['print', (args, ctx) => {console.log(evaluate(args, ctx))}],
  ['read', (args, ctx) => `${prompt(evaluate(args, ctx))}`],
  ['import', (args, ctx) => {
    const result = [];
    const temp = parseQuote(
      parse(tokenize(readFile(`${args}`)))).map(t => evaluate(t, ctx));
    for (const n of temp)
      result.push(n[n.length - 1]);
    return [...ctx, ...result];
  }],
  ['meta', (args, ctx) => eval(evaluate(args, ctx))],
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
  ['\\q', () => exit(0)]
];

const execute = (input, env=core) =>
  parseQuote(parse(tokenize(input))).reduce(
    (ctx, line) => evaluate(line, ctx), env);

const readFile = (file) => fs.readFileSync(file, {encoding: "utf8", flag: "r"})

const main = (() => 
  //console.log(parseQuote(parse(tokenize(readFile(process.argv[2]))))))();
  execute(readFile(process.argv[2])))();
