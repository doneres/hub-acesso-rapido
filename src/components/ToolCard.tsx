import React, { useState } from 'react';
import { Copy } from 'lucide-react';
import { Tool } from '../types';
import HighlightText from './HighlightText';

/* ── Camisas das seleções Copa 2026 ──────────────────────────────────────── */
interface Jersey {
  primary: string;
  secondary: string;
  collar: string;
  sleeves: string;
  nameStripBg: string;
  nameStripText: string;
  stripes: boolean; // horizontal stripes (Argentina)
  flag: string;
  team: string;
}

const COPA_JERSEYS: Jersey[] = [
  // 0 Brasil
  { primary:'#FFD100', secondary:'#009C3B', collar:'#009C3B', sleeves:'#009C3B',
    nameStripBg:'#009C3B', nameStripText:'#FFD100', stripes:false, flag:'🇧🇷', team:'Brasil' },
  // 1 Argentina
  { primary:'#74ACDF', secondary:'#FFFFFF', collar:'#74ACDF', sleeves:'#FFFFFF',
    nameStripBg:'#002D62', nameStripText:'#FFFFFF', stripes:true,  flag:'🇦🇷', team:'Argentina' },
  // 2 França
  { primary:'#002654', secondary:'#EF2B2D', collar:'#FFFFFF', sleeves:'#EF2B2D',
    nameStripBg:'#EF2B2D', nameStripText:'#FFFFFF', stripes:false, flag:'🇫🇷', team:'França' },
  // 3 Alemanha
  { primary:'#FFFFFF', secondary:'#000000', collar:'#DD0000', sleeves:'#000000',
    nameStripBg:'#1c1c1c', nameStripText:'#FFFFFF', stripes:false, flag:'🇩🇪', team:'Alemanha' },
  // 4 Portugal
  { primary:'#C4122F', secondary:'#006600', collar:'#FFFFFF', sleeves:'#006600',
    nameStripBg:'#006600', nameStripText:'#FFFFFF', stripes:false, flag:'🇵🇹', team:'Portugal' },
  // 5 Espanha
  { primary:'#C60B1E', secondary:'#FFC400', collar:'#C60B1E', sleeves:'#FFC400',
    nameStripBg:'#FFC400', nameStripText:'#8a1010', stripes:false, flag:'🇪🇸', team:'Espanha' },
  // 6 México
  { primary:'#006847', secondary:'#CE1126', collar:'#FFFFFF', sleeves:'#CE1126',
    nameStripBg:'#CE1126', nameStripText:'#FFFFFF', stripes:false, flag:'🇲🇽', team:'México' },
  // 7 EUA
  { primary:'#002868', secondary:'#BF0A30', collar:'#FFFFFF', sleeves:'#BF0A30',
    nameStripBg:'#BF0A30', nameStripText:'#FFFFFF', stripes:false, flag:'🇺🇸', team:'EUA' },
  // 8 Inglaterra
  { primary:'#FFFFFF', secondary:'#CF0A2C', collar:'#CF0A2C', sleeves:'#CF0A2C',
    nameStripBg:'#012169', nameStripText:'#FFFFFF', stripes:false, flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', team:'Inglaterra' },
  // 9 Uruguai
  { primary:'#5CB8E4', secondary:'#FFFFFF', collar:'#FFFFFF', sleeves:'#FFFFFF',
    nameStripBg:'#1F1F9E', nameStripText:'#FFFFFF', stripes:false, flag:'🇺🇾', team:'Uruguai' },
];

function getJersey(toolId: string, pinned: boolean): Jersey {
  if (pinned) return COPA_JERSEYS[0]; // Brasil para cards destaque
  const hash = toolId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return COPA_JERSEYS[hash % COPA_JERSEYS.length];
}

/* ── Props ───────────────────────────────────────────────────────────────── */
interface ToolCardProps {
  tool: Tool;
  index: number;
  isFavorite: boolean;
  searchQuery: string;
  onToggleFavorite: (toolId: string) => void;
  onMouseEnter: (tool: Tool) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  onTrack?: (tool: Tool) => void;
  onCardClick?: (tool: Tool) => void;
  onCopy: (url: string) => void;
  activeTheme?: string; // cosmetic id ativo
}

const ToolCard: React.FC<ToolCardProps> = ({
  tool, index, isFavorite, searchQuery,
  onToggleFavorite, onMouseEnter, onMouseMove, onMouseLeave,
  onTrack, onCardClick, onCopy, activeTheme,
}) => {
  const [imgError, setImgError] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    onToggleFavorite(tool.id);
  };
  const handleCopyClick = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    onCopy(tool.url);
  };
  const handleCardClick = (e: React.MouseEvent) => {
    if (onCardClick) { e.preventDefault(); onCardClick(tool); }
    else onTrack?.(tool);
  };

  /* ══════════════════════════════════════════════════════════════════
     MODO COPA — Camisa da seleção
  ══════════════════════════════════════════════════════════════════ */
  if (activeTheme === 'copa-2026') {
    const j = getJersey(tool.id, !!tool.pinned);
    const jerseyBg = j.stripes
      ? { backgroundImage: `repeating-linear-gradient(0deg,${j.primary} 0,${j.primary} 12px,${j.secondary} 12px,${j.secondary} 24px)` }
      : { background: j.primary };

    return (
      <div
        className="animate-fadeIn"
        style={{ animationDelay: `${Math.min(index * 35, 500)}ms`, animationFillMode: 'backwards' }}
      >
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleCardClick}
          className="relative group flex flex-col items-center justify-center rounded-2xl overflow-hidden min-h-[180px] transition-all duration-200"
          style={{
            ...jerseyBg,
            boxShadow: '0 4px 20px rgba(0,0,0,0.28), 0 1px 4px rgba(0,0,0,0.18)',
          }}
          onMouseEnter={() => onMouseEnter(tool)}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        >
          {/* Bandeira do país */}
          <span style={{
            position:'absolute', top:5, right:7, fontSize:13, zIndex:6,
            filter:'drop-shadow(0 1px 2px rgba(0,0,0,0.35))', lineHeight:1,
          }}>{j.flag}</span>

          {/* Gola V */}
          <div style={{
            position:'absolute', top:0, left:'50%', transform:'translateX(-50%)',
            width:0, height:0,
            borderLeft:'32px solid transparent',
            borderRight:'32px solid transparent',
            borderTop:`28px solid ${j.collar}`,
            zIndex:5,
          }} />

          {/* Mangas (listras laterais) */}
          <div style={{ position:'absolute', top:0, left:0, width:11, height:70, background:j.sleeves, opacity:0.82, zIndex:4 }} />
          <div style={{ position:'absolute', top:0, right:0, width:11, height:70, background:j.sleeves, opacity:0.82, zIndex:4 }} />

          {/* Badge do escudo (ícone da ferramenta) */}
          <div style={{ position:'relative', zIndex:5, marginTop:14 }} className="group-hover:scale-110 transition-transform duration-200">
            <div style={{
              width:54, height:54, borderRadius:'50%',
              background:'rgba(255,255,255,0.96)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 2px 10px rgba(0,0,0,0.22)',
            }}>
              {!imgError ? (
                <img src={tool.iconUrl} alt={tool.name} style={{ width:34, height:34, objectFit:'contain' }} loading="lazy" onError={() => setImgError(true)} />
              ) : (
                <span style={{ fontSize:22 }}>🔗</span>
              )}
            </div>
          </div>

          {/* Faixa do nome (costas da camisa) */}
          <div style={{
            position:'absolute', bottom:0, left:0, right:0,
            padding:'5px 6px 7px',
            background:j.nameStripBg,
            textAlign:'center', zIndex:5,
          }}>
            <span style={{
              color:j.nameStripText,
              fontSize:8.5, fontWeight:900,
              textTransform:'uppercase', letterSpacing:'0.06em',
              lineHeight:1.2, display:'block',
            }}>
              <HighlightText text={tool.name} query={searchQuery} />
            </span>
          </div>

          {/* Hover shine */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
            style={{ background:'rgba(255,255,255,0.1)', zIndex:4 }} />

          {/* Favorito */}
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-2 left-2 w-6 h-6 flex items-center justify-center rounded-full z-10 transition-all duration-200
              ${isFavorite ? 'opacity-100 bg-white/90 text-amber-400' : 'opacity-0 group-hover:opacity-100 bg-white/70 text-gray-400 hover:text-amber-400'}`}
            aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* Badge Novo */}
          {tool.isNew && (
            <div className="absolute bottom-8 left-2 bg-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm z-10"
              style={{ color: j.nameStripBg }}>
              ✦ novo
            </div>
          )}
        </a>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════
     MODO FALLOUT: NEW VEGAS — Pip-Boy 3000 Mark IV
  ══════════════════════════════════════════════════════════════════ */
  if (activeTheme === 'fallout-nv') {
    return (
      <div className="animate-fadeIn" style={{ animationDelay:`${Math.min(index*35,500)}ms`, animationFillMode:'backwards' }}>
        <a
          href={tool.url} target="_blank" rel="noopener noreferrer"
          onClick={handleCardClick}
          className="relative group flex flex-col min-h-[180px] overflow-hidden transition-all duration-200 rounded-sm"
          style={{ background:'#0b1508', border:'1px solid rgba(0,214,50,0.32)', boxShadow:'0 0 10px rgba(0,214,50,0.12), inset 0 0 32px rgba(0,214,50,0.04)' }}
          onMouseEnter={() => onMouseEnter(tool)} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
        >
          {/* CRT scanlines */}
          <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,214,50,0.015) 2px,rgba(0,214,50,0.015) 3px)', pointerEvents:'none', zIndex:1 }} />

          {/* Pip-Boy header */}
          <div style={{ background:'rgba(0,214,50,0.1)', borderBottom:'1px solid rgba(0,214,50,0.25)', padding:'4px 8px', display:'flex', alignItems:'center', justifyContent:'space-between', zIndex:2 }}>
            <span style={{ fontFamily:'monospace', fontSize:7, color:'rgba(0,214,50,0.55)', letterSpacing:'0.12em' }}>{'PIP-BOY 3000'}</span>
            <span style={{ fontSize:9, color:'rgba(0,214,50,0.45)' }}>☢</span>
          </div>

          {/* Ícone com filtro fosfórico */}
          <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 6px', position:'relative', zIndex:2 }}
            className="group-hover:scale-110 transition-transform duration-200">
            <div style={{ width:52, height:52, border:'1px solid rgba(0,214,50,0.45)', display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,214,50,0.06)', boxShadow:'0 0 14px rgba(0,214,50,0.18)' }}>
              {!imgError
                ? <img src={tool.iconUrl} alt={tool.name} style={{ width:32, height:32, objectFit:'contain', filter:'sepia(1) hue-rotate(92deg) saturate(2.2) brightness(0.85)' }} loading="lazy" onError={()=>setImgError(true)} />
                : <span style={{ color:'#00d632', fontSize:18 }}>☢</span>}
            </div>
          </div>

          {/* Info terminal */}
          <div style={{ padding:'4px 10px 2px', flex:1, zIndex:2, display:'flex', flexDirection:'column', justifyContent:'center' }}>
            <div style={{ fontFamily:'monospace', fontSize:7.5, color:'rgba(0,214,50,0.45)', marginBottom:2 }}>{'>'} ITEM:</div>
            <div style={{ fontFamily:'monospace', fontSize:9.5, color:'#00d632', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.03em', lineHeight:1.25, textShadow:'0 0 6px rgba(0,214,50,0.4)' }}>
              <HighlightText text={tool.name} query={searchQuery} />
            </div>
          </div>

          {/* Barra de status */}
          <div style={{ borderTop:'1px solid rgba(0,214,50,0.18)', padding:'3px 10px', display:'flex', alignItems:'center', justifyContent:'space-between', zIndex:2 }}>
            <span style={{ fontFamily:'monospace', fontSize:7, color:'rgba(0,214,50,0.4)', letterSpacing:'0.08em' }}>STATUS</span>
            <div style={{ display:'flex', gap:2 }}>
              {[...Array(5)].map((_,i)=><div key={i} style={{ width:9, height:4, background:'rgba(0,214,50,0.65)' }} />)}
            </div>
          </div>

          {/* Hover glow */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ boxShadow:'inset 0 0 28px rgba(0,214,50,0.1)', zIndex:3 }} />

          {/* Favorito */}
          <button onClick={handleFavoriteClick}
            className={`absolute top-6 right-1.5 w-6 h-6 flex items-center justify-center rounded-full z-10 transition-all duration-200 ${isFavorite ? 'opacity-100 bg-emerald-900/60 text-emerald-400' : 'opacity-0 group-hover:opacity-100 bg-black/40 text-emerald-900 hover:text-emerald-400'}`}
            aria-label={isFavorite?'Remover':'Adicionar'}>
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill={isFavorite?'currentColor':'none'} stroke="currentColor" strokeWidth={2}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </a>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════
     MODO CS 1.6 — Buy Menu Tático
  ══════════════════════════════════════════════════════════════════ */
  if (activeTheme === 'csgo-16') {
    const hash = tool.id.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
    const isCT = hash % 2 === 0;
    const teamColor = isCT ? '#3a7bd5' : '#d46418';
    const teamBg    = isCT ? '#0a1628' : '#1c0d02';
    const teamLabel = isCT ? 'CT' : 'T';
    return (
      <div className="animate-fadeIn" style={{ animationDelay:`${Math.min(index*35,500)}ms`, animationFillMode:'backwards' }}>
        <a
          href={tool.url} target="_blank" rel="noopener noreferrer"
          onClick={handleCardClick}
          className="relative group flex flex-col min-h-[180px] overflow-hidden transition-all duration-200"
          style={{ background:teamBg, border:`1px solid ${teamColor}38` }}
          onMouseEnter={() => onMouseEnter(tool)} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
        >
          {/* Team bar */}
          <div style={{ background:teamColor, padding:'3px 8px', display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontFamily:'monospace', fontSize:8, fontWeight:900, color:'#fff', letterSpacing:'0.1em' }}>{teamLabel}</span>
            <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.25)' }} />
            <span style={{ fontSize:8, color:'rgba(255,255,255,0.65)' }}>★</span>
          </div>

          {/* Mira + ícone */}
          <div style={{ position:'relative', flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'10px' }}>
            <svg style={{ position:'absolute', width:76, height:76, opacity:0.1 }} viewBox="0 0 76 76">
              <line x1={38} y1={0}  x2={38} y2={76} stroke={teamColor} strokeWidth="1.5"/>
              <line x1={0}  y1={38} x2={76} y2={38} stroke={teamColor} strokeWidth="1.5"/>
              <circle cx={38} cy={38} r={20} fill="none" stroke={teamColor} strokeWidth="1"/>
              <circle cx={38} cy={38} r={3}  fill={teamColor}/>
            </svg>
            <div
              style={{ position:'relative', zIndex:2, width:50, height:50, borderRadius:'50%', border:`2px solid ${teamColor}55`, background:`${teamColor}18`, display:'flex', alignItems:'center', justifyContent:'center' }}
              className="group-hover:scale-110 transition-transform duration-200"
            >
              {!imgError
                ? <img src={tool.iconUrl} alt={tool.name} style={{ width:30, height:30, objectFit:'contain' }} loading="lazy" onError={()=>setImgError(true)} />
                : <span style={{ color:teamColor, fontSize:18 }}>🔗</span>}
            </div>
          </div>

          {/* Nome + barra de dinheiro */}
          <div style={{ padding:'4px 8px 6px', borderTop:`1px solid ${teamColor}25` }}>
            <div style={{ fontFamily:'monospace', fontSize:9.5, color:'#ccd4cc', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em', lineHeight:1.2, marginBottom:4 }}>
              <HighlightText text={tool.name} query={searchQuery} />
            </div>
            <div style={{ display:'flex', gap:2 }}>
              {[...Array(8)].map((_,i)=><div key={i} style={{ flex:1, height:3, background: i<5 ? '#4CAF50' : 'rgba(255,255,255,0.08)' }} />)}
            </div>
          </div>

          {/* Hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ background:`${teamColor}0a`, boxShadow:`inset 0 0 0 1px ${teamColor}30` }} />

          {/* Favorito */}
          <button onClick={handleFavoriteClick}
            className={`absolute top-6 right-1.5 w-6 h-6 flex items-center justify-center rounded-full z-10 transition-all duration-200 ${isFavorite ? 'opacity-100 text-amber-400' : 'opacity-0 group-hover:opacity-100 text-gray-600 hover:text-amber-400'}`}
            aria-label={isFavorite?'Remover':'Adicionar'}>
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill={isFavorite?'currentColor':'none'} stroke="currentColor" strokeWidth={2}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </a>
      </div>
    );
  }

  /* ── Card Destaque (pinned) ─────────────────────────────────────────────── */
  if (tool.pinned) {
    const { accentColor, gradientFrom } = tool.pinned;
    return (
      <div className="animate-fadeIn" style={{ animationDelay:`${Math.min(index*35,500)}ms`, animationFillMode:'backwards' }}>
        <a
          href={tool.url} target="_blank" rel="noopener noreferrer"
          onClick={handleCardClick}
          className={`tool-card tool-card-pinned relative group flex flex-col items-center justify-center bg-gradient-to-br ${gradientFrom} to-white dark:from-slate-800 dark:to-slate-900 rounded-3xl p-5 overflow-hidden border-[3px] shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 min-h-[180px]`}
          style={{ borderColor: accentColor }}
          onMouseEnter={() => onMouseEnter(tool)} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
        >
          <div className="absolute top-0 right-0 text-white text-[9px] font-black px-2.5 py-1 rounded-bl-xl uppercase tracking-wider shadow-sm" style={{ backgroundColor:accentColor }}>
            {tool.pinned.badgeText ?? 'Destaque'}
          </div>
          <button onClick={handleFavoriteClick}
            className={`absolute top-2 left-2 w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200 z-10 ${isFavorite ? 'opacity-100 bg-amber-50 text-amber-400' : 'opacity-0 group-hover:opacity-100 bg-white/80 text-gray-300 hover:text-amber-400'}`}
            aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill={isFavorite?'currentColor':'none'} stroke="currentColor" strokeWidth={2}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          <div className="w-16 h-16 flex items-center justify-center bg-white dark:bg-slate-700 rounded-full mb-3 shadow-md group-hover:scale-110 transition-transform duration-300">
            {!imgError ? <img src={tool.iconUrl} alt={tool.name} className="w-10 h-10 object-contain" onError={()=>setImgError(true)} /> : <span className="text-2xl">🔗</span>}
          </div>
          <span className="text-base font-black uppercase text-center leading-tight" style={{ color:accentColor }}>
            <HighlightText text={tool.name} query={searchQuery} />
          </span>
          {tool.isNew && <div className="absolute bottom-2 left-2 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">✦ novo</div>}
        </a>
      </div>
    );
  }

  /* ── Card Normal ────────────────────────────────────────────────────────── */
  return (
    <div className="animate-fadeIn" style={{ animationDelay:`${Math.min(index*35,500)}ms`, animationFillMode:'backwards' }}>
      <a
        href={tool.url} target="_blank" rel="noopener noreferrer"
        onClick={handleCardClick}
        className="tool-card relative group flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-2xl p-5 overflow-hidden border-2 border-transparent shadow-sm hover:shadow-xl hover:shadow-ctrl-blue/10 hover:-translate-y-2 hover:border-gray-100 dark:hover:border-slate-700 transition-all duration-300 min-h-[180px] border-b-[3px] border-b-ctrl-blue/30 hover:border-b-ctrl-blue"
        onMouseEnter={() => onMouseEnter(tool)} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
      >
        <button onClick={handleFavoriteClick}
          className={`absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200 z-10 ${isFavorite ? 'opacity-100 bg-amber-50 dark:bg-amber-900/30 text-amber-400' : 'opacity-0 group-hover:opacity-100 bg-gray-50 dark:bg-slate-700 text-gray-300 hover:text-amber-400'}`}
          aria-label={isFavorite?'Remover dos favoritos':'Adicionar aos favoritos'}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill={isFavorite?'currentColor':'none'} stroke="currentColor" strokeWidth={2}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        <button onClick={handleCopyClick}
          className="absolute top-2 left-2 w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200 z-10 opacity-0 group-hover:opacity-100 bg-gray-50 dark:bg-slate-700 text-gray-300 hover:text-ctrl-blue dark:hover:text-blue-400"
          aria-label="Copiar link" title="Copiar link">
          <Copy className="w-3.5 h-3.5" />
        </button>
        <div className={`w-16 h-16 flex items-center justify-center ${tool.iconBg} dark:bg-slate-700 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300`}>
          {!imgError ? <img src={tool.iconUrl} alt={tool.name} className="w-10 h-10 object-contain" loading="lazy" onError={()=>setImgError(true)} /> : <span className="text-2xl">🔗</span>}
        </div>
        <span className="tool-name text-sm font-bold text-ctrl-blue dark:text-blue-300 uppercase text-center leading-tight line-clamp-2 px-1">
          <HighlightText text={tool.name} query={searchQuery} />
        </span>
        {tool.isNew && <div className="absolute bottom-2 left-2 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">✦ novo</div>}
      </a>
    </div>
  );
};

export default ToolCard;
