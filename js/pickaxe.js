// Загружаем настоящую текстуру кирки (Железная кирка из Minecraft)
const pickaxeImg = new Image();
pickaxeImg.src = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/master/assets/minecraft/textures/item/iron_pickaxe.png';

class Pickaxe {
  constructor(x, y, blockSize) {
    this.x = x;
    this.y = y;
    this.radius = 16;
    
    const angle = Utils.randomRange(-Math.PI * 0.8, -Math.PI * 0.2);
    const speed = 250;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    this.maxHp = 220;
    this.hp = 186;
    this.baseDamage = 15;
    this.alive = true;
    this.rotation = 0;
  }

  get damage() { return this.baseDamage; }

  update(dt, canvasWidth, worldHeight) {
    if (!this.alive) return;
    this.vy += 150 * dt; // Гравитация
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += (Math.abs(this.vx) + Math.abs(this.vy)) * dt * 0.015;

    // Отскоки
    if (this.x - this.radius < 0) { this.x = this.radius; this.vx = Math.abs(this.vx) * 0.9; }
    if (this.x + this.radius > canvasWidth) { this.x = canvasWidth - this.radius; this.vx = -Math.abs(this.vx) * 0.9; }
    if (this.y - this.radius < 0) { this.y = this.radius; this.vy = Math.abs(this.vy) * 0.9; }
  }

  bounceOffBlock(block) {
    const normal = Utils.circleRectNormal(this.x, this.y, this.radius, block.x, block.y, block.w, block.h);
    const dot = this.vx * normal.x + this.vy * normal.y;
    this.vx = (this.vx - 2 * dot * normal.x) * 0.85;
    this.vy = (this.vy - 2 * dot * normal.y) * 0.85;
    this.x += normal.x * 3; this.y += normal.y * 3;
  }

  draw(ctx, camera) {
    if (!this.alive) return;
    const pos = camera.worldToScreen(this.x, this.y);

    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(this.rotation);
    
    // Рисуем НАСТОЯЩУЮ картинку кирки
    if (pickaxeImg.complete) {
      // Картинка 16x16, растягиваем до 32x32
      ctx.drawImage(pickaxeImg, -16, -16, 32, 32);
    } else {
      // Заглушка, пока картинка грузится
      ctx.fillStyle = '#ccc'; ctx.fillRect(-4, -12, 8, 24);
    }
    ctx.restore();

    // Текст HP (❤️ 186/220) рядом с киркой, как на скрине
    const hpText = `❤️ ${Math.ceil(this.hp)}/${this.maxHp}`;
    Utils.drawPixelText(ctx, hpText, pos.x + 18, pos.y, 11, '#ff4444', 'left');
  }
}
