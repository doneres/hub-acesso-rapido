import React, { useState, useEffect, useRef } from 'react';
import { Map, HelpCircle, ChevronDown, GraduationCap, Users, Lock } from 'lucide-react';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenRoadmaps: () => void;
  onOpenSuporte?: () => void;
  onOpenProfessorLogin?: () => void;
}

const TYPEWRITER_TEXT = 'ROADMAPS';
const CHAR_DELAY      = 110;
const HOLD_DELAY      = 2200;
const ERASE_DELAY     = 60;

const Header: React.FC<HeaderProps> = ({ isDark, onToggleTheme, onOpenRoadmaps, onOpenSuporte, onOpenProfessorLogin }) => {
  const [displayed, setDisplayed] = useState('');
  const [cursor, setCursor]       = useState(true);
  const phaseRef = useRef<'typing' | 'holding' | 'erasing'>('typing');
  const indexRef = useRef(0);

  const [portalOpen, setPortalOpen] = useState(false);
  const portalRef = useRef<HTMLDivElement>(null);

  /* ── Máquina de escrever ────────────────────────────────────────── */
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const tick = () => {
      const phase = phaseRef.current;
      if (phase === 'typing') {
        if (indexRef.current < TYPEWRITER_TEXT.length) {
          indexRef.current += 1;
          setDisplayed(TYPEWRITER_TEXT.slice(0, indexRef.current));
          timeout = setTimeout(tick, CHAR_DELAY);
        } else {
          phaseRef.current = 'holding';
          timeout = setTimeout(tick, HOLD_DELAY);
        }
      } else if (phase === 'holding') {
        phaseRef.current = 'erasing';
        timeout = setTimeout(tick, ERASE_DELAY);
      } else {
        if (indexRef.current > 0) {
          indexRef.current -= 1;
          setDisplayed(TYPEWRITER_TEXT.slice(0, indexRef.current));
          timeout = setTimeout(tick, ERASE_DELAY);
        } else {
          phaseRef.current = 'typing';
          timeout = setTimeout(tick, CHAR_DELAY * 3);
        }
      }
    };
    timeout = setTimeout(tick, 600);
    return () => clearTimeout(timeout);
  }, []);

  /* ── Cursor piscante ──────────────────────────────────────────── */
  useEffect(() => {
    const t = setInterval(() => setCursor(v => !v), 530);
    return () => clearInterval(t);
  }, []);

  /* ── Fecha o dropdown ao clicar fora ──────────────────────────── */
  useEffect(() => {
    if (!portalOpen) return;
    const handler = (e: MouseEvent) => {
      if (portalRef.current && !portalRef.current.contains(e.target as Node)) {
        setPortalOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [portalOpen]);

  /* ── Estilos do botão Roadmaps conforme o tema ──────────────── */
  const rmBg     = isDark ? 'linear-gradient(135deg, #080d1a 0%, #111827 100%)' : '#ffffff';
  const rmBorder = '#06b6d4';
  const rmShadow = isDark ? '3px 3px 0 rgba(6,182,212,0.25)' : '3px 3px 0 rgba(6,182,212,0.20)';
  const rmLabel  = isDark ? 'rgba(6,182,212,0.55)' : 'rgba(0,84,166,0.55)';
  const rmText   = isDark ? '#06b6d4' : '#0054a6';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm gradient-border-bottom transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between">

        {/* ── Logo + Title ── */}
        <div className="flex items-center gap-3 md:gap-4">
          <a
            href="https://ctrlplay.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 hover:scale-105 transition-transform duration-300"
          >
            <img
              src="https://ctrlplay.com.br/wp-content/uploads/2024/11/logo-colorido.svg"
              alt="Ctrl+Play"
              className="h-8 md:h-10"
            />
          </a>

          <div className="hidden sm:block w-px h-8 bg-gray-200 dark:bg-slate-700 rounded-full" />

          <div className="leading-none">
            <h1 className="text-base md:text-xl font-black text-slate-700 dark:text-slate-100 uppercase tracking-tight">
              Hub de{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-ctrl-blue to-ctrl-orange">
                Ferramentas
              </span>
            </h1>
            <p className="hidden md:block text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
              Tudo para criar, aprender e se divertir! 🚀
            </p>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center gap-2 md:gap-3">

          {/* ── Botão Ajuda & Suporte ── */}
          {onOpenSuporte && (
            <button
              onClick={onOpenSuporte}
              className="group flex items-center gap-1.5 px-3 py-2 md:px-3.5 md:py-2 rounded-full border-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              style={{
                background: isDark ? '#1e293b' : '#ffffff',
                borderColor: isDark ? '#334155' : '#e2e8f0',
                boxShadow: isDark ? '2px 2px 0 rgba(0,0,0,0.3)' : '2px 2px 0 rgba(0,0,0,0.06)',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.borderColor = '#f37021';
                el.style.boxShadow   = isDark
                  ? '0 0 10px rgba(243,112,33,0.3), 3px 3px 0 rgba(243,112,33,0.2)'
                  : '0 0 8px rgba(243,112,33,0.15), 3px 3px 0 rgba(243,112,33,0.15)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.borderColor = isDark ? '#334155' : '#e2e8f0';
                el.style.boxShadow   = isDark ? '2px 2px 0 rgba(0,0,0,0.3)' : '2px 2px 0 rgba(0,0,0,0.06)';
              }}
              title="Central de Ajuda & Suporte"
              aria-label="Abrir Central de Ajuda"
            >
              <HelpCircle
                className="w-4 h-4 flex-shrink-0 transition-colors"
                style={{ color: isDark ? '#94a3b8' : '#64748b' }}
              />
              {/* Label — visível a partir de md */}
              <div className="hidden md:flex flex-col items-start leading-none gap-0.5">
                <span className="text-[8px] font-bold uppercase tracking-wider"
                  style={{ color: isDark ? 'rgba(148,163,184,0.6)' : 'rgba(100,116,139,0.7)' }}>
                  PRECISA DE
                </span>
                <span className="text-[9px] font-black uppercase"
                  style={{ color: isDark ? '#94a3b8' : '#475569' }}>
                  AJUDA?
                </span>
              </div>
            </button>
          )}

          {/* ── Botão Roadmaps com Typewriter ── */}
          <button
            onClick={onOpenRoadmaps}
            className="group flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-full border-2 transition-all duration-300 hover:-translate-y-0.5"
            style={{
              background: rmBg,
              borderColor: rmBorder,
              boxShadow: rmShadow,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = isDark
                ? '0 0 14px rgba(6,182,212,0.45), 4px 4px 0 rgba(6,182,212,0.3)'
                : '0 0 10px rgba(0,84,166,0.25), 4px 4px 0 rgba(6,182,212,0.25)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = rmShadow;
            }}
            title="Ver trilhas de aprendizado"
            aria-label="Abrir Roadmaps"
          >
            <div className="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 flex-shrink-0"
              style={{ color: rmText }}>
              <Map className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div className="hidden sm:flex flex-col items-start leading-none gap-1">
              <span style={{ color: rmLabel, fontFamily: "'Press Start 2P', monospace", fontSize: '7px', letterSpacing: '0.08em', lineHeight: 1 }}>
                TRILHAS
              </span>
              <span style={{
                color: rmText,
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '8px',
                lineHeight: 1,
                display: 'inline-flex',
                alignItems: 'center',
                minWidth: '68px',
              }}>
                {displayed}
                <span style={{
                  display: 'inline-block',
                  width: '2px',
                  height: '10px',
                  marginLeft: '2px',
                  background: rmText,
                  opacity: cursor ? 1 : 0,
                  verticalAlign: 'middle',
                }} />
              </span>
            </div>
          </button>

          {/* ── Theme Toggle ── */}
          <button
            onClick={onToggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ctrl-blue"
            aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
            title={isDark ? 'Modo claro' : 'Modo escuro'}
          >
            {isDark ? (
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* ── Portal Dropdown ── */}
          <div ref={portalRef} className="relative">
            <button
              onClick={() => setPortalOpen(v => !v)}
              className="group flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 px-3 py-2 md:px-4 md:py-2.5 rounded-full border-2 border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-ctrl-orange/40 transition-all duration-300"
              aria-label="Acessar portal"
              aria-expanded={portalOpen}
            >
              <div className="w-7 h-7 flex items-center justify-center bg-blue-50 dark:bg-slate-700 rounded-full group-hover:bg-ctrl-orange transition-colors duration-300">
                <img
                  src="https://ctrlplay.com.br/wp-content/uploads/2021/04/icon-desempenho.svg"
                  alt="Portal"
                  className="w-4 h-4 group-hover:brightness-0 group-hover:invert transition-all"
                />
              </div>
              <div className="hidden sm:flex flex-col items-start leading-none gap-0.5">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-ctrl-orange/70 transition-colors">
                  Acessar
                </span>
                <span className="text-xs font-black text-ctrl-blue dark:text-blue-400 uppercase group-hover:text-ctrl-orange transition-colors">
                  Portal
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${portalOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown panel */}
            {portalOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-xl overflow-hidden z-50 animate-fadeIn">

                {/* Área do Aluno */}
                <a
                  href="https://portal.ctrlplay.com.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setPortalOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/70 transition-colors"
                >
                  <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30 shrink-0">
                    <GraduationCap className="w-4 h-4 text-ctrl-blue" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-700 dark:text-slate-100">Área do Aluno</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">Portal Ctrl+Play</div>
                  </div>
                </a>

                {/* Divider */}
                <div className="mx-4 h-px bg-gray-100 dark:bg-slate-700" />

                {/* Área do Professor */}
                {onOpenProfessorLogin && (
                  <button
                    onClick={() => { setPortalOpen(false); onOpenProfessorLogin(); }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/70 transition-colors"
                  >
                    <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-900/30 shrink-0">
                      <Users className="w-4 h-4 text-ctrl-orange" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-xs font-black text-slate-700 dark:text-slate-100">Área do Professor</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">Acesso restrito</div>
                    </div>
                    <Lock className="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
