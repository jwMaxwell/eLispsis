const { exit } = require("process");
const prompt = require("prompt-sync")();
const fs = require("fs");
console.error = (x) => console.log('\x1b[1m\x1b[31m' + x + '\x1b[0m');

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

const find = (ctx, value) => {
    if (value in ctx.scope)
        return ctx.scope[value];
    else if (ctx.parent === undefined) {
        console.error(`Expression "${value}" not found`);
        exit();
    }
    return find(ctx.parent, value);
}

const evaluate = (ast, ctx) => {
    console.log(ctx);
    if (isAtom(ast) && find(ctx, ast)) {
        return find(ctx, ast);
    }
    else if (isAtom(ast)) {
        return ast;
    }
    else {
        const func = evaluate(ast[0], { scope: {}, parent: ctx });
        if (!(func instanceof Function)) {
            console.error(`Expression "${func}" not found`);
            exit();
        }
        return func(ast.slice(1), { scope: {}, parent: ctx });
    }
}

const core = {
    'scope': {
        'quote': ([x]) => x,
        'atom': ([x], ctx) => isAtom(evaluate(x, ctx)) ? 't' : [],
        'head': ([x], ctx) => evaluate(x, ctx)[0],
        'tail': ([x], ctx) => evaluate(x, ctx).slice(1),
        'push': ([x, y], ctx) => [evaluate(x, ctx), ...evaluate(y, ctx)],
        'if': ([x, y, z], ctx) => evaluate(x, ctx) === 't'
            ? evaluate(y, ctx)
            : evaluate(z, ctx),
        'var': ([name, value], ctx) => {
            ctx.parent[name] = evaluate(value)
            return [];
        },
        'expr': ([args, body], ctx) => (x) => {
            x = Object.values(Object(x));
            const exprCtx = ctx;
            for (let i = 0; i < args.length; ++i)
                exprCtx[args[i]] = evaluate(x[i]);
            return evaluate(body, exprCtx);
        },
        'func': ([name, args, body], ctx) => {
            // console.log(`funcname`);
            // console.log(name);
            ctx.parent[name] = ctx.expr([args, body], ctx);
            // console.log(ctx[name]);
            return [];
        },
    }
};

const execute = (expressions) =>
      expressions.reduce((ctx, expr) => evaluate(expr, ctx), { scope: {}, parent: core });

const main = (() => {
    const input = prompt('lisp > ');

    console.log([parseQuote(parse(tokenize(input)))]);
    console.log(execute([parseQuote(parse(tokenize(input)))]));

//    console.log(evaluate(parseQuote(parse(tokenize(input)))));
})();
