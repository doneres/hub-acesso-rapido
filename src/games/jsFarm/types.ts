/* ═══════════════════════════════════════════════════════════════
   FAZENDA.JS — tipos compartilhados entre main thread e worker
═══════════════════════════════════════════════════════════════ */
import type { StructureId } from './curriculum';

export type CropId = 'grama' | 'arbusto' | 'cenoura' | 'arvore' | 'girassol' | 'abobora' | 'cacto';

/** Item colhido — diferente da entidade plantada, igual ao jogo original
 *  (Grama plantada gera o item Feno; Arbusto gera Madeira; Cenoura gera
 *  Cenoura). É essa moeda (não a entidade) que paga Ferramentas/Estruturas.
 *  Árvore também rende Madeira (igual Bush e Tree renderem Wood no jogo
 *  original) — mais de uma entidade pode alimentar o mesmo item. */
export type ItemId = 'feno' | 'madeira' | 'cenoura' | 'oleo' | 'abobora' | 'fibra';

export interface CropDef {
  id: CropId;
  name: string;
  growMs: number;
  color: string;
  seedColor: string;
  requiresTill: boolean;
}

export interface Tile {
  crop: CropId | null;
  plantedAt: number | null;
  tilled: boolean; // chão arado — cenoura só cresce em terra arada
  value?: number; // valor/tamanho aleatório sorteado ao plantar — girassol e cacto
}

export interface DroneState {
  x: number;
  y: number;
}

export type MoveDir = 'up' | 'down' | 'left' | 'right';

export type DroneAction =
  | { kind: 'move'; dir: MoveDir }
  | { kind: 'plant'; crop?: CropId }
  | { kind: 'till' }
  | { kind: 'harvest' }
  | { kind: 'canHarvest' }
  | { kind: 'info' }
  | { kind: 'size' }
  | { kind: 'sell' }
  | { kind: 'home' }
  | { kind: 'clear' };

/** Retorno de drone.info() — leitura completa da casa atual, pra decidir
 *  o que fazer sem "chutar" a ação (que agora tem custo se errar). */
export interface TileInfo {
  crop: CropId | null;
  ready: boolean;
  tilled: boolean;
  value: number | null; // valor/tamanho da planta (girassol/cacto) — null nas demais
}

export interface ShopItemDef {
  id: string;
  name: string;
  desc: string;
  cost: (level: number) => Partial<Record<ItemId, number>>;
  maxLevel: number;
  requiresStructure?: StructureId; // só fica disponível depois dessa estrutura comprada
}

export interface Upgrades {
  speed: number;
  arbusto: number; // 0 ou 1 — desbloqueia plant('arbusto')
  cenoura: number; // 0 ou 1 — desbloqueia till() + plant('cenoura')
  arvore: number; // 0 ou 1 — desbloqueia plant('arvore'), exige "Variáveis"
  girassol: number; // 0 ou 1 — desbloqueia plant('girassol'), exige "Operadores e condicionais"
  abobora: number; // 0 ou 1 — desbloqueia plant('abobora'), exige "Funções"
  cacto: number; // 0 ou 1 — desbloqueia plant('cacto'), exige "Listas"
  expand: number; // nível de expansão da fazenda — cada nível soma +1 no lado do grid
}

/** Contadores de eficiência — base do placar da Arena de Desafios: não é só
 *  "quanto colheu", é quantas ações foram desperdiçadas pra chegar lá. */
export interface FarmStats {
  actions: number; // move/plant/till/harvest executados (leituras não contam)
  harvests: number; // colheitas que renderam item de verdade
  wasted: number; // ações que falharam (harvest vazio, plant/till errado, move na borda)
}

export interface FarmState {
  gridSize: number;
  tiles: Tile[];
  drone: DroneState;
  stock: Record<ItemId, number>; // estoque permanente de itens colhidos — a própria moeda, sem teto
  upgrades: Upgrades;
  unlocks: Record<StructureId, boolean>;
  stats: FarmStats;
  cactoStreak: number; // sequência de colheitas de cacto em ordem crescente de tamanho
  lastCactoValue: number | null; // tamanho do último cacto colhido, pra comparar o próximo
}

export interface SaveData {
  farm: FarmState;
  code: string;
}

/* ── Protocolo Worker ↔ Main thread ──────────────────────────── */
export interface WorkerActionMsg {
  type: 'action';
  id: number;
  action: DroneAction;
}
export interface WorkerLogMsg {
  type: 'log';
  text: string;
}
export interface WorkerErrorMsg {
  type: 'error';
  message: string;
}
export interface WorkerDoneMsg {
  type: 'done';
}
export type WorkerToMain = WorkerActionMsg | WorkerLogMsg | WorkerErrorMsg | WorkerDoneMsg;

export interface MainRunMsg {
  type: 'run';
  code: string;
}
export interface MainStopMsg {
  type: 'stop';
}
export interface MainResultMsg {
  type: 'result';
  id: number;
  value: unknown;
}
export interface MainErrorResultMsg {
  type: 'error-result';
  id: number;
  message: string;
}
export type MainToWorker = MainRunMsg | MainStopMsg | MainResultMsg | MainErrorResultMsg;
