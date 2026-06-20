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
import CssBattlePage from './pages/CssBattlePage';
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
   DARK SOULS — Forjado nas Cinzas
════════════════════════════════════════════════════════════════════════ */
const ASH_PARTICLES = Array.from({length: 38}, (_, i) => ({
  left: (i * 2.65 + 1.2) % 100,
  size: 1.2 + (i % 4) * 0.5,
  dur:  5.5 + (i % 5) * 0.9,
  delay: -((i * 0.24) % 5.2),
  drift: ((i % 5) - 2) * 22,
}));

const DS_GROUND_MSGS = [
  'Try jumping', 'Amazing chest ahead >>>',
  'Praise the sun  \\o/', 'Be wary of edge',
  "Don't give up, skeleton!", 'Enemy ahead >>>',
  'Here be dragon', 'Seek bonfire ahead',
  'Invaded by phantom', 'Try attacking',
];

function DarkSoulsBackground() {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', background:'#030201' }}>

      {/* Ash particles falling from above */}
      {ASH_PARTICLES.map((p, i) => (
        <div key={i} style={{
          position:'absolute', top:-10, left:`${p.left}%`,
          width:p.size, height:p.size * 1.3, borderRadius:'50%',
          background:'rgba(215,175,130,0.58)',
          animation:`ashFall ${p.dur}s ${p.delay}s linear infinite`,
          '--ash-drift': `${p.drift}px`,
        } as React.CSSProperties}/>
      ))}

      {/* Left crumbling wall */}
      <svg width="200" height="100%" viewBox="0 0 180 700" preserveAspectRatio="none"
        style={{ position:'absolute', left:0, top:0, opacity:0.3 }}>
        <rect width="65" height="700" fill="#0e0804"/>
        {[0,90,180,270,360,450,540,630].map((y, i) => (
          <rect key={i} x={i%2===0?2:6} y={y+3} width={i%2===0?61:55} height={83}
            fill={i%3===0?'#1c1408':'#140f05'} stroke="#060301" strokeWidth="1.5"/>
        ))}
        <path d="M8,100 L8,210 Q33,48 62,210 L62,100" fill="rgba(199,131,42,0.04)"
          stroke="#c7832a" strokeWidth="0.9" opacity="0.4"/>
        <line x1="78" y1="700" x2="68" y2="400" stroke="#1c1208" strokeWidth="7"/>
        <line x1="68" y1="520" x2="36" y2="455" stroke="#1c1208" strokeWidth="4.5"/>
        <line x1="68" y1="485" x2="100" y2="438" stroke="#1c1208" strokeWidth="3.5"/>
        <line x1="36" y1="455" x2="15" y2="415" stroke="#1c1208" strokeWidth="2.8"/>
        <line x1="36" y1="455" x2="52" y2="428" stroke="#1c1208" strokeWidth="2.2"/>
      </svg>

      {/* Right crumbling wall */}
      <svg width="200" height="100%" viewBox="0 0 180 700" preserveAspectRatio="none"
        style={{ position:'absolute', right:0, top:0, opacity:0.3, transform:'scaleX(-1)' }}>
        <rect width="65" height="700" fill="#0e0804"/>
        {[0,90,180,270,360,450,540,630].map((y, i) => (
          <rect key={i} x={i%2===0?2:6} y={y+3} width={i%2===0?61:55} height={83}
            fill={i%3===0?'#1c1408':'#140f05'} stroke="#060301" strokeWidth="1.5"/>
        ))}
        <path d="M8,100 L8,210 Q33,48 62,210 L62,100" fill="rgba(199,131,42,0.04)"
          stroke="#c7832a" strokeWidth="0.9" opacity="0.4"/>
        <line x1="78" y1="700" x2="68" y2="400" stroke="#1c1208" strokeWidth="7"/>
        <line x1="68" y1="520" x2="36" y2="455" stroke="#1c1208" strokeWidth="4.5"/>
        <line x1="68" y1="485" x2="100" y2="438" stroke="#1c1208" strokeWidth="3.5"/>
        <line x1="36" y1="455" x2="15" y2="415" stroke="#1c1208" strokeWidth="2.8"/>
        <line x1="36" y1="455" x2="52" y2="428" stroke="#1c1208" strokeWidth="2.2"/>
      </svg>

      {/* Bonfire ground glow */}
      <div style={{ position:'absolute', inset:0,
        background:'radial-gradient(ellipse 38% 22% at 50% 97%, rgba(199,131,42,0.35) 0%, rgba(140,74,16,0.15) 52%, transparent 72%)' }} />

      {/* Animated bonfire — SVG SMIL flame morphing */}
      <svg width="190" height="230" viewBox="0 0 120 160"
        style={{ position:'absolute', bottom:0, left:'50%', transform:'translateX(-50%)',
          filter:'drop-shadow(0 0 24px rgba(199,131,42,0.7)) drop-shadow(0 0 8px rgba(232,201,122,0.4))' }}>
        <ellipse cx="60" cy="150" rx="32" ry="7" fill="#1c1208"/>
        <line x1="60" y1="28" x2="60" y2="140" stroke="#5a3c14" strokeWidth="5.5"/>
        <line x1="43" y1="90" x2="77" y2="90" stroke="#5a3c14" strokeWidth="4.5"/>
        <rect x="55" y="24" width="10" height="9" rx="2.5" fill="#7a5228"/>
        {/* Outer flame */}
        <path fill="#c7832a" opacity="0.9">
          <animate attributeName="d" dur="0.85s" repeatCount="indefinite" values="
            M60,32 C47,21 41,13 45,2 C48,-5 55,-8 60,-9 C65,-8 72,-5 75,2 C79,13 73,21 60,32Z;
            M60,35 C45,20 39,11 44,0 C47,-7 54,-10 60,-11 C66,-10 73,-7 76,0 C81,11 75,20 60,35Z;
            M60,30 C49,22 43,15 47,5 C50,-2 56,-4 60,-5 C64,-4 70,-2 73,5 C77,15 71,22 60,30Z;
            M60,32 C47,21 41,13 45,2 C48,-5 55,-8 60,-9 C65,-8 72,-5 75,2 C79,13 73,21 60,32Z"/>
        </path>
        {/* Mid flame */}
        <path fill="#e8a035" opacity="0.75">
          <animate attributeName="d" dur="0.65s" repeatCount="indefinite" values="
            M60,30 C53,22 51,16 53,8 C55,3 58,1 60,-1 C62,1 65,3 67,8 C69,16 67,22 60,30Z;
            M60,33 C51,21 49,15 52,6 C54,1 57,-1 60,-3 C63,-1 66,1 68,6 C71,15 69,21 60,33Z;
            M60,28 C55,22 53,17 55,10 C57,5 59,3 60,2 C61,3 63,5 65,10 C67,17 65,22 60,28Z;
            M60,30 C53,22 51,16 53,8 C55,3 58,1 60,-1 C62,1 65,3 67,8 C69,16 67,22 60,30Z"/>
        </path>
        {/* Core */}
        <path fill="#fff4d0" opacity="0.52">
          <animate attributeName="d" dur="0.5s" repeatCount="indefinite" values="
            M60,26 C57,20 57,15 58,11 C59,7 59.5,6 60,5 C60.5,6 61,7 62,11 C63,15 63,20 60,26Z;
            M60,29 C56,19 56,14 57,10 C58,6 59,4 60,3 C61,4 62,6 63,10 C64,14 64,19 60,29Z;
            M60,24 C58,20 58,16 59,13 C60,9 60,8 60,7 C60,8 60,9 61,13 C62,16 62,20 60,24Z;
            M60,26 C57,20 57,15 58,11 C59,7 59.5,6 60,5 C60.5,6 61,7 62,11 C63,15 63,20 60,26Z"/>
        </path>
        <circle cx="47" cy="95" r="2.5" fill="#c7832a" opacity="0.7"/>
        <circle cx="73" cy="100" r="2" fill="#e8c97a" opacity="0.62"/>
        <circle cx="53" cy="112" r="2.2" fill="#c7832a" opacity="0.68"/>
        <circle cx="67" cy="120" r="1.6" fill="#e8c97a" opacity="0.52"/>
      </svg>

      {/* Floor fog */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'28%',
        background:'linear-gradient(0deg, rgba(20,8,2,0.68) 0%, rgba(12,5,1,0.22) 55%, transparent 100%)' }} />
      {/* Vignette */}
      <div style={{ position:'absolute', inset:0,
        background:'radial-gradient(ellipse 78% 70% at 50% 50%, transparent 16%, rgba(0,0,0,0.92) 100%)' }} />
    </div>
  );
}

function DarkSoulsEffects() {
  const [msgs, setMsgs]              = React.useState<{ id:number; left:number; text:string }[]>([]);
  const [soldierVisible, setSoldier] = React.useState(false);
  const [youDied, setYouDied]        = React.useState(false);
  const soldierRef  = React.useRef<HTMLDivElement>(null);
  const soldierData = React.useRef<{ x:number; dir:1|-1 } | null>(null);
  const animRef     = React.useRef<number>(0);

  /* Ground messages — mechânica icônica do DS */
  React.useEffect(() => {
    let t: ReturnType<typeof setTimeout>; let uid = 0;
    const s = (first: boolean) => {
      t = setTimeout(() => {
        const id = uid++;
        const text = DS_GROUND_MSGS[Math.floor(Math.random() * DS_GROUND_MSGS.length)];
        const left = 12 + Math.random() * 58;
        setMsgs(m => [...m, { id, left, text }]);
        setTimeout(() => setMsgs(m => m.filter(x => x.id !== id)), 8800);
        s(false);
      }, first ? 5000 : 15000 + Math.random() * 12000);
    };
    s(true);
    return () => clearTimeout(t);
  }, []);

  /* Hollow soldier walking */
  const launchSoldier = React.useCallback((dir: 1|-1) => {
    cancelAnimationFrame(animRef.current);
    const startX = dir === 1 ? -70 : window.innerWidth + 70;
    soldierData.current = { x: startX, dir };
    setSoldier(true);
    const speed = (window.innerWidth + 200) / 9500;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - last, 50); last = now;
      const sd = soldierData.current; if (!sd) return;
      sd.x += sd.dir * speed * dt;
      const el = soldierRef.current;
      if (el) el.style.setProperty('--sdx', `${sd.x}px`);
      const off = sd.dir === 1 ? sd.x > window.innerWidth + 71 : sd.x < -71;
      if (off) { setSoldier(false); soldierData.current = null; return; }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  }, []);

  React.useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const s = (first: boolean) => {
      t = setTimeout(() => { launchSoldier(Math.random() > 0.5 ? 1 : -1); s(false); },
        first ? 14000 : 28000 + Math.random() * 20000);
    };
    s(true);
    return () => { clearTimeout(t); cancelAnimationFrame(animRef.current); };
  }, [launchSoldier]);

  /* YOU DIED — easter egg ocasional */
  React.useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const s = (first: boolean) => {
      t = setTimeout(() => {
        setYouDied(true);
        setTimeout(() => setYouDied(false), 4600);
        s(false);
      }, first ? 50000 : 90000 + Math.random() * 60000);
    };
    s(true);
    return () => clearTimeout(t);
  }, []);

  const sDir = soldierData.current?.dir ?? 1;
  return (
    <>
      {/* Ground messages */}
      {msgs.map(m => (
        <div key={m.id} style={{
          position:'fixed', bottom:'14%', left:`${m.left}%`,
          zIndex:16, pointerEvents:'none',
          animation:'groundMsgAppear 8.8s ease-out forwards',
        }}>
          <div style={{
            background:'rgba(16,10,3,0.94)',
            border:'1px solid rgba(199,131,42,0.52)',
            borderBottom:'2px solid rgba(199,131,42,0.7)',
            padding:'5px 14px 6px',
            fontFamily:'monospace', fontSize:11, fontWeight:700,
            color:'#c7832a', letterSpacing:'0.1em',
            textShadow:'0 0 10px rgba(199,131,42,0.75)',
            whiteSpace:'nowrap',
            boxShadow:'0 0 18px rgba(199,131,42,0.18), inset 0 0 24px rgba(199,131,42,0.06)',
          }}>{m.text}</div>
        </div>
      ))}

      {/* Hollow soldier com armadura e animação de caminhada */}
      {soldierVisible && (
        <div
          ref={soldierRef}
          style={{
            position:'fixed', zIndex:15, bottom:'12%',
            left:'var(--sdx,-70px)', '--sdx':`${soldierData.current?.x ?? -70}px`,
            pointerEvents:'none',
            transform: sDir === -1 ? 'scaleX(-1)' : 'none',
          } as React.CSSProperties}
        >
          <svg width="52" height="76" viewBox="0 0 52 76">
            {/* Body com bob */}
            <g style={{ animation:'dsBody 0.68s ease-in-out infinite' }}>
              {/* Escudo */}
              <ellipse cx="7" cy="37" rx="6.5" ry="9.5" fill="#5c4222" stroke="#3a2810" strokeWidth="1.3"/>
              <ellipse cx="7" cy="37" rx="4" ry="6.5" fill="#6e5030" opacity="0.65"/>
              <line x1="7" y1="28" x2="7" y2="46" stroke="#7a6040" strokeWidth="0.9" opacity="0.5"/>
              <line x1="2" y1="37" x2="12" y2="37" stroke="#7a6040" strokeWidth="0.9" opacity="0.5"/>
              {/* Surcoat */}
              <rect x="16" y="23" width="18" height="28" rx="2.5" fill="#2e2218"/>
              {/* Hem rasgado */}
              <path d="M16,51 L18,56 L20,51 L22,56 L24,51 L26,56 L28,51 L30,56 L32,52 L34,51 L34,54 L16,54Z" fill="#2e2218"/>
              {/* Elmo */}
              <ellipse cx="25" cy="14" rx="11" ry="11.5" fill="#4a4035"/>
              {/* Proteções laterais */}
              <path d="M14.5,18 L14,25 Q14,27 16,27 L16,25Z" fill="#3e3428"/>
              <path d="M35.5,18 L36,25 Q36,27 34,27 L34,25Z" fill="#3e3428"/>
              {/* Viseira */}
              <rect x="17" y="13" width="16" height="5" rx="1.8" fill="#100d08"/>
              {/* Crest */}
              <path d="M15,11 Q25,6 35,11" stroke="#5a5040" strokeWidth="1.5" fill="none"/>
              {/* Gola */}
              <rect x="18" y="23" width="14" height="5" rx="1" fill="#382c1c"/>
              {/* Braço da espada */}
              <rect x="34" y="20" width="5.5" height="24" rx="2.5" fill="#2e2218"/>
              {/* Espada */}
              <line x1="40" y1="9" x2="40" y2="45" stroke="#706858" strokeWidth="3.2" strokeLinecap="round"/>
              <line x1="36" y1="27" x2="44" y2="27" stroke="#706858" strokeWidth="2.8" strokeLinecap="round"/>
              <rect x="37.5" y="6.5" width="5" height="6" rx="1.5" fill="#8a7860"/>
              <line x1="40" y1="10" x2="40" y2="23" stroke="rgba(200,190,170,0.35)" strokeWidth="1" strokeLinecap="round"/>
            </g>
            {/* Perna esquerda */}
            <g style={{ transformBox:'fill-box', transformOrigin:'50% 0%', animation:'dsLeg 0.68s ease-in-out infinite' }}>
              <rect x="17" y="51" width="8" height="20" rx="3.5" fill="#26200e"/>
              <rect x="15.5" y="68" width="10.5" height="6" rx="2" fill="#1c1808"/>
            </g>
            {/* Perna direita */}
            <g style={{ transformBox:'fill-box', transformOrigin:'50% 0%', animation:'dsLeg 0.68s ease-in-out infinite reverse' }}>
              <rect x="27" y="51" width="8" height="20" rx="3.5" fill="#26200e"/>
              <rect x="25.5" y="68" width="10.5" height="6" rx="2" fill="#1c1808"/>
            </g>
          </svg>
        </div>
      )}

      {/* YOU DIED */}
      {youDied && (
        <div style={{
          position:'fixed', inset:0, zIndex:50, pointerEvents:'none',
          display:'flex', alignItems:'center', justifyContent:'center',
          animation:'youDiedOverlay 4.6s ease-out forwards',
        }}>
          <div style={{
            fontFamily:'Georgia, "Times New Roman", serif',
            fontSize:'clamp(38px, 7.5vw, 78px)',
            fontWeight:400, color:'#c0392b',
            letterSpacing:'0.14em',
            animation:'youDiedText 4.6s ease-out forwards',
            textShadow:'0 0 30px rgba(192,57,43,0.85), 0 0 60px rgba(192,57,43,0.45)',
          }}>YOU DIED</div>
        </div>
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
   HOLLOW KNIGHT — City of Tears / Hallownest
════════════════════════════════════════════════════════════════════════ */
const HK_STALACTITES: Array<[number,number,number,number]> = [
  [3,0,3.5,14],[9,0,2.5,9],[17,0,4,18],[26,0,3,12],[34,0,4.5,22],[44,0,2.5,10],
  [53,0,3.5,16],[62,0,4,20],[71,0,3,11],[80,0,4.5,19],[88,0,3,13],[94,0,2.5,8],
  [6,0,2,7],[13,0,1.8,5],[21,0,2.5,10],[30,0,2,8],[38,0,2,9],[48,0,1.8,6],
  [57,0,2,7],[67,0,2.5,11],[75,0,1.8,6],[84,0,2,8],[91,0,1.5,5],
];

const HK_RAIN = Array.from({length: 65}, (_, i) => ({
  left:  (i * 1.556 + 0.5) % 100,
  dur:   0.5 + (i % 6) * 0.068,
  delay: -((i * 0.038) % 1.8),
  height: 12 + (i % 4) * 6,
  opacity: 0.17 + (i % 4) * 0.055,
  width: i % 5 === 0 ? 2.2 : 1.3,
}));

const LUMAFLIES_DATA = Array.from({length: 12}, (_, i) => ({
  x:    (i * 7.8 + 5.2) % 88 + 4,
  y:    (i * 5.6 + 12)  % 65 + 10,
  dur:  3.2 + (i % 5) * 0.55,
  delay: (i * 0.38) % 2.8,
  size: 3.5 + (i % 3) * 1.6,
}));

function HollowKnightBackground() {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', background:'#050608' }}>

      {/* City of Tears — chuva contínua */}
      {HK_RAIN.map((r, i) => (
        <div key={i} style={{
          position:'absolute', top:0, left:`${r.left}%`,
          width:r.width, height:r.height,
          background:`linear-gradient(180deg, transparent 0%, rgba(180,222,242,${r.opacity}) 50%, transparent 100%)`,
          animation:`rainDrop ${r.dur}s ${r.delay}s linear infinite`,
          willChange:'transform',
        }}/>
      ))}

      {/* Parede esquerda — catedral gótica */}
      <svg width="180" height="100%" viewBox="0 0 160 700" preserveAspectRatio="none"
        style={{ position:'absolute', left:0, top:0, opacity:0.24 }}>
        <rect width="55" height="700" fill="#080a0e"/>
        {[0,90,180,270,360,450,540,630].map((y, i) => (
          <rect key={i} x={i%2===0?2:5} y={y+3} width={i%2===0?51:45} height={83}
            fill={i%3===0?'#0e1018':'#0b0d12'} stroke="#040508" strokeWidth="1.2"/>
        ))}
        {/* Vitral gótico com luz pálida */}
        <path d="M7,72 L7,200 Q28,22 55,200 L55,72"
          fill="rgba(140,200,230,0.055)" stroke="#c5e8f0" strokeWidth="0.9" opacity="0.55"/>
        <path d="M7,310 L7,430 Q28,265 55,430 L55,310"
          fill="rgba(140,200,230,0.03)" stroke="#c5e8f0" strokeWidth="0.7" opacity="0.38"/>
        {/* Musgo escorrendo */}
        <path d="M14,0 Q16,28 12,58 Q14,88 12,120" stroke="#2a4020" strokeWidth="2" fill="none" opacity="0.45"/>
        <path d="M32,0 Q34,22 30,46 Q32,72 30,100" stroke="#2a4020" strokeWidth="1.5" fill="none" opacity="0.35"/>
      </svg>

      {/* Parede direita */}
      <svg width="180" height="100%" viewBox="0 0 160 700" preserveAspectRatio="none"
        style={{ position:'absolute', right:0, top:0, opacity:0.24, transform:'scaleX(-1)' }}>
        <rect width="55" height="700" fill="#080a0e"/>
        {[0,90,180,270,360,450,540,630].map((y, i) => (
          <rect key={i} x={i%2===0?2:5} y={y+3} width={i%2===0?51:45} height={83}
            fill={i%3===0?'#0e1018':'#0b0d12'} stroke="#040508" strokeWidth="1.2"/>
        ))}
        <path d="M7,72 L7,200 Q28,22 55,200 L55,72"
          fill="rgba(140,200,230,0.055)" stroke="#c5e8f0" strokeWidth="0.9" opacity="0.55"/>
        <path d="M7,310 L7,430 Q28,265 55,430 L55,310"
          fill="rgba(140,200,230,0.03)" stroke="#c5e8f0" strokeWidth="0.7" opacity="0.38"/>
        <path d="M14,0 Q16,28 12,58 Q14,88 12,120" stroke="#2a4020" strokeWidth="2" fill="none" opacity="0.45"/>
        <path d="M32,0 Q34,22 30,46 Q32,72 30,100" stroke="#2a4020" strokeWidth="1.5" fill="none" opacity="0.35"/>
      </svg>

      {/* Estalactites */}
      <svg width="100%" height="130" viewBox="0 0 100 42" preserveAspectRatio="xMidYMin slice"
        style={{ position:'absolute', top:0 }}>
        {HK_STALACTITES.map(([x,y,w,h], i) => (
          <polygon key={i} points={`${x},${y} ${x+w},${y} ${x+w/2},${y+h}`}
            fill={i < 12 ? '#0b0d12' : '#0d1018'} opacity={i < 12 ? 0.98 : 0.78}/>
        ))}
      </svg>

      {/* Feixe de luz central (Hallownest) */}
      <div style={{ position:'absolute', top:0, left:'44%', right:'42%', height:'100%',
        background:'linear-gradient(180deg, rgba(197,232,240,0.058) 0%, rgba(197,232,240,0.022) 45%, transparent 75%)' }} />

      {/* Chão + reflexo de poça */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'20%',
        background:'linear-gradient(0deg, #05070c 0%, #07090f 45%, transparent 100%)' }} />
      <div style={{ position:'absolute', bottom:0, left:'15%', right:'15%', height:'9%',
        background:'radial-gradient(ellipse 70% 100% at 50% 100%, rgba(100,160,200,0.07) 0%, transparent 100%)',
        borderTop:'1px solid rgba(140,185,215,0.07)' }} />

      {/* Vignette escura de caverna */}
      <div style={{ position:'absolute', inset:0,
        background:'radial-gradient(ellipse 72% 65% at 50% 52%, transparent 18%, rgba(0,0,0,0.86) 100%)' }} />
    </div>
  );
}

function HollowKnightEffects() {
  const [knightVisible, setKnight] = React.useState(false);
  const [shade, setShade]          = React.useState<{ x:number; y:number } | null>(null);
  const [geos, setGeos]            = React.useState<{ id:number; left:number }[]>([]);
  const [msg, setMsg]              = React.useState<string|null>(null);
  const knightRef  = React.useRef<HTMLDivElement>(null);
  const knightData = React.useRef<{ x:number; dir:1|-1; bottom:number } | null>(null);
  const animRef    = React.useRef<number>(0);

  /* The Knight traversal */
  const launchKnight = React.useCallback((dir: 1|-1) => {
    cancelAnimationFrame(animRef.current);
    const startX = dir === 1 ? -68 : window.innerWidth + 68;
    knightData.current = { x: startX, dir, bottom: 8 + Math.floor(Math.random() * 18) };
    setKnight(true);
    const speed = (window.innerWidth + 200) / 7200;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - last, 50); last = now;
      const kd = knightData.current; if (!kd) return;
      kd.x += kd.dir * speed * dt;
      const el = knightRef.current;
      if (el) el.style.setProperty('--knx', `${kd.x}px`);
      const off = kd.dir === 1 ? kd.x > window.innerWidth + 69 : kd.x < -69;
      if (off) { setKnight(false); knightData.current = null; return; }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  }, []);

  React.useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const s = (first: boolean) => {
      t = setTimeout(() => { launchKnight(Math.random() > 0.5 ? 1 : -1); s(false); },
        first ? 10000 : 22000 + Math.random() * 18000);
    };
    s(true);
    return () => { clearTimeout(t); cancelAnimationFrame(animRef.current); };
  }, [launchKnight]);

  /* Shade — versão escura do Cavaleiro aparece em cantos */
  React.useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const s = (first: boolean) => {
      t = setTimeout(() => {
        const x = Math.random() > 0.5 ? 4 + Math.random() * 10 : 86 + Math.random() * 10;
        const y = 28 + Math.random() * 38;
        setShade({ x, y });
        setTimeout(() => setShade(null), 6500);
        s(false);
      }, first ? 32000 : 48000 + Math.random() * 36000);
    };
    s(true);
    return () => clearTimeout(t);
  }, []);

  /* Geo coins */
  React.useEffect(() => {
    let t: ReturnType<typeof setTimeout>; let uid = 0;
    const s = (first: boolean) => {
      t = setTimeout(() => {
        const id = uid++;
        setGeos(g => [...g, { id, left: 8 + Math.random() * 84 }]);
        setTimeout(() => setGeos(g => g.filter(x => x.id !== id)), 3500);
        s(false);
      }, first ? 7000 : 12000 + Math.random() * 14000);
    };
    s(true);
    return () => clearTimeout(t);
  }, []);

  /* Notifications */
  React.useEffect(() => {
    const MSGS = ['DREAM NAIL', 'SHADE SOUL', 'VESSEL FILLED', "KING'S SOUL", 'HALLOWNEST RISES', 'FOCUS'];
    let t: ReturnType<typeof setTimeout>;
    const s = (first: boolean) => {
      t = setTimeout(() => {
        setMsg(MSGS[Math.floor(Math.random() * MSGS.length)]);
        setTimeout(() => setMsg(null), 4200);
        s(false);
      }, first ? 20000 : 30000 + Math.random() * 22000);
    };
    s(true);
    return () => clearTimeout(t);
  }, []);

  const kDir = knightData.current?.dir ?? 1;
  return (
    <>
      {/* Lumaflies permanentes */}
      {LUMAFLIES_DATA.map((l, i) => (
        <div key={i} style={{
          position:'fixed', left:`${l.x}%`, top:`${l.y}%`,
          zIndex:13, pointerEvents:'none',
          width:l.size, height:l.size, borderRadius:'50%',
          background:'radial-gradient(circle, #ffffff 0%, #c5e8f0 50%, transparent 100%)',
          boxShadow:`0 0 ${l.size*2.4}px rgba(197,232,240,0.92), 0 0 ${l.size}px rgba(255,255,255,0.85)`,
          animation:`lumaFloat ${l.dur}s ${l.delay}s ease-in-out infinite`,
        }}/>
      ))}

      {/* Geo girando e caindo */}
      {geos.map(g => (
        <div key={g.id} style={{
          position:'fixed', top:'-18px', left:`${g.left}%`,
          zIndex:14, pointerEvents:'none',
          animation:'geoFall 3.3s ease-in forwards',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16"
            style={{ animation:'geoSpin 0.9s linear infinite' }}>
            <polygon points="8,0 16,8 8,16 0,8" fill="#e8d870" stroke="#b8a840" strokeWidth="1"/>
            <polygon points="8,3 13,8 8,13 3,8" fill="#f4ec98" opacity="0.58"/>
            <circle cx="8" cy="8" r="1.8" fill="#f8f4c0" opacity="0.4"/>
          </svg>
        </div>
      ))}

      {/* Shade — versão sombria do Cavaleiro */}
      {shade && (
        <div style={{
          position:'fixed', left:`${shade.x}%`, top:`${shade.y}%`,
          zIndex:15, pointerEvents:'none',
          animation:'shadeAppear 6.5s ease-out forwards',
          filter:'drop-shadow(0 0 10px rgba(80,80,220,0.65))',
        }}>
          <svg width="32" height="46" viewBox="0 0 42 58">
            <path d="M14,22 Q3,32 5,50 L12,44 L14,32Z" fill="#0d0e28"/>
            <path d="M28,22 Q39,32 37,50 L30,44 L28,32Z" fill="#0d0e28"/>
            <rect x="13" y="19" width="16" height="16" rx="3" fill="#0a0b20"/>
            <ellipse cx="21" cy="11" rx="9.5" ry="10.5" fill="#0a0b20"/>
            <path d="M12,5 Q10,0 7,0 Q9,2 11,6Z" fill="#0a0b20"/>
            <path d="M30,5 Q32,0 35,0 Q33,2 31,6Z" fill="#0a0b20"/>
            {/* Olhos brancos brilhantes — marca da Shade */}
            <ellipse cx="16.5" cy="11" rx="2.8" ry="3.2" fill="#ffffff"/>
            <ellipse cx="25.5" cy="11" rx="2.8" ry="3.2" fill="#ffffff"/>
            <ellipse cx="16.5" cy="11" rx="4" ry="4.5" fill="none"
              stroke="rgba(255,255,255,0.35)" strokeWidth="1.2"/>
            <ellipse cx="25.5" cy="11" rx="4" ry="4.5" fill="none"
              stroke="rgba(255,255,255,0.35)" strokeWidth="1.2"/>
            <rect x="14" y="35" width="5" height="17" rx="2.5" fill="#0a0b20"/>
            <rect x="21" y="35" width="5" height="17" rx="2.5" fill="#0a0b20"/>
          </svg>
        </div>
      )}

      {/* O Cavaleiro com animação de caminhada */}
      {knightVisible && (
        <div
          ref={knightRef}
          style={{
            position:'fixed', zIndex:15, bottom:`${knightData.current?.bottom ?? 10}%`,
            left:'var(--knx,-68px)', '--knx':`${knightData.current?.x ?? -68}px`,
            pointerEvents:'none',
            transform: kDir === -1 ? 'scaleX(-1)' : 'none',
            filter:'drop-shadow(0 0 6px rgba(197,232,240,0.38))',
          } as React.CSSProperties}
        >
          <svg width="44" height="62" viewBox="0 0 44 62">
            {/* Capa — flutua */}
            <g style={{ transformBox:'fill-box', transformOrigin:'50% 0%',
              animation:'hkCapeFlow 0.5s ease-in-out infinite' }}>
              <path d="M15,24 Q4,33 6,52 L13,46 L15,34Z" fill="#5a90b5" opacity="0.9"/>
              <path d="M29,24 Q40,33 38,52 L31,46 L29,34Z" fill="#5a90b5" opacity="0.9"/>
            </g>
            {/* Corpo */}
            <rect x="15" y="21" width="14" height="17" rx="3.5" fill="#cae3f2"/>
            {/* Cabeça */}
            <ellipse cx="22" cy="13" rx="9.5" ry="10.5" fill="#cae3f2"/>
            {/* Chifres */}
            <path d="M13,7 Q11,1 8,0 Q10,3 12,8Z" fill="#cae3f2"/>
            <path d="M31,7 Q33,1 36,0 Q34,3 32,8Z" fill="#cae3f2"/>
            {/* Olhos brilhantes */}
            <ellipse cx="18" cy="13" rx="3" ry="3.5" fill="#78c5e8"/>
            <ellipse cx="26" cy="13" rx="3" ry="3.5" fill="#78c5e8"/>
            <ellipse cx="18" cy="13" rx="1.8" ry="2" fill="#c0e8f8" opacity="0.7"/>
            <ellipse cx="26" cy="13" rx="1.8" ry="2" fill="#c0e8f8" opacity="0.7"/>
            {/* Nail */}
            <line x1="28" y1="31" x2="52" y2="31" stroke="#cae3f2" strokeWidth="3.2" strokeLinecap="round"/>
            <polygon points="52,31 49,28 49,34" fill="#a8d0ea"/>
            <line x1="26" y1="26.5" x2="26" y2="35.5" stroke="#88b8d2" strokeWidth="2.5" strokeLinecap="round"/>
            {/* Perna esquerda — animação */}
            <g style={{ transformBox:'fill-box', transformOrigin:'50% 0%',
              animation:'hkLegL 0.5s ease-in-out infinite' }}>
              <rect x="15" y="38" width="6.5" height="19" rx="3.2" fill="#cae3f2"/>
              <ellipse cx="18" cy="57.5" rx="6.5" ry="2.8" fill="#98c2da"/>
            </g>
            {/* Perna direita — animação */}
            <g style={{ transformBox:'fill-box', transformOrigin:'50% 0%',
              animation:'hkLegR 0.5s ease-in-out infinite' }}>
              <rect x="22.5" y="38" width="6.5" height="19" rx="3.2" fill="#cae3f2"/>
              <ellipse cx="26" cy="57.5" rx="6.5" ry="2.8" fill="#98c2da"/>
            </g>
          </svg>
        </div>
      )}

      {/* Notification */}
      {msg && (
        <div style={{
          position:'fixed', top:24, left:'50%', zIndex:20, pointerEvents:'none',
          fontFamily:'monospace', fontSize:12, fontWeight:900, letterSpacing:'0.24em',
          color:'#c5e8f0', textShadow:'0 0 16px rgba(197,232,240,0.98), 0 0 30px rgba(197,232,240,0.55)',
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
  const [currentPage, setCurrentPage] = useState<'hub' | 'roadmaps' | 'suporte' | 'professor' | 'maker' | 'noticias' | 'desafios' | 'cssbattle'>(() => {
    if (window.location.hash === '#roadmaps')  return 'roadmaps';
    if (window.location.hash === '#suporte')   return 'suporte';
    if (window.location.hash === '#maker')     return 'maker';
    if (window.location.hash === '#noticias')  return 'noticias';
    if (window.location.hash === '#desafios')  return 'desafios';
    if (window.location.hash === '#cssbattle') return 'cssbattle';
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
    } else if (currentPage === 'cssbattle') {
      window.location.hash = 'cssbattle';
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
      else if (hash === '#cssbattle') setCurrentPage('cssbattle');
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

  /* CSS Battle page */
  if (currentPage === 'cssbattle') {
    return <CssBattlePage onBackToHub={() => setCurrentPage('hub')} />;
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
        onOpenCssBattle={() => setCurrentPage('cssbattle')}
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
