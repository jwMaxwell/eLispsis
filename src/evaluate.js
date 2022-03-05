const { tokenize, Token } = require("./tokenizer.js");
const { exit } = require("process");
console.error = (x) => {
  console.log("\x1b[1m\x1b[31m" + x + "\x1b[0m");
  exit();
};

// const tokenize = (str) =>
//   `( ${str}\n )`
//     .replace(/;(.*?)\n/g, "")
//     .match(/"(.*?)"|\(|\)|'|[^\s()]+/g)

const preparse = (tokens, ast = []) => {
  const t = tokens.shift();
  return t === undefined
    ? ast.pop()
    : t.value === "("
    ? (ast.push(preparse(tokens, [])), preparse(tokens, ast))
    : t.value === ")"
    ? ast
    : !isNaN(parseFloat(t))
    ? preparse(tokens, [...ast, parseFloat(t)])
    : preparse(tokens, [...ast, t]);
};

const isAtom = (expr) => !Array.isArray(expr) || !expr.length;
const postparse = (ast) => {
  if (isAtom(ast)) return ast;
  const result = [];
  ast.map((n) => {
    typeof result === "Token" && console.debug(n);
    typeof result === "Token" && result[result.length - 1].value === "'"
      ? result.value.splice(result.value.length - 1, 1, ["quote", postparse(n)])
      : typeof n === "Token" &&
        n.value[0] === '"' &&
        n.value[n.value.length - 1] === '"'
      ? result.push(["quote", n.value.slice(1, -1)])
      : result.push(postparse(n));
  });
  return result;
};

const evaluate = (ast, ctx) => {
  if (ast === undefined) console.error("Invalid parameter list");
  if (ctx === undefined) console.error("Lost Context");
  else if (isAtom(ast) && !isNaN(parseFloat(ast))) return parseFloat(ast);
  else if (isAtom(ast)) {
    try {
      for (const [key, val] of ctx) {
        if (key === ast) return val;
      }
    } catch (error) {
      console.error("Unbalanced Parens");
    }

    console.error(`${ast} is not defined`);
  } else {
    const func = evaluate(ast[0], ctx);
    return func instanceof Function ? func(ast.slice(1), ctx) : func;
  }
};

const parse = (str) => postparse(preparse(tokenize(str)));

module.exports = { parse, evaluate, isAtom };
