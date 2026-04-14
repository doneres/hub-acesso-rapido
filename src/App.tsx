import React, { useMemo, useState } from 'react';
import { Category } from './types';
import { TOOLS } from './data/tools';
import { useTheme } from './hooks/useTheme';
import { useFavorites } from './hooks/useFavorites';
import { useTooltip } from './hooks/useTooltip';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import CategoryFilter from './components/CategoryFilter';
import ToolCard from './components/ToolCard';
import Tooltip from './components/Tooltip';
import BackToTop from './components/BackToTop';
import Footer from './components/Footer';

const App: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { tooltipState, handleMouseEnter, handleMouseMove, handleMouseLeave } = useTooltip();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('todos');

  const filteredTools = useMemo(() => {
    return TOOLS.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const matchesCategory =
        activeCategory === 'todos' ||
        (activeCategory === 'favoritos' ? isFavorite(tool.id) : tool.category === activeCategory);
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, favorites]);

  const handleCategoryChange = (category: Category) => {
    setActiveCategory(category);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#eef2f6] dark:bg-[#0f172a] bg-dot-pattern transition-colors duration-300">
      <Header isDark={isDark} onToggleTheme={toggleTheme} />

      <main className="flex-1 max-w-[1440px] w-full px-4 md:px-8 py-8 mx-auto">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          totalVisible={filteredTools.length}
        />

        <CategoryFilter
          active={activeCategory}
          onChange={handleCategoryChange}
          favoritesCount={favorites.length}
        />

        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4">
            {filteredTools.map(tool => (
              <ToolCard
                key={tool.id}
                tool={tool}
                isFavorite={isFavorite(tool.id)}
                onToggleFavorite={toggleFavorite}
                onMouseEnter={handleMouseEnter}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center animate-fadeIn">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-500 dark:text-slate-400 mb-2">
              Ops! Nada por aqui...
            </h3>
            <p className="text-gray-400 dark:text-slate-500 text-sm">
              {activeCategory === 'favoritos'
                ? 'Você ainda não favoritou nenhuma ferramenta. Clique no ❤️ nos cards!'
                : `Não encontramos "${searchQuery}" nessa categoria.`
              }
            </p>
          </div>
        )}
      </main>

      <Footer />
      <BackToTop />
      <Tooltip state={tooltipState} />
    </div>
  );
};

export default App;
