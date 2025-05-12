import Cube from "./Cube.js";
import Engine from "./Engine.js";
import Scene from "./Scene.js";
export default class Game extends Engine.mixin("root") {
  /**@type {Scene}*/ scene;
  constructor() {
    super();
  }
  init() {
    this.scene ??= this.querySelector(`[is='${Scene.type}']`);
    if (!(this.scene instanceof Scene)) return;
    this.scene.init();
    this.scene.addRandomCube();
  }
}
