export default class Engine {
  /**@returns {typeof HTMLElement} */
  static mixin = (name) =>
    class extends HTMLDivElement {
      static get type() {
        return "game-" + name;
      }
      static define() {
        customElements.define(this.type, this, { extends: "div" });
      }
      constructor() {
        super();
        this.setAttribute("is", this.constructor.type);
      }
    };
}
