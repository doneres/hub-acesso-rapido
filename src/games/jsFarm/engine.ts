import { CropDef, CropId, DroneAction, FarmState, ShopItemDef, Tile, Upgrades } from './types';
import { STRUCTURE_ORDER, STRUCTURES, StructureId, createEmptyUnlocks } from './curriculum';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTES DO MOTOR
═══════════════════════════════════════════════════════════════ */
export const MIN_GRID_SIZE = 3; // mesmo mínimo do jogo original (set_farm_size)
export const MAX_GRID_SIZE = 9;

/* Ordem real do jogo original: Grama (cresce sozinha) → Arbusto (precisa plant())
   → Cenoura (precisa arar a terra com till() antes de plantar). */
export const CROPS: Record<CropId, CropDef> = {
  grama:   { id: 'grama',   name: 'Grama',   growMs: 1500,  color: '#65a30d', seedColor: '#a3e635', requiresTill: false },
  arbusto: { id: 'arbusto', name: 'Arbusto', growMs: 6000,  color: '#3f6212', seedColor: '#84cc16', requiresTill: false },
  cenoura: { id: 'cenoura', name: 'Cenoura', growMs: 12000, color: '#ea7c1e', seedColor: '#fdba74', requiresTill: true },
};

/** Quanto drone.sell() credita na conta do aluno (useGameState) por unidade vendida. */
export const SELL_RATES: Record<CropId, { coins: number; points: number }> = {
  grama:   { coins: 1, points: 1 },
  arbusto: { coins: 3, points: 2 },
  cenoura: { coins: 8, points: 5 },
};

export const BASE_ACTION_DELAY_MS = 420;
export const MIN_ACTION_DELAY_MS = 120;
export const SPEED_STEP_MS = 50;

export const SHOP_ITEMS: (ShopItemDef & { costCrop: CropId })[] = [
  {
    id: 'speed',
    name: 'Motor do drone',
    desc: 'Reduz o tempo de cada ação.',
    cost: level => Math.round(30 * 2.2 ** level),
    costCrop: 'grama',
    maxLevel: 6,
  },
  {
    id: 'arbusto',
    name: 'Sementes de arbusto',
    desc: "Desbloqueia plant('arbusto') — cresce mais devagar que a grama, vale mais.",
    cost: () => 200,
    costCrop: 'grama',
    maxLevel: 1,
  },
  {
    id: 'cenoura',
    name: 'Sementes de cenoura',
    desc: "Desbloqueia till() e plant('cenoura') — só cresce em terra arada.",
    cost: () => 300,
    costCrop: 'arbusto',
    maxLevel: 1,
  },
];

/** Custo de cada nível de expansão da fazenda (+1 no lado do grid por compra). */
export const EXPAND_LEVELS: Array<{ cost: Partial<Record<CropId, number>> }> = [
  { cost: { grama: 80 } },                       // 3x3 -> 4x4
  { cost: { grama: 150 } },                      // 4x4 -> 5x5
  { cost: { grama: 200, arbusto: 100 } },        // 5x5 -> 6x6
  { cost: { arbusto: 500, cenoura: 100 } },      // 6x6 -> 7x7
  { cost: { cenoura: 3000 } },                   // 7x7 -> 8x8
  { cost: { cenoura: 12000 } },                  // 8x8 -> 9x9
];

/* ═══════════════════════════════════════════════════════════════
   TILE HELPERS — grama replanta sozinha em terra não arada
═══════════════════════════════════════════════════════════════ */
function tileAfterClear(tilled: boolean, now: number): Tile {
  return tilled
    ? { crop: null, plantedAt: null, tilled: true }
    : { crop: 'grama', plantedAt: now, tilled: false };
}

function freshTiles(count: number, now: number): Tile[] {
  return Array.from({ length: count }, () => tileAfterClear(false, now));
}

/* ═══════════════════════════════════════════════════════════════
   ESTADO INICIAL
═══════════════════════════════════════════════════════════════ */
export function createInitialFarm(): FarmState {
  const now = Date.now();
  return {
    gridSize: MIN_GRID_SIZE,
    tiles: freshTiles(MIN_GRID_SIZE * MIN_GRID_SIZE, now),
    drone: { x: 0, y: 0 },
    stock: { grama: 0, arbusto: 0, cenoura: 0 },
    upgrades: { speed: 0, arbusto: 0, cenoura: 0, expand: 0 },
    unlocks: createEmptyUnlocks(),
  };
}

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
export function tileIndex(state: FarmState, x: number, y: number): number {
  return y * state.gridSize + x;
}

export function isCropReady(tile: Tile, now: number): boolean {
  if (!tile.crop || tile.plantedAt === null) return false;
  return now - tile.plantedAt >= CROPS[tile.crop].growMs;
}

export function actionDelayMs(upgrades: Upgrades): number {
  return Math.max(MIN_ACTION_DELAY_MS, BASE_ACTION_DELAY_MS - upgrades.speed * SPEED_STEP_MS);
}

export function shopItemLevel(state: FarmState, id: string): number {
  if (id === 'speed') return state.upgrades.speed;
  if (id === 'arbusto') return state.upgrades.arbusto;
  if (id === 'cenoura') return state.upgrades.cenoura;
  return 0;
}

export function buyShopItem(state: FarmState, id: string): { state: FarmState; ok: boolean } {
  const def = SHOP_ITEMS.find(s => s.id === id);
  if (!def) return { state, ok: false };
  const level = shopItemLevel(state, id);
  if (level >= def.maxLevel) return { state, ok: false };
  const cost = def.cost(level);
  if (state.stock[def.costCrop] < cost) return { state, ok: false };
  const upgrades: Upgrades = { ...state.upgrades };
  if (id === 'speed') upgrades.speed = level + 1;
  if (id === 'arbusto') upgrades.arbusto = level + 1;
  if (id === 'cenoura') upgrades.cenoura = level + 1;
  const stock = { ...state.stock, [def.costCrop]: state.stock[def.costCrop] - cost };
  return { state: { ...state, stock, upgrades }, ok: true };
}

/* ═══════════════════════════════════════════════════════════════
   EXPANSÃO DA FAZENDA — compra que aumenta o grid, igual ao
   set_farm_size()/"Expand" do jogo original (e também limpa a
   fazenda ao expandir, como lá).
═══════════════════════════════════════════════════════════════ */
export function canBuyExpand(state: FarmState): { allowed: boolean; reason?: string } {
  const level = state.upgrades.expand;
  if (level >= EXPAND_LEVELS.length) return { allowed: false, reason: 'tamanho máximo' };
  const cost = EXPAND_LEVELS[level].cost;
  const missing = (Object.keys(cost) as CropId[]).find(c => state.stock[c] < (cost[c] ?? 0));
  if (missing) return { allowed: false, reason: 'colheita insuficiente' };
  return { allowed: true };
}

export function buyExpand(state: FarmState): { state: FarmState; ok: boolean } {
  if (!canBuyExpand(state).allowed) return { state, ok: false };
  const level = state.upgrades.expand;
  const cost = EXPAND_LEVELS[level].cost;
  const stock = { ...state.stock };
  (Object.keys(cost) as CropId[]).forEach(c => { stock[c] -= cost[c] ?? 0; });
  const gridSize = state.gridSize + 1;
  const now = Date.now();
  return {
    state: {
      ...state,
      stock,
      gridSize,
      tiles: freshTiles(gridSize * gridSize, now),
      drone: { x: 0, y: 0 },
      upgrades: { ...state.upgrades, expand: level + 1 },
    },
    ok: true,
  };
}

/* ═══════════════════════════════════════════════════════════════
   ESTRUTURAS DE PROGRAMAÇÃO (árvore sequencial, ver curriculum.ts)
   Custo pago diretamente em colheita — sem moeda abstrata, igual
   ao jogo original (Loop=Feno, Variáveis=Cenoura, etc).
═══════════════════════════════════════════════════════════════ */
export function canBuyStructure(state: FarmState, id: StructureId): { allowed: boolean; reason?: string } {
  if (state.unlocks[id]) return { allowed: false, reason: 'já comprado' };
  const idx = STRUCTURE_ORDER.indexOf(id);
  const prereq = STRUCTURE_ORDER[idx - 1];
  if (prereq && !state.unlocks[prereq]) return { allowed: false, reason: `compre "${STRUCTURES[prereq].name}" primeiro` };
  const cost = STRUCTURES[id].cost;
  const missing = (Object.keys(cost) as CropId[]).find(c => state.stock[c] < (cost[c] ?? 0));
  if (missing) return { allowed: false, reason: 'colheita insuficiente' };
  return { allowed: true };
}

export function buyStructure(state: FarmState, id: StructureId): { state: FarmState; ok: boolean } {
  if (!canBuyStructure(state, id).allowed) return { state, ok: false };
  const cost = STRUCTURES[id].cost;
  const stock = { ...state.stock };
  (Object.keys(cost) as CropId[]).forEach(c => { stock[c] -= cost[c] ?? 0; });
  return {
    state: { ...state, stock, unlocks: { ...state.unlocks, [id]: true } },
    ok: true,
  };
}

/* ═══════════════════════════════════════════════════════════════
   APLICAÇÃO DE AÇÕES DO DRONE (pura)
═══════════════════════════════════════════════════════════════ */
export interface ActionResult {
  state: FarmState;
  value: unknown;
}

export function applyAction(state: FarmState, action: DroneAction, now: number): ActionResult {
  switch (action.kind) {
    case 'move': {
      const size = state.gridSize;
      let { x, y } = state.drone;
      if (action.dir === 'up') y -= 1;
      if (action.dir === 'down') y += 1;
      if (action.dir === 'left') x -= 1;
      if (action.dir === 'right') x += 1;
      // O mapa é um toroide: sair de um lado reaparece do outro, igual ao jogo original.
      x = (x + size) % size;
      y = (y + size) % size;
      return { state: { ...state, drone: { x, y } }, value: true };
    }
    case 'plant': {
      const crop: CropId = action.crop === 'arbusto' ? 'arbusto' : action.crop === 'cenoura' ? 'cenoura' : 'grama';
      const idx = tileIndex(state, state.drone.x, state.drone.y);
      const tile = state.tiles[idx];
      // Grama é "livre" — dá pra plantar outra cultura por cima dela. Arbusto/cenoura
      // cultivados protegem a casa até serem colhidos.
      if (tile.crop !== null && tile.crop !== 'grama') return { state, value: false };
      if (crop === 'arbusto' && state.upgrades.arbusto < 1) return { state, value: false };
      if (crop === 'cenoura') {
        if (state.upgrades.cenoura < 1) return { state, value: false };
        if (!tile.tilled) return { state, value: false }; // precisa arar antes (till())
      }
      const tiles = state.tiles.slice();
      tiles[idx] = { crop, plantedAt: now, tilled: tile.tilled };
      return { state: { ...state, tiles }, value: true };
    }
    case 'till': {
      // Ara/desara a terra — funciona em casa vazia OU com grama (que é "livre",
      // igual no plant()); arbusto/cenoura cultivados protegem a casa até colher.
      // Terra arada não deixa a grama crescer sozinha, liberando espaço pra cenoura.
      const idx = tileIndex(state, state.drone.x, state.drone.y);
      const tile = state.tiles[idx];
      if (tile.crop !== null && tile.crop !== 'grama') return { state, value: false };
      const tiles = state.tiles.slice();
      tiles[idx] = tileAfterClear(!tile.tilled, now);
      return { state: { ...state, tiles }, value: true };
    }
    case 'harvest': {
      // Exato, igual ao jogo original: se não estiver madura, falha na hora — não espera.
      const idx = tileIndex(state, state.drone.x, state.drone.y);
      const tile = state.tiles[idx];
      if (!isCropReady(tile, now)) return { state, value: 0 };
      const crop = tile.crop as CropId;
      const tiles = state.tiles.slice();
      tiles[idx] = tileAfterClear(tile.tilled, now);
      const stock = { ...state.stock, [crop]: state.stock[crop] + 1 };
      return { state: { ...state, tiles, stock }, value: 1 };
    }
    case 'canHarvest': {
      // Leitura pura, não muda o estado — resolvida na página com custo de tempo ~0.
      const idx = tileIndex(state, state.drone.x, state.drone.y);
      return { state, value: isCropReady(state.tiles[idx], now) };
    }
    case 'home': {
      return { state: { ...state, drone: { x: 0, y: 0 } }, value: true };
    }
    case 'clear': {
      const tiles = state.tiles.map(t => tileAfterClear(t.tilled, now));
      return { state: { ...state, tiles, drone: { x: 0, y: 0 } }, value: true };
    }
    case 'sell': {
      // drone.sell() é resolvido na página (precisa creditar na conta do aluno) — este
      // caso nunca é chamado de fato, existe só pra manter applyAction total/tipado.
      return { state, value: 0 };
    }
  }
}
