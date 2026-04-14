import React from 'react';
import { createPortal } from 'react-dom';
import { TooltipState } from '../types';

const LEVEL_STYLES: Record<string, string> = {
  'Iniciante': 'bg-green-500',
  'Intermediário': 'bg-yellow-500',
  'Avançado': 'bg-red-500',
};

const LEVEL_LABELS: Record<string, string> = {
  'Iniciante': '🟢 Iniciante',
  'Intermediário': '🟡 Intermediário',
  'Avançado': '🔴 Avançado',
};

interface TooltipProps {
  state: TooltipState;
}

const Tooltip: React.FC<TooltipProps> = ({ state }) => {
  if (!state.visible || !state.tool) return null;

  const { tool, x, y } = state;

  return createPortal(
    <div
      className="fixed z-50 w-72 pointer-events-none animate-fadeIn"
      style={{ left: x, top: y }}
    >
      <div className="bg-white dark:bg-slate-800 border-2 border-ctrl-blue/20 dark:border-slate-600 rounded-2xl p-4 shadow-2xl">
        {/* Title */}
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100 dark:border-slate-700">
          <div className={`w-8 h-8 flex items-center justify-center ${tool.iconBg} dark:bg-slate-700 rounded-lg shrink-0`}>
            <img
              src={tool.iconUrl}
              alt={tool.name}
              className="w-5 h-5 object-contain"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
          <h3 className="font-black text-ctrl-blue dark:text-blue-300 text-sm leading-tight">
            {tool.name}
          </h3>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-slate-300 text-xs leading-relaxed mb-3">
          {tool.tooltip.desc}
        </p>

        {/* Usage + When */}
        <div className="space-y-1.5 mb-3">
          <div className="flex gap-2">
            <span className="text-[10px] font-bold text-ctrl-orange uppercase tracking-wide shrink-0 pt-0.5">
              Para que:
            </span>
            <p className="text-gray-600 dark:text-slate-300 text-xs leading-relaxed">
              {tool.tooltip.usage}
            </p>
          </div>
          <div className="flex gap-2">
            <span className="text-[10px] font-bold text-ctrl-orange uppercase tracking-wide shrink-0 pt-0.5">
              Quando:
            </span>
            <p className="text-gray-600 dark:text-slate-300 text-xs leading-relaxed">
              {tool.tooltip.when}
            </p>
          </div>
        </div>

        {/* Difficulty */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-700">
          <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide">
            Dificuldade
          </span>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-white ${LEVEL_STYLES[tool.tooltip.level] ?? 'bg-gray-500'}`}>
            {LEVEL_LABELS[tool.tooltip.level] ?? tool.tooltip.level}
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Tooltip;
