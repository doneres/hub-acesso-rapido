/* ═══════════════════════════════════════════════════════════════
   FAZENDA.JS — tipos compartilhados entre main thread e worker
═══════════════════════════════════════════════════════════════ */
import type { StructureId } from './curriculum';

export type CropId = 'grama' | 'arbusto' | 'cenoura';

/** Item colhido — diferente da entidade plantada, igual ao jogo original
 *  (Grama plantada gera o item Feno; Arbusto gera Madeira; Cenoura gera
 *  Cenoura). É essa moeda (não a entidade) que paga Ferramentas/Estruturas. */
export type ItemId = 'feno' | 'madeira' | 'cenoura';

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
  | { kind: 'sell' }
  | { kind: 'home' }
  | { kind: 'clear' };

export interface ShopItemDef {
  id: string;
  name: string;
  desc: string;
  cost: (level: number) => Partial<Record<ItemId, number>>;
  maxLevel: number;
}

export interface Upgrades {
  speed: number;
  arbusto: number; // 0 ou 1 — desbloqueia plant('arbusto')
  cenoura: number; // 0 ou 1 — desbloqueia till() + plant('cenoura')
  expand: number; // nível de expansão da fazenda — cada nível soma +1 no lado do grid
}

export interface FarmState {
  gridSize: number;
  tiles: Tile[];
  drone: DroneState;
  stock: Record<ItemId, number>; // estoque permanente de itens colhidos — a própria moeda, sem teto
  upgrades: Upgrades;
  unlocks: Record<StructureId, boolean>;
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
