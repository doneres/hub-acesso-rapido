import React from 'react';
import { Settings, Newspaper } from 'lucide-react';

interface FloatingNavProps {
  isDark: boolean;
  onOpenMaker: () => void;
  onOpenNoticias: () => void;
}

const FloatingNav: React.FC<FloatingNavProps> = ({ isDark, onOpenMaker, onOpenNoticias }) => {
  return (
    <>
      <style>{`
        /* Expande apenas o botão que recebeu hover — CSS puro, sem estado React */
        .fab-btn {
          width: 54px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          border-right: none !important;
          border-radius: 18px 0 0 18px;
          height: 54px;
          position: relative;
        }
        .fab-btn:hover {
          width: 192px;
          animation-play-state: paused !important;
        }

        /* Label — oculta por padrão, aparece apenas no botão com hover */
        .fab-label {
          opacity: 0;
          white-space: nowrap;
          padding-left: 16px;
          flex: 1;
          text-align: left;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          transition: opacity 0.15s ease 0.1s;
          pointer-events: none;
        }
        .fab-btn:hover .fab-label { opacity: 1; }

        /* Ícone fixo à direita */
        .fab-icon {
          width: 54px;
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* Batida periódica */
        @keyframes fab-knock {
          0%, 65%, 100% { transform: translateX(0);   }
          68%            { transform: translateX(-9px);}
          71%            { transform: translateX(0);   }
          74%            { transform: translateX(-6px);}
          77%            { transform: translateX(0);   }
          80%            { transform: translateX(-3px);}
          83%            { transform: translateX(0);   }
        }

        /* Pulsos de brilho */
        @keyframes glow-y {
          0%,45%,100% { box-shadow: -3px 0 10px rgba(255,214,0,0.08); }
          22%          { box-shadow: -5px 0 24px rgba(255,214,0,0.55); }
        }
        @keyframes glow-b {
          0%,45%,100% { box-shadow: -3px 0 10px rgba(96,165,250,0.08); }
          22%          { box-shadow: -5px 0 24px rgba(96,165,250,0.55); }
        }

        /* Engrenagem girando */
        @keyframes fab-spin {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }

        .fab-maker { animation: fab-knock 11s ease-in-out 1s infinite, glow-y 4s ease-in-out infinite; }
        .fab-news  { animation: fab-knock 11s ease-in-out 6.5s infinite, glow-b 4s ease-in-out 2s infinite; }
        .fab-spin  { animation: fab-spin 9s linear infinite; }
      `}</style>

      {/* ── Desktop: lateral fixa direita ─────────────────────────────────── */}
      <div className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-50 flex-col gap-3">

        {/* Cultura Maker */}
        <button
          onClick={onOpenMaker}
          aria-label="Cultura Maker"
          className="fab-btn fab-maker focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
          style={{
            background: isDark
              ? 'linear-gradient(135deg,#1C1408,#2d1f08)'
              : 'linear-gradient(135deg,#fffbeb,#fef3c7)',
            border: `1.5px solid ${isDark ? 'rgba(255,214,0,0.35)' : 'rgba(161,98,7,0.35)'}`,
          }}
        >
          <span className="fab-label" style={{ color: isDark ? '#FFD600' : '#92400e' }}>
            Cultura Maker
          </span>
          <div className="fab-icon">
            <Settings
              className="fab-spin w-5 h-5"
              style={{ color: isDark ? '#FFD600' : '#b45309' }}
            />
          </div>
        </button>

        {/* Notícias Tech */}
        <button
          onClick={onOpenNoticias}
          aria-label="Notícias Tech"
          className="fab-btn fab-news focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          style={{
            background: isDark
              ? 'linear-gradient(135deg,#0d1b2e,#102040)'
              : 'linear-gradient(135deg,#eff6ff,#dbeafe)',
            border: `1.5px solid ${isDark ? 'rgba(96,165,250,0.35)' : 'rgba(59,130,246,0.35)'}`,
          }}
        >
          <span className="fab-label" style={{ color: isDark ? '#60a5fa' : '#1e40af' }}>
            Notícias Tech
          </span>
          <div className="fab-icon">
            <Newspaper className="w-5 h-5" style={{ color: isDark ? '#60a5fa' : '#2563eb' }} />
          </div>
        </button>
      </div>

      {/* ── Mobile: botões compactos (acima do BackToTop em bottom-6) ──────── */}
      <div className="md:hidden fixed bottom-[88px] right-4 z-50 flex flex-col gap-2.5">
        <button
          aria-label="Cultura Maker"
          onClick={onOpenMaker}
          className="w-11 h-11 rounded-full flex items-center justify-center active:scale-95 transition-transform"
          style={{
            background: isDark ? 'linear-gradient(135deg,#1C1408,#2d1f08)' : 'linear-gradient(135deg,#fffbeb,#fef3c7)',
            border: `1.5px solid ${isDark ? 'rgba(255,214,0,0.55)' : 'rgba(161,98,7,0.55)'}`,
            boxShadow: '0 4px 14px rgba(255,214,0,0.28)',
          }}
        >
          <Settings className="w-4 h-4" style={{ color: isDark ? '#FFD600' : '#b45309' }} />
        </button>

        <button
          aria-label="Notícias Tech"
          onClick={onOpenNoticias}
          className="w-11 h-11 rounded-full flex items-center justify-center active:scale-95 transition-transform"
          style={{
            background: isDark ? 'linear-gradient(135deg,#0d1b2e,#102040)' : 'linear-gradient(135deg,#eff6ff,#dbeafe)',
            border: `1.5px solid ${isDark ? 'rgba(96,165,250,0.55)' : 'rgba(59,130,246,0.55)'}`,
            boxShadow: '0 4px 14px rgba(96,165,250,0.28)',
          }}
        >
          <Newspaper className="w-4 h-4" style={{ color: isDark ? '#60a5fa' : '#2563eb' }} />
        </button>
      </div>
    </>
  );
};

export default FloatingNav;
