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

    const def = CONFIG.BLOCK_TYPES[type] || CONFIG.BLOCK_TYPES.STONE;
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
    this.flashTimer = 0.08;
    this.damageShake = 4;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
    return this.hp <= 0;
  }

  update(dt) {
    if (this.flashTimer > 0) this.flashTimer -= dt;
    if (this.damageShake > 0) this.damageShake *= 0.8;
  }

  draw(ctx, camera) {
    if (!this.alive) return;

    const shakeX = this.damageShake > 0.5 ? (Math.random() - 0.5) * this.damageShake : 0;
    const pos = camera.worldToScreen(this.x + shakeX, this.y);

    if (pos.y + this.h < -50 || pos.y > ctx.canvas.height + 50) return;

    const flash = this.flashTimer > 0;

    // Отрисовка пиксельной текстуры блока
    ctx.save();
    ctx.translate(pos.x, pos.y);

    if (flash) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, this.w, this.h);
    } else {
      // Базовый цвет блока
      ctx.fillStyle = this.color;
      ctx.fillRect(0, 0, this.w, this.h);

      // Пиксельная обводка (Minecraft style)
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(0, 0, this.w, 3);
      ctx.fillRect(0, 0, 3, this.h);

      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(0, this.h - 3, this.w, 3);
      ctx.fillRect(this.w - 3, 0, 3, this.h);

      // Внутренний паттерн (руда/минерал)
      ctx.fillStyle = this.borderColor;
      const s = this.w / 4;
      ctx.fillRect(s, s, s, s);
      ctx.fillRect(s * 2, s * 2, s, s);

      // Специальные иконки
      if (this.explosive) {
        ctx.fillStyle = '#000';
        ctx.fillRect(4, 4, this.w - 8, this.h - 8);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(6, 6, this.w - 12, this.h - 12);
        Utils.drawPixelText(ctx, 'TNT', this.w / 2, this.h / 2 - 2, Math.max(9, this.w / 3.5), '#fff', 'center');
      } else if (this.speedBuff) {
        Utils.drawPixelText(ctx, '⬆', this.w / 2, this.h / 2 - 2, Math.max(14, this.w / 2), '#fff', 'center');
      } else if (this.isChest) {
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(6, 6, this.w - 12, this.h - 12);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(this.w / 2 - 2, this.h / 2 - 2, 4, 4);
      }
    }

    // ТРЕЩИНЫ НА БЛОКЕ ПРИ УРОНЕ (как на скриншоте)
    const hpRatio = this.hp / this.maxHp;
    if (hpRatio < 0.75 && !flash) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.w * 0.2, this.h * 0.1);
      ctx.lineTo(this.w * 0.5, this.h * 0.4);
      ctx.lineTo(this.w * 0.3, this.h * 0.8);

      if (hpRatio < 0.4) {
        ctx.moveTo(this.w * 0.8, this.h * 0.2);
        ctx.lineTo(this.w * 0.5, this.h * 0.5);
        ctx.lineTo(this.w * 0.7, this.h * 0.9);
      }
      ctx.stroke();
    }

    ctx.restore();

    // Текст HP над/внутри блока
    const hpText = Math.ceil(this.hp).toString();
    const fontSize = Math.max(9, this.w / 4);
    Utils.drawPixelText(ctx, hpText, pos.x + this.w / 2, pos.y + this.h / 2, fontSize, '#ffffff', 'center');
  }
}
  // Заменить только метод draw внутри класса Block в js/block.js
  draw(ctx, camera) {
    if (!this.alive) return;

    const shakeX = this.damageShake > 0.5 ? (Math.random() - 0.5) * this.damageShake : 0;
    const pos = camera.worldToScreen(this.x + shakeX, this.y);

    if (pos.y + this.h < -50 || pos.y > ctx.canvas.height + 50) return;

    const flash = this.flashTimer > 0;
    
    // Рисуем 3D-плитку с помощью нашей новой функции
    if (flash) {
      Utils.draw3DBlock(ctx, pos.x, pos.y, this.w, this.h, '#ffffff');
    } else {
      let blockColor = this.color;
      // Делаем цвета более похожими на скриншот
      if (this.type === 'STONE') blockColor = '#8a8a8a';
      if (this.type === 'ICE' || this.type === 'DIAMOND') blockColor = '#7dd3fc';
      
      Utils.draw3DBlock(ctx, pos.x, pos.y, this.w, this.h, blockColor);
      
      if (this.explosive) {
        ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
        ctx.strokeRect(pos.x + 4, pos.y + 4, this.w - 8, this.h - 8);
        Utils.drawPixelText(ctx, 'TNT', pos.x + this.w/2, pos.y + this.h/2, this.w/3, '#fff', 'center');
      }
    }

    // Текст HP по центру (маленьким шрифтом, как на скрине)
    if (!this.explosive) {
      const hpText = Math.ceil(this.hp).toString();
      Utils.drawPixelText(ctx, hpText, pos.x + this.w / 2, pos.y + this.h / 2, this.w / 3.5, '#ffffff', 'center');
    }
  }
