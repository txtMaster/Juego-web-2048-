import gestureTracker from "./js/gestureTracker.js";
import Engine from "./js/Engine.js";
import Scene from "./js/Scene.js";
import Cube from "./js/Cube.js";
import Game from "./js/Game.js";

Cube.define();
Game.define();
Scene.define();
/** @type {Game} */
const $game = document.getElementById("game");
/** @type {Scene} */
const $scene = $game.querySelector("[is='game-scene']");
const $test = document.getElementById("test");


gestureTracker.zones.push($scene);
document.addEventListener(gestureTracker.EVENT.ORTOGONAL, (e) => {
  if ($scene.firstElementChild === null) return;
  const { direction, orientation } = e.detail;
  const [beoreCube, nextCube] = {
    [gestureTracker.LEFT]: [
      $scene.getRight,
      $scene.getLeft,
    ],
    [gestureTracker.RIGHT]: [
      $scene.getLeft,
      $scene.getRight,
    ],
    [gestureTracker.UP]: [
      $scene.getDown,
      $scene.getUp,
    ],
    [gestureTracker.DOWN]: [
      $scene.getUp,
      $scene.getDown,
    ],
  }[direction];
  const getFirstPosition = {
    [gestureTracker.RIGHT]: (cube, r, c) => [cube.y, c.length - 1],
    [gestureTracker.LEFT]: (cube, r, c) => [cube.y, 0],
    [gestureTracker.DOWN]: (cube, r, c) => [r.length - 1, cube.x],
    [gestureTracker.UP]: (cube, r, c) => [0, cube.x],
  }[direction];

  for (let y = 0; y <= $scene.size.y; y++) {
    /**@type {(Cube|null)[]}*/ const row =
      $scene.map[direction === gestureTracker.DOWN ? $scene.size.y - y : y];
    for (let x = 0; x <= $scene.size.x; x++) {
      const $cube =
        row[direction === gestureTracker.RIGHT ? $scene.size.x - x : x];
      if ($cube === Scene.EMPTY) continue;
      let $next;
      let nextX = $cube.x;
      let nextY = $cube.y;
      let max = $scene.map.length + row.length;
      while (([$next, nextY, nextX] = nextCube(nextY, nextX)) && max >= 0) {
        if ($next === undefined) break;
        if ($next !== Scene.EMPTY) {
          if ($next.value === $cube.value) {
            $scene.mixCubes($next, $cube);
          }
          break;
        }
        max--;
      }
      document.addEventListener(gestureTracker.EVENT.ORTOGONAL, (e) => {});
      if ($next === undefined) {
        $scene.moveCube($cube, ...getFirstPosition($cube, $scene.map, row));
      } else if (!$next.merged) {
        $scene.moveCube($cube, ...beoreCube($next.y, $next.x).slice(-2));
      } else if (!$cube.used) {
        $scene.moveCube($cube, ...beoreCube($next.y, $next.x).slice(-2));
      }
    }
  }
  [...$scene.children].forEach(
    /**@type {Cube} */ ($cube) => ($cube.merged = false)
  );
  //add new Cube

  const newCube = $scene.addRandomCube();

  return;
  [...$scene.children].forEach(
    /**@type {Cube} */ ($c) => {
      if (orientation === gestureTracker.HORIZONTAL) {
        $c.setX(direction === gestureTracker.RIGHT ? $scene.size.x : 0);
      } else {
        $c.setY(direction === gestureTracker.DOWN ? $scene.size.y : 0);
      }
    }
  );
});

$scene.addEventListener("animationend", (e) => {
  if (e.animationName === "mixin") e.target.remove();
});

$game.init()
console.log({...$scene});

$game.querySelector("button").onclick = function(){
  $game.init()
}