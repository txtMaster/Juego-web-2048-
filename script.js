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
gestureTracker.excludeZones.push(
  ...document.querySelectorAll("section#audio-controls input")
);
document.addEventListener(gestureTracker.EVENT.ORTOGONAL, (e) => {
  const { direction } = e.detail;
  let sceneDirection =
    {
      [gestureTracker.DOWN]: Scene.DIRECTIONS.DOWN,
      [gestureTracker.UP]: Scene.DIRECTIONS.UP,
      [gestureTracker.LEFT]: Scene.DIRECTIONS.LEFT,
      [gestureTracker.RIGHT]: Scene.DIRECTIONS.RIGHT,
    }[direction] ?? null;
  if (sceneDirection === null) return;
  $game.moveTo(sceneDirection);
});

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
$game.onfinish = function () {
  this.score;
};

document.addEventListener("DOMContentLoaded",async e=>{
  await $game.init();
},{
  once:true
})