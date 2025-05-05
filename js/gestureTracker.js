const gestureTracker = {
  EVENT: {
    ORTOGONAL: "ortogonalmotion",
  },
  RIGHT: "right",
  LEFT: "left",
  DOWN: "down",
  UP: "up",
  HORIZONTAL: "horizontal",
  VERTICAL: "vertical",
  min: 30,
  mouse: [
    [0, 0],
    [0, 0],
  ],
  touch: [
    [0, 0],
    [0, 0],
  ],
  /**@returns {boolean} hasDirection? */
  calcDirection(isPointer = true, dispatchEvent = true) {
    const { min } = this;
    const [point1, point2] = isPointer ? this.mouse : this.touch;
    let directionX = null;
    let directionY = null;
    if (point1[0] + min < point2[0]) directionX = this.RIGHT;
    else if (point1[0] - min > point2[0]) directionX = this.LEFT;

    if (point1[1] + min < point2[1]) directionY = this.DOWN;
    else if (point1[1] - min > point2[1]) directionY = this.UP;

    if ((directionX && directionY) || (!directionX && !directionY)) {
      this.orientation = this.direction = null;
      return false;
    }
    this.orientation = directionX ? this.HORIZONTAL : this.VERTICAL;
    this.direction = directionX ?? directionY;
    if (dispatchEvent) {
      window.dispatchEvent(
        new CustomEvent("ortogonalmotion", {
          detail: {
            direction: this.direction,
            orientation: this.orientation,
          },
        })
      );
    }
    return Boolean(this.direction);
  },
  direction: null,
};
window.addEventListener("mousedown", (e) => {
  gestureTracker.mouse[0] = [e.clientX, e.clientY];
});
window.addEventListener("mouseup", (e) => {
  if (
    e.clientX < 0 ||
    e.clientX > window.innerWidth ||
    e.clientY < 0 ||
    e.clientY > window.innerWidth
  )
    return;
  gestureTracker.mouse[1] = [e.clientX, e.clientY];
  gestureTracker.calcDirection();
});

window.addEventListener("touchstart", (e) => {
  if (e.touches.length > 1 || e.changedTouches.length > 1) return;
  const t = e.changedTouches[0];
  gestureTracker.touch[0] = [t.clientX, t.clientY];
});
window.addEventListener("touchend", (e) => {
  if (e.touches.length > 1 || e.changedTouches.length > 1) return;
  const t = e.changedTouches[0];
  if (
    t.clientX < 0 ||
    t.clientX > window.innerWidth ||
    t.clientY < 0 ||
    t.clientY > window.innerWidth
  )
    return;
  gestureTracker.touch[1] = [t.clientX, t.clientY];
  gestureTracker.calcDirection(false);
});

export default gestureTracker;
