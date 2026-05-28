import React, { useState } from 'react';
import { Settings, Newspaper } from 'lucide-react';

interface FloatingNavProps {
  onOpenMaker: () => void;
  onOpenNoticias: () => void;
}

const FloatingNav: React.FC<FloatingNavProps> = ({ onOpenMaker, onOpenNoticias }) => {
  const [hovered, setHovered] = useState<'maker' | 'news' | null>(null);

  return (
    <>
      <style>{`
        /* Batida periódica: empurra para a esquerda e volta, como se pedisse atenção */
        @keyframes fab-knock {
          0%, 65%, 100% { transform: translateX(0px); }
          68%  { transform: translateX(-8px); }
          71%  { transform: translateX(0px);  }
          74%  { transform: translateX(-5px); }
          77%  { transform: translateX(0px);  }
          80%  { transform: translateX(-2px); }
          83%  { transform: translateX(0px);  }
        }

        /* Pulso de brilho amarelo (Maker) */
        @keyframes glow-yellow {
          0%, 50%, 100% { box-shadow: -2px 0 8px rgba(255,214,0,0.08); }
          25%            { box-shadow: -4px 0 22px rgba(255,214,0,0.55), 0 0 8px rgba(255,214,0,0.2); }
        }

        /* Pulso de brilho azul (Notícias) */
        @keyframes glow-blue {
          0%, 50%, 100% { box-shadow: -2px 0 8px rgba(96,165,250,0.08); }
          25%            { box-shadow: -4px 0 22px rgba(96,165,250,0.55), 0 0 8px rgba(96,165,250,0.2); }
        }

        /* Engrenagem girando — ícone do Maker */
        @keyframes fab-spin {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }

        /* Pausa na animação ao fazer hover */
        .fab-maker:hover, .fab-news:hover {
          animation-play-state: paused !important;
        }
      `}</style>

      {/* ══════════════════════════════════════════
          Desktop — lateral fixa à direita
      ══════════════════════════════════════════ */}
      <div className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-50 flex-col gap-3 pointer-events-none select-none">

        {/* Cultura Maker */}
        <button
          aria-label="Cultura Maker"
          onClick={onOpenMaker}
          onMouseEnter={() => setHovered('maker')}
          onMouseLeave={() => setHovered(null)}
          className="fab-maker pointer-events-auto flex items-center justify-end overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
          style={{
            height: 54,
            width: hovered === 'maker' ? 188 : 54,
            borderRadius: '18px 0 0 18px',
            background: 'linear-gradient(135deg, #1C1408, #2a1e08)',
            border: '1.5px solid rgba(255,214,0,0.35)',
            borderRight: 'none',
            cursor: 'pointer',
            transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1)',
            animation:
              'fab-knock 11s ease-in-out 1s infinite, glow-yellow 4s ease-in-out infinite',
          }}
        >
          {/* Label — aparece ao hover */}
          <span
            className="text-[11px] font-black whitespace-nowrap pl-4 flex-1 text-left tracking-wide uppercase"
            style={{
              color: '#FFD600',
              opacity: hovered === 'maker' ? 1 : 0,
              transition: 'opacity 0.15s ease 0.08s',
              letterSpacing: '0.06em',
            }}
          >
            Cultura Maker
          </span>

          {/* Ícone */}
          <div
            className="w-[54px] h-[54px] flex items-center justify-center shrink-0"
          >
            <Settings
              className="w-5 h-5"
              style={{ color: '#FFD600', animation: 'fab-spin 9s linear infinite' }}
            />
          </div>
        </button>

        {/* Notícias Tech */}
        <button
          aria-label="Notícias Tech"
          onClick={onOpenNoticias}
          onMouseEnter={() => setHovered('news')}
          onMouseLeave={() => setHovered(null)}
          className="fab-news pointer-events-auto flex items-center justify-end overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          style={{
            height: 54,
            width: hovered === 'news' ? 188 : 54,
            borderRadius: '18px 0 0 18px',
            background: 'linear-gradient(135deg, #0d1b2e, #102040)',
            border: '1.5px solid rgba(96,165,250,0.35)',
            borderRight: 'none',
            cursor: 'pointer',
            transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1)',
            animation:
              'fab-knock 11s ease-in-out 6.5s infinite, glow-blue 4s ease-in-out 2s infinite',
          }}
        >
          {/* Label */}
          <span
            className="text-[11px] font-black whitespace-nowrap pl-4 flex-1 text-left tracking-wide uppercase"
            style={{
              color: '#60a5fa',
              opacity: hovered === 'news' ? 1 : 0,
              transition: 'opacity 0.15s ease 0.08s',
              letterSpacing: '0.06em',
            }}
          >
            Notícias Tech
          </span>

          {/* Ícone */}
          <div className="w-[54px] h-[54px] flex items-center justify-center shrink-0">
            <Newspaper className="w-5 h-5" style={{ color: '#60a5fa' }} />
          </div>
        </button>
      </div>

      {/* ══════════════════════════════════════════
          Mobile — botões compactos flutuantes
          (acima do BackToTop que fica em bottom-6)
      ══════════════════════════════════════════ */}
      <div className="md:hidden fixed bottom-[88px] right-4 z-50 flex flex-col gap-2.5">
        <button
          aria-label="Cultura Maker"
          onClick={onOpenMaker}
          className="w-11 h-11 rounded-full flex items-center justify-center active:scale-95 transition-transform"
          style={{
            background: 'linear-gradient(135deg, #1C1408, #2a1e08)',
            border: '1.5px solid rgba(255,214,0,0.5)',
            boxShadow: '0 4px 14px rgba(255,214,0,0.3)',
          }}
        >
          <Settings className="w-4 h-4" style={{ color: '#FFD600' }} />
        </button>

        <button
          aria-label="Notícias Tech"
          onClick={onOpenNoticias}
          className="w-11 h-11 rounded-full flex items-center justify-center active:scale-95 transition-transform"
          style={{
            background: 'linear-gradient(135deg, #0d1b2e, #102040)',
            border: '1.5px solid rgba(96,165,250,0.5)',
            boxShadow: '0 4px 14px rgba(96,165,250,0.3)',
          }}
        >
          <Newspaper className="w-4 h-4" style={{ color: '#60a5fa' }} />
        </button>
      </div>
    </>
  );
};

export default FloatingNav;
