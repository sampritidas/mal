
const readline = require('readline');
const { read_str } = require('./reader');
const { MalSymbol, MalList, MalValue, MalVector, MalHashmap , MalString, MalKeyword, MalNil} = require('./type');
const { Env } = require('./env');
const { ns } = require('./core');

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

const handleDef = (ast, env) => {
  env.set(ast.value[1], EVAL(ast.value[2], env));
  return env.get(ast.value[1]);
};

const handleLet = (ast, env) => {
  const newEnv = new Env(env);
  const bindings = ast.value[1].value;

  for (let i = 0; i < bindings.length; i = i + 2) {
    newEnv.set(bindings[i], EVAL(bindings[i + 1], newEnv));
  }
  return EVAL(ast.value[2], newEnv);
};

const handleDo = (ast, env) => {
  const evaluated = ast.value.slice(1).map(x => EVAL(x, env));
  return evaluated[evaluated.length - 1];
};

const handleIf = (ast, env) => {
  const condition = EVAL(ast.value[1], env);
  const ifBlock = ast.value[2];
  const elseBlock = ast.value[3];

  if(ast.value.length < 3) throw 'Too few arguments to if';

  if(condition == true || condition.value?.length == 0) {
    return EVAL(ifBlock, env);
  } else {
    return elseBlock ? EVAL(elseBlock, env) : new MalNil();
  }
};

const handleFn = (ast, env) => {
  const [, binds, ...exprs] = ast.value;
  return (...args) => {
    const newEnv = new Env(env, binds.value, args);
    const doForms = new MalList([new MalSymbol('do'), ...exprs]);
    return EVAL(doForms, newEnv);
  }
};

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

const READ = str => read_str(str);
const EVAL = (ast, env) => {
  if(!(ast instanceof MalList)) return eval_ast(ast, env);

  if(ast.isEmpty()) return ast;

  switch(ast.value[0].value) {
    case "def!" : return handleDef(ast, env);
    case "let*" : return handleLet(ast. env);
    case "do" :   return handleDo(ast, env);
    case "if" :   return handleIf(ast, env);
    case "fn*" :  return handleFn(ast, env);
  }
  
  const [fn, ...args] = eval_ast(ast, env).value;
  return fn.apply(null, args);
}

const env = new Env();
Object.entries(ns).forEach((x) => {
  env.set(new MalSymbol(x[0]), x[1]);
});

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
