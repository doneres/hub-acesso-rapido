import React, { useEffect, useState } from 'react';
import {
  ArrowLeft, ExternalLink, TrendingUp, Clock,
  MessageSquare, RefreshCw, Newspaper, Globe, Zap,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../hooks/useTheme';

interface HNStory {
  objectID: string;
  title: string;
  url?: string;
  author: string;
  points: number;
  num_comments: number;
  created_at: string;
}

const NEWS_SOURCES = [
  { name: 'Hacker News',       url: 'https://news.ycombinator.com/',         desc: 'Discussões técnicas da comunidade Y Combinator',       lang: 'EN', color: '#FF6600' },
  { name: 'Tecnoblog',         url: 'https://tecnoblog.net/',                 desc: 'Principal portal de tecnologia em português',          lang: 'PT', color: '#0054a6' },
  { name: 'Canaltech',         url: 'https://canaltech.com.br/',              desc: 'Notícias, análises e reviews de tecnologia',           lang: 'PT', color: '#e5212d' },
  { name: 'The Verge',         url: 'https://www.theverge.com/',              desc: 'Jornalismo de tecnologia e cultura digital',           lang: 'EN', color: '#ffffff' },
  { name: 'TechCrunch',        url: 'https://techcrunch.com/',                desc: 'Startups, IA e grandes empresas de tech',              lang: 'EN', color: '#0a9f3c' },
  { name: 'Dev.to',            url: 'https://dev.to/',                        desc: 'Artigos e tutoriais escritos por desenvolvedores',      lang: 'EN', color: '#3b49df' },
  { name: 'InfoQ Brasil',      url: 'https://www.infoq.com/br/',              desc: 'Arquitetura, DevOps e desenvolvimento em PT-BR',       lang: 'PT', color: '#0077b5' },
  { name: 'MIT Tech Review',   url: 'https://www.technologyreview.com/',      desc: 'Análises profundas sobre tecnologia e ciência',        lang: 'EN', color: '#ff0000' },
  { name: 'Wired',             url: 'https://www.wired.com/',                 desc: 'Tecnologia, cultura digital e sociedade',              lang: 'EN', color: '#1a1a1a' },
  { name: 'TechTudo',          url: 'https://www.techtudo.com.br/',           desc: 'Tutoriais, reviews e novidades de tecnologia',         lang: 'PT', color: '#005faf' },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return `${Math.floor(diff / 60_000)}min atrás`;
  if (h < 24) return `${h}h atrás`;
  return `${Math.floor(h / 24)}d atrás`;
}

function domain(url?: string): string {
  if (!url) return 'news.ycombinator.com';
  try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
}

const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 animate-pulse">
    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/4 mb-3" />
    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full mb-2" />
    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-4" />
    <div className="flex gap-4">
      <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-16" />
      <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-16" />
    </div>
  </div>
);

interface NoticiasPageProps {
  onBackToHub: () => void;
  onOpenRoadmaps: () => void;
}

const NoticiasPage: React.FC<NoticiasPageProps> = ({ onBackToHub, onOpenRoadmaps }) => {
  const { isDark, toggleTheme } = useTheme();
  const [stories, setStories] = useState<HNStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<'top' | 'new'>('top');

  const fetchNews = (mode: 'top' | 'new') => {
    setLoading(true);
    setError(false);
    const endpoint = mode === 'top'
      ? 'https://hn.algolia.com/api/v1/search?query=technology+programming+AI&tags=story&hitsPerPage=24'
      : 'https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=24&query=technology+programming';

    fetch(endpoint)
      .then(r => r.json())
      .then(data => {
        const hits: HNStory[] = (data.hits || []).filter((h: HNStory) => h.title && h.points > 0);
        setStories(hits);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  };

  useEffect(() => { fetchNews(tab); }, [tab]);

  return (
    <div className="min-h-screen flex flex-col bg-[#eef2f6] dark:bg-[#0f172a] bg-dot-pattern transition-colors duration-300">
      <Header isDark={isDark} onToggleTheme={toggleTheme} onOpenRoadmaps={onOpenRoadmaps} />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 md:px-8 py-10">

        {/* Voltar */}
        <button
          onClick={onBackToHub}
          className="flex items-center gap-2 mb-8 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-ctrl-blue dark:hover:text-blue-400 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Voltar ao Hub
        </button>

        {/* Hero */}
        <div className="relative rounded-3xl overflow-hidden mb-10 bg-gradient-to-br from-ctrl-blue via-blue-700 to-ctrl-orange p-px">
          <div className="rounded-3xl bg-white dark:bg-slate-900 px-8 py-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-ctrl-blue/10 border border-ctrl-blue/20 flex items-center justify-center">
                <Newspaper className="w-6 h-6 text-ctrl-blue" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-ctrl-blue/60 dark:text-blue-400/60">
                  Ao vivo
                </p>
                <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 leading-tight">
                  Notícias{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-ctrl-blue to-ctrl-orange">
                    Tech
                  </span>
                </h1>
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg">
              Histórias em alta da comunidade global de desenvolvedores, atualizadas em tempo real.
              Fique por dentro do que está acontecendo no mundo da tecnologia.
            </p>
          </div>
        </div>

        {/* Tabs + Refresh */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex gap-2">
            <button
              onClick={() => setTab('top')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-black transition-all ${
                tab === 'top'
                  ? 'bg-ctrl-blue text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:border-ctrl-blue/30'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Em Alta
            </button>
            <button
              onClick={() => setTab('new')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-black transition-all ${
                tab === 'new'
                  ? 'bg-ctrl-blue text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:border-ctrl-blue/30'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Recentes
            </button>
          </div>
          <button
            onClick={() => fetchNews(tab)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-ctrl-orange/40 hover:text-ctrl-orange transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        {/* News Grid */}
        {error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
              <Globe className="w-8 h-8 text-red-400" strokeWidth={1.5} />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-4">
              Não foi possível carregar as notícias.
            </p>
            <button
              onClick={() => fetchNews(tab)}
              className="px-5 py-2.5 rounded-full bg-ctrl-blue text-white text-sm font-black hover:bg-ctrl-blue/90 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-12">
            {loading
              ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
              : stories.map(story => (
                  <a
                    key={story.objectID}
                    href={story.url || `https://news.ycombinator.com/item?id=${story.objectID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 uppercase tracking-wide truncate max-w-[70%]">
                        {domain(story.url)}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 ml-2">
                        {timeAgo(story.created_at)}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-100 leading-snug mb-3 flex-1 group-hover:text-ctrl-blue dark:group-hover:text-blue-400 transition-colors line-clamp-3">
                      {story.title}
                    </h3>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {story.points} pts
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {story.num_comments}
                      </span>
                      <span className="flex items-center gap-1 ml-auto text-ctrl-blue dark:text-blue-400 font-bold group-hover:text-ctrl-orange transition-colors">
                        Ler
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </a>
                ))
            }
          </div>
        )}

        {/* Fontes confiáveis */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="h-px flex-1 bg-gray-200 dark:bg-slate-700" />
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-3">
              Fontes Confiáveis
            </h2>
            <div className="h-px flex-1 bg-gray-200 dark:bg-slate-700" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {NEWS_SOURCES.map(src => (
              <a
                key={src.url}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-black/10"
                  style={{ background: src.color === '#ffffff' ? '#f1f5f9' : src.color }}
                >
                  <Globe className="w-4 h-4 text-white" style={{ color: src.color === '#ffffff' || src.color === '#1a1a1a' ? '#64748b' : 'white' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-black text-slate-700 dark:text-slate-100 truncate">{src.name}</span>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide shrink-0 ${
                      src.lang === 'PT'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    }`}>
                      {src.lang}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight line-clamp-2">{src.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default NoticiasPage;
