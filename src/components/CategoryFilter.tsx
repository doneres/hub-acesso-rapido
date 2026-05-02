import React from 'react';
import { Category, CategoryConfig } from '../types';
import { CATEGORIES } from '../data/tools';

interface CategoryFilterProps {
  active: Category;
  onChange: (category: Category) => void;
  favoritesCount: number;
  counts: Record<string, number>;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ active, onChange, favoritesCount, counts }) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-4 w-full max-w-5xl mx-auto px-2">
      {CATEGORIES.map((cat: CategoryConfig) => {
        const isActive = active === cat.id;
        const isFavorites = cat.id === 'favoritos';
        const count = counts[cat.id] ?? 0;
        const showCount = cat.id !== 'todos' && !isFavorites && count > 0;

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

            {/* Favorites count badge */}
            {isFavorites && favoritesCount > 0 && (
              <span className={`
                ml-0.5 inline-flex items-center justify-center w-4 h-4 text-[10px] font-black rounded-full
                ${isActive ? 'bg-white/30 text-white' : 'bg-amber-500 text-white'}
              `}>
                {favoritesCount > 9 ? '9+' : favoritesCount}
              </span>
            )}

            {/* Tool count */}
            {showCount && (
              <span className={`
                ml-0.5 text-[10px] font-bold tabular-nums
                ${isActive ? 'opacity-70' : 'text-gray-400 dark:text-slate-500'}
              `}>
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
