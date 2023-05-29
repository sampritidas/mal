const readline = require('readline');
const { read_str } = require('./reader');
const { MalSymbol, MalList, MalValue, MalVector, MalHashmap , MalString, MalKeyword} = require('./type');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const env = {
  '+' : (...args) => args.reduce((a,b) => a + b),
  '-' : (...args) => args.reduce((a,b) => a - b),
  '*' : (...args) => args.reduce((a,b) => a * b),
  '/' : (...args) => args.reduce((a,b) => a / b),
}

const eval_ast = (ast, env) => {
  if(ast instanceof MalSymbol) {
    return env[ast.value];
  }

  if(ast instanceof MalString) {
    return new MalString(ast.value);
  }

  if(ast instanceof MalKeyword) {
    return new MalKeyword(ast.value);
  }

  if(ast instanceof MalList) {
    const newAst = ast.value.map(x => EVAL(x, env));
    return new MalList(newAst);
  }

  if(ast instanceof MalVector) {
    const newAst = ast.value.map(x => EVAL(x, env));
    return new MalVector(newAst);
  }

  if(ast instanceof MalHashmap) {
    const newAst = ast.value.map(x => EVAL(x, env));
    return new MalHashmap(newAst);
  }

  return ast;
}

const READ = str => read_str(str);
const EVAL = (ast, env) => {
  if(!(ast instanceof MalList)) return eval_ast(ast, env);

  if(ast.isEmpty()) return ast;

  const [fn, ...args] = eval_ast(ast, env).value;
  return fn.apply(null, args);
}
const PRINT = str => str.toString();

const rep = str => PRINT(EVAL(READ(str), env));

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