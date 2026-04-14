import { useState } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('favorites') || '[]');
    } catch {
      return [];
    }
  });

  const toggleFavorite = (toolId: string) => {
    setFavorites(prev => {
      const next = prev.includes(toolId)
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId];
      localStorage.setItem('favorites', JSON.stringify(next));
      return next;
    });
  };

  const isFavorite = (toolId: string) => favorites.includes(toolId);

  return { favorites, toggleFavorite, isFavorite };
}
