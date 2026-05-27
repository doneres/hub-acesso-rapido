import React, { useState, ElementType } from 'react';
import {
  LayoutGrid, Code2, Gamepad2, Server, Brain,
  Globe, Settings2, Layers, Smartphone,
  Target, Cloud, Shield, Monitor, Bot, BarChart2,
  Joystick, Sun, Moon, Home, Clock, ChevronRight, ChevronDown,
  ExternalLink, CheckCircle2, Lock, ArrowLeft,
} from 'lucide-react';
import { Roadmap, RoadmapStep, Technology, Resource, StepLevel } from '../types/roadmap';
import { ROADMAP_CATEGORIES } from '../data/roadmapsData';

/* ── Icon lookup ──────────────────────────────────────────────────────── */
const ICON_MAP: Record<string, ElementType> = {
  LayoutGrid, Code2, Gamepad2, Server, Brain,
  Globe, Settings2, Layers, Smartphone,
  Target, Cloud, Shield, Monitor, Bot, BarChart2,
  Joystick,
};

function LucideIcon({ name, size = 20, style }: { name: string; size?: number; style?: React.CSSProperties }) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon size={size} style={style} />;
}

/* ── Helpers ──────────────────────────────────────────────────────────── */
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
    innerBg:       '#0d1525',
    text:          '#e2e8f0',
    textSecondary: '#94a3b8',
    textMuted:     '#475569',
    footerBg:      '#0a0f1e',
    resourceBg:    '#111827',
    resourceBorder:'#1e3a5f',
  } : {
    pageBg:        '#f1f5f9',
    topBarBg:      '#ffffff',
    topBarBorder:  '#e2e8f0',
    heroBg:        'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
    gridColor:     'rgba(15,23,42,0.04)',
    cardBg:        '#ffffff',
    cardBorder:    '#e2e8f0',
    cardShadow:    '#cbd5e1',
    innerBg:       '#f8fafc',
    text:          '#0f172a',
    textSecondary: '#334155',
    textMuted:     '#64748b',
    footerBg:      '#ffffff',
    resourceBg:    '#f8fafc',
    resourceBorder:'#e2e8f0',
  };
}

const LEVEL_COLOR: Record<StepLevel, string> = {
  Iniciante:     '#22c55e',
  Intermediário: '#f59e0b',
  Avançado:      '#ef4444',
};

const LEVEL_NUM: Record<StepLevel, string> = {
  Iniciante:     'I',
  Intermediário: 'II',
  Avançado:      'III',
};

/* ── Props ────────────────────────────────────────────────────────────── */
interface RoadmapDetailProps {
  roadmap: Roadmap;
  isDark: boolean;
  onToggleTheme: () => void;
  onBack: () => void;
  onBackToHub: () => void;
}

/* ════════════════════════════════════════════════════════════════════════
   ROADMAP DETAIL
   ════════════════════════════════════════════════════════════════════════ */
const RoadmapDetail: React.FC<RoadmapDetailProps> = ({
  roadmap, isDark, onToggleTheme, onBack, onBackToHub,
}) => {
  const T = getTheme(isDark);
  const [levelFilter, setLevelFilter] = useState<StepLevel | 'todos'>('todos');
  const [expandedStep, setExpandedStep] = useState<string | null>(roadmap.steps[0]?.id ?? null);

  const catConfig = ROADMAP_CATEGORIES.find(c => c.id === roadmap.category);
  const color     = catConfig?.color ?? roadmap.color;

  const filtered = levelFilter === 'todos'
    ? roadmap.steps
    : roadmap.steps.filter(s => s.level === levelFilter);

  const totalResources = roadmap.steps.flatMap(s => s.techs).flatMap(t => t.resources);
  const freeCount = totalResources.filter(r => r.type === 'free').length;
  const paidCount = totalResources.filter(r => r.type === 'paid').length;

  return (
    <div style={{ background: T.pageBg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── TOP BAR ──────────────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: T.topBarBg,
        borderBottom: `2px solid ${color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px', gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onBack}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 14px',
              background: T.cardBg,
              border: `2px solid ${color}`,
              boxShadow: `3px 3px 0 ${color}40`,
              cursor: 'pointer',
              color: color,
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '8px',
              transition: 'all .15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">TRILHAS</span>
          </button>

          <div className="hidden sm:flex" style={{ alignItems: 'center', gap: '8px', color: T.textMuted }}>
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '10px' }}>/</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color }}>
              <LucideIcon name={roadmap.icon} size={14} />
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '9px' }}>
                {roadmap.shortTitle.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a href="https://ctrlplay.com.br" target="_blank" rel="noopener noreferrer">
            <img src="https://ctrlplay.com.br/wp-content/uploads/2024/11/logo-colorido.svg"
              alt="Ctrl+Play" style={{ height: '30px' }} />
          </a>

          <button onClick={onToggleTheme}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '36px', height: '36px',
              background: T.cardBg,
              border: `2px solid ${T.cardBorder}`,
              boxShadow: `2px 2px 0 ${T.cardShadow}`,
              cursor: 'pointer',
              color: isDark ? '#fbbf24' : '#475569',
              transition: 'all .15s',
            }}
            title={isDark ? 'Modo claro' : 'Modo escuro'}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button onClick={onBackToHub}
            className="hidden sm:flex"
            style={{
              alignItems: 'center', gap: '6px',
              padding: '8px 14px',
              background: T.cardBg,
              border: `2px solid ${T.cardBorder}`,
              boxShadow: `2px 2px 0 ${T.cardShadow}`,
              cursor: 'pointer',
              color: T.textMuted,
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '8px',
              transition: 'all .15s',
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = '#0054a6'; el.style.color = '#0054a6'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = T.cardBorder; el.style.color = T.textMuted; }}
          >
            <Home size={13} /> HUB
          </button>
        </div>
      </div>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <div style={{
        background: T.heroBg,
        backgroundImage: `linear-gradient(${T.gridColor} 1px,transparent 1px), linear-gradient(90deg,${T.gridColor} 1px,transparent 1px)`,
        backgroundSize: '32px 32px',
        padding: '44px 24px 36px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {isDark && (
          <div style={{ position:'absolute',inset:0,pointerEvents:'none',
            background:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px)' }} />
        )}
        <div style={{ position:'absolute',inset:0,pointerEvents:'none',
          background:`radial-gradient(ellipse 50% 70% at 20% 50%, ${color}08 0%, transparent 70%)` }} />

        <div style={{ maxWidth: '860px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

          {/* Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '7px 14px',
              background: `${color}15`,
              border: `2px solid ${color}`,
              boxShadow: `3px 3px 0 ${color}30`,
              color, fontFamily: "'Press Start 2P', monospace", fontSize: '8px',
            }}>
              <LucideIcon name={roadmap.icon} size={14} />
              {catConfig?.label?.toUpperCase()}
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '7px 14px',
              background: `${LEVEL_COLOR[roadmap.difficulty]}15`,
              border: `2px solid ${LEVEL_COLOR[roadmap.difficulty]}`,
              boxShadow: `3px 3px 0 ${LEVEL_COLOR[roadmap.difficulty]}30`,
              color: LEVEL_COLOR[roadmap.difficulty],
              fontFamily: "'Press Start 2P', monospace", fontSize: '8px',
            }}>
              {LEVEL_NUM[roadmap.difficulty]} · {roadmap.difficulty.toUpperCase()}
            </div>
          </div>

          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '16px' }}>
            <div style={{
              flexShrink: 0, width: '64px', height: '64px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${color}15`,
              border: `3px solid ${color}`,
              boxShadow: `4px 4px 0 ${color}30`,
              color,
            }}>
              <LucideIcon name={roadmap.icon} size={34} />
            </div>
            <div>
              <h1 style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 'clamp(14px, 2.5vw, 24px)',
                color: T.text, lineHeight: 1.35, margin: 0,
              }}>{roadmap.title.toUpperCase()}</h1>
              <p style={{ fontSize: '16px', color: T.textSecondary, margin: '8px 0 0' }}>
                {roadmap.description}
              </p>
            </div>
          </div>

          <p style={{ fontSize: '15px', color: T.textMuted, lineHeight: 1.7, maxWidth: '680px', marginBottom: '24px' }}>
            {roadmap.longDescription}
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <StatBadge label="Passos" value={String(roadmap.steps.length).padStart(2,'0')} color={color} T={T} />
            <StatBadge label="Gratuitos" value={String(freeCount)} color="#22c55e" T={T} />
            <StatBadge label="Pagos" value={String(paidCount)} color="#f59e0b" T={T} />
            <StatBadge label="Duração" value={roadmap.estimatedTime} color="#a855f7" T={T} />
          </div>
        </div>
      </div>

      {/* ── LEVEL FILTER ─────────────────────────────────────────────── */}
      <div style={{
        background: isDark ? '#0a0f1e' : '#f8fafc',
        borderBottom: `2px solid ${T.topBarBorder}`,
        padding: '18px 24px',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '9px', color: T.textMuted, marginRight: '4px' }}>
            FILTRAR POR NÍVEL:
          </span>
          {(['todos', 'Iniciante', 'Intermediário', 'Avançado'] as const).map(lv => {
            const isActive = levelFilter === lv;
            const lvColor  = lv === 'todos' ? '#64748b' : LEVEL_COLOR[lv as StepLevel];
            return (
              <button key={lv}
                onClick={() => setLevelFilter(lv)}
                style={{
                  padding: '8px 16px',
                  background: isActive ? lvColor : T.cardBg,
                  color: isActive ? (isDark ? '#080d1a' : '#ffffff') : lvColor,
                  border: `2px solid ${lvColor}`,
                  boxShadow: isActive ? `3px 3px 0 ${lvColor}50` : `2px 2px 0 ${isDark ? '#0a1428' : '#cbd5e1'}`,
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '13px',
                  transition: 'all .15s',
                }}
              >
                {lv === 'todos' ? 'Todos os níveis' : lv}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── STEPS TIMELINE ───────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: '40px 24px 64px', background: T.pageBg }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 0' }}>
              <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '12px', color: T.textMuted }}>
                NENHUM PASSO NESTE NÍVEL
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filtered.map((step, idx) => (
                <StepCard
                  key={step.id}
                  step={step}
                  roadmapColor={color}
                  isLast={idx === filtered.length - 1}
                  isExpanded={expandedStep === step.id}
                  onToggle={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                  isDark={isDark}
                  T={T}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── CTA FOOTER ───────────────────────────────────────────────── */}
      <div style={{
        padding: '36px 24px',
        textAlign: 'center',
        background: T.footerBg,
        borderTop: `2px solid ${color}25`,
      }}>
        <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '9px', color: T.textMuted, marginBottom: '20px' }}>
          ACESSE MAIS FERRAMENTAS NO HUB DA CTRL+PLAY
        </p>
        <button onClick={onBackToHub}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '12px',
            padding: '14px 28px',
            background: '#0054a6',
            color: '#ffffff',
            border: '2px solid #0054a6',
            boxShadow: '5px 5px 0 #003580',
            cursor: 'pointer',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '10px',
            transition: 'all .15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translate(-2px,-2px)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0,0)'; }}
        >
          <Home size={16} />
          VOLTAR AO HUB DE FERRAMENTAS
        </button>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════
   STEP CARD
   ════════════════════════════════════════════════════════════════════════ */
interface StepCardProps {
  step: RoadmapStep;
  roadmapColor: string;
  isLast: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  isDark: boolean;
  T: ReturnType<typeof getTheme>;
}

const StepCard: React.FC<StepCardProps> = ({ step, roadmapColor, isExpanded, onToggle, isDark, T }) => {
  const lvColor = LEVEL_COLOR[step.level];

  return (
    <div style={{ display: 'flex', gap: '16px' }}>
      {/* Step number circle — desktop only */}
      <div className="hidden md:flex" style={{
        flexShrink: 0,
        width: '48px', height: '48px',
        alignItems: 'center', justifyContent: 'center',
        background: isExpanded ? roadmapColor : T.cardBg,
        border: `2px solid ${roadmapColor}`,
        boxShadow: isExpanded ? `4px 4px 0 ${roadmapColor}50` : `3px 3px 0 ${T.cardShadow}`,
        color: isExpanded ? (isDark ? '#080d1a' : '#ffffff') : roadmapColor,
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '12px',
        transition: 'all .2s',
      }}>
        {String(step.order).padStart(2, '0')}
      </div>

      <div style={{ flex: 1 }}>
        {/* Header (clickable) */}
        <button onClick={onToggle}
          style={{
            width: '100%', textAlign: 'left',
            background: T.cardBg,
            border: `2px solid ${isExpanded ? roadmapColor : T.cardBorder}`,
            boxShadow: isExpanded
              ? `4px 4px 0 ${roadmapColor}40`
              : `3px 3px 0 ${T.cardShadow}`,
            cursor: 'pointer',
            padding: 0,
            transition: 'all .15s',
          }}
        >
          <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Mobile step number */}
            <span className="md:hidden" style={{
              flexShrink: 0,
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '10px',
              color: roadmapColor,
            }}>
              {String(step.order).padStart(2,'0')}
            </span>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <h3 style={{
                  fontSize: '18px', fontWeight: 900,
                  color: isExpanded ? T.text : T.textSecondary,
                  margin: 0, transition: 'color .15s',
                }}>{step.title}</h3>
                {/* Level badge — full name */}
                <span style={{
                  padding: '4px 12px',
                  background: `${lvColor}15`,
                  color: lvColor,
                  border: `1px solid ${lvColor}60`,
                  fontSize: '12px', fontWeight: 700,
                  flexShrink: 0,
                }}>{step.level}</span>
              </div>
              <p className="hidden sm:block" style={{ fontSize: '14px', color: T.textMuted, margin: 0, lineHeight: 1.6 }}>
                {step.description}
              </p>
            </div>

            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: T.textMuted }}>{step.techs.length} tech{step.techs.length > 1 ? 's' : ''}</span>
              <div style={{
                color: roadmapColor,
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform .2s',
              }}>
                <ChevronDown size={20} />
              </div>
            </div>
          </div>
        </button>

        {/* Expanded content */}
        {isExpanded && (
          <div style={{
            marginTop: '4px',
            borderLeft: `3px solid ${roadmapColor}40`,
            marginLeft: '12px',
            paddingLeft: '16px',
            display: 'flex', flexDirection: 'column', gap: '12px',
          }}>
            {step.techs.map((tech, ti) => (
              <TechCard key={ti} tech={tech} roadmapColor={roadmapColor} isDark={isDark} T={T} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════
   TECH CARD
   ════════════════════════════════════════════════════════════════════════ */
interface TechCardProps {
  tech: Technology;
  roadmapColor: string;
  isDark: boolean;
  T: ReturnType<typeof getTheme>;
}

const TechCard: React.FC<TechCardProps> = ({ tech, roadmapColor, T }) => (
  <div style={{
    background: T.innerBg,
    border: `1px solid ${roadmapColor}25`,
    padding: '18px 20px',
  }}>
    {/* Tech header */}
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
      <div style={{
        flexShrink: 0, width: '36px', height: '36px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `${roadmapColor}15`,
        border: `2px solid ${roadmapColor}40`,
        color: roadmapColor,
      }}>
        <CheckCircle2 size={18} />
      </div>
      <div>
        <h4 style={{ fontSize: '16px', fontWeight: 900, color: T.text, margin: '0 0 4px' }}>
          {tech.name}
        </h4>
        <p style={{ fontSize: '14px', color: T.textMuted, margin: 0, lineHeight: 1.5 }}>
          {tech.description}
        </p>
      </div>
    </div>

    {/* Resources */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {tech.resources.map((res, ri) => (
        <ResourceLink key={ri} resource={res} roadmapColor={roadmapColor} T={T} />
      ))}
    </div>
  </div>
);

/* ════════════════════════════════════════════════════════════════════════
   RESOURCE LINK
   ════════════════════════════════════════════════════════════════════════ */
interface ResourceLinkProps {
  resource: Resource;
  roadmapColor: string;
  T: ReturnType<typeof getTheme>;
}

const ResourceLink: React.FC<ResourceLinkProps> = ({ resource, roadmapColor, T }) => {
  const [hov, setHov] = useState(false);
  const isFree = resource.type === 'free';
  const badgeColor = isFree ? '#22c55e' : '#f59e0b';
  const isPlaceholder = resource.url === '#';

  const inner = (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '10px 14px',
      background: hov ? `${badgeColor}08` : T.resourceBg,
      border: `1px solid ${hov ? badgeColor + '70' : T.resourceBorder}`,
      transition: 'all .15s',
      cursor: isPlaceholder ? 'default' : 'pointer',
    }}>
      {/* FREE / PAID badge */}
      <span style={{
        flexShrink: 0,
        padding: '3px 8px',
        background: `${badgeColor}15`,
        color: badgeColor,
        border: `1px solid ${badgeColor}60`,
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '7px',
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}>
        {isFree ? 'GRÁTIS' : 'PAGO'}
      </span>

      {/* Platform chip */}
      <span className="hidden sm:inline" style={{
        flexShrink: 0,
        padding: '3px 8px',
        background: `${roadmapColor}10`,
        color: `${roadmapColor}90`,
        border: `1px solid ${roadmapColor}30`,
        fontSize: '11px',
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}>
        {resource.platform}
      </span>

      {/* Title */}
      <span style={{
        flex: 1, minWidth: 0,
        fontSize: '14px', fontWeight: 600,
        color: hov ? T.text : T.textSecondary,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        transition: 'color .15s',
      }}>
        {resource.title}
      </span>

      {/* External link icon */}
      {!isPlaceholder && (
        <ExternalLink size={15} style={{ flexShrink: 0, color: hov ? badgeColor : T.textMuted, transition: 'color .15s' }} />
      )}
    </div>
  );

  if (isPlaceholder) return inner;

  return (
    <a href={resource.url} target="_blank" rel="noopener noreferrer"
      style={{ display: 'block', textDecoration: 'none' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}>
      {inner}
    </a>
  );
};

/* ════════════════════════════════════════════════════════════════════════
   STAT BADGE
   ════════════════════════════════════════════════════════════════════════ */
interface StatBadgeProps {
  label: string;
  value: string;
  color: string;
  T: ReturnType<typeof getTheme>;
}

const StatBadge: React.FC<StatBadgeProps> = ({ label, value, color, T }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '12px 20px',
    background: `${color}10`,
    border: `2px solid ${color}50`,
    boxShadow: `3px 3px 0 ${color}20`,
  }}>
    <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '18px', color }}>
      {value}
    </span>
    <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: T.textMuted, marginTop: '6px' }}>
      {label.toUpperCase()}
    </span>
  </div>
);

export default RoadmapDetail;
