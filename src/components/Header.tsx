import React, { useState, useEffect, useRef } from 'react';
import { Map } from 'lucide-react';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenRoadmaps: () => void;
}

const TYPEWRITER_TEXT = 'ROADMAPS';
const CHAR_DELAY      = 110;   // ms por letra
const HOLD_DELAY      = 2200;  // ms parado depois de completar
const ERASE_DELAY     = 60;    // ms por letra apagada

const Header: React.FC<HeaderProps> = ({ isDark, onToggleTheme, onOpenRoadmaps }) => {
  const [displayed, setDisplayed]   = useState('');
  const [cursor, setCursor]         = useState(true);
  const phaseRef = useRef<'typing' | 'holding' | 'erasing'>('typing');
  const indexRef = useRef(0);

  /* ── Máquina de escrever ──────────────────────────────────────────── */
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
        // erasing
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

  /* ── Cursor piscante ──────────────────────────────────────────────── */
  useEffect(() => {
    const t = setInterval(() => setCursor(v => !v), 530);
    return () => clearInterval(t);
  }, []);

  /* ── Estilos do botão conforme o tema ────────────────────────────── */
  const btnBg     = isDark
    ? 'linear-gradient(135deg, #080d1a 0%, #111827 100%)'
    : '#ffffff';
  const btnBorder = '#06b6d4';
  const btnShadow = isDark
    ? '3px 3px 0 rgba(6,182,212,0.25)'
    : '3px 3px 0 rgba(6,182,212,0.20)';
  const labelColor  = isDark ? 'rgba(6,182,212,0.55)' : 'rgba(0,84,166,0.55)';
  const textColor   = isDark ? '#06b6d4'              : '#0054a6';
  const iconColor   = isDark ? '#06b6d4'              : '#0054a6';

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

          {/* ── Roadmaps Button com Typewriter ── */}
          <button
            onClick={onOpenRoadmaps}
            className="group flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 border-2 transition-all duration-300 hover:-translate-y-0.5"
            style={{
              background: btnBg,
              borderColor: btnBorder,
              boxShadow: btnShadow,
              borderRadius: '9999px',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.boxShadow = isDark
                ? '0 0 14px rgba(6,182,212,0.45), 4px 4px 0 rgba(6,182,212,0.3)'
                : '0 0 10px rgba(0,84,166,0.25), 4px 4px 0 rgba(6,182,212,0.25)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = btnShadow;
            }}
            title="Ver trilhas de aprendizado"
            aria-label="Abrir Roadmaps"
          >
            {/* Ícone */}
            <div
              className="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 flex-shrink-0"
              style={{ color: iconColor }}
            >
              <Map className="w-4 h-4 md:w-5 md:h-5" />
            </div>

            {/* Texto typewriter — só em telas ≥ sm */}
            <div className="hidden sm:flex flex-col items-start leading-none gap-1">
              {/* Label "TRILHAS" */}
              <span
                style={{
                  color: labelColor,
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '7px',
                  letterSpacing: '0.08em',
                  lineHeight: 1,
                }}
              >
                TRILHAS
              </span>

              {/* Texto animado + cursor */}
              <span
                style={{
                  color: textColor,
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '8px',
                  lineHeight: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  minWidth: '68px',  /* evita layout shift */
                }}
              >
                {displayed}
                <span
                  style={{
                    display: 'inline-block',
                    width: '2px',
                    height: '10px',
                    marginLeft: '2px',
                    background: textColor,
                    opacity: cursor ? 1 : 0,
                    transition: 'none',
                    verticalAlign: 'middle',
                  }}
                />
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

          {/* ── Student Portal ── */}
          <a
            href="https://portal.ctrlplay.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 px-3 py-2 md:px-4 md:py-2.5 rounded-full border-2 border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-ctrl-orange/40 transition-all duration-300"
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
                Área do Aluno
              </span>
            </div>
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
