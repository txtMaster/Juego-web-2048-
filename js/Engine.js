export default class Engine {
  /**@returns {typeof HTMLElement} */
  static mixin = (name) =>
    class extends HTMLElement {
      static _tag = "game-" + name;
      static get tag() {
        return this._tag;
      }
      static define() {
        customElements.define(this.tag, this);
      }
      constructor() {
        super();
      }
    };
}
