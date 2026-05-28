import React from 'react';
import { ArrowLeft, ExternalLink, Wifi, WifiOff } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../hooks/useTheme';

interface ProfessorPageProps {
  onBackToHub: () => void;
  onOpenRoadmaps: () => void;
}

interface ProfessorTool {
  id: string;
  name: string;
  desc: string;
  url: string;
  iconUrl: string;
  iconBg: string;
  local?: boolean;
}

const PROFESSOR_TOOLS: ProfessorTool[] = [
  {
    id: 'autoclass',
    name: 'AutoClass',
    desc: 'Sistema de gerenciamento de turmas e chamadas da Ctrl+Play.',
    url: 'http://192.168.1.254:3000/',
    iconUrl: 'https://ctrlplay.com.br/wp-content/uploads/2024/11/logo-colorido.svg',
    iconBg: 'bg-orange-50',
    local: true,
  },
  {
    id: 'sistema-eventos',
    name: 'Sistema de Eventos',
    desc: 'Gerenciamento de eventos e atividades da escola.',
    url: 'http://192.168.1.254:5173/login',
    iconUrl: 'https://www.google.com/s2/favicons?domain=google.com&sz=128',
    iconBg: 'bg-blue-50',
    local: true,
  },
  {
    id: 'avaliacao-pedagogica',
    name: 'Avaliação Pedagógica',
    desc: 'Sistema de avaliação pedagógica dos alunos da Ctrl+Play.',
    url: 'https://doneres.dev/sistema-avaliacao-pedagogica/',
    iconUrl: 'https://www.google.com/s2/favicons?domain=doneres.dev&sz=128',
    iconBg: 'bg-violet-50',
  },
  {
    id: 'loom',
    name: 'Loom',
    desc: 'Grave e compartilhe vídeos de tela com mensagens de voz.',
    url: 'https://www.loom.com/looms/videos',
    iconUrl: 'https://www.google.com/s2/favicons?domain=loom.com&sz=128',
    iconBg: 'bg-purple-50',
  },
  {
    id: 'google-calendar',
    name: 'Google Calendário',
    desc: 'Organize agenda, aulas e reuniões com o calendário do Google.',
    url: 'https://calendar.google.com/',
    iconUrl: 'https://www.google.com/s2/favicons?domain=calendar.google.com&sz=128',
    iconBg: 'bg-blue-50',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    desc: 'E-mail corporativo Google para comunicação com alunos e equipe.',
    url: 'https://mail.google.com/',
    iconUrl: 'https://www.google.com/s2/favicons?domain=mail.google.com&sz=128',
    iconBg: 'bg-red-50',
  },
];

const ProfessorPage: React.FC<ProfessorPageProps> = ({ onBackToHub, onOpenRoadmaps }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-[#eef2f6] dark:bg-[#0f172a] bg-dot-pattern transition-colors duration-300">
      <Header
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onOpenRoadmaps={onOpenRoadmaps}
      />

      <main className="flex-1 max-w-[1100px] w-full mx-auto px-4 md:px-8 py-10 md:py-14">

        {/* Voltar */}
        <button
          onClick={onBackToHub}
          className="flex items-center gap-2 mb-10 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-ctrl-blue dark:hover:text-blue-400 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Voltar ao Hub
        </button>

        {/* Header da página */}
        <div className="mb-10">
          <h1 className="text-2xl md:text-3xl font-black text-slate-700 dark:text-slate-100 mb-2">
            Área do{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ctrl-blue to-ctrl-orange">
              Professor
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Ferramentas exclusivas para os professores da Ctrl+Play.
          </p>
        </div>

        {/* Aviso de ferramentas locais */}
        <div className="flex items-start gap-3 mb-8 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40">
          <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
            <strong>Ferramentas de rede interna</strong> (AutoClass e Sistema de Eventos) só funcionam
            conectado à rede Wi-Fi da escola.
          </p>
        </div>

        {/* Grid de ferramentas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROFESSOR_TOOLS.map(tool => (
            <a
              key={tool.id}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
            >
              {/* Topo colorido */}
              <div className="h-1 w-full bg-gradient-to-r from-ctrl-blue to-ctrl-orange" />

              <div className="flex items-start gap-4 p-5">
                {/* Ícone */}
                <div className={`w-11 h-11 rounded-xl ${tool.iconBg} flex items-center justify-center shrink-0 border border-black/5`}>
                  <img
                    src={tool.iconUrl}
                    alt={tool.name}
                    className="w-6 h-6 object-contain"
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-black text-slate-700 dark:text-slate-100 truncate">
                      {tool.name}
                    </span>
                    {tool.local && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 uppercase tracking-wide shrink-0">
                        <Wifi className="w-2.5 h-2.5" />
                        Interna
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {tool.desc}
                  </p>
                </div>
              </div>

              {/* Rodapé do card */}
              <div className="mt-auto px-5 pb-4">
                <div className="flex items-center gap-1 text-xs font-bold text-ctrl-blue dark:text-blue-400 group-hover:text-ctrl-orange transition-colors">
                  <span>Acessar</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            </a>
          ))}
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default ProfessorPage;
