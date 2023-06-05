
const readline = require('readline');
const { read_str } = require('./reader');
const { MalSymbol, MalList, MalValue, MalVector, MalHashmap , MalString, MalKeyword, MalNil, MalFunction} = require('./type');
const { Env } = require('./env');
const { ns } = require('./core');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const handleDef = (ast, env) => {
  env.set(ast.value[1], EVAL(ast.value[2], env));
  return [env.get(ast.value[1]), env];
};

const handleLet = (ast, env) => {
  const [binds, ...exprs] = ast.value.slice(1);
  const newEnv = new Env(env, binds, exprs);

  for(let i=0; i<binds.value.length ; i+=2) {
    newEnv.set(binds.value[i], EVAL(binds.value[i+1], newEnv));
  }

  const doForms = new MalList([new MalSymbol('do'), ...exprs]);
  return [doForms, newEnv];
};

const handleDo = (ast, env) => {
  const forms = ast.value.slice(1);
  let result = new MalNil();
  forms.slice(0,-1).forEach(x => {
    result = EVAL(x, env);
  })

  return forms[forms.length - 1];
};

const handleIf = (ast, env) => {
  const [condition, ifBlock, elseBlock] = ast.value.slice(1);
  const result = EVAL(condition, env);
  if(result === false || result instanceof MalNil) {
    return elseBlock === undefined ? new MalNil() : elseBlock;
  }

  return ifBlock;
};

const handleFn = (ast, env) => {
  const [, binds, ...exprs] = ast.value;
  const doForms = new MalList([new MalSymbol('do'), ...exprs]);
  return new MalFunction(doForms, binds, env);
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
  while(true) {
    if(!(ast instanceof MalList)) return eval_ast(ast, env);

    if(ast.isEmpty()) return ast;

    switch(ast.value[0].value) {
      case "def!" : {
        [ast, env] =  handleDef(ast, env);
        break;
      }
      case "let*" :
        [ast, env] = handleLet(ast, env);
        break;
      case "do" : 
        ast = handleDo(ast, env);
        break;
      case "if" :
        ast = handleIf(ast, env);
        break;
      case "fn*" :
        ast = handleFn(ast, env);
        break;
      default:
        const [fn, ...args] = eval_ast(ast, env).value;
        if(fn instanceof MalFunction) {
          const binds = fn.binds;
          const oldEnv = fn.env;
          env = new Env(oldEnv, binds.value, args);
          ast = fn.value;
        } else {
          return fn.apply(null, args);
        }
    }
  }
}

// (def! fact (fn* [r a] (if (<= a 1) 0 (fact (* r a) (- a 1)))))
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
