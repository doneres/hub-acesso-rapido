import React from 'react';
import {
  Video,
  BookOpen,
  HelpCircle,
  Wrench,
  Bug,
  MonitorCheck,
  ArrowLeft,
  Construction,
  Bell,
} from 'lucide-react';
import Header from '../components/Header';
import { useTheme } from '../hooks/useTheme';

interface SuportePageProps {
  onBackToHub: () => void;
}

/* ── Funcionalidades planejadas ─────────────────────────────────────── */
const FEATURES = [
  {
    icon: Video,
    title: 'Vídeos de Instalação',
    description:
      'Tutoriais em vídeo gravados pela equipe da Ctrl+Play ensinando a instalar cada ferramenta do hub no seu computador de casa.',
    color: '#f37021',
  },
  {
    icon: BookOpen,
    title: 'Guias Passo a Passo',
    description:
      'Instruções detalhadas com capturas de tela para Windows, Mac e Linux. Do download à primeira execução.',
    color: '#0054a6',
  },
  {
    icon: Wrench,
    title: 'Configuração do Ambiente',
    description:
      'Como configurar VS Code, Node.js, Python, Unity, Godot e as demais ferramentas que usamos nas aulas.',
    color: '#a855f7',
  },
  {
    icon: Bug,
    title: 'Solução de Problemas',
    description:
      'Os erros mais comuns que acontecem na instalação e como resolver cada um deles de forma simples.',
    color: '#ef4444',
  },
  {
    icon: HelpCircle,
    title: 'FAQ — Perguntas Frequentes',
    description:
      'Respostas rápidas para as dúvidas mais comuns dos nossos alunos sobre ferramentas, instalações e configurações.',
    color: '#22c55e',
  },
  {
    icon: MonitorCheck,
    title: 'Requisitos de Sistema',
    description:
      'Saiba quais são os requisitos mínimos de hardware para rodar cada ferramenta do hub sem travar o computador.',
    color: '#06b6d4',
  },
];

/* ════════════════════════════════════════════════════════════════════════
   SUPORTE PAGE
   ════════════════════════════════════════════════════════════════════════ */
const SuportePage: React.FC<SuportePageProps> = ({ onBackToHub }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-[#eef2f6] dark:bg-[#0f172a] bg-dot-pattern transition-colors duration-300">

      {/* Usa o mesmo Header do Hub */}
      <Header
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onOpenRoadmaps={onBackToHub}   /* no contexto desta tela, não há sentido abrir roadmaps — volta pro hub */
      />

      <main className="flex-1 max-w-[1100px] w-full mx-auto px-4 md:px-8 py-12 md:py-16">

        {/* ── Botão voltar ──────────────────────────────────────────── */}
        <button
          onClick={onBackToHub}
          className="flex items-center gap-2 mb-10 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-ctrl-blue dark:hover:text-blue-400 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Voltar ao Hub
        </button>

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <div className="text-center mb-14">

          {/* Ícone principal */}
          <div className="inline-flex items-center justify-center w-24 h-24 mb-6 rounded-3xl bg-gradient-to-br from-ctrl-orange/10 to-ctrl-orange/5 border-2 border-ctrl-orange/20 shadow-lg">
            <Construction className="w-12 h-12 text-ctrl-orange" strokeWidth={1.5} />
          </div>

          {/* Badge "Em Desenvolvimento" */}
          <div className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full border-2 border-amber-400/40 bg-amber-400/10">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-black text-amber-500 dark:text-amber-400 uppercase tracking-widest">
              Em Desenvolvimento
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-slate-700 dark:text-slate-100 mb-4 leading-tight">
            Central de{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ctrl-blue to-ctrl-orange">
              Ajuda & Suporte
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Estamos preparando uma central completa para ajudar você a instalar e configurar
            todas as ferramentas do hub no seu computador de casa. Em breve!
          </p>
        </div>

        {/* ── O que está chegando ───────────────────────────────────── */}
        <div className="mb-12">
          <h2 className="text-center text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-8">
            O que está sendo preparado para você
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden group"
                >
                  {/* Detalhe colorido no topo */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                    style={{ background: feat.color }}
                  />

                  {/* Badge "Em breve" */}
                  <span className="absolute top-4 right-4 text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Em breve
                  </span>

                  {/* Ícone */}
                  <div
                    className="inline-flex items-center justify-center w-11 h-11 rounded-xl mb-4"
                    style={{ background: `${feat.color}18`, color: feat.color }}
                  >
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </div>

                  <h3 className="font-black text-base text-slate-700 dark:text-slate-100 mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Enquanto isso... ─────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-ctrl-blue/10 flex items-center justify-center">
            <Bell className="w-7 h-7 text-ctrl-blue" strokeWidth={1.5} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-black text-lg text-slate-700 dark:text-slate-100 mb-1">
              Enquanto isso, fale com seu professor!
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Qualquer dúvida sobre instalação ou configuração, chame seu professor no grupo da turma
              ou presencialmente na escola. Estamos aqui para ajudar!
            </p>
          </div>
          <button
            onClick={onBackToHub}
            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full bg-ctrl-blue text-white text-sm font-black hover:bg-ctrl-blue/90 hover:-translate-y-0.5 transition-all shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Hub
          </button>
        </div>

      </main>

      {/* ── Footer simples ────────────────────────────────────────── */}
      <footer className="w-full bg-white dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800 mt-auto py-6 transition-colors duration-300">
        <p className="text-center text-gray-400 dark:text-slate-500 text-sm">
          © 2026 Ctrl+Play. Feito com 💜 para nossos alunos.
        </p>
      </footer>
    </div>
  );
};

export default SuportePage;
