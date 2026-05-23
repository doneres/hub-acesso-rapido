import React, { useState } from 'react';
import { Copy } from 'lucide-react';
import { Tool } from '../types';
import HighlightText from './HighlightText';

const LEVEL_STYLES: Record<string, string> = {
  Iniciante:     'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  Intermediário: 'bg-amber-50  text-amber-600  dark:bg-amber-900/30  dark:text-amber-400',
  Avançado:      'bg-rose-50   text-rose-600   dark:bg-rose-900/30   dark:text-rose-400',
};

interface ToolListItemProps {
  tool: Tool;
  index: number;
  isFavorite: boolean;
  searchQuery: string;
  onToggleFavorite: (id: string) => void;
  onTrack?: (tool: Tool) => void;
  onCardClick?: (tool: Tool) => void;
  onCopy: (url: string) => void;
}

const ToolListItem: React.FC<ToolListItemProps> = ({
  tool, index, isFavorite, searchQuery,
  onToggleFavorite, onTrack, onCardClick, onCopy,
}) => {
  const [imgError, setImgError] = useState(false);
  const levelStyle = LEVEL_STYLES[tool.tooltip.level] ?? '';

  const handleClick = (e: React.MouseEvent) => {
    if (onCardClick) {
      e.preventDefault();
      onCardClick(tool);
    } else {
      onTrack?.(tool);
    }
  };

  return (
    <div
      className="animate-fadeIn"
      style={{ animationDelay: `${Math.min(index * 22, 320)}ms`, animationFillMode: 'backwards' }}
    >
      <a
        href={tool.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="group flex items-center gap-4 bg-white dark:bg-slate-800 rounded-2xl px-4 py-3.5 border-2 border-transparent hover:border-ctrl-blue/20 dark:hover:border-slate-600 shadow-sm hover:shadow-md transition-all duration-200"
      >
        {/* Ícone */}
        <div className={`w-11 h-11 flex items-center justify-center ${tool.iconBg} dark:bg-slate-700 rounded-xl shrink-0 group-hover:scale-105 transition-transform duration-200`}>
          {!imgError ? (
            <img
              src={tool.iconUrl}
              alt={tool.name}
              className="w-7 h-7 object-contain"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-lg">🔗</span>
          )}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-sm font-black text-ctrl-blue dark:text-blue-300">
              <HighlightText text={tool.name} query={searchQuery} />
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${levelStyle}`}>
              {tool.tooltip.level}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-1">
            <HighlightText text={tool.tooltip.desc} query={searchQuery} />
          </p>
        </div>

        {/* Botões de ação */}
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          {/* Copiar link */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCopy(tool.url); }}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 hover:text-ctrl-blue dark:hover:text-blue-400 transition-colors"
            title="Copiar link"
            aria-label="Copiar link"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {/* Favorito */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(tool.id); }}
            className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${
              isFavorite
                ? 'text-amber-400 bg-amber-50 dark:bg-amber-900/30'
                : 'text-gray-300 hover:text-amber-400 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
            title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
      </a>
    </div>
  );
};

export default ToolListItem;
