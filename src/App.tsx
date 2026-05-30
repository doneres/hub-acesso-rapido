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

/* ── Efeitos Copa: bola rolando + vuvuzelas ───────────────────────────────── */
function CopaSideEffects() {
  const [ball, setBall] = React.useState<{ dir:1|-1; bottom:number } | null>(null);
  const [vuvu, setVuvu]   = React.useState<number | null>(null);

  /* bola */
  React.useEffect(() => {
    let next: ReturnType<typeof setTimeout>;
    const schedule = (first: boolean) => {
      const delay = first ? 12000 : 22000 + Math.random() * 20000;
      next = setTimeout(() => {
        setBall({ dir: Math.random()>0.5 ? 1 : -1, bottom: 10 + Math.floor(Math.random()*22) });
        schedule(false);
      }, delay);
    };
    schedule(true);
    return () => clearTimeout(next);
  }, []);

  /* vuvuzela */
  React.useEffect(() => {
    let next: ReturnType<typeof setTimeout>;
    const schedule = (first: boolean) => {
      const delay = first ? 20000 : 18000 + Math.random() * 18000;
      next = setTimeout(() => {
        setVuvu(5 + Math.floor(Math.random()*88));
        schedule(false);
      }, delay);
    };
    schedule(true);
    return () => clearTimeout(next);
  }, []);

  return (
    <>
      {ball && (
        <div
          style={{
            position:'fixed', zIndex:15, pointerEvents:'none',
            bottom:`${ball.bottom}%`,
            ...(ball.dir===1 ? { left:'-56px' } : { right:'-56px' }),
            fontSize:44,
            animation: ball.dir===1
              ? 'ballRollLR 5.5s linear forwards'
              : 'ballRollRL 5.5s linear forwards',
          }}
          onAnimationEnd={() => setBall(null)}
        >⚽</div>
      )}
      {vuvu !== null && (
        <div
          style={{
            position:'fixed', bottom:'-8px', left:`${vuvu}%`,
            zIndex:15, pointerEvents:'none', fontSize:30,
            animation:'vuvuzelaBlast 2.4s ease-out forwards',
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
  React.useEffect(() => {
    const iv = setInterval(() => {
      setShowScan(true);
      setTimeout(() => setShowScan(false), 2000);
    }, 14000);
    return () => clearInterval(iv);
  }, []);
  return showScan ? (
    <div style={{ position:'fixed', left:0, right:0, zIndex:14, height:2, background:'linear-gradient(90deg,transparent,rgba(0,214,50,0.7) 20%,rgba(0,255,65,0.9) 50%,rgba(0,214,50,0.7) 80%,transparent)', boxShadow:'0 0 12px rgba(0,214,50,0.5)', pointerEvents:'none', animation:'pipboyScan 2s linear forwards' }} />
  ) : null;
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
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    let next: ReturnType<typeof setTimeout>;
    const schedule = (first: boolean) => {
      next = setTimeout(() => {
        setShow(true);
        setTimeout(() => setShow(false), 4500);
        schedule(false);
      }, first ? 20000 : 32000 + Math.random() * 25000);
    };
    schedule(true);
    return () => clearTimeout(next);
  }, []);
  return show ? (
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
  ) : null;
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
    root.classList.remove('theme-copa', 'theme-fallout-nv', 'theme-csgo-16');
    if (activeCosmetic?.id === 'copa-2026')   root.classList.add('theme-copa');
    if (activeCosmetic?.id === 'fallout-nv') root.classList.add('theme-fallout-nv');
    if (activeCosmetic?.id === 'csgo-16')    root.classList.add('theme-csgo-16');
    return () => root.classList.remove('theme-copa', 'theme-fallout-nv', 'theme-csgo-16');
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
      {activeCosmetic?.id === 'copa-2026'   && <PitchBackground />}
      {activeCosmetic?.id === 'fallout-nv' && <FalloutBackground />}
      {activeCosmetic?.id === 'csgo-16'    && <CSGOBackground />}

      {/* Efeitos ocasionais */}
      {activeCosmetic?.id === 'copa-2026'   && <CopaSideEffects />}
      {activeCosmetic?.id === 'fallout-nv' && <FalloutEffects />}
      {activeCosmetic?.id === 'csgo-16'    && <CSGOEffects />}

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
