class Portal {
  constructor(cols, totalRows, blockSize) {
    this.blockSize = blockSize;
    this.x = (cols * blockSize) / 2;
    this.y = 120; // Расположение вверху экрана
    this.radius = 70;
    this.angle = 0;
  }

  update(dt) {
    this.angle += dt * 1.5;
  }

  containsPickaxe(pickaxe) {
    const dx = pickaxe.x - this.x;
    const dy = pickaxe.y - this.y;
    return (dx * dx + dy * dy) < (this.radius * this.radius);
  }

  draw(ctx, camera) {
    const pos = camera.worldToScreen(this.x, this.y);

    ctx.save();
    ctx.translate(pos.x, pos.y);

    // Внутренняя фиолетовая воронка
    const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, this.radius);
    grad.addColorStop(0, '#f0abfc');
    grad.addColorStop(0.5, '#581c87');
    grad.addColorStop(1, '#0f051d');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Обсидиановое внешнее кольцо с рунами (как на скриншоте)
    ctx.rotate(this.angle);
    ctx.strokeStyle = '#3b0764';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 4;
    ctx.strokeRect(-this.radius - 10, -10, 20, 20);
    ctx.strokeRect(this.radius - 10, -10, 20, 20);

    ctx.restore();
  }
}
