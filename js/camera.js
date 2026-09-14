class Camera {
  constructor() {
    this.y = 0;
    this.targetY = 0;
  }

  follow(targetY) {
    this.targetY = targetY;
  }

  update(dt) {
    this.y = Utils.lerp(this.y, this.targetY, CONFIG.CAMERA_SMOOTH);
  }

  worldToScreen(wx, wy) {
    return {
      x: wx + Utils.shake.x,
      y: wy - this.y + Utils.shake.y
    };
  }
}
