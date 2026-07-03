/* ═══════════════════════════════════════════════════════════════
   FAZENDA.JS — árvore de estruturas de programação
   Ordem inspirada em "The Farmer Was Replaced": Laços é a primeira
   compra (barata, só grama — igual "Loops" custar pouco Feno lá).
   As demais custam arbusto/cenoura, culturas de "segunda e terceira
   camada" que exigem desbloqueios próprios antes (igual Cenoura
   custar Madeira no jogo real). Cada item só pode ser comprado
   depois do anterior na cadeia.
═══════════════════════════════════════════════════════════════ */
import type { CropId } from './types';

export type StructureId = 'lacos' | 'variaveis' | 'operadores' | 'funcoes' | 'listas' | 'dicionarios';

export interface StructureDef {
  id: StructureId;
  name: string;
  desc: string;
  cost: Partial<Record<CropId, number>>;
  nodeTypes: string[];
  example: string;
}

/* Ordem da cadeia — também define a sequência de compra obrigatória */
export const STRUCTURE_ORDER: StructureId[] = ['lacos', 'variaveis', 'operadores', 'funcoes', 'listas', 'dicionarios'];

export const STRUCTURES: Record<StructureId, StructureDef> = {
  lacos: {
    id: 'lacos', name: 'Laços', cost: { grama: 80 },
    desc: 'Repita ações com while, for e for...of. A primeira compra — barata, só grama.',
    nodeTypes: ['WhileStatement', 'DoWhileStatement', 'ForStatement', 'ForOfStatement', 'ForInStatement', 'BreakStatement', 'ContinueStatement'],
    example: "while (true) { await drone.move('right'); }",
  },
  variaveis: {
    id: 'variaveis', name: 'Variáveis', cost: { arbusto: 150 },
    desc: 'Guarde valores com let/const para reaproveitar depois.',
    nodeTypes: ['VariableDeclaration'],
    example: "let colheita = await drone.harvest();",
  },
  operadores: {
    id: 'operadores', name: 'Operadores e condicionais', cost: { grama: 600, arbusto: 200 },
    desc: 'Operadores aritméticos, de comparação, lógicos, e if/else.',
    nodeTypes: ['BinaryExpression', 'LogicalExpression', 'UnaryExpression', 'UpdateExpression', 'IfStatement', 'ConditionalExpression', 'SwitchStatement'],
    example: "if (await drone.canHarvest()) { await drone.harvest(); }",
  },
  funcoes: {
    id: 'funcoes', name: 'Funções', cost: { arbusto: 400, cenoura: 150 },
    desc: 'Empacote passos repetidos em uma função sua.',
    nodeTypes: ['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression', 'ReturnStatement'],
    example: "async function ciclo() {\n  await drone.plant();\n  await drone.harvest();\n}",
  },
  listas: {
    id: 'listas', name: 'Listas', cost: { cenoura: 3000 },
    desc: 'Guarde vários valores em um array com [ ].',
    nodeTypes: ['ArrayExpression'],
    example: "const direcoes = ['right', 'right', 'down'];",
  },
  dicionarios: {
    id: 'dicionarios', name: 'Dicionários', cost: { cenoura: 15000 },
    desc: 'Agrupe dados nomeados em um objeto com { }.',
    nodeTypes: ['ObjectExpression'],
    example: "const config = { direcao: 'right', vezes: 4 };",
  },
};

export function createEmptyUnlocks(): Record<StructureId, boolean> {
  return { lacos: false, variaveis: false, operadores: false, funcoes: false, listas: false, dicionarios: false };
}

/** Retorna o id do próximo item ainda não comprado na cadeia, ou null se tudo foi comprado. */
export function nextStructure(unlocks: Record<StructureId, boolean>): StructureId | null {
  return STRUCTURE_ORDER.find(id => !unlocks[id]) ?? null;
}

/** Mapa nodeType -> StructureId, pra o validador saber qual item da loja libera cada nó. */
export function buildNodeTypeMap(): Record<string, StructureId> {
  const map: Record<string, StructureId> = {};
  for (const id of STRUCTURE_ORDER) {
    for (const nodeType of STRUCTURES[id].nodeTypes) map[nodeType] = id;
  }
  return map;
}
