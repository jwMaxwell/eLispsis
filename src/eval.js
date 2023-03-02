const { parse } = require("./parse.js");
const prompt = require("prompt-sync")();
const fs = require("fs");

const car = (x) => x?.[0];
const cdr = (x) => x?.slice(1);
const cons = (x, y) => [x, ...y];
const list = (x, y) => [x, y];
const concat = (x, y) => [...x, ...y];
const isAtom = (expr) => !Array.isArray(expr) || !expr.length;
const toBool = (val) => (val ? "t" : []);
const fromBool = (val) => val && (!Array.isArray(val) || val.length);

const getVals = (expr) =>
  Array.isArray(expr)
    ? expr.map(getVals)
    : expr && typeof expr === "object"
    ? expr.val
    : expr;

const printStack = (stack) => stack.map((s) => `\n    at ${s}`).join("");

const evaluate = (expr, env, stack = []) => {
  if (Array.isArray(expr)) {
    if (!car(expr)) throw new Error(`Empty expression${printStack(stack)}`);

    const { val, loc } = car(expr);
    const func = evaluate(car(expr), env, cons(`${val} ${loc}`, stack));
    if (typeof func === "function") {
      try {
        const result = func(cdr(expr), env, cons(`${val} ${loc}`, stack));
        return result;
      } catch (e) {
        throw new Error(`An error occurred: ${e.message}${printStack(stack)}`);
      }
    }
    throw new Error(
      `${JSON.stringify(getVals(car(expr)))} is not a function${printStack(
        stack
      )}`
    );
  }

  if (expr && typeof expr === "object") {
    const { val, loc } = expr;
    if (typeof val === "number") return val;

    for (const [key, value] of env) {
      if (key === val) return value;
    }
    throw new Error(`\`${val}\` is not defined at ${loc}${printStack(stack)}`);
  }
  throw new Error(JSON.stringify(expr) + printStack(stack));
};

const deepEq = (a, b) =>
  Array.isArray(a) && Array.isArray(b)
    ? a.length === b.length && a.every((x, i) => deepEq(x, b[i]))
    : a === b;

const math = (func) => (args, env, stack) =>
  args.map((x) => evaluate(x, env, stack)).reduce(func);

const defaultEnv = Object.entries({
  quote: ([a]) => getVals(a),
  atom: ([a], env, stack) => toBool(isAtom(evaluate(a, env, stack))),
  eq: ([a, b], env, stack) =>
    toBool(deepEq(evaluate(a, env, stack), evaluate(b, env, stack))),
  car: ([a], env, stack) => car(evaluate(a, env, stack)),
  cdr: ([a], env, stack) => cdr(evaluate(a, env, stack)),
  cons: ([a, b], env, stack) =>
    cons(evaluate(a, env, stack), evaluate(b, env, stack)),
  cond: (args, env, stack) => {
    for (const [pred, expr] of args) {
      if (fromBool(evaluate(pred, env, stack)))
        return evaluate(expr, env, stack);
    }
  },
  lambda:
    ([argList, body], outerEnv) =>
    (args, innerEnv, stack) => {
      const env = [...innerEnv, ...outerEnv];
      return evaluate(
        body,
        concat(
          argList.map((arg, i) => list(arg.val, evaluate(args[i], env, stack))),
          env
        ),
        stack
      );
    },
  set: ([a, dat], env, stack) =>
    cons(list(a.val, evaluate(dat, env, stack)), env),
  defun: ([{ val, loc }, args, body], env, stack) =>
    cons(
      list(val, evaluate([{ val: "lambda", loc }, args, body], env, stack)),
      env
    ),
  list: (args, env, stack) => args.map((a) => evaluate(a, env, stack)),
  ascii: ([a], env, stack) => String.fromCharCode(evaluate(a, env, stack)),
  defmacro: ([{ val, loc }, [argName], body], env, stack) =>
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
  "+": math((a, b) => a + b),
  "-": math((a, b) => a - b),
  "*": math((a, b) => a * b),
  "/": math((a, b) => a / b),
  "%": math((a, b) => a % b),
  ">": math((a, b) => a > b),
  "<": math((a, b) => a < b),
  ">=": math((a, b) => a >= b),
  "<=": math((a, b) => a <= b),
  "**": math((a, b) => a ** b),
  "...": (a, env, stack) => {
    a.reduce((ctx, t) => evaluate(t, ctx, stack), env);
  },
  import: (args, env, stack) => {
    const fname = evaluate(args[0], env, stack);
    const importAll = (fn, env, stack) => [
      ...env,
      ...fn(fs.readFileSync(fname, "utf-8"))
        .map((t) => evaluate(t, env, stack))
        .map((t) => t[0]),
    ];
    const importSome = (fn, args, env, stack) => [
      ...env,
      ...fn(fs.readFileSync(fname, "utf-8"))
        .map((t) => evaluate(t, env, stack))
        .filter((t) => args.slice(1).includes(t[0][0]))
        .map((t) => t[0]),
    ];
    if (evaluate(args[1], env, stack) === "*")
      return fname.slice(fname.lastIndexOf("."), fname.length) === ".json"
        ? importAll(JSON.parse, env, stack)
        : importAll(parse, env, stack);
    else {
      const argList = args.map((t) => evaluate(t, env, stack));
      return fname.slice(fname.lastIndexOf("."), fname.length) === ".json"
        ? importSome(JSON.parse, argList, env, stack)
        : importSome(parse, argList, env, stack);
    }
  },
  library: ([a], env, stack) => {
    const fname = evaluate(a, env, stack);
    const dat = JSON.parse(fs.readFileSync(fname, "utf-8"));
    const res = [];
    for (const n of Object.keys(dat)) {
      res.push([
        `${fname
          .match(/[\w-]+\./g)
          .pop()
          .slice(0, -1)}::${n}`,
        eval(dat[n]),
      ]);
    }
    return [...env, ...res];
  },
  eval: ([a], env, stack) =>
    parse(evaluate(a, env, stack)).reduce(
      (ctx, t) => evaluate(t, ctx, stack),
      env
    ),
});

const execute = (exprs, ctx = defaultEnv) =>
  exprs.reduce((env, line) => evaluate(line, env), ctx);

module.exports = { execute };
