import React, { useEffect } from 'react';
import { Tool } from '../types';

const LEVEL_COLORS: Record<string, string> = {
  Iniciante:     'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400',
  Intermediário: 'text-amber-600  bg-amber-50  dark:bg-amber-900/30  dark:text-amber-400',
  Avançado:      'text-rose-600   bg-rose-50   dark:bg-rose-900/30   dark:text-rose-400',
};

interface MobileToolModalProps {
  tool: Tool | null;
  isOpen: boolean;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onOpen: (tool: Tool) => void;
}

const MobileToolModal: React.FC<MobileToolModalProps> = ({
  tool, isOpen, isFavorite, onClose, onToggleFavorite, onOpen,
}) => {
  /* Trava o scroll do body quando o modal está aberto */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!tool) return null;

  const levelStyle = LEVEL_COLORS[tool.tooltip.level] ?? '';

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out max-h-[88vh] overflow-y-auto ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <div className="w-10 h-1.5 rounded-full bg-gray-200 dark:bg-slate-600" />
        </div>

        <div className="px-5 pb-10 pt-2">
          {/* Cabeçalho */}
          <div className="flex items-center gap-4 mb-5">
            <div className={`w-14 h-14 flex items-center justify-center ${tool.iconBg} dark:bg-slate-700 rounded-2xl shrink-0 shadow-sm`}>
              <img src={tool.iconUrl} alt={tool.name} className="w-9 h-9 object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-black text-gray-800 dark:text-white leading-tight">{tool.name}</h3>
              <span className={`inline-block mt-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${levelStyle}`}>
                {tool.tooltip.level}
              </span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(tool.id); }}
              className={`shrink-0 w-11 h-11 flex items-center justify-center rounded-2xl border-2 transition-all duration-200 ${
                isFavorite
                  ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/30 text-amber-400'
                  : 'border-gray-200 dark:border-slate-600 text-gray-300 dark:text-slate-500'
              }`}
              aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

          {/* Informações */}
          <div className="space-y-4 mb-6 bg-gray-50 dark:bg-slate-700/50 rounded-2xl p-4">
            <InfoRow emoji="📖" label="O que é" text={tool.tooltip.desc} />
            <InfoRow emoji="🛠️" label="Como usar" text={tool.tooltip.usage} />
            <InfoRow emoji="⏰" label="Quando usar" text={tool.tooltip.when} />
          </div>

          {/* Ações */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 font-bold text-sm transition-colors active:bg-gray-50 dark:active:bg-slate-700"
            >
              Fechar
            </button>
            <button
              onClick={() => { onOpen(tool); onClose(); }}
              className="flex-1 py-3.5 rounded-2xl bg-ctrl-blue text-white font-bold text-sm shadow-lg shadow-ctrl-blue/30 transition-opacity active:opacity-80"
            >
              Abrir ferramenta ↗
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const InfoRow: React.FC<{ emoji: string; label: string; text: string }> = ({ emoji, label, text }) => (
  <div className="flex gap-3">
    <span className="text-lg leading-none shrink-0 mt-0.5">{emoji}</span>
    <div>
      <p className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-gray-700 dark:text-slate-300 leading-snug">{text}</p>
    </div>
  </div>
);

export default MobileToolModal;
