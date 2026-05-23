import React from 'react';
import { createPortal } from 'react-dom';
import { TooltipState } from '../types';

const LEVEL_CONFIG: Record<string, { pill: string; dot: string; label: string }> = {
  Iniciante:     { pill: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400', dot: 'bg-emerald-400', label: 'Iniciante' },
  Intermediário: { pill: 'bg-amber-50  text-amber-600  dark:bg-amber-900/40  dark:text-amber-400',  dot: 'bg-amber-400',  label: 'Intermediário' },
  Avançado:      { pill: 'bg-rose-50   text-rose-600   dark:bg-rose-900/40   dark:text-rose-400',   dot: 'bg-rose-400',   label: 'Avançado' },
};

interface TooltipProps {
  state: TooltipState;
}

const Tooltip: React.FC<TooltipProps> = ({ state }) => {
  if (!state.visible || !state.tool) return null;

  const { tool, x, y } = state;
  const level = LEVEL_CONFIG[tool.tooltip.level];

  return createPortal(
    <div
      className="fixed z-50 w-72 pointer-events-none animate-fadeIn"
      style={{ left: x, top: y }}
    >
      <div className="bg-white dark:bg-slate-800 border-2 border-ctrl-blue/20 dark:border-slate-600 rounded-2xl p-4 shadow-2xl">

        {/* Cabeçalho */}
        <div className="flex items-center gap-2.5 mb-3 pb-2.5 border-b border-gray-100 dark:border-slate-700">
          <div className={`w-9 h-9 flex items-center justify-center ${tool.iconBg} dark:bg-slate-700 rounded-xl shrink-0`}>
            <img
              src={tool.iconUrl}
              alt={tool.name}
              className="w-5 h-5 object-contain"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-ctrl-blue dark:text-blue-300 text-sm leading-tight truncate">
              {tool.name}
            </h3>
          </div>
        </div>

        {/* Descrição */}
        <p className="text-gray-600 dark:text-slate-300 text-xs leading-relaxed mb-3">
          {tool.tooltip.desc}
        </p>

        {/* Para que / Quando */}
        <div className="space-y-2 mb-3">
          <InfoLine label="Para que" text={tool.tooltip.usage} />
          <InfoLine label="Quando" text={tool.tooltip.when} />
        </div>

        {/* Dificuldade */}
        {level && (
          <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 dark:border-slate-700">
            <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide">
              Dificuldade
            </span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${level.pill}`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${level.dot}`} />
              {level.label}
            </span>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

const InfoLine: React.FC<{ label: string; text: string }> = ({ label, text }) => (
  <div className="flex gap-2">
    <span className="text-[10px] font-bold text-ctrl-orange uppercase tracking-wide shrink-0 pt-0.5 leading-relaxed">
      {label}:
    </span>
    <p className="text-gray-600 dark:text-slate-300 text-xs leading-relaxed">{text}</p>
  </div>
);

export default Tooltip;
