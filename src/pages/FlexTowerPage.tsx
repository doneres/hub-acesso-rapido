import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft, Heart, Shield, Zap, Trophy, RefreshCw,
  ChevronRight, Lightbulb, Sun, Moon, CheckCircle2,
} from 'lucide-react';
import { gameTheme } from '../lib/gameTheme';
import { useGameState } from '../hooks/useGameState';

/* ═══════════════════════════════════════════════════════════
   CONSTANTS — game physics (do not change without re-verifying column math)
═══════════════════════════════════════════════════════════ */
const COLS    = 8;
const BW      = 640;
const BH      = 400;
const CW      = BW / COLS;   // 80px
const TW      = 56;
const TH      = 60;
const TOW_Y   = 330;          // tower vertical center
const SPAWN_Y = -22;
const EXIT_Y  = BH + 12;
const FIRE_S  = 0.85;
const RANGE   = CW * 0.72;   // 57.6px — same column to fire
const MAX_LIVES = 5;
const COINS_PER_KILL = 3;

const ANIM = `
@keyframes ft-shake  { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }
@keyframes ft-pop    { 0%{transform:scale(0);opacity:1} 100%{transform:scale(2.5);opacity:0} }
@keyframes ft-pulse  { 0%,100%{opacity:.6} 50%{opacity:1} }
@keyframes ft-in     { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
@keyframes ft-glow   { 0%,100%{box-shadow:0 0 12px rgba(0,255,204,.25)} 50%{box-shadow:0 0 28px rgba(0,255,204,.55)} }
@media (max-width:900px){
  .ft-split{flex-direction:column!important}
  .ft-left{width:100%!important;max-height:50vh;border-right:none!important;border-bottom:1px solid rgba(0,255,204,.1);overflow-y:auto}
  .ft-right{flex:0 0 auto!important}
}
`;

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
interface Enemy    { id:number; col:number; y:number; hp:number; maxHp:number; speed:number }
interface Explosion{ id:number; x:number;  y:number; life:number }
interface Beam     { id:number; x:number;  fromY:number; toY:number; life:number; color:string }

/* ═══════════════════════════════════════════════════════════
   LEVEL DATA
   Tower centers (BW=640, TW=56):
   flex-end (1):         center 612 → col 7
   center   (1):         center 320 → col 4 (cols 3,4)
   space-between (2):    29, 611 → cols 0,7
   space-around  (2):    163, 477 → cols 2,5
   space-evenly  (3):    145, 320, 495 → cols 1,4,6
   space-between (4):    29, 222, 415, 611 → cols 0,2,5,7
═══════════════════════════════════════════════════════════ */
interface WaveDef { cols:number[]; count:number; speed:number; hp:number; interval:number }
interface LevelDef {
  num:number; title:string; story:string; task:string;
  prop:string; initVal:string; answers:string[]; hint:string;
  towers:number; waves:WaveDef[];
}

const LEVELS: LevelDef[] = [
  {
    num:1, title:'Primeira Defesa',
    story:'Invasores marcham pela coluna da direita. A torre está no início — mova-a para o final!',
    task:'Posicione a torre na EXTREMIDADE DIREITA da linha de defesa.',
    prop:'justify-content', initVal:'flex-start',
    answers:['flex-end'],
    hint:'flex-end desloca todos os itens para o FIM do eixo principal (direita).',
    towers:1,
    waves:[{ cols:[7], count:10, speed:58, hp:2, interval:1.8 }],
  },
  {
    num:2, title:'Centro de Comando',
    story:'Dois grupos de invasores vêm pelo corredor central. A torre precisa estar no meio exato.',
    task:'CENTRALIZE a torre no eixo horizontal.',
    prop:'justify-content', initVal:'flex-start',
    answers:['center'],
    hint:'center divide o espaço livre igualmente nas duas pontas — posicionando os itens no centro.',
    towers:1,
    waves:[{ cols:[3,4], count:12, speed:60, hp:2, interval:1.6 }],
  },
  {
    num:3, title:'Dois Flancos',
    story:'Ataque simultâneo nas duas bordas! Duas torres — uma em cada extremo.',
    task:'Coloque as duas torres: uma na borda ESQUERDA e outra na DIREITA.',
    prop:'justify-content', initVal:'flex-start',
    answers:['space-between'],
    hint:'space-between: máximo espaço entre os itens — primeiro e último ficam nas bordas exatas.',
    towers:2,
    waves:[{ cols:[0,7], count:14, speed:62, hp:2, interval:1.5 }],
  },
  {
    num:4, title:'Margens Simétricas',
    story:'Invasores nas colunas 2 e 5. Cada torre precisa ter a mesma margem em ambos os lados.',
    task:'Distribua as duas torres com MARGENS IGUAIS em volta de cada uma.',
    prop:'justify-content', initVal:'flex-start',
    answers:['space-around'],
    hint:'space-around: cada item recebe espaço igual à esquerda e à direita (esses espaços se somam entre itens adjacentes).',
    towers:2,
    waves:[{ cols:[2,5], count:14, speed:64, hp:3, interval:1.5 }],
  },
  {
    num:5, title:'Três Guardiões',
    story:'Ataque triplo nas colunas 1, 4 e 6! Três torres — espaço idêntico entre todas.',
    task:'Distribua as 3 torres com espaço EXATAMENTE IGUAL entre todas, inclusive nas bordas.',
    prop:'justify-content', initVal:'flex-start',
    answers:['space-evenly'],
    hint:'space-evenly: espaço IDÊNTICO em todas as lacunas — inclusive entre as bordas e os itens das pontas.',
    towers:3,
    waves:[{ cols:[1,4,6], count:16, speed:66, hp:3, interval:1.4 }],
  },
  {
    num:6, title:'Assalto Final',
    story:'HORDA TOTAL! Quatro frentes simultâneas — colunas 0, 2, 5 e 7. Dois ataques seguidos!',
    task:'Posicione as 4 torres cobrindo as bordas e os flancos internos.',
    prop:'justify-content', initVal:'flex-start',
    answers:['space-between'],
    hint:'4 itens com space-between ficam nas cols 0, 2, 5 e 7 — bordas e divisões uniformes.',
    towers:4,
    waves:[
      { cols:[0,2,5,7], count:18, speed:66, hp:3, interval:1.3 },
      { cols:[0,2,5,7], count:24, speed:74, hp:4, interval:1.0 },
    ],
  },
];

const TOWER_COLORS = ['#00ffcc','#a78bfa','#f87171','#fbbf24'];
const TOWER_GC     = ['#00ccaa','#7c3aed','#ef4444','#d97706'];

const JC_REF = [
  { val:'flex-start',    ascii:'[## ##      ]' },
  { val:'flex-end',      ascii:'[      ## ##]' },
  { val:'center',        ascii:'[   ## ##   ]' },
  { val:'space-between', ascii:'[##       ##]' },
  { val:'space-around',  ascii:'[ ##     ## ]' },
  { val:'space-evenly',  ascii:'[ ##  ##  ## ]' },
] as const;

/* ═══════════════════════════════════════════════════════════
   COIN BADGE (svg, no emoji)
═══════════════════════════════════════════════════════════ */
function CoinBadge({ count, dark }: { count:number; dark:boolean }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7.5" fill="#fbbf24" stroke="#d97706" strokeWidth="1"/>
        <text x="8" y="11.5" textAnchor="middle" fill="#92400e" fontSize="7.5" fontWeight="bold" fontFamily="monospace">C</text>
      </svg>
      <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:10, color: dark ? '#fbbf24' : '#92400e' }}>{count}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
interface Props { onBackToHub:()=>void; isDark?:boolean }

export default function FlexTowerPage({ onBackToHub, isDark: isDarkProp }: Props) {
  const { addCoins, addPoints } = useGameState();

  const [dark, setDark] = useState(isDarkProp ?? true);

  // ── Level / phase ───────────────────────────────────────
  const [levelIdx, setLevelIdx] = useState(0);
  const [phase, setPhase]       = useState<'intro'|'playing'|'wave_end'|'win'|'gameover'>('intro');
  const [completedLevels, setCompletedLevels] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem('ft_done') || '[]'); } catch { return []; }
  });

  // ── CSS editor ──────────────────────────────────────────
  const [cssInput, setCssInput]     = useState('');
  const [appliedVal, setAppliedVal] = useState(LEVELS[0].initVal);
  const [cssError, setCssError]     = useState('');

  // ── HUD ─────────────────────────────────────────────────
  const [lives, setLives] = useState(MAX_LIVES);
  const [coins, setCoins] = useState(0);
  const [wave,  setWave]  = useState(0);
  const [, setTick]       = useState(0);

  // ── Game loop refs ──────────────────────────────────────
  const boardRef    = useRef<HTMLDivElement>(null);
  const towerRefs   = useRef<(HTMLDivElement|null)[]>([]);
  const frameRef    = useRef<number>();
  const lastTRef    = useRef<number>(0);
  const levelIdxRef = useRef(0);
  const loopRef     = useRef<(ts:number)=>void>(() => {});

  const enemiesRef  = useRef<Enemy[]>([]);
  const exploRef    = useRef<Explosion[]>([]);
  const beamsRef    = useRef<Beam[]>([]);
  const towCoolRef  = useRef<number[]>([]);
  const livesRef    = useRef(MAX_LIVES);
  const coinsRef    = useRef(0);
  const waveRef     = useRef(0);
  const spawnTimR   = useRef(0);
  const spawnedR    = useRef(0);
  const idRef       = useRef(0);
  const phaseRef    = useRef<'intro'|'playing'|'wave_end'|'win'|'gameover'>('intro');

  const level = LEVELS[levelIdx];
  const wDef  = level.waves[waveRef.current] ?? level.waves[level.waves.length - 1];

  // ── Theme colors ────────────────────────────────────────
  const theme    = gameTheme(dark);
  const accent   = dark ? '#00ffcc' : '#0d9488';
  const accentBd = dark ? 'rgba(0,255,204,.22)' : 'rgba(13,148,136,.3)';
  const subText  = dark ? '#64748b' : '#475569';
  const muted    = dark ? '#334155' : '#64748b';
  const topBd    = dark ? 'rgba(0,255,204,.1)' : 'rgba(0,0,0,.12)';
  const leftBd   = dark ? 'rgba(0,255,204,.08)' : 'rgba(0,0,0,.1)';
  const storyBg  = dark ? 'rgba(0,255,204,.05)' : 'rgba(13,148,136,.06)';
  const hintBg   = dark ? 'rgba(251,191,36,.07)' : 'rgba(251,191,36,.12)';
  const hintBd   = dark ? 'rgba(251,191,36,.28)' : 'rgba(251,191,36,.45)';
  const editorBg = '#070b16';

  // ── Reset ────────────────────────────────────────────────
  const resetLevel = useCallback((idx: number) => {
    cancelAnimationFrame(frameRef.current!);
    enemiesRef.current  = [];
    exploRef.current    = [];
    beamsRef.current    = [];
    towCoolRef.current  = Array(LEVELS[idx].towers).fill(0);
    livesRef.current    = MAX_LIVES;
    coinsRef.current    = 0;
    waveRef.current     = 0;
    spawnTimR.current   = 1.5;
    spawnedR.current    = 0;
    idRef.current       = 0;
    phaseRef.current    = 'intro';
    levelIdxRef.current = idx;
    towerRefs.current   = Array(LEVELS[idx].towers).fill(null);
    setLevelIdx(idx);
    setPhase('intro');
    setLives(MAX_LIVES);
    setCoins(0);
    setWave(0);
    setCssInput('');
    setCssError('');
    setAppliedVal(LEVELS[idx].initVal);
  }, []);

  useEffect(() => { resetLevel(0); }, []); // eslint-disable-line

  // ── Apply CSS ────────────────────────────────────────────
  const applyCSS = useCallback(() => {
    const val = cssInput.trim().replace(/;$/, '').trim();
    if (!val) { setCssError('Digite um valor para justify-content'); return; }
    setAppliedVal(val);
    setCssError('');
  }, [cssInput]);

  // ── Game loop ────────────────────────────────────────────
  const loop = useCallback((ts: number) => {
    if (phaseRef.current !== 'playing') return;
    const dt  = lastTRef.current === 0 ? 0.016 : Math.min((ts - lastTRef.current) / 1000, 0.05);
    lastTRef.current = ts;

    const idx = levelIdxRef.current;
    const lvl = LEVELS[idx];
    const wd  = lvl.waves[waveRef.current] ?? lvl.waves[lvl.waves.length - 1];

    // Spawn
    spawnTimR.current -= dt;
    if (spawnTimR.current <= 0 && spawnedR.current < wd.count) {
      const col = wd.cols[spawnedR.current % wd.cols.length];
      enemiesRef.current.push({ id:idRef.current++, col, y:SPAWN_Y, hp:wd.hp, maxHp:wd.hp, speed:wd.speed });
      spawnedR.current++;
      spawnTimR.current = wd.interval;
    }

    // Tower positions from DOM
    const boardLeft = boardRef.current?.getBoundingClientRect().left ?? 0;
    const towerXs = towerRefs.current.map(el => {
      if (!el) return -9999;
      const r = el.getBoundingClientRect();
      return r.left + r.width / 2 - boardLeft;
    });

    // Towers fire — e.hp > 0 prevents double-kill in same frame
    towCoolRef.current = towCoolRef.current.map((cd, ti) => {
      const newCd = Math.max(0, cd - dt);
      if (newCd > 0) return newCd;
      const tx = towerXs[ti];
      const target = enemiesRef.current.find(e => {
        if (e.hp <= 0) return false;
        return Math.abs(e.col * CW + CW / 2 - tx) < RANGE && e.y < TOW_Y - TH / 2 && e.y > SPAWN_Y + 10;
      });
      if (!target) return newCd;
      target.hp--;
      const ex = target.col * CW + CW / 2;
      beamsRef.current.push({ id:idRef.current++, x:ex, fromY:TOW_Y - TH / 2, toY:target.y, life:0.12, color:TOWER_COLORS[ti%4] });
      if (target.hp <= 0) {
        exploRef.current.push({ id:idRef.current++, x:ex, y:target.y, life:0.35 });
        coinsRef.current += COINS_PER_KILL;
      }
      return FIRE_S;
    });

    // Move + remove dead
    enemiesRef.current = enemiesRef.current.map(e => ({ ...e, y: e.y + e.speed * dt })).filter(e => e.hp > 0);

    // Escapes
    let escaped = 0;
    enemiesRef.current = enemiesRef.current.filter(e => { if (e.y > EXIT_Y) { escaped++; return false; } return true; });
    if (escaped > 0) {
      livesRef.current = Math.max(0, livesRef.current - escaped);
      setLives(livesRef.current);
      if (livesRef.current <= 0) { phaseRef.current = 'gameover'; setPhase('gameover'); return; }
    }

    // FX decay
    beamsRef.current = beamsRef.current.map(b => ({ ...b, life: b.life - dt })).filter(b => b.life > 0);
    exploRef.current = exploRef.current.map(e => ({ ...e, life: e.life - dt })).filter(e => e.life > 0);

    // Wave / level complete
    if (spawnedR.current >= wd.count && enemiesRef.current.length === 0) {
      const nextW = waveRef.current + 1;
      if (nextW < lvl.waves.length) {
        waveRef.current = nextW; spawnedR.current = 0; spawnTimR.current = 2.5;
        phaseRef.current = 'wave_end';
        setWave(nextW); setCoins(coinsRef.current); setPhase('wave_end');
        setTimeout(() => {
          if (phaseRef.current !== 'wave_end') return;
          phaseRef.current = 'playing'; setPhase('playing'); lastTRef.current = 0;
          frameRef.current = requestAnimationFrame(ts2 => loopRef.current(ts2));
        }, 2200);
        return;
      }
      // Level cleared — anti-cheat: only award on first completion
      phaseRef.current = 'win'; setCoins(coinsRef.current); setPhase('win');
      const done: number[] = JSON.parse(localStorage.getItem('ft_done') || '[]');
      if (!done.includes(idx)) {
        addCoins(25 + idx * 10); addPoints(15 + idx * 8);
        const newDone = [...new Set([...done, idx])];
        setCompletedLevels(newDone);
        localStorage.setItem('ft_done', JSON.stringify(newDone));
      }
      return;
    }

    setCoins(coinsRef.current);
    setTick(t => t + 1);
    frameRef.current = requestAnimationFrame(ts2 => loopRef.current(ts2));
  }, [addCoins, addPoints]);

  useEffect(() => { loopRef.current = loop; });
  useEffect(() => () => cancelAnimationFrame(frameRef.current!), []);

  const startWave = useCallback(() => {
    phaseRef.current = 'playing'; spawnTimR.current = 1.0;
    spawnedR.current = 0; lastTRef.current = 0; setPhase('playing');
    frameRef.current = requestAnimationFrame(ts => loopRef.current(ts));
  }, []);

  /* ═══════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════ */
  const enemies = enemiesRef.current;
  const beams   = beamsRef.current;
  const explos  = exploRef.current;

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', background:theme.bg, color:theme.text, fontFamily:'system-ui,-apple-system,sans-serif' }}>
      <style>{ANIM}</style>

      {/* ── TOP BAR ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 20px', borderBottom:`1px solid ${topBd}`, flexShrink:0, gap:12, flexWrap:'wrap' }}>
        <button onClick={onBackToHub} style={{ display:'flex', alignItems:'center', gap:7, background:'none', border:`1.5px solid ${accentBd}`, color:subText, cursor:'pointer', padding:'8px 14px', fontFamily:"'Press Start 2P',monospace", fontSize:8, borderRadius:4, transition:'all .15s' }} onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.color=accent;el.style.borderColor=accent;}} onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.color=subText;el.style.borderColor=accentBd;}}>
          <ChevronLeft size={13}/> VOLTAR
        </button>

        <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:9, color:accent, letterSpacing:'.05em', textShadow: dark ? '0 0 12px rgba(0,255,204,.4)' : 'none' }}>
          FLEX TOWER DEFENSE
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <CoinBadge count={coins} dark={dark}/>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            {Array.from({length:MAX_LIVES}).map((_,i)=>(
              <Heart key={i} size={16} fill={i<lives?'#f87171':'#1e2a3a'} color={i<lives?'#f87171':'#334155'}/>
            ))}
          </div>
          <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:8, color:muted }}>NÍV {levelIdx+1}/{LEVELS.length}</span>
          <button onClick={()=>setDark(d=>!d)} title={dark ? 'Modo claro' : 'Modo escuro'} style={{ display:'flex', alignItems:'center', justifyContent:'center', width:34, height:34, background:'none', border:`1.5px solid ${accentBd}`, borderRadius:6, cursor:'pointer', color:subText, transition:'all .15s' }} onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.color=accent;el.style.borderColor=accent;}} onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.color=subText;el.style.borderColor=accentBd;}}>
            {dark ? <Sun size={14}/> : <Moon size={14}/>}
          </button>
        </div>
      </div>

      {/* ── MAIN SPLIT ── */}
      <div className="ft-split" style={{ display:'flex', flex:1, overflow:'hidden', minHeight:0 }}>

        {/* ════ LEFT PANEL ════ */}
        <div className="ft-left" style={{ width:'46%', display:'flex', flexDirection:'column', background:theme.panel, borderRight:`1px solid ${leftBd}`, overflow:'hidden' }}>

          {/* TOP-LEFT: Story, task, hint, reference, level map */}
          <div style={{ flex:'0 0 auto', padding:'18px 20px 16px', borderBottom:`1px solid ${leftBd}`, overflowY:'auto', maxHeight:'55%' }}>

            {/* Level badge */}
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12, flexWrap:'wrap' }}>
              <Shield size={14} color={accent}/>
              <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:9, color:accent }}>
                NÍVEL {level.num} — {level.title.toUpperCase()}
              </span>
              {level.waves.length > 1 && phase === 'playing' && (
                <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:7, color:muted }}>ONDA {wave+1}/{level.waves.length}</span>
              )}
            </div>

            {/* Story */}
            <p style={{ fontSize:14, color:theme.sub, lineHeight:1.8, margin:'0 0 14px' }}>{level.story}</p>

            {/* Task */}
            <div style={{ padding:'10px 14px', background:storyBg, borderLeft:`3px solid ${accent}`, borderRadius:4, marginBottom:16 }}>
              <div style={{ fontSize:9, fontFamily:"'Press Start 2P',monospace", color:accent, marginBottom:5 }}>MISSAO:</div>
              <div style={{ fontSize:14, color:theme.text, lineHeight:1.6 }}>{level.task}</div>
            </div>

            {/* Hint */}
            <div style={{ padding:'10px 14px', background:hintBg, border:`1px solid ${hintBd}`, borderRadius:4, marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
                <Lightbulb size={13} color="#fbbf24"/>
                <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:8, color:'#fbbf24' }}>DICA</span>
              </div>
              <div style={{ fontSize:13, color:dark?'#e2e8f0':theme.text, lineHeight:1.7 }}>{level.hint}</div>
            </div>

            {/* Quick reference */}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:7, color:muted, marginBottom:8 }}>REFERENCIA RAPIDA — clique para usar:</div>
              <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                {JC_REF.map(r => {
                  const isAnswer = level.answers.includes(r.val);
                  return (
                    <button key={r.val} onClick={()=>{ setCssInput(r.val); setCssError(''); }}
                      style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', background: isAnswer ? (dark?'rgba(0,255,204,.08)':'rgba(13,148,136,.07)') : 'transparent', border: isAnswer ? `1px solid ${accent}33` : '1px solid transparent', borderRadius:4, cursor:'pointer', textAlign:'left', transition:'background .1s', width:'100%' }}
                      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=dark?'rgba(0,255,204,.07)':'rgba(13,148,136,.05)'}
                      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=isAnswer?(dark?'rgba(0,255,204,.08)':'rgba(13,148,136,.07)'):'transparent'}
                    >
                      <code style={{ fontSize:13, color: isAnswer ? accent : theme.sub, fontWeight: isAnswer ? 700 : 400, fontFamily:"'Fira Code','Courier New',monospace", flex:1 }}>{r.val}</code>
                      <code style={{ fontSize:10, color:muted, fontFamily:"'Courier New',monospace" }}>{r.ascii}</code>
                      {isAnswer && <CheckCircle2 size={12} color={accent}/>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Level map */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {LEVELS.map((l,i)=>{
                const done    = completedLevels.includes(i);
                const current = i === levelIdx;
                return (
                  <button key={l.num} onClick={()=>{ cancelAnimationFrame(frameRef.current!); resetLevel(i); }}
                    title={l.title}
                    style={{ width:36, height:36, borderRadius:6, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', background: done ? accent : current ? (dark?'rgba(0,255,204,.15)':'rgba(13,148,136,.12)') : theme.panel2, border:`1.5px solid ${done?accent:current?accent:theme.border}`, transition:'all .15s' }}>
                    {done
                      ? <CheckCircle2 size={13} color={dark?'#060a14':'#fff'}/>
                      : <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:9, color: current ? accent : subText }}>{l.num}</span>
                    }
                  </button>
                );
              })}
            </div>
          </div>

          {/* BOTTOM-LEFT: CSS Editor (always dark — code terminal) */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minHeight:0, background:editorBg }}>

            {/* Editor title bar */}
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 16px', background:'rgba(255,255,255,.04)', borderBottom:'1px solid rgba(255,255,255,.07)', flexShrink:0 }}>
              <div style={{ display:'flex', gap:5 }}>
                {['#ef4444','#fbbf24','#22c55e'].map(c=>(
                  <div key={c} style={{ width:10, height:10, borderRadius:'50%', background:c }}/>
                ))}
              </div>
              <span style={{ fontSize:12, color:'#475569', fontFamily:"'Fira Code','Courier New',monospace" }}>style.css</span>
            </div>

            {/* CSS preview */}
            <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,.06)', flexShrink:0, fontFamily:"'Fira Code','Courier New',monospace", fontSize:14, lineHeight:2 }}>
              <span style={{ color:'#7c3aed' }}>.torres</span>
              <span style={{ color:'#6b7280' }}>{' {'}</span><br/>
              <span style={{ paddingLeft:20, color:'#6b7280' }}>display: </span>
              <span style={{ color:'#22c55e' }}>flex</span>
              <span style={{ color:'#6b7280' }}>;</span><br/>
              <span style={{ paddingLeft:20, color:'#f87171' }}>{level.prop}</span>
              <span style={{ color:'#6b7280' }}>: </span>
              <span style={{ color:'#fbbf24', fontWeight:700 }}>{appliedVal}</span>
              <span style={{ color:'#6b7280' }}>;</span><br/>
              <span style={{ color:'#6b7280' }}>{'}'}</span>
            </div>

            {/* Input */}
            <div style={{ padding:'16px 20px', flexShrink:0 }}>
              <label style={{ display:'block', fontFamily:"'Press Start 2P',monospace", fontSize:8, color:'#64748b', marginBottom:8 }}>
                {level.prop.toUpperCase()}:
              </label>
              <input
                value={cssInput}
                onChange={e=>{ setCssInput(e.target.value); setCssError(''); }}
                onKeyDown={e=>e.key==='Enter'&&applyCSS()}
                placeholder={level.answers[0]}
                style={{ display:'block', width:'100%', boxSizing:'border-box', padding:'12px 14px', background:'#0d1117', border:`2px solid ${cssError?'#ef4444':'rgba(0,255,204,.25)'}`, color:'#e2e8f0', fontFamily:"'Fira Code','Courier New',monospace", fontSize:15, outline:'none', borderRadius:4, letterSpacing:'.02em', transition:'border-color .15s' }}
                onFocus={e=>{ if (!cssError) e.currentTarget.style.borderColor='#00ffcc'; }}
                onBlur={e=>{  if (!cssError) e.currentTarget.style.borderColor='rgba(0,255,204,.25)'; }}
              />
              {cssError && <div style={{ marginTop:6, fontSize:12, color:'#ef4444' }}>{cssError}</div>}
            </div>

            {/* Apply */}
            <div style={{ padding:'0 20px 20px', flexShrink:0 }}>
              <button onClick={applyCSS}
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', padding:'14px', background:'rgba(0,255,204,.12)', border:'2px solid #00ffcc', color:'#00ffcc', fontFamily:"'Press Start 2P',monospace", fontSize:10, cursor:'pointer', borderRadius:4, transition:'all .15s', letterSpacing:'.04em' }}
                onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.background='#00ffcc'; el.style.color='#060a14'; }}
                onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.background='rgba(0,255,204,.12)'; el.style.color='#00ffcc'; }}
              >
                <Zap size={14}/> APLICAR  ↵ ENTER
              </button>
            </div>
          </div>
        </div>

        {/* ════ RIGHT PANEL — Game Board ════ */}
        <div className="ft-right" style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background: dark ? '#040810' : '#1a1a2e', overflow:'auto', padding:'16px' }}>

          <div ref={boardRef} style={{ width:BW, height:BH, position:'relative', background:'#060c18', border:`2px solid rgba(0,255,204,.2)`, borderRadius:4, overflow:'hidden', boxShadow:'0 0 40px rgba(0,255,204,.06)', userSelect:'none', flexShrink:0 }}>

            {/* Grid lines */}
            {Array.from({length:COLS-1}).map((_,i)=>(
              <div key={i} style={{ position:'absolute', left:(i+1)*CW, top:0, bottom:0, width:1, background:'rgba(0,255,204,.04)', pointerEvents:'none' }}/>
            ))}

            {/* Column numbers */}
            {Array.from({length:COLS}).map((_,i)=>(
              <div key={i} style={{ position:'absolute', left:i*CW, top:4, width:CW, textAlign:'center', fontFamily:"'Press Start 2P',monospace", fontSize:6, color:'rgba(0,255,204,.18)', pointerEvents:'none' }}>{i}</div>
            ))}

            {/* Entry arrows */}
            {wDef.cols.map(c=>(
              <div key={c} style={{ position:'absolute', left:c*CW+CW/2-7, top:14, animation:'ft-pulse 1.2s ease-in-out infinite', pointerEvents:'none' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="#f87171" style={{ filter:'drop-shadow(0 0 5px #f87171)' }}>
                  <polygon points="7,0 14,14 0,14"/>
                </svg>
              </div>
            ))}

            {/* Lane roads */}
            {wDef.cols.map(c=>(
              <div key={c} style={{ position:'absolute', left:c*CW+2, top:26, width:CW-4, bottom:68, background:'rgba(248,113,113,.03)', borderLeft:'1px dashed rgba(248,113,113,.1)', borderRight:'1px dashed rgba(248,113,113,.1)', pointerEvents:'none' }}/>
            ))}

            {/* Enemies */}
            {enemies.map(e => {
              const pct = e.hp / e.maxHp;
              return (
                <div key={e.id} style={{ position:'absolute', left:e.col*CW+CW/2-14, top:e.y-14, width:28, height:28, zIndex:6 }}>
                  <svg width="28" height="28" viewBox="0 0 28 28">
                    <polygon points="14,2 26,22 2,22" fill="#f87171" opacity={0.9}/>
                    <polygon points="14,6 22,20 6,20" fill="#450a0a" opacity={0.75}/>
                    <circle cx="14" cy="13" r="3" fill="#fca5a5"/>
                  </svg>
                  {e.maxHp > 1 && (
                    <div style={{ position:'absolute', top:30, left:0, width:28, height:4, background:'#111', borderRadius:2 }}>
                      <div style={{ width:`${pct*100}%`, height:'100%', background:pct>0.5?'#22c55e':'#ef4444', borderRadius:2 }}/>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Beams */}
            {beams.map(b => (
              <div key={b.id} style={{ position:'absolute', left:b.x-1, top:Math.min(b.fromY,b.toY), width:2, height:Math.abs(b.fromY-b.toY), background:`linear-gradient(180deg,transparent,${b.color},transparent)`, opacity:b.life/0.12, zIndex:7, pointerEvents:'none', boxShadow:`0 0 6px ${b.color}` }}/>
            ))}

            {/* Explosions */}
            {explos.map(exp => (
              <div key={exp.id} style={{ position:'absolute', left:exp.x-14, top:exp.y-14, width:28, height:28, borderRadius:'50%', border:'2px solid #fbbf24', opacity:exp.life/0.35, animation:'ft-pop .35s ease-out forwards', zIndex:8, pointerEvents:'none', boxShadow:'0 0 12px #fbbf24' }}/>
            ))}

            {/* Tower zone */}
            <div style={{ position:'absolute', bottom:0, left:0, right:0, height:70, background:'rgba(0,255,204,.03)', borderTop:'1.5px solid rgba(0,255,204,.15)' }}>
              <div style={{ position:'absolute', top:3, left:8, fontFamily:"'Press Start 2P',monospace", fontSize:5, color:'rgba(0,255,204,.28)' }}>
                .torres · justify-content: {appliedVal}
              </div>
              {/* Flex container — tower positions read each frame via getBoundingClientRect */}
              <div style={{ position:'absolute', top:12, left:0, right:0, bottom:0, display:'flex', alignItems:'center', justifyContent: appliedVal as any }}>
                {Array.from({length:level.towers}).map((_,i)=>(
                  <div key={i} ref={el=>{ towerRefs.current[i]=el; }} style={{ width:TW, height:TH, flexShrink:0, position:'relative' }}>
                    <svg width={TW} height={TH} viewBox="0 0 56 60" style={{ filter:`drop-shadow(0 0 8px ${TOWER_COLORS[i%4]})` }}>
                      <rect x="9"  y="42" width="38" height="16" rx="2" fill="#0d1a2b" stroke={TOWER_COLORS[i%4]} strokeWidth="1.5"/>
                      <rect x="15" y="20" width="26" height="26" rx="2" fill="#0d1a2b" stroke={TOWER_COLORS[i%4]} strokeWidth="1.5"/>
                      <rect x="25" y="4"  width="6"  height="20" rx="2" fill={TOWER_COLORS[i%4]} opacity="0.9"/>
                      <circle cx="19" cy="30" r="3" fill={TOWER_COLORS[i%4]} opacity="0.55"/>
                      <circle cx="37" cy="30" r="3" fill={TOWER_COLORS[i%4]} opacity="0.55"/>
                      <rect x="25" y="4" width="6" height="5" rx="1" fill="white" opacity="0.4"/>
                    </svg>
                    <div style={{ position:'absolute', top:-RANGE+TH/2, left:TW/2-RANGE, width:RANGE*2, height:RANGE, background:`radial-gradient(${TOWER_GC[i%4]}08,transparent)`, borderTop:`1px dashed ${TOWER_GC[i%4]}20`, pointerEvents:'none' }}/>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Phase overlays ── */}
            {phase === 'intro' && (
              <div style={{ position:'absolute', inset:0, background:'rgba(4,8,16,.88)', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:18, zIndex:20, animation:'ft-in .3s ease both' }}>
                <Shield size={32} color={accent} style={{ filter:`drop-shadow(0 0 16px ${accent})` }}/>
                <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:13, color:accent, textShadow:`0 0 18px ${accent}` }}>NIVEL {level.num}</div>
                <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:9, color:'#a78bfa', textAlign:'center' }}>{level.title.toUpperCase()}</div>
                <button onClick={startWave} style={{ padding:'14px 32px', background:`linear-gradient(135deg,${accent},#00ccaa)`, border:'none', color:'#060a14', fontFamily:"'Press Start 2P',monospace", fontSize:11, cursor:'pointer', borderRadius:4, boxShadow:`0 0 28px ${accent}55`, animation:'ft-glow 1.5s ease-in-out infinite', display:'flex', alignItems:'center', gap:10 }}>
                  <Shield size={16}/> DEFENDER!
                </button>
              </div>
            )}

            {phase === 'wave_end' && (
              <div style={{ position:'absolute', inset:0, background:'rgba(4,8,16,.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:20 }}>
                <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:14, color:'#22c55e', textShadow:'0 0 24px rgba(34,197,94,.7)', animation:'ft-in .3s ease both' }}>ONDA LIMPA!</div>
              </div>
            )}

            {phase === 'win' && (
              <div style={{ position:'absolute', inset:0, background:'rgba(4,8,16,.9)', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16, zIndex:20, animation:'ft-in .3s ease both' }}>
                <Trophy size={40} color="#fbbf24" style={{ filter:'drop-shadow(0 0 16px rgba(251,191,36,.8))' }}/>
                <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:13, color:'#fbbf24', textShadow:'0 0 20px rgba(251,191,36,.7)' }}>NIVEL VENCIDO!</div>
                <div style={{ display:'flex', alignItems:'center', gap:8, fontFamily:"'Press Start 2P',monospace", fontSize:8, color:'#22c55e' }}>
                  <Zap size={12}/> +{25+levelIdx*10} moedas · +{15+levelIdx*8} pts
                </div>
                {levelIdx < LEVELS.length-1
                  ? <button onClick={()=>resetLevel(levelIdx+1)} style={{ padding:'12px 28px', background:'linear-gradient(135deg,#fbbf24,#f59e0b)', border:'none', color:'#1a0a00', fontFamily:"'Press Start 2P',monospace", fontSize:10, cursor:'pointer', borderRadius:4, display:'flex', alignItems:'center', gap:8 }}>
                      PROXIMO <ChevronRight size={14}/>
                    </button>
                  : <div style={{ display:'flex', alignItems:'center', gap:8, fontFamily:"'Press Start 2P',monospace", fontSize:9, color:accent }}>
                      <Trophy size={14}/> JOGO COMPLETO! MESTRE DO FLEXBOX!
                    </div>
                }
              </div>
            )}

            {phase === 'gameover' && (
              <div style={{ position:'absolute', inset:0, background:'rgba(4,8,16,.9)', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16, zIndex:20, animation:'ft-shake .4s ease both' }}>
                <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:15, color:'#f87171', textShadow:'0 0 20px rgba(248,113,113,.7)' }}>GAME OVER</div>
                <div style={{ fontSize:14, color:subText }}>Os invasores passaram!</div>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center' }}>
                  <button onClick={()=>resetLevel(levelIdx)} style={{ padding:'12px 20px', background:'rgba(248,113,113,.1)', border:'2px solid #f87171', color:'#f87171', fontFamily:"'Press Start 2P',monospace", fontSize:9, cursor:'pointer', borderRadius:4, display:'flex', alignItems:'center', gap:8 }}>
                    <RefreshCw size={13}/> TENTAR DE NOVO
                  </button>
                  {levelIdx > 0 && (
                    <button onClick={()=>resetLevel(levelIdx-1)} style={{ padding:'12px 20px', background:'transparent', border:`2px solid ${muted}`, color:subText, fontFamily:"'Press Start 2P',monospace", fontSize:9, cursor:'pointer', borderRadius:4, display:'flex', alignItems:'center', gap:8 }}>
                      <ChevronLeft size={13}/> NIVEL ANTERIOR
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Wave progress bar */}
          {(phase === 'playing' || phase === 'wave_end') && (
            <div style={{ marginTop:10, width:BW, maxWidth:'100%', display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:7, color:subText, flexShrink:0 }}>PROGRESSO</span>
              <div style={{ flex:1, height:8, background:'rgba(0,255,204,.07)', borderRadius:4, overflow:'hidden', border:'1px solid rgba(0,255,204,.1)' }}>
                <div style={{ height:'100%', background:`linear-gradient(90deg,${accent},#00ccaa)`, borderRadius:4, width:`${Math.min((spawnedR.current/wDef.count)*100,100)}%`, transition:'width .3s' }}/>
              </div>
              <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:7, color:subText, flexShrink:0 }}>{spawnedR.current}/{wDef.count}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
