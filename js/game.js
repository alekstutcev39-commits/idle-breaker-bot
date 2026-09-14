class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.coins = 0;
    this.totalCoinsEarned = 0;
    this.blocksDestroyed = 0;
    this.upgradeLevels = { damage: 0, speed: 0, luck: 0 };
    this.pickaxesBought = 0;
    this.levelComplete = false;
    this.levelCompleteTimer = 0;

    this.blockSize = Math.floor(this.canvas.width / CONFIG.GRID_COLS);
    CONFIG.BLOCK_SIZE = this.blockSize;
    CONFIG.PICKAXE_RADIUS = Math.max(8, this.blockSize * 0.2);

    this.camera = new Camera();
    this.grid = new Grid(CONFIG.GRID_COLS, CONFIG.GRID_TOTAL_ROWS, this.blockSize);
    this.portal = new Portal(CONFIG.GRID_COLS, CONFIG.GRID_TOTAL_ROWS, this.blockSize);
    this.hud = new HUD();

    this.pickaxes = [];
    this.particles = [];

    for (let i = 0; i < CONFIG.INITIAL_PICKAXES; i++) {
      this.spawnPickaxe();
    }

    this.setupUI();
    this.loadGame();

    this.lastTime = performance.now();
    this.gameLoop = this.gameLoop.bind(this);
    requestAnimationFrame(this.gameLoop);
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setupUI() {
    const btnUpgrade = document.getElementById('btn-upgrade');
    const upgradePanel = document.getElementById('upgrade-panel');
    const closePanel = document.getElementById('close-panel');
    const btnAddPickaxe = document.getElementById('btn-add-pickaxe');

    if (btnUpgrade) {
      btnUpgrade.addEventListener('click', () => {
        upgradePanel.classList.toggle('hidden');
        this.renderUpgradePanel();
      });
    }

    if (closePanel) {
      closePanel.addEventListener('click', () => {
        upgradePanel.classList.add('hidden');
      });
    }

    if (btnAddPickaxe) {
      btnAddPickaxe.addEventListener('click', () => {
        this.buyPickaxe();
      });
    }

    this.canvas.addEventListener('click', () => {
      if (this.levelComplete && this.levelCompleteTimer > 1) {
        this.nextLevel();
      }
    });
  }

  renderUpgradePanel() {
    const list = document.getElementById('upgrade-list');
    if (!list) return;
    list.innerHTML = '';

    for (const [key, upg] of Object.entries(CONFIG.UPGRADES)) {
      const level = this.upgradeLevels[key];
      const cost = Math.floor(upg.baseCost * Math.pow(upg.costMult, level));
      const canBuy = this.coins >= cost && level < upg.maxLevel;
      const effectVal = upg.effect(level);
      const nextEffectVal = upg.effect(level + 1);

      const item = document.createElement('div');
      item.className = 'upgrade-item';
      item.innerHTML = `
        <div class="info">
          <div class="name">${upg.name} (Ур. ${level})</div>
          <div class="desc">${upg.desc} (×${effectVal.toFixed(1)} → ×${nextEffectVal.toFixed(1)})</div>
        </div>
        <button class="btn-buy" ${canBuy ? '' : 'disabled'}>
          💰${Utils.formatNumber(cost)}
        </button>
      `;

      const btn = item.querySelector('.btn-buy');
      btn.addEventListener('click', () => {
        if (this.coins >= cost && level < upg.maxLevel) {
          this.coins -= cost;
          this.upgradeLevels[key]++;
          this.applyUpgradesToPickaxes();
          this.renderUpgradePanel();
          this.saveGame();
        }
      });

      list.appendChild(item);
    }
  }

  applyUpgradesToPickaxes() {
    const damageMult = CONFIG.UPGRADES.damage.effect(this.upgradeLevels.damage);
    for (const p of this.pickaxes) {
      p.baseDamage = CONFIG.PICKAXE_BASE_DAMAGE * damageMult;
    }
  }

  spawnPickaxe() {
    const x = Utils.randomRange(this.blockSize, this.canvas.width - this.blockSize);
    const y = this.camera.y + this.blockSize * 0.5;
    const p = new Pickaxe(x, y, this.blockSize);

    const damageMult = CONFIG.UPGRADES.damage.effect(this.upgradeLevels.damage);
    p.baseDamage = CONFIG.PICKAXE_BASE_DAMAGE * damageMult;

    this.pickaxes.push(p);
  }

  buyPickaxe() {
    const cost = Math.floor(CONFIG.NEW_PICKAXE_BASE_COST * Math.pow(CONFIG.NEW_PICKAXE_COST_MULT, this.pickaxesBought));
    if (this.coins >= cost) {
      this.coins -= cost;
      this.pickaxesBought++;
      this.spawnPickaxe();
      this.saveGame();

      if (window.Telegram && Telegram.WebApp && Telegram.WebApp.HapticFeedback) {
        Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      }
    }
  }

  handleCollisions() {
    const aliveBlocks = this.grid.getAliveBlocks();
    const speedMult = CONFIG.UPGRADES.speed.effect(this.upgradeLevels.speed);
    const luckMult = CONFIG.UPGRADES.luck.effect(this.upgradeLevels.luck);

    for (const pickaxe of this.pickaxes) {
      if (!pickaxe.alive) continue;

      for (const block of aliveBlocks) {
        if (!block.alive) continue;

        if (Utils.circleRectCollision(
          pickaxe.x, pickaxe.y, pickaxe.radius,
          block.x, block.y, block.w, block.h
        )) {
          pickaxe.bounceOffBlock(block);

          pickaxe.vx *= (1 + (speedMult - 1) * 0.1);
          pickaxe.vy *= (1 + (speedMult - 1) * 0.1);

          const speed = Math.sqrt(pickaxe.vx * pickaxe.vx + pickaxe.vy * pickaxe.vy);
          if (speed > CONFIG.MAX_SPEED) {
            pickaxe.vx = (pickaxe.vx / speed) * CONFIG.MAX_SPEED;
            pickaxe.vy = (pickaxe.vy / speed) * CONFIG.MAX_SPEED;
          }

          const damage = pickaxe.damage;
          const destroyed = block.takeDamage(damage);

          this.particles.push(new Particle(
            block.x + block.w / 2,
            block.y,
            '-' + Math.floor(damage),
            '#ff4444',
            10, 0.6, -80
          ));

          if (destroyed) {
            this.onBlockDestroyed(block, luckMult);
          }

          pickaxe.hp -= 1;
          if (pickaxe.hp <= 0) {
            pickaxe.alive = false;
            setTimeout(() => {
              pickaxe.hp = pickaxe.maxHp;
              pickaxe.alive = true;
              pickaxe.x = Utils.randomRange(this.blockSize, this.canvas.width - this.blockSize);
              pickaxe.y = this.camera.y + this.blockSize;
              pickaxe.vy = 0;
            }, 3000);
          }

          break;
        }
      }

      if (this.portal.containsPickaxe(pickaxe) && !pickaxe.absorbed) {
        pickaxe.absorbed = true;
        pickaxe.alive = false;

        this.particles.push(new Particle(
          pickaxe.x, pickaxe.y,
          '✨', '#bb88ff', 16, 1.0, -40
        ));
      }
    }
  }

  onBlockDestroyed(block, luckMult) {
    this.blocksDestroyed++;
    const reward = Math.ceil(block.reward * luckMult);
    this.coins += reward;
    this.totalCoinsEarned += reward;

    this.particles.push(new Particle(
      block.x + block.w / 2,
      block.y + block.h / 2,
      '+' + reward + '💰',
      '#ffd700',
      12, 1.0, -60
    ));

    if (window.Telegram && Telegram.WebApp && Telegram.WebApp.HapticFeedback) {
      Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }

    if (block.explosive) {
      this.explodeTNT(block);
    }

    if (block.speedBuff) {
      for (const p of this.pickaxes) {
        if (p.alive) p.applySpeedBuff();
      }
      this.particles.push(new Particle(
        block.x + block.w / 2, block.y,
        '⚡ SPEED UP! ⚡', '#3498db', 14, 1.5, -80
      ));
    }

    if (block.isChest) {
      const alive = this.pickaxes.filter(p => p.alive);
      if (alive.length > 0) {
        const lucky = alive[Utils.randomInt(0, alive.length - 1)];
        lucky.upgrade();
        this.particles.push(new Particle(
          block.x + block.w / 2, block.y,
          '⬆ UPGRADE! ⬆', '#f39c12', 14, 1.5, -90
        ));
      }
    }

    if (block.isMonster) {
      for (let i = 0; i < 5; i++) {
        this.particles.push(new ExplosionParticle(
          block.x + block.w / 2,
          block.y + block.h / 2
        ));
      }
      this.particles.push(new Particle(
        block.x + block.w / 2, block.y,
        '💀 SLAIN! 💀', '#ff6b6b', 14, 1.5, -80
      ));
    }

    for (let i = 0; i < 4; i++) {
      this.particles.push(new ExplosionParticle(
        block.x + Math.random() * block.w,
        block.y + Math.random() * block.h
      ));
    }
  }

  explodeTNT(tntBlock) {
    Utils.triggerShake(8, 0.4);

    if (window.Telegram && Telegram.WebApp && Telegram.WebApp.HapticFeedback) {
      Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
    }

    const luckMult = CONFIG.UPGRADES.luck.effect(this.upgradeLevels.luck);
    const neighbors = this.grid.getNeighbors(
      tntBlock.gridX, tntBlock.gridY,
      tntBlock.explosionRadius
    );

    for (const nb of neighbors) {
      const explosionDamage = tntBlock.maxHp * 3;
      const destroyed = nb.takeDamage(explosionDamage);
      if (destroyed) {
        this.onBlockDestroyed(nb, luckMult);
      }
    }

    for (let i = 0; i < 20; i++) {
      this.particles.push(new ExplosionParticle(
        tntBlock.x + tntBlock.w / 2,
        tntBlock.y + tntBlock.h / 2
      ));
    }

    this.particles.push(new Particle(
      tntBlock.x + tntBlock.w / 2,
      tntBlock.y,
      '💥 BOOM! 💥',
      '#ff4444',
      18, 1.2, -100
    ));
  }

  updateCamera() {
    const highestRow = this.grid.getHighestAliveRow();
    const targetY = Math.max(0, (highestRow - 2) * this.blockSize);
    this.camera.follow(targetY);
  }

  checkLevelComplete() {
    const aliveBlocks = this.grid.getAliveBlocks();
    if (aliveBlocks.length === 0 && !this.levelComplete) {
      this.levelComplete = true;
      this.levelCompleteTimer = 0;

      if (window.Telegram && Telegram.WebApp && Telegram.WebApp.HapticFeedback) {
        Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
    }
  }

  nextLevel() {
    if (window.Telegram && Telegram.WebApp) {
      try {
        Telegram.WebApp.sendData(JSON.stringify({
          coins: this.totalCoinsEarned,
          blocksDestroyed: this.blocksDestroyed,
          depth: CONFIG.GRID_TOTAL_ROWS
        }));
      } catch (e) {}
    }

    CONFIG.GRID_TOTAL_ROWS += 10;
    this.levelComplete = false;
    this.levelCompleteTimer = 0;
    this.blocksDestroyed = 0;

    this.grid = new Grid(CONFIG.GRID_COLS, CONFIG.GRID_TOTAL_ROWS, this.blockSize);
    this.portal = new Portal(CONFIG.GRID_COLS, CONFIG.GRID_TOTAL_ROWS, this.blockSize);
    this.camera.y = 0;
    this.camera.targetY = 0;

    for (const p of this.pickaxes) {
      p.alive = true;
      p.absorbed = false;
      p.hp = p.maxHp;
      p.x = Utils.randomRange(this.blockSize, this.canvas.width - this.blockSize);
      p.y = this.blockSize;
      p.vy = 0;
    }

    this.particles = [];
    this.saveGame();
  }

  saveGame() {
    const save = {
      coins: this.coins,
      totalCoinsEarned: this.totalCoinsEarned,
      upgradeLevels: this.upgradeLevels,
      pickaxesBought: this.pickaxesBought,
      pickaxeCount: this.pickaxes.length,
      pickaxeLevels: this.pickaxes.map(p => p.level)
    };
    try {
      localStorage.setItem('idleBreaker_save', JSON.stringify(save));
    } catch (e) {}
  }

  loadGame() {
    try {
      const raw = localStorage.getItem('idleBreaker_save');
      if (!raw) return;
      const save = JSON.parse(raw);

      this.coins = save.coins || 0;
      this.totalCoinsEarned = save.totalCoinsEarned || 0;
      this.upgradeLevels = save.upgradeLevels || { damage: 0, speed: 0, luck: 0 };
      this.pickaxesBought = save.pickaxesBought || 0;

      const targetCount = save.pickaxeCount || CONFIG.INITIAL_PICKAXES;
      while (this.pickaxes.length < targetCount) {
        this.spawnPickaxe();
      }

      if (save.pickaxeLevels) {
        for (let i = 0; i < this.pickaxes.length && i < save.pickaxeLevels.length; i++) {
          const lvl = save.pickaxeLevels[i];
          while (this.pickaxes[i].level < lvl) {
            this.pickaxes[i].upgrade();
          }
        }
      }

      this.applyUpgradesToPickaxes();
    } catch (e) {}
  }

  drawBackground() {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;

    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, '#2c2c3e');
    gradient.addColorStop(0.5, '#1a1a2e');
    gradient.addColorStop(1, '#0d0d1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
  }

  gameLoop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    requestAnimationFrame(this.gameLoop);
  }

  update(dt) {
    if (this.levelComplete) {
      this.levelCompleteTimer += dt;
      return;
    }

    Utils.updateShake(dt);
    this.grid.update(dt);

    const worldHeight = CONFIG.GRID_TOTAL_ROWS * this.blockSize;
    for (const p of this.pickaxes) {
      p.update(dt, this.canvas.width, worldHeight);
    }

    this.handleCollisions();

    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(dt);
      if (!this.particles[i].alive) {
        this.particles.splice(i, 1);
      }
    }

    this.portal.update(dt);
    this.updateCamera();
    this.camera.update(dt);

    this.checkLevelComplete();
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawBackground();
    this.grid.draw(ctx, this.camera);
    this.portal.draw(ctx, this.camera);

    for (const p of this.pickaxes) {
      p.draw(ctx, this.camera);
    }

    for (const p of this.particles) {
      p.draw(ctx, this.camera);
    }

    const gameState = {
      depth: Math.floor(this.camera.y / this.blockSize),
      pickaxeCount: this.pickaxes.filter(p => p.alive).length,
      blocksAlive: this.grid.getAliveBlocks().length,
      blocksTotal: this.grid.blocks.length
    };
    this.hud.update(1 / 60, this.coins);
    this.hud.draw(ctx, gameState);

    if (this.levelComplete) {
      this.hud.drawLevelComplete(ctx, this.totalCoinsEarned);
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
