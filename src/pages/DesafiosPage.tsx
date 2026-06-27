import React, { useState, ElementType } from 'react';
import {
  Home, Sun, Moon, Trophy, Bug, Hash, Brain, Cpu,
  Search, Eye, Star, Crown, BookOpen, Lightbulb,
  CheckCircle2, XCircle, Zap, ChevronDown, ChevronUp,
  LogIn, UserPlus, LogOut, Shield, Lock, User,
  Medal, X, Info, ArrowRight, ShoppingBag, AlertTriangle,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useGameState, GameUser, Powerups, computeEarned } from '../hooks/useGameState';
import { PUZZLES, CATEGORY_CONFIG, getRank, Puzzle } from '../data/puzzles';

/* ── Keyframes injetados como <style> ──────────────────────────────────── */
const ANIM_CSS = `
  @keyframes heroJump {
    0%,100% { transform: translateY(0px); }
    25%     { transform: translateY(-36px); }
    50%     { transform: translateY(-40px); }
    75%     { transform: translateY(-8px); }
  }
  @keyframes tileScroll {
    from { background-position: 0 0; }
    to   { background-position: -20px 0; }
  }
  @keyframes slideObs {
    from { transform: translateX(1100px); }
    to   { transform: translateX(-160px); }
  }
  @keyframes coinSpin {
    0%,100% { transform: scaleX(1); }
    50%     { transform: scaleX(0.15); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translate(-50%, 12px); }
    to   { opacity: 1; transform: translate(-50%, 0); }
  }
  @keyframes levelPop {
    0%  { transform: scale(1); }
    50% { transform: scale(1.015); }
    100%{ transform: scale(1); }
  }
  @keyframes golOverlayFade {
    0%   { opacity: 0; }
    12%  { opacity: 1; }
    75%  { opacity: 1; }
    100% { opacity: 0; }
  }
  @keyframes golBallSpin {
    from { transform: scale(0.1) rotate(0deg); }
    to   { transform: scale(1) rotate(720deg); }
  }
  @keyframes golTextPop {
    0%   { transform: scale(0) rotate(-8deg); opacity: 0; }
    40%  { transform: scale(1.3) rotate(4deg); opacity: 1; }
    60%  { transform: scale(1.08) rotate(-2deg); }
    100% { transform: scale(1.12) rotate(0deg); opacity: 1; }
  }
  @keyframes golStarBurst {
    0%   { transform: scale(0); opacity: 1; }
    100% { transform: scale(2.5); opacity: 0; }
  }
  @keyframes critHitFlash {
    0%   { background: #020c01; }
    8%   { background: #0a2a09; }
    80%  { background: #020c01; opacity: 1; }
    100% { background: #020c01; opacity: 0; }
  }
  @keyframes critHitEnter {
    from { opacity: 0; transform: translateY(18px) scale(0.94); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes terminalBlink {
    0%,49% { opacity: 1; }
    50%,100%{ opacity: 0; }
  }
  @keyframes headshotFlash {
    0%   { background: #2a0000; }
    6%   { background: #6a0000; }
    14%  { background: #120808; opacity: 1; }
    80%  { background: #080808; opacity: 1; }
    100% { background: #080808; opacity: 0; }
  }
  @keyframes headshotText {
    0%   { transform: scale(0.1) rotate(-6deg); opacity: 0; filter: blur(6px); }
    35%  { transform: scale(1.18) rotate(2deg); opacity: 1; filter: blur(0); }
    55%  { transform: scale(0.96) rotate(-1deg); }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes mcAchieveOverlay {
    0%   { background: #1a1a1a; }
    8%   { background: #242424; opacity: 1; }
    75%  { background: #1c1c1c; opacity: 1; }
    100% { opacity: 0; }
  }
  @keyframes mcBlockPop {
    0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
    40%  { transform: scale(1.2) rotate(4deg); opacity: 1; }
    60%  { transform: scale(0.96) rotate(-2deg); }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes youDiedAnim {
    0%   { background: #000; }
    12%  { background: #1a0202; }
    30%  { background: #320404; opacity: 1; }
    72%  { background: #0d0101; opacity: 1; }
    100% { background: #000; opacity: 0; }
  }
  @keyframes youDiedText {
    0%   { opacity: 0; letter-spacing: 0.55em; transform: scale(0.88); }
    25%  { opacity: 1; letter-spacing: 0.12em; transform: scale(1); }
    75%  { opacity: 1; }
    100% { opacity: 0; }
  }
  @keyframes enemyFelledAnim {
    0%   { background: #070402; }
    10%  { background: #100b04; opacity: 1; }
    75%  { background: #060301; opacity: 1; }
    100% { opacity: 0; }
  }
  @keyframes accessGrantedAnim {
    0%   { background: #000; }
    8%   { background: #001800; opacity: 1; }
    75%  { background: #000c00; opacity: 1; }
    100% { opacity: 0; }
  }
  @keyframes accessText {
    from { opacity: 0; letter-spacing: 0.4em; }
    to   { opacity: 1; letter-spacing: 0.12em; }
  }
  @keyframes taskCompleteAnim {
    0%   { background: #0a0a1e; }
    8%   { background: #0d1540; opacity: 1; }
    75%  { background: #080e28; opacity: 1; }
    100% { opacity: 0; }
  }
  @keyframes superEfetivoAnim {
    0%   { background: #0d1e3e; }
    8%   { background: #102560; opacity: 1; }
    75%  { background: #0a1830; opacity: 1; }
    100% { opacity: 0; }
  }
  @keyframes pokeTextPop {
    0%   { transform: scale(0) rotate(-6deg); opacity: 0; }
    38%  { transform: scale(1.25) rotate(3deg); opacity: 1; }
    58%  { transform: scale(0.97) rotate(-1deg); }
    100% { transform: scale(1.04) rotate(0deg); opacity: 1; }
  }
`;

/* ── Diamantes jacquard caindo — confetti inspirado na camisa ─────────── */
const COPA_DIAMONDS_DATA = [
  { c:'#FFD100', l:'4%',  s:10, dur:2.1, delay:0.00, rot: 20  },
  { c:'#009C3B', l:'10%', s: 8, dur:2.4, delay:0.10, rot:-15  },
  { c:'#002776', l:'17%', s:11, dur:2.0, delay:0.22, rot: 40  },
  { c:'#FFD100', l:'24%', s: 7, dur:2.6, delay:0.05, rot:-30  },
  { c:'#ffffff', l:'31%', s: 9, dur:2.2, delay:0.18, rot: 10  },
  { c:'#009C3B', l:'38%', s:12, dur:1.9, delay:0.30, rot:-45  },
  { c:'#FFD100', l:'45%', s: 8, dur:2.5, delay:0.08, rot: 25  },
  { c:'#002776', l:'52%', s:10, dur:2.1, delay:0.25, rot:-20  },
  { c:'#FFD100', l:'59%', s: 7, dur:2.7, delay:0.12, rot: 35  },
  { c:'#009C3B', l:'66%', s:11, dur:2.0, delay:0.35, rot:-10  },
  { c:'#ffffff', l:'73%', s: 9, dur:2.3, delay:0.20, rot: 50  },
  { c:'#FFD100', l:'80%', s: 8, dur:2.4, delay:0.42, rot:-35  },
  { c:'#002776', l:'87%', s:10, dur:2.1, delay:0.15, rot: 15  },
  { c:'#009C3B', l:'93%', s: 7, dur:2.6, delay:0.28, rot:-25  },
  // segunda onda
  { c:'#FFD100', l:'7%',  s: 9, dur:2.3, delay:0.48, rot: 30  },
  { c:'#002776', l:'21%', s:11, dur:2.0, delay:0.55, rot:-40  },
  { c:'#009C3B', l:'35%', s: 8, dur:2.2, delay:0.38, rot: 18  },
  { c:'#FFD100', l:'49%', s:10, dur:2.5, delay:0.45, rot:-22  },
  { c:'#ffffff', l:'63%', s: 7, dur:2.1, delay:0.50, rot: 42  },
  { c:'#FFD100', l:'77%', s:12, dur:2.3, delay:0.32, rot:-12  },
  { c:'#002776', l:'90%', s: 9, dur:2.0, delay:0.40, rot: 28  },
];

function CopaConfetti() {
  return (
    <>
      {COPA_DIAMONDS_DATA.map((d, i) => (
        <div
          key={i}
          className="copa-diamond"
          style={{
            left: d.l,
            width: d.s,
            height: d.s,
            background: d.c,
            '--dur':   `${d.dur}s`,
            '--delay': `${d.delay}s`,
            '--rot':   `${d.rot}deg`,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
}

/* ── Theme ─────────────────────────────────────────────────────────────── */
function getTheme(isDark: boolean) {
  return isDark ? {
    pageBg:      '#080d1a',
    topBg:       '#0a0f1e',
    topBorder:   '#2a1a4e',
    heroBg:      '#0a0f1e',
    gridColor:   'rgba(167,139,250,0.05)',
    cardBg:      '#111827',
    cardBorder:  '#2a1a4e',
    cardShadow:  '#0a0520',
    modalBg:     '#0e1425',
    text:        '#e2e8f0',
    textSec:     '#94a3b8',
    textMut:     '#475569',
    inputBg:     '#0a0f1e',
    inputBorder: '#2a1a4e',
    accent:      '#a78bfa',
    accentDim:   'rgba(167,139,250,0.12)',
    divider:     '#1e2a3a',
    codeBg:      '#0d1117',
  } : {
    pageBg:      '#f8f6ff',
    topBg:       '#ffffff',
    topBorder:   '#ede9fe',
    heroBg:      '#f3eeff',
    gridColor:   'rgba(109,40,217,0.07)',
    cardBg:      '#ffffff',
    cardBorder:  '#ede9fe',
    cardShadow:  '#ddd6fe',
    modalBg:     '#ffffff',
    text:        '#0f172a',
    textSec:     '#334155',
    textMut:     '#64748b',
    inputBg:     '#f8f6ff',
    inputBorder: '#ede9fe',
    accent:      '#7c3aed',
    accentDim:   'rgba(124,58,237,0.08)',
    divider:     '#ede9fe',
    codeBg:      '#1e1e2e',
  };
}

/* ── Icon lookup ───────────────────────────────────────────────────────── */
const ICON_MAP: Record<string, ElementType> = {
  Trophy, Bug, Hash, Brain, Cpu, Search, Eye, Star, Crown,
  BookOpen, Lightbulb, CheckCircle2, XCircle, Shield, Medal,
};
function LIcon({ name, size = 18, color }: { name: string; size?: number; color?: string }) {
  const Ic = ICON_MAP[name];
  return Ic ? <Ic size={size} color={color} /> : null;
}

/* ── Constants ──────────────────────────────────────────────────────────── */
const AVATARS = ['🕵','🔍','🧠','🤖','💻','🎯','⚡','🦊','🐉','🚀','🎲','🦁'];

const DIFF_COLOR: Record<string, string> = {
  Iniciante: '#22c55e', Intermediário: '#f59e0b', Avançado: '#ef4444',
};

const RANKS_IN_ORDER = [0, 75, 200, 500, 1000];

/* ── Sistema de Níveis ─────────────────────────────────────────────────── */
const LEVELS = [
  {
    id: 1, label: 'RECRUTA',
    color: '#22c55e', glow: 'rgba(34,197,94,0.2)',
    desc: 'Iniciante — casos fundamentais de programação, lógica e matemática',
    puzzleIds: [
      'bug-01','bug-02','seq-01','seq-02','log-01','log-02','alg-01',
      'bug-07','bug-08','bug-09','log-06','seq-06','seq-07','seq-09','seq-10',
      // IMD 2018
      'seq-11','seq-12','alg-11','alg-12','alg-13','bug-10','bug-11','bug-12',
    ],
    neededToUnlockNext: 10,
  },
  {
    id: 2, label: 'INVESTIGADOR',
    color: '#f59e0b', glow: 'rgba(245,158,11,0.2)',
    desc: 'Intermediário — raciocínio lógico, algoritmos e matemática aplicada',
    puzzleIds: [
      'bug-03','bug-04','seq-03','seq-04','log-03','log-04','alg-02','alg-03',
      'log-07','log-08','seq-08','alg-06','alg-07','alg-08',
      // IMD 2018
      'log-11','log-12','log-13','alg-14','alg-15','alg-18','alg-19','bug-13',
    ],
    neededToUnlockNext: 10,
  },
  {
    id: 3, label: 'ELITE',
    color: '#ef4444', glow: 'rgba(239,68,68,0.2)',
    desc: 'Avançado — lógica filosófica, puzzles clássicos e raciocínio profundo',
    puzzleIds: [
      'bug-05','bug-06','seq-05','log-05','alg-04',
      // IMD 2018
      'log-14','alg-16','alg-17',
    ],
    neededToUnlockNext: 5,
  },
  {
    id: 4, label: 'ESPECIALISTA',
    color: '#a855f7', glow: 'rgba(168,85,247,0.2)',
    desc: 'Mestre — os desafios mais complexos: silogismos, otimização e paradoxos',
    puzzleIds: [
      'log-09','alg-05','log-10','alg-09','alg-10',
      // IMD 2018
      'log-15',
    ],
    neededToUnlockNext: null,
  },
] as const;

function isLevelUnlocked(levelIdx: number, solvedPuzzles: string[]): boolean {
  if (levelIdx === 0) return true;
  const prev = LEVELS[levelIdx - 1];
  const prevSolved = (prev.puzzleIds as readonly string[]).filter(id => solvedPuzzles.includes(id)).length;
  return prevSolved >= (prev.neededToUnlockNext ?? 0);
}

/* ════════════════════════════════════════════════════════════════════════
   GD RUNNER — animação Geometry Dash no hero
════════════════════════════════════════════════════════════════════════ */
/* ════════════════════════════════════════════════════════════════════════
   PIXEL RUNNER — Mario-style decorativo no hero
════════════════════════════════════════════════════════════════════════ */
function PixelRunner({ T, isDark }: { T: ReturnType<typeof getTheme>; isDark: boolean }) {
  const groundBg = isDark
    ? `repeating-linear-gradient(90deg,${T.accent}25 0,${T.accent}25 18px,${T.accent}50 18px,${T.accent}50 20px)`
    : `repeating-linear-gradient(90deg,${T.accent}18 0,${T.accent}18 18px,${T.accent}38 18px,${T.accent}38 20px)`;

  /* tubo estilo Mario */
  const Pipe = ({ h }: { h: number }) => (
    <div>
      <div style={{ width: 30, height: 8, background: '#22c55e', marginLeft: -3, boxShadow: 'inset -3px 0 0 rgba(0,0,0,0.25)' }} />
      <div style={{ width: 24, height: h, background: '#16a34a', boxShadow: 'inset -3px 0 0 rgba(0,0,0,0.2)' }} />
    </div>
  );

  /* bloco ? */
  const QBlock = () => (
    <div style={{ width: 20, height: 20, background: '#f59e0b', border: '2px solid #d97706',
      boxShadow: '2px 2px 0 #92400e, inset 0 1px 0 rgba(255,255,255,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#fff', lineHeight: 1 }}>?</span>
    </div>
  );

  const obs = (delay: number, child: React.ReactNode, bottom: number) => (
    <div style={{ position: 'absolute', bottom, left: 0,
      animation: `slideObs 3.2s linear infinite ${delay}s`,
      animationFillMode: 'backwards',
    }}>
      {child}
    </div>
  );

  return (
    <div style={{ position: 'relative', width: '100%', height: 90, overflow: 'hidden', marginTop: 16 }}>

      {/* Chão com tiles rolando */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 22,
        backgroundImage: groundBg,
        animation: 'tileScroll 0.35s linear infinite',
      }} />
      {/* Linha superior do chão */}
      <div style={{ position: 'absolute', bottom: 22, left: 0, right: 0, height: 3,
        background: isDark ? `${T.accent}70` : `${T.accent}55` }} />

      {/* ── PERSONAGEM (fixo em x=80, pula em y) ── */}
      <div style={{ position: 'absolute', left: 80, bottom: 25,
        animation: 'heroJump 1.3s ease-in-out infinite' }}>
        {/* Chapéu - parte de cima */}
        <div style={{ marginLeft: 4 }}>
          <div style={{ width: 16, height: 5, background: '#ef4444' }} />
        </div>
        {/* Chapéu - aba */}
        <div style={{ width: 24, height: 4, background: '#ef4444', marginBottom: 0 }} />
        {/* Rosto */}
        <div style={{ width: 22, height: 14, background: '#fbbf24', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 3, left: 3, width: 4, height: 4, background: '#1e293b' }} />
          <div style={{ position: 'absolute', top: 3, right: 3, width: 4, height: 4, background: '#1e293b' }} />
          <div style={{ position: 'absolute', bottom: 2, left: 3, width: 14, height: 4, background: '#92400e', borderRadius: '0 0 2px 2px' }} />
        </div>
        {/* Corpo - macacão */}
        <div style={{ width: 22, height: 10, background: '#3b82f6' }} />
        {/* Pernas */}
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 8, height: 7, background: '#ef4444' }} />
          <div style={{ width: 8, height: 7, background: '#ef4444' }} />
        </div>
        {/* Sapatos */}
        <div style={{ display: 'flex', gap: 4, marginTop: 0 }}>
          <div style={{ width: 10, height: 5, background: '#92400e' }} />
          <div style={{ width: 10, height: 5, background: '#92400e' }} />
        </div>
      </div>

      {/* ── OBSTÁCULOS — todos usam slideObs com delays diferentes ── */}

      {/* Tubo alto */}
      {obs(0, <Pipe h={38} />, 25)}

      {/* Tubo baixo */}
      {obs(1.6, <Pipe h={26} />, 25)}

      {/* Bloco ? flutuante */}
      {obs(0.8, <QBlock />, 58)}

      {/* Moeda */}
      {obs(2.4,
        <div style={{ width: 14, height: 14, background: '#fbbf24', border: '2px solid #d97706',
          animation: 'coinSpin 0.5s linear infinite',
          boxShadow: '0 0 6px #fbbf2480' }} />,
        60,
      )}

      {/* Tubo duplo (dois juntos) */}
      {obs(3.0,
        <div style={{ display: 'flex', gap: 4 }}>
          <Pipe h={30} />
          <Pipe h={22} />
        </div>,
        25,
      )}

      {/* Vignette lateral */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `linear-gradient(90deg,${T.heroBg} 0%,transparent 14%,transparent 86%,${T.heroBg} 100%)`,
      }} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   TUTORIAL MODAL
════════════════════════════════════════════════════════════════════════ */
function TutorialModal({ T, isDark, onClose }: {
  T: ReturnType<typeof getTheme>; isDark: boolean; onClose: () => void;
}) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'O QUE É DETETIVE DE CÓDIGO?',
      content: (
        <div>
          <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.7, marginBottom: 20 }}>
            Uma plataforma gamificada onde você resolve casos de lógica, programação e matemática — como um verdadeiro detetive digital.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
              const iconName = key === 'bug' ? 'Bug' : key === 'sequencia' ? 'Hash' : key === 'logica' ? 'Brain' : 'Cpu';
              const desc = key === 'bug' ? 'Encontre erros no código' : key === 'sequencia' ? 'Descubra o próximo número' : key === 'logica' ? 'Deduza com lógica pura' : 'Analise algoritmos';
              return (
                <div key={key} style={{ padding: '12px 14px', background: cfg.bg, border: `2px solid ${cfg.color}40`, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <LIcon name={iconName} size={18} color={cfg.color} />
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 900, color: cfg.color }}>{cfg.label}</div>
                    <div style={{ fontSize: 11, color: T.textMut }}>{desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ),
    },
    {
      title: 'PROGRESSÃO POR NÍVEIS',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.7 }}>
            Os casos estão divididos em <strong style={{ color: T.accent }}>3 níveis</strong>. Resolva casos suficientes para desbloquear o próximo!
          </p>
          {LEVELS.map((lv, i) => (
            <div key={lv.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: T.cardBg, border: `2px solid ${lv.color}40`, boxShadow: `3px 3px 0 ${lv.color}20` }}>
              <div style={{ width: 36, height: 36, background: lv.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `2px 2px 0 ${lv.color}60` }}>
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: '#fff' }}>0{lv.id}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: lv.color }}>{lv.label}</div>
                <div style={{ fontSize: 12, color: T.textMut, marginTop: 3 }}>
                  {i === 0 ? 'Sempre disponível' : `Resolva ${LEVELS[i-1].neededToUnlockNext}/${LEVELS[i-1].puzzleIds.length} do nível anterior`}
                </div>
              </div>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: T.textMut }}>{lv.puzzleIds.length} CASOS</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'COMO PONTUAR?',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Iniciante', pts: 10, color: '#22c55e' },
            { label: 'Intermediário', pts: 25, color: '#f59e0b' },
            { label: 'Avançado', pts: 50, color: '#ef4444' },
          ].map(d => (
            <div key={d.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: T.cardBg, border: `2px solid ${d.color}40`, boxShadow: `3px 3px 0 ${d.color}20` }}>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: d.color }}>{d.label.toUpperCase()}</span>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: d.color }}>+{d.pts} PTS</span>
            </div>
          ))}
          <div style={{ padding: '12px 16px', background: T.accentDim, border: `2px solid ${T.accent}40`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Zap size={16} color={T.accent} />
            <span style={{ fontSize: 13, color: T.textSec }}>A cada <strong style={{ color: T.accent }}>5 acertos seguidos</strong>, ganhe <strong style={{ color: T.accent }}>+10 pts</strong> bônus!</span>
          </div>
          <div style={{ padding: '12px 16px', background: T.cardBg, border: `2px solid ${T.textMut}30`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Lightbulb size={16} color='#fbbf24' />
            <span style={{ fontSize: 13, color: T.textSec }}>Pedir uma dica custa <strong style={{ color: '#fbbf24' }}>-5 pts</strong> do prêmio do caso.</span>
          </div>
        </div>
      ),
    },
    {
      title: 'SALVE SEU PROGRESSO',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.7 }}>
            Crie um perfil com <strong style={{ color: T.accent }}>usuário e senha</strong> para salvar sua pontuação e continuar de onde parou em qualquer computador.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: <UserPlus size={16} color={T.accent} />, text: 'Crie uma conta com usuário e senha' },
              { icon: <LogIn size={16} color='#34d399' />, text: 'Faça login em qualquer computador' },
              { icon: <Trophy size={16} color='#fbbf24' />, text: 'Compete no placar geral da escola' },
              { icon: <Shield size={16} color='#60a5fa' />, text: 'Seus pontos ficam guardados com segurança' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: T.cardBg, border: `2px solid ${T.cardBorder}` }}>
                {item.icon}
                <span style={{ fontSize: 13, color: T.textSec }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  const cur = steps[step];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(4px)' }}>
      <div style={{ width: '100%', maxWidth: 520, background: T.modalBg, border: `2px solid ${T.accent}`, boxShadow: `6px 6px 0 ${T.accent}40` }}>
        <div style={{ padding: '16px 20px', borderBottom: `2px solid ${T.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.accentDim }}>
          <div>
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: T.accent }}>TUTORIAL · {step + 1}/{steps.length}</span>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: isDark ? 10 : 9, color: T.text, marginTop: 6, lineHeight: 1.5 }}>{cur.title}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textMut, padding: 4 }}><X size={18} /></button>
        </div>
        <div style={{ padding: 20, flex: 1, overflowY: 'auto', maxHeight: '55vh' }}>{cur.content}</div>
        <div style={{ padding: '16px 20px', borderTop: `2px solid ${T.topBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {steps.map((_, i) => (
              <div key={i} style={{ width: i === step ? 18 : 8, height: 8, background: i === step ? T.accent : T.textMut + '40', transition: 'all .2s' }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                style={{ padding: '10px 16px', background: 'none', border: `2px solid ${T.cardBorder}`, color: T.textMut, fontFamily: "'Press Start 2P', monospace", fontSize: 9, cursor: 'pointer' }}>
                ←
              </button>
            )}
            {step < steps.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: T.accent, border: 'none', color: '#fff', fontFamily: "'Press Start 2P', monospace", fontSize: 9, cursor: 'pointer', boxShadow: `3px 3px 0 ${T.accent}60` }}>
                PRÓXIMO <ArrowRight size={14} />
              </button>
            ) : (
              <button onClick={onClose}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: T.accent, border: 'none', color: '#fff', fontFamily: "'Press Start 2P', monospace", fontSize: 9, cursor: 'pointer', boxShadow: `3px 3px 0 ${T.accent}60` }}>
                COMEÇAR! <Trophy size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   AUTH MODAL
════════════════════════════════════════════════════════════════════════ */
function AuthModal({ T, isDark, users, onLogin, onRegister, onClose }: {
  T: ReturnType<typeof getTheme>; isDark: boolean; users: GameUser[];
  onLogin: (name: string, pass: string) => Promise<'ok' | 'wrong-password' | 'not-found'>;
  onRegister: (name: string, avatar: string, pass: string) => Promise<string>;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<'login' | 'register'>(users.length > 0 ? 'login' : 'register');
  const [name, setName]     = useState('');
  const [pass, setPass]     = useState('');
  const [pass2, setPass2]   = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    padding: '10px 14px', paddingLeft: 34,
    background: T.inputBg, border: `2px solid ${T.inputBorder}`,
    color: T.text, fontSize: 14, fontFamily: 'inherit', outline: 'none',
  };

  const handleLogin = async () => {
    if (!name.trim() || !pass) { setError('Preencha usuário e senha.'); return; }
    setLoading(true); setError('');
    const result = await onLogin(name.trim(), pass);
    setLoading(false);
    if (result === 'not-found') { setError('Usuário não encontrado.'); return; }
    if (result === 'wrong-password') { setError('Senha incorreta. Tente novamente.'); return; }
    onClose();
  };

  const handleRegister = async () => {
    if (!name.trim()) { setError('Digite um nome de usuário.'); return; }
    if (name.trim().length < 3) { setError('Mínimo de 3 caracteres.'); return; }
    if (pass.length < 4) { setError('Senha com pelo menos 4 caracteres.'); return; }
    if (pass !== pass2) { setError('As senhas não coincidem.'); return; }
    if (users.some(u => u.name.toLowerCase() === name.trim().toLowerCase())) {
      setError('Esse nome já está em uso. Faça login.'); return;
    }
    setLoading(true); setError('');
    await onRegister(name.trim(), avatar, pass);
    setLoading(false);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(4px)' }}>
      <div style={{ width: '100%', maxWidth: 420, background: T.modalBg, border: `2px solid ${T.accent}`, boxShadow: `6px 6px 0 ${T.accent}40` }}>
        <div style={{ padding: '16px 20px', background: T.accentDim, borderBottom: `2px solid ${T.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: T.accent }}>DETETIVE DE CÓDIGO</div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: T.text, marginTop: 6 }}>
              {mode === 'login' ? 'IDENTIFICAÇÃO' : 'CRIAR CONTA'}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textMut }}><X size={18} /></button>
        </div>

        {users.length > 0 && (
          <div style={{ display: 'flex', borderBottom: `2px solid ${T.topBorder}` }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                style={{ flex: 1, padding: '12px', background: mode === m ? T.accentDim : T.cardBg, border: 'none', borderBottom: mode === m ? `2px solid ${T.accent}` : 'none', cursor: 'pointer', fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: mode === m ? T.accent : T.textMut }}>
                {m === 'login' ? 'ENTRAR' : 'CADASTRAR'}
              </button>
            ))}
          </div>
        )}

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'register' && (
            <div>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: T.textMut, marginBottom: 10 }}>AVATAR</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
                {AVATARS.map(a => (
                  <button key={a} onClick={() => setAvatar(a)}
                    style={{ height: 40, fontSize: 20, background: avatar === a ? T.accentDim : T.cardBg, border: `2px solid ${avatar === a ? T.accent : T.cardBorder}`, cursor: 'pointer', boxShadow: avatar === a ? `2px 2px 0 ${T.accent}50` : `2px 2px 0 ${T.cardShadow}`, transform: avatar === a ? 'translateY(-2px)' : 'none', transition: 'all .1s' }}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: T.textMut, marginBottom: 8 }}>USUÁRIO</div>
            <div style={{ position: 'relative' }}>
              <User size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.textMut }} />
              <input value={name} onChange={e => { setName(e.target.value); setError(''); }}
                placeholder="Digite seu nome de usuário" maxLength={20}
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = T.accent)}
                onBlur={e => (e.currentTarget.style.borderColor = T.inputBorder)} />
            </div>
          </div>

          <div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: T.textMut, marginBottom: 8 }}>SENHA</div>
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.textMut }} />
              <input type="password" value={pass} onChange={e => { setPass(e.target.value); setError(''); }}
                placeholder="Mínimo 4 caracteres"
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = T.accent)}
                onBlur={e => (e.currentTarget.style.borderColor = T.inputBorder)}
                onKeyDown={e => { if (e.key === 'Enter') mode === 'login' ? handleLogin() : handleRegister(); }} />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: T.textMut, marginBottom: 8 }}>CONFIRMAR SENHA</div>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.textMut }} />
                <input type="password" value={pass2} onChange={e => { setPass2(e.target.value); setError(''); }}
                  placeholder="Repita a senha"
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = T.accent)}
                  onBlur={e => (e.currentTarget.style.borderColor = T.inputBorder)}
                  onKeyDown={e => e.key === 'Enter' && handleRegister()} />
              </div>
            </div>
          )}

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#ef444420', border: '2px solid #ef4444' }}>
              <XCircle size={14} color="#ef4444" />
              <span style={{ fontSize: 12, color: '#ef4444' }}>{error}</span>
            </div>
          )}

          <button onClick={mode === 'login' ? handleLogin : handleRegister} disabled={loading}
            style={{ padding: '12px 20px', background: loading ? T.textMut : T.accent, border: 'none', color: '#fff', fontFamily: "'Press Start 2P', monospace", fontSize: 10, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : `4px 4px 0 ${T.accent}60`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: loading ? 0.7 : 1 }}
            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'none'; }}>
            {loading ? 'AGUARDE...' : mode === 'login' ? <><LogIn size={14} /> ENTRAR</> : <><UserPlus size={14} /> CRIAR CONTA</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PUZZLE CARD (dentro dos níveis)
════════════════════════════════════════════════════════════════════════ */
function PuzzleCard({ puzzle, stageNum, levelColor, solved, T, onClick }: {
  puzzle: Puzzle; stageNum: number; levelColor: string;
  solved: boolean; T: ReturnType<typeof getTheme>; onClick: () => void;
}) {
  const [hov, setHov] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        textAlign: 'left', width: '100%', padding: 0, cursor: 'pointer',
        background: T.cardBg,
        border: `2px solid ${hov || solved ? levelColor : T.cardBorder}`,
        boxShadow: hov ? `5px 5px 0 ${levelColor}50` : `3px 3px 0 ${T.cardShadow}`,
        transform: hov ? 'translate(-2px,-2px)' : 'translate(0,0)',
        transition: 'all .15s',
        opacity: solved ? 0.88 : 1,
        position: 'relative',
      }}
    >
      {/* Top color strip */}
      <div style={{ height: 4, background: solved ? levelColor : `${levelColor}60` }} />

      <div style={{ padding: '12px 14px' }}>
        {/* Stage number + solved badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: T.textMut }}>FASE {String(stageNum).padStart(2,'0')}</span>
          {solved
            ? <CheckCircle2 size={14} color={levelColor} />
            : <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: levelColor }}>+{puzzle.points}</span>
          }
        </div>

        {/* Title */}
        <div style={{ fontSize: 13, fontWeight: 900, color: hov ? levelColor : T.text, lineHeight: 1.3, marginBottom: 10, transition: 'color .15s' }}>
          {puzzle.title}
        </div>

        {/* Category + difficulty */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <span style={{ fontSize: 10, color: CATEGORY_CONFIG[puzzle.category].color, fontWeight: 700 }}>
            {CATEGORY_CONFIG[puzzle.category].label}
          </span>
          <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', background: `${DIFF_COLOR[puzzle.difficulty]}20`, color: DIFF_COLOR[puzzle.difficulty] }}>
            {puzzle.difficulty === 'Iniciante' ? 'INIT' : puzzle.difficulty === 'Intermediário' ? 'INTER' : 'AVÇ'}
          </span>
        </div>
      </div>
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   LEVEL CARD — accordion com progressão e lock
════════════════════════════════════════════════════════════════════════ */
function LevelCard({ level, levelIdx, unlocked, expanded, solvedCount, T, isDark, onToggle, onPuzzleClick, isSolved }: {
  level: typeof LEVELS[number];
  levelIdx: number;
  unlocked: boolean;
  expanded: boolean;
  solvedCount: number;
  T: ReturnType<typeof getTheme>;
  isDark: boolean;
  onToggle: () => void;
  onPuzzleClick: (p: Puzzle) => void;
  isSolved: (id: string) => boolean;
}) {
  const puzzles   = PUZZLES.filter(p => (level.puzzleIds as readonly string[]).includes(p.id));
  const total     = puzzles.length;
  const pct       = total > 0 ? (solvedCount / total) * 100 : 0;
  const prevLevel = levelIdx > 0 ? LEVELS[levelIdx - 1] : null;
  const prevSolvedNeeded = prevLevel?.neededToUnlockNext ?? 0;
  const prevSolvedActual = prevLevel
    ? (prevLevel.puzzleIds as readonly string[]).filter(id => isSolved(id)).length
    : 0;

  return (
    <div style={{
      border: `2px solid ${unlocked ? level.color : T.cardBorder}`,
      boxShadow: unlocked
        ? (expanded ? `6px 6px 0 ${level.color}40` : `4px 4px 0 ${level.color}20`)
        : `3px 3px 0 ${T.cardShadow}`,
      transition: 'all .2s',
      animation: unlocked && expanded ? 'levelPop 0.3s ease' : 'none',
    }}>
      {/* Header do nível */}
      <button
        onClick={unlocked ? onToggle : undefined}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 16,
          padding: '20px 24px',
          background: unlocked
            ? (isDark ? `${level.color}12` : `${level.color}08`)
            : T.cardBg,
          border: 'none',
          cursor: unlocked ? 'pointer' : 'not-allowed',
          borderBottom: expanded ? `2px solid ${level.color}30` : 'none',
          textAlign: 'left',
        }}
      >
        {/* Número do nível */}
        <div style={{
          width: 56, height: 56, flexShrink: 0,
          background: unlocked ? level.color : (isDark ? '#1e2a3a' : '#e5e7eb'),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: unlocked ? `4px 4px 0 ${level.color}50` : 'none',
        }}>
          {unlocked
            ? <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 16, color: '#fff' }}>0{level.id}</span>
            : <Lock size={22} color={T.textMut} />
          }
        </div>

        {/* Infos */}
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: unlocked ? level.color : T.textMut, marginBottom: 8 }}>
            NÍVEL {level.id} — {level.label}
          </div>

          {unlocked ? (
            <div>
              {/* Barra de progresso */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{ flex: 1, height: 10, background: isDark ? '#1e2a3a' : '#e5e7eb', position: 'relative', border: `1px solid ${level.color}30` }}>
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    width: `${pct}%`,
                    background: level.color,
                    transition: 'width 0.8s ease',
                    boxShadow: `0 0 8px ${level.color}80`,
                  }} />
                </div>
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: level.color, whiteSpace: 'nowrap' }}>
                  {solvedCount}/{total}
                </span>
              </div>
              <div style={{ fontSize: 12, color: T.textMut }}>{level.desc}</div>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: T.textMut }}>
              🔒 Resolva <strong style={{ color: T.accent }}>{prevSolvedNeeded - prevSolvedActual}</strong> caso{prevSolvedNeeded - prevSolvedActual !== 1 ? 's' : ''} do Nível {levelIdx} para desbloquear
            </div>
          )}
        </div>

        {/* Seta expand/collapse */}
        {unlocked && (
          <div style={{ color: level.color, flexShrink: 0 }}>
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        )}
      </button>

      {/* Grid de puzzles (expandido) */}
      {expanded && unlocked && (
        <div style={{ padding: '24px', background: isDark ? `${level.color}05` : `${level.color}03` }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(186px, 1fr))', gap: 12 }}>
            {puzzles.map((puzzle, i) => (
              <PuzzleCard
                key={puzzle.id}
                puzzle={puzzle}
                stageNum={i + 1}
                levelColor={level.color}
                solved={isSolved(puzzle.id)}
                T={T}
                onClick={() => onPuzzleClick(puzzle)}
              />
            ))}
          </div>

          {/* Dica de unlock do próximo nível (se ainda não atingiu) */}
          {level.neededToUnlockNext !== null && solvedCount < level.neededToUnlockNext && (
            <div style={{ marginTop: 20, padding: '12px 16px', background: T.cardBg, border: `2px solid ${level.color}30`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Zap size={14} color={level.color} />
              <span style={{ fontSize: 13, color: T.textMut }}>
                Resolva mais <strong style={{ color: level.color }}>{level.neededToUnlockNext - solvedCount}</strong> caso{level.neededToUnlockNext - solvedCount !== 1 ? 's' : ''} para desbloquear o próximo nível!
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PUZZLE MODAL
════════════════════════════════════════════════════════════════════════ */
function PuzzleModal({ puzzle, T, solved, hintUsed: initHintUsed, wrongCount, hasEliminate, onSolve, onUseHint, onUseEliminate, onClose }: {
  puzzle: Puzzle; T: ReturnType<typeof getTheme>;
  solved: boolean; hintUsed: boolean; wrongCount: number;
  hasEliminate: boolean;
  onSolve: (correct: boolean) => void; onUseHint: () => void;
  onUseEliminate: () => void; onClose: () => void;
}) {
  const [selected, setSelected]       = useState<number | null>(null);
  const [submitted, setSubmitted]     = useState(false);
  const [hintShown, setHintShown]     = useState(initHintUsed);
  const [eliminatedIdx, setEliminated] = useState<number | null>(null);

  const cfg       = CATEGORY_CONFIG[puzzle.category];
  const correct   = submitted && selected === puzzle.answer;
  const optLabels = ['A', 'B', 'C', 'D'];

  // Pré-visualização de pontos que o aluno ganharia SE acertar agora
  const previewPoints = computeEarned(puzzle.points, hintShown, wrongCount);

  const handleEliminate = () => {
    // Escolhe aleatoriamente uma opção errada que ainda não foi eliminada
    const wrong = puzzle.options
      .map((_, i) => i)
      .filter(i => i !== puzzle.answer && i !== eliminatedIdx);
    if (wrong.length === 0) return;
    const pick = wrong[Math.floor(Math.random() * wrong.length)];
    setEliminated(pick);
    onUseEliminate();
  };

  React.useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px', overflowY: 'auto', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}>
      <div style={{ width: '100%', maxWidth: 640, background: T.modalBg, border: `2px solid ${cfg.color}`, borderTop: `4px solid ${cfg.color}`, boxShadow: `6px 6px 0 ${cfg.color}40`, margin: 'auto' }}>
        {/* Header */}
        <div style={{ padding: '14px 18px', borderBottom: `2px solid ${T.topBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: cfg.bg }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: cfg.color }}>{puzzle.caseNumber}</span>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', background: `${DIFF_COLOR[puzzle.difficulty]}20`, color: DIFF_COLOR[puzzle.difficulty] }}>{puzzle.difficulty.toUpperCase()}</span>
              {/* Preview de pontos atual */}
              {!solved && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', background: previewPoints === puzzle.points ? `${cfg.color}20` : '#f59e0b20', color: previewPoints === puzzle.points ? cfg.color : '#d97706', border: `1px solid ${previewPoints === puzzle.points ? cfg.color : '#f59e0b'}40` }}>
                  {previewPoints === puzzle.points ? `+${puzzle.points} PTS` : `+${previewPoints} PTS${wrongCount === 1 ? ' (50%)' : ' (mín)'}`}
                </span>
              )}
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{puzzle.title}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textMut, marginLeft: 16, flexShrink: 0 }}><X size={18} /></button>
        </div>

        <div
          style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 18, userSelect: 'none' }}
          onCopy={e => e.preventDefault()}
          onContextMenu={e => e.preventDefault()}
        >
          {/* Narrative */}
          <div style={{ display: 'flex', gap: 12, padding: '14px 16px', background: T.accentDim, border: `2px solid ${T.accent}30` }}>
            <Search size={16} color={T.accent} style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.7, fontStyle: 'italic', margin: 0 }}>{puzzle.narrative}</p>
          </div>

          {/* Evidence */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 3, height: 14, background: cfg.color }} />
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: T.textMut }}>EVIDÊNCIA</span>
            </div>
            {puzzle.evidenceType === 'code' ? (
              <div style={{ background: '#0d1117', border: `2px solid ${T.topBorder}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#161b22', borderBottom: `1px solid ${T.topBorder}` }}>
                  {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
                  <span style={{ marginLeft: 8, fontSize: 11, color: '#8b949e', fontFamily: 'monospace' }}>{puzzle.language}</span>
                </div>
                <pre style={{ padding: 16, margin: 0, fontSize: 13, color: '#7ee787', fontFamily: 'monospace', overflowX: 'auto', lineHeight: 1.6, whiteSpace: 'pre' }}>{puzzle.evidence}</pre>
              </div>
            ) : puzzle.evidenceType === 'sequence' ? (
              <div style={{ padding: 24, background: T.cardBg, border: `2px dashed ${cfg.color}60`, textAlign: 'center' }}>
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 16, color: cfg.color, letterSpacing: '0.08em' }}>{puzzle.evidence}</span>
              </div>
            ) : (
              <div style={{ padding: 16, background: T.cardBg, border: `2px solid ${T.cardBorder}` }}>
                <pre style={{ margin: 0, fontSize: 13, color: T.textSec, fontFamily: 'inherit', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{puzzle.evidence}</pre>
              </div>
            )}
          </div>

          {/* Hint */}
          {hintShown && (
            <div style={{ display: 'flex', gap: 10, padding: '12px 16px', background: '#fbbf2415', border: '2px solid #fbbf2440' }}>
              <Lightbulb size={16} color="#fbbf24" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: T.textSec, margin: 0, lineHeight: 1.6 }}>{puzzle.hint}</p>
            </div>
          )}

          {/* Aviso de penalidade por tentativas */}
          {wrongCount > 0 && !solved && !submitted && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f59e0b10', border: '2px solid #f59e0b40' }}>
              <AlertTriangle size={14} color="#d97706" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#d97706' }}>
                {wrongCount === 1
                  ? `Tentativa ${wrongCount + 1} — pontos reduzidos para 50% se acertar agora`
                  : `Tentativa ${wrongCount + 1} — apenas 1 pt simbólico se acertar agora`}
              </span>
            </div>
          )}

          {/* Question + options */}
          <div>
            <p style={{ fontSize: 15, fontWeight: 900, color: T.text, marginBottom: 12 }}>{puzzle.question}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {puzzle.options.map((opt, i) => {
                const isElim  = eliminatedIdx === i;
                const isSel   = selected === i;
                const isCorr  = submitted && i === puzzle.answer;
                const isWrong = submitted && isSel && i !== puzzle.answer;
                const disabled = submitted || solved || isElim;

                let borderColor = T.cardBorder, bg = T.cardBg, textColor = T.textSec;
                if (isElim)  { bg = T.cardBg; borderColor = T.textMut + '30'; textColor = T.textMut + '50'; }
                else if (!submitted && isSel) { borderColor = cfg.color; bg = cfg.bg; textColor = T.text; }
                if (isCorr)  { borderColor = '#22c55e'; bg = '#22c55e15'; textColor = '#22c55e'; }
                if (isWrong) { borderColor = '#ef4444'; bg = '#ef444415'; textColor = '#ef4444'; }

                return (
                  <button key={i} disabled={disabled} onClick={() => !isElim && setSelected(i)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: bg, border: `2px solid ${borderColor}`, boxShadow: !submitted && isSel ? `3px 3px 0 ${cfg.color}40` : 'none', cursor: disabled ? 'default' : 'pointer', textAlign: 'left', transition: 'all .1s', color: textColor, fontSize: 14, opacity: isElim ? 0.4 : 1 }}>
                    <span style={{ flexShrink: 0, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isElim ? T.textMut + '20' : (!submitted && isSel) || isCorr || isWrong ? (isCorr ? '#22c55e' : isWrong ? '#ef4444' : cfg.color) : T.accentDim, fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: isElim ? T.textMut : (isSel && !submitted) || isCorr || isWrong ? '#fff' : T.textMut }}>
                      {optLabels[i]}
                    </span>
                    <span style={{ flex: 1, lineHeight: 1.5, textDecoration: isElim ? 'line-through' : 'none' }}>{opt}</span>
                    {isElim  && <XCircle size={14} color={T.textMut} style={{ flexShrink: 0, opacity: 0.5 }} />}
                    {isCorr  && <CheckCircle2 size={16} color="#22c55e" style={{ flexShrink: 0 }} />}
                    {isWrong && <XCircle      size={16} color="#ef4444" style={{ flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resultado */}
          {submitted && (
            <div style={{ padding: '14px 16px', background: correct ? '#22c55e15' : '#ef444415', border: `2px solid ${correct ? '#22c55e' : '#ef4444'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                {correct ? <CheckCircle2 size={16} color="#22c55e" /> : <XCircle size={16} color="#ef4444" />}
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: correct ? '#22c55e' : '#ef4444' }}>
                  {correct
                    ? `CASO RESOLVIDO! +${previewPoints} PTS${previewPoints < puzzle.points ? ' (penalidade aplicada)' : ''}`
                    : 'INVESTIGAÇÃO CONTINUA...'}
                </span>
              </div>
              <p style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7, margin: 0 }}>{puzzle.explanation}</p>
            </div>
          )}

          {solved && !submitted && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: cfg.bg, border: `2px solid ${cfg.color}40` }}>
              <CheckCircle2 size={16} color={cfg.color} />
              <span style={{ fontSize: 13, color: T.textSec }}>Caso já resolvido. Revise a explicação abaixo.</span>
            </div>
          )}

          {/* Ações */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {/* Dica — agora só desconta ao acertar, não imediatamente */}
            {!hintShown && !submitted && !solved && (
              <button onClick={() => { onUseHint(); setHintShown(true); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'none', border: '2px solid #fbbf24', color: '#fbbf24', fontFamily: "'Press Start 2P', monospace", fontSize: 8, cursor: 'pointer' }}>
                <Lightbulb size={13} /> DICA <span style={{ opacity: 0.7 }}>(-5 se acertar)</span>
              </button>
            )}
            {/* Eliminar Errada — power-up */}
            {!submitted && !solved && eliminatedIdx === null && hasEliminate && (
              <button onClick={handleEliminate}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'none', border: '2px solid #a855f7', color: '#a855f7', fontFamily: "'Press Start 2P', monospace", fontSize: 8, cursor: 'pointer' }}>
                <XCircle size={13} /> ELIMINAR ERRADA
              </button>
            )}
            {!submitted && !solved ? (
              <button disabled={selected === null}
                onClick={() => { setSubmitted(true); onSolve(selected === puzzle.answer); }}
                style={{ flex: 1, padding: '12px 20px', background: selected !== null ? cfg.color : T.textMut, border: 'none', color: '#fff', fontFamily: "'Press Start 2P', monospace", fontSize: 10, cursor: selected !== null ? 'pointer' : 'not-allowed', boxShadow: selected !== null ? `4px 4px 0 ${cfg.color}60` : 'none', transition: 'all .1s' }}>
                CONFIRMAR RESPOSTA
              </button>
            ) : (
              <button onClick={onClose}
                style={{ flex: 1, padding: '12px 20px', background: cfg.color, border: 'none', color: '#fff', fontFamily: "'Press Start 2P', monospace", fontSize: 10, cursor: 'pointer', boxShadow: `4px 4px 0 ${cfg.color}60` }}>
                FECHAR CASO
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   POWERUP SHOP
════════════════════════════════════════════════════════════════════════ */
const SHOP_ITEMS: Array<{
  key: keyof Powerups; name: string; desc: string; cost: number; color: string; emoji: string;
}> = [
  {
    key: 'shield', name: 'ESCUDO DE STREAK', cost: 20, color: '#3b82f6', emoji: '🛡',
    desc: 'Se errar enquanto o escudo estiver ativo, seu streak NÃO será zerado. Consumido automaticamente.',
  },
  {
    key: 'eliminate', name: 'ELIMINAR ERRADA', cost: 10, color: '#a855f7', emoji: '🔍',
    desc: 'Risca uma opção incorreta durante a questão, reduzindo as chances de erro.',
  },
];

function PowerupShop({ T, isDark, currentUser, onBuy }: {
  T: ReturnType<typeof getTheme>; isDark: boolean;
  currentUser: GameUser; onBuy: (key: keyof Powerups, cost: number) => boolean;
}) {
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null);
  const [open, setOpen] = useState(false);

  const handleBuy = (key: keyof Powerups, cost: number) => {
    const ok = onBuy(key, cost);
    setFeedback({ msg: ok ? `${SHOP_ITEMS.find(i=>i.key===key)?.emoji} Comprado!` : '❌ Moedas insuficientes', ok });
    setTimeout(() => setFeedback(null), 2200);
  };

  return (
    <div style={{ background: T.cardBg, border: `2px solid ${T.cardBorder}`, boxShadow: `4px 4px 0 ${T.cardShadow}`, marginBottom: 16 }}>
      <button onClick={() => setOpen(v => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer', borderBottom: open ? `2px solid ${T.topBorder}` : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShoppingBag size={16} color={T.accent} />
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: T.text }}>LOJA DE POWER-UPS</span>
          <span style={{ fontSize: 11, color: T.textMut }}>·</span>
          <span style={{ fontSize: 11, color: T.textSec }}>🛡 {currentUser.powerups.shield} &nbsp; 🔍 {currentUser.powerups.eliminate}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#f59e0b' }}>🪙 {currentUser.coins}</span>
          {open ? <ChevronUp size={16} color={T.textMut} /> : <ChevronDown size={16} color={T.textMut} />}
        </div>
      </button>

      {open && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {SHOP_ITEMS.map((item, i) => {
            const owned    = currentUser.powerups[item.key];
            const canBuy   = currentUser.coins >= item.cost;
            return (
              <div key={item.key} style={{ padding: '18px 20px', borderLeft: i > 0 ? `2px solid ${T.topBorder}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, background: `${item.color}18`, border: `2px solid ${item.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    {item.emoji}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: item.color }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: T.textMut, marginTop: 3 }}>Em estoque: <strong style={{ color: T.text }}>{owned}</strong></div>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: T.textSec, lineHeight: 1.55, marginBottom: 12, margin: '0 0 12px' }}>{item.desc}</p>
                <button onClick={() => handleBuy(item.key, item.cost)} disabled={!canBuy}
                  style={{ width: '100%', padding: '9px 12px', background: canBuy ? item.color : (isDark ? '#1e2a3a' : '#e5e7eb'), border: 'none', color: canBuy ? '#fff' : T.textMut, fontFamily: "'Press Start 2P', monospace", fontSize: 8, cursor: canBuy ? 'pointer' : 'not-allowed', boxShadow: canBuy ? `3px 3px 0 ${item.color}60` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all .1s' }}
                  onMouseEnter={e => canBuy && ((e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.transform = '')}>
                  {item.emoji} COMPRAR — 🪙 {item.cost}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {feedback && (
        <div style={{ padding: '10px 20px', borderTop: `2px solid ${T.topBorder}`, textAlign: 'center', fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: feedback.ok ? '#22c55e' : '#ef4444' }}>
          {feedback.msg}
        </div>
      )}
    </div>
  );
}


/* ════════════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════════════ */
interface DesafiosPageProps { onBackToHub: () => void; }

export default function DesafiosPage({ onBackToHub }: DesafiosPageProps) {
  const { isDark, toggleTheme } = useTheme();
  const T = getTheme(isDark);
  const { currentUser, users, leaderboard, registerUser, login, logout, useHint, recordAnswer, buyPowerup, useEliminate } = useGameState();

  // Tutorial sempre mostra ao entrar na página
  const [showTutorial, setShowTutorial] = useState(true);
  const [showAuth, setShowAuth]         = useState(false);
  const [showBoard, setShowBoard]       = useState(false);
  const [expandedLevel, setExpandedLevel] = useState<number>(0); // índice do nível expandido
  const [activePuzzle, setActivePuzzle] = useState<Puzzle | null>(null);
  const [streakMsg, setStreakMsg]       = useState('');
  const [showGol, setShowGol]           = useState(false);
  const [showCritHit, setShowCritHit]       = useState(false);
  const [showHeadshot, setShowHeadshot]     = useState(false);
  const [showAchieve, setShowAchieve]       = useState(false);
  const [showEnemyFelled, setShowEnemyFelled] = useState(false);
  const [showYouDied, setShowYouDied]       = useState(false);
  const [showAccessGranted, setShowAccessGranted] = useState(false);
  const [showTaskComplete, setShowTaskComplete]   = useState(false);
  const [showSuperEfetivo, setShowSuperEfetivo]   = useState(false);

  const isSolved   = (id: string) => currentUser?.solvedPuzzles.includes(id) ?? false;
  const isHintUsed = (id: string) => currentUser?.hintsUsed.includes(id) ?? false;

  const solvedCountForLevel = (levelIdx: number) =>
    (LEVELS[levelIdx].puzzleIds as readonly string[]).filter(id => isSolved(id)).length;

  const isCopaActive    = currentUser?.activeCosmeticId === 'copa-2026';
  const isFalloutActive = currentUser?.activeCosmeticId === 'fallout-nv';
  const isCSActive      = currentUser?.activeCosmeticId === 'csgo-16';
  const isMCActive      = currentUser?.activeCosmeticId === 'minecraft';
  const isDSActive      = currentUser?.activeCosmeticId === 'dark-souls';
  const isMatrixActive  = currentUser?.activeCosmeticId === 'matrix';
  const isAUActive      = currentUser?.activeCosmeticId === 'among-us';
  const isPKActive      = currentUser?.activeCosmeticId === 'pokemon';

  const handleSolve = (puzzle: Puzzle, correct: boolean) => {
    const { bonus, shieldUsed } = recordAnswer(puzzle.id, correct, puzzle.points);
    if (!correct && shieldUsed) {
      setStreakMsg('🛡 STREAK PROTEGIDO!');
      setTimeout(() => setStreakMsg(''), 2500);
    } else if (bonus > 0) {
      setStreakMsg(`SEQUÊNCIA! +${bonus} PTS BÔNUS`);
      setTimeout(() => setStreakMsg(''), 3000);
    }
    if (correct && isCopaActive) {
      setShowGol(true);       setTimeout(() => setShowGol(false), 2800);
    } else if (correct && isFalloutActive) {
      setShowCritHit(true);   setTimeout(() => setShowCritHit(false), 2800);
    } else if (correct && isCSActive) {
      setShowHeadshot(true);  setTimeout(() => setShowHeadshot(false), 2600);
    } else if (correct && isMCActive) {
      setShowAchieve(true);   setTimeout(() => setShowAchieve(false), 3000);
    } else if (correct && isDSActive) {
      setShowEnemyFelled(true); setTimeout(() => setShowEnemyFelled(false), 3000);
    } else if (!correct && isDSActive) {
      setShowYouDied(true);   setTimeout(() => setShowYouDied(false), 3200);
    } else if (correct && isMatrixActive) {
      setShowAccessGranted(true); setTimeout(() => setShowAccessGranted(false), 2800);
    } else if (correct && isAUActive) {
      setShowTaskComplete(true);  setTimeout(() => setShowTaskComplete(false), 2800);
    } else if (correct && isPKActive) {
      setShowSuperEfetivo(true);  setTimeout(() => setShowSuperEfetivo(false), 2800);
    }
  };

  const rank = currentUser ? getRank(currentUser.points) : null;

  const btnBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 16px',
    background: T.cardBg, border: `2px solid ${T.cardBorder}`,
    boxShadow: `3px 3px 0 ${T.cardShadow}`,
    cursor: 'pointer', color: T.textMut,
    fontFamily: "'Press Start 2P', monospace", fontSize: '8px',
    transition: 'all .15s',
  };

  return (
    <div style={{ background: T.pageBg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style dangerouslySetInnerHTML={{ __html: ANIM_CSS }} />

      {/* ── GOL! — flash de estádio, camisa amarela ──────────────────── */}
      {showGol && (
        <>
          <CopaConfetti />
          <div style={{
            position: 'fixed', inset: 0, zIndex: 200,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
            overflow: 'hidden',
            animation: 'golFlash 2.9s ease-out forwards',
          }}>
            {/* Losango jacquard no fundo do flash */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'28\' height=\'28\'%3E%3Cpath d=\'M14 2L26 14L14 26L2 14Z\' fill=\'none\' stroke=\'%23009C3B\' stroke-width=\'1\' opacity=\'0.13\'/%3E%3C/svg%3E")',
              pointerEvents: 'none',
            }} />

            {/* Varredura de luz lateral */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.45) 50%, transparent 80%)',
              animation: 'golBeam 1.8s ease-out 0.2s both',
              pointerEvents: 'none',
            }} />

            {/* Conteúdo central */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              animation: 'golEnter 0.5s cubic-bezier(0.22,1,0.36,1) 0.08s both',
              position: 'relative', zIndex: 2,
            }}>
              {/* Eyebrow */}
              <div style={{
                fontSize: 9, letterSpacing: '0.3em', color: '#009C3B',
                fontFamily: "'Press Start 2P', monospace", marginBottom: 12,
              }}>CASO RESOLVIDO</div>

              {/* GOL! — verde escuro sobre amarelo */}
              <div style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 'clamp(52px, 12vw, 96px)',
                lineHeight: 1, letterSpacing: '0.04em',
                color: '#013d1a',
                textShadow: '0 4px 0 rgba(0,0,0,0.12), 0 0 40px rgba(0,100,40,0.2)',
              }}>GOL!</div>

              {/* Linha verde — detalhe do colarinho */}
              <div style={{
                width: 80, height: 3, marginTop: 18,
                background: '#009C3B',
                animation: 'golPulse 1.0s ease-in-out 0.5s infinite',
              }} />

              {/* Pontuação */}
              {currentUser && (
                <div style={{
                  marginTop: 20,
                  display: 'flex', alignItems: 'center', gap: 8,
                  animation: 'golEnter 0.4s ease-out 0.55s both',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: '#009C3B',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14,
                  }}>⚽</div>
                  <span style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: 10, color: '#013d1a',
                    letterSpacing: '0.1em',
                  }}>
                    {currentUser.points} PTS
                  </span>
                </div>
              )}
            </div>

            {/* Faixas verticais laterais — listras da camisa */}
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: 6,
              background: 'linear-gradient(180deg, #009C3B, #002776, #009C3B)',
            }} />
            <div style={{
              position: 'absolute', right: 0, top: 0, bottom: 0, width: 6,
              background: 'linear-gradient(180deg, #009C3B, #002776, #009C3B)',
            }} />
          </div>
        </>
      )}

      {/* ── CRITICAL HIT! — Fallout: New Vegas ──────────────────────── */}
      {showCritHit && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', overflow: 'hidden',
          animation: 'critHitFlash 2.9s ease-out forwards',
        }}>
          {/* CRT scanlines */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,214,50,0.05) 3px,rgba(0,214,50,0.05) 4px)' }} />
          {/* Glow radial */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(0,214,50,0.18) 0%, transparent 70%)' }} />
          {/* Moldura terminal */}
          <div style={{ position: 'absolute', inset: 14, border: '1px solid rgba(0,214,50,0.35)', boxShadow: '0 0 24px rgba(0,214,50,0.18), inset 0 0 24px rgba(0,214,50,0.04)' }} />

          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            animation: 'critHitEnter 0.4s cubic-bezier(0.22,1,0.36,1) 0.1s both',
            position: 'relative', zIndex: 2, gap: 10,
          }}>
            <div style={{ fontSize: 28, filter: 'drop-shadow(0 0 10px #00d632)', lineHeight: 1 }}>☢</div>
            <div style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.28em', color: 'rgba(0,214,50,0.65)' }}>
              [ RESPOSTA CORRETA ]
            </div>
            <div style={{
              fontFamily: 'monospace',
              fontSize: 'clamp(34px, 8vw, 62px)',
              fontWeight: 900, letterSpacing: '0.05em', lineHeight: 1,
              color: '#00d632',
              textShadow: '0 0 20px rgba(0,214,50,0.9), 0 0 50px rgba(0,214,50,0.35)',
            }}>CRITICAL HIT!</div>
            <div style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.18em', color: 'rgba(0,214,50,0.55)' }}>
              ENEMY WEAKNESSES EXPLOITED
            </div>
            {currentUser && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginTop: 8,
                animation: 'critHitEnter 0.4s ease-out 0.5s both',
              }}>
                <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#00d632', letterSpacing: '0.1em' }}>
                  {currentUser.points} XP
                </span>
                <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(0,214,50,0.7)', animation: 'terminalBlink 1s step-end infinite' }}>█</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── HEADSHOT! — Counter-Strike 1.6 ─────────────────────────── */}
      {showHeadshot && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', overflow: 'hidden',
          animation: 'headshotFlash 2.7s ease-out forwards',
        }}>
          {/* Grade tática */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,102,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,102,0,0.05) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />
          {/* Crosshair de fundo */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07 }} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            <line x1="50" y1="30" x2="50" y2="70" stroke="#FF6600" strokeWidth="0.6"/>
            <line x1="30" y1="50" x2="70" y2="50" stroke="#FF6600" strokeWidth="0.6"/>
            <circle cx="50" cy="50" r="14" stroke="#FF6600" strokeWidth="0.6" fill="none"/>
            <circle cx="50" cy="50" r="2"  fill="rgba(255,102,0,0.4)"/>
          </svg>

          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            position: 'relative', zIndex: 2, gap: 10,
          }}>
            <div style={{
              fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.3em',
              color: 'rgba(255,102,0,0.85)',
              border: '1px solid rgba(255,102,0,0.3)', padding: '2px 14px',
            }}>ENEMY ELIMINATED</div>
            <div style={{
              fontFamily: "'Arial Black', 'Impact', monospace",
              fontSize: 'clamp(42px, 10vw, 78px)',
              fontWeight: 900, letterSpacing: '0.02em', lineHeight: 1,
              color: '#fff',
              textShadow: '0 0 30px rgba(255,102,0,0.7), 3px 3px 0 rgba(255,80,0,0.5)',
              animation: 'headshotText 0.45s cubic-bezier(0.22,1,0.36,1) 0.05s both',
            }}>HEADSHOT!</div>
            <div style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(58,123,213,0.8)', letterSpacing: '0.12em' }}>
              ▸ CT WINS THE ROUND
            </div>
            {currentUser && (
              <div style={{
                fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
                color: '#fff', letterSpacing: '0.1em', marginTop: 6,
              }}>
                {currentUser.points} PTS
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ACHIEVEMENT UNLOCKED! — Minecraft ──────────────────────── */}
      {showAchieve && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', overflow: 'hidden',
          animation: 'mcAchieveOverlay 3.1s ease-out forwards',
        }}>
          {/* Stone block background pattern */}
          <div style={{ position:'absolute', inset:0, backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 31px,rgba(255,255,255,0.03) 31px,rgba(255,255,255,0.03) 32px), repeating-linear-gradient(90deg,transparent,transparent 31px,rgba(255,255,255,0.03) 31px,rgba(255,255,255,0.03) 32px)" }} />
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 55% 45% at 50% 50%, rgba(93,158,64,0.15) 0%, transparent 70%)' }} />

          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            animation: 'mcBlockPop 0.5s cubic-bezier(0.22,1,0.36,1) 0.08s both',
            position: 'relative', zIndex: 2, gap: 12,
          }}>
            {/* Bloco de ouro */}
            <svg width="64" height="64" viewBox="0 0 16 16">
              <rect width="16" height="16" fill="#FFD700"/>
              <rect x="0" y="0" width="8" height="8" fill="#FFC400"/>
              <rect x="8" y="8" width="8" height="8" fill="#FFC400"/>
              <rect width="16" height="16" fill="none" stroke="#B8860B" strokeWidth="1"/>
              <rect x="4" y="4" width="8" height="8" fill="#FFE55C"/>
              <text x="8" y="11.5" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="#B8860B" fontWeight="900">G</text>
            </svg>
            <div style={{ fontFamily:'monospace', fontSize:10, fontWeight:900, color:'#aaa', letterSpacing:'0.2em', textShadow:'2px 2px 0 #111' }}>
              ACHIEVEMENT UNLOCKED!
            </div>
            <div style={{
              fontFamily:'monospace',
              fontSize:'clamp(28px,7vw,56px)',
              fontWeight:900, color:'#e8e8e8', lineHeight:1,
              textShadow:'3px 3px 0 #111, 0 0 20px rgba(93,158,64,0.4)',
            }}>CASO RESOLVIDO!</div>
            <div style={{ fontFamily:'monospace', fontSize:9, color:'rgba(93,158,64,0.8)', letterSpacing:'0.12em' }}>
              Respond correctly for the first time
            </div>
            {currentUser && (
              <div style={{ fontFamily:'monospace', fontSize:12, fontWeight:900, color:'#FFD700', marginTop:6, textShadow:'2px 2px 0 #111' }}>
                {currentUser.points} PTS
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ENEMY FELLED — Dark Souls ────────────────────────────── */}
      {showEnemyFelled && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', overflow: 'hidden',
          animation: 'enemyFelledAnim 3.1s ease-out forwards',
        }}>
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(199,131,42,0.14) 0%, transparent 70%)' }} />
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            position: 'relative', zIndex: 2, gap: 14,
          }}>
            <div style={{ fontSize:28, filter:'drop-shadow(0 0 10px rgba(199,131,42,0.8))', lineHeight:1 }}>🔥</div>
            <div style={{
              fontFamily:'monospace',
              fontSize:'clamp(36px,9vw,70px)',
              fontWeight:900, letterSpacing:'0.06em', lineHeight:1,
              color:'#c7832a',
              textShadow:'0 0 30px rgba(199,131,42,0.7), 0 0 60px rgba(199,131,42,0.3), 3px 3px 0 rgba(0,0,0,0.6)',
            }}>ENEMY FELLED</div>
            <div style={{ width:60, height:1, background:'rgba(199,131,42,0.4)' }} />
            <div style={{ fontFamily:'monospace', fontSize:9, color:'rgba(199,131,42,0.5)', letterSpacing:'0.2em' }}>
              SOULS ABSORBED
            </div>
            {currentUser && (
              <div style={{ fontFamily:'monospace', fontSize:12, color:'#e8c97a', letterSpacing:'0.1em', textShadow:'0 0 8px rgba(232,201,122,0.5)' }}>
                {currentUser.points} SOULS
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── YOU DIED — Dark Souls (erro) ─────────────────────────── */}
      {showYouDied && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', overflow: 'hidden',
          animation: 'youDiedAnim 3.3s ease-out forwards',
        }}>
          <div style={{
            fontFamily:'monospace',
            fontSize:'clamp(52px,12vw,96px)',
            fontWeight:900, lineHeight:1,
            color:'#8b0000',
            animation:'youDiedText 3.1s ease-out 0.1s both',
            textShadow:'0 0 40px rgba(139,0,0,0.6), 0 0 80px rgba(139,0,0,0.2)',
          }}>YOU DIED</div>
        </div>
      )}

      {/* ── ACCESS GRANTED — Matrix ──────────────────────────────── */}
      {showAccessGranted && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', overflow: 'hidden',
          animation: 'accessGrantedAnim 2.9s ease-out forwards',
        }}>
          <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,255,65,0.04) 3px,rgba(0,255,65,0.04) 4px)' }} />
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,255,65,0.12) 0%, transparent 70%)' }} />
          <div style={{ position:'absolute', inset:12, border:'1px solid rgba(0,255,65,0.25)', boxShadow:'0 0 24px rgba(0,255,65,0.1), inset 0 0 20px rgba(0,255,65,0.04)' }} />

          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            position: 'relative', zIndex: 2, gap: 10,
          }}>
            <div style={{ fontFamily:'monospace', fontSize:10, color:'rgba(0,255,65,0.6)', letterSpacing:'0.2em' }}>{'> SYSTEM OVERRIDE'}</div>
            <div style={{
              fontFamily:'monospace',
              fontSize:'clamp(36px,9vw,68px)',
              fontWeight:900, letterSpacing:'0.08em', lineHeight:1,
              color:'#00ff41',
              animation:'accessText 0.6s ease-out 0.1s both',
              textShadow:'0 0 24px rgba(0,255,65,0.9), 0 0 50px rgba(0,255,65,0.4)',
            }}>ACCESS GRANTED</div>
            <div style={{ fontFamily:'monospace', fontSize:9, color:'rgba(0,255,65,0.5)', letterSpacing:'0.18em' }}>ENCRYPTION BYPASSED</div>
            {currentUser && (
              <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:8 }}>
                <span style={{ fontFamily:'monospace', fontSize:12, fontWeight:700, color:'#00ff41', letterSpacing:'0.1em' }}>{currentUser.points} XP</span>
                <span style={{ fontFamily:'monospace', fontSize:10, color:'rgba(0,255,65,0.7)', animation:'terminalBlink 1s step-end infinite' }}>█</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TASK COMPLETE — Among Us ─────────────────────────────── */}
      {showTaskComplete && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', overflow: 'hidden',
          animation: 'taskCompleteAnim 2.9s ease-out forwards',
        }}>
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 55% 45% at 50% 50%, rgba(19,46,209,0.2) 0%, transparent 70%)' }} />
          {/* Crewmate SVG no centro */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            position: 'relative', zIndex: 2, gap: 12,
          }}>
            <svg width="60" height="76" viewBox="0 0 34 44" style={{ filter:'drop-shadow(0 0 16px rgba(19,46,209,0.8))' }}>
              <ellipse cx="17" cy="30" rx="13" ry="12" fill="#132ed1" stroke="#fff" strokeWidth="1.2"/>
              <circle cx="17" cy="13" r="11" fill="#132ed1" stroke="#fff" strokeWidth="1.2"/>
              <path d="M9,10 Q17,4 25,10 Q25,17 17,18 Q9,17 9,10Z" fill="#8cb4e0" opacity="0.95"/>
              <rect x="26" y="22" width="6" height="9" rx="2" fill="#132ed1" stroke="#fff" strokeWidth="1"/>
              <rect x="9"  y="40" width="6" height="4" rx="2" fill="#132ed1" stroke="#fff" strokeWidth="1"/>
              <rect x="19" y="40" width="6" height="4" rx="2" fill="#132ed1" stroke="#fff" strokeWidth="1"/>
            </svg>
            <div style={{ fontFamily:'monospace', fontSize:10, color:'rgba(184,200,255,0.7)', letterSpacing:'0.2em' }}>TASK COMPLETED</div>
            <div style={{
              fontSize:'clamp(36px,9vw,64px)',
              fontWeight:900, color:'#b8c8ff', lineHeight:1,
              textShadow:'0 0 24px rgba(19,46,209,0.8), 0 0 50px rgba(19,46,209,0.3)',
            }}>✓ DONE!</div>
            <div style={{ fontFamily:'monospace', fontSize:9, color:'rgba(184,200,255,0.5)', letterSpacing:'0.12em' }}>
              CREWMATE TASKS: +1
            </div>
            {currentUser && (
              <div style={{ fontFamily:'monospace', fontSize:12, fontWeight:700, color:'#b8c8ff', marginTop:6 }}>
                {currentUser.points} PTS
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SUPER EFETIVO! — Pokémon ─────────────────────────────── */}
      {showSuperEfetivo && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', overflow: 'hidden',
          animation: 'superEfetivoAnim 2.9s ease-out forwards',
        }}>
          {/* Pokéball de fundo */}
          <svg style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', opacity:0.06 }} width="500" height="500" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="17" fill="#EE1515" stroke="#fff" strokeWidth="1"/>
            <path d="M1,18 A17,17 0 0,0 35,18 Z" fill="#fff"/>
            <line x1="1" y1="18" x2="35" y2="18" stroke="#111" strokeWidth="1.5"/>
            <circle cx="18" cy="18" r="5.5" fill="#fff" stroke="#111" strokeWidth="1.5"/>
          </svg>
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 55% 45% at 50% 50%, rgba(238,21,21,0.12) 0%, transparent 70%)' }} />

          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            position: 'relative', zIndex: 2, gap: 10,
          }}>
            <div style={{ fontFamily:'monospace', fontSize:10, color:'rgba(255,222,0,0.7)', letterSpacing:'0.2em', border:'2px solid rgba(255,222,0,0.3)', padding:'2px 12px', borderRadius:3 }}>
              IT'S SUPER EFFECTIVE!
            </div>
            <div style={{
              fontFamily:"'Arial Black', monospace",
              fontSize:'clamp(38px,9vw,72px)',
              fontWeight:900, letterSpacing:'0.02em', lineHeight:1,
              color:'#FFDE00',
              animation:'pokeTextPop 0.5s cubic-bezier(0.22,1,0.36,1) 0.06s both',
              textShadow:'3px 3px 0 #EE1515, 0 0 30px rgba(255,222,0,0.6)',
            }}>SUPER EFETIVO! ⚡</div>
            <div style={{ fontFamily:'monospace', fontSize:9, color:'rgba(255,222,0,0.5)', letterSpacing:'0.14em' }}>
              FOE POKÉMON FAINTED
            </div>
            {currentUser && (
              <div style={{
                fontFamily:'monospace', fontSize:12, fontWeight:900, color:'#FFDE00', marginTop:8,
                textShadow:'2px 2px 0 rgba(0,0,0,0.5)',
              }}>
                {currentUser.points} PTS
              </div>
            )}
          </div>
        </div>
      )}

      {/* Streak toast */}
      {streakMsg && (
        <div style={{ position: 'fixed', top: 80, left: '50%', zIndex: 70, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: T.accent, color: '#fff', fontFamily: "'Press Start 2P', monospace", fontSize: 9, boxShadow: `4px 4px 0 ${T.accent}60`, animation: 'fadeUp .3s ease' }}>
          <Zap size={14} /> {streakMsg}
        </div>
      )}

      {/* ── TOP BAR ──────────────────────────────────────────────────── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: T.topBg, borderBottom: `2px solid ${T.topBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <a href="https://ctrlplay.com.br" target="_blank" rel="noopener noreferrer">
            <img src="https://ctrlplay.com.br/wp-content/uploads/2024/11/logo-colorido.svg" alt="Ctrl+Play" style={{ height: 36 }} />
          </a>
          <div style={{ width: 1, height: 28, background: T.topBorder }} />
          <div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: T.textMut }}>DETETIVE DE</div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: T.accent }}>CÓDIGO</div>
          </div>
          {isCopaActive && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '3px 10px 3px 8px',
              background: '#FFD100',
              border: '1px solid #009C3B',
              borderRadius: 999,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#009C3B', flexShrink: 0 }} />
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: '#014d20', whiteSpace: 'nowrap' }}>COPA 2026</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setShowTutorial(true)} style={{ ...btnBase, padding: '8px 12px' }} title="Ver tutorial"
            onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = T.accent; el.style.color = T.accent; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = T.cardBorder; el.style.color = T.textMut; }}>
            <Info size={14} />
          </button>

          <button onClick={toggleTheme} style={{ ...btnBase, padding: '8px 12px', color: isDark ? '#fbbf24' : '#475569' }} title={isDark ? 'Modo claro' : 'Modo escuro'}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = isDark ? '#fbbf24' : '#06b6d4'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = T.cardBorder; }}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ padding: '6px 14px', background: T.accentDim, border: `2px solid ${T.accent}40`, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>{currentUser.avatar}</span>
                <div>
                  <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: rank?.color }}>{rank?.title.toUpperCase()}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{currentUser.name} · {currentUser.points} pts</div>
                </div>
              </div>
              <button onClick={logout} style={{ ...btnBase, padding: '8px 12px' }} title="Sair"
                onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = '#ef4444'; el.style.color = '#ef4444'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = T.cardBorder; el.style.color = T.textMut; }}>
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button onClick={() => setShowAuth(true)} style={{ ...btnBase, color: T.accent, borderColor: T.accent }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'none'; }}>
              <LogIn size={14} /> <span className="hidden sm:inline">ENTRAR</span>
            </button>
          )}

          <button onClick={onBackToHub} style={btnBase}
            onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = '#0054a6'; el.style.color = '#0054a6'; el.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = T.cardBorder; el.style.color = T.textMut; el.style.transform = 'none'; }}>
            <Home size={14} /> <span className="hidden sm:inline">HUB</span>
          </button>
        </div>
      </div>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <div style={{
        background: T.heroBg,
        backgroundImage: `
          linear-gradient(${T.gridColor} 1px, transparent 1px),
          linear-gradient(90deg, ${T.gridColor} 1px, transparent 1px)
        `,
        backgroundSize: '32px 32px',
        padding: '44px 24px 0',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* CRT scanlines (dark mode) */}
        {isDark && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)',
          }} />
        )}

        {/* Glow radial */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse 70% 60% at 50% 0%, ${isDark ? 'rgba(167,139,250,0.1)' : 'rgba(167,139,250,0.07)'} 0%, transparent 70%)`,
        }} />

        {/* Conteúdo do hero */}
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          {/* Badge contador */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 20, padding: '8px 18px', background: T.cardBg, border: `2px solid ${T.cardBorder}`, boxShadow: `3px 3px 0 ${T.cardShadow}` }}>
            <Trophy size={16} color={T.accent} />
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 12, color: T.accent }}>{PUZZLES.length}</span>
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: T.textMut }}>CASOS · 3 NÍVEIS</span>
          </div>

          {/* Título */}
          <h1 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 'clamp(16px, 3vw, 28px)', lineHeight: 1.4, color: T.text, marginBottom: 12 }}>
            <span style={{ color: T.accent, textShadow: isDark ? `0 0 24px ${T.accent}80` : 'none' }}>DETETIVE</span>
            {' '}DE{' '}
            <span style={{ color: '#f37021', textShadow: isDark ? '0 0 24px rgba(243,112,33,0.6)' : 'none' }}>CÓDIGO</span>
          </h1>

          <p style={{ fontSize: 15, color: T.textSec, maxWidth: 480, margin: '0 auto 8px', lineHeight: 1.6 }}>
            Resolva casos, avance níveis e conquiste o título de <strong style={{ color: T.accent }}>Mestre Detetive</strong>!
          </p>

          {/* Stats do usuário logado */}
          {currentUser && rank && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 0, marginTop: 20, marginBottom: 0, background: T.cardBg, border: `2px solid ${T.cardBorder}`, boxShadow: `3px 3px 0 ${T.cardShadow}` }}>
              {[
                { label: 'RANK',      value: rank.title.toUpperCase(),                        color: rank.color,  icon: <LIcon name={rank.icon} size={14} color={rank.color} /> },
                { label: 'PONTOS',    value: `${currentUser.points}`,                          color: T.accent,    icon: <Trophy size={14} color={T.accent} /> },
                { label: 'MOEDAS',    value: `🪙 ${currentUser.coins}`,                       color: '#f59e0b',   icon: <Star size={14} color="#f59e0b" /> },
                { label: 'STREAK',    value: `${currentUser.streak}`,                          color: '#f59e0b',   icon: <Zap size={14} color="#f59e0b" /> },
                { label: 'RESOLVIDOS',value: `${currentUser.solvedPuzzles.length}/${PUZZLES.length}`, color: '#22c55e', icon: <CheckCircle2 size={14} color="#22c55e" /> },
              ].map((s, i) => (
                <div key={s.label} style={{ padding: '10px 16px', borderLeft: i > 0 ? `2px solid ${T.topBorder}` : 'none', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 3 }}>{s.icon}</div>
                  <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: s.color }}>{s.value}</div>
                  <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: T.textMut, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Animação pixel runner */}
        <PixelRunner T={T} isDark={isDark} />
      </div>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: '40px 24px 72px', background: T.pageBg }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>

          {/* ── LOGIN GATE ── */}
          {!currentUser ? (
            <div>
              {/* CTA de login */}
              <div style={{ textAlign: 'center', padding: '48px 24px', marginBottom: 32, background: T.cardBg, border: `2px solid ${T.cardBorder}`, boxShadow: `4px 4px 0 ${T.cardShadow}` }}>
                <div style={{ width: 72, height: 72, background: T.accentDim, border: `2px solid ${T.accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Lock size={32} color={T.accent} />
                </div>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 14, color: T.text, marginBottom: 12 }}>
                  FAÇA LOGIN PARA JOGAR
                </div>
                <p style={{ fontSize: 14, color: T.textSec, marginBottom: 28, maxWidth: 360, margin: '0 auto 28px', lineHeight: 1.6 }}>
                  Crie um perfil ou entre na sua conta para acessar os casos e salvar sua pontuação.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={() => setShowAuth(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 28px', background: T.accent, border: 'none', color: '#fff', fontFamily: "'Press Start 2P', monospace", fontSize: 10, cursor: 'pointer', boxShadow: `4px 4px 0 ${T.accent}60` }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'none'; }}>
                    <LogIn size={16} /> ENTRAR / CRIAR CONTA
                  </button>
                </div>
              </div>

              {/* Preview dos níveis bloqueados */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {LEVELS.map(lv => (
                  <div key={lv.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 24px', background: T.cardBg, border: `2px solid ${T.cardBorder}`, opacity: 0.6 }}>
                    <div style={{ width: 48, height: 48, background: isDark ? '#1e2a3a' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Lock size={20} color={T.textMut} />
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: T.textMut, marginBottom: 4 }}>NÍVEL {lv.id} — {lv.label}</div>
                      <div style={{ fontSize: 12, color: T.textMut }}>{lv.puzzleIds.length} casos · {lv.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Leaderboard — sempre visível */}
              {leaderboard.length > 0 && (
                <div style={{ background: T.cardBg, border: `2px solid ${T.cardBorder}`, boxShadow: `4px 4px 0 ${T.cardShadow}`, marginBottom: 8 }}>
                  {/* Cabeçalho */}
                  <div style={{ padding: '14px 20px', borderBottom: `2px solid ${T.topBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Trophy size={16} color={T.accent} />
                      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: T.text }}>PLACAR GERAL</span>
                    </div>
                    <span style={{ fontSize: 11, color: T.textMut }}>{leaderboard.length} detetive{leaderboard.length !== 1 ? 's' : ''}</span>
                  </div>

                  {/* Pódio top-3 */}
                  {leaderboard.length >= 1 && (
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 8, padding: '20px 16px 12px', borderBottom: `1px solid ${T.divider}` }}>
                      {/* 2º lugar */}
                      {leaderboard[1] && (() => { const u = leaderboard[1]; const r = getRank(u.points); const isMe = u.id === currentUser?.id; return (
                        <div style={{ textAlign: 'center', flex: 1 }}>
                          <div style={{ fontSize: 22, marginBottom: 4 }}>{u.avatar}</div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: T.text, marginBottom: 2 }}>{u.name}{isMe && <span style={{ color: T.accent }}> ★</span>}</div>
                          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#94a3b8' }}>🥈 {u.points}</div>
                          <div style={{ height: 48, background: isDark ? 'rgba(148,163,184,0.12)' : 'rgba(148,163,184,0.2)', border: `2px solid #94a3b8`, marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 14, color: '#94a3b8' }}>2</span>
                          </div>
                        </div>
                      ); })()}
                      {/* 1º lugar */}
                      {(() => { const u = leaderboard[0]; const r = getRank(u.points); const isMe = u.id === currentUser?.id; return (
                        <div style={{ textAlign: 'center', flex: 1 }}>
                          <div style={{ fontSize: 26, marginBottom: 4 }}>{u.avatar}</div>
                          <div style={{ fontSize: 12, fontWeight: 900, color: T.text, marginBottom: 2 }}>{u.name}{isMe && <span style={{ color: T.accent }}> ★</span>}</div>
                          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: '#fbbf24' }}>🥇 {u.points}</div>
                          <div style={{ height: 72, background: isDark ? 'rgba(251,191,36,0.12)' : 'rgba(251,191,36,0.15)', border: `2px solid #fbbf24`, marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 18, color: '#fbbf24' }}>1</span>
                          </div>
                        </div>
                      ); })()}
                      {/* 3º lugar */}
                      {leaderboard[2] && (() => { const u = leaderboard[2]; const r = getRank(u.points); const isMe = u.id === currentUser?.id; return (
                        <div style={{ textAlign: 'center', flex: 1 }}>
                          <div style={{ fontSize: 22, marginBottom: 4 }}>{u.avatar}</div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: T.text, marginBottom: 2 }}>{u.name}{isMe && <span style={{ color: T.accent }}> ★</span>}</div>
                          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#d97706' }}>🥉 {u.points}</div>
                          <div style={{ height: 36, background: isDark ? 'rgba(217,119,6,0.12)' : 'rgba(217,119,6,0.15)', border: `2px solid #d97706`, marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 12, color: '#d97706' }}>3</span>
                          </div>
                        </div>
                      ); })()}
                    </div>
                  )}

                  {/* Lista completa */}
                  {leaderboard.map((u, idx) => {
                    const r = getRank(u.points);
                    const isMe = u.id === currentUser?.id;
                    const posColor = idx === 0 ? '#fbbf24' : idx === 1 ? '#94a3b8' : idx === 2 ? '#d97706' : T.textMut;
                    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx+1}`;
                    return (
                      <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', background: isMe ? T.accentDim : 'transparent', borderBottom: `1px solid ${T.divider}`, borderLeft: isMe ? `3px solid ${T.accent}` : '3px solid transparent' }}>
                        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: idx < 3 ? 13 : 9, color: posColor, width: 28, textAlign: 'center', flexShrink: 0 }}>{medal}</span>
                        <span style={{ fontSize: idx < 3 ? 22 : 18, flexShrink: 0 }}>{u.avatar}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 900, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {u.name}{isMe && <span style={{ fontSize: 10, fontWeight: 400, color: T.accent, marginLeft: 6 }}>(você)</span>}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                            <LIcon name={r.icon} size={11} color={r.color} />
                            <span style={{ fontSize: 10, color: r.color }}>{r.title}</span>
                            <span style={{ fontSize: 10, color: T.textMut }}>· {u.solvedPuzzles.length} casos</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: r.color }}>{u.points} pts</div>
                          <div style={{ fontSize: 10, color: '#f59e0b', marginTop: 2 }}>🪙 {(u as any).coins ?? u.points}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Loja de power-ups */}
              <PowerupShop
                T={T} isDark={isDark}
                currentUser={currentUser}
                onBuy={buyPowerup}
              />

              {/* Nível cards com progressão */}
              {LEVELS.map((level, idx) => (
                <LevelCard
                  key={level.id}
                  level={level}
                  levelIdx={idx}
                  unlocked={isLevelUnlocked(idx, currentUser.solvedPuzzles)}
                  expanded={expandedLevel === idx}
                  solvedCount={solvedCountForLevel(idx)}
                  T={T}
                  isDark={isDark}
                  onToggle={() => setExpandedLevel(prev => prev === idx ? -1 : idx)}
                  onPuzzleClick={p => setActivePuzzle(p)}
                  isSolved={isSolved}
                />
              ))}

              {/* Legenda de títulos */}
              <div style={{ marginTop: 20, background: T.cardBg, border: `2px solid ${T.cardBorder}`, boxShadow: `4px 4px 0 ${T.cardShadow}` }}>
                <div style={{ padding: '14px 20px', borderBottom: `2px solid ${T.topBorder}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Medal size={16} color={T.accent} />
                  <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: T.text }}>TÍTULOS DE DETETIVE</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 0 }}>
                  {RANKS_IN_ORDER.map((pts, i) => {
                    const r = getRank(pts);
                    const isCurrentRank = currentUser ? getRank(currentUser.points).title === r.title : false;
                    return (
                      <div key={r.title} style={{ padding: 18, borderLeft: i > 0 ? `2px solid ${T.topBorder}` : 'none', background: isCurrentRank ? T.accentDim : 'transparent', borderBottom: isCurrentRank ? `2px solid ${T.accent}` : 'none' }}>
                        <LIcon name={r.icon} size={22} color={r.color} />
                        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: r.color, marginTop: 10, marginBottom: 4 }}>{r.title.toUpperCase()}</div>
                        <div style={{ fontSize: 12, color: T.textMut }}>{pts === 0 ? 'Início' : `${pts}+ pts`}</div>
                        {isCurrentRank && <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: T.accent, marginTop: 6 }}>← VOCÊ</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <div style={{ padding: 24, textAlign: 'center', background: T.topBg, borderTop: `2px solid ${T.topBorder}` }}>
        <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: T.textMut }}>
          © 2026 DOUGLAS ·{' '}
          <a href="https://doneres.dev" target="_blank" rel="noopener noreferrer" style={{ color: T.accent, textDecoration: 'none' }}>DONERES.DEV</a>
        </p>
      </div>

      {/* Modals */}
      {showTutorial && <TutorialModal T={T} isDark={isDark} onClose={() => setShowTutorial(false)} />}
      {showAuth     && <AuthModal T={T} isDark={isDark} users={users} onLogin={login} onRegister={registerUser} onClose={() => setShowAuth(false)} />}
      {activePuzzle && currentUser && (
        <PuzzleModal
          puzzle={activePuzzle} T={T}
          solved={isSolved(activePuzzle.id)}
          hintUsed={isHintUsed(activePuzzle.id)}
          wrongCount={currentUser?.wrongAttempts[activePuzzle.id] ?? 0}
          hasEliminate={(currentUser?.powerups.eliminate ?? 0) > 0}
          onSolve={correct => handleSolve(activePuzzle, correct)}
          onUseHint={() => useHint(activePuzzle.id)}
          onUseEliminate={useEliminate}
          onClose={() => setActivePuzzle(null)}
        />
      )}
    </div>
  );
}
