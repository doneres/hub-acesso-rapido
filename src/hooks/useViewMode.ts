import { useState, useCallback } from 'react';
import { ViewMode } from '../types';

const KEY = 'ctrl-play-view';

export function useViewMode() {
  const [mode, setMode] = useState<ViewMode>(() => {
    const stored = localStorage.getItem(KEY);
    return stored === 'list' ? 'list' : 'grid';
  });

  const toggleMode = useCallback(() => {
    setMode(prev => {
      const next: ViewMode = prev === 'grid' ? 'list' : 'grid';
      localStorage.setItem(KEY, next);
      return next;
    });
  }, []);

  return { mode, toggleMode };
}
