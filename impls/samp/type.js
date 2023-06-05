class MalValue {
  constructor(value) {
    this.value = value;
  }

  pr_str() {
    return this.value.toString();
  }
};

class MalSymbol extends MalValue {
  constructor(value) {
    super(value);
  }
}

class MalNil extends MalValue {
  constructor() {
    super(null);
  }

  toString() {
    return 'nil';
  }
}

class MalBoolean extends MalValue {
  constructor(value) {
    super(value);
    this.value = value;
  }

  pr_str() {
    return this.value;
  }
}

class MalKeyword extends MalValue {
  constructor(value) {
    super(value);
  }

  toString() {
    return ":" + this.value.toString();
  }

  isEqual(otherIns) {
    return otherIns instanceof MalKeyword && this.value === otherIns.value;
  }
}

class MalString extends MalValue {
  constructor(value) {
    super(value);
  }

  toString() {
    return "\"" + this.value.toString() + "\"";
  }
}

class MalList extends MalValue {
  constructor(value) {
    super(value);
  }

  toString(){
    return '(' + this.value.map(x => x.toString()).join(' ') + ')';
  }

  isEmpty() {
    return this.value.length == 0;
  }
}

class MalVector extends MalValue {
  constructor(value) {
    super(value);
  }

  toString(){
    return '[' + this.value.map(x => x).join(' ') + ']';
  }
}

class MalHashmap {
  constructor(value) {
    this.value = value;
  }

  toString(){
    // const hash = {};
    // while(this.startIndex < this.value.length) {
    //   const key = this.value[this.startIndex].value;
    //   const value = this.value[this.startIndex + 1];

    //   hash[key] = value;
    //   this.startIndex = this.startIndex + 2;
    // }
    // return hash;
    return '{' + 
              this.value.map((x,i) =>
                 (i%2 != 0) ? x + ',' : x).join(' ').slice(0,-1) + '}';
  }
}

class MalFunction extends MalValue{
  constructor(ast, binds, env) {
    super(ast);
    this.binds= binds;
    this.env= env;
  }

  toString() {
    // return "#<function>";
    return this;
  }
}

module.exports = { MalSymbol, MalValue, MalList, MalVector, MalNil, MalBoolean, MalKeyword, MalHashmap, MalString, MalFunction};