const { exit } = require("process");
console.error = (x) => {
  console.log("\x1b[1m\x1b[31m" + x + "\x1b[0m");
  exit();
};

const last = (arr) => arr[arr.length - 1];

const balanceCheck = (tokens) => {
  const parenStack = [];
  for (const n of tokens) {
    if (n.value === "(") parenStack.push(n);
    else if (n.value === ")" && parenStack.length < 1)
      console.error(`unmatched paren ')' at ${n.line}:${n.col}`);
    else if (n.value === ")") parenStack.pop();
  }
  if (parenStack.length)
    console.error(
      `unmatched paren '(' at ${last(parenStack).line}:${last(parenStack).col}`
    );
};

class Token {
  constructor(col, line, value) {
    this.col = col;
    this.line = line;
    this.value = value;
  }

  toString() {
    return `<${this.value} ${this.line}:${this.col}>`;
  }
}

const tokenize = (input) => {
  input = `(\n${input}\n ) `.replace(/\t/g, " ").replace(/;(.*?)\n/g, "");

  let line = 0;
  let col = 0;
  let tokens = [];
  let cursor = 0;
  let tokenStart = 0;
  const operators = `"()'`;

  while (cursor < input.length) {
    if (operators.includes(input.slice(tokenStart, cursor))) {
      // if string, get string
      if (input.slice(tokenStart, cursor).trim() === '"') {
        while (input[cursor] !== '"') {
          ++col;
          ++cursor;
          if (cursor > input.length)
            console.error(`Unmatched quote at ${line}:${col}`);
        }
        ++cursor;
      }

      if (input.slice(tokenStart, cursor).trim() !== "")
        tokens.push(
          new Token(
            col - input.slice(tokenStart, cursor).length,
            line,
            input.slice(tokenStart, cursor)
          )
        );

      tokenStart = cursor;
    }

    if (operators.includes(input[cursor]) || input[cursor] === " ") {
      const value = input.slice(tokenStart, cursor).trim();

      const token = new Token(col - value.length, line, value);

      if (token.value === "\n") {
        ++line;
        col = 0;
      }

      if (token.value !== "") tokens.push(token);
      tokenStart = cursor;
    }
    ++col, ++cursor;
  }
  tokens.map((t) => (t.value = t.value.trim()));

  balanceCheck(tokens);
  return tokens;
};

module.exports = { tokenize, Token };
