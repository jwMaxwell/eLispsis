const { core, readFile } = require('./coreFunctions');
const { parse, evaluate } = require("./evaluate.js");
const { exit } = require("process");
console.error = (x) => {
  console.log('\x1b[1m\x1b[31m' + x + '\x1b[0m'); 
  exit();
};

const execute = (input, env=core) =>
  parse(input).reduce(
    (ctx, line) => evaluate(line, ctx), env);

const main = (() => {
  try {
    execute(readFile(process.argv[2]));
  } catch (error) {
    error.name === 'RangeError'
      ? console.error('Stack Overflow')
      : console.log(error);
  }
})();

module.exports = { execute } // for testing