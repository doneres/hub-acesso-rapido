import React from 'react';
import {
  Sparkles, Star, Clock, Flame, Zap,
  Gamepad2, Code2, BookOpen, Trophy,
  BarChart2, Bot, Wrench, Puzzle,
  Globe, Rocket, Palette, Database,
  FlaskConical, Shield, Medal, Lightbulb,
  type LucideIcon,
} from 'lucide-react';
import { Category, CategoryConfig } from '../types';
import { CATEGORIES } from '../data/tools';

/* ── Mapeamento de ícones por categoria ────────────────────────────────── */
const ICONS: Record<string, LucideIcon> = {
  todos:               Sparkles,
  favoritos:           Star,
  recentes:            Clock,
  populares:           Flame,
  novos:               Zap,
  'jogos-design':      Gamepad2,
  programacao:         Code2,
  'educacao-logica':   BookOpen,
  'pratica-desafios':  Trophy,
  dados:               BarChart2,
  ia:                  Bot,
  ferramentas:         Wrench,
  frameworks:          Puzzle,
  'apis-publicas':     Globe,
  devops:              Rocket,
  'design-prototipacao': Palette,
  'bancos-dados':      Database,
  testes:              FlaskConical,
  seguranca:           Shield,
  'competicao-codigo': Medal,
  hackathons:          Lightbulb,
};

/** Categorias virtuais que ficam ocultas enquanto o count for zero */
const HIDE_WHEN_EMPTY = new Set(['recentes', 'populares', 'novos']);

/** Categorias virtuais que exibem badge de contagem (como favoritos) */
const BADGE_CATS = new Set(['favoritos', 'recentes', 'populares', 'novos']);

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

        // Esconde recentes/populares quando vazios
        if (HIDE_WHEN_EMPTY.has(cat.id) && count === 0) return null;

        const isActive    = active === cat.id;
        const isBadgeCat  = BADGE_CATS.has(cat.id);
        const showNumber  = cat.id !== 'todos' && !isBadgeCat && count > 0;
        const showBadge   = isBadgeCat && count > 0;

        const Icon = ICONS[cat.id];

        const badgeColor =
          cat.id === 'favoritos' ? (isActive ? 'bg-white/30 text-white' : 'bg-amber-500 text-white') :
          cat.id === 'recentes'  ? (isActive ? 'bg-white/30 text-white' : 'bg-slate-500 text-white') :
          cat.id === 'populares' ? (isActive ? 'bg-white/30 text-white' : 'bg-rose-500 text-white') :
          cat.id === 'novos'     ? (isActive ? 'bg-white/30 text-white' : 'bg-emerald-500 text-white') :
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
                : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-2 border-gray-300 dark:border-slate-700 hover:border-ctrl-blue/50 hover:-translate-y-0.5 hover:shadow-sm'
              }
            `}
          >
            {Icon && <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={2.2} />}
            <span>{cat.label}</span>

            {/* Badge de contagem (favoritos / recentes / populares) */}
            {showBadge && (
              <span className={`ml-0.5 inline-flex items-center justify-center w-4 h-4 text-[10px] font-black rounded-full ${badgeColor}`}>
                {count > 9 ? '9+' : count}
              </span>
            )}

            {/* Número para categorias normais */}
            {showNumber && (
              <span className={`ml-0.5 text-[10px] font-bold tabular-nums ${isActive ? 'opacity-70' : 'text-gray-500 dark:text-slate-500'}`}>
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
