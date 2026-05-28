import React, { useEffect, useState } from 'react';
import {
  ArrowLeft, ExternalLink, TrendingUp, Clock,
  MessageSquare, RefreshCw, Newspaper, Globe, Zap,
  Heart, BookOpen,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../hooks/useTheme';

/* ── Interfaces ─────────────────────────────────────────────────────────── */

interface HNStory {
  objectID: string;
  title: string;
  url?: string;
  author: string;
  points: number;
  num_comments: number;
  created_at: string;
}

interface DevArticle {
  id: number;
  title: string;
  url: string;
  user: { name: string };
  public_reactions_count: number;
  comments_count: number;
  published_at: string;
  tag_list: string[];
  cover_image: string | null;
  social_image: string | null;
  reading_time_minutes: number;
  description: string;
}

type Tab = 'top' | 'new' | 'ptbr';

/* ── Fontes curadas ─────────────────────────────────────────────────────── */

const NEWS_SOURCES = [
  { name: 'Tecnoblog',       url: 'https://tecnoblog.net/',               desc: 'Principal portal de tecnologia em português', lang: 'PT', color: '#0054a6' },
  { name: 'Canaltech',       url: 'https://canaltech.com.br/',            desc: 'Notícias, análises e reviews de tecnologia',  lang: 'PT', color: '#e5212d' },
  { name: 'TechTudo',        url: 'https://www.techtudo.com.br/',         desc: 'Tutoriais, reviews e novidades de tecnologia', lang: 'PT', color: '#005faf' },
  { name: 'InfoQ Brasil',    url: 'https://www.infoq.com/br/',            desc: 'Arquitetura, DevOps e dev em PT-BR',          lang: 'PT', color: '#0077b5' },
  { name: 'Hacker News',    url: 'https://news.ycombinator.com/',         desc: 'Discussões técnicas da comunidade YCombinator', lang: 'EN', color: '#FF6600' },
  { name: 'The Verge',      url: 'https://www.theverge.com/',             desc: 'Jornalismo de tecnologia e cultura digital',  lang: 'EN', color: '#7c3aed' },
  { name: 'TechCrunch',     url: 'https://techcrunch.com/',               desc: 'Startups, IA e grandes empresas de tech',    lang: 'EN', color: '#0a9f3c' },
  { name: 'Dev.to',         url: 'https://dev.to/',                       desc: 'Artigos e tutoriais por desenvolvedores',     lang: 'EN', color: '#3b49df' },
  { name: 'MIT Tech Review', url: 'https://www.technologyreview.com/',    desc: 'Análises profundas sobre tecnologia e ciência', lang: 'EN', color: '#c0392b' },
  { name: 'Wired',          url: 'https://www.wired.com/',                desc: 'Tecnologia, cultura digital e sociedade',     lang: 'EN', color: '#1a1a1a' },
];

/* ── Helpers ─────────────────────────────────────────────────────────────── */

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

/* gera cor determinística a partir da string do domínio */
function domainColor(d: string): string {
  const palette = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444',
    '#f59e0b', '#10b981', '#06b6d4', '#6366f1',
    '#f97316', '#14b8a6',
  ];
  let h = 0;
  for (let i = 0; i < d.length; i++) h = d.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
}

/* ── Skeleton ─────────────────────────────────────────────────────────────── */

const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden animate-pulse flex">
    <div className="w-20 shrink-0 bg-gray-200 dark:bg-slate-700" />
    <div className="flex-1 p-4">
      <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-3" />
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full mb-2" />
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-4/5 mb-4" />
      <div className="flex gap-4">
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-16" />
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-16" />
      </div>
    </div>
  </div>
);

/* ── Card de notícia HN ──────────────────────────────────────────────────── */

const HNCard: React.FC<{ story: HNStory }> = ({ story }) => {
  const d = domain(story.url);
  const color = domainColor(d);
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${d}&sz=128`;

  return (
    <a
      href={story.url || `https://news.ycombinator.com/item?id=${story.objectID}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Sidebar visual */}
      <div
        className="w-20 shrink-0 flex flex-col items-center justify-center gap-2.5 p-3"
        style={{ background: `${color}14`, borderRight: `3px solid ${color}40` }}
      >
        <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-700 border border-white/20 flex items-center justify-center overflow-hidden shadow-sm">
          <img
            src={faviconUrl}
            alt={d}
            className="w-8 h-8 object-contain"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
        <div
          className="text-[11px] font-black tabular-nums"
          style={{ color }}
        >
          {story.points}
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 ml-0.5">pts</span>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 p-4 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span
              className="text-[10px] font-black px-2 py-0.5 rounded-full truncate max-w-[50%]"
              style={{ background: `${color}12`, color }}
            >
              {d}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo(story.created_at)}
            </span>
          </div>

          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-100 leading-snug mb-3 line-clamp-2 group-hover:text-ctrl-blue dark:group-hover:text-blue-400 transition-colors">
            {story.title}
          </h3>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {story.points} pontos
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {story.num_comments} comentários
          </span>
          <span
            className="flex items-center gap-1 ml-auto font-bold group-hover:text-ctrl-orange transition-colors"
            style={{ color: color }}
          >
            Ler
            <ExternalLink className="w-3 h-3" />
          </span>
        </div>
      </div>
    </a>
  );
};

/* ── Card dev.to PT-BR ───────────────────────────────────────────────────── */

const DevCard: React.FC<{ article: DevArticle }> = ({ article }) => {
  const hasImage = article.cover_image || article.social_image;
  const imgUrl = article.cover_image || article.social_image || '';

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Imagem de capa */}
      {hasImage ? (
        <div className="h-36 overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0">
          <img
            src={imgUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
      ) : (
        <div
          className="h-10 shrink-0"
          style={{ background: 'linear-gradient(135deg, #3b49df22, #3b49df11)' }}
        />
      )}

      <div className="flex-1 p-4 flex flex-col">
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {article.tag_list.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 uppercase tracking-wide"
            >
              #{tag}
            </span>
          ))}
        </div>

        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-100 leading-snug mb-2 flex-1 line-clamp-3 group-hover:text-ctrl-blue dark:group-hover:text-blue-400 transition-colors">
          {article.title}
        </h3>

        {article.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3 line-clamp-2">
            {article.description}
          </p>
        )}

        <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {article.public_reactions_count}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {article.comments_count}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {article.reading_time_minutes} min
          </span>
          <span className="flex items-center gap-1 ml-auto font-bold text-indigo-500 group-hover:text-ctrl-orange transition-colors">
            Ler
            <ExternalLink className="w-3 h-3" />
          </span>
        </div>
      </div>
    </a>
  );
};

/* ── Props ───────────────────────────────────────────────────────────────── */

interface NoticiasPageProps {
  onBackToHub: () => void;
  onOpenRoadmaps: () => void;
}

/* ── Página ──────────────────────────────────────────────────────────────── */

const NoticiasPage: React.FC<NoticiasPageProps> = ({ onBackToHub, onOpenRoadmaps }) => {
  const { isDark, toggleTheme } = useTheme();

  const [hnStories, setHnStories]     = useState<HNStory[]>([]);
  const [devArticles, setDevArticles] = useState<DevArticle[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(false);
  const [tab, setTab]                 = useState<Tab>('top');

  const fetchHN = (mode: 'top' | 'new') => {
    setLoading(true);
    setError(false);
    const endpoint = mode === 'top'
      ? 'https://hn.algolia.com/api/v1/search?query=technology+programming+AI&tags=story&hitsPerPage=24'
      : 'https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=24&query=technology+programming';

    fetch(endpoint)
      .then(r => r.json())
      .then(data => {
        const hits: HNStory[] = (data.hits || []).filter((h: HNStory) => h.title && h.points > 0);
        setHnStories(hits);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  };

  const fetchDevTo = () => {
    setLoading(true);
    setError(false);
    fetch('https://dev.to/api/articles?tags=portuguese,brasil,pt-br&per_page=24&sort_by=hotness_score')
      .then(r => r.json())
      .then((data: DevArticle[]) => {
        setDevArticles(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  };

  useEffect(() => {
    if (tab === 'ptbr') fetchDevTo();
    else fetchHN(tab);
  }, [tab]);

  const handleRefresh = () => {
    if (tab === 'ptbr') fetchDevTo();
    else fetchHN(tab);
  };

  const TABS: { id: Tab; label: string; icon: React.ElementType; color: string }[] = [
    { id: 'top',  label: 'Em Alta',   icon: TrendingUp, color: '#3b82f6' },
    { id: 'new',  label: 'Recentes',  icon: Zap,        color: '#f59e0b' },
    { id: 'ptbr', label: 'PT-BR',     icon: Globe,      color: '#22c55e' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#eef2f6] dark:bg-[#0f172a] transition-colors duration-300">
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

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <div className="relative rounded-3xl overflow-hidden mb-10 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-8 md:p-10">
          {/* Padrão de fundo */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 50%, #8b5cf6 0%, transparent 50%)' }} />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
              <Newspaper className="w-7 h-7 text-blue-400" strokeWidth={1.5} />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-green-400">Ao Vivo</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2">
                Notícias{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  Tech
                </span>
              </h1>
              <p className="text-sm text-white/50 max-w-lg">
                Histórias em alta da comunidade global de desenvolvedores e artigos em PT-BR.
                Fique por dentro do que está acontecendo no mundo da tecnologia.
              </p>
            </div>
          </div>
        </div>

        {/* ── Tabs + Refresh ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex gap-1.5 bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
            {TABS.map(t => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black transition-all"
                  style={{
                    background: active ? t.color : 'transparent',
                    color: active ? '#fff' : (isDark ? '#94a3b8' : '#64748b'),
                    boxShadow: active ? `0 2px 8px ${t.color}40` : 'none',
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-ctrl-orange/40 hover:text-ctrl-orange transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        {/* ── Aviso PT-BR ─────────────────────────────────────────────────── */}
        {tab === 'ptbr' && !loading && (
          <div className="flex items-start gap-3 mb-5 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40">
            <Globe className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
            <p className="text-xs text-green-700 dark:text-green-300 leading-relaxed">
              <strong>Artigos em Português</strong> — conteúdo publicado por desenvolvedores brasileiros no dev.to,
              com tutoriais, projetos e experiências em PT-BR.
            </p>
          </div>
        )}

        {/* ── Conteúdo ─────────────────────────────────────────────────────── */}
        {error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
              <Globe className="w-8 h-8 text-red-400" strokeWidth={1.5} />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-4">
              Não foi possível carregar as notícias.
            </p>
            <button
              onClick={handleRefresh}
              className="px-5 py-2.5 rounded-full bg-ctrl-blue text-white text-sm font-black hover:bg-ctrl-blue/90 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        ) : loading ? (
          tab === 'ptbr' ? (
            /* Skeleton dev.to (cards com imagem) */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-12">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden animate-pulse">
                  <div className="h-36 bg-gray-200 dark:bg-slate-700" />
                  <div className="p-4">
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-3" />
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full mb-2" />
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Skeleton HN (cards horizontais) */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
              {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )
        ) : tab === 'ptbr' ? (
          devArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-12">
              {devArticles.map(a => <DevCard key={a.id} article={a} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Globe className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                Nenhum artigo PT-BR encontrado no momento.
              </p>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {hnStories.map(story => <HNCard key={story.objectID} story={story} />)}
          </div>
        )}

        {/* ── Fontes confiáveis ──────────────────────────────────────────── */}
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
                className="group flex items-start gap-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-3.5 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
                style={{ borderLeft: `3px solid ${src.color}` }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${src.color}15` }}
                >
                  <Globe className="w-4 h-4" style={{ color: src.color }} />
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
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight line-clamp-2">{src.desc}</p>
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
