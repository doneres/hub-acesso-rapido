import { useState, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'ctrl-play-clicks';
const MAX_POPULAR = 12;
/** Mínimo de ferramentas diferentes clicadas para exibir a aba "Populares" */
const MIN_TOOLS_FOR_TAB = 4;

export function usePopularTools() {
  const [clicks, setClicks] = useState<Record<string, number>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Record<string, number>) : {};
    } catch {
      return {};
    }
  });

  const trackClick = useCallback((toolId: string) => {
    setClicks(prev => {
      const next = { ...prev, [toolId]: (prev[toolId] ?? 0) + 1 };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
  }, []);

  const popularIds = useMemo(() => {
    return Object.entries(clicks)
      .sort(([, a], [, b]) => b - a)
      .slice(0, MAX_POPULAR)
      .map(([id]) => id);
  }, [clicks]);

  /** Aba só aparece quando há dados suficientes para ser relevante */
  const hasEnoughData = Object.keys(clicks).length >= MIN_TOOLS_FOR_TAB;

  return { clicks, trackClick, popularIds, hasEnoughData };
}
