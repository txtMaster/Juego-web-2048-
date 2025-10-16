/**objeto encargado de detectar tipos de gestos en ciertas zonas asignadas*/
const gestureTracker = {
	/**zonas donde calcular los gestos*/ zones: [],
	/**zonas explicitas donde no calcular gestos */ excludeZones: [],

	/**claves de eventos*/
	EVENT: {
		ORTOGONAL: "ortogonalmotion",
	},
	/**clavez de direcciones */
	RIGHT: "right",
	LEFT: "left",
	DOWN: "down",
	UP: "up",
	HORIZONTAL: "horizontal",
	VERTICAL: "vertical",

	/**valor minimo de la relacion de aspecto entre 2 valores para considerarlo como gesto no diagonal  */
	aspectRatio: 1.2,

	/**distancia minima entre 2 coordenadas para detectarlo como gesto */
	min: 20,
	/**objeto se guarda las coordenadas de los 2 ultimos toques con el mouse */
	mouse: {
		prev: { x: 0, y: 0 },
		last: { x: 0, y: 0 },
	},
	/**objeto donde se guarda las coordenadas de los 2 ultimos toques tactiles */
	touch: {
		prev: { x: 0, y: 0 },
		last: { x: 0, y: 0 },
	},

	/**funcion que dispara un evento si se detecto un gesto */
	dispatchEvent: function () {
		document.dispatchEvent(
			new CustomEvent(this.EVENT.ORTOGONAL, {
				detail: {
					direction: this.direction,
					orientation: this.orientation,
				},
			})
		);
	},
	/**
	 * calcula con las coordenadas guardadas si hubo un gesto hacia una direccion
	 * @param {boolean} dispatchEvent especifica si se va dispara un evento si se encuentra un gesto
	 * @returns {boolean} hasDirection?
	 */
	calcDirection(isPointer = true, dispatchEvent = true) {
		const { min } = this;
		/**se obtiene las 2 ultimas coordenadas registradas */
		const {last,prev} = isPointer ? this.mouse : this.touch;

    //variables donde se especificara el tipo de movimiento detectado
		let directionX = null;
		let directionY = null;

    //se obtiene la diferencia entre las 2 coordenadas
		let distanceX = Math.abs(prev.x) - Math.abs(last.x);
		let distanceY = Math.abs(prev.y) - Math.abs(last.y);

    //si la distancia horizontal(x) es mayor o menor al minimo, registrarlo como movimiento hacia la izquierda o derecha
		if (distanceX >= min) directionX = this.LEFT;
		else if (distanceX <= -min) directionX = this.RIGHT;


    //si la distancia vertical (x) es mayor o menor al minimo, registrarlo como movimiento hacia arriba o abajo
		if (distanceY >= min) directionY = this.UP;
		else if (distanceY <= -min) directionY = this.DOWN;

    //convertir a positivo las distancdirectionias luego de compararlas
		distanceX = Math.abs(distanceX);
		distanceY = Math.abs(distanceY);

    //si se detectaron movimieno para ambas direcciones
		if (directionX && directionY) {
      //si y es mayor a x por cierto rango, el movimiento real es el de Y
			if (distanceX * this.aspectRatio < distanceY) {
				this.direction = directionY;
				this.orientation = this.VERTICAL;
      //si x es mayor a y por cierto rango, el movimiento real es el de X
			} else if (distanceY * this.aspectRatio < distanceX) {
				this.direction = directionX;
				this.orientation = this.HORIZONTAL;
      //si distancias no son lo suficientemente diferentes, no registrar direccion
			} else {
				this.orientation = this.direction = null;
			}
    //si solo se detecto movimiento en una direccion
		} else if (directionX || directionY) {
			this.orientation = directionX ? this.HORIZONTAL : this.VERTICAL;
			this.direction = directionX ?? directionY;
    //si no se detecto movimiento
		} else {
			this.orientation = this.direction = null;
		}
    //disparar evento si se detecto movimiento
		if (dispatchEvent && this.direction && this.orientation) {
			this.dispatchEvent();
		}
		return Boolean(this.direction);
	},
	direction: null,
};
document.addEventListener("mousedown", ({target,clientX:x,clientY:y}) => {
	if (gestureTracker.excludeZones.includes(target)) return;
	gestureTracker.mouse.prev = {x,y};
});
document.addEventListener("mouseup", ({target,clientX:x,clientY:y}) => {
	if (gestureTracker.excludeZones.includes(target)) return;
  //si x esta fuera de la pantalla, no registrar
	if (
		x < 0 ||
		x > window.innerWidth ||
		x < 0 ||
		x > window.innerHeight
	)
		return;
	gestureTracker.mouse.last = {x,y};
	gestureTracker.calcDirection();
});

document.addEventListener("touchstart", (e) => {
	if (gestureTracker.excludeZones.includes(e.target)) return;
	if (e.touches.length > 1 || e.changedTouches.length > 1) return;
	const {clientX:x,clientY:y} = e.touches[0];
	gestureTracker.touch.prev = {x,y};
});
document.addEventListener(
	"touchmove",
	(e) => {
		if (gestureTracker.zones.includes(e.target)) e.preventDefault();
	},
	{ passive: false }
);
document.addEventListener("touchend", (e) => {
	if (gestureTracker.excludeZones.includes(e.target)) return;
	if (e.touches.length > 1 || e.changedTouches.length > 1) return;
	const {clientX:x,clientY:y} = e.changedTouches[0];
	gestureTracker.touch.last = {x,y};
	gestureTracker.calcDirection(false);
});

document.addEventListener("keydown", (e) => {
	if (gestureTracker.excludeZones.includes(e.target)) return;
	const [orientation, direction] = {
		ArrowDown: [gestureTracker.VERTICAL, gestureTracker.DOWN],
		ArrowUp: [gestureTracker.VERTICAL, gestureTracker.UP],
		ArrowLeft: [gestureTracker.HORIZONTAL, gestureTracker.LEFT],
		ArrowRight: [gestureTracker.HORIZONTAL, gestureTracker.RIGHT],
	}[e.key] ?? [null, null];
	if (!orientation) return;
	gestureTracker.direction = direction;
	gestureTracker.orientation = orientation;
	gestureTracker.dispatchEvent();
});

export default gestureTracker;
