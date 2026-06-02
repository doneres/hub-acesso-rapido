import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Shuffle, LayoutGrid, LayoutList, ArrowUpDown, Share2, X as XIcon } from 'lucide-react';
import ShareModal from './components/ShareModal';
import { Category, DifficultyLevel, SortOption, Tool } from './types';
import { TOOLS, CATEGORIES } from './data/tools';
import { useTheme } from './hooks/useTheme';
import { useFavorites } from './hooks/useFavorites';
import { useTooltip } from './hooks/useTooltip';
import { useRecentTools } from './hooks/useRecentTools';
import { usePopularTools } from './hooks/usePopularTools';
import { useViewMode } from './hooks/useViewMode';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import CategoryFilter from './components/CategoryFilter';
import ToolCard from './components/ToolCard';
import ToolListItem from './components/ToolListItem';
import Tooltip from './components/Tooltip';
import BackToTop from './components/BackToTop';
import Footer from './components/Footer';
import MobileToolModal from './components/MobileToolModal';
import Toast from './components/Toast';
import { SkeletonGrid, SkeletonList } from './components/SkeletonCard';
import RoadmapsPage from './pages/RoadmapsPage';
import SuportePage from './pages/SuportePage';
import ProfessorPage from './pages/ProfessorPage';
import MakerPage from './pages/MakerPage';
import NoticiasPage from './pages/NoticiasPage';
import DesafiosPage from './pages/DesafiosPage';
import PasswordModal from './components/PasswordModal';
import FloatingNav from './components/FloatingNav';
import { COSMETICS, CosmeticDef, getActiveCosmeticId } from './data/cosmetics';

/* ── Constantes ──────────────────────────────────────────────────────────── */

const VALID_CATEGORY_IDS = CATEGORIES.map(c => c.id);
const VIRTUAL_CATEGORIES = new Set(['todos', 'favoritos', 'recentes', 'populares', 'novos']);

const LEVELS: (DifficultyLevel | 'todos')[] = ['todos', 'Iniciante', 'Intermediário', 'Avançado'];

const LEVEL_STYLES: Record<string, { active: string; dot: string }> = {
  todos:         { active: 'bg-slate-500 text-white',   dot: '' },
  Iniciante:     { active: 'bg-emerald-500 text-white', dot: 'bg-emerald-400' },
  Intermediário: { active: 'bg-amber-500 text-white',   dot: 'bg-amber-400' },
  Avançado:      { active: 'bg-rose-500 text-white',    dot: 'bg-rose-400' },
};

const LEVEL_ORDER: Record<DifficultyLevel, number> = {
  Iniciante: 0,
  Intermediário: 1,
  Avançado: 2,
};

function detectTouchDevice() {
  try { return window.matchMedia('(hover: none) and (pointer: coarse)').matches; }
  catch { return false; }
}

/* ── Banner temático — muda por cosmético ────────────────────────────────── */
function CosmeticBanner({ cosmetic, isDark }: { cosmetic: CosmeticDef; isDark: boolean }) {
  /* Copa */
  if (cosmetic.id === 'copa-2026') return (
    <div className="animate-fadeIn mb-6 relative overflow-hidden"
      style={{ background:'#FFD100', borderBottom:'3px solid #009C3B', padding:'11px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <div style={{ position:'absolute', inset:0, backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22'%3E%3Cpath d='M11 1L21 11L11 21L1 11Z' fill='none' stroke='%23009C3B' stroke-width='0.7' opacity='0.18'/%3E%3C/svg%3E\")", pointerEvents:'none' }} />
      <div style={{ display:'flex', alignItems:'center', gap:12, position:'relative', zIndex:1 }}>
        <div style={{ width:32, height:32, borderRadius:'50%', background:'#009C3B', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, boxShadow:'0 2px 8px rgba(0,156,59,0.35)' }}>⚽</div>
        <div>
          <div style={{ fontSize:12, fontWeight:900, color:'#014d20', letterSpacing:'0.1em', lineHeight:1 }}>COPA DO MUNDO 2026</div>
          <div style={{ fontSize:10, color:'rgba(1,77,32,0.65)', marginTop:2 }}>Tema ativo · gerencie em Desafios</div>
        </div>
      </div>
      <div style={{ position:'relative', zIndex:1, fontSize:9, fontWeight:900, letterSpacing:'0.14em', color:'#014d20', padding:'4px 14px', background:'rgba(1,77,32,0.1)', border:'1px solid rgba(1,77,32,0.25)', borderRadius:999 }}>ATIVO</div>
    </div>
  );

  /* Fallout NV */
  if (cosmetic.id === 'fallout-nv') return (
    <div className="animate-fadeIn mb-6" style={{ background:'#0b1208', border:'1px solid rgba(0,214,50,0.25)', borderLeft:'3px solid #00d632', padding:'10px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 0 20px rgba(0,214,50,0.08), inset 0 0 30px rgba(0,214,50,0.03)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <span style={{ fontSize:22, filter:'drop-shadow(0 0 8px #00d632)' }}>☢️</span>
        <div>
          <div style={{ fontFamily:'monospace', fontSize:11, color:'#00d632', letterSpacing:'0.18em', animation:'pipboyGlow 2.5s ease-in-out infinite' }}>{'> FALLOUT: NEW VEGAS'}</div>
          <div style={{ fontFamily:'monospace', fontSize:8, color:'rgba(0,214,50,0.45)', marginTop:3 }}>{'> PIP-BOY 3000 MARK IV · MODO ATIVO'}</div>
        </div>
      </div>
      <div style={{ fontFamily:'monospace', fontSize:9, color:'#00d632', padding:'4px 14px', border:'1px solid rgba(0,214,50,0.4)', borderRadius:2, letterSpacing:'0.1em' }}>[ ONLINE ]</div>
    </div>
  );

  /* CS 1.6 */
  if (cosmetic.id === 'csgo-16') return (
    <div className="animate-fadeIn mb-6" style={{ background:'#0f1218', borderTop:'2px solid #FF6600', borderBottom:'1px solid rgba(255,102,0,0.15)', padding:'10px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <span style={{ fontSize:20 }}>💣</span>
        <div>
          <div style={{ fontFamily:'monospace', fontSize:11, fontWeight:900, color:'#FF6600', letterSpacing:'0.1em' }}>COUNTER-STRIKE 1.6</div>
          <div style={{ fontFamily:'monospace', fontSize:8, color:'rgba(255,102,0,0.45)', marginTop:3 }}>BUY MENU ACTIVE · MANAGE IN DESAFIOS</div>
        </div>
      </div>
      <div style={{ display:'flex', gap:8 }}>
        <span style={{ fontFamily:'monospace', fontSize:9, fontWeight:900, color:'#fff', padding:'3px 10px', background:'#3a7bd5', borderRadius:2 }}>CT</span>
        <span style={{ fontFamily:'monospace', fontSize:9, fontWeight:900, color:'#fff', padding:'3px 10px', background:'#FF6600', borderRadius:2 }}>T</span>
      </div>
    </div>
  );

  /* Minecraft */
  if (cosmetic.id === 'minecraft') return (
    <div className="animate-fadeIn mb-6" style={{ background:'#1a1a1a', border:'2px solid #3a3a3a', borderTop:'4px solid #5D9E40', padding:'10px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'3px 3px 0 #111' }}>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <span style={{ fontSize:20 }}>⛏️</span>
        <div>
          <div style={{ fontFamily:'monospace', fontSize:11, fontWeight:900, color:'#5D9E40', letterSpacing:'0.12em', textShadow:'2px 2px 0 #111' }}>MINECRAFT</div>
          <div style={{ fontFamily:'monospace', fontSize:8, color:'rgba(93,158,64,0.5)', marginTop:3 }}>TEMA ATIVO · GERENCIE EM DESAFIOS</div>
        </div>
      </div>
      <div style={{ fontFamily:'monospace', fontSize:9, fontWeight:900, color:'#e8e8e8', padding:'4px 12px', background:'#333', border:'2px solid #5D9E40', boxShadow:'2px 2px 0 #111', letterSpacing:'0.1em' }}>[ ATIVO ]</div>
    </div>
  );

  /* Dark Souls */
  if (cosmetic.id === 'dark-souls') return (
    <div className="animate-fadeIn mb-6" style={{ background:'#0a0703', border:'1px solid rgba(199,131,42,0.25)', borderLeft:'3px solid #c7832a', borderBottom:'2px solid rgba(199,131,42,0.45)', padding:'10px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 0 28px rgba(199,131,42,0.12), inset 0 0 40px rgba(199,131,42,0.04)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <span style={{ fontSize:22, filter:'drop-shadow(0 0 10px rgba(199,131,42,0.9)) drop-shadow(0 0 4px #e8c97a)' }}>🔥</span>
        <div>
          <div style={{ fontFamily:'monospace', fontSize:11, fontWeight:900, color:'#c7832a', letterSpacing:'0.16em', textShadow:'0 0 10px rgba(199,131,42,0.6)' }}>DARK SOULS</div>
          <div style={{ fontFamily:'monospace', fontSize:8, color:'rgba(199,131,42,0.5)', marginTop:3, letterSpacing:'0.1em' }}>⚔ KINDLE THE BONFIRE · TEMA ATIVO</div>
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
        <div style={{ fontFamily:'monospace', fontSize:9, color:'#c7832a', padding:'3px 12px', border:'1px solid rgba(199,131,42,0.5)', letterSpacing:'0.1em', textShadow:'0 0 6px rgba(199,131,42,0.5)' }}>† ATIVO</div>
        <div style={{ fontFamily:'monospace', fontSize:7, color:'rgba(199,131,42,0.35)', letterSpacing:'0.08em' }}>prepare to study</div>
      </div>
    </div>
  );

  /* Matrix */
  if (cosmetic.id === 'matrix') return (
    <div className="animate-fadeIn mb-6" style={{ background:'#000', border:'1px solid rgba(0,255,65,0.2)', borderLeft:'3px solid #00ff41', padding:'10px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 0 20px rgba(0,255,65,0.06)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <span style={{ fontSize:20, filter:'drop-shadow(0 0 8px #00ff41)' }}>💊</span>
        <div>
          <div style={{ fontFamily:'monospace', fontSize:11, color:'#00ff41', letterSpacing:'0.18em', textShadow:'0 0 8px rgba(0,255,65,0.6)' }}>{'> THE MATRIX'}</div>
          <div style={{ fontFamily:'monospace', fontSize:8, color:'rgba(0,255,65,0.4)', marginTop:3 }}>{'> SYSTEM OVERRIDE ACTIVE'}</div>
        </div>
      </div>
      <div style={{ fontFamily:'monospace', fontSize:9, color:'#00ff41', padding:'4px 14px', border:'1px solid rgba(0,255,65,0.4)', borderRadius:2, letterSpacing:'0.1em' }}>[ CONNECTED ]</div>
    </div>
  );

  /* Among Us */
  if (cosmetic.id === 'among-us') return (
    <div className="animate-fadeIn mb-6" style={{ background:'#0d0d28', border:'1px solid rgba(19,46,209,0.3)', borderTop:'3px solid #132ed1', borderRadius:8, padding:'10px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 4px 16px rgba(0,0,0,0.5)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <span style={{ fontSize:20 }}>🚀</span>
        <div>
          <div style={{ fontSize:11, fontWeight:900, color:'#b8c8ff', letterSpacing:'0.1em' }}>AMONG US</div>
          <div style={{ fontSize:8, color:'rgba(184,200,255,0.45)', marginTop:3 }}>CREWMATE MODE · GERENCIE EM DESAFIOS</div>
        </div>
      </div>
      <div style={{ fontSize:9, fontWeight:900, color:'#b8c8ff', padding:'4px 14px', background:'rgba(19,46,209,0.2)', border:'1px solid rgba(19,46,209,0.4)', borderRadius:999, letterSpacing:'0.1em' }}>ATIVO</div>
    </div>
  );

  /* Pokémon */
  if (cosmetic.id === 'pokemon') return (
    <div className="animate-fadeIn mb-6" style={{ background:'#102060', border:'2px solid rgba(238,21,21,0.35)', borderTop:'4px solid #EE1515', borderRadius:6, padding:'10px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 4px 0 rgba(0,0,0,0.4)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <span style={{ fontSize:20 }}>⚡</span>
        <div>
          <div style={{ fontSize:11, fontWeight:900, color:'#FFDE00', letterSpacing:'0.1em', textShadow:'1px 1px 0 rgba(0,0,0,0.5)' }}>POKÉMON</div>
          <div style={{ fontSize:8, color:'rgba(255,222,0,0.5)', marginTop:3 }}>TREINADOR ATIVO · GERENCIE EM DESAFIOS</div>
        </div>
      </div>
      <div style={{ fontSize:9, fontWeight:900, color:'#fff', padding:'4px 14px', background:'#EE1515', borderRadius:999, letterSpacing:'0.1em', boxShadow:'2px 2px 0 rgba(0,0,0,0.3)' }}>ATIVO</div>
    </div>
  );

  /* Hollow Knight */
  if (cosmetic.id === 'hollow-knight') return (
    <div className="animate-fadeIn mb-6" style={{ background:'#08090d', border:'1px solid rgba(197,232,240,0.16)', borderLeft:'3px solid #c5e8f0', borderBottom:'2px solid rgba(197,232,240,0.28)', padding:'10px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 0 24px rgba(100,170,200,0.1), inset 0 0 40px rgba(100,170,200,0.03)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <svg width="28" height="38" viewBox="0 0 38 56" style={{ filter:'drop-shadow(0 0 8px rgba(197,232,240,0.7))' }}>
          <path d="M14,22 Q4,30 6,48 L13,42 L14,32Z" fill="#5a8aab" opacity="0.9"/>
          <path d="M24,22 Q34,30 32,48 L25,42 L24,32Z" fill="#5a8aab" opacity="0.9"/>
          <rect x="13" y="19" width="12" height="15" rx="3" fill="#c5e8f0"/>
          <ellipse cx="19" cy="11" rx="8.5" ry="9.5" fill="#c5e8f0"/>
          <path d="M12,5 Q10,0 7,0 Q9,2 11,6Z" fill="#c5e8f0"/>
          <path d="M26,5 Q28,0 31,0 Q29,2 27,6Z" fill="#c5e8f0"/>
          <ellipse cx="15" cy="11" rx="2.5" ry="3" fill="#7ecce8"/>
          <ellipse cx="23" cy="11" rx="2.5" ry="3" fill="#7ecce8"/>
        </svg>
        <div>
          <div style={{ fontFamily:'monospace', fontSize:11, fontWeight:900, color:'#c5e8f0', letterSpacing:'0.16em', textShadow:'0 0 10px rgba(197,232,240,0.55)' }}>HOLLOW KNIGHT</div>
          <div style={{ fontFamily:'monospace', fontSize:8, color:'rgba(197,232,240,0.42)', marginTop:3, letterSpacing:'0.1em' }}>🗡 HALLOWNEST · TEMA ATIVO</div>
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
        <div style={{ fontFamily:'monospace', fontSize:9, color:'#c5e8f0', padding:'3px 12px', border:'1px solid rgba(197,232,240,0.4)', letterSpacing:'0.1em', textShadow:'0 0 6px rgba(197,232,240,0.5)' }}>◈ ATIVO</div>
        <div style={{ fontFamily:'monospace', fontSize:7, color:'rgba(197,232,240,0.32)', letterSpacing:'0.08em' }}>focus. dream nail.</div>
      </div>
    </div>
  );

  /* Fallback */
  return (
    <div className="animate-fadeIn mb-6 flex items-center justify-between px-5 py-3"
      style={{ background: isDark ? '#111' : '#fff', borderLeft:`3px solid ${cosmetic.accent1}` }}>
      <span style={{ fontWeight:700 }}>{cosmetic.name}</span>
      <span style={{ fontSize:11, opacity:0.6 }}>ativo</span>
    </div>
  );
}

/* ── Gramado Copa — SVG com marcações reais ──────────────────────────────── */
function PitchBackground() {
  const SW = 15; // stripe width (units)
  return (
    <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }}>
      <svg width="100%" height="100%" viewBox="0 0 120 80" preserveAspectRatio="xMidYMid slice" style={{ display:'block' }}>
        <defs>
          {/* Clip para arco da grande área esquerda (fora da área) */}
          <clipPath id="arcClipL"><rect x="24" y="0" width="96" height="80"/></clipPath>
          {/* Clip para arco da grande área direita (fora da área) */}
          <clipPath id="arcClipR"><rect x="0"  y="0" width="96" height="80"/></clipPath>
        </defs>

        {/* Faixas do gramado — efeito cortador de grama */}
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={i*SW} y={0} width={SW} height={80}
            fill={i%2===0 ? '#1f7028' : '#267a30'} />
        ))}

        {/* Linhas brancas do campo */}
        <g stroke="rgba(255,255,255,0.78)" strokeWidth="0.38" fill="none">
          {/* Linha de fundo e laterais */}
          <rect x={7.5} y={6} width={105} height={68}/>
          {/* Linha do meio */}
          <line x1={60} y1={6} x2={60} y2={74}/>
          {/* Círculo central */}
          <circle cx={60} cy={40} r={9.15}/>
          {/* Grande área esquerda */}
          <rect x={7.5}  y={19.84} width={16.5} height={40.32}/>
          {/* Grande área direita */}
          <rect x={96}   y={19.84} width={16.5} height={40.32}/>
          {/* Pequena área esquerda */}
          <rect x={7.5}  y={29.84} width={5.5}  height={20.32}/>
          {/* Pequena área direita */}
          <rect x={107}  y={29.84} width={5.5}  height={20.32}/>
          {/* Arco da grande área esquerda (só a parte de fora) */}
          <circle cx={18.5}  cy={40} r={9.15} clipPath="url(#arcClipL)"/>
          {/* Arco da grande área direita */}
          <circle cx={101.5} cy={40} r={9.15} clipPath="url(#arcClipR)"/>
          {/* Arcos de escanteio */}
          <path d="M 7.5,7.5  A 1.5,1.5 0 0,1 9,6"/>
          <path d="M 111,6    A 1.5,1.5 0 0,1 112.5,7.5"/>
          <path d="M 112.5,72.5 A 1.5,1.5 0 0,1 111,74"/>
          <path d="M 9,74    A 1.5,1.5 0 0,1 7.5,72.5"/>
        </g>
        {/* Pontos (centro + pênaltis) */}
        <g fill="rgba(255,255,255,0.78)">
          <circle cx={60}    cy={40} r={0.42}/>
          <circle cx={18.5}  cy={40} r={0.42}/>
          <circle cx={101.5} cy={40} r={0.42}/>
        </g>
      </svg>
    </div>
  );
}

/* ── Efeitos Copa: bola rolando (clicável) + vuvuzelas ───────────────────── */
function CopaSideEffects() {
  const [ballVisible, setBallVisible] = React.useState(false);
  const [kickPos, setKickPos]         = React.useState<{x:number;y:number}|null>(null);
  const ballRef  = React.useRef<HTMLDivElement>(null);
  const animRef  = React.useRef<number>(0);
  const ballData = React.useRef<{ x:number; dir:1|-1; bottom:number; rotation:number } | null>(null);
  const [vuvu, setVuvu] = React.useState<number | null>(null);

  const launchBall = React.useCallback((dir: 1|-1, bottom: number) => {
    cancelAnimationFrame(animRef.current);
    const startX    = dir === 1 ? -60 : window.innerWidth + 60;
    ballData.current = { x: startX, dir, bottom, rotation: 0 };
    setBallVisible(true);

    const speed    = (window.innerWidth + 176) / 5500; // px/ms
    const rotSpeed = 900 / 5500;                       // deg/ms
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(now - last, 50);
      last = now;
      const bd = ballData.current;
      if (!bd) return;

      bd.x        += bd.dir * speed    * dt;
      bd.rotation += bd.dir * rotSpeed * dt;

      const el = ballRef.current;
      if (el) {
        el.style.setProperty('--ball-x', `${bd.x}px`);
        el.style.transform = `rotate(${bd.rotation}deg)`;
      }

      const offscreen = bd.dir === 1 ? bd.x > window.innerWidth + 61 : bd.x < -61;
      if (offscreen) {
        setBallVisible(false);
        ballData.current = null;
        return;
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  }, []);

  /* schedule bola */
  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = (first: boolean) => {
      timer = setTimeout(() => {
        launchBall((Math.random() > 0.5 ? 1 : -1) as 1|-1, 10 + Math.floor(Math.random() * 22));
        schedule(false);
      }, first ? 12000 : 22000 + Math.random() * 20000);
    };
    schedule(true);
    return () => { clearTimeout(timer); cancelAnimationFrame(animRef.current); };
  }, [launchBall]);

  /* chute — inverte direção */
  const handleKick = (e: React.MouseEvent) => {
    const bd = ballData.current;
    if (!bd) return;
    bd.dir = (bd.dir === 1 ? -1 : 1) as 1|-1;
    setKickPos({ x: e.clientX, y: e.clientY });
    setTimeout(() => setKickPos(null), 600);
  };

  /* schedule vuvuzela */
  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = (first: boolean) => {
      timer = setTimeout(() => {
        setVuvu(5 + Math.floor(Math.random() * 88));
        schedule(false);
      }, first ? 20000 : 18000 + Math.random() * 18000);
    };
    schedule(true);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {ballVisible && (
        <div
          ref={ballRef}
          onClick={handleKick}
          style={{
            position: 'fixed', zIndex: 15,
            bottom: `${ballData.current?.bottom ?? 10}%`,
            left: 'var(--ball-x, -60px)',
            '--ball-x': `${ballData.current?.x ?? -60}px`,
            fontSize: 44,
            cursor: 'pointer',
            userSelect: 'none',
            willChange: 'transform',
          } as React.CSSProperties}
        >⚽</div>
      )}
      {kickPos && (
        <div style={{
          position: 'fixed', zIndex: 20, pointerEvents: 'none',
          left: kickPos.x - 20, top: kickPos.y - 20,
          fontSize: 28,
          animation: 'kickSpark 0.5s ease-out forwards',
        }}>💥</div>
      )}
      {vuvu !== null && (
        <div
          style={{
            position: 'fixed', bottom: '-8px', left: `${vuvu}%`,
            zIndex: 15, pointerEvents: 'none', fontSize: 30,
            animation: 'vuvuzelaBlast 2.4s ease-out forwards',
          }}
          onAnimationEnd={() => setVuvu(null)}
        >🎺</div>
      )}
    </>
  );
}

/* ── Fallout: New Vegas — fundo Wasteland ────────────────────────────────── */
function FalloutBackground() {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', background:'#070e05' }}>
      {/* CRT scanlines */}
      <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,214,50,0.018) 3px,rgba(0,214,50,0.018) 4px)' }} />
      {/* Radial Pip-Boy glow */}
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 70% 55% at 50% 42%,rgba(0,214,50,0.07) 0%,transparent 70%)' }} />
      {/* Símbolos de radiação estáticos */}
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ position:'absolute', inset:0, opacity:0.055 }}>
        {([[8,12],[88,18],[18,72],[82,78],[50,42],[28,88],[73,58],[42,25],[62,85],[15,50]] as [number,number][]).map(([x,y], i) => (
          <text key={i} x={x} y={y} fontSize={i%3===0?7:4.5} fontFamily="monospace" fill="#00d632" textAnchor="middle">☢</text>
        ))}
      </svg>
      {/* Terminal grid lines */}
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ position:'absolute', inset:0, opacity:0.025 }}>
        {Array.from({length:10},(_,i)=><line key={i} x1={0} y1={i*10} x2={100} y2={i*10} stroke="#00d632" strokeWidth="0.3"/>)}
        {Array.from({length:14},(_,i)=><line key={i} x1={i*7.5} y1={0} x2={i*7.5} y2={100} stroke="#00d632" strokeWidth="0.3"/>)}
      </svg>
    </div>
  );
}

function FalloutEffects() {
  const [showScan, setShowScan] = React.useState(false);
  const [rads, setRads] = React.useState<{ id:number; left:number }[]>([]);

  React.useEffect(() => {
    const iv = setInterval(() => {
      setShowScan(true);
      setTimeout(() => setShowScan(false), 2000);
    }, 14000);
    return () => clearInterval(iv);
  }, []);

  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let uid = 0;
    const schedule = () => {
      timer = setTimeout(() => {
        const id = uid++;
        setRads(r => [...r, { id, left: 5 + Math.floor(Math.random() * 90) }]);
        setTimeout(() => setRads(r => r.filter(x => x.id !== id)), 3200);
        schedule();
      }, 7000 + Math.random() * 10000);
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showScan && (
        <div style={{ position:'fixed', left:0, right:0, zIndex:14, height:2, background:'linear-gradient(90deg,transparent,rgba(0,214,50,0.7) 20%,rgba(0,255,65,0.9) 50%,rgba(0,214,50,0.7) 80%,transparent)', boxShadow:'0 0 12px rgba(0,214,50,0.5)', pointerEvents:'none', animation:'pipboyScan 2s linear forwards' }} />
      )}
      {rads.map(r => (
        <div key={r.id} style={{
          position: 'fixed', bottom: 0, left: `${r.left}%`,
          zIndex: 14, pointerEvents: 'none',
          fontSize: 22, color: '#00d632',
          textShadow: '0 0 8px #00d632, 0 0 16px rgba(0,214,50,0.5)',
          animation: 'radBubble 3.0s ease-out forwards',
        }}>☢</div>
      ))}
    </>
  );
}

/* ── Counter-Strike 1.6 — fundo tático ───────────────────────────────────── */
function CSGOBackground() {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', background:'#08090a' }}>
      {/* Grade tática overhead */}
      <svg width="100%" height="100%" viewBox="0 0 1000 680" preserveAspectRatio="xMidYMid slice" style={{ position:'absolute', inset:0 }}>
        <g stroke="rgba(255,102,0,0.055)" strokeWidth="0.7">
          {Array.from({length:14},(_,i)=><line key={`h${i}`} x1={0} y1={i*50} x2={1000} y2={i*50}/>)}
          {Array.from({length:21},(_,i)=><line key={`v${i}`} x1={i*50} y1={0} x2={i*50} y2={680}/>)}
        </g>
        {/* Mira central */}
        <g stroke="rgba(255,102,0,0.18)" strokeWidth="1.5" fill="none">
          <line x1={500} y1={290} x2={500} y2={390}/>
          <line x1={445} y1={340} x2={555} y2={340}/>
          <circle cx={500} cy={340} r={32}/>
          <circle cx={500} cy={340} r={4} fill="rgba(255,102,0,0.3)" stroke="none"/>
        </g>
        {/* Sites A e B */}
        <text x={130} y={170} fontSize={80} fontFamily="'Arial Black',monospace" fontWeight="900" fill="rgba(255,102,0,0.055)" textAnchor="middle">A</text>
        <text x={870} y={540} fontSize={80} fontFamily="'Arial Black',monospace" fontWeight="900" fill="rgba(58,123,213,0.055)" textAnchor="middle">B</text>
        {/* Silhueta CT + T (simplificada) */}
        <text x={120} y={500} fontSize={18} fontFamily="monospace" fill="rgba(58,123,213,0.06)" textAnchor="middle">◈ CT</text>
        <text x={880} y={200} fontSize={18} fontFamily="monospace" fill="rgba(255,102,0,0.06)" textAnchor="middle">◈ T</text>
      </svg>
    </div>
  );
}

function CSGOEffects() {
  const [showBomb, setShowBomb]   = React.useState(false);
  const [elims, setElims] = React.useState<{ id:number; name:string }[]>([]);

  React.useEffect(() => {
    let next: ReturnType<typeof setTimeout>;
    const schedule = (first: boolean) => {
      next = setTimeout(() => {
        setShowBomb(true);
        setTimeout(() => setShowBomb(false), 4500);
        schedule(false);
      }, first ? 20000 : 32000 + Math.random() * 25000);
    };
    schedule(true);
    return () => clearTimeout(next);
  }, []);

  React.useEffect(() => {
    const NAMES = ['BOT Kevin', 'BOT Alex', 'BOT Nick', 'BOT Mike'];
    let next: ReturnType<typeof setTimeout>;
    let uid = 0;
    const schedule = (first: boolean) => {
      next = setTimeout(() => {
        const id = uid++;
        const name = NAMES[Math.floor(Math.random() * NAMES.length)];
        setElims(e => [...e, { id, name }]);
        setTimeout(() => setElims(e => e.filter(x => x.id !== id)), 3200);
        schedule(false);
      }, first ? 8000 : 18000 + Math.random() * 18000);
    };
    schedule(true);
    return () => clearTimeout(next);
  }, []);

  return (
    <>
      {showBomb && (
        <div style={{
          position:'fixed', top:18, left:'50%', zIndex:20, pointerEvents:'none',
          background:'#cc0000', border:'2px solid #ff2020',
          padding:'7px 22px',
          display:'flex', alignItems:'center', gap:10,
          animation:'bombEnter 4.5s ease-out forwards',
          boxShadow:'0 0 0 2px rgba(255,0,0,0.15)',
        }}>
          <span style={{ fontSize:16, animation:'bombBlink 0.8s ease-in-out infinite' }}>💣</span>
          <span style={{ fontFamily:'monospace', fontSize:12, fontWeight:900, color:'#fff', letterSpacing:'0.12em' }}>BOMB PLANTED</span>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'#ff4444', animation:'bombBlink 0.5s ease-in-out infinite' }} />
        </div>
      )}
      {elims.map(el => (
        <div key={el.id} style={{
          position: 'fixed', bottom: 80, right: 20, zIndex: 20, pointerEvents: 'none',
          background: 'rgba(10,11,12,0.92)', border: '1px solid rgba(255,102,0,0.35)',
          padding: '5px 14px',
          display: 'flex', alignItems: 'center', gap: 8,
          animation: 'csElim 3.2s ease-out forwards',
        }}>
          <span style={{ fontFamily:'monospace', fontSize:9, fontWeight:900, color:'rgba(255,102,0,0.9)', letterSpacing:'0.08em' }}>
            💀 {el.name} eliminated
          </span>
          <span style={{ fontFamily:'monospace', fontSize:8, color:'rgba(255,255,255,0.4)' }}>+$300</span>
        </div>
      ))}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   MINECRAFT
════════════════════════════════════════════════════════════════════════ */
function MinecraftBackground() {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', background:'#1a1a1a' }}>
      {/* Stone texture pattern */}
      <svg width="100%" height="100%" style={{ position:'absolute', inset:0, opacity:0.12 }}>
        <defs>
          <pattern id="stoneBlock" width="32" height="32" patternUnits="userSpaceOnUse">
            <rect width="32" height="32" fill="#2a2a2a"/>
            <rect x="0" y="0" width="16" height="16" fill="#252525"/>
            <rect x="16" y="16" width="16" height="16" fill="#252525"/>
            <rect width="32" height="32" fill="none" stroke="#111" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#stoneBlock)"/>
      </svg>
      {/* Dirt strip at bottom */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'18%', background:'linear-gradient(180deg, #3a2a1a 0%, #2a1a0a 100%)', borderTop:'4px solid #5D9E40' }} />
      {/* Random floating pixels */}
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ position:'absolute', inset:0, opacity:0.08 }}>
        {([[5,20],[15,55],[25,35],[40,70],[55,25],[65,80],[75,45],[85,15],[92,60],[10,85],[50,10],[78,75]] as [number,number][]).map(([x,y],i) => (
          <rect key={i} x={x} y={y} width={i%3===0?3:2} height={i%3===0?3:2} fill={i%2===0?'#5D9E40':'#8B5E3C'}/>
        ))}
      </svg>
    </div>
  );
}

function MinecraftEffects() {
  /* Creeper atravessa a tela */
  const [creeperVisible, setCreeperVisible] = React.useState(false);
  const [achieve, setAchieve]               = React.useState<string|null>(null);
  const creeperRef  = React.useRef<HTMLDivElement>(null);
  const animRef     = React.useRef<number>(0);
  const creeperData = React.useRef<{ x:number; dir:1|-1; bottom:number } | null>(null);

  const ACHIEVEMENTS = ['Getting an Upgrade','Hot Topic','Diamonds!','Monster Hunter','Into The Nether','Taking Inventory'];

  const launchCreeper = React.useCallback((dir: 1|-1) => {
    cancelAnimationFrame(animRef.current);
    const startX = dir === 1 ? -50 : window.innerWidth + 50;
    creeperData.current = { x: startX, dir, bottom: 8 + Math.floor(Math.random() * 18) };
    setCreeperVisible(true);
    const speed = (window.innerWidth + 160) / 6000;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - last, 50); last = now;
      const cd = creeperData.current; if (!cd) return;
      cd.x += cd.dir * speed * dt;
      const el = creeperRef.current;
      if (el) el.style.setProperty('--cx', `${cd.x}px`);
      const off = cd.dir === 1 ? cd.x > window.innerWidth + 51 : cd.x < -51;
      if (off) { setCreeperVisible(false); creeperData.current = null; return; }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  }, []);

  React.useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const s = (first: boolean) => {
      t = setTimeout(() => { launchCreeper(Math.random()>.5?1:-1); s(false); }, first ? 15000 : 25000 + Math.random() * 20000);
    };
    s(true);
    return () => { clearTimeout(t); cancelAnimationFrame(animRef.current); };
  }, [launchCreeper]);

  React.useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const s = (first: boolean) => {
      t = setTimeout(() => {
        setAchieve(ACHIEVEMENTS[Math.floor(Math.random() * ACHIEVEMENTS.length)]);
        setTimeout(() => setAchieve(null), 4000);
        s(false);
      }, first ? 10000 : 20000 + Math.random() * 20000);
    };
    s(true);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {creeperVisible && (
        <div ref={creeperRef} style={{
          position:'fixed', zIndex:15, bottom:`${creeperData.current?.bottom ?? 10}%`,
          left:'var(--cx,-50px)', '--cx':`${creeperData.current?.x ?? -50}px`,
          pointerEvents:'none',
        } as React.CSSProperties}>
          {/* Creeper face SVG pixelado */}
          <svg width="40" height="48" viewBox="0 0 8 10">
            <rect width="8" height="8" fill="#3d8533"/>
            <rect x="1" y="2" width="2" height="2" fill="#000"/>
            <rect x="5" y="2" width="2" height="2" fill="#000"/>
            <rect x="3" y="4" width="2" height="1" fill="#000"/>
            <rect x="2" y="5" width="1" height="2" fill="#000"/>
            <rect x="3" y="6" width="2" height="1" fill="#000"/>
            <rect x="5" y="5" width="1" height="2" fill="#000"/>
            {/* Pernas */}
            <rect x="1" y="8" width="2" height="2" fill="#3d8533"/>
            <rect x="5" y="8" width="2" height="2" fill="#3d8533"/>
          </svg>
        </div>
      )}
      {achieve && (
        <div style={{
          position:'fixed', bottom:80, right:16, zIndex:20, pointerEvents:'none',
          background:'#1a1a1a', border:'2px solid #5D9E40', boxShadow:'3px 3px 0 #111',
          display:'flex', alignItems:'center', gap:10, padding:'8px 14px',
          animation:'mcAchieve 4s ease-out forwards',
        }}>
          <svg width="28" height="28" viewBox="0 0 8 8">
            <rect width="8" height="8" fill="#FFD700"/>
            <rect x="2" y="2" width="4" height="4" fill="#FFA500"/>
            <rect x="3" y="1" width="2" height="1" fill="#FFD700"/>
          </svg>
          <div>
            <div style={{ fontFamily:'monospace', fontSize:8, color:'#aaa', letterSpacing:'0.05em' }}>ACHIEVEMENT UNLOCKED!</div>
            <div style={{ fontFamily:'monospace', fontSize:10, fontWeight:900, color:'#e8e8e8', textShadow:'1px 1px 0 #111' }}>{achieve}</div>
          </div>
        </div>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   DARK SOULS
════════════════════════════════════════════════════════════════════════ */
function DarkSoulsBackground() {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', background:'#060301' }}>
      {/* Stone floor texture */}
      <svg width="100%" height="100%" style={{ position:'absolute', inset:0, opacity:0.04 }}>
        <defs>
          <pattern id="dsStone" width="80" height="80" patternUnits="userSpaceOnUse">
            <rect width="80" height="80" fill="#100a04"/>
            <line x1="0" y1="40" x2="80" y2="40" stroke="#c7832a" strokeWidth="0.5"/>
            <line x1="40" y1="0" x2="40" y2="80" stroke="#c7832a" strokeWidth="0.5"/>
            <rect x="1" y="1" width="38" height="38" fill="none" stroke="#c7832a" strokeWidth="0.3" opacity="0.5"/>
            <rect x="41" y="41" width="38" height="38" fill="none" stroke="#c7832a" strokeWidth="0.3" opacity="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dsStone)"/>
      </svg>
      {/* Gothic arch silhouettes */}
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ position:'absolute', inset:0, opacity:0.08 }}>
        <path d="M0,100 L0,60 Q5,30 10,60 L10,100Z" fill="#c7832a"/>
        <path d="M90,100 L90,60 Q95,30 100,60 L100,100Z" fill="#c7832a"/>
        <path d="M18,100 L18,70 Q23,45 28,70 L28,100Z" fill="#8c4a10" opacity="0.7"/>
        <path d="M72,100 L72,70 Q77,45 82,70 L82,100Z" fill="#8c4a10" opacity="0.7"/>
      </svg>
      {/* Ember-glow radial intenso no chão */}
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 55% 30% at 50% 95%, rgba(199,131,42,0.22) 0%, rgba(140,74,16,0.08) 50%, transparent 70%)' }} />
      {/* Bonfire SVG (centro-base) — mais visível */}
      <svg width="160" height="180" viewBox="0 0 120 140" style={{ position:'absolute', bottom:0, left:'50%', transform:'translateX(-50%)', opacity:0.62, filter:'drop-shadow(0 0 18px rgba(199,131,42,0.5))' }}>
        <ellipse cx="60" cy="128" rx="28" ry="5" fill="#1a0e06"/>
        <line x1="60" y1="35" x2="60" y2="120" stroke="#6b4a1e" strokeWidth="4"/>
        <line x1="44" y1="85" x2="76" y2="85" stroke="#6b4a1e" strokeWidth="3.5"/>
        <rect x="56" y="32" width="8" height="6" rx="2" fill="#8a6030"/>
        <path d="M60,38 C50,28 44,20 48,10 C51,3 56,1 60,0 C64,1 69,3 72,10 C76,20 70,28 60,38Z" fill="#c7832a" opacity="0.85"/>
        <path d="M60,36 C54,28 52,22 54,15 C56,10 59,8 60,5 C61,8 64,10 66,15 C68,22 66,28 60,36Z" fill="#e8c97a" opacity="0.75"/>
        <path d="M60,34 C57,28 56,24 57,18 C58,14 59.5,12 60,10 C60.5,12 62,14 63,18 C64,24 63,28 60,34Z" fill="#fff8e8" opacity="0.45"/>
        <circle cx="48" cy="90" r="2" fill="#c7832a" opacity="0.6"/>
        <circle cx="72" cy="95" r="1.5" fill="#e8c97a" opacity="0.5"/>
        <circle cx="55" cy="100" r="1.5" fill="#c7832a" opacity="0.55"/>
        <circle cx="66" cy="108" r="1.2" fill="#e8c97a" opacity="0.4"/>
      </svg>
      {/* Fog layer at ground */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'25%', background:'linear-gradient(0deg, rgba(60,20,5,0.35) 0%, transparent 100%)' }} />
      {/* Vignette */}
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 85% 75% at 50% 50%, transparent 25%, rgba(0,0,0,0.82) 100%)' }} />
    </div>
  );
}

function DarkSoulsEffects() {
  const [embers, setEmbers] = React.useState<{ id:number; left:number; size:number; bottom:number }[]>([]);
  const [phantom, setPhantom] = React.useState(false);
  const [msg, setMsg] = React.useState<string|null>(null);
  const phantomRef  = React.useRef<HTMLDivElement>(null);
  const phantomData = React.useRef<{ x:number; dir:1|-1 } | null>(null);
  const animRef     = React.useRef<number>(0);

  /* embers — spread largo */
  React.useEffect(() => {
    let t: ReturnType<typeof setTimeout>; let uid = 0;
    const s = () => {
      t = setTimeout(() => {
        const id = uid++;
        setEmbers(e => [...e, { id, left: 8 + Math.random() * 84, size: 5 + Math.random() * 10, bottom: 6 + Math.random() * 18 }]);
        setTimeout(() => setEmbers(e => e.filter(x => x.id !== id)), 4200);
        s();
      }, 700 + Math.random() * 1300);
    };
    s();
    return () => clearTimeout(t);
  }, []);

  /* phantom player traversal */
  const launchPhantom = React.useCallback((dir: 1|-1) => {
    cancelAnimationFrame(animRef.current);
    const startX = dir === 1 ? -55 : window.innerWidth + 55;
    phantomData.current = { x: startX, dir };
    setPhantom(true);
    const speed = (window.innerWidth + 170) / 9000;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - last, 50); last = now;
      const pd = phantomData.current; if (!pd) return;
      pd.x += pd.dir * speed * dt;
      const el = phantomRef.current;
      if (el) el.style.setProperty('--phx', `${pd.x}px`);
      const off = pd.dir === 1 ? pd.x > window.innerWidth + 56 : pd.x < -56;
      if (off) { setPhantom(false); phantomData.current = null; return; }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  }, []);

  React.useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const s = (first: boolean) => {
      t = setTimeout(() => { launchPhantom(Math.random() > 0.5 ? 1 : -1); s(false); },
        first ? 20000 : 30000 + Math.random() * 22000);
    };
    s(true);
    return () => { clearTimeout(t); cancelAnimationFrame(animRef.current); };
  }, [launchPhantom]);

  /* DS messages */
  React.useEffect(() => {
    const MSGS = ['BONFIRE LIT', 'PRAISE THE SUN  \\o/', 'HUMANITY RESTORED', 'SOUL OF A HERO', 'YOU DIED'];
    let t: ReturnType<typeof setTimeout>;
    const s = (first: boolean) => {
      t = setTimeout(() => {
        setMsg(MSGS[Math.floor(Math.random() * MSGS.length)]);
        setTimeout(() => setMsg(null), 4200);
        s(false);
      }, first ? 25000 : 35000 + Math.random() * 28000);
    };
    s(true);
    return () => clearTimeout(t);
  }, []);

  const pDir = phantomData.current?.dir ?? 1;
  return (
    <>
      {embers.map(em => (
        <div key={em.id} style={{
          position:'fixed', bottom:`${em.bottom}%`, left:`${em.left}%`,
          zIndex:14, pointerEvents:'none',
          width:em.size, height:em.size, borderRadius:'50%',
          background:'radial-gradient(circle, #e8c97a 0%, #c7832a 60%, transparent 100%)',
          boxShadow:`0 0 ${em.size * 1.3}px rgba(199,131,42,0.72)`,
          animation:'soulEmber 3.8s ease-out forwards',
        }}/>
      ))}
      {phantom && (
        <div
          ref={phantomRef}
          style={{
            position:'fixed', zIndex:15, bottom:'22%',
            left:'var(--phx,-55px)', '--phx':`${phantomData.current?.x ?? -55}px`,
            pointerEvents:'none',
            filter:'blur(0.8px)',
            transform: pDir === -1 ? 'scaleX(-1)' : 'none',
          } as React.CSSProperties}
        >
          <svg width="34" height="58" viewBox="0 0 34 58" opacity="0.38">
            {/* helmet */}
            <ellipse cx="17" cy="8" rx="9" ry="8" fill="#c8b8ff"/>
            {/* visor slit */}
            <rect x="10" y="7" width="14" height="3" rx="1.5" fill="#7060cc" opacity="0.7"/>
            {/* body */}
            <rect x="11" y="15" width="12" height="18" rx="3" fill="#c8b8ff"/>
            {/* sword arm */}
            <rect x="22" y="18" width="14" height="3" rx="1.5" fill="#d8ccff"/>
            <polygon points="36,19.5 33,17 33,22" fill="#e0d8ff"/>
            {/* off arm */}
            <rect x="0" y="18" width="10" height="3" rx="1.5" fill="#c8b8ff" opacity="0.8"/>
            {/* legs */}
            <rect x="11" y="33" width="5" height="18" rx="2" fill="#c8b8ff"/>
            <rect x="18" y="33" width="5" height="18" rx="2" fill="#c8b8ff"/>
            {/* boots */}
            <ellipse cx="13" cy="52" rx="6" ry="3" fill="#a898e0"/>
            <ellipse cx="21" cy="52" rx="6" ry="3" fill="#a898e0"/>
          </svg>
        </div>
      )}
      {msg && (
        <div style={{
          position:'fixed', top:24, left:'50%', zIndex:20, pointerEvents:'none',
          fontFamily:'monospace', fontSize:14, fontWeight:900, letterSpacing:'0.24em',
          color:'#c7832a', textShadow:'0 0 16px rgba(199,131,42,0.95), 0 0 32px rgba(199,131,42,0.45)',
          animation:'dsMsg 4.2s ease-out forwards',
        }}>{msg}</div>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   THE MATRIX
════════════════════════════════════════════════════════════════════════ */
const _MC = '01ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾃｦｲｸｺｿﾁﾄﾉﾌﾔﾖﾙﾚﾛﾝアイウエオカキクケコ';
const MATRIX_COLS = [
  { x:'3%', s:11, dur:9.2, dl:0   }, { x:'9%', s:9,  dur:7.0, dl:1.4 },
  { x:'15%',s:12, dur:11.5,dl:0.7 }, { x:'22%',s:10, dur:8.3, dl:2.2 },
  { x:'29%',s:11, dur:6.8, dl:1.0 }, { x:'36%',s:9,  dur:10.1,dl:0.4 },
  { x:'44%',s:12, dur:7.7, dl:1.8 }, { x:'52%',s:10, dur:8.9, dl:0.2 },
  { x:'60%',s:11, dur:9.5, dl:2.5 }, { x:'68%',s:9,  dur:6.3, dl:1.2 },
  { x:'75%',s:12, dur:8.1, dl:0.9 }, { x:'82%',s:10, dur:7.4, dl:1.6 },
  { x:'89%',s:11, dur:9.8, dl:0.5 }, { x:'95%',s:9,  dur:6.7, dl:2.0 },
].map(c => ({ ...c, text: Array.from({length:90},()=>_MC[Math.floor(Math.random()*_MC.length)]).join('\n') }));

function MatrixBackground() {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', background:'#000' }}>
      {MATRIX_COLS.map((c, i) => (
        <div key={i} style={{
          position:'absolute', left:c.x, top:0,
          fontFamily:'monospace', fontSize:c.s, lineHeight:1.35,
          color:'rgba(0,255,65,0.65)', textShadow:'0 0 4px rgba(0,255,65,0.4)',
          whiteSpace:'pre', userSelect:'none', pointerEvents:'none',
          animation:`matrixColScroll ${c.dur}s ${c.dl}s linear infinite`,
        }}>{c.text}</div>
      ))}
      {/* Glow central */}
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,255,65,0.04) 0%, transparent 70%)' }} />
    </div>
  );
}

function MatrixEffects() {
  const [msg, setMsg] = React.useState<string|null>(null);
  const MSGS = ['FOLLOW THE WHITE RABBIT','THE MATRIX HAS YOU','WAKE UP, NEO.','SEARCHING...','HACK THE SYSTEM','THERE IS NO SPOON'];
  React.useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const s = (first: boolean) => {
      t = setTimeout(() => {
        setMsg(MSGS[Math.floor(Math.random() * MSGS.length)]);
        setTimeout(() => setMsg(null), 4200);
        s(false);
      }, first ? 12000 : 22000 + Math.random() * 20000);
    };
    s(true);
    return () => clearTimeout(t);
  }, []);
  return msg ? (
    <div style={{
      position:'fixed', top:22, left:'50%', zIndex:20, pointerEvents:'none',
      fontFamily:'monospace', fontSize:13, fontWeight:900, letterSpacing:'0.2em',
      color:'#00ff41', textShadow:'0 0 16px rgba(0,255,65,0.9)',
      animation:'matrixMsg 4.2s ease-out forwards',
    }}>{`> ${msg}`}</div>
  ) : null;
}

/* ════════════════════════════════════════════════════════════════════════
   AMONG US
════════════════════════════════════════════════════════════════════════ */
const CREW_COLORS = ['#c51111','#132ed1','#117f2d','#ed54ba','#ef7d0e','#f5f557','#6b2fbb','#71491e'];

function AmongUsBackground() {
  const stars = React.useMemo(() => Array.from({length:55},(_,i) => ({
    x: (i*7.3+3.2)%100, y: (i*11.7+5.1)%100,
    r: i%5===0?1.2:0.55, op:0.25+(i%7)*0.08,
  })), []);
  return (
    <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', background:'linear-gradient(180deg,#06060f 0%,#0a0a1e 100%)' }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ position:'absolute', inset:0 }}>
        {stars.map((s,i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={s.op}/>)}
        <ellipse cx="78" cy="22" rx="18" ry="12" fill="rgba(19,46,209,0.05)"/>
        <ellipse cx="18" cy="72" rx="14" ry="10" fill="rgba(197,17,17,0.04)"/>
      </svg>
      {/* Vent shape subtle */}
      <svg width="60" height="30" viewBox="0 0 60 30" style={{ position:'absolute', bottom:12, right:80, opacity:0.07 }}>
        <path d="M5,25 Q30,5 55,25" stroke="#132ed1" strokeWidth="2" fill="none"/>
        <line x1="30" y1="5" x2="30" y2="25" stroke="#132ed1" strokeWidth="1.5"/>
      </svg>
    </div>
  );
}

function AmongUsEffects() {
  const [crewVisible, setCrewVisible] = React.useState(false);
  const [impostor, setImpostor]       = React.useState(false);
  const crewRef  = React.useRef<HTMLDivElement>(null);
  const animRef  = React.useRef<number>(0);
  const crewData = React.useRef<{ x:number; dir:1|-1; bottom:number; color:string } | null>(null);

  const launchCrew = React.useCallback((dir: 1|-1) => {
    cancelAnimationFrame(animRef.current);
    const color = CREW_COLORS[Math.floor(Math.random() * CREW_COLORS.length)];
    const startX = dir === 1 ? -45 : window.innerWidth + 45;
    crewData.current = { x: startX, dir, bottom: 8 + Math.floor(Math.random() * 20), color };
    setCrewVisible(true);
    const speed = (window.innerWidth + 150) / 5500;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - last, 50); last = now;
      const cd = crewData.current; if (!cd) return;
      cd.x += cd.dir * speed * dt;
      const el = crewRef.current;
      if (el) el.style.setProperty('--crx', `${cd.x}px`);
      const off = cd.dir === 1 ? cd.x > window.innerWidth + 46 : cd.x < -46;
      if (off) { setCrewVisible(false); crewData.current = null; return; }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  }, []);

  React.useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const s = (first: boolean) => {
      t = setTimeout(() => { launchCrew(Math.random()>.5?1:-1); s(false); }, first ? 14000 : 22000 + Math.random() * 20000);
    };
    s(true);
    return () => { clearTimeout(t); cancelAnimationFrame(animRef.current); };
  }, [launchCrew]);

  React.useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const s = (first: boolean) => {
      t = setTimeout(() => {
        setImpostor(true); setTimeout(() => setImpostor(false), 4000); s(false);
      }, first ? 25000 : 35000 + Math.random() * 25000);
    };
    s(true);
    return () => clearTimeout(t);
  }, []);

  const color = crewData.current?.color ?? '#132ed1';
  return (
    <>
      {crewVisible && (
        <div ref={crewRef} style={{
          position:'fixed', zIndex:15, bottom:`${crewData.current?.bottom ?? 10}%`,
          left:'var(--crx,-45px)', '--crx':`${crewData.current?.x ?? -45}px`,
          pointerEvents:'none', animation:'crewmateWalk 0.4s ease-in-out infinite',
        } as React.CSSProperties}>
          <svg width="34" height="44" viewBox="0 0 34 44">
            <ellipse cx="17" cy="30" rx="13" ry="12" fill={color} stroke="#111" strokeWidth="1.2"/>
            <circle cx="17" cy="13" r="11" fill={color} stroke="#111" strokeWidth="1.2"/>
            <path d="M9,10 Q17,4 25,10 Q25,17 17,18 Q9,17 9,10Z" fill="#8cb4e0" opacity="0.92"/>
            <rect x="26" y="22" width="6" height="9" rx="2" fill={color} stroke="#111" strokeWidth="1"/>
            <rect x="9"  y="40" width="6" height="4" rx="2" fill={color} stroke="#111" strokeWidth="1"/>
            <rect x="19" y="40" width="6" height="4" rx="2" fill={color} stroke="#111" strokeWidth="1"/>
          </svg>
        </div>
      )}
      {impostor && (
        <div style={{
          position:'fixed', top:16, left:'50%', zIndex:20, pointerEvents:'none',
          background:'#8b0000', border:'2px solid #ff3030',
          padding:'8px 24px', letterSpacing:'0.18em',
          fontWeight:900, fontSize:13, color:'#fff',
          textShadow:'0 0 10px rgba(255,80,80,0.8)',
          boxShadow:'0 0 20px rgba(255,0,0,0.3)',
          animation:'impostorAlert 4s ease-out forwards',
        }}>🔴 IMPOSTOR AMONG US 🔴</div>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   POKÉMON
════════════════════════════════════════════════════════════════════════ */
const WILD_POKEMON = ['⭐ Pikachu','🌿 Bulbasaur','🔥 Charmander','💧 Squirtle','🌙 Eevee','🌀 Gengar','💎 Clefairy','🐉 Dratini'];

function PokemonBackground() {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', background:'linear-gradient(180deg,#08112a 0%,#0d1e3e 60%,#0a1428 100%)' }}>
      {/* Stars */}
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ position:'absolute', inset:0, opacity:0.7 }}>
        {Array.from({length:40},(_,i) => ({
          x:(i*6.1+2.3)%100, y:(i*9.7+4.5)%100, r:i%6===0?0.9:0.45,
        })).map((s,i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={0.2+(i%5)*0.1}/>)}
      </svg>
      {/* Pokéball silhouette no canto */}
      <svg width="120" height="120" viewBox="0 0 36 36" style={{ position:'absolute', bottom:-20, right:-20, opacity:0.06 }}>
        <circle cx="18" cy="18" r="17" fill="#EE1515" stroke="#fff" strokeWidth="1"/>
        <path d="M1,18 A17,17 0 0,0 35,18 Z" fill="#fff"/>
        <line x1="1" y1="18" x2="35" y2="18" stroke="#111" strokeWidth="1.5"/>
        <circle cx="18" cy="18" r="5" fill="#fff" stroke="#111" strokeWidth="1.5"/>
      </svg>
      {/* Silhueta de grama */}
      <svg width="100%" height="60" viewBox="0 0 100 20" preserveAspectRatio="none" style={{ position:'absolute', bottom:0, opacity:0.15 }}>
        {Array.from({length:30},(_,i) => (
          <line key={i} x1={i*3.5} y1={20} x2={i*3.5+(i%3-1)*1.2} y2={20-(8+i%5*2)} stroke="#2a7a30" strokeWidth="0.8"/>
        ))}
      </svg>
    </div>
  );
}

function PokemonEffects() {
  const [pokeVisible, setPokeVisible] = React.useState(false);
  const [wild, setWild]               = React.useState<string|null>(null);
  const pokeRef  = React.useRef<HTMLDivElement>(null);
  const animRef  = React.useRef<number>(0);
  const pokeData = React.useRef<{ x:number; dir:1|-1; bottom:number; rotation:number } | null>(null);

  const launchPoke = React.useCallback((dir: 1|-1) => {
    cancelAnimationFrame(animRef.current);
    const startX = dir === 1 ? -44 : window.innerWidth + 44;
    pokeData.current = { x: startX, dir, bottom: 8 + Math.floor(Math.random() * 20), rotation: 0 };
    setPokeVisible(true);
    const speed = (window.innerWidth + 160) / 6500;
    const rotSpeed = 720 / 6500;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - last, 50); last = now;
      const pd = pokeData.current; if (!pd) return;
      pd.x += pd.dir * speed * dt;
      pd.rotation += pd.dir * rotSpeed * dt;
      const el = pokeRef.current;
      if (el) {
        el.style.setProperty('--pkx', `${pd.x}px`);
        el.style.transform = `rotate(${pd.rotation}deg)`;
      }
      const off = pd.dir === 1 ? pd.x > window.innerWidth + 45 : pd.x < -45;
      if (off) { setPokeVisible(false); pokeData.current = null; return; }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  }, []);

  React.useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const s = (first: boolean) => {
      t = setTimeout(() => { launchPoke(Math.random()>.5?1:-1); s(false); }, first ? 12000 : 20000 + Math.random() * 18000);
    };
    s(true);
    return () => { clearTimeout(t); cancelAnimationFrame(animRef.current); };
  }, [launchPoke]);

  React.useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const s = (first: boolean) => {
      t = setTimeout(() => {
        setWild(WILD_POKEMON[Math.floor(Math.random() * WILD_POKEMON.length)]);
        setTimeout(() => setWild(null), 4000);
        s(false);
      }, first ? 20000 : 28000 + Math.random() * 22000);
    };
    s(true);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {pokeVisible && (
        <div ref={pokeRef} style={{
          position:'fixed', zIndex:15, bottom:`${pokeData.current?.bottom ?? 10}%`,
          left:'var(--pkx,-44px)', '--pkx':`${pokeData.current?.x ?? -44}px`,
          pointerEvents:'none', willChange:'transform',
        } as React.CSSProperties}>
          <svg width="38" height="38" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="17" fill="#EE1515" stroke="#222" strokeWidth="1.5"/>
            <path d="M1,18 A17,17 0 0,0 35,18 Z" fill="#fff" stroke="#222" strokeWidth="1"/>
            <line x1="1" y1="18" x2="35" y2="18" stroke="#222" strokeWidth="1.5"/>
            <circle cx="18" cy="18" r="5.5" fill="#fff" stroke="#222" strokeWidth="1.5"/>
            <circle cx="18" cy="18" r="2.5" fill="#f0f0f0" stroke="#888" strokeWidth="1"/>
          </svg>
        </div>
      )}
      {wild && (
        <div style={{
          position:'fixed', top:22, left:'50%', zIndex:20, pointerEvents:'none',
          background:'#0d1e3e', border:'3px solid #EE1515', borderRadius:4,
          padding:'8px 20px', letterSpacing:'0.1em',
          fontWeight:900, fontSize:12, color:'#FFDE00',
          boxShadow:'0 0 0 1px rgba(238,21,21,0.3), 3px 3px 0 rgba(0,0,0,0.5)',
          animation:'wildPokemonAnim 4s ease-out forwards',
        }}>A wild {wild} appeared!</div>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   HOLLOW KNIGHT
════════════════════════════════════════════════════════════════════════ */
function HollowKnightBackground() {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', background:'#060709' }}>
      {/* Stalactites + cave ceiling */}
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ position:'absolute', inset:0 }}>
        {/* Stalactites from ceiling */}
        {([[4,0,3.5,14],[10,0,2.5,9],[18,0,4,18],[27,0,3,12],[35,0,4.5,22],[45,0,2.5,10],[54,0,3.5,16],[63,0,4,20],[72,0,3,11],[81,0,4.5,19],[89,0,3,13],[95,0,2.5,8]] as [number,number,number,number][]).map(([x,y,w,h], i) => (
          <polygon key={i} points={`${x},${y} ${x+w},${y} ${x+w/2},${y+h}`} fill="#0c0f14" opacity="0.95"/>
        ))}
        {/* Secondary smaller stalactites */}
        {([[7,0,1.8,6],[14,0,2,8],[23,0,1.5,5],[31,0,2.5,10],[40,0,1.8,7],[50,0,2,9],[58,0,1.5,5],[68,0,2,8],[77,0,1.8,6],[85,0,2.5,10],[92,0,1.5,5]] as [number,number,number,number][]).map(([x,y,w,h], i) => (
          <polygon key={i+20} points={`${x},${y} ${x+w},${y} ${x+w/2},${y+h}`} fill="#0e1218" opacity="0.8"/>
        ))}
        {/* Soul vessel glow from center-bottom */}
        <defs>
          <radialGradient id="soulGlow" cx="50%" cy="80%" r="40%">
            <stop offset="0%" stopColor="#c5e8f0" stopOpacity="0.06"/>
            <stop offset="60%" stopColor="#8ab4d0" stopOpacity="0.02"/>
            <stop offset="100%" stopColor="#c5e8f0" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill="url(#soulGlow)"/>
        {/* Stone wall cracks */}
        <g stroke="#c5e8f0" strokeWidth="0.18" fill="none" opacity="0.06">
          <path d="M2,35 L5,42 L3,50"/>
          <path d="M96,28 L93,38 L95,48"/>
          <path d="M12,80 L15,88 L13,95"/>
          <path d="M85,75 L82,85 L84,92"/>
        </g>
        {/* Runic marks (Hallownest language feel) */}
        <g fill="#c5e8f0" opacity="0.035" fontFamily="monospace" fontSize="3.5">
          <text x="5" y="62">⚬ ─ ⚬</text>
          <text x="88" y="55">⚬ ─ ⚬</text>
          <text x="46" y="90">─ ⚬ ─</text>
        </g>
      </svg>
      {/* Dark cave ambient vignette */}
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 70% 65% at 50% 55%, transparent 20%, rgba(0,0,0,0.78) 100%)' }} />
      {/* Subtle ground mist */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'20%', background:'linear-gradient(0deg, rgba(10,14,20,0.5) 0%, transparent 100%)' }} />
    </div>
  );
}

function HollowKnightEffects() {
  const [souls, setSouls]         = React.useState<{ id:number; left:number; size:number }[]>([]);
  const [geos, setGeos]           = React.useState<{ id:number; left:number }[]>([]);
  const [knightVisible, setKnight] = React.useState(false);
  const [msg, setMsg]             = React.useState<string|null>(null);
  const knightRef  = React.useRef<HTMLDivElement>(null);
  const knightData = React.useRef<{ x:number; dir:1|-1; bottom:number } | null>(null);
  const animRef    = React.useRef<number>(0);

  /* soul orbs floating up */
  React.useEffect(() => {
    let t: ReturnType<typeof setTimeout>; let uid = 0;
    const s = () => {
      t = setTimeout(() => {
        const id = uid++;
        setSouls(sl => [...sl, { id, left: 10 + Math.random() * 80, size: 7 + Math.random() * 9 }]);
        setTimeout(() => setSouls(sl => sl.filter(x => x.id !== id)), 4800);
        s();
      }, 1400 + Math.random() * 1800);
    };
    s();
    return () => clearTimeout(t);
  }, []);

  /* geo coins dropping */
  React.useEffect(() => {
    let t: ReturnType<typeof setTimeout>; let uid = 0;
    const s = (first: boolean) => {
      t = setTimeout(() => {
        const id = uid++;
        setGeos(g => [...g, { id, left: 8 + Math.random() * 84 }]);
        setTimeout(() => setGeos(g => g.filter(x => x.id !== id)), 3200);
        s(false);
      }, first ? 9000 : 14000 + Math.random() * 16000);
    };
    s(true);
    return () => clearTimeout(t);
  }, []);

  /* The Knight traversal */
  const launchKnight = React.useCallback((dir: 1|-1) => {
    cancelAnimationFrame(animRef.current);
    const startX = dir === 1 ? -60 : window.innerWidth + 60;
    knightData.current = { x: startX, dir, bottom: 8 + Math.floor(Math.random() * 18) };
    setKnight(true);
    const speed = (window.innerWidth + 180) / 7500;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - last, 50); last = now;
      const kd = knightData.current; if (!kd) return;
      kd.x += kd.dir * speed * dt;
      const el = knightRef.current;
      if (el) el.style.setProperty('--knx', `${kd.x}px`);
      const off = kd.dir === 1 ? kd.x > window.innerWidth + 61 : kd.x < -61;
      if (off) { setKnight(false); knightData.current = null; return; }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  }, []);

  React.useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const s = (first: boolean) => {
      t = setTimeout(() => { launchKnight(Math.random() > 0.5 ? 1 : -1); s(false); },
        first ? 12000 : 24000 + Math.random() * 20000);
    };
    s(true);
    return () => { clearTimeout(t); cancelAnimationFrame(animRef.current); };
  }, [launchKnight]);

  /* HK notifications */
  React.useEffect(() => {
    const MSGS = ['DREAM NAIL', 'SHADE SOUL', 'VESSEL FILLED', "KING'S SOUL", 'HALLOWNEST RISES', 'FOCUS'];
    let t: ReturnType<typeof setTimeout>;
    const s = (first: boolean) => {
      t = setTimeout(() => {
        setMsg(MSGS[Math.floor(Math.random() * MSGS.length)]);
        setTimeout(() => setMsg(null), 4200);
        s(false);
      }, first ? 18000 : 28000 + Math.random() * 24000);
    };
    s(true);
    return () => clearTimeout(t);
  }, []);

  const kDir = knightData.current?.dir ?? 1;
  return (
    <>
      {/* Soul orbs */}
      {souls.map(s => (
        <div key={s.id} style={{
          position:'fixed', bottom:'18%', left:`${s.left}%`,
          zIndex:14, pointerEvents:'none',
          width:s.size, height:s.size, borderRadius:'50%',
          background:'radial-gradient(circle, #ffffff 0%, #c5e8f0 45%, rgba(100,180,220,0.3) 100%)',
          boxShadow:`0 0 ${s.size*1.8}px rgba(197,232,240,0.85), 0 0 ${s.size*0.6}px rgba(255,255,255,0.9)`,
          animation:'soulOrbFloat 4.5s ease-out forwards',
        }}/>
      ))}
      {/* Geo coins */}
      {geos.map(g => (
        <div key={g.id} style={{
          position:'fixed', top:'-16px', left:`${g.left}%`,
          zIndex:14, pointerEvents:'none',
          animation:'geoFall 3s ease-in forwards',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16">
            <polygon points="8,0 16,8 8,16 0,8" fill="#e8d870" stroke="#b8a840" strokeWidth="1"/>
            <polygon points="8,3 13,8 8,13 3,8" fill="#f4ec98" opacity="0.55"/>
            <circle cx="8" cy="8" r="2" fill="#f8f4b8" opacity="0.4"/>
          </svg>
        </div>
      ))}
      {/* The Knight */}
      {knightVisible && (
        <div
          ref={knightRef}
          style={{
            position:'fixed', zIndex:15, bottom:`${knightData.current?.bottom ?? 10}%`,
            left:'var(--knx,-60px)', '--knx':`${knightData.current?.x ?? -60}px`,
            pointerEvents:'none',
            transform: kDir === -1 ? 'scaleX(-1)' : 'none',
            filter:'drop-shadow(0 0 6px rgba(197,232,240,0.4))',
          } as React.CSSProperties}
        >
          <svg width="38" height="56" viewBox="0 0 38 56">
            {/* Cape behind body */}
            <path d="M14,22 Q4,30 6,48 L13,42 L14,32Z" fill="#7aaccb" opacity="0.88"/>
            <path d="M24,22 Q34,30 32,48 L25,42 L24,32Z" fill="#7aaccb" opacity="0.88"/>
            {/* Body */}
            <rect x="13" y="19" width="12" height="15" rx="3" fill="#d4e8f4"/>
            {/* Head oval */}
            <ellipse cx="19" cy="11" rx="8.5" ry="9.5" fill="#d4e8f4"/>
            {/* Horns */}
            <path d="M12,5 Q10,0 7,0 Q9,2 11,6Z" fill="#d4e8f4"/>
            <path d="M26,5 Q28,0 31,0 Q29,2 27,6Z" fill="#d4e8f4"/>
            {/* Glowing eyes */}
            <ellipse cx="15" cy="11" rx="2.5" ry="3" fill="#9ed0ec"/>
            <ellipse cx="23" cy="11" rx="2.5" ry="3" fill="#9ed0ec"/>
            {/* Nail pointing right */}
            <line x1="24" y1="28" x2="46" y2="28" stroke="#d4e8f4" strokeWidth="2.8" strokeLinecap="round"/>
            <polygon points="46,28 43,25.5 43,30.5" fill="#c0dcf0"/>
            <line x1="22" y1="24" x2="22" y2="32" stroke="#9ab8d0" strokeWidth="2.2" strokeLinecap="round"/>
            {/* Legs */}
            <rect x="14" y="34" width="4.5" height="16" rx="2.2" fill="#d4e8f4"/>
            <rect x="19.5" y="34" width="4.5" height="16" rx="2.2" fill="#d4e8f4"/>
            {/* Feet */}
            <ellipse cx="15.5" cy="51" rx="5.5" ry="2.5" fill="#aac8e0"/>
            <ellipse cx="22.5" cy="51" rx="5.5" ry="2.5" fill="#aac8e0"/>
          </svg>
        </div>
      )}
      {/* Notification */}
      {msg && (
        <div style={{
          position:'fixed', top:24, left:'50%', zIndex:20, pointerEvents:'none',
          fontFamily:'monospace', fontSize:12, fontWeight:900, letterSpacing:'0.22em',
          color:'#c5e8f0', textShadow:'0 0 14px rgba(197,232,240,0.95), 0 0 28px rgba(197,232,240,0.5)',
          animation:'hkNotif 4.2s ease-out forwards',
        }}>{msg}</div>
      )}
    </>
  );
}

/* ── App ─────────────────────────────────────────────────────────────────── */

const App: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { tooltipState, handleMouseEnter, handleMouseMove, handleMouseLeave } = useTooltip();
  const { recentIds, addRecent } = useRecentTools();
  const { trackClick, popularIds, hasEnoughData } = usePopularTools();
  const { mode: viewMode, toggleMode: toggleViewMode } = useViewMode();

  /* ── Página atual ────────────────────────────────────────────────────── */
  const [currentPage, setCurrentPage] = useState<'hub' | 'roadmaps' | 'suporte' | 'professor' | 'maker' | 'noticias' | 'desafios'>(() => {
    if (window.location.hash === '#roadmaps') return 'roadmaps';
    if (window.location.hash === '#suporte')  return 'suporte';
    if (window.location.hash === '#maker')    return 'maker';
    if (window.location.hash === '#noticias') return 'noticias';
    if (window.location.hash === '#desafios') return 'desafios';
    // #professor nunca restaura via hash — requer autenticação sempre
    return 'hub';
  });

  const [showProfessorModal, setShowProfessorModal] = useState(false);

  /* ── Cosmético ativo ──────────────────────────────────────────────── */
  const [activeCosmetic, setActiveCosmetic] = useState<CosmeticDef | null>(() => {
    const id = getActiveCosmeticId();
    return id ? (COSMETICS.find(c => c.id === id) ?? null) : null;
  });

  useEffect(() => {
    const id = getActiveCosmeticId();
    setActiveCosmetic(id ? (COSMETICS.find(c => c.id === id) ?? null) : null);
  }, [currentPage]);

  /* Aplica/remove classes de tema no <html> */
  useEffect(() => {
    const root = document.documentElement;
    const ALL = ['theme-copa','theme-fallout-nv','theme-csgo-16','theme-minecraft','theme-dark-souls','theme-matrix','theme-among-us','theme-pokemon','theme-hollow-knight'];
    root.classList.remove(...ALL);
    if (activeCosmetic?.id === 'copa-2026')      root.classList.add('theme-copa');
    if (activeCosmetic?.id === 'fallout-nv')     root.classList.add('theme-fallout-nv');
    if (activeCosmetic?.id === 'csgo-16')        root.classList.add('theme-csgo-16');
    if (activeCosmetic?.id === 'minecraft')      root.classList.add('theme-minecraft');
    if (activeCosmetic?.id === 'dark-souls')     root.classList.add('theme-dark-souls');
    if (activeCosmetic?.id === 'matrix')         root.classList.add('theme-matrix');
    if (activeCosmetic?.id === 'among-us')       root.classList.add('theme-among-us');
    if (activeCosmetic?.id === 'pokemon')        root.classList.add('theme-pokemon');
    if (activeCosmetic?.id === 'hollow-knight')  root.classList.add('theme-hollow-knight');
    return () => root.classList.remove(...ALL);
  }, [activeCosmetic]);

  const handleCloseProfessorModal = useCallback(() => setShowProfessorModal(false), []);
  const handleProfessorSuccess    = useCallback(() => {
    setShowProfessorModal(false);
    setCurrentPage('professor');
  }, []);

  /* ── Sincroniza hash da URL com currentPage ───────────────────────────── */
  useEffect(() => {
    if (currentPage === 'roadmaps') {
      window.location.hash = 'roadmaps';
    } else if (currentPage === 'suporte') {
      window.location.hash = 'suporte';
    } else if (currentPage === 'maker') {
      window.location.hash = 'maker';
    } else if (currentPage === 'noticias') {
      window.location.hash = 'noticias';
    } else if (currentPage === 'desafios') {
      window.location.hash = 'desafios';
    } else {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, [currentPage]);

  /* ── Sincroniza currentPage com o botão Voltar do browser ────────────── */
  useEffect(() => {
    const handlePopstate = () => {
      const hash = window.location.hash;
      if (hash === '#roadmaps')       setCurrentPage('roadmaps');
      else if (hash === '#suporte')   setCurrentPage('suporte');
      else if (hash === '#maker')     setCurrentPage('maker');
      else if (hash === '#noticias')  setCurrentPage('noticias');
      else if (hash === '#desafios')  setCurrentPage('desafios');
      else setCurrentPage('hub');
    };
    window.addEventListener('popstate', handlePopstate);
    return () => window.removeEventListener('popstate', handlePopstate);
  }, []);

  /* Estado da URL */
  const [searchQuery, setSearchQuery] = useState(() =>
    new URLSearchParams(window.location.search).get('q') ?? ''
  );
  const [activeCategory, setActiveCategory] = useState<Category>(() => {
    const c = new URLSearchParams(window.location.search).get('c') as Category;
    return VALID_CATEGORY_IDS.includes(c) ? c : 'todos';
  });
  const [levelFilter, setLevelFilter] = useState<DifficultyLevel | 'todos'>('todos');
  const [sortOption, setSortOption] = useState<SortOption>('default');

  /* Modal mobile */
  const [modalTool, setModalTool] = useState<Tool | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isTouchDevice = useMemo(detectTouchDevice, []);

  /* Compartilhamento de coleção */
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [sharedCollectionIds, setSharedCollectionIds] = useState<string[] | null>(() => {
    try {
      const col = new URLSearchParams(window.location.search).get('col');
      if (!col) return null;
      const ids = atob(col).split(',').filter(Boolean);
      const valid = ids.filter(id => TOOLS.some(t => t.id === id));
      return valid.length > 0 ? valid : null;
    } catch { return null; }
  });

  /* Toast (cópia de link) */
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('Link copiado! ✓');

  /* Skeleton de transição de categoria */
  const [isTransitioning, setIsTransitioning] = useState(false);

  /* ── URL sync ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeCategory !== 'todos' && !VIRTUAL_CATEGORIES.has(activeCategory)) {
      params.set('c', activeCategory);
    }
    if (searchQuery) params.set('q', searchQuery);
    const qs = params.toString();
    window.history.replaceState(
      null, '',
      qs ? `${window.location.pathname}?${qs}` : window.location.pathname
    );
  }, [activeCategory, searchQuery]);

  /* ── Escape: reseta filtros quando busca está vazia ───────────────────── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !searchQuery) {
        setActiveCategory('todos');
        setLevelFilter('todos');
        setSortOption('default');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [searchQuery]);

  /* ── Filtragem expandida ──────────────────────────────────────────────── */
  const filteredTools = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return TOOLS.filter(tool => {
      const matchesSearch = !q || [
        tool.name,
        tool.tooltip.desc,
        tool.tooltip.usage,
        tool.tooltip.when,
      ].some(text => text.toLowerCase().includes(q));

      const matchesCategory =
        activeCategory === 'todos'     ? true :
        activeCategory === 'favoritos' ? isFavorite(tool.id) :
        activeCategory === 'recentes'  ? recentIds.includes(tool.id) :
        activeCategory === 'populares' ? popularIds.includes(tool.id) :
        activeCategory === 'novos'     ? tool.isNew === true :
        tool.category === activeCategory;

      const matchesLevel = levelFilter === 'todos' || tool.tooltip.level === levelFilter;

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [searchQuery, activeCategory, levelFilter, favorites, recentIds, popularIds]);

  /* ── Se em modo coleção, restringe ao subset compartilhado ─────────────── */
  const collectionFiltered = useMemo(() => {
    if (!sharedCollectionIds) return null;
    const idSet = new Set(sharedCollectionIds);
    return TOOLS.filter(t => idSet.has(t.id));
  }, [sharedCollectionIds]);

  /* ── Ordenação ────────────────────────────────────────────────────────── */
  const sortedTools = useMemo(() => {
    const tools = [...(collectionFiltered ?? filteredTools)];
    switch (sortOption) {
      case 'az':         return tools.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      case 'za':         return tools.sort((a, b) => b.name.localeCompare(a.name, 'pt-BR'));
      case 'level-asc':  return tools.sort((a, b) => LEVEL_ORDER[a.tooltip.level] - LEVEL_ORDER[b.tooltip.level]);
      case 'level-desc': return tools.sort((a, b) => LEVEL_ORDER[b.tooltip.level] - LEVEL_ORDER[a.tooltip.level]);
      default:
        if (activeCategory === 'recentes')  return tools.sort((a, b) => recentIds.indexOf(a.id)  - recentIds.indexOf(b.id));
        if (activeCategory === 'populares') return tools.sort((a, b) => popularIds.indexOf(a.id) - popularIds.indexOf(b.id));
        return tools;
    }
  }, [filteredTools, sortOption, activeCategory, recentIds, popularIds]);

  /* ── Contagens ────────────────────────────────────────────────────────── */
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      todos:     TOOLS.length,
      favoritos: favorites.length,
      recentes:  recentIds.length,
      populares: hasEnoughData ? popularIds.length : 0,
      novos:     TOOLS.filter(t => t.isNew).length,
    };
    CATEGORIES.forEach(cat => {
      if (!VIRTUAL_CATEGORIES.has(cat.id)) {
        counts[cat.id] = TOOLS.filter(t => t.category === cat.id).length;
      }
    });
    return counts;
  }, [favorites, recentIds, popularIds, hasEnoughData]);

  /* ── Handlers ─────────────────────────────────────────────────────────── */

  const handleCategoryChange = (category: Category) => {
    if (category === 'noticias') { setCurrentPage('noticias'); return; }
    if (category === 'robotica') { setCurrentPage('maker');    return; }
    setIsTransitioning(true);
    setActiveCategory(category);
    setSearchQuery('');
    setLevelFilter('todos');
    setSortOption('default');
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleTrack = useCallback((tool: Tool) => {
    addRecent(tool.id);
    trackClick(tool.id);
  }, [addRecent, trackClick]);

  const handleMobileCardClick = useCallback((tool: Tool) => {
    setModalTool(tool);
    setIsModalOpen(true);
  }, []);

  const handleModalOpen = useCallback((tool: Tool) => {
    addRecent(tool.id);
    trackClick(tool.id);
    window.open(tool.url, '_blank', 'noopener,noreferrer');
  }, [addRecent, trackClick]);

  const handleCopy = useCallback((url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setToastMsg('Link copiado! ✓');
      setToastVisible(true);
    }).catch(() => {
      // fallback para browsers antigos
      try {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setToastMsg('Link copiado! ✓');
        setToastVisible(true);
      } catch {
        setToastMsg('Erro ao copiar 😕');
        setToastVisible(true);
      }
    });
  }, []);

  const handleRandomTool = () => {
    const pool =
      activeCategory === 'todos'     ? TOOLS :
      activeCategory === 'recentes'  ? sortedTools :
      activeCategory === 'populares' ? sortedTools :
      activeCategory === 'novos'     ? TOOLS.filter(t => t.isNew) :
      TOOLS.filter(t => t.category === activeCategory);

    if (pool.length === 0) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    addRecent(pick.id);
    trackClick(pick.id);
    window.open(pick.url, '_blank', 'noopener,noreferrer');
  };

  const showLevelFilter = !VIRTUAL_CATEGORIES.has(activeCategory);

  /* ── Render ───────────────────────────────────────────────────────────── */

  /* Roadmaps page */
  if (currentPage === 'roadmaps') {
    return <RoadmapsPage onBackToHub={() => setCurrentPage('hub')} />;
  }

  /* Suporte page */
  if (currentPage === 'suporte') {
    return <SuportePage onBackToHub={() => setCurrentPage('hub')} />;
  }

  /* Professor page */
  if (currentPage === 'professor') {
    return (
      <ProfessorPage
        onBackToHub={() => setCurrentPage('hub')}
        onOpenRoadmaps={() => setCurrentPage('roadmaps')}
      />
    );
  }

  /* Maker/Robótica page */
  if (currentPage === 'maker') {
    return (
      <MakerPage
        onBackToHub={() => setCurrentPage('hub')}
        onOpenRoadmaps={() => setCurrentPage('roadmaps')}
      />
    );
  }

  /* Notícias page */
  if (currentPage === 'noticias') {
    return (
      <NoticiasPage
        onBackToHub={() => setCurrentPage('hub')}
        onOpenRoadmaps={() => setCurrentPage('roadmaps')}
      />
    );
  }

  /* Desafios page */
  if (currentPage === 'desafios') {
    return <DesafiosPage onBackToHub={() => setCurrentPage('hub')} />;
  }

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${activeCosmetic ? '' : 'bg-[#eef2f6] dark:bg-[#0f172a] bg-dot-pattern'}`}
      style={activeCosmetic ? { backgroundColor: isDark ? activeCosmetic.darkBg : activeCosmetic.lightBg } : undefined}
    >
      {/* Backgrounds temáticos */}
      {activeCosmetic?.id === 'copa-2026'     && <PitchBackground />}
      {activeCosmetic?.id === 'fallout-nv'    && <FalloutBackground />}
      {activeCosmetic?.id === 'csgo-16'       && <CSGOBackground />}
      {activeCosmetic?.id === 'minecraft'     && <MinecraftBackground />}
      {activeCosmetic?.id === 'dark-souls'    && <DarkSoulsBackground />}
      {activeCosmetic?.id === 'matrix'        && <MatrixBackground />}
      {activeCosmetic?.id === 'among-us'      && <AmongUsBackground />}
      {activeCosmetic?.id === 'pokemon'       && <PokemonBackground />}
      {activeCosmetic?.id === 'hollow-knight' && <HollowKnightBackground />}

      {/* Efeitos ocasionais */}
      {activeCosmetic?.id === 'copa-2026'     && <CopaSideEffects />}
      {activeCosmetic?.id === 'fallout-nv'    && <FalloutEffects />}
      {activeCosmetic?.id === 'csgo-16'       && <CSGOEffects />}
      {activeCosmetic?.id === 'minecraft'     && <MinecraftEffects />}
      {activeCosmetic?.id === 'dark-souls'    && <DarkSoulsEffects />}
      {activeCosmetic?.id === 'matrix'        && <MatrixEffects />}
      {activeCosmetic?.id === 'among-us'      && <AmongUsEffects />}
      {activeCosmetic?.id === 'pokemon'       && <PokemonEffects />}
      {activeCosmetic?.id === 'hollow-knight' && <HollowKnightEffects />}

      {/* Faixa topo Copa — tricolor */}
      {activeCosmetic?.id === 'copa-2026' && (
        <div style={{ height: 4, display: 'flex', flexShrink: 0, position:'relative', zIndex:10 }}>
          <div style={{ flex: 1, background: '#009C3B' }} />
          <div style={{ flex: 1, background: '#FFD100' }} />
          <div style={{ flex: 1, background: '#002776' }} />
        </div>
      )}
      <Header
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onOpenRoadmaps={() => setCurrentPage('roadmaps')}
        onOpenSuporte={() => setCurrentPage('suporte')}
        onOpenProfessorLogin={() => setShowProfessorModal(true)}
      />

      <main className="flex-1 max-w-[1440px] w-full px-4 md:px-8 py-8 mx-auto relative z-10">

        {/* Banner temático */}
        {activeCosmetic && <CosmeticBanner cosmetic={activeCosmetic} isDark={isDark} />}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          totalVisible={sortedTools.length}
        />

        <CategoryFilter
          active={activeCategory}
          onChange={handleCategoryChange}
          counts={categoryCounts}
        />

        {/* Barra de controles secundários */}
        <div className="flex items-center justify-between mb-6 max-w-5xl mx-auto px-2 gap-3 flex-wrap">

          {/* Filtro de nível */}
          <div className="flex items-center gap-1.5 flex-wrap min-h-[32px]">
            {showLevelFilter && (
              <>
                <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 mr-1 shrink-0">
                  Nível:
                </span>
                {LEVELS.map(level => {
                  const styles = LEVEL_STYLES[level];
                  const isActive = levelFilter === level;
                  return (
                    <button
                      key={level}
                      onClick={() => setLevelFilter(level)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all duration-200
                        ${isActive
                          ? styles.active + ' shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:border-ctrl-blue/30 hover:-translate-y-0.5'
                        }`}
                    >
                      {!isActive && styles.dot && (
                        <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                      )}
                      {level === 'todos' ? 'Todos os níveis' : level}
                    </button>
                  );
                })}
              </>
            )}
          </div>

          {/* Ordenação + Toggle de visão + Aleatório */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">

            {/* Ordenação */}
            <div className="relative flex items-center">
              <ArrowUpDown className="absolute left-2.5 w-3 h-3 text-gray-400 pointer-events-none" />
              <select
                value={sortOption}
                onChange={e => setSortOption(e.target.value as SortOption)}
                title="Ordenar ferramentas"
                className="pl-7 pr-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700 rounded-full hover:border-ctrl-blue/30 focus:outline-none focus:border-ctrl-blue transition-colors cursor-pointer appearance-none"
              >
                <option value="default">Padrão</option>
                <option value="az">A → Z</option>
                <option value="za">Z → A</option>
                <option value="level-asc">Iniciante → Avançado</option>
                <option value="level-desc">Avançado → Iniciante</option>
              </select>
            </div>

            {/* Toggle grade / lista */}
            <button
              onClick={toggleViewMode}
              title={viewMode === 'grid' ? 'Mudar para lista' : 'Mudar para grade'}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:border-ctrl-blue/30 hover:text-ctrl-blue dark:hover:text-blue-400 hover:-translate-y-0.5 transition-all duration-200"
              aria-label={viewMode === 'grid' ? 'Mudar para lista' : 'Mudar para grade'}
            >
              {viewMode === 'grid'
                ? <LayoutList className="w-4 h-4" />
                : <LayoutGrid className="w-4 h-4" />
              }
            </button>

            {/* Ferramenta aleatória */}
            <button
              onClick={handleRandomTool}
              title="Abrir uma ferramenta aleatória"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:border-ctrl-orange/40 hover:text-ctrl-orange hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200"
            >
              <Shuffle className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Me surpreenda</span>
            </button>

            {/* Compartilhar coleção */}
            <button
              onClick={() => setShareModalOpen(true)}
              title="Compartilhar uma coleção de ferramentas"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:border-ctrl-blue/40 hover:text-ctrl-blue hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200"
            >
              <Share2 className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Compartilhar</span>
            </button>
          </div>
        </div>

        {/* Banner de coleção compartilhada */}
        {sharedCollectionIds && (
          <div className="flex items-center justify-between gap-3 mb-4 px-4 py-3 rounded-xl bg-ctrl-blue/5 border-2 border-ctrl-blue/20 dark:bg-blue-900/10 dark:border-blue-800/30 animate-fadeIn">
            <div className="flex items-center gap-2 min-w-0">
              <Share2 className="w-4 h-4 text-ctrl-blue shrink-0" />
              <span className="text-sm font-bold text-ctrl-blue">Coleção compartilhada</span>
              <span className="text-xs text-gray-500 dark:text-slate-400 truncate">
                · {sharedCollectionIds.length} ferramenta{sharedCollectionIds.length !== 1 ? 's' : ''} selecionada{sharedCollectionIds.length !== 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={() => {
                setSharedCollectionIds(null);
                window.history.replaceState(null, '', window.location.pathname);
              }}
              className="flex items-center gap-1 text-xs font-bold text-gray-400 dark:text-slate-500 hover:text-ctrl-blue dark:hover:text-blue-400 transition-colors shrink-0"
            >
              <XIcon className="w-3.5 h-3.5" />
              Sair
            </button>
          </div>
        )}

        {/* Conteúdo principal */}
        {isTransitioning ? (
          viewMode === 'grid'
            ? <SkeletonGrid count={14} />
            : <SkeletonList count={8} />
        ) : sortedTools.length > 0 ? (
          viewMode === 'grid' ? (
            /* ── Modo grade ── */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4">
              {sortedTools.map((tool, index) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  index={index}
                  isFavorite={isFavorite(tool.id)}
                  searchQuery={searchQuery}
                  onToggleFavorite={toggleFavorite}
                  onMouseEnter={handleMouseEnter}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onTrack={handleTrack}
                  onCardClick={isTouchDevice ? handleMobileCardClick : undefined}
                  onCopy={handleCopy}
                  activeTheme={activeCosmetic?.id}
                />
              ))}
            </div>
          ) : (
            /* ── Modo lista ── */
            <div className="space-y-2 max-w-5xl mx-auto">
              {sortedTools.map((tool, index) => (
                <ToolListItem
                  key={tool.id}
                  tool={tool}
                  index={index}
                  isFavorite={isFavorite(tool.id)}
                  searchQuery={searchQuery}
                  onToggleFavorite={toggleFavorite}
                  onTrack={handleTrack}
                  onCardClick={isTouchDevice ? handleMobileCardClick : undefined}
                  onCopy={handleCopy}
                />
              ))}
            </div>
          )
        ) : (
          /* ── Estado vazio ── */
          <div className="flex flex-col items-center justify-center py-24 text-center animate-fadeIn">
            <div className="text-6xl mb-4">
              {activeCategory === 'favoritos' ? '💔' :
               activeCategory === 'recentes'  ? '🕐' :
               activeCategory === 'populares' ? '🔥' :
               activeCategory === 'novos'     ? '✨' :
               searchQuery ? '🔍' : '📭'}
            </div>
            <h3 className="text-xl font-bold text-gray-500 dark:text-slate-400 mb-2">
              {activeCategory === 'favoritos' ? 'Nenhum favorito ainda' :
               activeCategory === 'recentes'  ? 'Nenhuma ferramenta recente' :
               activeCategory === 'populares' ? 'Nenhuma ferramenta popular ainda' :
               activeCategory === 'novos'     ? 'Nenhuma ferramenta nova' :
               'Nada encontrado aqui'}
            </h3>
            <p className="text-gray-400 dark:text-slate-500 text-sm mb-5 max-w-xs">
              {activeCategory === 'favoritos'
                ? 'Clique no ❤️ nos cards para salvar suas ferramentas favoritas.'
               : activeCategory === 'recentes'
                ? 'Abra algumas ferramentas e elas aparecerão aqui.'
               : activeCategory === 'populares'
                ? 'Conforme você usa as ferramentas, as mais acessadas aparecerão aqui.'
               : activeCategory === 'novos'
                ? 'Novas ferramentas aparecerão aqui quando forem adicionadas.'
               : searchQuery
                ? `Não encontramos "${searchQuery}" nessa categoria.`
                : 'Nenhuma ferramenta com este nível de dificuldade aqui.'}
            </p>
            {(searchQuery || levelFilter !== 'todos') && (
              <div className="flex gap-2 flex-wrap justify-center">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 rounded-full text-sm font-bold bg-ctrl-blue text-white hover:bg-ctrl-blue/90 transition-colors"
                  >
                    Limpar busca
                  </button>
                )}
                {levelFilter !== 'todos' && (
                  <button
                    onClick={() => setLevelFilter('todos')}
                    className="px-4 py-2 rounded-full text-sm font-bold bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-2 border-gray-200 dark:border-slate-700 hover:border-ctrl-blue/40 transition-colors"
                  >
                    Remover filtro de nível
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
      <BackToTop />
      <Tooltip state={tooltipState} />
      <FloatingNav
        isDark={isDark}
        onOpenMaker={() => setCurrentPage('maker')}
        onOpenNoticias={() => setCurrentPage('noticias')}
        onOpenDesafios={() => setCurrentPage('desafios')}
      />

      {/* Modal mobile */}
      <MobileToolModal
        tool={modalTool}
        isOpen={isModalOpen}
        isFavorite={modalTool ? isFavorite(modalTool.id) : false}
        onClose={() => setIsModalOpen(false)}
        onToggleFavorite={toggleFavorite}
        onOpen={handleModalOpen}
      />

      {/* Toast de cópia */}
      <Toast
        message={toastMsg}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />

      {/* Modal de acesso ao professor */}
      {showProfessorModal && (
        <PasswordModal
          onSuccess={handleProfessorSuccess}
          onClose={handleCloseProfessorModal}
        />
      )}

      {/* Modal de compartilhamento de coleção */}
      {shareModalOpen && (
        <ShareModal
          isDark={isDark}
          onClose={() => setShareModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
