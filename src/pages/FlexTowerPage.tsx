import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, Heart, Shield, Zap, Star, Trophy, RefreshCw, ChevronRight } from 'lucide-react';
import { useGameState } from '../hooks/useGameState';

/* ═══════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════ */
const COLS   = 8;
const BW     = 640;   // board width
const BH     = 430;   // board height
const CW     = BW / COLS; // 80px per column
const TW     = 58;    // tower visual width
const TH     = 62;    // tower visual height
const TOW_Y  = 346;   // tower center Y in board
const SPAWN_Y = -22;
const EXIT_Y  = BH + 12;
const FIRE_S  = 0.85; // seconds between shots
const RANGE   = CW * 0.72; // 57.6px — must be in same column to fire
const MAX_LIVES = 5;

const ANIM = `
@keyframes ft-scanV { from{top:-3px} to{top:100%} }
@keyframes ft-float  { 0%{opacity:.9;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(-60px) scale(0)} }
@keyframes ft-shake  { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }
@keyframes ft-pop    { 0%{transform:scale(0);opacity:1} 100%{transform:scale(2.2);opacity:0} }
@keyframes ft-pulse  { 0%,100%{opacity:.7} 50%{opacity:1} }
@keyframes ft-slideIn{ from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes ft-glow   { 0%,100%{box-shadow:0 0 14px rgba(0,255,204,.3)} 50%{box-shadow:0 0 30px rgba(0,255,204,.6)} }
@keyframes ft-hit    { 0%{background:rgba(255,100,100,.8)} 100%{background:transparent} }
`;

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
interface Enemy {
  id: number; col: number; y: number;
  hp: number; maxHp: number; speed: number;
}
interface Explosion {
  id: number; x: number; y: number; life: number; color: string;
}
interface Beam {
  id: number; x: number; fromY: number; toY: number; life: number; color: string;
}

/* ═══════════════════════════════════════════════════════════
   LEVEL DATA
   Enemy column positions verified against flex CSS output:
   - flex-end (1 tower, TW=58, BW=640): center at 611 → col 7
   - center   (1 tower): center at 320 → col 4 (but we use cols 3,4)
   - space-between (2): centers at 29, 611 → cols 0, 7
   - space-around  (2): centers at 161, 479 → cols 2, 5 (approx)
   - space-evenly  (3): centers at 145, 320, 494 → cols 1, 4, 6 (approx)
   - space-between (4): centers at 29, 222, 415, 611 → cols 0, 2, 5, 7
═══════════════════════════════════════════════════════════ */
interface WaveDef { cols: number[]; count: number; speed: number; hp: number; interval: number }
interface LevelDef {
  num: number; title: string; story: string;
  prop: string; initVal: string; answers: string[]; hint: string;
  towers: number; waves: WaveDef[];
}

const LEVELS: LevelDef[] = [
  {
    num: 1, title: 'Primeira Defesa',
    story: 'Invasores avançam pela coluna da DIREITA (coluna 7). Mova a torre para o final da linha!',
    prop: 'justify-content', initVal: 'flex-start',
    answers: ['flex-end'], hint: 'flex-end → itens vão para o FIM do eixo.',
    towers: 1,
    waves: [{ cols:[7], count:10, speed:60, hp:2, interval:1.8 }],
  },
  {
    num: 2, title: 'Centro de Comando',
    story: 'Ataque pelo CENTRO (colunas 3 e 4)! Centralize a torre de defesa.',
    prop: 'justify-content', initVal: 'flex-start',
    answers: ['center'], hint: 'center → itens no CENTRO do eixo.',
    towers: 1,
    waves: [{ cols:[3,4], count:12, speed:62, hp:2, interval:1.6 }],
  },
  {
    num: 3, title: 'Dois Flancos',
    story: 'Ataque simultâneo nas BORDAS (colunas 0 e 7)! Distribua as torres nos extremos.',
    prop: 'justify-content', initVal: 'flex-start',
    answers: ['space-between'], hint: 'space-between → máximo espaço ENTRE os itens. Primeiro e último ficam nas bordas.',
    towers: 2,
    waves: [{ cols:[0,7], count:14, speed:64, hp:2, interval:1.5 }],
  },
  {
    num: 4, title: 'Margens Simétricas',
    story: 'Invasores nas colunas 2 e 5. Cada torre precisa ter margens IGUAIS nos dois lados.',
    prop: 'justify-content', initVal: 'flex-start',
    answers: ['space-around'], hint: 'space-around → cada item recebe espaço igual dos dois lados (margens se somam entre itens).',
    towers: 2,
    waves: [{ cols:[2,5], count:14, speed:66, hp:3, interval:1.5 }],
  },
  {
    num: 5, title: 'Três Guardiões',
    story: 'Três frentes de ataque: colunas 1, 4 e 6! Distribua 3 torres com espaço idêntico em TODA a linha.',
    prop: 'justify-content', initVal: 'flex-start',
    answers: ['space-evenly'], hint: 'space-evenly → espaço IDÊNTICO entre todos, inclusive nas bordas.',
    towers: 3,
    waves: [{ cols:[1,4,6], count:16, speed:68, hp:3, interval:1.4 }],
  },
  {
    num: 6, title: 'Assalto Final',
    story: 'HORDA TOTAL! 4 torres devem cobrir as colunas 0, 2, 5 e 7. Dois ataques seguidos!',
    prop: 'justify-content', initVal: 'flex-start',
    answers: ['space-between'],
    hint: 'Qual valor distribui 4 itens com o primeiro e o último nas bordas? 💡',
    towers: 4,
    waves: [
      { cols:[0,2,5,7], count:18, speed:68, hp:3, interval:1.3 },
      { cols:[0,2,5,7], count:24, speed:76, hp:4, interval:1.0 },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
interface Props { onBackToHub: () => void; isDark?: boolean }

export default function FlexTowerPage({ onBackToHub }: Props) {
  const { addCoins, addPoints } = useGameState();

  // ── Level/Phase state ───────────────────────────────────
  const [levelIdx, setLevelIdx] = useState(0);
  const [phase, setPhase] = useState<'intro'|'playing'|'wave_end'|'win'|'gameover'>('intro');
  const [completedLevels, setCompletedLevels] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem('ft_done') || '[]'); } catch { return []; }
  });

  // ── CSS editor state ────────────────────────────────────
  const [cssInput, setCssInput] = useState('');
  const [appliedVal, setAppliedVal] = useState(LEVELS[0].initVal);
  const [cssError, setCssError] = useState('');

  // ── HUD state ───────────────────────────────────────────
  const [lives, setLives] = useState(MAX_LIVES);
  const [coins, setCoins] = useState(0);
  const [wave, setWave] = useState(0);
  const [tick, setTick] = useState(0); // forces re-render every frame

  // ── Game loop refs (mutable, not causing re-renders) ─────
  const boardRef   = useRef<HTMLDivElement>(null);
  const towerRefs  = useRef<(HTMLDivElement|null)[]>([]);
  const frameRef   = useRef<number>();
  const lastTRef   = useRef<number>(0);

  const enemiesRef = useRef<Enemy[]>([]);
  const exploRef   = useRef<Explosion[]>([]);
  const beamsRef   = useRef<Beam[]>([]);
  const towCoolRef = useRef<number[]>([]); // cooldown per tower
  const livesRef   = useRef(MAX_LIVES);
  const coinsRef   = useRef(0);
  const waveRef    = useRef(0);
  const spawnTimR  = useRef(0);
  const spawnedR   = useRef(0);
  const idRef      = useRef(0);
  const phaseRef   = useRef<'intro'|'playing'|'wave_end'|'win'|'gameover'>('intro');

  const level = LEVELS[levelIdx];
  const currentWaveDef = level.waves[waveRef.current] ?? level.waves[level.waves.length - 1];

  // ── Reset level ─────────────────────────────────────────
  const resetLevel = useCallback((idx: number) => {
    cancelAnimationFrame(frameRef.current!);
    enemiesRef.current = [];
    exploRef.current   = [];
    beamsRef.current   = [];
    towCoolRef.current = Array(LEVELS[idx].towers).fill(0);
    livesRef.current   = MAX_LIVES;
    coinsRef.current   = 0;
    waveRef.current    = 0;
    spawnTimR.current  = 1.5; // 1.5s before first spawn
    spawnedR.current   = 0;
    idRef.current      = 0;
    phaseRef.current   = 'intro';
    setLevelIdx(idx);
    setPhase('intro');
    setLives(MAX_LIVES);
    setCoins(0);
    setWave(0);
    setCssInput('');
    setCssError('');
    setAppliedVal(LEVELS[idx].initVal);
    towerRefs.current  = Array(LEVELS[idx].towers).fill(null);
  }, []);

  useEffect(() => { resetLevel(0); }, []);

  // ── Apply CSS ────────────────────────────────────────────
  const applyCSS = () => {
    const val = cssInput.trim().replace(/;$/, '');
    if (!val) { setCssError('Digite um valor para justify-content'); return; }
    setAppliedVal(val);
    setCssError('');
  };

  // ── Start wave ───────────────────────────────────────────
  const startWave = useCallback(() => {
    phaseRef.current = 'playing';
    setPhase('playing');
    spawnTimR.current = 1.0;
    spawnedR.current  = 0;
    lastTRef.current  = 0;
    frameRef.current  = requestAnimationFrame(loop);
  }, []);

  // ── Main game loop ───────────────────────────────────────
  const loop = useCallback((ts: number) => {
    if (phaseRef.current !== 'playing') return;
    const dt = lastTRef.current === 0 ? 0.016 : Math.min((ts - lastTRef.current) / 1000, 0.05);
    lastTRef.current = ts;

    const wDef = LEVELS[levelIdx].waves[waveRef.current] ?? LEVELS[levelIdx].waves[LEVELS[levelIdx].waves.length-1];

    // ── Spawn ──────────────────────────────────────────────
    spawnTimR.current -= dt;
    if (spawnTimR.current <= 0 && spawnedR.current < wDef.count) {
      const col = wDef.cols[spawnedR.current % wDef.cols.length];
      enemiesRef.current.push({ id: idRef.current++, col, y: SPAWN_Y, hp: wDef.hp, maxHp: wDef.hp, speed: wDef.speed });
      spawnedR.current++;
      spawnTimR.current = wDef.interval;
    }

    // ── Tower positions from DOM ───────────────────────────
    const boardLeft = boardRef.current?.getBoundingClientRect().left ?? 0;
    const towerXs = towerRefs.current.map(el => {
      if (!el) return -9999;
      const r = el.getBoundingClientRect();
      return r.left + r.width / 2 - boardLeft;
    });

    // ── Towers fire ────────────────────────────────────────
    towCoolRef.current = towCoolRef.current.map((cd, ti) => {
      const newCd = Math.max(0, cd - dt);
      if (newCd > 0) return newCd;
      const tx = towerXs[ti];
      const target = enemiesRef.current.find(e => {
        const ex = e.col * CW + CW / 2;
        return Math.abs(ex - tx) < RANGE && e.y < TOW_Y - TH / 2 && e.y > SPAWN_Y + 10;
      });
      if (!target) return newCd;
      target.hp--;
      const tx2 = target.col * CW + CW / 2;
      beamsRef.current.push({ id: idRef.current++, x: tx2, fromY: TOW_Y - TH / 2, toY: target.y, life: 0.12, color: '#00ffcc' });
      if (target.hp <= 0) {
        exploRef.current.push({ id: idRef.current++, x: tx2, y: target.y, life: 0.35, color: '#fbbf24' });
        coinsRef.current += 3;
      }
      return FIRE_S;
    });

    // ── Move enemies ───────────────────────────────────────
    enemiesRef.current = enemiesRef.current.map(e => ({ ...e, y: e.y + e.speed * dt }));

    // ── Remove dead ────────────────────────────────────────
    enemiesRef.current = enemiesRef.current.filter(e => e.hp > 0);

    // ── Check escapes ──────────────────────────────────────
    let escaped = 0;
    enemiesRef.current = enemiesRef.current.filter(e => {
      if (e.y > EXIT_Y) { escaped++; return false; }
      return true;
    });
    if (escaped > 0) {
      livesRef.current = Math.max(0, livesRef.current - escaped);
      setLives(livesRef.current);
      if (livesRef.current <= 0) {
        phaseRef.current = 'gameover';
        setPhase('gameover');
        return;
      }
    }

    // ── Decay fx ──────────────────────────────────────────
    beamsRef.current = beamsRef.current.map(b => ({ ...b, life: b.life - dt })).filter(b => b.life > 0);
    exploRef.current = exploRef.current.map(e => ({ ...e, life: e.life - dt })).filter(e => e.life > 0);

    // ── Wave complete? ─────────────────────────────────────
    if (spawnedR.current >= wDef.count && enemiesRef.current.length === 0) {
      const nextW = waveRef.current + 1;
      if (nextW < LEVELS[levelIdx].waves.length) {
        waveRef.current = nextW;
        setWave(nextW);
        spawnedR.current = 0;
        spawnTimR.current = 2.5;
        phaseRef.current = 'wave_end';
        setPhase('wave_end');
        setTimeout(() => {
          phaseRef.current = 'playing';
          setPhase('playing');
          lastTRef.current = 0;
          frameRef.current = requestAnimationFrame(loop);
        }, 2200);
        setCoins(coinsRef.current);
        return;
      } else {
        // Level cleared!
        phaseRef.current = 'win';
        setPhase('win');
        setCoins(coinsRef.current);
        const earned = 15 + levelIdx * 8;
        const earnedC = 25 + levelIdx * 10;
        addCoins(earnedC);
        addPoints(earned);
        const done = [...new Set([...completedLevels, levelIdx])];
        setCompletedLevels(done);
        localStorage.setItem('ft_done', JSON.stringify(done));
        return;
      }
    }

    setCoins(coinsRef.current);
    setTick(t => t + 1);
    frameRef.current = requestAnimationFrame(loop);
  }, [levelIdx, completedLevels, addCoins, addPoints]);

  useEffect(() => () => cancelAnimationFrame(frameRef.current!), []);

  // ── Derived render values ───────────────────────────────
  const enemies  = enemiesRef.current;
  const beams    = beamsRef.current;
  const explos   = exploRef.current;
  const wDef     = currentWaveDef;
  const towerColors = ['#00ffcc','#a78bfa','#f87171','#fbbf24'];
  const towerGC     = ['#00ffcc','#7c3aed','#ef4444','#d97706'];

  /* ══════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════ */
  return (
    <div style={{ minHeight:'100vh', background:'#040810', backgroundImage:'linear-gradient(rgba(0,255,204,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,204,.025) 1px,transparent 1px)', backgroundSize:'40px 40px', fontFamily:'system-ui,-apple-system,sans-serif', color:'#e2e8f0', paddingBottom:40 }}>
      <style>{ANIM}</style>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 20px', borderBottom:'1px solid rgba(0,255,204,.1)', flexWrap:'wrap', gap:8 }}>
        <button onClick={onBackToHub} style={{ display:'flex', alignItems:'center', gap:7, background:'none', border:'1.5px solid rgba(0,255,204,.2)', color:'#475569', cursor:'pointer', padding:'6px 12px', fontFamily:"'Press Start 2P',monospace", fontSize:7, transition:'all .15s' }} onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.color='#00ffcc';el.style.borderColor='#00ffcc';}} onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.color='#475569';el.style.borderColor='rgba(0,255,204,.2)';}}>
          <ChevronLeft size={12}/> VOLTAR
        </button>
        <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:10, color:'#00ffcc', textShadow:'0 0 10px rgba(0,255,204,.6)' }}>
          FLEX TOWER DEFENSE
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:8, color:'#fbbf24' }}>🪙 {coins}</span>
          <div style={{ display:'flex', gap:4 }}>
            {Array.from({length:MAX_LIVES}).map((_,i)=>(
              <Heart key={i} size={14} fill={i<lives?'#f87171':'#1e2a3a'} color={i<lives?'#f87171':'#334155'}/>
            ))}
          </div>
          <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:7, color:'#475569' }}>
            NÍV. {levelIdx+1}/{LEVELS.length}
          </span>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'16px 16px 0', display:'flex', gap:16, alignItems:'flex-start' }}>

        {/* ── LEFT: GAME BOARD ── */}
        <div style={{ flex:1, minWidth:0 }}>
          {/* Level title */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <Shield size={14} color="#00ffcc"/>
            <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:9, color:'#00ffcc' }}>NÍVEL {level.num} — {level.title.toUpperCase()}</span>
            {level.waves.length > 1 && (
              <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:7, color:'#475569' }}>ONDA {wave+1}/{level.waves.length}</span>
            )}
          </div>

          {/* Story */}
          <div style={{ padding:'8px 12px', marginBottom:12, background:'rgba(0,255,204,.04)', border:'1px solid rgba(0,255,204,.12)', borderRadius:4, fontSize:12, color:'#94a3b8', lineHeight:1.6 }}>
            {level.story}
          </div>

          {/* Game board */}
          <div ref={boardRef} style={{ width:BW, height:BH, position:'relative', background:'#060c18', border:'2px solid rgba(0,255,204,.2)', borderRadius:4, overflow:'hidden', boxShadow:'0 0 30px rgba(0,255,204,.08)', userSelect:'none' }}>

            {/* Column guides */}
            {Array.from({length:COLS-1}).map((_,i)=>(
              <div key={i} style={{ position:'absolute', left:(i+1)*CW, top:0, bottom:0, width:1, background:'rgba(0,255,204,.04)', pointerEvents:'none' }}/>
            ))}

            {/* Column numbers (top) */}
            {Array.from({length:COLS}).map((_,i)=>(
              <div key={i} style={{ position:'absolute', left:i*CW, top:4, width:CW, textAlign:'center', fontFamily:"'Press Start 2P',monospace", fontSize:6, color:'rgba(0,255,204,.2)', pointerEvents:'none' }}>{i}</div>
            ))}

            {/* Enemy entry arrows */}
            {wDef.cols.map(c=>(
              <div key={c} style={{ position:'absolute', left:c*CW+CW/2-8, top:18, width:16, textAlign:'center', fontSize:14, pointerEvents:'none', animation:'ft-pulse 1.2s ease-in-out infinite', filter:'drop-shadow(0 0 4px #f87171)' }}>▼</div>
            ))}

            {/* Road */}
            {wDef.cols.map(c=>(
              <div key={c} style={{ position:'absolute', left:c*CW+2, top:28, width:CW-4, bottom:70, background:'rgba(255,100,100,.04)', borderLeft:'1px dashed rgba(248,113,113,.12)', borderRight:'1px dashed rgba(248,113,113,.12)', pointerEvents:'none' }}/>
            ))}

            {/* ── Enemies ── */}
            {enemies.map(e => {
              const ex = e.col * CW;
              const pct = e.hp / e.maxHp;
              return (
                <div key={e.id} style={{ position:'absolute', left:ex + CW/2 - 14, top:e.y - 14, width:28, height:28, zIndex:6 }}>
                  {/* Body */}
                  <svg width="28" height="28" viewBox="0 0 28 28">
                    <polygon points="14,2 26,22 2,22" fill="#f87171" opacity={0.85}/>
                    <polygon points="14,6 22,20 6,20" fill="#450a0a" opacity={0.7}/>
                    <circle cx="14" cy="14" r="3" fill="#fca5a5"/>
                  </svg>
                  {/* HP bar */}
                  {e.maxHp > 1 && (
                    <div style={{ position:'absolute', top:30, left:0, width:28, height:3, background:'#1a1a1a', borderRadius:2 }}>
                      <div style={{ width:`${pct*100}%`, height:'100%', background:pct>0.5?'#22c55e':'#ef4444', borderRadius:2, transition:'width .1s' }}/>
                    </div>
                  )}
                </div>
              );
            })}

            {/* ── Beams (projectiles) ── */}
            {beams.map(b => (
              <div key={b.id} style={{ position:'absolute', left:b.x-1, top:Math.min(b.fromY, b.toY), width:2, height:Math.abs(b.fromY - b.toY), background:`linear-gradient(180deg,transparent,${b.color},transparent)`, opacity:b.life/0.12, zIndex:7, pointerEvents:'none', boxShadow:`0 0 6px ${b.color}` }}/>
            ))}

            {/* ── Explosions ── */}
            {explos.map(exp => (
              <div key={exp.id} style={{ position:'absolute', left:exp.x-12, top:exp.y-12, width:24, height:24, borderRadius:'50%', border:`2px solid ${exp.color}`, opacity:exp.life/0.35, animation:'ft-pop .35s ease-out forwards', zIndex:8, pointerEvents:'none', boxShadow:`0 0 10px ${exp.color}` }}/>
            ))}

            {/* ── Tower zone ── */}
            <div style={{ position:'absolute', bottom:0, left:0, right:0, height:80, background:'rgba(0,255,204,.03)', borderTop:'1.5px solid rgba(0,255,204,.15)' }}>
              {/* "FLEX CONTAINER" label */}
              <div style={{ position:'absolute', top:2, left:6, fontFamily:"'Press Start 2P',monospace", fontSize:5, color:'rgba(0,255,204,.3)', letterSpacing:'.05em' }}>
                FLEX CONTAINER · justify-content: {appliedVal}
              </div>

              {/* Flex container for towers */}
              <div style={{ position:'absolute', top:10, left:0, right:0, bottom:0, display:'flex', alignItems:'center', justifyContent: appliedVal as any }}>
                {Array.from({length:level.towers}).map((_,i)=>(
                  <div
                    key={i}
                    ref={el => { towerRefs.current[i] = el; }}
                    style={{ width:TW, height:TH, flexShrink:0, position:'relative' }}
                  >
                    {/* Tower visual */}
                    <svg width={TW} height={TH} viewBox="0 0 58 62" style={{ filter:`drop-shadow(0 0 8px ${towerColors[i%4]})` }}>
                      {/* Base */}
                      <rect x="10" y="44" width="38" height="16" rx="2" fill="#0d1a2b" stroke={towerColors[i%4]} strokeWidth="1.5"/>
                      {/* Body */}
                      <rect x="16" y="22" width="26" height="26" rx="2" fill="#0d1a2b" stroke={towerColors[i%4]} strokeWidth="1.5"/>
                      {/* Cannon */}
                      <rect x="26" y="4" width="6" height="22" rx="2" fill={towerColors[i%4]} opacity="0.9"/>
                      {/* Accent lights */}
                      <circle cx="20" cy="32" r="3" fill={towerColors[i%4]} opacity="0.6"/>
                      <circle cx="38" cy="32" r="3" fill={towerColors[i%4]} opacity="0.6"/>
                      {/* Glow */}
                      <rect x="26" y="4" width="6" height="5" rx="1" fill="white" opacity="0.4"/>
                    </svg>
                    {/* Tower range indicator */}
                    <div style={{ position:'absolute', top:-RANGE+TH/2, left:TW/2-RANGE, width:RANGE*2, height:RANGE, background:`radial-gradient(${towerGC[i%4]}08, transparent)`, borderTop:`1px dashed ${towerGC[i%4]}22`, pointerEvents:'none' }}/>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Phase overlays ── */}
            {phase === 'intro' && (
              <div style={{ position:'absolute', inset:0, background:'rgba(4,8,16,.82)', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16, zIndex:20, animation:'ft-slideIn .3s ease both' }}>
                <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:12, color:'#00ffcc', textShadow:'0 0 16px rgba(0,255,204,.7)' }}>NÍVEL {level.num}</div>
                <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:9, color:'#a78bfa', textAlign:'center', padding:'0 20px' }}>{level.title.toUpperCase()}</div>
                <button onClick={startWave} style={{ padding:'12px 28px', background:'linear-gradient(135deg,#00ffcc,#00ccaa)', border:'none', color:'#060a14', fontFamily:"'Press Start 2P',monospace", fontSize:10, cursor:'pointer', boxShadow:'0 0 24px rgba(0,255,204,.5)', animation:'ft-glow 1.5s ease-in-out infinite' }}>
                  ▶ DEFENDER!
                </button>
              </div>
            )}

            {phase === 'wave_end' && (
              <div style={{ position:'absolute', inset:0, background:'rgba(4,8,16,.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:20 }}>
                <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:13, color:'#22c55e', textShadow:'0 0 20px rgba(34,197,94,.7)', animation:'ft-slideIn .3s ease both' }}>ONDA LIMPA!</div>
              </div>
            )}

            {phase === 'win' && (
              <div style={{ position:'absolute', inset:0, background:'rgba(4,8,16,.88)', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:14, zIndex:20, animation:'ft-slideIn .3s ease both' }}>
                <Trophy size={36} color="#fbbf24" style={{filter:'drop-shadow(0 0 12px rgba(251,191,36,.8))'}}/>
                <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:12, color:'#fbbf24', textShadow:'0 0 18px rgba(251,191,36,.7)' }}>NÍVEL VENCIDO!</div>
                <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:7, color:'#22c55e' }}>+{25+levelIdx*10} moedas · +{15+levelIdx*8} pts</div>
                {levelIdx < LEVELS.length-1 ? (
                  <button onClick={()=>resetLevel(levelIdx+1)} style={{ padding:'11px 24px', background:'linear-gradient(135deg,#fbbf24,#f59e0b)', border:'none', color:'#1a0a00', fontFamily:"'Press Start 2P',monospace", fontSize:9, cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
                    PRÓXIMO NÍVEL <ChevronRight size={14}/>
                  </button>
                ) : (
                  <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:9, color:'#00ffcc', textAlign:'center' }}>🏆 JOGO COMPLETO! VOCÊ DOMINA FLEXBOX!</div>
                )}
              </div>
            )}

            {phase === 'gameover' && (
              <div style={{ position:'absolute', inset:0, background:'rgba(4,8,16,.88)', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:14, zIndex:20, animation:'ft-shake .4s ease both' }}>
                <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:14, color:'#f87171', textShadow:'0 0 18px rgba(248,113,113,.7)' }}>GAME OVER</div>
                <div style={{ fontSize:12, color:'#475569' }}>Os invasores passaram!</div>
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={()=>resetLevel(levelIdx)} style={{ padding:'10px 18px', background:'rgba(248,113,113,.12)', border:'1.5px solid #f87171', color:'#f87171', fontFamily:"'Press Start 2P',monospace", fontSize:8, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                    <RefreshCw size={12}/> TENTAR DE NOVO
                  </button>
                  {levelIdx > 0 && (
                    <button onClick={()=>resetLevel(levelIdx-1)} style={{ padding:'10px 18px', background:'rgba(71,86,105,.1)', border:'1.5px solid #475569', color:'#475569', fontFamily:"'Press Start 2P',monospace", fontSize:8, cursor:'pointer' }}>
                      ← NÍVEL ANTERIOR
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Enemy progress bar */}
          {phase === 'playing' && (
            <div style={{ marginTop:6, display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:6, color:'#475569' }}>PROGRESSO</span>
              <div style={{ flex:1, height:6, background:'#0d1a2b', borderRadius:3, overflow:'hidden' }}>
                <div style={{ height:'100%', background:'linear-gradient(90deg,#22c55e,#00ffcc)', borderRadius:3, width:`${(spawnedR.current/wDef.count)*100}%`, transition:'width .3s' }}/>
              </div>
              <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:6, color:'#475569' }}>{spawnedR.current}/{wDef.count}</span>
            </div>
          )}
        </div>

        {/* ── RIGHT: CSS PANEL ── */}
        <div style={{ width:320, flexShrink:0, animation:'ft-slideIn .4s ease .1s both' }}>
          {/* CSS Editor */}
          <div style={{ background:'rgba(0,255,204,.03)', border:'2px solid rgba(0,255,204,.2)', borderRadius:6, overflow:'hidden', marginBottom:12, boxShadow:'0 0 20px rgba(0,255,204,.06)' }}>
            {/* Header */}
            <div style={{ padding:'10px 14px', background:'rgba(0,255,204,.06)', borderBottom:'1px solid rgba(0,255,204,.15)', display:'flex', alignItems:'center', gap:8 }}>
              <Zap size={13} color="#00ffcc"/>
              <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:8, color:'#00ffcc' }}>EDITOR CSS</span>
            </div>

            <div style={{ padding:14 }}>
              {/* CSS rule preview */}
              <div style={{ fontFamily:"'Courier New',monospace", fontSize:12, marginBottom:12, padding:'10px 12px', background:'#060a14', border:'1px solid rgba(0,255,204,.15)', borderRadius:4, lineHeight:1.8 }}>
                <span style={{ color:'#7c3aed' }}>.torres</span>
                <span style={{ color:'#94a3b8' }}> {'{'}</span><br/>
                <span style={{ color:'#94a3b8', paddingLeft:14 }}>display: </span>
                <span style={{ color:'#22c55e' }}>flex;</span><br/>
                <span style={{ color:'#f87171', paddingLeft:14 }}>{level.prop}: </span>
                <span style={{ color:'#fbbf24' }}>{appliedVal};</span><br/>
                <span style={{ color:'#94a3b8' }}>{'}'}</span>
              </div>

              {/* Input */}
              <div style={{ marginBottom:10 }}>
                <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:7, color:'#475569', marginBottom:6 }}>
                  {level.prop.toUpperCase()}:
                </div>
                <input
                  value={cssInput}
                  onChange={e=>{setCssInput(e.target.value);setCssError('');}}
                  onKeyDown={e=>e.key==='Enter'&&applyCSS()}
                  placeholder={`ex: ${level.answers[0]}`}
                  style={{ width:'100%', boxSizing:'border-box', padding:'9px 12px', background:'#060a14', border:`1.5px solid ${cssError?'#ef4444':'rgba(0,255,204,.25)'}`, color:'#e2e8f0', fontFamily:"'Courier New',monospace", fontSize:13, outline:'none', borderRadius:3 }}
                  onFocus={e=>{if(!cssError)e.currentTarget.style.borderColor='#00ffcc';}}
                  onBlur={e=>{if(!cssError)e.currentTarget.style.borderColor='rgba(0,255,204,.25)';}}
                />
                {cssError && <div style={{ fontSize:11, color:'#ef4444', marginTop:4 }}>{cssError}</div>}
              </div>

              <button onClick={applyCSS} style={{ width:'100%', padding:'10px', background:'linear-gradient(135deg,rgba(0,255,204,.15),rgba(0,204,170,.1))', border:'1.5px solid #00ffcc', color:'#00ffcc', fontFamily:"'Press Start 2P',monospace", fontSize:9, cursor:'pointer', boxShadow:'0 0 14px rgba(0,255,204,.2)', transition:'all .15s' }} onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='linear-gradient(135deg,#00ffcc,#00ccaa)';(e.currentTarget as HTMLElement).style.color='#060a14';}} onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='linear-gradient(135deg,rgba(0,255,204,.15),rgba(0,204,170,.1))';(e.currentTarget as HTMLElement).style.color='#00ffcc';}}>
                APLICAR CSS ↵
              </button>
            </div>
          </div>

          {/* Hint */}
          <div style={{ padding:'10px 14px', background:'rgba(167,139,250,.06)', border:'1.5px solid rgba(167,139,250,.2)', borderRadius:6, marginBottom:12 }}>
            <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:7, color:'#a78bfa', marginBottom:6 }}>💡 DICA</div>
            <div style={{ fontSize:12, color:'#94a3b8', lineHeight:1.7 }}>{level.hint}</div>
          </div>

          {/* justify-content cheat sheet */}
          <div style={{ padding:'10px 14px', background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.07)', borderRadius:6 }}>
            <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:7, color:'#475569', marginBottom:10 }}>REFERÊNCIA RÁPIDA</div>
            {[
              { val:'flex-start',    desc:'início do eixo',         ex:'[■ ■    ]' },
              { val:'flex-end',      desc:'fim do eixo',            ex:'[    ■ ■]' },
              { val:'center',        desc:'centro',                  ex:'[  ■ ■  ]' },
              { val:'space-between', desc:'espaço entre',           ex:'[■     ■]' },
              { val:'space-around',  desc:'margem em volta',        ex:'[ ■   ■ ]' },
              { val:'space-evenly',  desc:'espaço igual em tudo',   ex:'[ ■  ■  ■ ]' },
            ].map(r=>(
              <div key={r.val} onClick={()=>{setCssInput(r.val);setCssError('');}} style={{ display:'flex', alignItems:'baseline', gap:8, padding:'4px 6px', cursor:'pointer', borderRadius:3, transition:'background .1s' }} onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(0,255,204,.06)'} onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                <span style={{ fontFamily:"'Courier New',monospace", fontSize:11, color: level.answers.includes(r.val)?'#00ffcc':'#334155', fontWeight: level.answers.includes(r.val)?700:400 }}>{r.val}</span>
                <span style={{ fontSize:9, color:'#1e2a3a', fontFamily:"'Courier New',monospace" }}>{r.ex}</span>
              </div>
            ))}
          </div>

          {/* Level select pills */}
          <div style={{ marginTop:12 }}>
            <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:7, color:'#334155', marginBottom:8 }}>NÍVEIS</div>
            <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
              {LEVELS.map((l,i)=>(
                <button key={l.num} onClick={()=>{cancelAnimationFrame(frameRef.current!);resetLevel(i);}}
                  style={{ padding:'5px 8px', fontFamily:"'Press Start 2P',monospace", fontSize:7, cursor:'pointer', background: i===levelIdx?'rgba(0,255,204,.15)':completedLevels.includes(i)?'rgba(34,197,94,.1)':'rgba(255,255,255,.03)', border:`1.5px solid ${i===levelIdx?'#00ffcc':completedLevels.includes(i)?'#22c55e44':'rgba(255,255,255,.08)'}`, color: i===levelIdx?'#00ffcc':completedLevels.includes(i)?'#22c55e':'#334155', borderRadius:3 }}>
                  {completedLevels.includes(i)?'★':''}{l.num}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
