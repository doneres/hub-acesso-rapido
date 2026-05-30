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

  /* Aplica/remove classe theme-copa no <html> para CSS global dos cards */
  useEffect(() => {
    const root = document.documentElement;
    if (activeCosmetic?.id === 'copa-2026') {
      root.classList.add('theme-copa');
    } else {
      root.classList.remove('theme-copa');
    }
    return () => root.classList.remove('theme-copa');
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
      style={activeCosmetic ? {
        backgroundColor: isDark ? activeCosmetic.darkBg : activeCosmetic.lightBg,
        backgroundImage: isDark ? activeCosmetic.patternDark : activeCosmetic.patternLight,
      } : undefined}
    >
      {activeCosmetic?.id === 'copa-2026' && (
        <div style={{ height: 4, display: 'flex', flexShrink: 0 }}>
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

        {/* Banner Copa — inspirado na camisa da Seleção */}
        {activeCosmetic && (
          <div
            className="animate-fadeIn mb-6 relative overflow-hidden"
            style={{
              background: '#FFD100',
              borderBottom: '3px solid #009C3B',
              padding: '11px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            {/* Losango jacquard no fundo do banner */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'22\' height=\'22\'%3E%3Cpath d=\'M11 1L21 11L11 21L1 11Z\' fill=\'none\' stroke=\'%23009C3B\' stroke-width=\'0.7\' opacity=\'0.18\'/%3E%3C/svg%3E")',
              pointerEvents: 'none',
            }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: '#009C3B',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, flexShrink: 0,
                boxShadow: '0 2px 8px rgba(0,156,59,0.35)',
              }}>⚽</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 900, color: '#014d20', letterSpacing: '0.1em', lineHeight: 1 }}>
                  COPA DO MUNDO 2026
                </div>
                <div style={{ fontSize: 10, color: 'rgba(1,77,32,0.65)', marginTop: 2 }}>
                  Tema ativo · gerencie em Desafios
                </div>
              </div>
            </div>
            <div style={{
              position: 'relative', zIndex: 1,
              fontSize: 9, fontWeight: 900, letterSpacing: '0.14em',
              color: '#014d20',
              padding: '4px 14px',
              background: 'rgba(1,77,32,0.1)',
              border: '1px solid rgba(1,77,32,0.25)',
              borderRadius: 999,
            }}>ATIVO</div>
          </div>
        )}

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
