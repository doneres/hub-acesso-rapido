/* ── Sistema de Cosméticos do Hub ────────────────────────────────────────
   Cosméticos são temas visuais comprados com pontos do Detetive de Código.
   O ID ativo é salvo em localStorage (independente do login Desafios),
   e as compras ficam no GameUser para garantir que o aluno pagou.
─────────────────────────────────────────────────────────────────────────── */

export const ACTIVE_COSMETIC_KEY = 'ctrlplay_active_cosmetic_v1';

export interface CosmeticDef {
  id: string;
  name: string;
  desc: string;
  cost: number;
  emoji: string;
  tag: string;
  tagColor: string;
  /** Gradiente exibido no preview da loja */
  previewGradient: string;
  /** Cor de fundo do hub (light mode) */
  lightBg: string;
  /** Cor de fundo do hub (dark mode) */
  darkBg: string;
  /** SVG data-URI para o padrão de fundo (light) */
  patternLight: string;
  /** SVG data-URI para o padrão de fundo (dark) */
  patternDark: string;
  /** Cor de destaque primária (substitui ctrl-blue) */
  accent1: string;
  /** Cor de destaque secundária (substitui ctrl-orange) */
  accent2: string;
}

/* ── Padrão gramado: faixas horizontais como campo de futebol ────────── */
export const COPA_PATTERN_LIGHT = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='72'%3E%3Crect width='1' height='36' fill='%23008c35' opacity='0.032'/%3E%3C/svg%3E")`;
export const COPA_PATTERN_DARK  = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='72'%3E%3Crect width='1' height='36' fill='%2300b347' opacity='0.05'/%3E%3C/svg%3E")`;

/* ── Cosméticos disponíveis ──────────────────────────────────────────── */
export const COSMETICS: CosmeticDef[] = [
  {
    id: 'copa-2026',
    name: 'Copa do Mundo 2026',
    desc: 'Vista o hub com o espírito da maior competição do planeta. Fundo de campo, cores verde e dourado, banner oficial e destaque Copa em todo o hub.',
    cost: 300,
    emoji: '⚽',
    tag: 'COPA 2026',
    tagColor: '#FFD700',
    previewGradient: 'linear-gradient(135deg, #012d16 0%, #015c28 40%, #008c35 70%, #c9a227 100%)',
    lightBg: '#f4fef7',
    darkBg: '#020c05',
    patternLight: COPA_PATTERN_LIGHT,
    patternDark: COPA_PATTERN_DARK,
    accent1: '#009C3B',   // verde Brasil
    accent2: '#D4A017',   // dourado
  },
];

/* ── Helpers localStorage ─────────────────────────────────────────────── */
export function getActiveCosmeticId(): string | null {
  try { return localStorage.getItem(ACTIVE_COSMETIC_KEY); } catch { return null; }
}

export function setActiveCosmeticId(id: string | null): void {
  try {
    if (id) localStorage.setItem(ACTIVE_COSMETIC_KEY, id);
    else    localStorage.removeItem(ACTIVE_COSMETIC_KEY);
  } catch { /* ignore */ }
}
