class HUD {
  constructor() {
    this.displayCoins = 0;
  }

  update(dt, coins) {
    this.displayCoins = Utils.lerp(this.displayCoins, coins, 0.1);
    if (Math.abs(this.displayCoins - coins) < 1) this.displayCoins = coins;
  }

  draw(ctx, gameState) {
    const W = ctx.canvas.width;
    const H = ctx.canvas.height;

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(10, H - 50, 160, 40, 8);
    else ctx.rect(10, H - 50, 160, 40);
    ctx.fill();

    Utils.drawPixelText(ctx, '💰 ' + Utils.formatNumber(Math.floor(this.displayCoins)), 20, H - 30, 18, '#ffd700', 'left');

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(W - 120, 10, 110, 30, 8);
    else ctx.rect(W - 120, 10, 110, 30);
    ctx.fill();
    Utils.drawPixelText(ctx, '⛏️ ' + gameState.depth + 'м', W - 110, 25, 14, '#aaa', 'left');

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(10, 10, 90, 30, 8);
    else ctx.rect(10, 10, 90, 30);
    ctx.fill();
    Utils.drawPixelText(ctx, '⛏️×' + gameState.pickaxeCount, 20, 25, 14, '#8be9fd', 'left');

    if (gameState.blocksTotal > 0) {
      const progress = 1 - (gameState.blocksAlive / gameState.blocksTotal);
      const barW = W - 20;
      const barH = 6;
      const barX = 10;
      const barY = H - 60;

      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = '#6a5acd';
      ctx.fillRect(barX, barY, barW * progress, barH);
    }
  }

  drawLevelComplete(ctx, totalCoins) {
    const W = ctx.canvas.width;
    const H = ctx.canvas.height;

    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, W, H);

    Utils.drawPixelText(ctx, '🎉 УРОВЕНЬ ПРОЙДЕН! 🎉', W / 2, H / 2 - 40, 20, '#ffd700', 'center');
    Utils.drawPixelText(ctx, '💰 ' + Utils.formatNumber(totalCoins) + ' монет', W / 2, H / 2 + 10, 24, '#fff', 'center');
    Utils.drawPixelText(ctx, 'Нажмите чтобы продолжить', W / 2, H / 2 + 60, 12, '#aaa', 'center');
  }
}
