import React from 'react';
import { ArrowLeft, Construction, Wrench } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../hooks/useTheme';

interface ProfessorPageProps {
  onBackToHub: () => void;
}

const ProfessorPage: React.FC<ProfessorPageProps> = ({ onBackToHub }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-[#eef2f6] dark:bg-[#0f172a] bg-dot-pattern transition-colors duration-300">
      <Header
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onOpenRoadmaps={onBackToHub}
      />

      <main className="flex-1 max-w-[1100px] w-full mx-auto px-4 md:px-8 py-12 md:py-16">

        <button
          onClick={onBackToHub}
          className="flex items-center gap-2 mb-10 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-ctrl-blue dark:hover:text-blue-400 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Voltar ao Hub
        </button>

        <div className="flex flex-col items-center justify-center py-12 text-center">

          <div className="inline-flex items-center justify-center w-24 h-24 mb-6 rounded-3xl bg-gradient-to-br from-ctrl-orange/10 to-ctrl-orange/5 border-2 border-ctrl-orange/20 shadow-lg">
            <Construction className="w-12 h-12 text-ctrl-orange" strokeWidth={1.5} />
          </div>

          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border-2 border-amber-400/40 bg-amber-400/10">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-black text-amber-500 dark:text-amber-400 uppercase tracking-widest">
              Em Desenvolvimento
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-slate-700 dark:text-slate-100 mb-4 leading-tight">
            Área do{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ctrl-blue to-ctrl-orange">
              Professor
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed mb-10">
            Estamos preparando um espaço exclusivo com ferramentas especiais para os professores da Ctrl+Play.
            Em breve você terá acesso a tudo que precisa para as suas aulas!
          </p>

          <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm max-w-md w-full">
            <Wrench className="w-5 h-5 text-ctrl-orange shrink-0" />
            <p className="text-sm text-slate-500 dark:text-slate-400 text-left">
              As ferramentas para professores serão adicionadas em breve. Fique de olho!
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfessorPage;
