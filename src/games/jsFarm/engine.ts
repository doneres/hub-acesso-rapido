import { CropDef, CropId, DroneAction, FarmState, ItemId, ShopItemDef, Tile, Upgrades } from './types';
import { STRUCTURE_ORDER, STRUCTURES, StructureId, createEmptyUnlocks } from './curriculum';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTES DO MOTOR
═══════════════════════════════════════════════════════════════ */
export const MIN_GRID_SIZE = 3; // mesmo mínimo do jogo original (set_farm_size)
export const MAX_GRID_SIZE = 9;

/* Ordem real do jogo original: Grama (cresce sozinha) → Arbusto (precisa plant())
   → Cenoura (precisa arar a terra com till() antes de plantar). As 4 culturas
   seguintes (Árvore/Girassol/Abóbora/Cacto) cada uma quebra a estratégia da
   anterior: loop cego que ignorava posição/estado passa a se dar mal. */
export const CROPS: Record<CropId, CropDef> = {
  grama:    { id: 'grama',    name: 'Grama',    growMs: 1500,  color: '#65a30d', seedColor: '#a3e635', requiresTill: false },
  arbusto:  { id: 'arbusto',  name: 'Arbusto',  growMs: 6000,  color: '#3f6212', seedColor: '#84cc16', requiresTill: false },
  cenoura:  { id: 'cenoura',  name: 'Cenoura',  growMs: 12000, color: '#ea7c1e', seedColor: '#fdba74', requiresTill: true },
  arvore:   { id: 'arvore',   name: 'Árvore',   growMs: 10000, color: '#365314', seedColor: '#84cc16', requiresTill: false },
  girassol: { id: 'girassol', name: 'Girassol', growMs: 5000,  color: '#eab308', seedColor: '#fde047', requiresTill: false },
  abobora:  { id: 'abobora',  name: 'Abóbora',  growMs: 9000,  color: '#c2410c', seedColor: '#fdba74', requiresTill: false },
  cacto:    { id: 'cacto',    name: 'Cacto',    growMs: 7000,  color: '#166534', seedColor: '#86efac', requiresTill: false },
};

/** Item que cada entidade rende ao ser colhida — igual ao jogo original,
 *  onde a entidade plantada (Grass/Bush/Carrot) não tem o mesmo nome do
 *  item colhido (Hay/Wood/Carrot). Árvore também rende Madeira — igual Bush
 *  e Tree renderem os dois Wood no jogo original. */
export const CROP_TO_ITEM: Record<CropId, ItemId> = {
  grama: 'feno',
  arbusto: 'madeira',
  cenoura: 'cenoura',
  arvore: 'madeira',
  girassol: 'oleo',
  abobora: 'abobora',
  cacto: 'fibra',
};

export const ITEM_NAMES: Record<ItemId, string> = {
  feno: 'Feno',
  madeira: 'Madeira',
  cenoura: 'Cenoura',
  oleo: 'Óleo',
  abobora: 'Abóbora',
  fibra: 'Fibra',
};

/** Quanto drone.sell() credita na conta do aluno (useGameState) por unidade vendida. */
export const SELL_RATES: Record<ItemId, { coins: number; points: number }> = {
  feno:    { coins: 1,  points: 1 },
  madeira: { coins: 3,  points: 2 },
  cenoura: { coins: 8,  points: 5 },
  oleo:    { coins: 5,  points: 3 },
  abobora: { coins: 12, points: 8 },
  fibra:   { coins: 6,  points: 4 },
};

/** Bloco N×N que precisa amadurecer DENTRO da mesma janela de tempo pra virar
 *  "mega-abóbora" — as 4 têm que ser plantadas em sequência próxima de verdade
 *  (não só esperar todas ficarem prontas, não importa quando plantadas: se o
 *  intervalo entre o plantio da primeira e da última passar da janela, o bloco
 *  nunca sincroniza, mesmo que todas acabem maduras ao mesmo tempo depois).
 *  Colher com o bloco sincronizado colhe as 4 casas de uma vez, cada uma com
 *  o bônus — colher fora de sincronia rende só a casa atual, valor normal. */
export const ABOBORA_BLOCK = 2;
export const ABOBORA_BLOCK_BONUS = 5;
export const ABOBORA_SYNC_WINDOW_MS = 4000;

/** Tamanho de valor sorteado ao plantar girassol/cacto (drone.info().value). */
export const GIRASSOL_VALUE_RANGE: [number, number] = [1, 5];
export const CACTO_VALUE_RANGE: [number, number] = [1, 10];
/** Colher o girassol de MAIOR valor entre os prontos agora em toda a fazenda
 *  rende esse bônus — colher o primeiro que aparecer, sem comparar, raramente
 *  acerta o maior (só por sorte), então na prática só quem compara ganha o
 *  bônus de forma consistente. */
export const GIRASSOL_BEST_BONUS = 5;
/** Bônus de Fibra por unidade de sequência crescente de cacto colhido em ordem. */
export const CACTO_STREAK_BONUS = 1;

export const BASE_ACTION_DELAY_MS = 420;
export const MIN_ACTION_DELAY_MS = 120;
export const SPEED_STEP_MS = 50;

/** Quanto Feno se perde ao tentar plant('arbusto'/'cenoura') numa casa errada
 *  (ocupada ou não arada) sem checar antes com drone.info(). Só existe pra dar
 *  motivo real de usar condicional — plantar "no escuro" deixa de ser de graça. */
export const SEED_WASTE_COST = 2;

/** Custo de cada nível do Motor do drone — começa só em Feno (barato, cedo),
 *  mas a partir do nível 3 passa a exigir Madeira também, e do nível 5 em
 *  diante Cenoura também, igual às Estruturas/Expansão: nada fica pago numa
 *  moeda só até o fim. */
const SPEED_COSTS: Partial<Record<ItemId, number>>[] = [
  { feno: 30 },
  { feno: 70 },
  { feno: 120, madeira: 40 },
  { feno: 220, madeira: 130 },
  { madeira: 300, cenoura: 90 },
  { madeira: 600, cenoura: 300 },
];

export const SHOP_ITEMS: ShopItemDef[] = [
  {
    id: 'speed',
    name: 'Motor do drone',
    desc: 'Reduz o tempo de cada ação. A partir do nível 3 passa a cobrar Madeira também, e do 5 Cenoura também.',
    cost: level => SPEED_COSTS[level] ?? {},
    maxLevel: SPEED_COSTS.length,
  },
  {
    id: 'arbusto',
    name: 'Sementes de arbusto',
    desc: "Desbloqueia plant('arbusto') — cresce mais devagar que a grama, rende Madeira.",
    cost: () => ({ feno: 200 }),
    maxLevel: 1,
  },
  {
    id: 'cenoura',
    name: 'Sementes de cenoura',
    desc: "Desbloqueia till() e plant('cenoura') — só cresce em terra arada.",
    cost: () => ({ madeira: 300 }),
    maxLevel: 1,
  },
  {
    id: 'arvore',
    name: 'Sementes de árvore',
    desc: "Desbloqueia plant('arvore') — rende Madeira, mas árvore plantada colada em outra árvore (N/S/L/O) morre na hora. Confira as vizinhas com drone.info() antes de plantar.",
    cost: () => ({ madeira: 600 }),
    maxLevel: 1,
    // Checar as vizinhas de verdade exige if (IfStatement) — por isso o gate é
    // Operadores, não só Variáveis: sem if, a única opção é plantar no escuro.
    requiresStructure: 'operadores',
  },
  {
    id: 'girassol',
    name: 'Sementes de girassol',
    desc: `Desbloqueia plant('girassol') — cada pé nasce com um valor aleatório (drone.info().value). Colher o de MAIOR valor pronto agora em toda a fazenda rende ${GIRASSOL_BEST_BONUS}x mais — colher o primeiro que aparecer, sem comparar, raramente acerta o maior.`,
    cost: () => ({ feno: 2000, madeira: 500 }),
    maxLevel: 1,
    requiresStructure: 'operadores',
  },
  {
    id: 'abobora',
    name: 'Sementes de abóbora',
    desc: `Desbloqueia plant('abobora') — plante um bloco ${ABOBORA_BLOCK}×${ABOBORA_BLOCK} inteiro em sequência próxima (até ${ABOBORA_SYNC_WINDOW_MS / 1000}s de diferença entre a 1ª e a última) e colher qualquer uma das 4 colhe o bloco todo de uma vez, cada casa valendo ${ABOBORA_BLOCK_BONUS}x. Plantar espalhado no tempo nunca sincroniza — cada casa rende só 1x, sozinha.`,
    cost: () => ({ madeira: 1500, cenoura: 800 }),
    maxLevel: 1,
    requiresStructure: 'funcoes',
  },
  {
    id: 'cacto',
    name: 'Sementes de cacto',
    desc: 'Desbloqueia plant(\'cacto\') — cada pé nasce com um tamanho aleatório. Colher em ordem crescente de tamanho rende bônus de Fibra.',
    cost: () => ({ cenoura: 5000 }),
    maxLevel: 1,
    requiresStructure: 'listas',
  },
];

/** Custo de cada nível de expansão da fazenda (+1 no lado do grid por compra).
 *  Propositalmente barato nos primeiros níveis — expandir cedo é o que torna
 *  viável cobrir várias casas por ciclo, em vez de depender de uma casa só. */
export const EXPAND_LEVELS: Array<{ cost: Partial<Record<ItemId, number>> }> = [
  { cost: { feno: 60 } },                     // 3x3 -> 4x4
  { cost: { feno: 120 } },                    // 4x4 -> 5x5
  { cost: { feno: 200, madeira: 80 } },       // 5x5 -> 6x6
  { cost: { madeira: 400, cenoura: 80 } },    // 6x6 -> 7x7
  { cost: { cenoura: 1500 } },                // 7x7 -> 8x8
  { cost: { cenoura: 6000 } },                // 8x8 -> 9x9
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
    stock: { feno: 0, madeira: 0, cenoura: 0, oleo: 0, abobora: 0, fibra: 0 },
    upgrades: { speed: 0, arbusto: 0, cenoura: 0, arvore: 0, girassol: 0, abobora: 0, cacto: 0, expand: 0 },
    unlocks: createEmptyUnlocks(),
    stats: { actions: 0, harvests: 0, wasted: 0 },
    cactoStreak: 0,
    lastCactoValue: null,
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
  if (id === 'arvore') return state.upgrades.arvore;
  if (id === 'girassol') return state.upgrades.girassol;
  if (id === 'abobora') return state.upgrades.abobora;
  if (id === 'cacto') return state.upgrades.cacto;
  return 0;
}

/** Igual canBuyStructure: além do preço, algumas Ferramentas (as 4 culturas
 *  novas) só ficam disponíveis depois da Estrutura correspondente comprada —
 *  a cultura em si é o "porquê" de precisar daquela estrutura. */
export function canBuyShopItem(state: FarmState, id: string): { allowed: boolean; reason?: string } {
  const def = SHOP_ITEMS.find(s => s.id === id);
  if (!def) return { allowed: false };
  const level = shopItemLevel(state, id);
  if (level >= def.maxLevel) return { allowed: false, reason: 'já comprado' };
  if (def.requiresStructure && !state.unlocks[def.requiresStructure]) {
    return { allowed: false, reason: `compre "${STRUCTURES[def.requiresStructure].name}" primeiro` };
  }
  const cost = def.cost(level);
  const missing = (Object.keys(cost) as ItemId[]).some(c => state.stock[c] < (cost[c] ?? 0));
  if (missing) return { allowed: false, reason: 'colheita insuficiente' };
  return { allowed: true };
}

export function buyShopItem(state: FarmState, id: string): { state: FarmState; ok: boolean } {
  const def = SHOP_ITEMS.find(s => s.id === id);
  if (!def) return { state, ok: false };
  const level = shopItemLevel(state, id);
  if (!canBuyShopItem(state, id).allowed) return { state, ok: false };
  const cost = def.cost(level);
  const upgrades: Upgrades = { ...state.upgrades };
  if (id === 'speed') upgrades.speed = level + 1;
  if (id === 'arbusto') upgrades.arbusto = level + 1;
  if (id === 'cenoura') upgrades.cenoura = level + 1;
  if (id === 'arvore') upgrades.arvore = level + 1;
  if (id === 'girassol') upgrades.girassol = level + 1;
  if (id === 'abobora') upgrades.abobora = level + 1;
  if (id === 'cacto') upgrades.cacto = level + 1;
  const stock = { ...state.stock };
  (Object.keys(cost) as ItemId[]).forEach(c => { stock[c] -= cost[c] ?? 0; });
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
  const missing = (Object.keys(cost) as ItemId[]).find(c => state.stock[c] < (cost[c] ?? 0));
  if (missing) return { allowed: false, reason: 'colheita insuficiente' };
  return { allowed: true };
}

export function buyExpand(state: FarmState): { state: FarmState; ok: boolean } {
  if (!canBuyExpand(state).allowed) return { state, ok: false };
  const level = state.upgrades.expand;
  const cost = EXPAND_LEVELS[level].cost;
  const stock = { ...state.stock };
  (Object.keys(cost) as ItemId[]).forEach(c => { stock[c] -= cost[c] ?? 0; });
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
   Custo pago diretamente nos itens colhidos — sem moeda abstrata,
   igual ao jogo original (Loop=Feno, Variáveis=Madeira, etc). Os
   custos das estruturas finais são altos o bastante pra tornar
   inviável depender de uma casa só — precisa expandir a fazenda e
   escrever código que cubra várias casas por ciclo.
═══════════════════════════════════════════════════════════════ */
export function canBuyStructure(state: FarmState, id: StructureId): { allowed: boolean; reason?: string } {
  if (state.unlocks[id]) return { allowed: false, reason: 'já comprado' };
  const idx = STRUCTURE_ORDER.indexOf(id);
  const prereq = STRUCTURE_ORDER[idx - 1];
  if (prereq && !state.unlocks[prereq]) return { allowed: false, reason: `compre "${STRUCTURES[prereq].name}" primeiro` };
  const cost = STRUCTURES[id].cost;
  const missing = (Object.keys(cost) as ItemId[]).find(c => state.stock[c] < (cost[c] ?? 0));
  if (missing) return { allowed: false, reason: 'colheita insuficiente' };
  return { allowed: true };
}

export function buyStructure(state: FarmState, id: StructureId): { state: FarmState; ok: boolean } {
  if (!canBuyStructure(state, id).allowed) return { state, ok: false };
  const cost = STRUCTURES[id].cost;
  const stock = { ...state.stock };
  (Object.keys(cost) as ItemId[]).forEach(c => { stock[c] -= cost[c] ?? 0; });
  return {
    state: { ...state, stock, unlocks: { ...state.unlocks, [id]: true } },
    ok: true,
  };
}

/* ═══════════════════════════════════════════════════════════════
   HELPERS DAS CULTURAS NOVAS
═══════════════════════════════════════════════════════════════ */
function withStats(stats: FarmState['stats'], delta: Partial<FarmState['stats']>): FarmState['stats'] {
  return {
    actions: stats.actions + (delta.actions ?? 0),
    harvests: stats.harvests + (delta.harvests ?? 0),
    wasted: stats.wasted + (delta.wasted ?? 0),
  };
}

function randomInRange([min, max]: [number, number]): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Árvore plantada colada (N/S/L/O) em outra árvore morre — obriga a checar
 *  as 4 vizinhas com drone.info() antes de plantar, não só repetir move+plant. */
function hasAdjacentTree(state: FarmState, x: number, y: number): boolean {
  const offsets: Array<[number, number]> = [[0, -1], [0, 1], [-1, 0], [1, 0]];
  return offsets.some(([dx, dy]) => {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= state.gridSize || ny >= state.gridSize) return false;
    return state.tiles[tileIndex(state, nx, ny)].crop === 'arvore';
  });
}

/** Bloco ABOBORA_BLOCK×ABOBORA_BLOCK sincronizado = bônus. Exige que as 4
 *  estejam maduras agora E que tenham sido PLANTADAS dentro da mesma janela de
 *  tempo (ABOBORA_SYNC_WINDOW_MS) — não basta esperar todas ficarem prontas
 *  não importa quando plantadas; se o intervalo de plantio for grande demais,
 *  o bloco nunca sincroniza, obrigando plantio em sequência próxima de verdade. */
function aboboraBlockReady(state: FarmState, x: number, y: number, now: number): boolean {
  const bx = Math.floor(x / ABOBORA_BLOCK) * ABOBORA_BLOCK;
  const by = Math.floor(y / ABOBORA_BLOCK) * ABOBORA_BLOCK;
  const plantedTimes: number[] = [];
  for (let dx = 0; dx < ABOBORA_BLOCK; dx++) {
    for (let dy = 0; dy < ABOBORA_BLOCK; dy++) {
      const nx = bx + dx, ny = by + dy;
      if (nx >= state.gridSize || ny >= state.gridSize) return false;
      const t = state.tiles[tileIndex(state, nx, ny)];
      if (t.crop !== 'abobora' || !isCropReady(t, now) || t.plantedAt === null) return false;
      plantedTimes.push(t.plantedAt);
    }
  }
  const spread = Math.max(...plantedTimes) - Math.min(...plantedTimes);
  return spread <= ABOBORA_SYNC_WINDOW_MS;
}

/** Maior valor entre os girassóis prontos AGORA em toda a fazenda — colher
 *  esse (em vez do primeiro que aparecer, sem comparar) é o que rende o
 *  bônus. Só existe de verdade se o jogador ler drone.info().value de vários
 *  antes de decidir qual colher. */
function girassolRegionMax(state: FarmState, now: number): number {
  let max = 0;
  for (const t of state.tiles) {
    if (t.crop === 'girassol' && isCropReady(t, now) && (t.value ?? 0) > max) max = t.value ?? 0;
  }
  return max;
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
      // Fazenda finita, igual a um campo real: sair da borda falha, sem
      // teletransportar pro lado oposto — obriga tratar posição/limite no
      // código (com drone.size()), não só repetir uma direção sem pensar.
      if (x < 0 || y < 0 || x >= size || y >= size) {
        return { state: { ...state, stats: withStats(state.stats, { actions: 1, wasted: 1 }) }, value: false };
      }
      return { state: { ...state, drone: { x, y }, stats: withStats(state.stats, { actions: 1 }) }, value: true };
    }
    case 'plant': {
      const crop: CropId = (['arbusto', 'cenoura', 'arvore', 'girassol', 'abobora', 'cacto'] as CropId[]).includes(action.crop as CropId)
        ? (action.crop as CropId)
        : 'grama';
      const idx = tileIndex(state, state.drone.x, state.drone.y);
      const tile = state.tiles[idx];
      const upgradeOk =
        crop === 'grama' ? true :
        crop === 'arbusto' ? state.upgrades.arbusto >= 1 :
        crop === 'cenoura' ? state.upgrades.cenoura >= 1 :
        crop === 'arvore' ? state.upgrades.arvore >= 1 :
        crop === 'girassol' ? state.upgrades.girassol >= 1 :
        crop === 'abobora' ? state.upgrades.abobora >= 1 :
        state.upgrades.cacto >= 1;
      if (!upgradeOk) return { state, value: false };

      // Grama é "livre" — dá pra plantar outra cultura por cima dela. Culturas
      // cultivadas protegem a casa até serem colhidas.
      const occupied = tile.crop !== null && tile.crop !== 'grama';
      const notTilled = CROPS[crop].requiresTill && !tile.tilled;
      const treeConflict = crop === 'arvore' && hasAdjacentTree(state, state.drone.x, state.drone.y);
      if (crop !== 'grama' && (occupied || notTilled || treeConflict)) {
        // Semente desperdiçada: plantar sem checar o estado da casa (e das
        // vizinhas, no caso da árvore) antes com drone.info() tem custo real.
        // Grama não gasta nada porque nunca precisa de semente (cresce sozinha).
        const waste = Math.min(SEED_WASTE_COST, state.stock.feno);
        const stock = waste > 0 ? { ...state.stock, feno: state.stock.feno - waste } : state.stock;
        return { state: { ...state, stock, stats: withStats(state.stats, { actions: 1, wasted: 1 }) }, value: false };
      }
      const tiles = state.tiles.slice();
      const value = crop === 'girassol' ? randomInRange(GIRASSOL_VALUE_RANGE)
        : crop === 'cacto' ? randomInRange(CACTO_VALUE_RANGE)
        : undefined;
      tiles[idx] = { crop, plantedAt: now, tilled: tile.tilled, value };
      return { state: { ...state, tiles, stats: withStats(state.stats, { actions: 1 }) }, value: true };
    }
    case 'till': {
      // Ara/desara a terra — funciona em casa vazia OU com grama (que é "livre",
      // igual no plant()); culturas cultivadas protegem a casa até colher.
      // Terra arada não deixa a grama crescer sozinha, liberando espaço pra cenoura.
      const idx = tileIndex(state, state.drone.x, state.drone.y);
      const tile = state.tiles[idx];
      if (tile.crop !== null && tile.crop !== 'grama') {
        return { state: { ...state, stats: withStats(state.stats, { actions: 1, wasted: 1 }) }, value: false };
      }
      const tiles = state.tiles.slice();
      tiles[idx] = tileAfterClear(!tile.tilled, now);
      return { state: { ...state, tiles, stats: withStats(state.stats, { actions: 1 }) }, value: true };
    }
    case 'harvest': {
      // Exato, igual ao jogo original: se não estiver madura, falha na hora — não espera.
      const idx = tileIndex(state, state.drone.x, state.drone.y);
      const tile = state.tiles[idx];
      if (!isCropReady(tile, now)) {
        return { state: { ...state, stats: withStats(state.stats, { actions: 1, wasted: 1 }) }, value: 0 };
      }
      const crop = tile.crop as CropId;
      const item = CROP_TO_ITEM[crop];
      let yieldAmount = tile.value ?? 1;
      const tiles = state.tiles.slice();

      // Girassol: colher o de MAIOR valor pronto agora em toda a fazenda rende
      // bônus — colher o primeiro que aparecer sem comparar raramente acerta
      // o maior por sorte, então só compensa de verdade quem lê drone.info()
      // de vários antes de decidir qual colher.
      if (crop === 'girassol') {
        const regionMax = girassolRegionMax(state, now);
        if (regionMax > 0 && yieldAmount >= regionMax) {
          yieldAmount *= GIRASSOL_BEST_BONUS;
        }
      }

      // Abóbora: bloco 2×2 sincronizado (mesma janela de plantio) colhe as 4
      // casas de uma vez, cada uma valendo o bônus — colher fora de sincronia
      // rende só a casa atual, valor normal (as outras continuam no campo).
      if (crop === 'abobora' && aboboraBlockReady(state, state.drone.x, state.drone.y, now)) {
        const bx = Math.floor(state.drone.x / ABOBORA_BLOCK) * ABOBORA_BLOCK;
        const by = Math.floor(state.drone.y / ABOBORA_BLOCK) * ABOBORA_BLOCK;
        yieldAmount = 0;
        for (let dx = 0; dx < ABOBORA_BLOCK; dx++) {
          for (let dy = 0; dy < ABOBORA_BLOCK; dy++) {
            const nIdx = tileIndex(state, bx + dx, by + dy);
            yieldAmount += (tiles[nIdx].value ?? 1) * ABOBORA_BLOCK_BONUS;
            tiles[nIdx] = tileAfterClear(tiles[nIdx].tilled, now);
          }
        }
      } else {
        tiles[idx] = tileAfterClear(tile.tilled, now);
      }

      // Cacto: colher em ordem crescente de tamanho mantém/aumenta a
      // sequência (e o bônus); colher fora de ordem zera a sequência.
      let { cactoStreak, lastCactoValue } = state;
      if (crop === 'cacto') {
        const size = tile.value ?? 1;
        if (lastCactoValue === null || size >= lastCactoValue) {
          cactoStreak += 1;
          yieldAmount += cactoStreak * CACTO_STREAK_BONUS;
        } else {
          cactoStreak = 0;
        }
        lastCactoValue = size;
      }

      const stock = { ...state.stock, [item]: state.stock[item] + yieldAmount };
      return {
        state: {
          ...state, tiles, stock, cactoStreak, lastCactoValue,
          stats: withStats(state.stats, { actions: 1, harvests: 1 }),
        },
        value: yieldAmount,
      };
    }
    case 'canHarvest': {
      // Leitura pura, não muda o estado — resolvida na página com custo de tempo ~0.
      const idx = tileIndex(state, state.drone.x, state.drone.y);
      return { state, value: isCropReady(state.tiles[idx], now) };
    }
    case 'info': {
      // Leitura completa da casa atual — o jeito de checar antes de agir, em vez
      // de plantar/arar "no escuro" e arriscar desperdiçar semente.
      const idx = tileIndex(state, state.drone.x, state.drone.y);
      const tile = state.tiles[idx];
      return { state, value: { crop: tile.crop, ready: isCropReady(tile, now), tilled: tile.tilled, value: tile.value ?? null } };
    }
    case 'size': {
      // Tamanho atual do grid — necessário pra escrever um loop que cobre a
      // fazenda inteira mesmo depois de expandida (sem isso não dá pra saber
      // onde o campo termina, exceto contando por tentativa e erro).
      return { state, value: state.gridSize };
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
