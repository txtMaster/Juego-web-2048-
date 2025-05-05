import Engine from "./Engine.js";

export class Cube extends Engine.mixin("cube") {
    x = -1;
    y = -1;
    value = 0;
    constructor() {
      super();
      this.textContent = this.value;
      this.addValue(2);
    }
    setColorValue(n) {
      this.style.setProperty("--val", n);
    }
    addValue(n) {
      this.value += n;
      this.textContent = this.value;
      this.setColorValue(this.value);
    }
    /** @param { number } val*/
    setX(x) {
      this.x = x;
      this.style.setProperty("--x", this.x);
    }
    /** @param { number } val*/
    setY(y) {
      this.y = y;
      this.style.setProperty("--y", this.y);
    }
    //esta mescaldo
    merged = false;
    //ha sido mescaldo
    used = false
    mixin() {
      this.used = true
      this.setAttribute("mixin", "");
    }
  }