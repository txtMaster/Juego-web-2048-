import Cube from "./Cube.js";
import Engine from "./Engine.js";

export default class Scene extends Engine.mixin("scene") {
  static EMPTY = " ";
  size = {
    x: 0,
    y: 0,
  };

  //arreglo para las coordenadas de las piezas
  coor = [[]];
  constructor() {
    super();
    //al terminar la animacion de desvanecimiento de un hijo, lo remueve
    this.onanimationend = function (e) {
      if (e.animationName === "mixin") e.target.remove();
    };
  }
  static observedAttributes = ["data-x", "data-y"];
  attributeChangedCallback(name, prev, next) {
    if (name === "data-x") {
      this.size.x = Math.max(Number(next),1);
      this.style.setProperty("--perc-x", 100 / this.size.x + "%");
      this.style.setProperty("--fr-x", this.size.x);
      this.size.x--;
    } else if (name === "data-y") {
      this.size.y = Math.max(Number(next),1);
      this.style.setProperty("--perc-y", 100 / this.size.y + "%");
      this.style.setProperty("--fr-y", this.size.y);
      this.size.y--;
    }
  }
  init() {
    //al inicializar la escena, borra todos las piezas del juego
    [...this.children].forEach((c) => {
      if (c instanceof Cube) c?.mixin();
      else c.remove();
    });

    //tambien se limpian las coordenadas previas
    this.coor = [];
    for (let i = 0; i < this.size.y + 1; i++) {
      this.coor[i] = new Array(this.size.x + 1).fill(Scene.EMPTY);
    }
  }
  addCube(x = null, y = null) {
    //si ya hay un cubo en la coordenada especificada, retornar
    if (this.coor[y][x] instanceof Cube) return false;
    const $cube = new Cube();
    this.moveCube($cube, y, x);
    this.append($cube);
    return $cube;
  }
  /**
   * @param {Cube} $cube
   * @returns {Boolean} retorna verdadero si se movio correctamente
   */
  moveCube($cube, y, x) {
    //si la posicion no cambia
    if ($cube.y === y && $cube.x === x) return false;
    //si la posicion no es negativa
    if ($cube.x !== -1 && $cube.y !== -1) {
      this.coor[$cube.y][$cube.x] = Scene.EMPTY;
    }
    this.coor[y][x] = $cube;
    $cube.setY(y);
    $cube.setX(x);
    return true;
  }
  /**@param {Cube} $cube*/
  removeCube($cube) {
    this.coor[$cube.y][$cube.x] = Scene.EMPTY;
    $cube.mixin();
  }

  /**
   * 
   * @returns {boolean} retorna falso si no se pudo crear una nueva pieza random
   */
  addRandomCube() {
    //Se crea un numero aleatorio dentro del rango de espacios vacios disponibles en la escena
    let randomPosition = Math.floor(
      Math.random() * this.coor.flat().filter((x) => x === Scene.EMPTY).length
    );
    let x = 0;
    let y = 0;
    // se hace un recorrido a la escena. Por cada espacio vacio, se va restando el numero random. Cuando llega a cero, se intenta agregar la pieza en dicha posicion aleatoria y se retorna el resultado
    for (let y = 0; y < this.coor.length; y++) {
      const row = this.coor[y];
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

  //objecto donde se guardan las funciones para obtener el 1er elemento dentro de una fila u columa, dependiendo de la direccion
  //ejemplo; si se intenta mover hacia abajo, entonces la 1era pieza es la que esta arriba; si se intenta mover hacia la derecha, la 1era pieza es la de la izq
  static GET_FIRST_POSITION = {
    [this.DIRECTIONS.RIGHT]: (cube, row, col) => [cube.y, col.length - 1],
    [this.DIRECTIONS.LEFT]: (cube, row, col) => [cube.y, 0],
    [this.DIRECTIONS.DOWN]: (cube, row, col) => [row.length - 1, cube.x],
    [this.DIRECTIONS.UP]: (cube, row, col) => [0, cube.x],
  };


  //funcion para obtener un cubo adyacente a otro segun la direccion
  getRight = (y, x) => ({cube:(this.coor[y]?.[++x]), y, x});
  getLeft = (y, x) => ({cube:this.coor[y]?.[--x], y, x});
  getUp = (y, x) => ({cube:this.coor[--y]?.[x], y, x});
  getDown = (y, x) => ({cube:this.coor[++y]?.[x], y, x});

  GET_ADJACENT_CUBE = {
    [Scene.DIRECTIONS.LEFT]: {getBefore:this.getRight, getAfter:this.getLeft},
    [Scene.DIRECTIONS.RIGHT]: {getBefore:this.getLeft, getAfter:this.getRight},
    [Scene.DIRECTIONS.UP]: {getBefore:this.getDown, getAfter:this.getUp},
    [Scene.DIRECTIONS.DOWN]: {getBefore:this.getUp,getAfter: this.getDown},
  };

  /**@param {string} direction*/
  moveTo(direction) {
    //si no hay piezas hijas, retornar
    if (this.firstElementChild === null) return;
    //se obtienen las funciones para obtener la siguiente u anterior pieza segun el movimiento
    const {getBefore,getAfter} = this.GET_ADJACENT_CUBE[direction];
    //se obtiene la funcion para saber cual es la direccion por la cual empezar a recorrer una fila o columna
    const getFirstPosition = Scene.GET_FIRST_POSITION[direction];
    //si ya se movio algun cubo
    let hasMovedCube = false;
    //si se mezclo algun cubo
    let haveMixedCubes = false;

    //valores agregados durante el movimiento
    let values = 0;
    for (let y = 0; y <= this.size.y; y++) {
      //si la direccion es hacia abajo, empezar a recorrer las coordenadas desde el ultimo hasta el primero. para intentar mover y mezclar a los que estan abajo primero
      /**@type {(Cube|null)[]}*/
      const row = this.coor[
        direction === Scene.DIRECTIONS.DOWN 
        ? this.size.y - y 
        : y];
      for (let x = 0; x <= this.size.x; x++) {
        //empezar desde el ultimo cubo de una fila si se va hacia la derecha. para intentar mover y mezclar primero los cubos de la derecha.
        const $cube =
          row[direction === Scene.DIRECTIONS.RIGHT ? this.size.x - x : x];
        if ($cube === Scene.EMPTY) continue;
        let $next = undefined;
        let nextX = $cube.x;
        let nextY = $cube.y;
        //buscar entre los espacios siguiente de la linea del cubo actual algun cubo con el cual mezclarse
        while (
          (
            {cube:$next,x:nextX,y:nextY} = getAfter(nextY, nextX)
          ) && $next !== undefined
        ) {
          //si la sig pieza no esta vacia
          if ($next !== Scene.EMPTY) {
            //si la pieza actual y la siguiente son del mismo valor, mezclar
            if ($next.value === $cube.value) {
              let newValue = this.mixCubes($next, $cube);
              if (newValue !== false) {
                values += newValue;
                haveMixedCubes = hasMovedCube = true;
              }
            }
            break;
          }
        }

        // si durante el recorrido lineal no se encontro ninguna pieza con la cual mezclar la pieza actual, mover la pieza actual a la primera posicion
        if ($next === undefined) {
          const [firstY, fisrtX] = getFirstPosition($cube, this.coor, row);
          if (this.moveCube($cube, firstY, fisrtX)) hasMovedCube = true;
        // o se encontro una pieza con el cual mezclar, pero este ya ha sido mesclado, mover la pieza actual una posicion antes de dicha pieza
        } else if (!$next.merged || !$cube.used) {
          const {x,y} = getBefore($next.y, $next.x);
          if (this.moveCube($cube,y,x)) hasMovedCube = true;
        }
      }
    }
    //desmarcar las piezas de la escena para el siguiente movimiento
    [...this.children].forEach(
      /**@type {Cube} */ ($cube) => ($cube.merged = false)
    );
    //si no se movio ni una pieza
    if (!hasMovedCube) return false;
    
    this.addRandomCube();
    //verifica si hay alguna posible combinacion o espacio vacio para el proximo movimiento
    let hasMoves = false;

    for (let y = 0; y < this.coor.length; y++) {
      const row = this.coor[y];
      for (let x = 0; x < row.length; x++) {
        const cube = row[x];
        const adjacentsCubes = [
          this.getUp(cube.y, cube.x).cube,
          this.getDown(cube.y, cube.x).cube,
          this.getLeft(cube.y, cube.x).cube,
          this.getRight(cube.y, cube.x).cube,
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
   * esta funcion sirve para mesclar los valores de dos cubos
   * @returns {false|number} retorna false si no se pudo mesclar o el valor mesclado si se pudo mesclar
   * @param {Cube} target pieza principal que obtendra el valor de ambas piezas
   * @param {Cube} toMix pieza secundaria que se mesclara y desaparecera
   */
  mixCubes(/**@type {Cube}*/ target, /**@type {Cube}*/ toMix) {
    //si el cubo ya esta mescaldo
    if (target.merged || target === toMix) return false;
    const { value: mixedValue } = toMix;
    //agregar el valor de la pieza secundaria a la pieza principal
    target.addValue(toMix.value);
    //asignarle el mismo color, pero no el valor. Solo por estetica
    toMix.setColorValue(target.value);
    //limpiar la coordenada de la pieza secundaria
    this.coor[toMix.y][toMix.x] = Scene.EMPTY;

    //mover visualmente la pieza secundaria a la coordenada de la pieza principal mientras se desvanece. SOlo por estetica
    toMix.setY(target.y);
    toMix.setX(target.x);
    toMix.mixin();
    // marcar la pieza principal como ya mesclada
    target.merged = true;
    return mixedValue;
  }
}
