const gestureTracker = {
  zones: [],
  EVENT: {
    ORTOGONAL: "ortogonalmotion",
  },
  RIGHT: "right",
  LEFT: "left",
  DOWN: "down",
  UP: "up",
  HORIZONTAL: "horizontal",
  VERTICAL: "vertical",
  aspectRatio: 1.2,
  min: 20,
  mouse: [
    [0, 0],
    [0, 0],
  ],
  touch: [
    [0, 0],
    [0, 0],
  ],
  dispatchEvent: function(){
    document.dispatchEvent(
        new CustomEvent(this.EVENT.ORTOGONAL, {
          detail: {
            direction: this.direction,
            orientation: this.orientation,
          },
        })
      );
  },
  /**@returns {boolean} hasDirection? */
  calcDirection(isPointer = true, dispatchEvent = true) {
    const { min } = this;
    const [point1, point2] = isPointer ? this.mouse : this.touch;
    let directionX = null;
    let directionY = null;
    let distanceX = Math.abs(point1[0]) - Math.abs(point2[0]);
    let distanceY = Math.abs(point1[1]) - Math.abs(point2[1]);
    if (distanceX >= min) directionX = this.LEFT;
    else if (distanceX <= -min) directionX = this.RIGHT;

    if (distanceY >= min) directionY = this.UP;
    else if (distanceY <= -min) directionY = this.DOWN;
    distanceX = Math.abs(distanceX);
    distanceY = Math.abs(distanceY);
    if (directionX && directionY) {
      if (distanceX * this.aspectRatio < distanceY) {
        this.direction = directionY;
        this.orientation = this.VERTICAL;
      } else if (distanceY * this.aspectRatio < distanceX) {
        this.direction = directionX;
        this.orientation = this.HORIZONTAL;
      } else {
        this.orientation = this.direction = null;
      }
    } else if (directionX || directionY) {
      this.orientation = directionX ? this.HORIZONTAL : this.VERTICAL;
      this.direction = directionX ?? directionY;
    } else {
      this.orientation = this.direction = null;
    }
    if (dispatchEvent && this.direction && this.orientation) {
      this.dispatchEvent()
    }
    return Boolean(this.direction);
  },
  direction: null,
};
document.addEventListener("mousedown", (e) => {
  gestureTracker.mouse[0] = [e.clientX, e.clientY];
});
document.addEventListener("mouseup", (e) => {
  if (
    e.clientX < 0 ||
    e.clientX > window.innerWidth ||
    e.clientY < 0 ||
    e.clientY > window.innerHeight
  )
    return;
  gestureTracker.mouse[1] = [e.clientX, e.clientY];
  gestureTracker.calcDirection();
});

document.addEventListener("touchstart", (e) => {
  if (e.touches.length > 1 || e.changedTouches.length > 1) return;
  const t = e.touches[0];
  gestureTracker.touch[0] = [t.clientX, t.clientY];
});
document.addEventListener(
  "touchmove",
  (e) => {
    if (gestureTracker.zones.includes(e.target)) e.preventDefault();
  },
  { passive: false }
);
document.addEventListener("touchend", (e) => {
  if (e.touches.length > 1 || e.changedTouches.length > 1) return;
  const t = e.changedTouches[0];
  gestureTracker.touch[1] = [t.clientX, t.clientY];
  gestureTracker.calcDirection(false);
});

document.addEventListener("keydown", (e) => {
  const [orientation, direction] = {
    ArrowDown: [gestureTracker.VERTICAL, gestureTracker.DOWN],
    ArrowUp: [gestureTracker.VERTICAL, gestureTracker.UP],
    ArrowLeft: [gestureTracker.HORIZONTAL, gestureTracker.LEFT],
    ArrowRight: [gestureTracker.HORIZONTAL, gestureTracker.RIGHT],
  }[e.key] ?? [null, null];
  if (!orientation) return;
  gestureTracker.direction = direction;
  gestureTracker.orientation = orientation;
  gestureTracker.dispatchEvent()
});

export default gestureTracker;
