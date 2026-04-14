import React, { useEffect, useRef } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  totalVisible: number;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, totalVisible }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        inputRef.current?.blur();
        onChange('');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onChange]);

  return (
    <div className="max-w-2xl mx-auto mb-8">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400 group-focus-within:text-ctrl-orange transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="O que você quer criar hoje?"
          className="w-full pl-12 pr-20 py-4 text-base font-medium bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-2xl placeholder-gray-400 dark:placeholder-slate-500 text-gray-800 dark:text-white focus:outline-none focus:border-ctrl-orange focus:ring-4 focus:ring-ctrl-orange/20 shadow-lg shadow-blue-50/60 dark:shadow-none transition-all duration-200"
          autoComplete="off"
        />

        {/* Keyboard hint */}
        {!value && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg">
              /
            </kbd>
          </div>
        )}

        {/* Clear button */}
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Limpar busca"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Results count */}
      {value && (
        <p className="mt-2 text-center text-sm text-gray-500 dark:text-slate-400 animate-fadeIn">
          {totalVisible === 0
            ? 'Nenhuma ferramenta encontrada 😕'
            : `${totalVisible} ferramenta${totalVisible !== 1 ? 's' : ''} encontrada${totalVisible !== 1 ? 's' : ''} ✨`
          }
        </p>
      )}
    </div>
  );
};

export default SearchBar;
