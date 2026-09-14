const CONFIG = {
  GRID_COLS: 8,
  GRID_VISIBLE_ROWS: 12,
  GRID_TOTAL_ROWS: 60,
  BLOCK_SIZE: 0,

  PICKAXE_RADIUS: 12,
  PICKAXE_BASE_SPEED: 180,
  PICKAXE_BASE_DAMAGE: 10,
  GRAVITY: 120,
  BOUNCE_DAMPING: 0.85,
  MIN_SPEED: 60,
  MAX_SPEED: 400,

  BLOCK_TYPES: {
    STONE:    { name: 'Камень',    color: '#888888', borderColor: '#666666', hp: 30,  reward: 5,   weight: 40 },
    IRON:     { name: 'Железо',    color: '#d4a574', borderColor: '#b8956a', hp: 60,  reward: 15,  weight: 25 },
    AMETHYST: { name: 'Аметист',   color: '#9b59b6', borderColor: '#7d3c98', hp: 120, reward: 40,  weight: 15 },
    EMERALD:  { name: 'Изумруд',   color: '#2ecc71', borderColor: '#27ae60', hp: 200, reward: 100, weight: 8 },
    TNT:      { name: 'TNT',       color: '#e74c3c', borderColor: '#c0392b', hp: 40,  reward: 10,  weight: 5, explosive: true, explosionRadius: 1 },
    CHEST:    { name: 'Сундук',    color: '#f39c12', borderColor: '#e67e22', hp: 50,  reward: 200, weight: 3, isChest: true },
    SPEED_UP: { name: 'Ускорение', color: '#3498db', borderColor: '#2980b9', hp: 25,  reward: 5,   weight: 2, speedBuff: true },
    SLIME:    { name: 'Слизень',   color: '#a8e6a3', borderColor: '#6abf69', hp: 150, reward: 80,  weight: 2, isMonster: true },
  },

  INITIAL_PICKAXES: 3,
  NEW_PICKAXE_BASE_COST: 100,
  NEW_PICKAXE_COST_MULT: 2.5,

  UPGRADES: {
    damage: {
      name: 'Урон кирки',
      desc: 'Увеличивает урон всех кирок',
      baseCost: 50,
      costMult: 1.8,
      effect: (level) => 1 + level * 0.5,
      maxLevel: 50
    },
    speed: {
      name: 'Скорость кирки',
      desc: 'Увеличивает скорость полёта',
      baseCost: 40,
      costMult: 1.6,
      effect: (level) => 1 + level * 0.2,
      maxLevel: 30
    },
    luck: {
      name: 'Удача',
      desc: 'Увеличивает заработок с блоков',
      baseCost: 80,
      costMult: 2.0,
      effect: (level) => 1 + level * 0.3,
      maxLevel: 30
    }
  },

  PICKAXE_TIERS: [
    { name: 'Деревянная',  color: '#8B6914', minLevel: 0 },
    { name: 'Каменная',    color: '#999999', minLevel: 3 },
    { name: 'Железная',    color: '#CCCCCC', minLevel: 6 },
    { name: 'Золотая',     color: '#FFD700', minLevel: 10 },
    { name: 'Алмазная',    color: '#00FFFF', minLevel: 15 },
    { name: 'Незеритовая', color: '#4A0A2E', minLevel: 25 },
  ],

  PORTAL_HEIGHT: 2,
  CAMERA_SMOOTH: 0.05,
};
