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

  /* ─── Minecraft ────────────────────────────────────────────────── */
  {
    id: 'minecraft',
    name: 'Minecraft',
    desc: 'O Hub virou um mundo novo. Cards são blocos de pedra com borda de grama, Creeper atravessa a tela, achievements aparecem no canto. É hora de construir.',
    cost: 400,
    emoji: '⛏️',
    tag: 'MINECRAFT',
    tagColor: '#5D9E40',
    previewGradient: 'linear-gradient(135deg,#1a1a1a 0%,#3a3a3a 30%,#5D9E40 65%,#8B5E3C 100%)',
    lightBg: '#1c2a14',
    darkBg:  '#121c0d',
    patternLight: '',
    patternDark:  '',
    accent1: '#5D9E40',
    accent2: '#8B5E3C',
  },

  /* ─── Dark Souls ───────────────────────────────────────────────── */
  {
    id: 'dark-souls',
    name: 'Dark Souls',
    desc: 'Prepare to die. Embers flutuam, cards forjados nas cinzas, fogueira no fundo. Acertos: "ENEMY FELLED". Erros: "YOU DIED". Que a chama persista.',
    cost: 600,
    emoji: '🔥',
    tag: 'DARK SOULS',
    tagColor: '#c7832a',
    previewGradient: 'linear-gradient(135deg,#0a0602 0%,#1a0e06 40%,#8c4a10 70%,#c7832a 100%)',
    lightBg: '#100c08',
    darkBg:  '#080503',
    patternLight: '',
    patternDark:  '',
    accent1: '#c7832a',
    accent2: '#e8c97a',
  },

  /* ─── The Matrix ───────────────────────────────────────────────── */
  {
    id: 'matrix',
    name: 'The Matrix',
    desc: 'Red pill ou blue pill? Chuva de código verde, cards como terminais de sistema, "ACCESS GRANTED" ao acertar. Follow the white rabbit.',
    cost: 500,
    emoji: '💊',
    tag: 'THE MATRIX',
    tagColor: '#00ff41',
    previewGradient: 'linear-gradient(135deg,#000 0%,#001200 40%,#003300 70%,#00ff41 100%)',
    lightBg: '#000800',
    darkBg:  '#000500',
    patternLight: '',
    patternDark:  '',
    accent1: '#00ff41',
    accent2: '#00b32c',
  },

  /* ─── Among Us ─────────────────────────────────────────────────── */
  {
    id: 'among-us',
    name: 'Among Us',
    desc: 'Crewmates atravessam o Hub, IMPOSTOR DETECTED pisca no topo, cada tarefa concluída é celebrada. Mas cuidado — um de nós não é quem parece.',
    cost: 450,
    emoji: '🚀',
    tag: 'AMONG US',
    tagColor: '#132ed1',
    previewGradient: 'linear-gradient(135deg,#0a0a1e 0%,#1a1a3e 35%,#c51111 65%,#132ed1 100%)',
    lightBg: '#0e0e22',
    darkBg:  '#080814',
    patternLight: '',
    patternDark:  '',
    accent1: '#132ed1',
    accent2: '#c51111',
  },

  /* ─── Pokémon ──────────────────────────────────────────────────── */
  {
    id: 'pokemon',
    name: 'Pokémon',
    desc: "Ser o melhor, ninguém jamais conseguiu… até agora. Pokébola rola na tela, wild Pokémon aparece no hub e cada acerto é SUPER EFETIVO! Gotta catch 'em all.",
    cost: 550,
    emoji: '⚡',
    tag: 'POKÉMON',
    tagColor: '#EE1515',
    previewGradient: 'linear-gradient(135deg,#1a3a6e 0%,#2455a4 35%,#EE1515 65%,#FFDE00 100%)',
    lightBg: '#0d1e3e',
    darkBg:  '#080f22',
    patternLight: '',
    patternDark:  '',
    accent1: '#EE1515',
    accent2: '#FFDE00',
  },

  /* ─── Hollow Knight ─────────────────────────────────────────────── */
  {
    id: 'hollow-knight',
    name: 'Hollow Knight',
    desc: 'O Reino de Hallownest aguarda nas cavernas. Soul orbs flutuam no escuro, O Cavaleiro silencioso atravessa o Hub com sua Nail, Geo tintila pelo chão. Dream Nail. Vessel Filled. A luz permanece.',
    cost: 650,
    emoji: '🗡️',
    tag: 'HOLLOW KNIGHT',
    tagColor: '#c5e8f0',
    previewGradient: 'linear-gradient(135deg,#050607 0%,#0c1018 40%,#1a2332 70%,#c5e8f0 100%)',
    lightBg: '#0c1018',
    darkBg:  '#070809',
    patternLight: '',
    patternDark:  '',
    accent1: '#c5e8f0',
    accent2: '#e8d870',
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
