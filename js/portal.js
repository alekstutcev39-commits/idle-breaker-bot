class Portal {
  constructor(cols, totalRows, blockSize) {
    this.x = 0;
    this.y = (totalRows - CONFIG.PORTAL_HEIGHT) * blockSize;
    this.w = cols * blockSize;
    this.h = CONFIG.PORTAL_HEIGHT * blockSize;
    this.blockSize = blockSize;

    this.time = 0;
    this.particles = [];
    this.active = false;
  }

  update(dt) {
    this.time += dt;

    if (Math.random() < 0.3) {
      this.particles.push({
        x: this.x + Math.random() * this.w,
        y: this.y + Math.random() * this.h,
        size: Utils.randomRange(2, 5),
        alpha: 1,
        vy: -Utils.randomRange(20, 50),
        color: ['#6a0dad', '#9b30ff', '#4b0082', '#00ff88'][Utils.randomInt(0, 3)]
      });
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.y += p.vy * dt;
      p.alpha -= dt * 1.5;
      if (p.alpha <= 0) this.particles.splice(i, 1);
    }
  }

  containsPickaxe(pickaxe) {
    return pickaxe.x > this.x && pickaxe.x < this.x + this.w &&
           pickaxe.y > this.y && pickaxe.y < this.y + this.h;
  }

  draw(ctx, camera) {
    const pos = camera.worldToScreen(this.x, this.y);

    const gradient = ctx.createLinearGradient(pos.x, pos.y, pos.x, pos.y + this.h);
    gradient.addColorStop(0, '#1a0033');
    const pulse = 0.5 + 0.3 * Math.sin(this.time * 3);
    gradient.addColorStop(0.5, `rgba(106, 13, 173, ${pulse})`);
    gradient.addColorStop(1, '#000011');

    ctx.fillStyle = gradient;
    ctx.fillRect(pos.x, pos.y, this.w, this.h);

    ctx.strokeStyle = '#9b30ff';
    ctx.lineWidth = 3;
    ctx.strokeRect(pos.x + 1, pos.y + 1, this.w - 2, this.h - 2);

    const starCount = 12;
    for (let i = 0; i < starCount; i++) {
      const sx = pos.x + ((i * 47 + this.time * 20) % this.w);
      const sy = pos.y + ((i * 31 + this.time * 15) % this.h);
      const sa = 0.3 + 0.7 * Math.abs(Math.sin(this.time * 2 + i));
      ctx.globalAlpha = sa;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sx, sy, 2, 2);
    }
    ctx.globalAlpha = 1;

    for (const p of this.particles) {
      const pp = camera.worldToScreen(p.x, p.y);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(pp.x, pp.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    const centerX = pos.x + this.w / 2;
    const centerY = pos.y + this.h / 2;
    Utils.drawPixelText(ctx, '🌀 ПОРТАЛ 🌀', centerX, centerY, 14, '#bb88ff', 'center');
  }
}
