const readline = require('readline');
const { read_str } = require('./reader');
const { pr_str } = require('./printer');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const READ = str => read_str(str);
const PRINT = str => pr_str(str);
const EVAL = str => str;

const rep = str =>  PRINT(EVAL(READ(str)));

const repl = () => {
  rl.question('user> ', line => {
    try {
      console.log(rep(line));
    } catch (e) {
      console.log(e);
    }
    repl();
  })
}

repl();