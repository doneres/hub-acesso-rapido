import React, { useState, useMemo } from 'react';
import { X, Link, CheckSquare, Square, Search, Check } from 'lucide-react';
import { TOOLS, CATEGORIES } from '../data/tools';
import { Category } from '../types';

interface ShareModalProps {
  isDark: boolean;
  onClose: () => void;
}

const VIRTUAL = new Set(['todos','favoritos','recentes','populares','novos','noticias','robotica']);

const REAL_CATS = CATEGORIES.filter(c => !VIRTUAL.has(c.id));

function encode(ids: string[]): string {
  return btoa(ids.join(','));
}

export default function ShareModal({ isDark, onClose }: ShareModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch]     = useState('');
  const [cat, setCat]           = useState<Category | 'todos'>('todos');
  const [copied, setCopied]     = useState(false);

  const bg     = isDark ? '#0f172a' : '#ffffff';
  const border = isDark ? '#1e293b' : '#e2e8f0';
  const text   = isDark ? '#f1f5f9' : '#0f172a';
  const sub    = isDark ? '#94a3b8' : '#64748b';
  const input  = isDark ? '#1e293b' : '#f8fafc';
  const accent = '#0054a6';

  const visible = useMemo(() => {
    const q = search.toLowerCase().trim();
    return TOOLS.filter(t => {
      const matchCat    = cat === 'todos' || t.category === cat;
      const matchSearch = !q || t.name.toLowerCase().includes(q) || t.tooltip.desc.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [search, cat]);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (visible.every(t => selected.has(t.id))) {
      setSelected(prev => {
        const next = new Set(prev);
        visible.forEach(t => next.delete(t.id));
        return next;
      });
    } else {
      setSelected(prev => {
        const next = new Set(prev);
        visible.forEach(t => next.add(t.id));
        return next;
      });
    }
  };

  const copyLink = () => {
    if (selected.size === 0) return;
    const url = `${window.location.origin}${window.location.pathname}?col=${encode([...selected])}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const allVisibleSelected = visible.length > 0 && visible.every(t => selected.has(t.id));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Compartilhar coleção de ferramentas"
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: '100%', maxWidth: 600,
        background: bg, border: `1px solid ${border}`,
        borderRadius: 16, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        maxHeight: '90vh',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>

        {/* Header */}
        <div style={{
          padding: '18px 20px', borderBottom: `1px solid ${border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: text }}>
              Compartilhar Coleção
            </div>
            <div style={{ fontSize: 12, color: sub, marginTop: 2 }}>
              Selecione ferramentas e copie o link — quem abrir verá só elas
            </div>
          </div>
          <button onClick={onClose} aria-label="Fechar"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: sub, padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        {/* Busca + filtro por categoria */}
        <div style={{ padding: '14px 20px 10px', borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: sub }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar ferramenta..."
              aria-label="Buscar ferramenta"
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '8px 12px 8px 34px',
                background: input, border: `1px solid ${border}`,
                borderRadius: 8, color: text, fontSize: 13, outline: 'none',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = accent)}
              onBlur={e => (e.currentTarget.style.borderColor = border)}
            />
          </div>

          {/* Categoria chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[{ id: 'todos', label: 'Todas', emoji: '🌟' }, ...REAL_CATS.map(c => ({ id: c.id, label: c.label, emoji: c.emoji }))].map(c => (
              <button key={c.id}
                onClick={() => setCat(c.id as Category | 'todos')}
                style={{
                  padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                  cursor: 'pointer', border: 'none',
                  background: cat === c.id ? accent : (isDark ? '#1e293b' : '#f1f5f9'),
                  color: cat === c.id ? '#fff' : sub,
                  transition: 'all .15s',
                }}>
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar: selecionar todos + contagem */}
        <div style={{
          padding: '8px 20px', borderBottom: `1px solid ${border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: isDark ? '#0a0f1e' : '#f8fafc', flexShrink: 0,
        }}>
          <button onClick={toggleAll}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: sub, fontSize: 12, fontWeight: 600 }}>
            {allVisibleSelected
              ? <CheckSquare size={14} style={{ color: accent }} />
              : <Square size={14} />}
            {allVisibleSelected ? 'Desmarcar visíveis' : 'Selecionar visíveis'}
          </button>
          <span style={{ fontSize: 12, color: sub }}>
            {visible.length} visíveis · <strong style={{ color: text }}>{selected.size}</strong> selecionadas
          </span>
        </div>

        {/* Lista de ferramentas */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
          {visible.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: sub, fontSize: 13 }}>
              Nenhuma ferramenta encontrada
            </div>
          ) : (
            visible.map(tool => {
              const isSelected = selected.has(tool.id);
              return (
                <button key={tool.id}
                  onClick={() => toggle(tool.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    padding: '9px 20px', border: 'none', cursor: 'pointer', textAlign: 'left',
                    background: isSelected ? (isDark ? 'rgba(0,84,166,0.12)' : 'rgba(0,84,166,0.06)') : 'transparent',
                    transition: 'background .1s',
                  }}
                  onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = isDark ? '#1e293b50' : '#f1f5f950'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = isSelected ? (isDark ? 'rgba(0,84,166,0.12)' : 'rgba(0,84,166,0.06)') : 'transparent'; }}
                >
                  {/* Checkbox visual */}
                  <div style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                    border: `2px solid ${isSelected ? accent : border}`,
                    background: isSelected ? accent : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all .1s',
                  }}>
                    {isSelected && <Check size={11} color="#fff" strokeWidth={3} />}
                  </div>

                  {/* Ícone */}
                  <img src={tool.iconUrl} alt="" aria-hidden="true"
                    style={{ width: 24, height: 24, objectFit: 'contain', borderRadius: 4, flexShrink: 0 }}
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: text, lineHeight: 1.2 }}>{tool.name}</div>
                    <div style={{ fontSize: 11, color: sub, lineHeight: 1.3, marginTop: 1,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tool.tooltip.desc}
                    </div>
                  </div>

                  {/* Nível */}
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, flexShrink: 0,
                    background: tool.tooltip.level === 'Iniciante' ? '#22c55e20' : tool.tooltip.level === 'Intermediário' ? '#f59e0b20' : '#ef444420',
                    color: tool.tooltip.level === 'Iniciante' ? '#16a34a' : tool.tooltip.level === 'Intermediário' ? '#d97706' : '#dc2626',
                  }}>
                    {tool.tooltip.level}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 20px', borderTop: `1px solid ${border}`,
          display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
          background: isDark ? '#0a0f1e' : '#f8fafc',
        }}>
          {selected.size > 0 && (
            <button onClick={() => setSelected(new Set())}
              style={{ fontSize: 12, fontWeight: 600, color: sub, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}>
              Limpar
            </button>
          )}

          <div style={{ flex: 1 }} />

          {selected.size === 0 ? (
            <span style={{ fontSize: 12, color: sub }}>Selecione ao menos 1 ferramenta</span>
          ) : (
            <span style={{ fontSize: 12, color: sub }}>{selected.size} ferramenta{selected.size !== 1 ? 's' : ''} na coleção</span>
          )}

          <button
            onClick={copyLink}
            disabled={selected.size === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 8, border: 'none',
              background: selected.size === 0 ? (isDark ? '#1e293b' : '#e2e8f0') : (copied ? '#16a34a' : accent),
              color: selected.size === 0 ? sub : '#fff',
              fontWeight: 700, fontSize: 13, cursor: selected.size === 0 ? 'not-allowed' : 'pointer',
              transition: 'all .2s',
            }}
          >
            {copied ? <Check size={15} /> : <Link size={15} />}
            {copied ? 'Copiado!' : 'Copiar Link'}
          </button>
        </div>
      </div>
    </div>
  );
}
