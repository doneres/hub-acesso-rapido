import { useState, useCallback } from 'react';

const STORAGE_KEY = 'ctrl-play-recentes';
const MAX_RECENTS = 10;

export function useRecentTools() {
  const [recentIds, setRecentIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  const addRecent = useCallback((toolId: string) => {
    setRecentIds(prev => {
      const next = [toolId, ...prev.filter(id => id !== toolId)].slice(0, MAX_RECENTS);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
  }, []);

  const clearRecents = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
    setRecentIds([]);
  }, []);

  return { recentIds, addRecent, clearRecents };
}
