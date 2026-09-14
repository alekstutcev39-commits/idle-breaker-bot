class Block {
  constructor(gridX, gridY, type, blockSize) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.type = type;
    this.blockSize = blockSize;

    this.x = gridX * blockSize;
    this.y = gridY * blockSize;
    this.w = blockSize;
    this.h = blockSize;

    const def = CONFIG.BLOCK_TYPES[type];
    this.maxHp = def.hp;
    this.hp = def.hp;
    this.reward = def.reward;
    this.color = def.color;
    this.borderColor = def.borderColor;
    this.name = def.name;
    this.explosive = def.explosive || false;
    this.explosionRadius = def.explosionRadius || 0;
    this.isChest = def.isChest || false;
    this.speedBuff = def.speedBuff || false;
    this.isMonster = def.isMonster || false;
    this.alive = true;

    this.flashTimer = 0;
    this.damageShake = 0;
  }

  takeDamage(amount) {
    this.hp -= amount;
    this.flashTimer = 0.1;
    this.damageShake = 3;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
    return this.hp <= 0;
  }

  update(dt) {
    if (this.flashTimer > 0) this.flashTimer -= dt;
    if (this.damageShake > 0) this.damageShake *= 0.85;
  }

  draw(ctx, camera) {
    if (!this.alive) return;

    const shakeX = this.damageShake > 0.5 ? (Math.random() - 0.5) * this.damageShake : 0;
    const pos = camera.worldToScreen(this.x + shakeX, this.y);

    if (pos.y + this.h < -50 || pos.y > ctx.canvas.height + 50) return;

    const flash = this.flashTimer > 0;
    const fill = flash ? '#ffffff' : this.color;
    const border = flash ? '#dddddd' : this.borderColor;

    Utils.drawBlock(ctx, pos.x, pos.y, this.w, this.h, fill, border, 2);

    const cx = pos.x + this.w / 2;
    const cy = pos.y + this.h / 2;

    if (this.explosive) {
      Utils.drawPixelText(ctx, 'TNT', cx, cy - 6, Math.max(10, this.w / 4), '#fff', 'center');
    } else if (this.isChest) {
      Utils.drawPixelText(ctx, '📦', cx, cy - 6, Math.max(10, this.w / 3), '#fff', 'center');
    } else if (this.speedBuff) {
      Utils.drawPixelText(ctx, '⬆', cx, cy - 6, Math.max(12, this.w / 3), '#fff', 'center');
    } else if (this.isMonster) {
      const eyeSize = Math.max(3, this.w / 10);
      ctx.fillStyle = '#000';
      ctx.fillRect(pos.x + this.w * 0.3, pos.y + this.h * 0.3, eyeSize, eyeSize);
      ctx.fillRect(pos.x + this.w * 0.6, pos.y + this.h * 0.3, eyeSize, eyeSize);
      ctx.fillStyle = '#fff';
      ctx.fillRect(pos.x + this.w * 0.3 + 1, pos.y + this.h * 0.3, eyeSize / 2, eyeSize / 2);
      ctx.fillRect(pos.x + this.w * 0.6 + 1, pos.y + this.h * 0.3, eyeSize / 2, eyeSize / 2);
    }

    const hpText = Math.ceil(this.hp).toString();
    const fontSize = Math.max(8, this.w / 5);
    Utils.drawPixelText(ctx, hpText, cx, cy + (this.explosive || this.isChest || this.speedBuff || this.isMonster ? 8 : 0), fontSize, '#fff', 'center');

    const barH = 3;
    const barW = this.w - 6;
    const barX = pos.x + 3;
    const barY = pos.y + this.h - barH - 2;
    const hpRatio = this.hp / this.maxHp;

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = hpRatio > 0.5 ? '#2ecc71' : hpRatio > 0.25 ? '#f39c12' : '#e74c3c';
    ctx.fillRect(barX, barY, barW * hpRatio, barH);
  }
}
