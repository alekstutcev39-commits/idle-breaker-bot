class Pickaxe {
  constructor(x, y, blockSize) {
    this.x = x;
    this.y = y;
    this.radius = CONFIG.PICKAXE_RADIUS || 14;

    const angle = Utils.randomRange(-Math.PI * 0.7, -Math.PI * 0.3);
    const speed = CONFIG.PICKAXE_BASE_SPEED || 200;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    this.level = 1;
    this.maxHp = 220;
    this.hp = 186;
    this.baseDamage = 10;
    this.alive = true;
    this.absorbed = false;

    this.rotation = 0;
    this.blockSize = blockSize;
    this.tierColor = '#d4a574'; // Деревянная / Каменная кирка
  }

  get damage() {
    return this.baseDamage * this.level;
  }

  update(dt, canvasWidth, worldHeight) {
    if (!this.alive) return;

    this.vy += CONFIG.GRAVITY * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.rotation += (Math.abs(this.vx) + Math.abs(this.vy)) * dt * 0.02;

    // Отскоки от стен
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
  }

  bounceOffBlock(block) {
    const normal = Utils.circleRectNormal(
      this.x, this.y, this.radius,
      block.x, block.y, block.w, block.h
    );

    const dot = this.vx * normal.x + this.vy * normal.y;
    this.vx = (this.vx - 2 * dot * normal.x) * CONFIG.BOUNCE_DAMPING;
    this.vy = (this.vy - 2 * dot * normal.y) * CONFIG.BOUNCE_DAMPING;

    this.x += normal.x * 4;
    this.y += normal.y * 4;
  }

  draw(ctx, camera) {
    if (!this.alive) return;

    const pos = camera.worldToScreen(this.x, this.y);

    // Отрисовка пиксельной кирки
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(this.rotation);

    // Деревянная рукоять
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(-2, -12, 4, 20);

    // Железное/Каменное лезвие
    ctx.fillStyle = this.tierColor;
    ctx.fillRect(-12, -12, 24, 5);
    ctx.fillRect(-14, -9, 6, 4);
    ctx.fillRect(8, -9, 6, 4);

    ctx.restore();

    // ИНДИКАТОР ЗДОРОВЬЯ КАК НА СКРИНШОТЕ (❤️ 186/220)
    const hpText = `❤️ ${Math.ceil(this.hp)}/${this.maxHp}`;
    Utils.drawPixelText(ctx, hpText, pos.x + 18, pos.y - 4, 10, '#ff4444', 'left');
  }
}
