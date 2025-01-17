const { MalSymbol, MalList, MalVector ,MalNil, MalBoolean, MalKeyword, MalHashmap, MalString} = require("./type");

class Reader {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
  }

  peek() {
    return this.tokens[this.position];
  }

  next() {
    const token=this.peek();
    this.position++;
    return token;
  }
}

const tokenize = (str) => {
  const re =
   /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g;

  return [...str.matchAll(re)].map(x => x[1]).slice(0, -1);
};

const read_seq = (reader, closingSymbol) => {
  const ast = [];

  while(reader.peek() !== closingSymbol) {
    if(reader.peek() === undefined) {
      throw 'unbalanced';
    }
    ast.push(read_form(reader));
  }

  reader.next();
  return ast;
}; 

const read_list = reader => {
  const ast = read_seq(reader, ')');
  return new MalList(ast);
};

const read_vector = reader => {
  const ast = read_seq(reader, ']');
  return new MalVector(ast);
};

const read_hashmap = reader => {
  const ast = read_seq(reader, '}');
  return new MalHashmap(ast);
};

const read_atom = reader => {
  const token = reader.next();
  if (token.match(/^-?[0-9]+$/)) {
    return parseInt(token);
  }
  if(token.match(/^"(?:\\.|[^\\"])*"$/)) {
    return new MalString(token.slice(1,token.length-1));
  }
  if (token === 'true') {
    return new MalBoolean(true);
  }
  if (token === 'false') {
    return new MalBoolean(false);
  }
  if (token === 'nil') {
    return new MalNil();
  }
  if(token[0] === ":") {
    return new MalKeyword(token.slice(1));
  }
  return new MalSymbol(token);
};

const read_form = reader => {
  const token = reader.peek();
  switch (token) {
    case '(' : 
      reader.next();
      return read_list(reader);
    case '[' :
      reader.next();
      return read_vector(reader);
    case '{' :
      reader.next();
      return read_hashmap(reader);
    default : 
      return read_atom(reader);
  }
};

const read_str = (str) => {
  const tokens = tokenize(str);
  const reader = new Reader(tokens);
  return read_form(reader);
}

module.exports = { read_str };