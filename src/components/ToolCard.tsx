import React, { useState } from 'react';
import { Copy } from 'lucide-react';
import { Tool } from '../types';
import HighlightText from './HighlightText';

interface ToolCardProps {
  tool: Tool;
  index: number;
  isFavorite: boolean;
  searchQuery: string;
  onToggleFavorite: (toolId: string) => void;
  onMouseEnter: (tool: Tool) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  onTrack?: (tool: Tool) => void;
  onCardClick?: (tool: Tool) => void;
  onCopy: (url: string) => void;
}

const ToolCard: React.FC<ToolCardProps> = ({
  tool, index, isFavorite, searchQuery,
  onToggleFavorite, onMouseEnter, onMouseMove, onMouseLeave,
  onTrack, onCardClick, onCopy,
}) => {
  const [imgError, setImgError] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite(tool.id);
  };

  const handleCopyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCopy(tool.url);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (onCardClick) {
      e.preventDefault();
      onCardClick(tool);
    } else {
      onTrack?.(tool);
    }
  };

  /* ── Card Destaque (pinned) ─────────────────────────────────────────────── */
  if (tool.pinned) {
    const { accentColor, gradientFrom } = tool.pinned;
    return (
      <div
        className="animate-fadeIn"
        style={{ animationDelay: `${Math.min(index * 35, 500)}ms`, animationFillMode: 'backwards' }}
      >
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleCardClick}
          className={`
            relative group flex flex-col items-center justify-center
            bg-gradient-to-br ${gradientFrom} to-white dark:from-slate-800 dark:to-slate-900
            rounded-3xl p-5 overflow-hidden
            border-[3px] shadow-lg hover:shadow-2xl
            transition-all duration-300 hover:-translate-y-2
            min-h-[180px]
          `}
          style={{ borderColor: accentColor }}
          onMouseEnter={() => onMouseEnter(tool)}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        >
          {/* Badge */}
          <div
            className="absolute top-0 right-0 text-white text-[9px] font-black px-2.5 py-1 rounded-bl-xl uppercase tracking-wider shadow-sm"
            style={{ backgroundColor: accentColor }}
          >
            {tool.pinned.badgeText ?? 'Destaque'}
          </div>

          {/* Favorito */}
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-2 left-2 w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200 z-10
              ${isFavorite
                ? 'opacity-100 bg-amber-50 text-amber-400 scale-100'
                : 'opacity-0 group-hover:opacity-100 bg-white/80 text-gray-300 hover:text-amber-400'
              }`}
            aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* Ícone */}
          <div className="w-16 h-16 flex items-center justify-center bg-white dark:bg-slate-700 rounded-full mb-3 shadow-md group-hover:scale-110 transition-transform duration-300">
            {!imgError ? (
              <img src={tool.iconUrl} alt={tool.name} className="w-10 h-10 object-contain" onError={() => setImgError(true)} />
            ) : (
              <span className="text-2xl">🔗</span>
            )}
          </div>

          {/* Nome */}
          <span className="text-base font-black uppercase text-center leading-tight" style={{ color: accentColor }}>
            <HighlightText text={tool.name} query={searchQuery} />
          </span>
        </a>
      </div>
    );
  }

  /* ── Card Normal ────────────────────────────────────────────────────────── */
  return (
    <div
      className="animate-fadeIn"
      style={{ animationDelay: `${Math.min(index * 35, 500)}ms`, animationFillMode: 'backwards' }}
    >
      <a
        href={tool.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleCardClick}
        className="
          relative group flex flex-col items-center justify-center
          bg-white dark:bg-slate-800
          rounded-2xl p-5 overflow-hidden
          border-2 border-transparent
          shadow-sm hover:shadow-xl hover:shadow-ctrl-blue/10
          hover:-translate-y-2 hover:border-gray-100 dark:hover:border-slate-700
          transition-all duration-300
          min-h-[180px]
          border-b-[3px] border-b-ctrl-blue/30 hover:border-b-ctrl-blue
        "
        onMouseEnter={() => onMouseEnter(tool)}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        {/* Favorito */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200 z-10
            ${isFavorite
              ? 'opacity-100 bg-amber-50 dark:bg-amber-900/30 text-amber-400 scale-100'
              : 'opacity-0 group-hover:opacity-100 bg-gray-50 dark:bg-slate-700 text-gray-300 hover:text-amber-400 dark:hover:text-amber-400'
            }`}
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Botão copiar link */}
        <button
          onClick={handleCopyClick}
          className="absolute top-2 left-2 w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200 z-10 opacity-0 group-hover:opacity-100 bg-gray-50 dark:bg-slate-700 text-gray-300 hover:text-ctrl-blue dark:hover:text-blue-400"
          aria-label="Copiar link da ferramenta"
          title="Copiar link"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>

        {/* Ícone */}
        <div className={`w-16 h-16 flex items-center justify-center ${tool.iconBg} dark:bg-slate-700 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300`}>
          {!imgError ? (
            <img
              src={tool.iconUrl}
              alt={tool.name}
              className="w-10 h-10 object-contain"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-2xl">🔗</span>
          )}
        </div>

        {/* Nome com highlight */}
        <span className="text-sm font-bold text-ctrl-blue dark:text-blue-300 uppercase text-center leading-tight line-clamp-2 px-1">
          <HighlightText text={tool.name} query={searchQuery} />
        </span>
      </a>
    </div>
  );
};

export default ToolCard;
