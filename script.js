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
const soundButton = document.getElementById("sound");
/**@type {HTMLAudioElement} */ const backgroundAudio =
  document.getElementById("background-audio");

const volumenSlide = document.getElementById("audio-volumen");
volumenSlide.oninput = function (e) {
  backgroundAudio.volume = volumenSlide.value / 100;
};

gestureTracker.zones.push($scene);
console.log(document.querySelector("section#audio-controls"));
gestureTracker.excludeZones.push(
  ...document.querySelectorAll("section#audio-controls input")
);
document.addEventListener(gestureTracker.EVENT.ORTOGONAL, (e) => {
  if (!$game.running) return;
  if ($scene.firstElementChild === null) return;
  const { direction, orientation } = e.detail;
  const [beforeCube, nextCube] = {
    [gestureTracker.LEFT]: [$scene.getRight, $scene.getLeft],
    [gestureTracker.RIGHT]: [$scene.getLeft, $scene.getRight],
    [gestureTracker.UP]: [$scene.getDown, $scene.getUp],
    [gestureTracker.DOWN]: [$scene.getUp, $scene.getDown],
  }[direction];
  const getFirstPosition = {
    [gestureTracker.RIGHT]: (cube, r, c) => [cube.y, c.length - 1],
    [gestureTracker.LEFT]: (cube, r, c) => [cube.y, 0],
    [gestureTracker.DOWN]: (cube, r, c) => [r.length - 1, cube.x],
    [gestureTracker.UP]: (cube, r, c) => [0, cube.x],
  }[direction];
  let hasMovedCube = false;
  let haveMixedCubes = false;
  for (let y = 0; y <= $scene.size.y; y++) {
    /**@type {(Cube|null)[]}*/ const row =
      $scene.map[direction === gestureTracker.DOWN ? $scene.size.y - y : y];
    for (let x = 0; x <= $scene.size.x; x++) {
      const $cube =
        row[direction === gestureTracker.RIGHT ? $scene.size.x - x : x];
      if ($cube === Scene.EMPTY) continue;
      let $next = undefined;
      let nextX = $cube.x;
      let nextY = $cube.y;
      let max = $scene.map.length + row.length;
      while (([$next, nextY, nextX] = nextCube(nextY, nextX)) && max >= 0) {
        if ($next === undefined) break;
        if ($next !== Scene.EMPTY) {
          if ($next.value === $cube.value) {
            if ($game.mixCubes($next, $cube))
              haveMixedCubes = hasMovedCube = true;
          }
          break;
        }
        max--;
      }
      if ($next === undefined) {
        const [nextY, nextX] = getFirstPosition($cube, $scene.map, row);
        if ($scene.moveCube($cube, nextY, nextX)) hasMovedCube = true;
      } else if (!$next.merged || !$cube.used) {
        if ($scene.moveCube($cube, ...beforeCube($next.y, $next.x).slice(-2)))
          hasMovedCube = true;
      }
    }
  }
  [...$scene.children].forEach(
    /**@type {Cube} */ ($cube) => ($cube.merged = false)
  );
  if (!hasMovedCube) return;
  //add new Cube
  const newCube = $scene.addRandomCube();
  let hasMoves = false;
  for (let y = 0; y < $scene.map.length; y++) {
    const row = $scene.map[y];
    for (let x = 0; x < row.length; x++) {
      const cube = row[x];
      const adjacentsCubes = [
        $scene.getUp(cube.y, cube.x)[0],
        $scene.getDown(cube.y, cube.x)[0],
        $scene.getLeft(cube.y, cube.x)[0],
        $scene.getRight(cube.y, cube.x)[0],
      ];
      if (
        adjacentsCubes.find((c) => c === Scene.EMPTY || c?.value === cube.value)
      ) {
        hasMoves = true;
        break;
      }
    }
    if (hasMoves) break;
  }
  if (haveMixedCubes) $game.playSound();
  if (!hasMoves) {
    $game.finish();
  }

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

await $game.init();

$game.querySelector("button").onclick = () => {
  $game.init();
};

soundButton.onclick = function () {
  backgroundAudio.volume = 0.3;
  backgroundAudio.loop = true;
  if (backgroundAudio.paused) {
    backgroundAudio.play();
  } else {
    backgroundAudio.pause();
  }
};

document.addEventListener(Game.EVENT.CHANGE_SCORE, (e) => {
  document.body.style.setProperty("--score", e.detail.score);
});
$game.onfinish = function(){
  this.score
}
