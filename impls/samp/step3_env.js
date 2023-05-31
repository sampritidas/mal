const readline = require('readline');
const { read_str } = require('./reader');
const { MalSymbol, MalList, MalValue, MalVector, MalHashmap , MalString, MalKeyword, MalNil} = require('./type');
const { Env } = require('./env');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const _env = {
  '+' : (...args) => args.reduce((a,b) => a + b),
  '-' : (...args) => args.reduce((a,b) => a - b),
  '*' : (...args) => args.reduce((a,b) => a * b),
  '/' : (...args) => args.reduce((a,b) => a / b),
}

const eval_ast = (ast, env) => {
  if(ast instanceof MalSymbol) {
    return env.get(ast);
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

const env = new Env();
env.set(new MalSymbol('+'), (...args) => args.reduce((a,b) => a + b));
env.set(new MalSymbol('-'), (...args) => args.reduce((a,b) => a - b),)
env.set(new MalSymbol('*'), (...args) => args.reduce((a,b) => a * b),)
env.set(new MalSymbol('/'), (...args) => args.reduce((a,b) => a / b),)

const READ = str => read_str(str);
const EVAL = (ast, env) => {
  if(!(ast instanceof MalList)) return eval_ast(ast, env);

  if(ast.isEmpty()) return ast;

  switch(ast.value[0].value) {
    case "def!" :
      env.set(ast.value[1], EVAL(ast.value[2], env));
      return env.get(ast.value[1]);

    case "let*" :
        const newEnv = new Env(env);
        const bindings = ast.value[1].value;

        for(let i = 0; i < bindings.length ; i = i+2) {
          newEnv.set(bindings[i], EVAL(bindings[i + 1], newEnv))
        }
        return EVAL(ast.value[2], newEnv);
  }
  
  const [fn, ...args] = eval_ast(ast, env).value;
  return fn.apply(null, args);
}

const PRINT = MalValue => MalValue.toString();

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