import React, { useState, useMemo } from 'react';
import { ChevronLeft, RotateCcw, Lightbulb, CheckCircle2, Lock, Play, ChevronRight } from 'lucide-react';

/* ══════════════════════════════════════════════════════════════
   ANIMATIONS + RESPONSIVE
══════════════════════════════════════════════════════════════ */
const ANIM = `
  @keyframes rktFloat {
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(-8px); }
  }
  @keyframes rktTwinkle {
    0%,100% { opacity: 0.18; }
    50%      { opacity: 0.75; }
  }
  @keyframes rktWin {
    0%   { opacity:0; transform:scale(0.82); }
    60%  { transform:scale(1.08); }
    100% { opacity:1; transform:scale(1); }
  }
  @keyframes rktSlide {
    from { opacity:0; transform:translateY(14px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes rktPulse {
    0%,100% { opacity:.45; }
    50%     { opacity:1; }
  }
  @keyframes rktWrong {
    0%,100% { transform:translateX(0); }
    20%     { transform:translateX(-8px); }
    40%     { transform:translateX(8px); }
    60%     { transform:translateX(-5px); }
    80%     { transform:translateX(5px); }
  }
  @keyframes rktScan {
    from { top:-2px; }
    to   { top:100%; }
  }
  @keyframes rktDock {
    0%   { transform:scale(1) rotate(0deg); }
    40%  { transform:scale(1.2) rotate(-6deg); }
    70%  { transform:scale(0.93) rotate(3deg); }
    100% { transform:scale(1) rotate(0deg); }
  }
  @keyframes rktCardIn {
    from { opacity:0; transform:translateY(12px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes rktRingPulse {
    0%,100% { box-shadow:0 0 6px rgba(0,255,204,.35); }
    50%     { box-shadow:0 0 18px rgba(0,255,204,.7), 0 0 32px rgba(0,255,204,.25); }
  }

  .rkt-code {
    font-family: 'Fira Code','Cascadia Code','Consolas',monospace;
    font-size: 14px;
    line-height: 1.8;
    background: transparent;
    border: none;
    outline: none;
    resize: none;
    color: #7ee787;
    width: 100%;
    height: 100%;
    padding: 8px 16px;
    box-sizing: border-box;
    caret-color: #00ffcc;
    min-height: 80px;
  }
  .rkt-code:disabled { opacity:.55; cursor:not-allowed; }

  @media (max-width: 760px) {
    .rkt-split { flex-direction: column !important; }
    .rkt-left  { width:100%!important; max-height:58vh; border-right:none!important; border-bottom:1px solid rgba(0,255,204,.1); overflow-y:auto; }
    .rkt-right { width:100%!important; min-height:240px; flex:0 0 240px!important; }
  }
`;

/* ══════════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════════ */
interface Level {
  id: number; code: string; title: string;
  story: string; task: string;
  rockets: number; prefill: string;
  hasItemCss?: boolean; itemPrefill?: string; itemTarget?: number;
  winContainer: Record<string, string>;
  winItem?: Record<string, string>;
  solutionContainer: React.CSSProperties;
  solutionItem?: React.CSSProperties;
  hint: string; narrow?: boolean;
  concepts: string[];
}

/* ══════════════════════════════════════════════════════════════
   LEVELS
══════════════════════════════════════════════════════════════ */
const LEVELS: Level[] = [
  {
    id:1, code:'MISSÃO-01', title:'Órbita Leste',
    story:'Três foguetes perdidos precisam atracar nas estações do setor leste da galáxia.',
    task:'Mova os foguetes para o lado direito do container.',
    rockets:3, prefill:'display: flex;\n',
    winContainer:{'justify-content':'flex-end'},
    solutionContainer:{justifyContent:'flex-end'},
    hint:'justify-content: flex-end envia os itens para o final do eixo principal (direita no modo row).',
    concepts:['justify-content: flex-end'],
  },
  {
    id:2, code:'MISSÃO-02', title:'Estação Central',
    story:'A Estação Alfa fica no centro exato da órbita equatorial.',
    task:'Centralize os foguetes horizontalmente.',
    rockets:3, prefill:'display: flex;\n',
    winContainer:{'justify-content':'center'},
    solutionContainer:{justifyContent:'center'},
    hint:'justify-content: center centraliza os itens no eixo principal (horizontal no modo row).',
    concepts:['justify-content: center'],
  },
  {
    id:3, code:'MISSÃO-03', title:'Patrulha de Fronteiras',
    story:'Três foguetes devem cobrir os dois extremos e o ponto central simultaneamente.',
    task:'Distribua os foguetes com espaço igual ENTRE eles.',
    rockets:3, prefill:'display: flex;\n',
    winContainer:{'justify-content':'space-between'},
    solutionContainer:{justifyContent:'space-between'},
    hint:'justify-content: space-between distribui do início ao fim, sem margem nas bordas.',
    concepts:['justify-content: space-between'],
  },
  {
    id:4, code:'MISSÃO-04', title:'Zonas de Patrulha',
    story:'Quatro foguetes precisam de zonas iguais de patrulha ao REDOR de cada nave.',
    task:'Adicione espaço igual ao redor de cada foguete.',
    rockets:4, prefill:'display: flex;\n',
    winContainer:{'justify-content':'space-around'},
    solutionContainer:{justifyContent:'space-around'},
    hint:'justify-content: space-around coloca metade do espaço nas bordas e espaço cheio entre itens.',
    concepts:['justify-content: space-around'],
  },
  {
    id:5, code:'MISSÃO-05', title:'Plataforma Sul',
    story:'Uma chuva de meteoros força os foguetes a pousar na plataforma sul da estação.',
    task:'Mova os foguetes para o final do eixo cruzado (baixo).',
    rockets:3, prefill:'display: flex;\n',
    winContainer:{'align-items':'flex-end'},
    solutionContainer:{alignItems:'flex-end'},
    hint:'align-items controla o eixo perpendicular ao principal. flex-end = baixo no modo row.',
    concepts:['align-items: flex-end'],
  },
  {
    id:6, code:'MISSÃO-06', title:'Altitude de Cruzeiro',
    story:'Regulamento orbital: todas as naves devem voar no corredor central de altitude.',
    task:'Centralize os foguetes verticalmente.',
    rockets:3, prefill:'display: flex;\n',
    winContainer:{'align-items':'center'},
    solutionContainer:{alignItems:'center'},
    hint:'align-items: center centraliza os itens no eixo cruzado (vertical no modo row).',
    concepts:['align-items: center'],
  },
  {
    id:7, code:'MISSÃO-07', title:'Esquina Nordeste',
    story:'A estação de reabastecimento fica no canto direito superior. Precisão máxima.',
    task:'Mova os foguetes para o canto direito e para cima.',
    rockets:2, prefill:'display: flex;\n',
    winContainer:{'justify-content':'flex-end','align-items':'flex-start'},
    solutionContainer:{justifyContent:'flex-end',alignItems:'flex-start'},
    hint:'Combine justify-content: flex-end (direita) com align-items: flex-start (topo).',
    concepts:['justify-content','align-items'],
  },
  {
    id:8, code:'MISSÃO-08', title:'Aproximação Invertida',
    story:'Protocolo de emergência: as naves devem se aproximar no sentido inverso ao normal.',
    task:'Inverta a ordem horizontal dos foguetes.',
    rockets:3, prefill:'display: flex;\n',
    winContainer:{'flex-direction':'row-reverse'},
    solutionContainer:{flexDirection:'row-reverse'},
    hint:'flex-direction: row-reverse inverte a ordem — o último item fica na posição 1.',
    concepts:['flex-direction: row-reverse'],
  },
  {
    id:9, code:'MISSÃO-09', title:'Torre de Lançamento',
    story:'A nova plataforma só comporta foguetes empilhados verticalmente em coluna.',
    task:'Empilhe os foguetes em coluna de cima para baixo.',
    rockets:3, prefill:'display: flex;\n',
    winContainer:{'flex-direction':'column'},
    solutionContainer:{flexDirection:'column'},
    hint:'flex-direction: column muda o eixo principal para vertical.',
    concepts:['flex-direction: column'],
  },
  {
    id:10, code:'MISSÃO-10', title:'Coluna Invertida',
    story:'Sistema de emergência: sequência de lançamento invertida — de baixo para cima.',
    task:'Empilhe os foguetes em coluna na ordem reversa.',
    rockets:3, prefill:'display: flex;\n',
    winContainer:{'flex-direction':'column-reverse'},
    solutionContainer:{flexDirection:'column-reverse'},
    hint:'flex-direction: column-reverse empilha verticalmente, mas o item 1 fica embaixo.',
    concepts:['flex-direction: column-reverse'],
  },
  {
    id:11, code:'MISSÃO-11', title:'Ponto de Encontro',
    story:'A Estação Ômega fica no centro absoluto da órbita. Precisão de nanômetros.',
    task:'Centralize os foguetes horizontal E verticalmente ao mesmo tempo.',
    rockets:2, prefill:'display: flex;\n',
    winContainer:{'justify-content':'center','align-items':'center'},
    solutionContainer:{justifyContent:'center',alignItems:'center'},
    hint:'Use justify-content: center E align-items: center juntos para centralizar em ambos os eixos.',
    concepts:['justify-content: center','align-items: center'],
  },
  {
    id:12, code:'MISSÃO-12', title:'Coluna Central',
    story:'Formação especial da frota: coluna central alinhada ao eixo da galáxia.',
    task:'Empilhe em coluna e centralize horizontalmente.',
    rockets:3, prefill:'display: flex;\n',
    winContainer:{'flex-direction':'column','align-items':'center'},
    solutionContainer:{flexDirection:'column',alignItems:'center'},
    hint:'No modo column, align-items age no eixo horizontal. Use flex-direction + align-items.',
    concepts:['flex-direction: column','align-items: center'],
  },
  {
    id:13, code:'MISSÃO-13', title:'O Rebelde',
    story:'O terceiro foguete recebeu ordens especiais — sua posição é diferente dos demais.',
    task:'Use align-self no terceiro foguete para posicioná-lo embaixo.',
    rockets:3, prefill:'display: flex;\nalign-items: center;\n',
    hasItemCss:true, itemPrefill:'/* Foguete 3 */\n', itemTarget:2,
    winContainer:{},
    winItem:{'align-self':'flex-end'},
    solutionContainer:{alignItems:'center'},
    solutionItem:{alignSelf:'flex-end'},
    hint:'align-self sobrescreve o align-items do container para um item específico. Use flex-end.',
    concepts:['align-self: flex-end'],
  },
  {
    id:14, code:'MISSÃO-14', title:'Frota Expandida',
    story:'Seis novos foguetes chegaram! A órbita estreita não suporta todos na mesma linha.',
    task:'Faça os foguetes quebrarem para a próxima linha automaticamente.',
    rockets:6, prefill:'display: flex;\n', narrow:true,
    winContainer:{'flex-wrap':'wrap'},
    solutionContainer:{flexWrap:'wrap'},
    hint:'flex-wrap: wrap permite que itens quebrem para a próxima linha quando não há espaço.',
    concepts:['flex-wrap: wrap'],
  },
  {
    id:15, code:'MISSÃO-FINAL', title:'Alfa Centauri',
    story:'Missão final da frota! Formação de elite: coluna, distribuição uniforme e centrada.',
    task:'Combine flex-direction: column, justify-content: space-between e align-items: center.',
    rockets:3, prefill:'display: flex;\n',
    winContainer:{'flex-direction':'column','justify-content':'space-between','align-items':'center'},
    solutionContainer:{flexDirection:'column',justifyContent:'space-between',alignItems:'center'},
    hint:'Três propriedades! No modo column, justify-content age no eixo vertical. Combine tudo.',
    concepts:['flex-direction: column','justify-content: space-between','align-items: center'],
  },
];

/* ══════════════════════════════════════════════════════════════
   CSS PARSER
══════════════════════════════════════════════════════════════ */
const FLEX_MAP: Record<string, keyof React.CSSProperties> = {
  'display':'display','flex-direction':'flexDirection','flex-wrap':'flexWrap',
  'flex-flow':'flexFlow','justify-content':'justifyContent','align-items':'alignItems',
  'align-content':'alignContent','align-self':'alignSelf','flex':'flex',
  'flex-grow':'flexGrow','flex-shrink':'flexShrink','flex-basis':'flexBasis',
  'order':'order','gap':'gap','row-gap':'rowGap','column-gap':'columnGap',
  'place-items':'placeItems','place-content':'placeContent','justify-self':'justifySelf',
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
    const camel  = FLEX_MAP[prop] as string;
    if (!camel) return false;
    const actual = ((cp as Record<string, string>)[camel] ?? '').trim().toLowerCase();
    const valid  = expected.split('|').map(v => v.trim().toLowerCase());
    if (!valid.includes(actual)) return false;
  }
  if (level.winItem) {
    const ip = parseCssText(itemText);
    for (const [prop, expected] of Object.entries(level.winItem)) {
      const camel  = FLEX_MAP[prop] as string;
      if (!camel) return false;
      const actual = ((ip as Record<string, string>)[camel] ?? '').trim().toLowerCase();
      const valid  = expected.split('|').map(v => v.trim().toLowerCase());
      if (!valid.includes(actual)) return false;
    }
  }
  return true;
}

/* ══════════════════════════════════════════════════════════════
   SVG ROCKET
══════════════════════════════════════════════════════════════ */
const ROCKET_COLORS = ['#00ffcc','#a78bfa','#f87171','#fbbf24','#60a5fa','#fb923c'];

function RocketSVG({ idx, size, glow }: { idx: number; size: number; glow: boolean }) {
  const c = ROCKET_COLORS[idx % ROCKET_COLORS.length];
  return (
    <svg width={size} height={Math.round(size * 1.3)} viewBox="0 0 36 46" fill="none"
      style={{
        display: 'block', flexShrink: 0,
        filter: glow ? `drop-shadow(0 0 8px ${c})` : 'none',
        transition: 'filter .4s',
        animation: glow ? `rktDock .5s ease both` : `rktFloat ${2 + idx * 0.4}s ease-in-out ${idx * 0.3}s infinite`,
      }}>
      <path d="M18 2 C13 7 11 16 11 24 L18 29 L25 24 C25 16 23 7 18 2Z" fill={c} opacity="0.9"/>
      <path d="M11 24 L4 32 L11 28Z" fill={c} opacity="0.6"/>
      <path d="M25 24 L32 32 L25 28Z" fill={c} opacity="0.6"/>
      <circle cx="18" cy="15" r="4.5" fill="rgba(200,240,255,0.12)" stroke="rgba(200,240,255,0.55)" strokeWidth="1.2"/>
      <circle cx="18" cy="15" r="2.2" fill="rgba(200,240,255,0.3)"/>
      <ellipse cx="18" cy="30" rx="4" ry="2.2" fill="rgba(251,191,36,0.2)"/>
      <ellipse cx="18" cy="34" rx="2.8" ry="2" fill="rgba(251,191,36,0.38)"/>
      <ellipse cx="18" cy="38" rx="1.8" ry="1.5" fill="rgba(251,191,36,0.5)"/>
      <ellipse cx="18" cy="42" rx="1" ry="1" fill="rgba(251,191,36,0.28)"/>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   SVG STATION
══════════════════════════════════════════════════════════════ */
function StationSVG({ size, won }: { size: number; won: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 50" fill="none"
      style={{
        display: 'block', flexShrink: 0,
        filter: won
          ? 'drop-shadow(0 0 12px #00ffcc)'
          : 'drop-shadow(0 0 4px rgba(0,255,204,.4))',
        transition: 'filter .4s',
        animation: won ? 'none' : 'rktPulse 2.5s ease-in-out infinite',
      }}>
      <circle cx="25" cy="25" r="21" stroke="#00ffcc" strokeWidth="1.5" strokeDasharray="5 3" opacity={won ? 0.9 : 0.45}/>
      <circle cx="25" cy="25" r="13" stroke="#00ffcc" strokeWidth="1.5" opacity={won ? 0.9 : 0.35}/>
      <circle cx="25" cy="25" r="6" stroke="#00ffcc" strokeWidth="1.5" opacity={won ? 1 : 0.55}/>
      <circle cx="25" cy="25" r="2.5" fill="#00ffcc" opacity={won ? 1 : 0.4}/>
      <line x1="2" y1="25" x2="48" y2="25" stroke="#00ffcc" strokeWidth="0.6" opacity="0.2"/>
      <line x1="25" y1="2" x2="25" y2="48" stroke="#00ffcc" strokeWidth="0.6" opacity="0.2"/>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   STAR FIELD
══════════════════════════════════════════════════════════════ */
const STARS = Array.from({ length: 26 }, (_, i) => ({
  id: i, left: `${(i * 17 + 3) % 97 + 1}%`, top: `${(i * 13 + 7) % 93 + 1}%`,
  size: (i % 3) + 1, dur: 2.5 + (i % 4), del: -(i * 0.7) % 4,
}));

/* ══════════════════════════════════════════════════════════════
   GAME ARENA (right panel)
══════════════════════════════════════════════════════════════ */
function GameArena({ level, containerStyle, itemStyle, won, wrong }: {
  level: Level; containerStyle: React.CSSProperties;
  itemStyle: React.CSSProperties; won: boolean; wrong: boolean;
}) {
  const n     = level.rockets;
  const sz    = n >= 6 ? 40 : n >= 4 ? 46 : 52;
  const stnSz = Math.round(sz * 1.18);
  const gap   = 8;
  const maxW  = level.narrow ? 280 : '100%';

  const borderColor = won
    ? 'rgba(0,255,204,.6)'
    : wrong
    ? 'rgba(239,68,68,.45)'
    : 'rgba(0,255,204,.12)';

  return (
    <div style={{
      position: 'relative', width: maxW, maxWidth: '100%',
      height: '100%', minHeight: 200,
      background: 'linear-gradient(160deg,#030810 0%,#060a14 60%,#080c18 100%)',
      border: `1.5px solid ${borderColor}`,
      borderRadius: 10, overflow: 'hidden',
      boxShadow: won ? '0 0 28px rgba(0,255,204,.2)' : 'none',
      transition: 'border-color .3s,box-shadow .3s',
      animation: wrong ? 'rktWrong .45s ease' : 'none',
    }}>
      {/* Scanline */}
      <div style={{
        position:'absolute',left:0,right:0,height:1,zIndex:4,pointerEvents:'none',
        background:'linear-gradient(90deg,transparent,rgba(0,255,204,.1),transparent)',
        animation:'rktScan 5s linear infinite',
      }}/>

      {/* Stars */}
      <div style={{position:'absolute',inset:0,pointerEvents:'none'}}>
        {STARS.map(s => (
          <div key={s.id} style={{
            position:'absolute',left:s.left,top:s.top,
            width:s.size,height:s.size,borderRadius:'50%',background:'#fff',
            animation:`rktTwinkle ${s.dur}s ease-in-out ${s.del}s infinite`,
          }}/>
        ))}
      </div>

      {/* Stations layer — solution CSS */}
      <div style={{
        position:'absolute',inset:0,display:'flex',
        padding:12,boxSizing:'border-box',gap,
        ...level.solutionContainer,
      }}>
        {Array.from({length:n},(_,i)=>(
          <div key={i} style={{flexShrink:0,width:stnSz,height:stnSz,display:'flex',alignItems:'center',justifyContent:'center',
            ...( level.solutionItem && i === level.itemTarget ? level.solutionItem : {} )}}>
            <StationSVG size={stnSz} won={won}/>
          </div>
        ))}
      </div>

      {/* Rockets layer — player CSS */}
      <div style={{
        position:'absolute',inset:0,display:'flex',
        padding:12,boxSizing:'border-box',gap,
        ...containerStyle,
      }}>
        {Array.from({length:n},(_,i)=>(
          <div key={i} style={{flexShrink:0,
            ...( level.hasItemCss && i === level.itemTarget ? itemStyle : {} )}}>
            <RocketSVG idx={i} size={sz} glow={won}/>
          </div>
        ))}
      </div>

      {/* Win overlay */}
      {won && (
        <div style={{
          position:'absolute',inset:0,zIndex:5,
          display:'flex',alignItems:'center',justifyContent:'center',
          background:'rgba(0,255,204,.07)',backdropFilter:'blur(2px)',
          animation:'rktWin .4s ease both',
        }}>
          <div style={{
            fontFamily:"'Press Start 2P',monospace",fontSize:18,
            color:'#00ffcc',textShadow:'0 0 28px #00ffcc,0 0 56px rgba(0,255,204,.4)',
            letterSpacing:'.06em',
          }}>ANCORADO!</div>
        </div>
      )}

      {/* Label */}
      <div style={{
        position:'absolute',top:10,left:12,
        fontFamily:"'Press Start 2P',monospace",fontSize:7,
        color:'rgba(0,255,204,.3)',letterSpacing:'.15em',pointerEvents:'none',
      }}>SIMULADOR ORBITAL</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   LEVEL SELECT SCREEN
══════════════════════════════════════════════════════════════ */
function LevelSelect({ completed, onSelect, onBack, isDark }: {
  completed: Set<number>;
  onSelect: (idx: number) => void;
  onBack: () => void;
  isDark: boolean;
}) {
  const firstLocked = LEVELS.findIndex(l => !completed.has(l.id));
  const nextIdx     = firstLocked === -1 ? LEVELS.length - 1 : firstLocked;

  const bg       = isDark ? '#060a14'  : '#dde4ef';
  const mainText = isDark ? '#e2e8f0'  : '#1e293b';
  const subText  = isDark ? '#64748b'  : '#475569';
  const muted    = isDark ? '#334155'  : '#64748b';
  const accent   = isDark ? '#00ffcc'  : '#0d9488';
  const accentBd = isDark ? 'rgba(0,255,204,.22)' : 'rgba(0,0,0,0.18)';
  const topBd    = isDark ? 'rgba(0,255,204,.1)'  : 'rgba(0,0,0,0.12)';
  const grid     = isDark ? 'rgba(0,255,204,.03)'  : 'rgba(0,100,80,.04)';
  const cardDone = isDark ? '#0a1628' : '#f0fdf9';
  const cardCurr = isDark ? '#080f1e' : '#f8fafc';
  const cardLock = isDark ? 'rgba(255,255,255,.02)' : 'rgba(0,0,0,.03)';
  const cardUnlk = isDark ? 'rgba(255,255,255,.04)' : '#ffffff';
  const panelBg  = isDark ? 'rgba(255,255,255,.02)' : 'rgba(255,255,255,.75)';
  const panelBd  = isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.10)';

  return (
    <div style={{
      minHeight:'100vh',
      background:bg,
      backgroundImage:`linear-gradient(${grid} 1px,transparent 1px),linear-gradient(90deg,${grid} 1px,transparent 1px)`,
      backgroundSize:'44px 44px',
      fontFamily:'system-ui,-apple-system,sans-serif',color:mainText,
    }}>
      <style>{ANIM}</style>

      {/* Header */}
      <div style={{
        display:'flex',alignItems:'center',justifyContent:'space-between',
        padding:'18px 24px',borderBottom:`1px solid ${topBd}`,
        flexWrap:'wrap',gap:12,
      }}>
        <button onClick={onBack} style={{
          display:'flex',alignItems:'center',gap:8,
          background:'none',border:`1.5px solid ${accentBd}`,
          color:subText,cursor:'pointer',padding:'8px 16px',
          fontFamily:"'Press Start 2P',monospace",fontSize:9,borderRadius:4,
          transition:'all .15s',
        }}
          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color=accent;(e.currentTarget as HTMLElement).style.borderColor=accent;}}
          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color=subText;(e.currentTarget as HTMLElement).style.borderColor=accentBd;}}
        >
          <ChevronLeft size={14}/> ARENA
        </button>

        <div style={{textAlign:'center'}}>
          <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:7,color:muted,letterSpacing:'.2em',marginBottom:6}}>
            CSS FLEXBOX
          </div>
          <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:13,color:accent,
            textShadow: isDark ? '0 0 18px rgba(0,255,204,.5)' : 'none', letterSpacing:'.05em'}}>
            FOGUETES NA ÓRBITA
          </div>
        </div>

        <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:9,color:muted,textAlign:'right'}}>
          <div>{completed.size}/{LEVELS.length}</div>
          <div style={{fontSize:7,marginTop:4,color:subText}}>COMPLETOS</div>
        </div>
      </div>

      <div style={{maxWidth:960,margin:'0 auto',padding:'32px 20px 60px'}}>

        {/* Progress bar */}
        <div style={{marginBottom:40}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
            <span style={{fontFamily:"'Press Start 2P',monospace",fontSize:9,color:subText}}>
              PROGRESSO DA FROTA
            </span>
            <span style={{fontFamily:"'Press Start 2P',monospace",fontSize:11,color:accent}}>
              {Math.round(completed.size/LEVELS.length*100)}%
            </span>
          </div>
          <div style={{height:8,background: isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.08)',borderRadius:4,overflow:'hidden'}}>
            <div style={{
              height:'100%',borderRadius:4,
              width:`${completed.size/LEVELS.length*100}%`,
              background:`linear-gradient(90deg,${accent},${isDark?'#00ccaa':'#0f766e'})`,
              boxShadow: isDark ? '0 0 10px rgba(0,255,204,.5)' : 'none',
              transition:'width .4s ease',
            }}/>
          </div>
        </div>

        {/* Level grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))',gap:16}}>
          {LEVELS.map((lvl, i) => {
            const isDone     = completed.has(lvl.id);
            const isUnlocked = i === 0 || completed.has(LEVELS[i - 1].id);
            const isCurrent  = i === nextIdx && !isDone;

            const cardBg = isDone ? cardDone : isCurrent ? cardCurr : isUnlocked ? cardUnlk : cardLock;
            const cardBd = isDone
              ? (isDark ? 'rgba(0,255,204,.45)' : 'rgba(13,148,136,.5)')
              : isCurrent
              ? (isDark ? 'rgba(0,255,204,.35)' : 'rgba(13,148,136,.4)')
              : isUnlocked
              ? (isDark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.12)')
              : (isDark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.05)');
            const numClr = isDone || isCurrent ? accent : isUnlocked ? subText : muted;
            const titleClr = isDone
              ? (isDark ? '#94a3b8' : '#475569')
              : isCurrent ? mainText : isUnlocked ? subText : muted;
            const tagBg  = isDone ? (isDark ? 'rgba(0,255,204,.12)' : 'rgba(13,148,136,.12)') : (isDark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)');
            const tagClr = isDone ? accent : muted;
            const tagBd  = isDone ? (isDark ? 'rgba(0,255,204,.2)' : 'rgba(13,148,136,.25)') : (isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.08)');

            return (
              <button
                key={lvl.id}
                disabled={!isUnlocked}
                onClick={() => onSelect(i)}
                style={{
                  background: cardBg,
                  border: `2px solid ${cardBd}`,
                  borderRadius:10,padding:'18px 14px',
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  textAlign:'left',position:'relative',
                  opacity: isUnlocked ? 1 : 0.45,
                  transition:'all .2s',
                  animation:`rktCardIn .35s ease ${i * .04}s both`,
                  boxShadow: !isDark && isUnlocked ? '0 2px 8px rgba(0,0,0,.06)' : 'none',
                }}
                onMouseEnter={e => { if (isUnlocked) (e.currentTarget as HTMLElement).style.transform='translateY(-4px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform='none'; }}
              >
                {/* Status icon */}
                <div style={{position:'absolute',top:12,right:12}}>
                  {isDone
                    ? <CheckCircle2 size={16} color={accent}/>
                    : isUnlocked
                    ? <Play size={14} color={isCurrent ? accent : muted}/>
                    : <Lock size={13} color={muted}/>
                  }
                </div>

                {/* Number */}
                <div style={{
                  fontFamily:"'Press Start 2P',monospace",
                  fontSize: lvl.id === 15 ? 8 : 18,
                  color: numClr,
                  marginBottom:10,lineHeight:1,
                }}>
                  {lvl.id === 15 ? 'FINAL' : String(lvl.id).padStart(2,'0')}
                </div>

                {/* Title */}
                <div style={{
                  fontSize:13,fontWeight:700,
                  color: titleClr,
                  marginBottom:10,lineHeight:1.4,
                }}>
                  {lvl.title}
                </div>

                {/* Concepts */}
                <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                  {lvl.concepts.slice(0,2).map(c=>(
                    <span key={c} style={{
                      fontSize:10,padding:'2px 6px',borderRadius:3,
                      background: tagBg, color: tagClr, border:`1px solid ${tagBd}`,
                    }}>{c.split(':')[0]}</span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* All done banner */}
        {completed.size === LEVELS.length && (
          <div style={{
            marginTop:48,padding:'28px 32px',
            background: isDark ? 'rgba(0,255,204,.05)' : 'rgba(13,148,136,.06)',
            border:`2px solid ${isDark ? 'rgba(0,255,204,.3)' : 'rgba(13,148,136,.35)'}`,
            borderRadius:12,textAlign:'center',
            animation:'rktSlide .5s ease both',
          }}>
            <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:14,color:accent,
              textShadow: isDark ? '0 0 24px #00ffcc' : 'none',marginBottom:12}}>
              FROTA COMPLETA!
            </div>
            <p style={{fontSize:15,color:subText,margin:0}}>
              Você dominou todas as propriedades do CSS Flexbox. A galáxia está nas suas mãos!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
export default function FlexRocketPage({ onBack, isDark = true }: { onBack: () => void; isDark?: boolean }) {
  /* — persistence — */
  const [completed, setCompleted] = useState<Set<number>>(() => {
    try {
      const s = localStorage.getItem('flexrocket-v1');
      if (s) return new Set(JSON.parse(s) as number[]);
    } catch {}
    return new Set<number>();
  });

  const markCompleted = (id: number) => {
    setCompleted(prev => {
      const next = new Set([...prev, id]);
      try { localStorage.setItem('flexrocket-v1', JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  /* — navigation — */
  const [screen,   setScreen]   = useState<'select'|'game'>('select');
  const [levelIdx, setLevelIdx] = useState(0);

  /* — editor state — */
  const [css,      setCss]      = useState(LEVELS[0].prefill);
  const [itemCss,  setItemCss]  = useState(LEVELS[0].itemPrefill ?? '');
  const [won,      setWon]      = useState(false);
  const [wrong,    setWrong]    = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [checked,  setChecked]  = useState(false);

  const level          = LEVELS[levelIdx];
  const containerStyle = useMemo(() => parseCssText(css), [css]);
  const itemStyle      = useMemo(() => parseCssText(itemCss), [itemCss]);

  const goToLevel = (idx: number) => {
    setLevelIdx(idx);
    setCss(LEVELS[idx].prefill);
    setItemCss(LEVELS[idx].itemPrefill ?? '');
    setWon(false); setWrong(false); setChecked(false); setShowHint(false);
    setScreen('game');
  };

  const handleCheck = () => {
    const isWin = checkWin(css, itemCss, level);
    setChecked(true);
    if (isWin) {
      setWon(true); setWrong(false);
      markCompleted(level.id);
    } else {
      setWrong(true);
      setTimeout(() => setWrong(false), 500);
    }
  };

  const handleNext = () => {
    if (levelIdx < LEVELS.length - 1) goToLevel(levelIdx + 1);
    else setScreen('select');
  };

  const handleReset = () => {
    setCss(level.prefill); setItemCss(level.itemPrefill ?? '');
    setWon(false); setWrong(false); setChecked(false); setShowHint(false);
  };

  /* ─ Level select screen ─ */
  if (screen === 'select') {
    return (
      <LevelSelect
        completed={completed}
        onSelect={goToLevel}
        onBack={onBack}
        isDark={isDark}
      />
    );
  }

  /* ─ Game screen ─ */
  const isUnlocked = levelIdx === 0 || completed.has(LEVELS[levelIdx - 1].id);

  /* ── Tema ── */
  const bg       = isDark ? '#060a14'  : '#dde4ef';
  const mainText = isDark ? '#e2e8f0'  : '#1e293b';
  const subText  = isDark ? '#64748b'  : '#475569';
  const muted    = isDark ? '#334155'  : '#64748b';
  const accent   = isDark ? '#00ffcc'  : '#0d9488';
  const accentBd = isDark ? 'rgba(0,255,204,.22)' : 'rgba(0,0,0,0.18)';
  const topBd    = isDark ? 'rgba(0,255,204,.1)'  : 'rgba(0,0,0,0.12)';
  const leftPanelBg  = isDark ? '#060a14'  : '#f8fafc';
  const leftBorder   = isDark ? 'rgba(0,255,204,.08)' : 'rgba(0,0,0,0.10)';
  const briefBg      = isDark ? 'rgba(0,255,204,.06)' : 'rgba(13,148,136,.07)';
  const briefBorderL = isDark ? '#00ffcc' : '#0d9488';
  const taskAccent   = isDark ? '#00ffcc' : '#0d9488';
  const conceptBg    = isDark ? 'rgba(0,255,204,.1)' : 'rgba(13,148,136,.1)';
  const conceptBd    = isDark ? 'rgba(0,255,204,.25)' : 'rgba(13,148,136,.3)';
  const editorBg     = isDark ? '#070b16'  : '#1e1e2e'; // editor fica sempre escuro (terminal)
  const dotBg        = isDark ? 'rgba(0,255,204,.05)' : 'rgba(255,255,255,.07)';
  const dotBd        = isDark ? 'rgba(0,255,204,.08)' : 'rgba(255,255,255,.1)';
  const actionBd     = isDark ? 'rgba(0,255,204,.08)' : 'rgba(0,0,0,.10)';
  const hintBg       = isDark ? 'rgba(251,191,36,.07)' : 'rgba(251,191,36,.1)';
  const hintBd       = isDark ? 'rgba(251,191,36,.28)' : 'rgba(251,191,36,.4)';
  const errBg        = isDark ? 'rgba(239,68,68,.1)' : 'rgba(239,68,68,.08)';
  const errBd        = isDark ? 'rgba(239,68,68,.35)' : 'rgba(239,68,68,.4)';

  const btnBase: React.CSSProperties = {
    display:'flex',alignItems:'center',justifyContent:'center',gap:8,
    padding:'11px 18px',cursor:'pointer',borderRadius:4,fontSize:13,fontWeight:700,
    fontFamily:"'Press Start 2P',monospace",letterSpacing:'.04em',transition:'all .15s',
    border:'none',
  };

  return (
    <div style={{
      display:'flex',flexDirection:'column',height:'100vh',overflow:'hidden',
      background:bg,fontFamily:'system-ui,-apple-system,sans-serif',color:mainText,
    }}>
      <style>{ANIM}</style>

      {/* ── TOP BAR ── */}
      <div style={{
        display:'flex',alignItems:'center',justifyContent:'space-between',
        padding:'12px 20px',borderBottom:`1px solid ${topBd}`,
        flexShrink:0,flexWrap:'wrap',gap:8,
      }}>
        <button onClick={() => setScreen('select')} style={{
          display:'flex',alignItems:'center',gap:7,
          background:'none',border:`1.5px solid ${accentBd}`,
          color:subText,cursor:'pointer',padding:'7px 14px',
          fontFamily:"'Press Start 2P',monospace",fontSize:8,borderRadius:4,
          transition:'all .15s',
        }}
          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color=accent;(e.currentTarget as HTMLElement).style.borderColor=accent;}}
          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color=subText;(e.currentTarget as HTMLElement).style.borderColor=accentBd;}}
        >
          <ChevronLeft size={13}/> MISSÕES
        </button>

        <div style={{textAlign:'center'}}>
          <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:8,color:accent,letterSpacing:'.04em'}}>
            {level.code} — {level.title}
          </div>
        </div>

        <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:8,color:muted}}>
          {String(levelIdx+1).padStart(2,'0')}&nbsp;/&nbsp;{LEVELS.length}
        </div>
      </div>

      {/* ── MAIN SPLIT ── */}
      <div className="rkt-split" style={{display:'flex',flex:1,overflow:'hidden',minHeight:0}}>

        {/* ════ LEFT PANEL ════ */}
        <div className="rkt-left" style={{
          width:'46%',display:'flex',flexDirection:'column',
          background:leftPanelBg,
          borderRight:`1px solid ${leftBorder}`,
          overflow:'hidden',
        }}>

          {/* TOP-LEFT: Mission briefing + level dots */}
          <div style={{
            padding:'18px 20px 14px',
            borderBottom:`1px solid ${leftBorder}`,
            flexShrink:0,
          }}>
            {/* Story */}
            <p style={{fontSize:14,color:subText,lineHeight:1.7,margin:'0 0 12px'}}>
              {level.story}
            </p>

            {/* Task */}
            <div style={{
              padding:'10px 14px',background:briefBg,
              borderLeft:`3px solid ${briefBorderL}`,borderRadius:4,marginBottom:16,
            }}>
              <span style={{fontSize:11,fontFamily:"'Press Start 2P',monospace",color:taskAccent,letterSpacing:'.03em'}}>
                MISSÃO:&nbsp;
              </span>
              <span style={{fontSize:14,color:isDark?'#94a3b8':subText,lineHeight:1.6}}>{level.task}</span>
            </div>

            {/* Concepts tags */}
            <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:14}}>
              {level.concepts.map(c=>(
                <span key={c} style={{
                  padding:'4px 10px',fontSize:12,fontWeight:700,
                  background:conceptBg,color:accent,
                  border:`1px solid ${conceptBd}`,borderRadius:3,
                }}>{c}</span>
              ))}
            </div>

            {/* Mini level map */}
            <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
              {LEVELS.map((l, i) => {
                const isDone    = completed.has(l.id);
                const isLocked  = i > 0 && !completed.has(LEVELS[i-1].id);
                const isCurrent = i === levelIdx;
                const dotBgColor = isDone ? accent
                  : isCurrent ? (isDark ? 'rgba(0,255,204,.15)' : 'rgba(13,148,136,.15)')
                  : isLocked  ? (isDark ? 'rgba(255,255,255,.03)' : 'rgba(0,0,0,.04)')
                  : (isDark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.07)');
                const dotBdColor = (isCurrent || isDone) ? accent
                  : isLocked ? (isDark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.08)')
                  : (isDark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.12)');
                return (
                  <button key={l.id}
                    onClick={() => !isLocked && goToLevel(i)}
                    title={`${l.code}: ${l.title}`}
                    style={{
                      width:26,height:26,borderRadius:6,
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      background: dotBgColor,
                      border:`1.5px solid ${dotBdColor}`,
                      display:'flex',alignItems:'center',justifyContent:'center',
                      opacity: isLocked ? 0.35 : 1,
                      transition:'all .15s',
                    } as React.CSSProperties}
                  >
                    {isDone
                      ? <CheckCircle2 size={12} color={isDark?'#060a14':'#ffffff'}/>
                      : isLocked
                      ? <Lock size={10} color={muted}/>
                      : <span style={{fontFamily:"'Press Start 2P',monospace",fontSize:7,color:isCurrent?accent:subText}}>{i+1}</span>
                    }
                  </button>
                );
              })}
            </div>
          </div>

          {/* BOTTOM-LEFT: CSS Editor */}
          <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minHeight:0}}>

            {/* Container CSS */}
            <div style={{
              flex:1,display:'flex',flexDirection:'column',minHeight:0,
              background:editorBg,
              borderBottom: level.hasItemCss ? `1px solid ${dotBd}` : 'none',
            }}>
              {/* Editor title bar */}
              <div style={{
                display:'flex',alignItems:'center',gap:8,padding:'8px 14px',
                background:dotBg,borderBottom:`1px solid ${dotBd}`,
                flexShrink:0,
              }}>
                <div style={{display:'flex',gap:5}}>
                  {['#ef4444','#fbbf24','#22c55e'].map(c=>(
                    <div key={c} style={{width:9,height:9,borderRadius:'50%',background:c}}/>
                  ))}
                </div>
                <span style={{fontSize:12,color:'#475569',fontFamily:'monospace',letterSpacing:'.03em'}}>
                  container.css
                </span>
              </div>

              {/* Code area */}
              <div style={{flex:1,overflow:'auto',minHeight:0}}>
                <div style={{padding:'10px 14px 0',fontFamily:'monospace',fontSize:14,color:'#475569'}}>
                  .container {'{'}
                </div>
                <textarea
                  className="rkt-code"
                  value={css}
                  onChange={e=>{setCss(e.target.value);setChecked(false);setWon(false);}}
                  disabled={won && !level.hasItemCss}
                  spellCheck={false}
                  style={{minHeight:0}}
                />
                <div style={{padding:'0 14px 10px',fontFamily:'monospace',fontSize:14,color:'#475569'}}>
                  {'}'}
                </div>
              </div>
            </div>

            {/* Item CSS (level 13) */}
            {level.hasItemCss && (
              <div style={{
                flex:'0 0 auto',maxHeight:'40%',display:'flex',flexDirection:'column',
                background:editorBg,overflow:'hidden',
              }}>
                <div style={{
                  display:'flex',alignItems:'center',gap:8,padding:'8px 14px',
                  background:'rgba(167,139,250,.06)',borderBottom:'1px solid rgba(167,139,250,.1)',
                  flexShrink:0,
                }}>
                  <div style={{display:'flex',gap:5}}>
                    {['#ef4444','#fbbf24','#22c55e'].map(c=>(
                      <div key={c} style={{width:9,height:9,borderRadius:'50%',background:c}}/>
                    ))}
                  </div>
                  <span style={{fontSize:12,color:'#475569',fontFamily:'monospace'}}>rocket-3.css</span>
                  <span style={{fontSize:11,color:'#a78bfa',marginLeft:4}}>← foguete especial</span>
                </div>
                <div style={{overflow:'auto',minHeight:60}}>
                  <div style={{padding:'10px 14px 0',fontFamily:'monospace',fontSize:14,color:'#475569'}}>
                    .rocket-3 {'{'}
                  </div>
                  <textarea
                    className="rkt-code"
                    value={itemCss}
                    onChange={e=>{setItemCss(e.target.value);setChecked(false);setWon(false);}}
                    disabled={won}
                    spellCheck={false}
                    style={{minHeight:60,color:'#c4b5fd'}}
                  />
                  <div style={{padding:'0 14px 10px',fontFamily:'monospace',fontSize:14,color:'#475569'}}>
                    {'}'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ACTION BAR */}
          <div style={{
            padding:'12px 16px',borderTop:`1px solid ${actionBd}`,
            flexShrink:0,display:'flex',flexDirection:'column',gap:10,
          }}>
            {/* Feedback messages */}
            {checked && !won && (
              <div style={{
                display:'flex',alignItems:'center',gap:9,padding:'9px 13px',
                background:errBg,border:`1.5px solid ${errBd}`,
                borderRadius:5,fontSize:13,color:'#f87171',
              }}>
                <span style={{fontFamily:"'Press Start 2P',monospace",fontSize:8,flexShrink:0}}>FALHA</span>
                Verifique as propriedades — os foguetes não encaixaram.
              </div>
            )}
            {showHint && (
              <div style={{
                display:'flex',alignItems:'flex-start',gap:9,padding:'9px 13px',
                background:hintBg,border:`1.5px solid ${hintBd}`,
                borderRadius:5,fontSize:14,color:'#fbbf24',lineHeight:1.65,
              }}>
                <Lightbulb size={15} style={{flexShrink:0,marginTop:1}}/>
                {level.hint}
              </div>
            )}

            {/* Buttons */}
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {!won ? (
                <button onClick={handleCheck} style={{
                  ...btnBase,flex:1,minWidth:140,
                  background: isDark ? 'linear-gradient(135deg,rgba(0,255,204,.15),rgba(0,255,204,.07))' : 'rgba(13,148,136,.1)',
                  border:`2px solid ${accent}`,color:accent,fontSize:11,
                  boxShadow: isDark ? '0 0 14px rgba(0,255,204,.2)' : 'none',
                }}>
                  VERIFICAR
                </button>
              ) : (
                <button onClick={handleNext} style={{
                  ...btnBase,flex:1,minWidth:140,
                  background:`linear-gradient(135deg,${accent},${isDark?'#00ccaa':'#0f766e'})`,
                  color: isDark ? '#060a14' : '#ffffff', fontSize:11,
                  boxShadow: isDark ? '0 0 18px rgba(0,255,204,.4)' : 'none',
                }}>
                  {levelIdx < LEVELS.length - 1
                    ? <><span>PRÓXIMA</span><ChevronRight size={14}/></>
                    : 'VER MISSÕES'
                  }
                </button>
              )}

              <button onClick={()=>setShowHint(v=>!v)} style={{
                ...btnBase,padding:'11px 14px',fontSize:12,
                background:'none',
                border:`1.5px solid ${showHint?'rgba(251,191,36,.5)': isDark?'rgba(255,255,255,.1)':'rgba(0,0,0,.15)'}`,
                color: showHint?'#fbbf24':subText,fontFamily:'system-ui,sans-serif',
              }}>
                <Lightbulb size={14}/>
              </button>

              <button onClick={handleReset} style={{
                ...btnBase,padding:'11px 14px',fontSize:12,
                background:'none',border:`1.5px solid ${isDark?'rgba(255,255,255,.08)':'rgba(0,0,0,.12)'}`,
                color:muted,fontFamily:'system-ui,sans-serif',
              }}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color=subText;}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color=muted;}}
              >
                <RotateCcw size={13}/>
              </button>
            </div>
          </div>
        </div>

        {/* ════ RIGHT PANEL ════ — sempre escuro (espaço sideral) */}
        <div className="rkt-right" style={{
          flex:1,display:'flex',flexDirection:'column',
          alignItems:'center',justifyContent:'center',
          padding:20,background:'#030710',overflow:'hidden',
        }}>
          {/* Right panel label */}
          <div style={{
            fontFamily:"'Press Start 2P',monospace",fontSize:8,color:'rgba(255,255,255,.12)',
            letterSpacing:'.2em',marginBottom:14,alignSelf:'flex-start',
          }}>
            VISUALIZAÇÃO
          </div>

          {/* Game arena fills remaining space */}
          <div style={{flex:1,width:'100%',minHeight:0}}>
            {isUnlocked ? (
              <GameArena
                level={level}
                containerStyle={containerStyle}
                itemStyle={itemStyle}
                won={won}
                wrong={wrong}
              />
            ) : (
              <div style={{
                height:'100%',display:'flex',flexDirection:'column',
                alignItems:'center',justifyContent:'center',gap:16,
                border:'1.5px solid rgba(255,255,255,.06)',borderRadius:10,
              }}>
                <Lock size={32} color="#1e293b"/>
                <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:10,color:'#1e293b',
                  letterSpacing:'.08em',textAlign:'center'}}>
                  MISSÃO BLOQUEADA
                </div>
                <p style={{fontSize:14,color:'#1e293b',textAlign:'center',margin:0}}>
                  Complete a missão anterior para desbloquear.
                </p>
              </div>
            )}
          </div>

          {/* Legend */}
          <div style={{
            display:'flex',gap:20,marginTop:14,flexWrap:'wrap',justifyContent:'center',
          }}>
            {[
              {color:'#00ffcc',label:'Estação (posição alvo)'},
              {color:ROCKET_COLORS[0],label:'Foguete (seu CSS)'},
            ].map(item=>(
              <div key={item.label} style={{display:'flex',alignItems:'center',gap:7,fontSize:12,color:'rgba(255,255,255,.35)'}}>
                <div style={{
                  width:11,height:11,borderRadius:'50%',
                  border:`2px solid ${item.color}`,background:`${item.color}22`,
                }}/>
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
