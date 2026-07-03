import { parse } from 'acorn';
import { StructureId, buildNodeTypeMap, STRUCTURES } from './curriculum';

export interface Violation {
  structureId: StructureId;
  line: number;
}

interface AcornNode {
  type: string;
  loc?: { start: { line: number } };
  [key: string]: unknown;
}

const NODE_TYPE_MAP = buildNodeTypeMap();

function walk(node: unknown, visit: (n: AcornNode) => void) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const item of node) walk(item, visit);
    return;
  }
  const obj = node as AcornNode;
  if (typeof obj.type === 'string') visit(obj);
  for (const key of Object.keys(obj)) {
    if (key === 'loc' || key === 'start' || key === 'end' || key === 'range') continue;
    const val = obj[key];
    if (val && typeof val === 'object') walk(val, visit);
  }
}

/**
 * Analisa o código do jogador e retorna as estruturas ainda bloqueadas usadas nele.
 * Lança um Error com mensagem amigável se o código tiver erro de sintaxe.
 */
export function validateCode(code: string, unlocks: Record<StructureId, boolean>): Violation[] {
  let ast: unknown;
  try {
    ast = parse(code, { ecmaVersion: 2022, sourceType: 'module', locations: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Erro de sintaxe: ${message}`);
  }

  const violations: Violation[] = [];
  const seen = new Set<string>();
  walk(ast, node => {
    const structureId = NODE_TYPE_MAP[node.type];
    if (!structureId || unlocks[structureId]) return;
    const line = node.loc?.start.line ?? 0;
    const key = `${structureId}:${line}`;
    if (seen.has(key)) return;
    seen.add(key);
    violations.push({ structureId, line });
  });

  return violations.sort((a, b) => a.line - b.line);
}

export function formatViolation(v: Violation): string {
  const def = STRUCTURES[v.structureId];
  return `Loja: desbloqueie "${def.name}" para usar essa estrutura (linha ${v.line})`;
}
