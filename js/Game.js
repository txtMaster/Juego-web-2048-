import { Cube } from "./Cube.js";
import Engine from "./Engine.js";

export class Game extends Engine.mixin("root") {
    static EMPTY = " ";
    size = {
      x: 0,
      y: 0,
    };
    map = [];
    constructor() {
      super();
    }
    static observedAttributes = ["data-x", "data-y"];
    attributeChangedCallback(name, prev, next) {
      if (name === "data-x") {
        this.size.x = Number(next);
        this.style.setProperty("--fr-x", 100 / this.size.x-- + "%");
      } else if (name === "data-y") {
        this.size.y = Number(next);
        this.style.setProperty("--fr-y", 100 / this.size.y-- + "%");
      }
    }
    init() {
      this.map = [];
      for (let i = 0; i < this.size.x + 1; i++) {
        this.map[i] = new Array(this.size.y + 1).fill(Game.EMPTY);
      }
      console.log(this.size);
    }
    addCube(x = null, y = null) {
      const $cube = new Cube();
      const newX = x ?? Math.floor(Math.random() * this.size.x);
      const newY = y ?? Math.floor(Math.random() * this.size.y);
      if (this.map[newY][newX] !== Game.EMPTY) return this.addCube(x, y);
      this.moveCube($cube, newY, newX);
      this.append($cube);
    }
    /**@param {Cube} $cube */
    moveCube($cube, y, x) {
      if ($cube.x !== -1 && $cube.y !== -1) {
        this.map[$cube.y][$cube.x] = Game.EMPTY;
      }
      this.map[y][x] = $cube;
      $cube.setY(y);
      $cube.setX(x);
    }
    /**@param {Cube} $cube*/
    removeCube($cube) {
      this.map[$cube.y][$cube.x] = Game.EMPTY;
      $cube.mixin();
    }
    /**
     * @param {Cube}$mixed
     * @param {Cube}$cube
     */
    mixCubes($mixed, $cube) {
      if($mixed.merged) return
      console.log("mixing cubes");
      $mixed.addValue($cube.value);
      $cube.setColorValue($mixed.value);
      this.map[$cube.y][$cube.x] = Game.EMPTY;
      $cube.setY($mixed.y);
      $cube.setX($mixed.x);
      $cube.mixin();
      $mixed.merged = true;
    }
  }