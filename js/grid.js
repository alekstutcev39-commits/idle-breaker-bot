class Grid {
  constructor(cols, totalRows, blockSize) {
    this.cols = cols;
    this.totalRows = totalRows;
    this.blockSize = blockSize;
    this.blocks = [];
    this.generate();
  }

  generate() {
    this.blocks = [];

    const blockEntries = Object.entries(CONFIG.BLOCK_TYPES).map(([key, val]) => ({
      key,
      weight: val.weight
    }));

    for (let row = 0; row < this.totalRows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (row < 2) continue;
        if (row >= this.totalRows - CONFIG.PORTAL_HEIGHT) continue;
        if (Math.random() < 0.15) continue;

        const depthMult = 1 + row * 0.15;
        const chosen = Utils.weightedRandom(blockEntries);
        const block = new Block(col, row, chosen.key, this.blockSize);
        block.maxHp = Math.ceil(block.maxHp * depthMult);
        block.hp = block.maxHp;
        block.reward = Math.ceil(block.reward * (1 + row * 0.05));

        this.blocks.push(block);
      }
    }
  }

  getBlockAt(gridX, gridY) {
    return this.blocks.find(b => b.alive && b.gridX === gridX && b.gridY === gridY);
  }

  getNeighbors(gridX, gridY, radius) {
    const neighbors = [];
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx === 0 && dy === 0) continue;
        const b = this.getBlockAt(gridX + dx, gridY + dy);
        if (b) neighbors.push(b);
      }
    }
    return neighbors;
  }

  getLowestAliveRow() {
    let maxRow = 0;
    for (const b of this.blocks) {
      if (b.alive && b.gridY > maxRow) maxRow = b.gridY;
    }
    return maxRow;
  }

  getHighestAliveRow() {
    let minRow = this.totalRows;
    for (const b of this.blocks) {
      if (b.alive && b.gridY < minRow) minRow = b.gridY;
    }
    return minRow;
  }

  getAliveBlocks() {
    return this.blocks.filter(b => b.alive);
  }

  update(dt) {
    for (const b of this.blocks) {
      if (b.alive) b.update(dt);
    }
  }

  draw(ctx, camera) {
    for (const b of this.blocks) {
      b.draw(ctx, camera);
    }
  }
}
