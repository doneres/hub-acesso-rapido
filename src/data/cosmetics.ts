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
  /** Cor de fundo do hub */
  lightBg: string;
  darkBg: string;
  /** Padrão SVG (não usado no main bg — mantido p/ compatibilidade) */
  patternLight: string;
  patternDark: string;
  /** Cores de destaque */
  accent1: string;
  accent2: string;
}

/* ── Padrões SVG ─────────────────────────────────────────────────────────── */
export const COPA_PATTERN_LIGHT = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Cpath d='M14 2 L26 14 L14 26 L2 14 Z' fill='none' stroke='%23FFD100' stroke-width='0.9' opacity='0.13'/%3E%3C/svg%3E")`;
export const COPA_PATTERN_DARK  = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Cpath d='M14 2 L26 14 L14 26 L2 14 Z' fill='none' stroke='%23009C3B' stroke-width='0.8' opacity='0.09'/%3E%3C/svg%3E")`;

/* ── Cosméticos disponíveis ──────────────────────────────────────────── */
export const COSMETICS: CosmeticDef[] = [
  /* ─── Copa do Mundo 2026 ──────────────────────────────────────────── */
  {
    id: 'copa-2026',
    name: 'Copa do Mundo 2026',
    desc: 'Gramado real com marcações oficiais, cards viram camisas de 10 seleções, bola rolando pela tela e vuvuzelas brotando do nada. O Hub vira estádio.',
    cost: 300,
    emoji: '⚽',
    tag: 'COPA 2026',
    tagColor: '#FFD700',
    previewGradient: 'linear-gradient(135deg,#003d1a 0%,#009C3B 35%,#FFD100 70%,#002776 100%)',
    lightBg: '#1f7028',
    darkBg:  '#152f17',
    patternLight: COPA_PATTERN_LIGHT,
    patternDark:  COPA_PATTERN_DARK,
    accent1: '#FFD100',
    accent2: '#009C3B',
  },

  /* ─── Fallout: New Vegas ──────────────────────────────────────────── */
  {
    id: 'fallout-nv',
    name: 'Fallout: New Vegas',
    desc: 'O Pip-Boy 3000 Mark IV tomou conta do Hub. Interface terminal verde fosforescente, scanline CRT, símbolos de radiação flutuando e cards como inventário do Wasteland. War never changes.',
    cost: 800,
    emoji: '☢️',
    tag: 'FALLOUT NV',
    tagColor: '#00d632',
    previewGradient: 'linear-gradient(135deg,#040a02 0%,#0b1f07 40%,#00d632 75%,#1a3d0f 100%)',
    lightBg: '#07100503',
    darkBg:  '#050a03',
    patternLight: '',
    patternDark:  '',
    accent1: '#00d632',
    accent2: '#f5a023',
  },

  /* ─── Counter-Strike 1.6 ──────────────────────────────────────────── */
  {
    id: 'csgo-16',
    name: 'Counter-Strike 1.6',
    desc: 'O Hub virou servidor dedicado. Buy menu tático com lado CT ou T em cada card, mira no centro do mapa, sites A e B marcados e alerta piscante de BOMB PLANTED. Buy or die.',
    cost: 700,
    emoji: '💣',
    tag: 'CS 1.6',
    tagColor: '#FF6600',
    previewGradient: 'linear-gradient(135deg,#080b08 0%,#1a1f1a 35%,#FF6600 65%,#3a7bd5 100%)',
    lightBg: '#0a0c0a',
    darkBg:  '#080a08',
    patternLight: '',
    patternDark:  '',
    accent1: '#FF6600',
    accent2: '#3a7bd5',
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
