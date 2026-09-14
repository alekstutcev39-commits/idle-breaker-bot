const Utils = {
  lerp(a, b, t) {
    return a + (b - a) * t;
  },

  clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  },

  randomRange(min, max) {
    return Math.random() * (max - min) + min;
  },

  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  weightedRandom(items) {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    for (const item of items) {
      random -= item.weight;
      if (random <= 0) return item;
    }
    return items[items.length - 1];
  },

  circleRectCollision(cx, cy, cr, rx, ry, rw, rh) {
    const closestX = Utils.clamp(cx, rx, rx + rw);
    const closestY = Utils.clamp(cy, ry, ry + rh);
    const dx = cx - closestX;
    const dy = cy - closestY;
    return (dx * dx + dy * dy) < (cr * cr);
  },

  circleRectNormal(cx, cy, cr, rx, ry, rw, rh) {
    const closestX = Utils.clamp(cx, rx, rx + rw);
    const closestY = Utils.clamp(cy, ry, ry + rh);
    let nx = cx - closestX;
    let ny = cy - closestY;
    const len = Math.sqrt(nx * nx + ny * ny);
    if (len === 0) return { x: 0, y: -1 };
    return { x: nx / len, y: ny / len };
  },

  formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.floor(num).toString();
  },

  drawPixelText(ctx, text, x, y, size, color, align = 'left') {
    ctx.save();
    ctx.font = `bold ${size}px "Courier New", monospace`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillText(text, x, y);
    ctx.restore();
  },

  drawBlock(ctx, x, y, w, h, fillColor, borderColor, borderWidth = 2) {
    ctx.fillStyle = borderColor;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = fillColor;
    ctx.fillRect(x + borderWidth, y + borderWidth, w - borderWidth * 2, h - borderWidth * 2);
  },

  shake: { x: 0, y: 0, intensity: 0, duration: 0 },
  triggerShake(intensity, duration) {
    this.shake.intensity = intensity;
    this.shake.duration = duration;
  },
  updateShake(dt) {
    if (this.shake.duration > 0) {
      this.shake.duration -= dt;
      this.shake.x = (Math.random() - 0.5) * this.shake.intensity * 2;
      this.shake.y = (Math.random() - 0.5) * this.shake.intensity * 2;
    } else {
      this.shake.x = 0;
      this.shake.y = 0;
    }
  }
};
