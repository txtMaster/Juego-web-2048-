import Cube from "./Cube.js";
import Engine from "./Engine.js";

export default class Scene extends Engine.mixin("scene") {
  static EMPTY = " ";
  size = {
    x: 0,
    y: 0,
  };

  map = [[]];
  constructor() {
    super();
  }
  static observedAttributes = ["data-x", "data-y"];
  attributeChangedCallback(name, prev, next) {
    if (name === "data-x") {
      this.size.x = Number(next);
      this.style.setProperty("--perc-x", 100 / this.size.x + "%");
      this.style.setProperty("--fr-x", this.size.x);
      this.size.x--;
    } else if (name === "data-y") {
      this.size.y = Number(next);
      this.style.setProperty("--perc-y", 100 / this.size.y + "%");
      this.style.setProperty("--fr-y", this.size.y);
      this.size.y--;
    }
  }
  init() {
    [...this.children].forEach((c) => {
      if (c instanceof Cube) c?.mixin();
      else c.remove();
    });
    this.map = [];
    for (let i = 0; i < this.size.y + 1; i++) {
      this.map[i] = new Array(this.size.x + 1).fill(Scene.EMPTY);
    }
  }
  addCube(x = null, y = null) {
    if (this.map[y][x] instanceof Cube) return false;
    const $cube = new Cube();
    this.moveCube($cube, y, x);
    this.append($cube);
    return $cube;
  }
  /**@param {Cube} $cube */
  moveCube($cube, y, x) {
    if ($cube.x !== -1 && $cube.y !== -1) {
      this.map[$cube.y][$cube.x] = Scene.EMPTY;
    }
    this.map[y][x] = $cube;
    $cube.setY(y);
    $cube.setX(x);
  }
  /**@param {Cube} $cube*/
  removeCube($cube) {
    this.map[$cube.y][$cube.x] = Scene.EMPTY;
    $cube.mixin();
  }
  /**
   * @param {Cube}$mixed
   * @param {Cube}$cube
   */
  mixCubes($mixed, $cube) {
    if ($mixed.merged) return;
    $mixed.addValue($cube.value);
    $cube.setColorValue($mixed.value);
    this.map[$cube.y][$cube.x] = Scene.EMPTY;
    $cube.setY($mixed.y);
    $cube.setX($mixed.x);
    $cube.mixin();
    $mixed.merged = true;
  }

  addRandomCube() {
    let randomPosition = Math.floor(
      Math.random() * this.map.flat().filter((x) => x === Scene.EMPTY).length
    );
    let x = 0;
    let y = 0;
    for (let y = 0; y < this.map.length; y++) {
      const row = this.map[y];
      for (let x = 0; x < row.length; x++) {
        const cube = row[x];
        if (cube === Scene.EMPTY) {
          --randomPosition;
          if (randomPosition < 0) {
            return this.addCube(x, y);
          }
        }
      }
    }
    return false;
  }
  getRight = (y, x) => [this.map[y]?.[++x], y, x];
  getLeft = (y, x) => [this.map[y]?.[--x], y, x];
  getUp = (y, x) => [this.map[--y]?.[x], y, x];
  getDown = (y, x) => [this.map[++y]?.[x], y, x];
}
