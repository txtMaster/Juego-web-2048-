import Cube from "./Cube.js";
import Engine from "./Engine.js";
import Scene from "./Scene.js";
export default class Game extends Engine.mixin("root") {
  score = 0;
  /**@type {Scene}*/ scene;
  constructor() {
    super();
  }
  running = false;
  init() {
    this.running = true;
    this.scene ??= this.querySelector(`[is='${Scene.type}']`);
    if (!(this.scene instanceof Scene)) return;
    this.setScore(0);
    this.scene.init();
    this.scene.addRandomCube();
    const $message = this.querySelector("[is='message']");
    if ($message) $message.textContent = "RUNNING";
    const $score = this.querySelector("[is='score']");
    if ($score) $score.textContent = this.score;
  }
  finish() {
    const $message = this.querySelector("[is='message']");
    if ($message) $message.textContent = "GAME OVER";
    this.running = false;
  }
  addScore(val = 0) {
    if (val === 0) return;
    this.setScore(this.score + val);
    const $score = this.querySelector("[is='score']");
    if ($score) $score.textContent = this.score;
  }
  setScore(val = 0) {
    this.style.setProperty("--score", (this.score = val));
  }

  /**
   * @returns {Boolean}
   * retorna un boleano si se pudo mesclar ambos cubos o no
   */
  mixCubes(/**@type {Cube}*/ target, /**@type {Cube}*/ toMix) {
    if (target.merged || target === toMix) return false;
    const { value: mixedValue } = toMix;
    target.addValue(toMix.value);
    toMix.setColorValue(target.value);
    this.scene.map[toMix.y][toMix.x] = Scene.EMPTY;
    toMix.setY(target.y);
    toMix.setX(target.x);
    toMix.mixin();
    target.merged = true;
    this.addScore(mixedValue);
    return true;
  }
}
