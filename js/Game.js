import Cube from "./Cube.js";
import Engine from "./Engine.js";
import Scene from "./Scene.js";
export default class Game extends Engine.mixin("root") {
  static EVENT = {
    CHANGE_SCORE: "changescore",
  };
  score = 0;
  maxScore = 0;
  /**@type {null|HTMLElement} */ $score = null;
  /**@type {null|HTMLElement} */ $maxScore = null;
  /**@type {Scene}*/ scene;
  /**@type {HTMLElement}*/ message;
  constructor() {
    super();
  }
  audioContext = new AudioContext();
  running = false;
  audio = {
    /**@type {AudioBuffer|null} */ onMixCubes: null,
  };
  async init() {
    this.running = true;
    this.scene ??= this.querySelector(`[is='${Scene.type}']`);
    this.message ??= this.querySelector("[is='message']");
    this.$score = this.querySelector("[is='score']");
    this.$maxScore = this.querySelector("[is='max-score']");

    if (!this.audio.onMixCubes) {
      const response = await fetch("/media/sound/on-mix.mp3");
      const arrayBuffer = await response.arrayBuffer();
      this.audio.onMixCubes = await this.audioContext.decodeAudioData(
        arrayBuffer
      );
    }
    this.audio.onMixCubes.volume = 1;
    if (!(this.scene instanceof Scene)) return;
    this.setScore(0);
    this.scene.init();
    this.scene.addRandomCube();
    if (this.message) this.message.textContent = "RUNNING";
    const $score = this.querySelector("[is='score']");
    if ($score) $score.textContent = this.score;
  }
  finish() {
    this.message.textContent = "GAME OVER";
    this.running = false;
    if (this.$maxScore && this.score > this.maxScore)
      this.maxScore = this.score;
    this.$maxScore.textContent = this.maxScore;
    this.onfinish();
  }
  onfinish = function () {};
  playSound() {
    if (this.audio.onMixCubes) {
      const source = this.audioContext.createBufferSource();
      const gain = this.audioContext.createGain();
      source.buffer = this.audio.onMixCubes;
      source.connect(this.audioContext.destination);
      gain.connect(this.audioContext.destination);
      gain.gain.value = 2;
      source.start();
    }
  }
  addScore(val = 0) {
    if (val === 0) return;
    this.setScore(this.score + val);
  }
  setScore(val = 0) {
    this.style.setProperty("--score", (this.score = val));
    if (this.$score) this.$score.textContent = this.score;
    document.dispatchEvent(
      new CustomEvent(Game.EVENT.CHANGE_SCORE, {
        detail: {
          score: this.score,
        },
      })
    );
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
