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
		this.scene ??= this.querySelector(`${Scene.tag}`);
		this.message ??= this.querySelector("[is='message']");
		this.$score = this.querySelector("[is='score']");
		this.$maxScore = this.querySelector("[is='max-score']");
	}
	audioContext = new AudioContext();
	running = false;
	_volumen = 1;
	audios = {
		/**@type {AudioBuffer|null} */ onMixCubes: null,
	};
	setVolumen(val){
		this._volumen = Math.max(Math.min(val,1),0);
	}
	setAudio(val){
		if(!this.audios.onMixCubes)return
		this.audios.onMixCubes.volume = val
	}
	async init() {
		this.running = true;

    //si el audio es null, cargarlo
		if (!this.audios.onMixCubes) {
			const response = await fetch("/media/sound/on-mix.mp3");
			const arrayBuffer = await response.arrayBuffer();
			this.audios.onMixCubes = await this.audioContext.decodeAudioData(
				arrayBuffer
			);
		}

    //si no hay escene retornar
		if (!(this.scene instanceof Scene)) return;
		this.setScore(0);
    //inicializar escena con una pieza al azar
		this.scene.init();
		this.scene.addRandomCube();
		this.message.textContent = "RUNNING";
		this.$score.textContent = this.score;
		this.dataset.state="init"
	}
	finish() {
		this.message.textContent = "GAME OVER";
		this.running = false;
		if (this.$maxScore && this.score > this.maxScore)
			this.maxScore = this.score;
		this.$maxScore.textContent = this.maxScore;
		this.dataset.state="finished"
		this.onfinish();
	}
	onfinish = function () {};
	playSound() {
		if (this.audios.onMixCubes) {
			const source = this.audioContext.createBufferSource();
			const gainNode = this.audioContext.createGain();
			source.buffer = this.audios.onMixCubes;
			source.connect(gainNode);
			gainNode.connect(this.audioContext.destination);
			gainNode.gain.value = 3 * this._volumen;
			source.start();
		}
	}
	addScore(val = 0) {
		if (val === 0) return;
		this.setScore(this.score + val);
	}
	setScore(val = 0) {
		this.style.setProperty("--score", (this.score = val));
		this.$score.textContent = this.score;
		if (this.score !== 0) this.playSound();
		document.dispatchEvent(
			new CustomEvent(Game.EVENT.CHANGE_SCORE, {
				detail: {
					score: this.score,
				},
			})
		);
	}

	moveTo(/**@type {string} */ direction) {
		if (!this.running) return;
		const details = this.scene.moveTo(direction);
		if (details.newValue >= 0) this.addScore(details.newValue);
		if (details.finished) this.finish();
		this.dataset.state="playing"
	}
}