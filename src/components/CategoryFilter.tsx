import React from 'react';
import { Category, CategoryConfig } from '../types';
import { CATEGORIES } from '../data/tools';

/** Categorias virtuais que mostram badge de contagem igual a "Favoritos" */
const BADGE_CATS = new Set(['favoritos', 'recentes', 'populares']);

/** Categorias virtuais que ficam ocultas enquanto estiverem vazias */
const HIDE_WHEN_EMPTY = new Set(['recentes', 'populares']);

interface CategoryFilterProps {
  active: Category;
  onChange: (category: Category) => void;
  counts: Record<string, number>;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ active, onChange, counts }) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-4 w-full max-w-5xl mx-auto px-2">
      {CATEGORIES.map((cat: CategoryConfig) => {
        const count = counts[cat.id] ?? 0;

        // Esconde "Recentes" e "Populares" quando não há itens
        if (HIDE_WHEN_EMPTY.has(cat.id) && count === 0) return null;

        const isActive = active === cat.id;
        const isBadgeCat = BADGE_CATS.has(cat.id);
        const showNumber = cat.id !== 'todos' && !isBadgeCat && count > 0;
        const showBadge = isBadgeCat && count > 0;

        const badgeColor =
          cat.id === 'favoritos' ? (isActive ? 'bg-white/30 text-white' : 'bg-amber-500 text-white') :
          cat.id === 'recentes'  ? (isActive ? 'bg-white/30 text-white' : 'bg-slate-500 text-white') :
          cat.id === 'populares' ? (isActive ? 'bg-white/30 text-white' : 'bg-rose-500 text-white') :
          '';

        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`
              relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold
              transition-all duration-200 whitespace-nowrap
              focus:outline-none focus-visible:ring-2 focus-visible:ring-ctrl-blue
              ${isActive
                ? `${cat.activeColor} text-white shadow-md -translate-y-0.5`
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-2 border-gray-200 dark:border-slate-700 hover:border-ctrl-blue/30 hover:-translate-y-0.5 hover:shadow-sm'
              }
            `}
          >
            <span className="text-base leading-none">{cat.emoji}</span>
            <span>{cat.label}</span>

            {/* Badge de contagem para categorias virtuais */}
            {showBadge && (
              <span className={`ml-0.5 inline-flex items-center justify-center w-4 h-4 text-[10px] font-black rounded-full ${badgeColor}`}>
                {count > 9 ? '9+' : count}
              </span>
            )}

            {/* Número para categorias normais */}
            {showNumber && (
              <span className={`ml-0.5 text-[10px] font-bold tabular-nums ${isActive ? 'opacity-70' : 'text-gray-400 dark:text-slate-500'}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
