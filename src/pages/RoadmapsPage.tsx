import React, { useState, useEffect, ElementType } from 'react';
import {
  LayoutGrid, Code2, Gamepad2, Server, Brain,
  Globe, Settings2, Layers, Smartphone,
  Target, Cloud, Shield, Monitor, Bot, BarChart2,
  Joystick, Sun, Moon, Home, Clock, ChevronRight,
  Zap, Map,
} from 'lucide-react';
import { Roadmap, RoadmapCategory } from '../types/roadmap';
import { ROADMAPS, ROADMAP_CATEGORIES } from '../data/roadmapsData';
import { useTheme } from '../hooks/useTheme';
import RoadmapDetail from './RoadmapDetail';

/* ── Icon lookup ──────────────────────────────────────────────────────── */
const ICON_MAP: Record<string, ElementType> = {
  LayoutGrid, Code2, Gamepad2, Server, Brain,
  Globe, Settings2, Layers, Smartphone,
  Target, Cloud, Shield, Monitor, Bot, BarChart2,
  Joystick, Map,
};

function LucideIcon({ name, size = 20, className = '' }: { name: string; size?: number; className?: string }) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon size={size} className={className} />;
}

/* ── Theme helpers ────────────────────────────────────────────────────── */
function getTheme(isDark: boolean) {
  return isDark ? {
    pageBg:        '#080d1a',
    topBarBg:      '#0a0f1e',
    topBarBorder:  '#1a2a4a',
    heroBg:        'linear-gradient(180deg, #0a0f1e 0%, #080d1a 100%)',
    gridColor:     'rgba(6,182,212,0.05)',
    cardBg:        '#111827',
    cardBorder:    '#1e3a5f',
    cardShadow:    '#0a1428',
    text:          '#e2e8f0',
    textSecondary: '#94a3b8',
    textMuted:     '#475569',
    footerBg:      '#0a0f1e',
    footerBorder:  '#1a2a4a',
    footerText:    '#1e3a5f',
    tabInactBg:    '#111827',
    tabInactText:  '#64748b',
  } : {
    pageBg:        '#f1f5f9',
    topBarBg:      '#ffffff',
    topBarBorder:  '#e2e8f0',
    heroBg:        'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
    gridColor:     'rgba(15,23,42,0.04)',
    cardBg:        '#ffffff',
    cardBorder:    '#e2e8f0',
    cardShadow:    '#cbd5e1',
    text:          '#0f172a',
    textSecondary: '#334155',
    textMuted:     '#64748b',
    footerBg:      '#ffffff',
    footerBorder:  '#e2e8f0',
    footerText:    '#94a3b8',
    tabInactBg:    '#ffffff',
    tabInactText:  '#64748b',
  };
}

/* ── Props ────────────────────────────────────────────────────────────── */
interface RoadmapsPageProps {
  onBackToHub: () => void;
}

/* ════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════════════════ */
const RoadmapsPage: React.FC<RoadmapsPageProps> = ({ onBackToHub }) => {
  const { isDark, toggleTheme } = useTheme();
  const T = getTheme(isDark);

  const [activeCategory, setActiveCategory] = useState<RoadmapCategory | 'todos'>('todos');
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [cursor, setCursor] = useState(true);
  const [count, setCount]   = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCursor(v => !v), 530);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const target = ROADMAPS.length;
    let c = 0;
    const tick = () => { c++; setCount(c); if (c < target) setTimeout(tick, 55); };
    const d = setTimeout(tick, 500);
    return () => clearTimeout(d);
  }, []);

  const filtered = activeCategory === 'todos'
    ? ROADMAPS
    : ROADMAPS.filter(r => r.category === activeCategory);

  if (selectedRoadmap) {
    return (
      <RoadmapDetail
        roadmap={selectedRoadmap}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onBack={() => setSelectedRoadmap(null)}
        onBackToHub={onBackToHub}
      />
    );
  }

  return (
    <div style={{ background: T.pageBg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── TOP BAR ──────────────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: T.topBarBg,
        borderBottom: `2px solid ${T.topBarBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="https://ctrlplay.com.br" target="_blank" rel="noopener noreferrer"
            style={{ display: 'block', transition: 'transform .2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.05)'}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)'}>
            <img src="https://ctrlplay.com.br/wp-content/uploads/2024/11/logo-colorido.svg"
              alt="Ctrl+Play" style={{ height: '36px' }} />
          </a>
          <div style={{ width: '1px', height: '28px', background: T.topBarBorder }} />
          <span style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '10px',
            color: '#06b6d4',
            letterSpacing: '0.08em',
          }}>ROADMAPS</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Theme toggle */}
          <button onClick={toggleTheme}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '38px', height: '38px',
              background: T.cardBg,
              border: `2px solid ${T.cardBorder}`,
              boxShadow: `3px 3px 0 ${T.cardShadow}`,
              cursor: 'pointer',
              color: isDark ? '#fbbf24' : '#475569',
              transition: 'all .15s',
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = isDark ? '#fbbf24' : '#06b6d4'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = T.cardBorder; }}
            title={isDark ? 'Modo claro' : 'Modo escuro'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Back to Hub */}
          <button onClick={onBackToHub}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px',
              background: T.cardBg,
              border: `2px solid ${T.cardBorder}`,
              boxShadow: `3px 3px 0 ${T.cardShadow}`,
              cursor: 'pointer',
              color: T.textMuted,
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '8px',
              transition: 'all .15s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = '#0054a6';
              el.style.color = '#0054a6';
              el.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = T.cardBorder;
              el.style.color = T.textMuted;
              el.style.transform = 'translateY(0)';
            }}
          >
            <Home size={14} />
            <span className="hidden sm:inline">Voltar ao Hub</span>
          </button>
        </div>
      </div>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <div style={{
        background: T.heroBg,
        backgroundImage: `linear-gradient(${T.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${T.gridColor} 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
        padding: '56px 24px 48px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Scanlines (dark only) */}
        {isDark && (
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 4px)',
          }} />
        )}
        {/* Glow */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${isDark ? 'rgba(6,182,212,0.07)' : 'rgba(6,182,212,0.05)'} 0%, transparent 70%)`,
        }} />

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          marginBottom: '24px',
          padding: '8px 18px',
          background: T.cardBg,
          border: `2px solid ${T.cardBorder}`,
          boxShadow: `3px 3px 0 ${T.cardShadow}`,
        }}>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '16px', color: '#06b6d4' }}>
            {String(count).padStart(2, '0')}
          </span>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '9px', color: T.textMuted }}>
            TRILHAS DISPONÍVEIS
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 'clamp(16px, 3vw, 30px)',
          lineHeight: 1.4,
          color: T.text,
          position: 'relative', zIndex: 1,
          marginBottom: '16px',
        }}>
          <span style={{
            color: '#06b6d4',
            textShadow: isDark ? '0 0 20px rgba(6,182,212,0.5)' : 'none',
          }}>TRILHAS</span>
          {' '}DE{' '}
          <span style={{
            color: '#f37021',
            textShadow: isDark ? '0 0 20px rgba(243,112,33,0.5)' : 'none',
          }}>APRENDIZADO</span>
          <span style={{ color: '#06b6d4', opacity: cursor ? 1 : 0, transition: 'none' }}>_</span>
        </h1>

        <p style={{ fontSize: '16px', color: T.textSecondary, maxWidth: '520px', margin: '0 auto 12px', lineHeight: 1.6, position: 'relative', zIndex: 1 }}>
          Escolha seu destino e siga o caminho do básico ao avançado com recursos reais e gratuitos.
        </p>
        <p style={{
          fontFamily: "'Press Start 2P', monospace", fontSize: '9px', color: T.textMuted,
          position: 'relative', zIndex: 1,
        }}>▼ SELECIONE UMA TRILHA ▼</p>
      </div>

      {/* ── CATEGORY TABS ────────────────────────────────────────────── */}
      <div style={{ background: isDark ? '#0a0f1e' : '#f8fafc', padding: '20px 24px 0', borderBottom: `2px solid ${T.topBarBorder}` }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '10px', paddingBottom: '20px' }}>
          {ROADMAP_CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button key={cat.id}
                onClick={() => setActiveCategory(cat.id as RoadmapCategory | 'todos')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 18px',
                  background: isActive ? cat.color : T.tabInactBg,
                  color: isActive ? (isDark ? '#080d1a' : '#ffffff') : cat.color,
                  border: `2px solid ${cat.color}`,
                  boxShadow: isActive ? `4px 4px 0 ${cat.color}50` : `3px 3px 0 ${isDark ? '#0a1428' : '#cbd5e1'}`,
                  cursor: 'pointer',
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '9px',
                  fontWeight: 'bold',
                  transition: 'all .15s',
                }}
                onMouseEnter={e => { if (!isActive) { const el = e.currentTarget as HTMLButtonElement; el.style.transform = 'translateY(-2px)'; } }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.transform = 'translateY(0)'; }}
              >
                <LucideIcon name={cat.icon} size={16} />
                <span className="hidden sm:inline">{cat.label.toUpperCase()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── GRID ─────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: '36px 24px 64px', background: T.pageBg }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {activeCategory !== 'todos' && (() => {
            const cat = ROADMAP_CATEGORIES.find(c => c.id === activeCategory);
            return cat ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <div style={{ flex: 1, height: '1px', background: `${cat.color}40` }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: cat.color }}>
                  <LucideIcon name={cat.icon} size={18} />
                  <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '11px' }}>{cat.label.toUpperCase()}</span>
                </div>
                <div style={{ flex: 1, height: '1px', background: `${cat.color}40` }} />
              </div>
            ) : null;
          })()}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}>
            {filtered.map((roadmap, i) => (
              <RoadmapCard
                key={roadmap.id}
                roadmap={roadmap}
                index={i}
                isDark={isDark}
                T={T}
                onClick={() => setSelectedRoadmap(roadmap)}
              />
            ))}
          </div>
        </div>
      </main>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <div style={{
        padding: '24px',
        textAlign: 'center',
        background: T.footerBg,
        borderTop: `2px solid ${T.footerBorder}`,
      }}>
        <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', color: T.footerText }}>
          © 2026 CTRL+PLAY · FEITO COM ♥ PARA NOSSOS ALUNOS
        </p>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════
   ROADMAP CARD
   ════════════════════════════════════════════════════════════════════════ */
interface CardProps {
  roadmap: Roadmap;
  index: number;
  isDark: boolean;
  T: ReturnType<typeof getTheme>;
  onClick: () => void;
}

const DIFFICULTY_COLOR: Record<string, string> = {
  Iniciante:     '#22c55e',
  Intermediário: '#f59e0b',
  Avançado:      '#ef4444',
};

const RoadmapCard: React.FC<CardProps> = ({ roadmap, isDark, T, onClick }) => {
  const [hov, setHov] = useState(false);
  const catConfig = ROADMAP_CATEGORIES.find(c => c.id === roadmap.category);
  const catColor  = catConfig?.color ?? roadmap.color;
  const diffColor = DIFFICULTY_COLOR[roadmap.difficulty];

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        textAlign: 'left', width: '100%',
        background: T.cardBg,
        border: `2px solid ${hov ? catColor : T.cardBorder}`,
        boxShadow: hov
          ? `5px 5px 0 ${catColor}50`
          : `4px 4px 0 ${T.cardShadow}`,
        transform: hov ? 'translate(-2px, -2px)' : 'translate(0,0)',
        transition: 'all .15s',
        cursor: 'pointer',
        padding: 0,
      }}
    >
      {/* Card header bar */}
      <div style={{
        padding: '18px 18px 14px',
        borderBottom: `1px solid ${hov ? catColor + '40' : T.topBarBorder}`,
        display: 'flex', alignItems: 'flex-start', gap: '14px',
      }}>
        {/* Icon box */}
        <div style={{
          width: '52px', height: '52px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${catColor}15`,
          border: `2px solid ${catColor}50`,
          color: catColor,
        }}>
          <LucideIcon name={roadmap.icon} size={26} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '8px',
            color: catColor,
            letterSpacing: '0.08em',
            marginBottom: '6px',
          }}>{catConfig?.label?.toUpperCase()}</p>
          <h3 style={{
            fontSize: '17px',
            fontWeight: 900,
            lineHeight: 1.3,
            color: hov ? catColor : T.text,
            transition: 'color .15s',
            margin: 0,
          }}>{roadmap.title}</h3>
        </div>
      </div>

      {/* Description */}
      <div style={{ padding: '14px 18px 10px' }}>
        <p style={{ fontSize: '14px', color: T.textSecondary, lineHeight: 1.6, margin: 0 }}>
          {roadmap.description}
        </p>
      </div>

      {/* Tags */}
      <div style={{ padding: '0 18px 12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {roadmap.tags.slice(0, 4).map(tag => (
          <span key={tag} style={{
            padding: '3px 8px',
            fontSize: '11px',
            fontWeight: 700,
            background: `${catColor}12`,
            color: `${catColor}cc`,
            border: `1px solid ${catColor}40`,
          }}>{tag}</span>
        ))}
        {roadmap.tags.length > 4 && (
          <span style={{ fontSize: '11px', color: T.textMuted, alignSelf: 'center' }}>+{roadmap.tags.length - 4}</span>
        )}
      </div>

      {/* Footer meta */}
      <div style={{
        padding: '12px 18px',
        borderTop: `1px solid ${T.topBarBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: diffColor }} />
          <span style={{ fontSize: '13px', fontWeight: 700, color: diffColor }}>
            {roadmap.difficulty}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: T.textMuted }}>
          <Clock size={14} />
          <span style={{ fontSize: '13px' }}>{roadmap.estimatedTime}</span>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          color: hov ? catColor : T.textMuted,
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '9px',
          transition: 'color .15s',
        }}>
          VER <ChevronRight size={12} />
        </div>
      </div>
    </button>
  );
};

export default RoadmapsPage;
