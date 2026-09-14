class Particle {
  constructor(x, y, text, color, size, lifetime, vy) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.size = size || 14;
    this.lifetime = lifetime || 1.0;
    this.maxLifetime = this.lifetime;
    this.vy = vy || -60;
    this.vx = (Math.random() - 0.5) * 40;
    this.alive = true;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy *= 0.98;
    this.lifetime -= dt;
    if (this.lifetime <= 0) this.alive = false;
  }

  draw(ctx, camera) {
    if (!this.alive) return;
    const pos = camera.worldToScreen(this.x, this.y);
    const alpha = Utils.clamp(this.lifetime / this.maxLifetime, 0, 1);
    ctx.globalAlpha = alpha;
    Utils.drawPixelText(ctx, this.text, pos.x, pos.y, this.size, this.color, 'center');
    ctx.globalAlpha = 1;
  }
}

class ExplosionParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = Utils.randomRange(100, 300);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.radius = Utils.randomRange(2, 6);
    this.color = ['#ff4444', '#ff8800', '#ffcc00', '#ffffff'][Utils.randomInt(0, 3)];
    this.lifetime = Utils.randomRange(0.3, 0.8);
    this.maxLifetime = this.lifetime;
    this.alive = true;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vx *= 0.95;
    this.vy *= 0.95;
    this.lifetime -= dt;
    if (this.lifetime <= 0) this.alive = false;
  }

  draw(ctx, camera) {
    if (!this.alive) return;
    const pos = camera.worldToScreen(this.x, this.y);
    const alpha = this.lifetime / this.maxLifetime;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, this.radius * alpha, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}
