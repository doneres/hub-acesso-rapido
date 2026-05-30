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

/* ── Padrão jacquard: losangos da camisa da Seleção Brasileira ────────── */
export const COPA_PATTERN_LIGHT = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Cpath d='M14 2 L26 14 L14 26 L2 14 Z' fill='none' stroke='%23FFD100' stroke-width='0.9' opacity='0.13'/%3E%3C/svg%3E")`;
export const COPA_PATTERN_DARK  = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Cpath d='M14 2 L26 14 L14 26 L2 14 Z' fill='none' stroke='%23009C3B' stroke-width='0.8' opacity='0.09'/%3E%3C/svg%3E")`;

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
    previewGradient: 'linear-gradient(135deg,#003d1a 0%,#009C3B 35%,#FFD100 70%,#002776 100%)',
    lightBg: '#fffef0',
    darkBg: '#030a02',
    patternLight: COPA_PATTERN_LIGHT,
    patternDark: COPA_PATTERN_DARK,
    accent1: '#FFD100',   // amarelo Canarinho
    accent2: '#009C3B',   // verde
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
