import gestureTracker from "./js/gestureTracker.js";
import Engine from "./js/Engine.js";
import { Game } from "./js/Game.js";
import { Cube } from "./js/Cube.js";

Cube.define();
Game.define();
/** @type {Game} */
const $game = document.getElementById("game");

window.addEventListener(gestureTracker.EVENT.ORTOGONAL, (e) => {
  if ($game.firstElementChild === null) return;
  const { direction, orientation } = e.detail;
  if (orientation === gestureTracker.HORIZONTAL) {
    if (direction === gestureTracker.LEFT) {
      for (let y = 0; y <= $game.size.y; y++) {
        /**@type {(Cube|null)[]}*/ const row = $game.map[y];
        for (let x = 0; x <= $game.size.x; x++) {
          const $cube = row[x];
          if ($cube === Game.EMPTY) continue;
          let { y: prevY, x: prevX } = $cube;
          let $prev;
          let max = row.length;
          while (($prev = row[--prevX]) !== undefined && max >= 0) {
            if ($prev !== Game.EMPTY) {
              if ($prev.merged) {
                break;
              } else if ($prev.value === $cube.value) {
                $game.mixCubes($prev, $cube);
                break;
              }
            }
            max--;
          }
          if($prev === undefined)$game.moveCube($cube, $cube.y, 0);
          else if(!$prev.merged){
            $game.moveCube($cube, $cube.y, $prev.x+1);
          }else if(!$cube.used){
            $game.moveCube($cube, $cube.y, $prev.x+1);
          }
        }
      }
    }
  }
  [...$game.children].forEach(/**@type {Cube} */ $cube=>$cube.merged = false)
  return
  [...$game.children].forEach(
    /**@type {Cube} */ ($c) => {
      if (orientation === gestureTracker.HORIZONTAL) {
        $c.setX(direction === gestureTracker.RIGHT ? $game.size.x : 0);
      } else {
        $c.setY(direction === gestureTracker.DOWN ? $game.size.y : 0);
      }
    }
  );
});

$game.addEventListener("animationend", (e) => {
  if(e.animationName === "mixin")e.target.remove()
});

$game.init();
$game.addCube(4, 0);
$game.addCube(2, 0);
$game.addCube(3, 0);
$game.addCube(1, 0);
