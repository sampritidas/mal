const { MalList } = require("./type");

class Env {
  #outer
  constructor(outer, binds = [], exprs= []) {
    this.#outer = outer;
    this.data = {};
    this.#bindExprs(binds, exprs); 
  }

  #bindExprs(binds, exprs) {
      let index=0;
      while(index < binds.length && binds[index].value !== '&') {
        this.set(binds[index], exprs[index]);
        index++;
        // console.log("Inside while of env",this);
      }

      if(index >= binds.length) {
        return;
      }

      this.set(binds[index + 1], new MalList(exprs.slice(index)));
  }

  set(symbol, malValue) {
    this.data[symbol.value] = malValue;
  }

  find(symbol) {
    if (this.data[symbol.value] !== undefined) {
      return this;
    }
    if(this.#outer) {
      return this.#outer.find(symbol);
    }
  }

  get(symbol) {
    const env = this.find(symbol);
    if(!env) throw symbol.value + " not found";
    return env.data[symbol.value];
  }
}

module.exports = { Env };
