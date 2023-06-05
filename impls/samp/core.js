const { MalList, MalNil, MalString, MalKeyword } = require('./type');

const implementNot = (a) => {
  if(a == 0) return false;
  if(a.value != undefined) return !a.value;
  return !a;
};

const getString = (...args) => {
 return args.map(x => x.value? x.value : x);
}

const isArray = Array.isArray;

const areEqual = function (ele1, ele2) {

  if (ele1.length !== ele2.length) {
    return false;
  }
  if (ele1.length === 0) {
    return true;
  }
  if (!deepEqual(ele1[0], ele2[0])) {
    return false;
  }
  return deepEqual(ele1.slice(1), ele2.slice(1));
};

const deepEqual = function (ele1, ele2) {
  if(ele1 instanceof MalKeyword || ele2 instanceof MalKeyword) {
    return ele1.isEqual(ele2);
  }
  if (isArray(ele1) && isArray(ele2)) {
    return areEqual(ele1, ele2);
  }
  return ele1 === ele2;
};

const ns = {
  '+' : (...args) => args.reduce((a,b) => a + b),
  '-' : (...args) => args.reduce((a,b) => a - b),
  '*' : (...args) => args.reduce((a,b) => a * b),
  '/' : (...args) => args.reduce((a,b) => a / b),
  '=' : (a, b) => {
    return a.value && b.value ? deepEqual(a.value, b.value) : deepEqual(a, b);
  },
  'empty?' : (...args) => args[0].value.length == 0,
  '>' : (...args) => 
    args.map((x,i) => args[i] > args[i+1]).slice(0,-1).every(x => x == true),
  '<' : (...args) => 
    args.map((x,i) => args[i] < args[i+1]).slice(0,-1).every(x => x == true),
  '<' : (...args) => 
    args.map((x,i) => args[i] < args[i+1]).slice(0,-1).every(x => x == true),
  '<=' : (...args) => 
    args.map((x,i) => args[i] <= args[i+1]).slice(0,-1).every(x => x == true),
  '>=' : (...args) => 
    args.map((x,i) => x >= args[i+1]).slice(0,-1).every(x => x == true),
  'not' : (a) => !(a),
  'println' : (arg) => {
      console.log(arg);
      return new MalNil();
    },
  'list?' :  (args) => args instanceof MalList,
  'list' : (...args) => new MalList(args),
  'count' : (...args) => args[0].value.length,
  'str' : (...args) => {
      return new MalString(getString(args).join(""));
  },
  'prn' : (...args) => {
    const output = args.map(x=> x.value? `"${x.value}"` : x);
    console.log(...output);
    return new MalNil();
  },
  'pr-str' : (...args) => {
    return new MalString(getString(args).join(" "));
  },
  'println' : (...args) => {
    console.log(...getString(args).join(" "));
    return new MalNil();
  }
}

module.exports = {ns};