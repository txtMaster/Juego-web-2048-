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
    this.onanimationend = function (e) {
      if (e.animationName === "mixin") e.target.remove();
    };
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
  /**
   * @param {Cube} $cube
   * @returns {Boolean}
   */
  moveCube($cube, y, x) {
    if ($cube.y === y && $cube.x === x) return false;
    if ($cube.x !== -1 && $cube.y !== -1) {
      this.map[$cube.y][$cube.x] = Scene.EMPTY;
    }
    this.map[y][x] = $cube;
    $cube.setY(y);
    $cube.setX(x);
    return true;
  }
  /**@param {Cube} $cube*/
  removeCube($cube) {
    this.map[$cube.y][$cube.x] = Scene.EMPTY;
    $cube.mixin();
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

  static DIRECTIONS = {
    LEFT: "LEFT",
    RIGHT: "RIGHT",
    UP: "UP",
    DOWN: "DOWN",
  };
  static GET_FIRST_POSITION = {
    [this.DIRECTIONS.RIGHT]: (cube, r, c) => [cube.y, c.length - 1],
    [this.DIRECTIONS.LEFT]: (cube, r, c) => [cube.y, 0],
    [this.DIRECTIONS.DOWN]: (cube, r, c) => [r.length - 1, cube.x],
    [this.DIRECTIONS.UP]: (cube, r, c) => [0, cube.x],
  };


  getRight = (y, x) => [this.map[y]?.[++x], y, x];
  getLeft = (y, x) => [this.map[y]?.[--x], y, x];
  getUp = (y, x) => [this.map[--y]?.[x], y, x];
  getDown = (y, x) => [this.map[++y]?.[x], y, x];

  GET_ADJACENT_CUBE = {
    [Scene.DIRECTIONS.LEFT]: [this.getRight, this.getLeft],
    [Scene.DIRECTIONS.RIGHT]: [this.getLeft, this.getRight],
    [Scene.DIRECTIONS.UP]: [this.getDown, this.getUp],
    [Scene.DIRECTIONS.DOWN]: [this.getUp, this.getDown],
  };

  /**@type {string} */
  moveTo(direction) {
    if (this.firstElementChild === null) return;
    const [beforeCube, nextCube] = this.GET_ADJACENT_CUBE[direction];
    const getFirstPosition = Scene.GET_FIRST_POSITION[direction];
    let hasMovedCube = false;
    let haveMixedCubes = false;
    let values = 0;
    for (let y = 0; y <= this.size.y; y++) {
      /**@type {(Cube|null)[]}*/ const row =
        this.map[direction === Scene.DIRECTIONS.DOWN ? this.size.y - y : y];
      for (let x = 0; x <= this.size.x; x++) {
        const $cube =
          row[direction === Scene.DIRECTIONS.RIGHT ? this.size.x - x : x];
        if ($cube === Scene.EMPTY) continue;
        let $next = undefined;
        let nextX = $cube.x;
        let nextY = $cube.y;
        let max = this.map.length + row.length;
        while (([$next, nextY, nextX] = nextCube(nextY, nextX)) && max >= 0) {
          if ($next === undefined) break;
          if ($next !== Scene.EMPTY) {
            if ($next.value === $cube.value) {
              let newValue = this.mixCubes($next, $cube);
              if (newValue !== false) {
                values += newValue;
                haveMixedCubes = hasMovedCube = true;
              }
            }
            break;
          }
          max--;
        }
        if ($next === undefined) {
          const [nextY, nextX] = getFirstPosition($cube, this.map, row);
          if (this.moveCube($cube, nextY, nextX)) hasMovedCube = true;
        } else if (!$next.merged || !$cube.used) {
          if (this.moveCube($cube, ...beforeCube($next.y, $next.x).slice(-2)))
            hasMovedCube = true;
        }
      }
    }
    [...this.children].forEach(
      /**@type {Cube} */ ($cube) => ($cube.merged = false)
    );
    if (!hasMovedCube)
      return false;
    //add new Cube
    const newCube = this.addRandomCube();
    let hasMoves = false;
    for (let y = 0; y < this.map.length; y++) {
      const row = this.map[y];
      for (let x = 0; x < row.length; x++) {
        const cube = row[x];
        const adjacentsCubes = [
          this.getUp(cube.y, cube.x)[0],
          this.getDown(cube.y, cube.x)[0],
          this.getLeft(cube.y, cube.x)[0],
          this.getRight(cube.y, cube.x)[0],
        ];
        if (
          adjacentsCubes.find(
            (c) => c === Scene.EMPTY || c?.value === cube.value
          )
        ) {
          hasMoves = true;
          break;
        }
      }
      if (hasMoves) break;
    }
    return {
      finished: !hasMoves,
      newValue: values,
    };
  }

  /**
   * @returns {false|number}
   * retorna false si no se pudo mesclar o el valor mesclado si se pudo mesclar
   */
  mixCubes(/**@type {Cube}*/ target, /**@type {Cube}*/ toMix) {
    if (target.merged || target === toMix) return false;
    const { value: mixedValue } = toMix;
    target.addValue(toMix.value);
    toMix.setColorValue(target.value);
    this.map[toMix.y][toMix.x] = Scene.EMPTY;
    toMix.setY(target.y);
    toMix.setX(target.x);
    toMix.mixin();
    target.merged = true;
    return mixedValue;
  }
}
