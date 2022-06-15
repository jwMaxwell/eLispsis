const { parse } = require("./parse.js");
const { execute } = require("./eval");
const fs = require("fs");

execute(parse(fs.readFileSync(process.argv[2], "utf-8")));
