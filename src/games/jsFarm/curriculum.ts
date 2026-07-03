/* ═══════════════════════════════════════════════════════════════
   FAZENDA.JS — árvore de estruturas de programação
   Ordem inspirada em "The Farmer Was Replaced": Laços é a primeira
   compra (barata, só Feno — igual "Loops" custar pouco Feno lá).
   As demais custam Madeira/Cenoura, itens de "segunda e terceira
   camada" que exigem desbloqueios próprios antes (igual Cenoura
   custar Madeira no jogo real).

   Os custos das estruturas finais (Funções/Listas/Dicionários) são
   altos o bastante pra que uma única casa (mesmo com Motor no talo)
   levasse muitas horas pra pagar sozinha — o jeito rápido de verdade
   é expandir a fazenda e escrever código que cubra várias casas por
   ciclo (loop + array de posições), não ficar preso numa casa só.
   Cada item só pode ser comprado depois do anterior na cadeia.

   IMPORTANTE — dependência sintática, não só econômica: nodeTypes
   não seguem 1-pra-1 o nome "amigável" da estrutura. Laços só libera
   while/do-while (o único jeito de repetir que não depende de mais
   nada); ForStatement (for contado) foi movido pra dentro de
   Operadores, porque um for contado de verdade precisa de variável
   de controle + comparação — sem isso "ter" for não serve pra nada.
   Pelo mesmo motivo, ForOfStatement/ForInStatement foram movidos pra
   dentro de Listas — for...of sem nada iterável também não serve.
   Isso garante que toda compra já seja 100% utilizável no momento em
   que é feita, nunca uma "meia-estrutura" esperando a próxima.
═══════════════════════════════════════════════════════════════ */
import type { ItemId } from './types';

export type StructureId = 'lacos' | 'variaveis' | 'operadores' | 'funcoes' | 'listas' | 'dicionarios';

export interface StructureDef {
  id: StructureId;
  name: string;
  desc: string;
  cost: Partial<Record<ItemId, number>>;
  nodeTypes: string[];
  example: string;
}

/* Ordem da cadeia — também define a sequência de compra obrigatória */
export const STRUCTURE_ORDER: StructureId[] = ['lacos', 'variaveis', 'operadores', 'funcoes', 'listas', 'dicionarios'];

export const STRUCTURES: Record<StructureId, StructureDef> = {
  lacos: {
    id: 'lacos', name: 'Laços', cost: { feno: 80 },
    desc: 'Repita ações com while e do...while. A primeira compra — barata, só Feno. (for contado libera com Operadores; for...of libera com Listas — não adianta comprar Laços e tentar contar repetições sem eles.)',
    nodeTypes: ['WhileStatement', 'DoWhileStatement', 'BreakStatement', 'ContinueStatement'],
    example: "while (true) { await drone.harvest(); await drone.move('right'); }",
  },
  variaveis: {
    id: 'variaveis', name: 'Variáveis', cost: { madeira: 200 },
    desc: 'Guarde valores com let/const para reaproveitar depois.',
    nodeTypes: ['VariableDeclaration'],
    example: "let colheita = await drone.harvest();",
  },
  operadores: {
    id: 'operadores', name: 'Operadores e condicionais', cost: { feno: 1200, madeira: 300 },
    desc: 'Operadores aritméticos, de comparação, lógicos, if/else — e o for contado, que precisa de comparação (i < n) pra saber quando parar.',
    nodeTypes: ['BinaryExpression', 'LogicalExpression', 'UnaryExpression', 'UpdateExpression', 'IfStatement', 'ConditionalExpression', 'SwitchStatement', 'ForStatement'],
    example: "for (let i = 0; i < await drone.size(); i++) {\n  if (await drone.canHarvest()) { await drone.harvest(); }\n}",
  },
  funcoes: {
    id: 'funcoes', name: 'Funções', cost: { madeira: 900, cenoura: 400 },
    desc: 'Empacote passos repetidos em uma função sua.',
    nodeTypes: ['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression', 'ReturnStatement'],
    example: "async function ciclo() {\n  await drone.plant();\n  await drone.harvest();\n}",
  },
  listas: {
    id: 'listas', name: 'Listas', cost: { cenoura: 8000 },
    desc: 'Guarde vários valores em um array com [ ] — e o for...of, que percorre a lista direto. Ideal pra guardar várias posições da fazenda e percorrer todas num loop só.',
    nodeTypes: ['ArrayExpression', 'ForOfStatement', 'ForInStatement'],
    example: "const posicoes = ['right', 'right', 'down'];\nfor (const dir of posicoes) { await drone.move(dir); }",
  },
  dicionarios: {
    id: 'dicionarios', name: 'Dicionários', cost: { cenoura: 30000 },
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
