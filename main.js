const { exit } = require("process");
const prompt = require("prompt-sync")();
const fs = require("fs");

const tokenize = (str) =>
    `${str.trim()}`
      .replaceAll(/;(.*?)\n/g, "")
      .replaceAll("(", " ( ")
      .replaceAll(")", " ) ")
      .replaceAll("'", " ' ")
      .match(/[^\s"]+|"([^"]*)"/g)

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

const parseQuote = (node) =>
    Array.isArray(node)
      ? node.reduce((quote, rest) =>
              quote[quote.length - 1] === "'"
                ? [...quote.slice(0, -1), ['quote', rest]]
                : [...quote, rest],
            []).map(parseQuote)
      : node;

const isAtom = (val) => !Array.isArray(val);// || !val.length();

const evaluate = (ast, ctx=core) => {
    //console.log(ast);
    if (isAtom(ast) && ast in ctx) {
        return ctx[ast];
    }
    else if (isAtom(ast)) {
        return ast;
    }
    else {
        const func = evaluate(ast[0], ctx);
        return func(ast.slice(1), ctx);
    }
}

const core = {
    'quote': ([x]) => x,
    'atom': ([x], ctx) => isAtom(evaluate(x, ctx)) ? 't' : [],
    'head': ([x], ctx) => evaluate(x, ctx)[0],
    'tail': ([x], ctx) => evaluate(x, ctx).slice(1),
    'push': ([x, y], ctx) => [evaluate(x, ctx), ...evaluate(y, ctx)],
    'if': ([x, y, z], ctx) => evaluate(x, ctx) === 't'
        ? evaluate(y, ctx)
        : evaluate(z, ctx),
    'var': ([name, value], ctx) => ctx[name] = evaluate(value),
    'expr': ([args, body], ctx) => (x) => {
        x = Object.values(Object(x));
        const exprCtx = ctx;
        for (let i = 0; i < args.length; ++i)
            exprCtx[args[i]] = evaluate(x[i]);
        return evaluate(body, exprCtx);
    },
    'func': ([name, args, body], ctx) => {
        console.log('name');
        console.log(name);
        console.log(`args`);
        console.log(args);
        console.log('body');
        console.log(body);
        console.log('ctx');
        console.log(ctx);

        return ctx[name] = ctx.expr([args, body], ctx);
    },

//    "+": (x) => x.reduce((a, b) => a + b),
//    "-": (x) => x.reduce((a, b) => a - b),
//    "*": (x) => x.reduce((a, b) => a * b),
//    "/": (x) => x.reduce((a, b) => a / b),
//    "%": (x) => x.reduce((a, b) => a % b),
//    "^": (x) => x.reduce((a, b) => a ** b),
//    "|": (x) => x.some((t) => t),
//    "&": (x) => x.every((t) => t),
//    ">": (x) =>
//        x.every((val, i) => val === x.sort((a, b) => a - b).reverse()[i]) &&
//        x.filter((val, i) => x.indexOf(val) !== i),
//    "<": (x) =>
//        x.every((val, i) => val === x.sort((a, b) => a - b)[i]) &&
//        x.filter((val, i) => x.indexOf(val) !== i),
//    ">=": (x) =>
//        x.every((val, i) => val === x.sort((a, b) => a - b).reverse()[i]),
//    "<=": (x) => x.every((val, i) => val === x.sort((a, b) => a - b)[i]),
//    "=": (x) => x.every((val, i, arr) => val === arr[0]),
};

const main = (() => {
    const input = prompt('lisp > ');
    //console.log(tokenize(input));
    //console.log(parse(tokenize(input)));
    //console.log(parseQuote(parse(tokenize(input))));
    console.log(evaluate(parseQuote(parse(tokenize(input)))));
})();
