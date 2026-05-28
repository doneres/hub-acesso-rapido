import React from 'react';
import { Settings, Newspaper, Trophy } from 'lucide-react';

interface FloatingNavProps {
  isDark: boolean;
  onOpenMaker: () => void;
  onOpenNoticias: () => void;
  onOpenDesafios: () => void;
}

const FloatingNav: React.FC<FloatingNavProps> = ({ isDark, onOpenMaker, onOpenNoticias, onOpenDesafios }) => {
  return (
    <>
      <style>{`
        /* ── Estrutura do botão ──────────────────────────────────────────── */
        .fnav-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          height: 54px;
          width: 54px;
          border-radius: 18px 0 0 18px;
          border-right: none !important;
          cursor: pointer;
          overflow: visible;
          transition: width 0.30s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Expande APENAS o botão com o cursor — cada um independente */
        .fnav-btn:hover {
          width: 196px;
          animation-play-state: paused !important;
        }

        /* Label: oculta por padrão, aparece só no botão em hover */
        .fnav-label {
          flex: 1;
          opacity: 0;
          white-space: nowrap;
          padding-left: 16px;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          pointer-events: none;
          transition: opacity 0.18s ease 0.10s;
        }
        .fnav-btn:hover .fnav-label { opacity: 1; }

        /* Área do ícone — sempre visível, largura fixa */
        .fnav-icon {
          width: 54px;
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
        }

        /* ── Animações gerais ────────────────────────────────────────────── */

        /* Batida lateral periódica */
        @keyframes fnav-knock {
          0%, 60%, 100% { transform: translateX(0);    }
          63%            { transform: translateX(-10px);}
          66%            { transform: translateX(0);    }
          69%            { transform: translateX(-7px); }
          72%            { transform: translateX(0);    }
          75%            { transform: translateX(-3px); }
          78%            { transform: translateX(0);    }
        }

        /* Brilho dourado (Maker) */
        @keyframes fnav-glow-yellow {
          0%,50%,100% { box-shadow: -2px 0 6px rgba(255,214,0,0.05); }
          25%          { box-shadow: -6px 0 28px rgba(255,214,0,0.65), 0 0 10px rgba(255,214,0,0.25); }
        }

        /* Brilho azul (Notícias) */
        @keyframes fnav-glow-blue {
          0%,50%,100% { box-shadow: -2px 0 6px rgba(96,165,250,0.05); }
          25%          { box-shadow: -6px 0 28px rgba(96,165,250,0.65), 0 0 10px rgba(96,165,250,0.25); }
        }

        /* Brilho roxo (Desafios) */
        @keyframes fnav-glow-purple {
          0%,50%,100% { box-shadow: -2px 0 6px rgba(167,139,250,0.05); }
          25%          { box-shadow: -6px 0 32px rgba(167,139,250,0.70), 0 0 14px rgba(167,139,250,0.30); }
        }

        /* Engrenagem girando */
        @keyframes fnav-spin {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }

        /* Troféu pulsa */
        @keyframes fnav-trophy-pulse {
          0%,80%,100% { transform: scale(1); }
          85%          { transform: scale(1.25) rotate(-8deg); }
          90%          { transform: scale(1.20) rotate(6deg); }
          95%          { transform: scale(1.12) rotate(-3deg); }
        }

        /* ── Confete (6 partículas saindo do troféu) ─────────────────────── */
        .fnav-cp {
          position: absolute;
          width: 5px;
          height: 5px;
          border-radius: 2px;
          pointer-events: none;
          top: calc(50% - 2.5px);
          left: calc(50% - 2.5px);
          opacity: 0;
        }

        @keyframes fnav-conf-1 {
          0%,62%,100% { opacity:0; transform:translate(0,0) rotate(0deg)   scale(0); }
          65%          { opacity:1; transform:translate(0,0) rotate(0deg)   scale(1); }
          82%          { opacity:0; transform:translate(16px,-18px) rotate(160deg) scale(0.3); }
        }
        @keyframes fnav-conf-2 {
          0%,62%,100% { opacity:0; transform:translate(0,0) rotate(0deg)   scale(0); }
          66%          { opacity:1; transform:translate(0,0) rotate(0deg)   scale(1); }
          83%          { opacity:0; transform:translate(-16px,-18px) rotate(-140deg) scale(0.3); }
        }
        @keyframes fnav-conf-3 {
          0%,62%,100% { opacity:0; transform:translate(0,0) rotate(0deg)   scale(0); }
          67%          { opacity:1; transform:translate(0,0) rotate(0deg)   scale(1); }
          84%          { opacity:0; transform:translate(0,-22px) rotate(90deg) scale(0.3); }
        }
        @keyframes fnav-conf-4 {
          0%,62%,100% { opacity:0; transform:translate(0,0) rotate(0deg)   scale(0); }
          67%          { opacity:1; transform:translate(0,0) rotate(0deg)   scale(1); }
          84%          { opacity:0; transform:translate(18px,14px) rotate(200deg) scale(0.3); }
        }
        @keyframes fnav-conf-5 {
          0%,62%,100% { opacity:0; transform:translate(0,0) rotate(0deg)   scale(0); }
          68%          { opacity:1; transform:translate(0,0) rotate(0deg)   scale(1); }
          85%          { opacity:0; transform:translate(-18px,14px) rotate(-180deg) scale(0.3); }
        }
        @keyframes fnav-conf-6 {
          0%,62%,100% { opacity:0; transform:translate(0,0) rotate(0deg)   scale(0); }
          68%          { opacity:1; transform:translate(0,0) rotate(0deg)   scale(1); }
          85%          { opacity:0; transform:translate(0,20px) rotate(120deg) scale(0.3); }
        }

        .fnav-cp1 { background:#fbbf24; animation: fnav-conf-1 6s ease-out 2.0s infinite; }
        .fnav-cp2 { background:#a78bfa; animation: fnav-conf-2 6s ease-out 2.12s infinite; }
        .fnav-cp3 { background:#34d399; animation: fnav-conf-3 6s ease-out 2.24s infinite; }
        .fnav-cp4 { background:#f87171; animation: fnav-conf-4 6s ease-out 2.36s infinite; }
        .fnav-cp5 { background:#60a5fa; animation: fnav-conf-5 6s ease-out 2.48s infinite; }
        .fnav-cp6 { background:#fb923c; animation: fnav-conf-6 6s ease-out 2.60s infinite; }

        /* ── Aplicação por botão ─────────────────────────────────────────── */
        .fnav-maker {
          animation:
            fnav-knock       10s ease-in-out 1.5s infinite,
            fnav-glow-yellow  4s ease-in-out 0s   infinite;
        }
        .fnav-news {
          animation:
            fnav-knock      10s ease-in-out 6.5s infinite,
            fnav-glow-blue   4s ease-in-out 2s   infinite;
        }
        .fnav-desafios {
          animation:
            fnav-knock        10s ease-in-out 4s    infinite,
            fnav-glow-purple   4s ease-in-out 1s    infinite;
        }
        .fnav-desafios .fnav-trophy {
          animation: fnav-trophy-pulse 6s ease-in-out 2s infinite;
        }

        .fnav-gear { animation: fnav-spin 9s linear infinite; }
      `}</style>

      {/* ════════════════════════════════════════════════════════════════════
          Desktop — lateral fixa à direita, verticalmente centralizada
          items-end → cada botão mantém SUA própria largura (sem stretch)
      ════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:flex flex-col items-end fixed right-0 top-1/2 -translate-y-1/2 z-50 gap-3">

        {/* Cultura Maker */}
        <button
          onClick={onOpenMaker}
          aria-label="Cultura Maker"
          className="fnav-btn fnav-maker focus:outline-none"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, #1C1408 0%, #2d1f06 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #fef9ec 100%)',
            border: `1.5px solid ${isDark ? 'rgba(255,214,0,0.40)' : 'rgba(180,120,0,0.40)'}`,
          }}
        >
          <span className="fnav-label" style={{ color: isDark ? '#FFD600' : '#92400e' }}>
            Cultura Maker
          </span>
          <div className="fnav-icon">
            <Settings className="fnav-gear w-5 h-5" style={{ color: isDark ? '#FFD600' : '#b45309' }} />
          </div>
        </button>

        {/* Notícias Tech */}
        <button
          onClick={onOpenNoticias}
          aria-label="Notícias Tech"
          className="fnav-btn fnav-news focus:outline-none"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, #0a1628 0%, #0f2040 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)',
            border: `1.5px solid ${isDark ? 'rgba(96,165,250,0.40)' : 'rgba(59,130,246,0.40)'}`,
          }}
        >
          <span className="fnav-label" style={{ color: isDark ? '#60a5fa' : '#1e40af' }}>
            Notícias Tech
          </span>
          <div className="fnav-icon">
            <Newspaper className="w-5 h-5" style={{ color: isDark ? '#60a5fa' : '#2563eb' }} />
          </div>
        </button>

        {/* Desafios — troféu com confete */}
        <button
          onClick={onOpenDesafios}
          aria-label="Detetive de Código"
          className="fnav-btn fnav-desafios focus:outline-none"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, #0d0520 0%, #1a0840 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%)',
            border: `1.5px solid ${isDark ? 'rgba(167,139,250,0.40)' : 'rgba(139,92,246,0.40)'}`,
          }}
        >
          <span className="fnav-label" style={{ color: isDark ? '#a78bfa' : '#7c3aed' }}>
            Desafios
          </span>
          <div className="fnav-icon">
            <Trophy className="fnav-trophy w-5 h-5" style={{ color: isDark ? '#a78bfa' : '#7c3aed' }} />
            {/* Confete */}
            <span className="fnav-cp fnav-cp1" />
            <span className="fnav-cp fnav-cp2" />
            <span className="fnav-cp fnav-cp3" />
            <span className="fnav-cp fnav-cp4" />
            <span className="fnav-cp fnav-cp5" />
            <span className="fnav-cp fnav-cp6" />
          </div>
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          Mobile — botões circulares compactos, acima do BackToTop
      ════════════════════════════════════════════════════════════════════ */}
      <div className="md:hidden fixed bottom-[88px] right-4 z-50 flex flex-col gap-2.5">
        <button
          aria-label="Cultura Maker"
          onClick={onOpenMaker}
          className="w-11 h-11 rounded-full flex items-center justify-center active:scale-95 transition-transform"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, #1C1408, #2d1f06)'
              : 'linear-gradient(135deg, #ffffff, #fef9ec)',
            border: `1.5px solid ${isDark ? 'rgba(255,214,0,0.55)' : 'rgba(180,120,0,0.55)'}`,
            boxShadow: '0 4px 14px rgba(255,214,0,0.30)',
          }}
        >
          <Settings className="w-4 h-4" style={{ color: isDark ? '#FFD600' : '#b45309' }} />
        </button>

        <button
          aria-label="Notícias Tech"
          onClick={onOpenNoticias}
          className="w-11 h-11 rounded-full flex items-center justify-center active:scale-95 transition-transform"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, #0a1628, #0f2040)'
              : 'linear-gradient(135deg, #ffffff, #eff6ff)',
            border: `1.5px solid ${isDark ? 'rgba(96,165,250,0.55)' : 'rgba(59,130,246,0.55)'}`,
            boxShadow: '0 4px 14px rgba(96,165,250,0.30)',
          }}
        >
          <Newspaper className="w-4 h-4" style={{ color: isDark ? '#60a5fa' : '#2563eb' }} />
        </button>

        <button
          aria-label="Detetive de Código"
          onClick={onOpenDesafios}
          className="w-11 h-11 rounded-full flex items-center justify-center active:scale-95 transition-transform"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, #0d0520, #1a0840)'
              : 'linear-gradient(135deg, #ffffff, #f5f3ff)',
            border: `1.5px solid ${isDark ? 'rgba(167,139,250,0.55)' : 'rgba(139,92,246,0.55)'}`,
            boxShadow: '0 4px 14px rgba(167,139,250,0.35)',
          }}
        >
          <Trophy className="w-4 h-4" style={{ color: isDark ? '#a78bfa' : '#7c3aed' }} />
        </button>
      </div>
    </>
  );
};

export default FloatingNav;
