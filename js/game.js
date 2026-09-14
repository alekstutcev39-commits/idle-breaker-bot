class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.coins = 78800.00; // Старт как на скрине
    this.pickaxeCount = 3;

    this.blockSize = Math.floor(this.canvas.width / CONFIG.GRID_COLS);
    CONFIG.BLOCK_SIZE = this.blockSize;

    this.camera = new Camera();
    this.grid = new Grid(CONFIG.GRID_COLS, CONFIG.GRID_TOTAL_ROWS, this.blockSize);
    this.portal = new Portal(CONFIG.GRID_COLS, CONFIG.GRID_TOTAL_ROWS, this.blockSize);

    this.pickaxes = [];
    this.particles = [];

    this.initPickaxes();
    this.setupUI();

    this.lastTime = performance.now();
    this.gameLoop = this.gameLoop.bind(this);
    requestAnimationFrame(this.gameLoop);
  }

  resize() {
    const container = document.getElementById('game-container');
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight - 220; // Минус панель
  }

  initPickaxes() {
    this.pickaxes = [];
    for (let i = 0; i < this.pickaxeCount; i++) {
      const p = new Pickaxe(this.canvas.width / 2 + (i - 1) * 20, 180, this.blockSize);
      this.pickaxes.push(p);
    }
  }

  setupUI() {
    const btnPlus = document.getElementById('btn-plus');
    const btnMinus = document.getElementById('btn-minus');
    const countVal = document.getElementById('pickaxe-count-val');

    if (btnPlus) {
      btnPlus.addEventListener('click', () => {
        if (this.pickaxeCount < 10) {
          this.pickaxeCount++;
          countVal.innerText = this.pickaxeCount;
          this.initPickaxes();
        }
      });
    }

    if (btnMinus) {
      btnMinus.addEventListener('click', () => {
        if (this.pickaxeCount > 1) {
          this.pickaxeCount--;
          countVal.innerText = this.pickaxeCount;
          this.initPickaxes();
        }
      });
    }
  }

  drawBackground() {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;

    // Адский темный фон с лавовым свечением по бокам
    ctx.fillStyle = '#0f081d';
    ctx.fillRect(0, 0, W, H);

    // Колонны по бокам
    ctx.fillStyle = '#1c102b';
    ctx.fillRect(0, 0, 15, H);
    ctx.fillRect(W - 15, 0, 15, H);
  }

  gameLoop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    requestAnimationFrame(this.gameLoop);
  }

  update(dt) {
    Utils.updateShake(dt);
    this.grid.update(dt);
    this.portal.update(dt);

    for (const p of this.pickaxes) {
      p.update(dt, this.canvas.width, CONFIG.GRID_TOTAL_ROWS * this.blockSize);
    }

    // Столкновения
    const aliveBlocks = this.grid.getAliveBlocks();
    for (const pickaxe of this.pickaxes) {
      for (const block of aliveBlocks) {
        if (!block.alive) continue;
        if (Utils.circleRectCollision(pickaxe.x, pickaxe.y, pickaxe.radius, block.x, block.y, block.w, block.h)) {
          pickaxe.bounceOffBlock(block);
          const destroyed = block.takeDamage(pickaxe.damage);
          if (destroyed) {
            this.coins += block.reward;
            document.getElementById('val-balance').innerText = this.coins.toLocaleString('en-US', {minimumFractionDigits: 2});
          }
          break;
        }
      }
    }

    // Камера
    const highestRow = this.grid.getHighestAliveRow();
    const targetY = Math.max(0, (highestRow - 2) * this.blockSize);
    this.camera.follow(targetY);
    this.camera.update(dt);
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawBackground();
    this.portal.draw(ctx, this.camera);
    this.grid.draw(ctx, this.camera);

    for (const p of this.pickaxes) {
      p.draw(ctx, this.camera);
    }
  }
}

window.addEventListener('load', () => {
  if (window.Telegram && Telegram.WebApp) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
  }
  new Game();
});
