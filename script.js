import gestureTracker from "./js/gestureTracker.js";
import Engine from "./js/Engine.js";
import Scene from "./js/Scene.js";
import Cube from "./js/Cube.js";
import Game from "./js/Game.js";

Cube.define();
Game.define();
Scene.define();
/** @type {Game} */ const $game = document.getElementById("game");
/** @type {Scene} */ const $scene = $game.scene;

//definir el funcionamiento del control de sonido

const volumenSlide = document.getElementById("audio-volumen");
volumenSlide.oninput = () => $game.setVolumen(volumenSlide.value / 100);

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

document.addEventListener(Game.EVENT.CHANGE_SCORE, (e) => {
	document.body.style.setProperty("--score", e.detail.score);
});

document.addEventListener("DOMContentLoaded", async (e) => await $game.init(), {
	once: true,
});

const colInput = document.getElementById("col-input");
const rowInput = document.getElementById("row-input");
document.getElementById("add-col").onclick = () =>
	colInput.value = Math.max(Number(colInput.value) + 1,1);
document.getElementById("add-row").onclick = () =>
	rowInput.value = Math.max(Number(rowInput.value) + 1,1);

document.getElementById("res-col").onclick = () => colInput.value = Math.max(colInput.value-1,1);
document.getElementById("res-row").onclick = () => rowInput.value = Math.max(rowInput.value-1,1);



gestureTracker.excludeZones.push(colInput);

$game.querySelector("button").onclick = () => {
	$scene.childNodes.forEach((c) => c.remove());
	$scene.setAttribute("data-x", colInput.value);
	$scene.setAttribute("data-y", rowInput.value);
	$game.init();
};
