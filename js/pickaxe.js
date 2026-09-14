class Pickaxe {
  constructor(x, y, blockSize) {
    this.x = x;
    this.y = y;
    this.radius = CONFIG.PICKAXE_RADIUS;

    const angle = Utils.randomRange(-Math.PI * 0.8, -Math.PI * 0.2);
    const speed = CONFIG.PICKAXE_BASE_SPEED;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    this.level = 1;
    this.maxHp = 320;
    this.hp = 320;
    this.baseDamage = CONFIG.PICKAXE_BASE_DAMAGE;
    this.alive = true;
    this.absorbed = false;

    this.rotation = 0;
    this.trail = [];
    this.blockSize = blockSize;

    this.updateTier();
  }

  get damage() {
    return this.baseDamage * this.level;
  }

  getTier() {
    const tiers = CONFIG.PICKAXE_TIERS;
    let tier = tiers[0];
    for (const t of tiers) {
      if (this.level >= t.minLevel) tier = t;
    }
    return tier;
  }

  updateTier() {
    this.tier = this.getTier();
  }

  upgrade() {
    this.level++;
    this.maxHp += 50;
    this.hp = this.maxHp;
    this.updateTier();
  }

  applySpeedBuff() {
    const mult = 1.5;
    this.vx *= mult;
    this.vy *= mult;
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > CONFIG.MAX_SPEED) {
      this.vx = (this.vx / speed) * CONFIG.MAX_SPEED;
      this.vy = (this.vy / speed) * CONFIG.MAX_SPEED;
    }
  }

  update(dt, canvasWidth, worldHeight) {
    if (!this.alive) return;

    this.vy += CONFIG.GRAVITY * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.rotation += (Math.abs(this.vx) + Math.abs(this.vy)) * dt * 0.01;

    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx = Math.abs(this.vx) * CONFIG.BOUNCE_DAMPING;
    }
    if (this.x + this.radius > canvasWidth) {
      this.x = canvasWidth - this.radius;
      this.vx = -Math.abs(this.vx) * CONFIG.BOUNCE_DAMPING;
    }

    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.vy = Math.abs(this.vy) * CONFIG.BOUNCE_DAMPING;
    }

    this.trail.push({ x: this.x, y: this.y, alpha: 1 });
    if (this.trail.length > 8) this.trail.shift();
    for (const t of this.trail) t.alpha *= 0.85;

    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed < CONFIG.MIN_SPEED) {
      this.vx += (Math.random() - 0.5) * 100;
      this.vy -= Math.random() * 80 + 40;
    }
  }

  bounceOffBlock(block) {
    const normal = Utils.circleRectNormal(
      this.x, this.y, this.radius,
      block.x, block.y, block.w, block.h
    );

    const dot = this.vx * normal.x + this.vy * normal.y;
    this.vx = (this.vx - 2 * dot * normal.x) * CONFIG.BOUNCE_DAMPING;
    this.vy = (this.vy - 2 * dot * normal.y) * CONFIG.BOUNCE_DAMPING;

    const pushForce = this.radius + 2;
    this.x += normal.x * pushForce * 0.3;
    this.y += normal.y * pushForce * 0.3;

    this.vx += (Math.random() - 0.5) * 30;
    this.vy += (Math.random() - 0.5) * 30;
  }

  draw(ctx, camera) {
    if (!this.alive) return;

    const pos = camera.worldToScreen(this.x, this.y);

    for (let i = 0; i < this.trail.length; i++) {
      const t = this.trail[i];
      const tp = camera.worldToScreen(t.x, t.y);
      ctx.globalAlpha = t.alpha * 0.3;
      ctx.fillStyle = this.tier.color;
      ctx.beginPath();
      ctx.arc(tp.x, tp.y, this.radius * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(this.rotation);

    const handleW = this.radius * 0.35;
    const handleH = this.radius * 1.6;
    ctx.fillStyle = '#8B6914';
    ctx.fillRect(-handleW / 2, -handleH / 2, handleW, handleH);

    const headW = this.radius * 1.8;
    const headH = this.radius * 0.7;
    ctx.fillStyle = this.tier.color;
    ctx.fillRect(-headW / 2, -handleH / 2 - headH / 2, headW, headH);

    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(-headW / 2 + 2, -handleH / 2 - headH / 2 + 2, headW * 0.4, headH * 0.4);

    ctx.restore();

    const barW = this.radius * 2.5;
    const barH = 3;
    const barX = pos.x - barW / 2;
    const barY = pos.y - this.radius - 8;
    const hpRatio = this.hp / this.maxHp;

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(barX, barY, barW * hpRatio, barH);

    Utils.drawPixelText(ctx, `Lv${this.level}`, pos.x, pos.y + this.radius + 8, 8, '#fff', 'center');
  }
}
