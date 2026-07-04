/* ═══════════════════════════════════════════════════════════════
   FAZENDA.JS — árvore de estruturas de programação

   Cada item libera EXATAMENTE um conceito (não um pacote de vários),
   e só pode ser comprado depois de TODOS os seus pré-requisitos
   (structs prereqs). Isso forma uma árvore de dependências: alguns
   itens têm mais de um "pai" (ex.: Dicionários pede Listas + for...of).

   A dependência é sintática, não só de nome: for contado (ForStatement)
   pede Operadores (precisa de comparação pra saber quando parar) e
   Variáveis já é pré-requisito de Operadores — então nunca dá pra
   comprar um for que não se pode escrever ainda.
═══════════════════════════════════════════════════════════════ */
import type { ItemId } from './types';

export type StructureId =
  | 'lacos' | 'variaveis' | 'controle_laco' | 'operadores' | 'listas'
  | 'condicionais' | 'logicos' | 'laco_for' | 'for_of' | 'funcoes' | 'dicionarios';

export interface StructureDef {
  id: StructureId;
  name: string;
  /** Uma linha só: o que é a estrutura, sem justificativa de preço/ordem. */
  desc: string;
  cost: Partial<Record<ItemId, number>>;
  nodeTypes: string[];
  example: string;
  /** Precisa de TODOS estes itens comprados antes. */
  prereqs: StructureId[];
}

export const STRUCTURES: Record<StructureId, StructureDef> = {
  lacos: {
    id: 'lacos', name: 'Laços (while)', prereqs: [],
    cost: { feno: 80 },
    desc: 'Repete um bloco enquanto uma condição continuar verdadeira.',
    nodeTypes: ['WhileStatement', 'DoWhileStatement'],
    example: "while (await drone.canHarvest()) {\n  await drone.harvest();\n}",
  },
  variaveis: {
    id: 'variaveis', name: 'Variáveis', prereqs: [],
    cost: { madeira: 150 },
    desc: 'Guarda um valor num nome para usar (e trocar) depois.',
    nodeTypes: ['VariableDeclaration'],
    example: "let colheita = await drone.harvest();",
  },
  controle_laco: {
    id: 'controle_laco', name: 'Controle de laço', prereqs: ['lacos'],
    cost: { feno: 220 },
    desc: 'break interrompe o laço na hora; continue pula pra próxima repetição.',
    nodeTypes: ['BreakStatement', 'ContinueStatement'],
    example: "while (true) {\n  if (!(await drone.canHarvest())) break;\n  await drone.harvest();\n}",
  },
  operadores: {
    id: 'operadores', name: 'Operadores', prereqs: ['variaveis'],
    cost: { feno: 500, madeira: 150 },
    desc: 'Soma, compara e atualiza valores: +, -, *, /, <, >, ==, ++.',
    nodeTypes: ['BinaryExpression', 'UnaryExpression', 'UpdateExpression'],
    example: "let vezes = 0;\nvezes = vezes + 1;",
  },
  listas: {
    id: 'listas', name: 'Listas', prereqs: ['variaveis'],
    cost: { madeira: 600 },
    desc: 'Guarda vários valores numa única sequência, com colchetes [ ].',
    nodeTypes: ['ArrayExpression'],
    example: "const direcoes = ['right', 'right', 'down'];",
  },
  condicionais: {
    id: 'condicionais', name: 'Condicionais', prereqs: ['operadores'],
    cost: { feno: 900, madeira: 300 },
    desc: 'Executa um bloco só se uma condição for verdadeira (if/else).',
    nodeTypes: ['IfStatement', 'ConditionalExpression', 'SwitchStatement'],
    example: "if (await drone.canHarvest()) {\n  await drone.harvest();\n} else {\n  await drone.move('right');\n}",
  },
  logicos: {
    id: 'logicos', name: 'Operadores lógicos', prereqs: ['operadores'],
    cost: { madeira: 400 },
    desc: 'Combina condições com E (&&), OU (||) e NÃO (!).',
    nodeTypes: ['LogicalExpression'],
    example: "const casa = await drone.info();\nif (casa.crop === null && casa.tilled) { /* pronta pra plantar */ }",
  },
  laco_for: {
    id: 'laco_for', name: 'Laço for (contado)', prereqs: ['operadores'],
    cost: { madeira: 500, cenoura: 150 },
    desc: 'Repete um número exato de vezes, contando com uma variável.',
    nodeTypes: ['ForStatement'],
    example: "for (let i = 0; i < await drone.size(); i++) {\n  await drone.move('right');\n}",
  },
  for_of: {
    id: 'for_of', name: 'Laço for...of', prereqs: ['listas'],
    cost: { cenoura: 600 },
    desc: 'Percorre cada item de uma lista, um de cada vez.',
    nodeTypes: ['ForOfStatement', 'ForInStatement'],
    example: "for (const dir of ['right', 'right', 'down']) {\n  await drone.move(dir);\n}",
  },
  funcoes: {
    id: 'funcoes', name: 'Funções', prereqs: ['condicionais'],
    cost: { madeira: 1200, cenoura: 600 },
    desc: 'Empacota um grupo de passos numa função que você reaproveita.',
    nodeTypes: ['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression', 'ReturnStatement'],
    example: "async function ciclo() {\n  await drone.plant();\n  await drone.harvest();\n}",
  },
  dicionarios: {
    id: 'dicionarios', name: 'Dicionários', prereqs: ['for_of'],
    cost: { cenoura: 6000 },
    desc: 'Agrupa dados nomeados numa estrutura, com chave: valor.',
    nodeTypes: ['ObjectExpression'],
    example: "const config = { direcao: 'right', vezes: 4 };",
  },
};

/** Camadas de profundidade da árvore — só pra layout (linha 0 = raiz). */
export const STRUCTURE_TIERS: StructureId[][] = [
  ['lacos', 'variaveis'],
  ['controle_laco', 'operadores', 'listas'],
  ['condicionais', 'logicos', 'laco_for', 'for_of'],
  ['funcoes', 'dicionarios'],
];

export const STRUCTURE_ORDER: StructureId[] = STRUCTURE_TIERS.flat();

export function createEmptyUnlocks(): Record<StructureId, boolean> {
  const unlocks = {} as Record<StructureId, boolean>;
  for (const id of STRUCTURE_ORDER) unlocks[id] = false;
  return unlocks;
}

/** Todos os itens ainda não comprados cujos pré-requisitos já foram todos atendidos. */
export function buyableNow(unlocks: Record<StructureId, boolean>): StructureId[] {
  return STRUCTURE_ORDER.filter(id => !unlocks[id] && STRUCTURES[id].prereqs.every(p => unlocks[p]));
}

/** Mapa nodeType -> StructureId, pra o validador saber qual item da loja libera cada nó. */
export function buildNodeTypeMap(): Record<string, StructureId> {
  const map: Record<string, StructureId> = {};
  for (const id of STRUCTURE_ORDER) {
    for (const nodeType of STRUCTURES[id].nodeTypes) map[nodeType] = id;
  }
  return map;
}
