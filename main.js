const { exit } = require("process");
const { core, readFile } = require('./coreFunctions');
const { parse, evaluate } = require("./evaluate.js");

const execute = (input, env=core) =>
  parse(input).reduce(
    (ctx, line) => evaluate(line, ctx), env);

const main = (() => execute(readFile(process.argv[2])));
// main();

module.exports = { execute } // for testing