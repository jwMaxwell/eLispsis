const { parse, evaluate, isAtom } = require("./evaluate");
const { exit } = require("process");
const fs = require("fs");
const prompt = require("prompt-sync")();
console.error = (x) => {
  console.log("\x1b[1m\x1b[31m" + x + "\x1b[0m");
  exit();
};
const readFile = (f) => fs.readFileSync(f, { encoding: "utf8", flag: "r" });

const core = [
  ["quote", ([a]) => a],
  ["atom", ([a], ctx) => (isAtom(evaluate(a, ctx)) ? "t" : [])],
  [
    "eq",
    ([a, b], ctx) => {
      a = evaluate(a, ctx);
      b = evaluate(b, ctx);
      return a === b || (!a.length && !b.length) ? "t" : [];
    },
  ],
  ["car", ([a], ctx) => evaluate(a, ctx)[0]],
  ["cdr", ([a], ctx) => evaluate(a, ctx).slice(1)],
  ["cons", ([a, b], ctx) => [evaluate(a, ctx), ...evaluate(b, ctx)]],
  [
    "cond",
    (args, ctx) => {
      for (const [pred, expr] of args) {
        const v = evaluate(pred, ctx);
        if (v && (!Array.isArray(v) || v.length)) return evaluate(expr, ctx);
      }
    },
  ],
  [
    "lambda",
    ([argList, body]) =>
      (args, ctx) =>
        evaluate(body, [
          ...argList.map((arg, i) => [arg, evaluate(args[i], ctx)]),
          ...ctx,
        ]),
  ],
  [
    "defun",
    ([name, args, body], ctx) => [
      ...ctx,
      [name, evaluate(["lambda", args, body], ctx)],
    ],
  ],
  ["set", ([name, val], env) => [...env, [name, evaluate(val, env)]]],
  [
    "setq",
    ([name, val], env) => [...env, [name, evaluate(["quote", val], env)]],
  ],
  ["list", (args, ctx) => args.map((a) => evaluate(a, ctx))],
  [
    "print",
    (args, ctx) => {
      console.log(evaluate(args, ctx));
    },
  ],
  ["read", (args, ctx) => `${prompt(evaluate(args, ctx))}`],
  [
    "import",
    (args, ctx) => {
      try {
        const result = [];
        const temp = parse(readFile(`${args}`)).map((t) => evaluate(t, ctx));
        for (const n of temp) result.push(n[n.length - 1]);
        return [...ctx, ...result];
      } catch (error) {
        console.error(`File or directory "${args}" not found`);
      }
    },
  ],
  ["meta", (args, ctx) => eval(evaluate(args, ctx))],
  ["...", (args, ctx) => args.reduce((env, line) => evaluate(line, env), ctx)],
  [
    "+",
    (args, ctx) => {
      args.map((t) => (isNaN(Number(t)) ? t : Number(t)));
      return `${args.reduce(
        (acc, val) => evaluate(acc, ctx) + evaluate(val, ctx)
      )}`;
    },
  ],
  [
    "-",
    (args, ctx) =>
      `${args.reduce((acc, val) => evaluate(acc, ctx) - evaluate(val, ctx))}`,
  ],
  [
    "/",
    (args, ctx) =>
      `${args.reduce((acc, val) => evaluate(acc, ctx) / evaluate(val, ctx))}`,
  ],
  [
    "*",
    (args, ctx) =>
      `${args.reduce((acc, val) => evaluate(acc, ctx) * evaluate(val, ctx))}`,
  ],
  [
    "%",
    (args, ctx) =>
      `${args.reduce((acc, val) => evaluate(acc, ctx) % evaluate(val, ctx))}`,
  ],
  [
    "^",
    (args, ctx) =>
      `${args.reduce((acc, val) => evaluate(acc, ctx) ** evaluate(val, ctx))}`,
  ],
  [
    ">",
    (args, ctx) => {
      const x = args.map((t) => evaluate(t, ctx));
      return x.join("") ===
        [...new Set(x)]
          .sort((a, b) => a - b)
          .reverse()
          .join("")
        ? "t"
        : [];
    },
  ],
  [
    "<",
    (args, ctx) => {
      const x = args.map((t) => evaluate(t, ctx));
      return x.join("") === [...new Set(x)].sort((a, b) => a - b).join("")
        ? "t"
        : [];
    },
  ],
  [
    ">=",
    (args, ctx) => {
      const x = args.map((t) => evaluate(t, ctx));
      return x.join("") ===
        x
          .sort((a, b) => a - b)
          .reverse()
          .join("")
        ? "t"
        : [];
    },
  ],
  [
    "<=",
    (args, ctx) => {
      const x = args.map((t) => evaluate(t, ctx));
      return x.join("") === x.sort((a, b) => a - b).join("") ? "t" : [];
    },
  ],
  [
    "defmacro",
    ([name, [args], body], ctx) => {
      return cons(
        [
          name,
          (argList, ctx) =>
            evaluate(evaluate(body, cons(list(args, argList), ctx)), ctx),
        ],
        ctx
      );
    },
  ],
];

var cons = (x, y) => [x, ...y];
var list = (x, y) => [x, y];

/**
 *  defmacro: ([{val, loc}, [argName], body], env, stack) =>
    cons(
      [
        val,
        (args, env) =>
          evaluate(
            evaluate(body, cons(list(argName.val, args), env), stack),
            env,
            cons(`defmacro ${loc}`, stack)
          ),
      ],
      env
    ),
 */

module.exports = { core, readFile };
