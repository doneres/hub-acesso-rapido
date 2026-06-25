import React, { useState, useMemo } from 'react';
import {
  ChevronLeft, RotateCcw, Lightbulb, CheckCircle2,
  Trophy, Star, Lock, ChevronRight,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   ANIMATIONS
═══════════════════════════════════════════════════════════ */
const ANIM = `
  @keyframes rktFloat {
    0%,100% { transform: translateY(0px); }
    50%      { transform: translateY(-7px); }
  }
  @keyframes rktTwinkle {
    0%,100% { opacity: 0.25; }
    50%      { opacity: 0.9; }
  }
  @keyframes rktWin {
    0%   { opacity: 0; transform: scale(0.8) translateY(10px); }
    60%  { transform: scale(1.06) translateY(-2px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes rktSlide {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes rktPulse {
    0%,100% { box-shadow: 0 0 8px #00ffcc88, 0 0 20px #00ffcc33; }
    50%      { box-shadow: 0 0 18px #00ffcccc, 0 0 36px #00ffcc66; }
  }
  @keyframes rktDotPulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(0,255,204,0.5); }
    50%      { box-shadow: 0 0 0 5px rgba(0,255,204,0); }
  }
  @keyframes rktWrong {
    0%,100% { transform: translateX(0); }
    20%     { transform: translateX(-6px); }
    40%     { transform: translateX(6px); }
    60%     { transform: translateX(-4px); }
    80%     { transform: translateX(4px); }
  }
  @keyframes rktScanline {
    from { top: -2px; }
    to   { top: 100%; }
  }
`;

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
interface Level {
  id: number;
  code: string;
  title: string;
  story: string;
  task: string;
  rockets: number;
  prefill: string;
  hasItemCss?: boolean;
  itemPrefill?: string;
  itemTarget?: number;
  winContainer: Record<string, string>;
  winItem?: Record<string, string>;
  solutionContainer: React.CSSProperties;
  solutionItem?: React.CSSProperties;
  hint: string;
  narrow?: boolean;
}

/* ═══════════════════════════════════════════════════════════
   LEVELS
═══════════════════════════════════════════════════════════ */
const LEVELS: Level[] = [
  {
    id: 1, code: 'MISSÃO-01', title: 'Órbita Leste',
    story: 'Três foguetes perdidos precisam atracar nas estações do setor leste da galáxia.',
    task: 'Mova os foguetes para o lado direito do container.',
    rockets: 3, prefill: 'display: flex;\n',
    winContainer: { 'justify-content': 'flex-end' },
    solutionContainer: { justifyContent: 'flex-end' },
    hint: 'justify-content: flex-end envia os itens para o final do eixo principal (direita no modo row).',
  },
  {
    id: 2, code: 'MISSÃO-02', title: 'Estação Central',
    story: 'A Estação Alfa fica no centro exato da órbita equatorial. Leve os foguetes até lá.',
    task: 'Centralize os foguetes horizontalmente.',
    rockets: 3, prefill: 'display: flex;\n',
    winContainer: { 'justify-content': 'center' },
    solutionContainer: { justifyContent: 'center' },
    hint: 'justify-content: center centraliza os itens no eixo principal.',
  },
  {
    id: 3, code: 'MISSÃO-03', title: 'Patrulha de Fronteiras',
    story: 'Três foguetes devem cobrir os dois extremos e o ponto central simultaneamente.',
    task: 'Distribua os foguetes com espaço igual ENTRE eles.',
    rockets: 3, prefill: 'display: flex;\n',
    winContainer: { 'justify-content': 'space-between' },
    solutionContainer: { justifyContent: 'space-between' },
    hint: 'justify-content: space-between distribui do início ao fim, sem margem nas bordas.',
  },
  {
    id: 4, code: 'MISSÃO-04', title: 'Zonas de Patrulha',
    story: 'Quatro foguetes precisam de zonas iguais de patrulha ao REDOR de cada nave.',
    task: 'Adicione espaço igual ao redor de cada foguete.',
    rockets: 4, prefill: 'display: flex;\n',
    winContainer: { 'justify-content': 'space-around' },
    solutionContainer: { justifyContent: 'space-around' },
    hint: 'justify-content: space-around coloca metade do espaço nas bordas e espaço cheio entre itens.',
  },
  {
    id: 5, code: 'MISSÃO-05', title: 'Plataforma Sul',
    story: 'Uma chuva de meteoros força os foguetes a pousar na plataforma sul da estação.',
    task: 'Mova os foguetes para o final do eixo cruzado (baixo).',
    rockets: 3, prefill: 'display: flex;\n',
    winContainer: { 'align-items': 'flex-end' },
    solutionContainer: { alignItems: 'flex-end' },
    hint: 'align-items controla o eixo perpendicular ao flex-direction. flex-end = baixo no modo row.',
  },
  {
    id: 6, code: 'MISSÃO-06', title: 'Altitude de Cruzeiro',
    story: 'Regulamento orbital: todas as naves devem voar no corredor central de altitude.',
    task: 'Centralize os foguetes verticalmente.',
    rockets: 3, prefill: 'display: flex;\n',
    winContainer: { 'align-items': 'center' },
    solutionContainer: { alignItems: 'center' },
    hint: 'align-items: center centraliza os itens verticalmente (eixo cruzado no modo row).',
  },
  {
    id: 7, code: 'MISSÃO-07', title: 'Esquina Nordeste',
    story: 'A estação de reabastecimento fica no canto direito superior. Precisão máxima.',
    task: 'Mova os foguetes para o canto direito e para cima.',
    rockets: 2, prefill: 'display: flex;\n',
    winContainer: { 'justify-content': 'flex-end', 'align-items': 'flex-start' },
    solutionContainer: { justifyContent: 'flex-end', alignItems: 'flex-start' },
    hint: 'Você precisa de duas propriedades: justify-content para horizontal e align-items para vertical.',
  },
  {
    id: 8, code: 'MISSÃO-08', title: 'Aproximação Invertida',
    story: 'Protocolo de emergência: as naves devem se aproximar no sentido inverso ao normal.',
    task: 'Inverta a ordem horizontal dos foguetes.',
    rockets: 3, prefill: 'display: flex;\n',
    winContainer: { 'flex-direction': 'row-reverse' },
    solutionContainer: { flexDirection: 'row-reverse' },
    hint: 'flex-direction: row-reverse inverte a ordem — o último item fica na posição 1.',
  },
  {
    id: 9, code: 'MISSÃO-09', title: 'Torre de Lançamento',
    story: 'A nova plataforma só comporta foguetes empilhados verticalmente em coluna.',
    task: 'Empilhe os foguetes em coluna de cima para baixo.',
    rockets: 3, prefill: 'display: flex;\n',
    winContainer: { 'flex-direction': 'column' },
    solutionContainer: { flexDirection: 'column' },
    hint: 'flex-direction: column muda o eixo principal para vertical.',
  },
  {
    id: 10, code: 'MISSÃO-10', title: 'Coluna Invertida',
    story: 'Sistema de emergência: sequência de lançamento invertida — de baixo para cima.',
    task: 'Empilhe os foguetes em coluna na ordem reversa.',
    rockets: 3, prefill: 'display: flex;\n',
    winContainer: { 'flex-direction': 'column-reverse' },
    solutionContainer: { flexDirection: 'column-reverse' },
    hint: 'flex-direction: column-reverse empilha verticalmente, mas o item 1 fica embaixo.',
  },
  {
    id: 11, code: 'MISSÃO-11', title: 'Ponto de Encontro',
    story: 'A Estação Ômega fica no centro absoluto da órbita. Precisão de nanômetros.',
    task: 'Centralize os foguetes horizontal E verticalmente ao mesmo tempo.',
    rockets: 2, prefill: 'display: flex;\n',
    winContainer: { 'justify-content': 'center', 'align-items': 'center' },
    solutionContainer: { justifyContent: 'center', alignItems: 'center' },
    hint: 'Use justify-content: center E align-items: center juntos.',
  },
  {
    id: 12, code: 'MISSÃO-12', title: 'Coluna Central',
    story: 'Formação especial da frota: coluna central alinhada ao eixo da galáxia.',
    task: 'Empilhe em coluna e centralize horizontalmente.',
    rockets: 3, prefill: 'display: flex;\n',
    winContainer: { 'flex-direction': 'column', 'align-items': 'center' },
    solutionContainer: { flexDirection: 'column', alignItems: 'center' },
    hint: 'No modo column, align-items age no eixo horizontal. Use flex-direction + align-items.',
  },
  {
    id: 13, code: 'MISSÃO-13', title: 'O Rebelde',
    story: 'O terceiro foguete recebeu ordens especiais — sua posição é diferente dos demais.',
    task: 'Use align-self no terceiro foguete para posicioná-lo embaixo.',
    rockets: 3, prefill: 'display: flex;\nalign-items: center;\n',
    hasItemCss: true, itemPrefill: '/* Foguete 3 */\n', itemTarget: 2,
    winContainer: {},
    winItem: { 'align-self': 'flex-end' },
    solutionContainer: { alignItems: 'center' },
    solutionItem: { alignSelf: 'flex-end' },
    hint: 'align-self sobrescreve o align-items do container para um item específico. Use flex-end.',
  },
  {
    id: 14, code: 'MISSÃO-14', title: 'Frota Expandida',
    story: 'Seis novos foguetes chegaram! A órbita estreita não suporta todos na mesma linha.',
    task: 'Faça os foguetes quebrarem para a próxima linha automaticamente.',
    rockets: 6, prefill: 'display: flex;\n', narrow: true,
    winContainer: { 'flex-wrap': 'wrap' },
    solutionContainer: { flexWrap: 'wrap' },
    hint: 'flex-wrap: wrap permite que itens quebrem para a próxima linha quando não há espaço.',
  },
  {
    id: 15, code: 'MISSÃO-FINAL', title: 'Alfa Centauri',
    story: 'Missão final! Formação de elite: coluna, distribuição vertical uniforme, centrada.',
    task: 'flex-direction: column + justify-content: space-between + align-items: center.',
    rockets: 3, prefill: 'display: flex;\n',
    winContainer: {
      'flex-direction': 'column',
      'justify-content': 'space-between',
      'align-items': 'center',
    },
    solutionContainer: { flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' },
    hint: 'Três propriedades! No modo column, justify-content age no eixo vertical.',
  },
];

/* ═══════════════════════════════════════════════════════════
   CSS PARSER — safe, whitelist-only
═══════════════════════════════════════════════════════════ */
const FLEX_MAP: Record<string, keyof React.CSSProperties> = {
  'display':            'display',
  'flex-direction':     'flexDirection',
  'flex-wrap':          'flexWrap',
  'flex-flow':          'flexFlow',
  'justify-content':    'justifyContent',
  'align-items':        'alignItems',
  'align-content':      'alignContent',
  'align-self':         'alignSelf',
  'flex':               'flex',
  'flex-grow':          'flexGrow',
  'flex-shrink':        'flexShrink',
  'flex-basis':         'flexBasis',
  'order':              'order',
  'gap':                'gap',
  'row-gap':            'rowGap',
  'column-gap':         'columnGap',
  'place-items':        'placeItems',
  'place-content':      'placeContent',
  'justify-self':       'justifySelf',
};

function parseCssText(text: string): React.CSSProperties {
  const result: React.CSSProperties = {};
  for (const line of text.split(';')) {
    const ci = line.indexOf(':');
    if (ci === -1) continue;
    const rawProp = line.slice(0, ci).replace(/\/\*.*?\*\//g, '').trim().toLowerCase();
    const val     = line.slice(ci + 1).replace(/\/\*.*?\*\//g, '').trim();
    const camel   = FLEX_MAP[rawProp];
    if (camel && val) (result as Record<string, string>)[camel as string] = val;
  }
  return result;
}

function checkWin(containerText: string, itemText: string, level: Level): boolean {
  const cp = parseCssText(containerText);
  for (const [prop, expected] of Object.entries(level.winContainer)) {
    const camel = FLEX_MAP[prop] as string;
    if (!camel) return false;
    const actual = ((cp as Record<string, string>)[camel] ?? '').trim().toLowerCase();
    const valid  = expected.split('|').map(v => v.trim().toLowerCase());
    if (!valid.includes(actual)) return false;
  }
  if (level.winItem) {
    const ip = parseCssText(itemText);
    for (const [prop, expected] of Object.entries(level.winItem)) {
      const camel = FLEX_MAP[prop] as string;
      if (!camel) return false;
      const actual = ((ip as Record<string, string>)[camel] ?? '').trim().toLowerCase();
      const valid  = expected.split('|').map(v => v.trim().toLowerCase());
      if (!valid.includes(actual)) return false;
    }
  }
  return true;
}

/* ═══════════════════════════════════════════════════════════
   STATIC STARS
═══════════════════════════════════════════════════════════ */
const STARS = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 3) % 97 + 1}%`,
  top:  `${(i * 13 + 7) % 93 + 1}%`,
  size: (i % 3) + 1,
  dur:  2.5 + (i % 4),
  del:  -(i * 0.7) % 4,
}));

function StarField() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {STARS.map(s => (
        <div key={s.id} style={{
          position: 'absolute',
          left: s.left, top: s.top,
          width: s.size, height: s.size,
          borderRadius: '50%',
          background: '#fff',
          animation: `rktTwinkle ${s.dur}s ease-in-out ${s.del}s infinite`,
        }} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STATION RING
═══════════════════════════════════════════════════════════ */
function StationRing({ size }: { size: number }) {
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      borderRadius: '50%',
      border: '2.5px solid rgba(0,255,204,0.65)',
      background: 'rgba(0,255,204,0.05)',
      animation: 'rktPulse 2.2s ease-in-out infinite',
    }} />
  );
}

/* ═══════════════════════════════════════════════════════════
   ROCKET
═══════════════════════════════════════════════════════════ */
function Rocket({ idx, size, extraStyle, won }: {
  idx: number; size: number;
  extraStyle: React.CSSProperties; won: boolean;
}) {
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.52,
      animation: won
        ? `rktDock .4s ease ${idx * 0.1}s both`
        : `rktFloat ${2.2 + idx * 0.4}s ease-in-out ${idx * 0.3}s infinite`,
      filter: won ? 'drop-shadow(0 0 6px #00ffcc)' : 'none',
      transition: 'filter .3s',
      ...extraStyle,
    }}>
      🚀
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   GAME ARENA
═══════════════════════════════════════════════════════════ */
function GameArena({ level, containerStyle, itemStyle, won, wrong }: {
  level: Level;
  containerStyle: React.CSSProperties;
  itemStyle: React.CSSProperties;
  won: boolean;
  wrong: boolean;
}) {
  const sz    = level.narrow ? 44 : 52;
  const w     = level.narrow ? 300 : '100%';
  const h     = 230;
  const pad   = 12;

  return (
    <div style={{
      position: 'relative', width: w, height: h,
      margin: '0 auto',
      background: 'linear-gradient(160deg, #030810 0%, #060a14 60%, #080c18 100%)',
      border: `1.5px solid ${won ? 'rgba(0,255,204,0.5)' : wrong ? 'rgba(239,68,68,0.4)' : 'rgba(0,255,204,0.15)'}`,
      borderRadius: 10, overflow: 'hidden',
      boxShadow: won ? '0 0 24px rgba(0,255,204,0.25)' : 'none',
      transition: 'border-color .3s, box-shadow .3s',
      animation: wrong ? 'rktWrong .4s ease' : 'none',
    }}>
      {/* Scanline */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 1, zIndex: 4, pointerEvents: 'none',
        background: 'linear-gradient(90deg, transparent, rgba(0,255,204,0.12), transparent)',
        animation: 'rktScanline 5s linear infinite',
      }} />

      <StarField />

      {/* Station rings — solution CSS */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        padding: pad, boxSizing: 'border-box', gap: 8,
        ...level.solutionContainer,
      }}>
        {Array.from({ length: level.rockets }, (_, i) => (
          <StationRing key={i} size={sz} />
        ))}
      </div>

      {/* Rockets — player CSS */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        padding: pad, boxSizing: 'border-box', gap: 8,
        ...containerStyle,
      }}>
        {Array.from({ length: level.rockets }, (_, i) => (
          <Rocket
            key={i}
            idx={i}
            size={sz}
            extraStyle={level.hasItemCss && i === level.itemTarget ? itemStyle : {}}
            won={won}
          />
        ))}
      </div>

      {/* Win overlay */}
      {won && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 5,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,255,204,0.08)', backdropFilter: 'blur(2px)',
          animation: 'rktWin .45s ease both',
        }}>
          <div style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 16,
            color: '#00ffcc', textShadow: '0 0 24px #00ffcc, 0 0 48px #00ffcc44',
            letterSpacing: '0.06em',
          }}>
            ANCORADO!
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
export default function FlexRocketPage({ onBack }: { onBack: () => void }) {
  const [levelIdx, setLevelIdx]         = useState(0);
  const [css, setCss]                   = useState(LEVELS[0].prefill);
  const [itemCss, setItemCss]           = useState(LEVELS[0].itemPrefill ?? '');
  const [won, setWon]                   = useState(false);
  const [wrong, setWrong]               = useState(false);
  const [showHint, setShowHint]         = useState(false);
  const [checked, setChecked]           = useState(false);
  const [allDone, setAllDone]           = useState(false);
  const [completed, setCompleted]       = useState<Set<number>>(new Set());

  const level          = LEVELS[levelIdx];
  const containerStyle = useMemo(() => parseCssText(css), [css]);
  const itemStyle      = useMemo(() => parseCssText(itemCss), [itemCss]);

  const handleCheck = () => {
    const isWin = checkWin(css, itemCss, level);
    setChecked(true);
    if (isWin) {
      setWon(true);
      setWrong(false);
      setCompleted(prev => new Set([...prev, level.id]));
      if (levelIdx === LEVELS.length - 1) setAllDone(true);
    } else {
      setWrong(true);
      setTimeout(() => setWrong(false), 500);
    }
  };

  const goToLevel = (idx: number) => {
    setLevelIdx(idx);
    setCss(LEVELS[idx].prefill);
    setItemCss(LEVELS[idx].itemPrefill ?? '');
    setWon(false); setWrong(false); setChecked(false); setShowHint(false);
  };

  const handleNext = () => {
    if (levelIdx < LEVELS.length - 1) goToLevel(levelIdx + 1);
  };

  const handleReset = () => {
    setCss(level.prefill);
    setItemCss(level.itemPrefill ?? '');
    setWon(false); setWrong(false); setChecked(false); setShowHint(false);
  };

  /* ── Textarea styles ── */
  const taSt: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    minHeight: 90, resize: 'vertical',
    background: '#060a14', border: '1.5px solid rgba(0,255,204,0.2)',
    color: '#7ee787', fontSize: 13, lineHeight: 1.7,
    fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
    padding: '10px 14px', outline: 'none', borderRadius: 4,
    transition: 'border-color .15s',
  };

  /* ── All done screen ── */
  if (allDone) {
    return (
      <div style={{
        minHeight: '100vh', background: '#060a14',
        backgroundImage: 'linear-gradient(rgba(0,255,204,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,204,0.03) 1px,transparent 1px)',
        backgroundSize: '44px 44px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 24, fontFamily: 'system-ui, sans-serif',
      }}>
        <style>{ANIM}</style>
        <div style={{ textAlign: 'center', animation: 'rktSlide .6s ease both' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🚀</div>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: '#475569', letterSpacing: '0.2em', marginBottom: 14 }}>
            MISSÃO COMPLETA
          </div>
          <h1 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 22, color: '#00ffcc', margin: '0 0 16px', textShadow: '0 0 24px #00ffcc' }}>
            PARABÉNS!
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', maxWidth: 360, lineHeight: 1.7, marginBottom: 28 }}>
            Você completou todas as {LEVELS.length} missões e dominou o CSS Flexbox. A frota está orgulhosa!
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
            {LEVELS.map(l => (
              <div key={l.id} style={{ width: 28, height: 28, borderRadius: '50%', background: '#00ffcc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Star size={12} color="#060a14" />
              </div>
            ))}
          </div>
          <button onClick={onBack} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 28px', background: 'linear-gradient(135deg,#00ffcc,#00ccaa)',
            border: 'none', color: '#060a14', cursor: 'pointer',
            fontFamily: "'Press Start 2P', monospace", fontSize: 10, fontWeight: 900,
            boxShadow: '0 0 24px rgba(0,255,204,0.4)',
          }}>
            <ChevronLeft size={14} /> VOLTAR À ARENA
          </button>
        </div>
      </div>
    );
  }

  /* ── Main layout ── */
  return (
    <div style={{
      minHeight: '100vh', background: '#060a14',
      backgroundImage: 'linear-gradient(rgba(0,255,204,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,204,0.03) 1px,transparent 1px)',
      backgroundSize: '44px 44px',
      fontFamily: 'system-ui, -apple-system, sans-serif', color: '#e2e8f0',
      overflowX: 'hidden',
    }}>
      <style>{ANIM}</style>

      {/* TOP BAR */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', borderBottom: '1px solid rgba(0,255,204,0.1)',
        flexWrap: 'wrap', gap: 12,
      }}>
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'none', border: '1.5px solid rgba(0,255,204,0.22)',
          color: '#64748b', cursor: 'pointer', padding: '7px 14px',
          fontFamily: "'Press Start 2P', monospace", fontSize: 8, borderRadius: 4,
          transition: 'all .15s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#00ffcc'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,255,204,0.5)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#64748b'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,255,204,0.22)'; }}
        >
          <ChevronLeft size={13} /> ARENA
        </button>

        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: '#00ffcc', textAlign: 'center' }}>
          🚀 FOGUETES NA ÓRBITA
        </div>

        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#334155' }}>
          {String(levelIdx + 1).padStart(2, '0')}/{LEVELS.length}
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '20px 16px 60px' }}>

        {/* ARENA */}
        <div style={{ marginBottom: 20, animation: 'rktSlide .4s ease both' }}>
          <GameArena
            level={level}
            containerStyle={containerStyle}
            itemStyle={itemStyle}
            won={won}
            wrong={wrong}
          />
        </div>

        {/* MISSION INFO */}
        <div style={{
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 8, padding: '16px 18px', marginBottom: 18,
          animation: 'rktSlide .45s ease .05s both',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#00ffcc' }}>
              {level.code}
            </span>
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#e2e8f0' }}>
              {level.title}
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.65, marginBottom: 8, marginTop: 0 }}>
            {level.story}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(0,255,204,0.06)', borderLeft: '3px solid #00ffcc', borderRadius: 4 }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}><strong style={{ color: '#00ffcc' }}>Missão:</strong> {level.task}</span>
          </div>
        </div>

        {/* CSS EDITOR */}
        <div style={{ marginBottom: 18, animation: 'rktSlide .45s ease .1s both' }}>

          {/* Container CSS */}
          <div style={{
            background: '#0a0e1a', border: '1.5px solid rgba(0,255,204,0.18)',
            borderRadius: 6, overflow: 'hidden', marginBottom: level.hasItemCss ? 12 : 0,
          }}>
            {/* Editor title bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
              background: 'rgba(0,255,204,0.06)', borderBottom: '1px solid rgba(0,255,204,0.1)',
            }}>
              <div style={{ display: 'flex', gap: 5 }}>
                {['#ef4444', '#fbbf24', '#22c55e'].map(c => (
                  <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                ))}
              </div>
              <span style={{ fontSize: 11, color: '#334155', fontFamily: 'monospace' }}>container.css</span>
            </div>
            <div style={{ padding: '10px 14px 4px', fontFamily: 'monospace', fontSize: 13, color: '#475569' }}>
              .container {'{'}
            </div>
            <textarea
              value={css}
              onChange={e => { setCss(e.target.value); setChecked(false); setWon(false); }}
              disabled={won}
              style={{ ...taSt, border: 'none', borderRadius: 0, background: 'transparent', paddingTop: 0, paddingBottom: 0, minHeight: 70 }}
              onFocus={e => (e.currentTarget.style.outline = 'none')}
              spellCheck={false}
            />
            <div style={{ padding: '4px 14px 10px', fontFamily: 'monospace', fontSize: 13, color: '#475569' }}>
              {'}'}
            </div>
          </div>

          {/* Item CSS (align-self level) */}
          {level.hasItemCss && (
            <div style={{
              background: '#0a0e1a', border: '1.5px solid rgba(167,139,250,0.25)',
              borderRadius: 6, overflow: 'hidden',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
                background: 'rgba(167,139,250,0.06)', borderBottom: '1px solid rgba(167,139,250,0.12)',
              }}>
                <div style={{ display: 'flex', gap: 5 }}>
                  {['#ef4444', '#fbbf24', '#22c55e'].map(c => (
                    <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                  ))}
                </div>
                <span style={{ fontSize: 11, color: '#334155', fontFamily: 'monospace' }}>rocket-3.css</span>
                <span style={{ fontSize: 10, color: '#a78bfa', marginLeft: 4 }}>← foguete especial</span>
              </div>
              <div style={{ padding: '10px 14px 4px', fontFamily: 'monospace', fontSize: 13, color: '#475569' }}>
                .rocket-3 {'{'}
              </div>
              <textarea
                value={itemCss}
                onChange={e => { setItemCss(e.target.value); setChecked(false); setWon(false); }}
                disabled={won}
                style={{ ...taSt, border: 'none', borderRadius: 0, background: 'transparent', paddingTop: 0, paddingBottom: 0, minHeight: 60, borderColor: 'transparent' }}
                onFocus={e => (e.currentTarget.style.outline = 'none')}
                spellCheck={false}
              />
              <div style={{ padding: '4px 14px 10px', fontFamily: 'monospace', fontSize: 13, color: '#475569' }}>
                {'}'}
              </div>
            </div>
          )}
        </div>

        {/* FEEDBACK */}
        {checked && !won && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
            background: 'rgba(239,68,68,0.1)', border: '1.5px solid rgba(239,68,68,0.35)',
            borderRadius: 6, marginBottom: 14, fontSize: 13, color: '#f87171',
          }}>
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8 }}>FALHA!</span>
            Verifique as propriedades e valores — os foguetes ainda não encaixaram.
          </div>
        )}

        {/* HINT */}
        {showHint && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px',
            background: 'rgba(251,191,36,0.08)', border: '1.5px solid rgba(251,191,36,0.3)',
            borderRadius: 6, marginBottom: 14, fontSize: 13, color: '#fbbf24',
          }}>
            <Lightbulb size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{level.hint}</span>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
          {!won ? (
            <button onClick={handleCheck} style={{
              flex: 1, minWidth: 160, padding: '13px',
              background: 'linear-gradient(135deg, rgba(0,255,204,0.15), rgba(0,255,204,0.08))',
              border: '2px solid #00ffcc', color: '#00ffcc',
              fontFamily: "'Press Start 2P', monospace", fontSize: 10,
              cursor: 'pointer', letterSpacing: '0.08em',
              boxShadow: '0 0 16px rgba(0,255,204,0.2)',
              borderRadius: 4, transition: 'all .15s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,255,204,0.2)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 28px rgba(0,255,204,0.4)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg,rgba(0,255,204,0.15),rgba(0,255,204,0.08))'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 16px rgba(0,255,204,0.2)'; }}
            >
              VERIFICAR ANCORAGEM
            </button>
          ) : (
            <button onClick={handleNext} disabled={levelIdx === LEVELS.length - 1} style={{
              flex: 1, minWidth: 160, padding: '13px',
              background: 'linear-gradient(135deg, #00ffcc, #00ccaa)',
              border: 'none', color: '#060a14',
              fontFamily: "'Press Start 2P', monospace", fontSize: 10,
              cursor: levelIdx === LEVELS.length - 1 ? 'not-allowed' : 'pointer',
              opacity: levelIdx === LEVELS.length - 1 ? 0.5 : 1,
              boxShadow: '0 0 20px rgba(0,255,204,0.4)',
              borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              PRÓXIMA MISSÃO <ChevronRight size={14} />
            </button>
          )}

          <button onClick={() => setShowHint(v => !v)} style={{
            padding: '13px 18px', background: 'none',
            border: `1.5px solid ${showHint ? 'rgba(251,191,36,0.6)' : 'rgba(255,255,255,0.1)'}`,
            color: showHint ? '#fbbf24' : '#475569', cursor: 'pointer', borderRadius: 4,
            display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, transition: 'all .15s',
          }}>
            <Lightbulb size={14} /> Dica
          </button>

          <button onClick={handleReset} style={{
            padding: '13px 16px', background: 'none',
            border: '1.5px solid rgba(255,255,255,0.08)',
            color: '#334155', cursor: 'pointer', borderRadius: 4,
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, transition: 'all .15s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#64748b'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#334155'; }}
          >
            <RotateCcw size={13} /> Resetar
          </button>
        </div>

        {/* LEVEL DOTS */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {LEVELS.map((l, i) => {
            const isDone    = completed.has(l.id);
            const isCurrent = i === levelIdx;
            const isLocked  = i > levelIdx && !completed.has(l.id);
            return (
              <button
                key={l.id}
                onClick={() => !isLocked && goToLevel(i)}
                title={`${l.code}: ${l.title}`}
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  background: isDone ? '#00ffcc' : isCurrent ? 'transparent' : 'rgba(255,255,255,0.05)',
                  border: isCurrent ? '2px solid #00ffcc' : isDone ? '2px solid #00ffcc' : '2px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  animation: isCurrent ? 'rktDotPulse 1.5s ease-in-out infinite' : 'none',
                  transition: 'all .15s',
                } as React.CSSProperties}
              >
                {isDone
                  ? <CheckCircle2 size={13} color="#060a14" />
                  : isLocked
                  ? <Lock size={10} color="#334155" />
                  : <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: isCurrent ? '#00ffcc' : '#475569' }}>{i + 1}</span>
                }
              </button>
            );
          })}
        </div>

        {/* LEGEND */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' }}>
          {[
            { color: 'rgba(0,255,204,0.65)', label: 'Estação de ancoragem (alvo)' },
            { color: '#fbbf24', label: 'Foguete 🚀' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#334155' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', border: `2px solid ${item.color}`, background: `${item.color}22` }} />
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
