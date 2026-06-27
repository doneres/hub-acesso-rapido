import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft, CheckCircle2, XCircle, Lightbulb, Zap, Trophy,
  Bug, X, RotateCcw, Code2, Flame, Star,
} from 'lucide-react';
import { useGameState } from '../hooks/useGameState';
import { gameTheme } from '../lib/gameTheme';

/* ── Animações ──────────────────────────────────────────────────────────── */
const ANIM_CSS = `
  @keyframes rbhSlideIn   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes rbhPop       { 0%{transform:scale(0.7);opacity:0} 60%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
  @keyframes rbhShake     { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }
  @keyframes rbhGlow      { 0%,100%{box-shadow:0 0 8px #61dafb44} 50%{box-shadow:0 0 24px #61dafbaa} }
  @keyframes rbhScan      { from{top:-2px} to{top:100%} }
  @keyframes rbhXpFill    { from{width:var(--xp-s,0%)} to{width:var(--xp-e,100%)} }
  @keyframes rbhWin       { 0%{opacity:0;transform:scale(0) rotate(-15deg)} 60%{transform:scale(1.15) rotate(3deg)} 100%{opacity:1;transform:scale(1) rotate(0)} }
  @keyframes rbhPulse     { 0%,100%{opacity:0.7} 50%{opacity:1} }
  @keyframes rbhCursor    { 0%,49%{opacity:1} 50%,100%{opacity:0} }
  @keyframes rbhBounce    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
  @keyframes rbhFadeOut   { 0%{opacity:1} 100%{opacity:0;pointer-events:none} }
  @keyframes rbhParticle  { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(var(--px,20px),var(--py,-40px)) scale(0);opacity:0} }
`;

/* ── Tema ───────────────────────────────────────────────────────────────── */
const R = '#61DAFB'; // react blue
const RD = 'rgba(97,218,251,0.13)';

function T(dark: boolean) {
  const base = gameTheme(dark);
  // bg, panel e card mantêm a identidade visual React-blue da página;
  // apenas border/text/sub vêm do tema compartilhado
  return dark ? {
    bg: '#080d18', panel: '#0c1220', code: '#060a10',
    card: '#0f1825', border: base.border, text: base.text,
    sub: base.sub, mut: '#2d3748', accent: R, accentDim: RD,
    inp: '#060a10', inpBd: base.border,
    bugBg: 'rgba(239,68,68,0.15)', bugBd: '#ef4444',
    okBg: 'rgba(34,197,94,0.12)', okBd: '#22c55e',
  } : {
    bg: base.bg, panel: base.panel, code: '#1e1e2e',
    card: base.panel, border: base.border, text: base.text,
    sub: base.sub, mut: '#94a3b8', accent: '#0891b2', accentDim: 'rgba(8,145,178,0.1)',
    inp: '#f8fafc', inpBd: base.border,
    bugBg: 'rgba(239,68,68,0.1)', bugBd: '#dc2626',
    okBg: 'rgba(34,197,94,0.09)', okBd: '#16a34a',
  };
}

const CAT: Record<string, { label: string; color: string; bg: string }> = {
  estado: { label: 'ESTADO',  color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  efeito: { label: 'EFEITO',  color: '#34d399', bg: 'rgba(52,211,153,0.12)'  },
  evento: { label: 'EVENTO',  color: '#fbbf24', bg: 'rgba(251,191,36,0.12)'  },
  jsx:    { label: 'JSX',     color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  hooks:  { label: 'HOOKS',   color: '#60a5fa', bg: 'rgba(96,165,250,0.12)'  },
};
const DIFF_C: Record<string, string> = {
  Iniciante: '#22c55e', Intermediário: '#f59e0b', Avançado: '#ef4444',
};
const LEVELS = [
  { label: 'APRENDIZ',   min: 0   },
  { label: 'CAÇADOR',    min: 80  },
  { label: 'DEBUGGER',   min: 200 },
  { label: 'HACKER',     min: 400 },
  { label: 'GURU REACT', min: 600 },
];
function getLevel(pts: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--)
    if (pts >= LEVELS[i].min) return i;
  return 0;
}

/* ── Tipos ──────────────────────────────────────────────────────────────── */
interface Challenge {
  id: string; title: string; concept: string;
  category: string; difficulty: string; points: number;
  description: string;
  brokenCode: string; bugLines: number[];
  bugCode: string; fixedCode: string;
  hint: string; explanation: string;
  validate: (s: string) => boolean;
  BrokenPreview: React.FC<{ dark: boolean }>;
  FixedPreview:  React.FC<{ dark: boolean }>;
}

/* ══════════════════════════════════════════════════════════════════════════
   PREVIEW COMPONENTS
══════════════════════════════════════════════════════════════════════════ */

/* ── Ch01 ── */
function P01Broken({ dark }: { dark: boolean }) {
  const th = T(dark);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 16, alignItems: 'center' }}>
      <div style={{ padding: '8px 14px', background: th.bugBg, border: `2px solid ${th.bugBd}`, fontSize: 12, color: th.bugBd, width: '100%', textAlign: 'center' }}>
        ⚠ handleClick() disparou ao renderizar!
      </div>
      <button style={{ padding: '10px 24px', background: th.bugBg, border: `2px solid ${th.bugBd}`, color: th.bugBd, cursor: 'default', fontSize: 14, fontWeight: 700 }}>
        Cliques: 0
      </button>
      <p style={{ fontSize: 11, color: th.sub, textAlign: 'center', margin: 0 }}>
        A função é chamada na renderização, não no clique
      </p>
    </div>
  );
}
function P01Fixed({ dark }: { dark: boolean }) {
  const th = T(dark);
  const [n, setN] = useState(0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 16, alignItems: 'center' }}>
      <div style={{ padding: '8px 14px', background: th.okBg, border: `2px solid ${th.okBd}`, fontSize: 12, color: th.okBd, width: '100%', textAlign: 'center' }}>
        ✓ Clique no botão para testar!
      </div>
      <button onClick={() => setN(c => c + 1)} style={{ padding: '10px 24px', background: RD, border: `2px solid ${R}`, color: R, cursor: 'pointer', fontSize: 14, fontWeight: 700, animation: 'rbhGlow 2s ease-in-out infinite' }}>
        Cliques: {n}
      </button>
    </div>
  );
}

/* ── Ch02 ── */
function P02Broken({ dark }: { dark: boolean }) {
  const th = T(dark);
  const items = ['🍎 Maçã', '🍌 Banana', '🍊 Laranja'];
  return (
    <div style={{ padding: 16 }}>
      <div style={{ padding: '8px 12px', background: 'rgba(251,191,36,0.15)', border: '2px solid #fbbf24', fontSize: 11, color: '#d97706', marginBottom: 10, fontFamily: 'monospace' }}>
        ⚠ Warning: Each child in a list should have a unique "key" prop.
      </div>
      <ul style={{ margin: 0, padding: '0 0 0 20px', color: th.text }}>
        {items.map(i => <li key={i} style={{ padding: '4px 0', fontSize: 14 }}>{i}</li>)}
      </ul>
    </div>
  );
}
function P02Fixed({ dark }: { dark: boolean }) {
  const th = T(dark);
  const items = ['🍎 Maçã', '🍌 Banana', '🍊 Laranja'];
  return (
    <div style={{ padding: 16 }}>
      <div style={{ padding: '8px 12px', background: th.okBg, border: `2px solid ${th.okBd}`, fontSize: 11, color: th.okBd, marginBottom: 10 }}>
        ✓ Nenhum aviso — cada item tem uma key única!
      </div>
      <ul style={{ margin: 0, padding: '0 0 0 20px', color: th.text }}>
        {items.map(i => <li key={i} style={{ padding: '4px 0', fontSize: 14 }}>{i}</li>)}
      </ul>
    </div>
  );
}

/* ── Ch03 ── */
function P03Broken({ dark }: { dark: boolean }) {
  const th = T(dark);
  const [items, setItems] = useState(['Estudar React']);
  const add = () => { items.push('Nova tarefa'); setItems(items); };
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button onClick={add} style={{ padding: '8px 16px', background: th.bugBg, border: `2px solid ${th.bugBd}`, color: th.bugBd, cursor: 'pointer', fontSize: 13 }}>
        + Adicionar tarefa
      </button>
      <ul style={{ margin: 0, padding: '0 0 0 16px', color: th.text }}>
        {items.map((it, i) => <li key={i} style={{ fontSize: 13, padding: '3px 0' }}>{it}</li>)}
      </ul>
      <p style={{ fontSize: 11, color: th.sub, margin: 0 }}>Clique no botão — nada acontece! (mutação direta)</p>
    </div>
  );
}
function P03Fixed({ dark }: { dark: boolean }) {
  const th = T(dark);
  const [items, setItems] = useState(['Estudar React']);
  const add = () => setItems(prev => [...prev, `Tarefa ${prev.length + 1}`]);
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button onClick={add} style={{ padding: '8px 16px', background: th.okBg, border: `2px solid ${th.okBd}`, color: th.okBd, cursor: 'pointer', fontSize: 13 }}>
        + Adicionar tarefa
      </button>
      <ul style={{ margin: 0, padding: '0 0 0 16px', color: th.text }}>
        {items.map((it, i) => <li key={i} style={{ fontSize: 13, padding: '3px 0' }}>{it}</li>)}
      </ul>
    </div>
  );
}

/* ── Ch04 ── */
function P04Broken({ dark }: { dark: boolean }) {
  const th = T(dark);
  const [count] = useState(0);
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
      <div style={{ fontSize: 13, color: th.text }}>Itens no carrinho:</div>
      <div style={{ fontSize: 28, color: th.bugBd, fontWeight: 900 }}>{count && '🛒 Você tem itens!'}</div>
      <p style={{ fontSize: 11, color: th.sub, margin: 0, textAlign: 'center' }}>
        {String(count)} é renderizado no lugar da mensagem!<br />0 é falsy — React exibe o número mesmo assim.
      </p>
    </div>
  );
}
function P04Fixed({ dark }: { dark: boolean }) {
  const th = T(dark);
  const [count, setCount] = useState(0);
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
      {count > 0 && <div style={{ fontSize: 18, color: th.okBd }}>🛒 Você tem {count} item(s)!</div>}
      {count === 0 && <div style={{ fontSize: 13, color: th.sub }}>Carrinho vazio</div>}
      <button onClick={() => setCount(c => c + 1)} style={{ padding: '8px 16px', background: th.okBg, border: `2px solid ${th.okBd}`, color: th.okBd, cursor: 'pointer', fontSize: 13 }}>
        + Adicionar item
      </button>
    </div>
  );
}

/* ── Ch05 ── */
function P05Broken({ dark }: { dark: boolean }) {
  const th = T(dark);
  const [val] = useState('');
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input
        value={val}
        style={{ padding: '8px 12px', background: th.inp, border: `2px solid ${th.bugBd}`, color: th.text, fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' }}
        placeholder="Tente digitar aqui..."
        readOnly
      />
      <p style={{ fontSize: 11, color: th.bugBd, margin: 0 }}>⚠ onchange em minúsculas — React ignora! Input travado.</p>
    </div>
  );
}
function P05Fixed({ dark }: { dark: boolean }) {
  const th = T(dark);
  const [val, setVal] = useState('');
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input
        value={val}
        onChange={e => setVal(e.target.value)}
        style={{ padding: '8px 12px', background: th.inp, border: `2px solid ${th.okBd}`, color: th.text, fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' }}
        placeholder="Agora funciona! Digite aqui..."
      />
      {val && <p style={{ fontSize: 13, color: th.okBd, margin: 0 }}>Você digitou: "{val}"</p>}
    </div>
  );
}

/* ── Ch06 ── */
function P06Broken({ dark }: { dark: boolean }) {
  const th = T(dark);
  const [user, setUser] = useState({ nome: 'Ana', idade: 20 });
  const aniversario = () => { user.idade += 1; setUser(user); };
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
      <div style={{ fontSize: 16, color: th.text, fontWeight: 700 }}>{user.nome} — {user.idade} anos</div>
      <button onClick={aniversario} style={{ padding: '8px 18px', background: th.bugBg, border: `2px solid ${th.bugBd}`, color: th.bugBd, cursor: 'pointer' }}>
        🎂 Fazer aniversário
      </button>
      <p style={{ fontSize: 11, color: th.sub, margin: 0, textAlign: 'center' }}>Clique — a idade não muda! (mutação direta)</p>
    </div>
  );
}
function P06Fixed({ dark }: { dark: boolean }) {
  const th = T(dark);
  const [user, setUser] = useState({ nome: 'Ana', idade: 20 });
  const aniversario = () => setUser(u => ({ ...u, idade: u.idade + 1 }));
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
      <div style={{ fontSize: 16, color: th.text, fontWeight: 700 }}>{user.nome} — {user.idade} anos</div>
      <button onClick={aniversario} style={{ padding: '8px 18px', background: th.okBg, border: `2px solid ${th.okBd}`, color: th.okBd, cursor: 'pointer' }}>
        🎂 Fazer aniversário
      </button>
    </div>
  );
}

/* ── Ch07 ── */
function P07Broken({ dark }: { dark: boolean }) {
  const th = T(dark);
  const [nome, setNome] = useState('Maria');
  const [msg, setMsg] = useState(`Olá, Maria! Bem-vindo.`);
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 14, color: th.text, fontStyle: 'italic' }}>"{msg}"</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {['Maria', 'João', 'Pedro'].map(n => (
          <button key={n} onClick={() => setNome(n)}
            style={{ padding: '6px 12px', background: nome === n ? th.bugBg : 'transparent', border: `1px solid ${th.bugBd}`, color: nome === n ? th.bugBd : th.sub, cursor: 'pointer', fontSize: 12 }}>
            {n}
          </button>
        ))}
      </div>
      <p style={{ fontSize: 11, color: th.bugBd, margin: 0 }}>Mudar o nome não atualiza a saudação! (dep faltando)</p>
    </div>
  );
}
function P07Fixed({ dark }: { dark: boolean }) {
  const th = T(dark);
  const [nome, setNome] = useState('Maria');
  const [msg, setMsg] = useState(`Olá, Maria! Bem-vindo.`);
  useEffect(() => { setMsg(`Olá, ${nome}! Bem-vindo.`); }, [nome]);
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 14, color: th.text, fontStyle: 'italic' }}>"{msg}"</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {['Maria', 'João', 'Pedro'].map(n => (
          <button key={n} onClick={() => setNome(n)}
            style={{ padding: '6px 12px', background: nome === n ? th.okBg : 'transparent', border: `1px solid ${th.okBd}`, color: nome === n ? th.okBd : th.sub, cursor: 'pointer', fontSize: 12 }}>
            {n}
          </button>
        ))}
      </div>
      <p style={{ fontSize: 11, color: th.okBd, margin: 0 }}>✓ Saudação atualiza quando o nome muda!</p>
    </div>
  );
}

/* ── Ch08 ── */
function P08Broken({ dark }: { dark: boolean }) {
  const th = T(dark);
  const [t, setT] = useState(0);
  const [mounted, setMounted] = useState(true);
  useEffect(() => {
    if (!mounted) return;
    const id = setInterval(() => setT(x => x + 1), 300);
    return () => clearInterval(id);
  }, [mounted]);
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
      <div style={{ fontSize: 28, fontFamily: 'monospace', color: th.bugBd, fontWeight: 900 }}>⏱ {t}s</div>
      <button onClick={() => setMounted(false)} style={{ padding: '6px 14px', background: th.bugBg, border: `2px solid ${th.bugBd}`, color: th.bugBd, cursor: 'pointer', fontSize: 12 }}>
        Desmontar componente
      </button>
      <p style={{ fontSize: 11, color: th.sub, margin: 0, textAlign: 'center' }}>
        Sem cleanup: setInterval vaza memória ao desmontar!
      </p>
    </div>
  );
}
function P08Fixed({ dark }: { dark: boolean }) {
  const th = T(dark);
  const [t, setT] = useState(0);
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setT(x => x + 1), 300);
    return () => clearInterval(id);
  }, [active]);
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
      <div style={{ fontSize: 28, fontFamily: 'monospace', color: th.okBd, fontWeight: 900 }}>⏱ {t}s</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setActive(true)} style={{ padding: '6px 14px', background: th.okBg, border: `2px solid ${th.okBd}`, color: th.okBd, cursor: 'pointer', fontSize: 12 }}>
          Iniciar
        </button>
        <button onClick={() => { setActive(false); setT(0); }} style={{ padding: '6px 14px', background: 'transparent', border: `1px solid ${th.sub}`, color: th.sub, cursor: 'pointer', fontSize: 12 }}>
          Parar
        </button>
      </div>
      <p style={{ fontSize: 11, color: th.okBd, margin: 0 }}>✓ clearInterval no cleanup — sem vazamento!</p>
    </div>
  );
}

/* ── Ch09 ── */
function P09Broken({ dark }: { dark: boolean }) {
  const th = T(dark);
  const [count, setCount] = useState(0);
  const add3 = () => {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  };
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
      <div style={{ fontSize: 36, fontWeight: 900, color: th.bugBd }}>{count}</div>
      <button onClick={add3} style={{ padding: '8px 20px', background: th.bugBg, border: `2px solid ${th.bugBd}`, color: th.bugBd, cursor: 'pointer', fontSize: 13 }}>
        +3
      </button>
      <p style={{ fontSize: 11, color: th.sub, margin: 0, textAlign: 'center' }}>Clique: adiciona só 1! (closure stale)</p>
    </div>
  );
}
function P09Fixed({ dark }: { dark: boolean }) {
  const th = T(dark);
  const [count, setCount] = useState(0);
  const add3 = () => {
    setCount(c => c + 1);
    setCount(c => c + 1);
    setCount(c => c + 1);
  };
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
      <div style={{ fontSize: 36, fontWeight: 900, color: th.okBd }}>{count}</div>
      <button onClick={add3} style={{ padding: '8px 20px', background: th.okBg, border: `2px solid ${th.okBd}`, color: th.okBd, cursor: 'pointer', fontSize: 13 }}>
        +3
      </button>
      <p style={{ fontSize: 11, color: th.okBd, margin: 0 }}>✓ Adiciona 3 por vez!</p>
    </div>
  );
}

/* ── Ch10 ── */
function P10Broken({ dark }: { dark: boolean }) {
  const th = T(dark);
  const [msg, setMsg] = useState('');
  const handleSubmit = () => { setMsg('Formulário enviado! (mas a página recarregaria)'); };
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ padding: '8px 12px', background: th.bugBg, border: `2px solid ${th.bugBd}`, fontSize: 11, color: th.bugBd }}>
        ⚠ Sem preventDefault() — submit causa reload da página!
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input style={{ flex: 1, padding: '8px 10px', background: th.inp, border: `1px solid ${th.inpBd}`, color: th.text, fontSize: 13, outline: 'none' }} placeholder="Email..." />
        <button onClick={handleSubmit} style={{ padding: '8px 14px', background: th.bugBg, border: `2px solid ${th.bugBd}`, color: th.bugBd, cursor: 'pointer', fontSize: 12 }}>Enviar</button>
      </div>
      {msg && <p style={{ fontSize: 11, color: th.sub, margin: 0 }}>{msg}</p>}
    </div>
  );
}
function P10Fixed({ dark }: { dark: boolean }) {
  const th = T(dark);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setSent(true); };
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {sent ? (
        <div style={{ padding: '12px', background: th.okBg, border: `2px solid ${th.okBd}`, color: th.okBd, textAlign: 'center' }}>
          ✓ Enviado! Sem reload da página.
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
          <input value={email} onChange={e => setEmail(e.target.value)} style={{ flex: 1, padding: '8px 10px', background: th.inp, border: `1px solid ${th.okBd}`, color: th.text, fontSize: 13, outline: 'none' }} placeholder="Email..." />
          <button type="submit" style={{ padding: '8px 14px', background: th.okBg, border: `2px solid ${th.okBd}`, color: th.okBd, cursor: 'pointer', fontSize: 12 }}>Enviar</button>
        </form>
      )}
    </div>
  );
}

/* ── Ch11 ── */
function P11Broken({ dark }: { dark: boolean }) {
  const th = T(dark);
  const valor = "50";
  const resultado = (valor as unknown as number) + 10;
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
      <div style={{ fontSize: 13, color: th.sub }}>Progresso atual + 10%:</div>
      <div style={{ fontSize: 32, fontWeight: 900, color: th.bugBd }}>{resultado}%</div>
      <p style={{ fontSize: 11, color: th.bugBd, margin: 0, textAlign: 'center' }}>
        ⚠ value="50" é string — "50" + 10 = "5010"!
      </p>
    </div>
  );
}
function P11Fixed({ dark }: { dark: boolean }) {
  const th = T(dark);
  const valor = 50;
  const resultado = valor + 10;
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
      <div style={{ fontSize: 13, color: th.sub }}>Progresso atual + 10%:</div>
      <div style={{ fontSize: 32, fontWeight: 900, color: th.okBd }}>{resultado}%</div>
      <div style={{ width: '100%', height: 10, background: th.border, borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${resultado}%`, height: '100%', background: th.okBd, transition: 'width 0.5s' }} />
      </div>
      <p style={{ fontSize: 11, color: th.okBd, margin: 0 }}>✓ value={'{50}'} é number — 50 + 10 = 60!</p>
    </div>
  );
}

/* ── Ch12 ── */
function P12Broken({ dark }: { dark: boolean }) {
  const th = T(dark);
  const [show, setShow] = useState(false);
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button onClick={() => setShow(s => !s)} style={{ padding: '8px 16px', background: th.bugBg, border: `2px solid ${th.bugBd}`, color: th.bugBd, cursor: 'pointer', fontSize: 13 }}>
        Toggle: {show ? 'ON' : 'OFF'}
      </button>
      {show && (
        <div style={{ padding: '8px 12px', background: th.bugBg, border: `2px solid ${th.bugBd}`, fontSize: 12, color: th.bugBd }}>
          ⚠ Retornar undefined (return; vazio) causa erro no React
        </div>
      )}
      {!show && <p style={{ fontSize: 11, color: th.sub, margin: 0 }}>Componentes devem retornar null, não undefined</p>}
    </div>
  );
}
function P12Fixed({ dark }: { dark: boolean }) {
  const th = T(dark);
  const [show, setShow] = useState(false);
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button onClick={() => setShow(s => !s)} style={{ padding: '8px 16px', background: th.okBg, border: `2px solid ${th.okBd}`, color: th.okBd, cursor: 'pointer', fontSize: 13 }}>
        Toggle: {show ? 'ON' : 'OFF'}
      </button>
      {show && <div style={{ padding: '8px 12px', background: th.okBg, border: `2px solid ${th.okBd}`, fontSize: 13, color: th.okBd }}>✓ Componente visível!</div>}
      {!show && <p style={{ fontSize: 11, color: th.sub, margin: 0 }}>Oculto com return null — sem erros!</p>}
    </div>
  );
}

/* ── Ch13 ── */
function P13Broken({ dark }: { dark: boolean }) {
  const th = T(dark);
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.15)', border: '2px solid #ef4444', fontFamily: 'monospace', fontSize: 11, color: '#ef4444' }}>
        <div style={{ fontWeight: 900, marginBottom: 4 }}>React Error:</div>
        <div>Invalid hook call. Hooks cannot be called inside conditions, loops, or nested functions.</div>
      </div>
      <p style={{ fontSize: 11, color: th.sub, margin: 0 }}>useState dentro de if{'{}'} viola as Regras dos Hooks!</p>
    </div>
  );
}
function P13Fixed({ dark }: { dark: boolean }) {
  const th = T(dark);
  const [show, setShow] = useState(false);
  const [val, setVal] = useState('');
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ padding: '8px 12px', background: th.okBg, border: `2px solid ${th.okBd}`, fontSize: 11, color: th.okBd }}>
        ✓ useState sempre no topo — Regras dos Hooks respeitadas!
      </div>
      <button onClick={() => setShow(s => !s)} style={{ padding: '6px 14px', background: th.okBg, border: `1px solid ${th.okBd}`, color: th.okBd, cursor: 'pointer', fontSize: 12 }}>
        {show ? 'Ocultar' : 'Mostrar'} campo
      </button>
      {show && <input value={val} onChange={e => setVal(e.target.value)} style={{ padding: '6px 10px', background: th.inp, border: `1px solid ${th.okBd}`, color: th.text, fontSize: 13, outline: 'none' }} placeholder="Funciona!" />}
    </div>
  );
}

/* ── Ch14 ── */
function P14Broken({ dark }: { dark: boolean }) {
  const th = T(dark);
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
      <div style={{ padding: '10px 14px', background: th.bugBg, border: `2px solid ${th.bugBd}`, fontSize: 11, color: th.bugBd, width: '100%' }}>
        <div style={{ fontWeight: 900, marginBottom: 4 }}>⚠ Loop Infinito Detectado!</div>
        <div>setState() durante o render causa re-render → setState → re-render → ...</div>
      </div>
      <div style={{ fontSize: 13, color: th.sub, textAlign: 'center' }}>A página trava completamente</div>
    </div>
  );
}
function P14Fixed({ dark }: { dark: boolean }) {
  const th = T(dark);
  const [count, setCount] = useState(0);
  useEffect(() => { setCount(42); }, []);
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
      <div style={{ padding: '8px 12px', background: th.okBg, border: `2px solid ${th.okBd}`, fontSize: 11, color: th.okBd }}>
        ✓ setState dentro do useEffect — sem loop!
      </div>
      <div style={{ fontSize: 32, fontWeight: 900, color: th.okBd }}>{count}</div>
      <p style={{ fontSize: 11, color: th.sub, margin: 0 }}>Valor setado uma vez ao montar</p>
    </div>
  );
}

/* ── Ch15 ── */
function P15Broken({ dark }: { dark: boolean }) {
  const th = T(dark);
  const [items, setItems] = useState([{ id: 1, name: '🍎 Maçã' }, { id: 2, name: '🍌 Banana' }, { id: 3, name: '🍊 Laranja' }]);
  const remove = (id: number) => setItems(prev => prev.filter(i => i.id !== id));
  return (
    <div style={{ padding: 16 }}>
      <p style={{ fontSize: 11, color: th.bugBd, margin: '0 0 8px' }}>⚠ key={'{index}'} — problemas ao remover do meio:</p>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 8px', marginBottom: 4, background: th.bugBg, border: `1px solid ${th.bugBd}` }}>
          <span style={{ fontSize: 13, color: th.text }}>{item.name}</span>
          <button onClick={() => remove(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: th.bugBd, fontSize: 11 }}>✕</button>
        </div>
      ))}
    </div>
  );
}
function P15Fixed({ dark }: { dark: boolean }) {
  const th = T(dark);
  const [items, setItems] = useState([{ id: 1, name: '🍎 Maçã' }, { id: 2, name: '🍌 Banana' }, { id: 3, name: '🍊 Laranja' }]);
  const remove = (id: number) => setItems(prev => prev.filter(i => i.id !== id));
  return (
    <div style={{ padding: 16 }}>
      <p style={{ fontSize: 11, color: th.okBd, margin: '0 0 8px' }}>✓ key={'{item.id}'} — remoção estável:</p>
      {items.map(item => (
        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 8px', marginBottom: 4, background: th.okBg, border: `1px solid ${th.okBd}` }}>
          <span style={{ fontSize: 13, color: th.text }}>{item.name}</span>
          <button onClick={() => remove(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: th.okBd, fontSize: 11 }}>✕</button>
        </div>
      ))}
    </div>
  );
}

/* ── Ch16 ── */
function P16Broken({ dark }: { dark: boolean }) {
  const th = T(dark);
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input
        value="React"
        style={{ padding: '8px 12px', background: th.inp, border: `2px solid ${th.bugBd}`, color: th.text, fontSize: 14, outline: 'none' }}
        readOnly
      />
      <p style={{ fontSize: 11, color: th.bugBd, margin: 0 }}>⚠ value sem onChange → input somente leitura (controlled sem setter)</p>
    </div>
  );
}
function P16Fixed({ dark }: { dark: boolean }) {
  const th = T(dark);
  const [val, setVal] = useState('React');
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input
        value={val}
        onChange={e => setVal(e.target.value)}
        style={{ padding: '8px 12px', background: th.inp, border: `2px solid ${th.okBd}`, color: th.text, fontSize: 14, outline: 'none' }}
      />
      <p style={{ fontSize: 11, color: th.okBd, margin: 0 }}>✓ value + onChange = input controlado!</p>
    </div>
  );
}

/* ── Ch17 ── */
function P17Broken({ dark }: { dark: boolean }) {
  const th = T(dark);
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ padding: '10px', background: 'rgba(251,191,36,0.15)', border: '2px solid #fbbf24', fontFamily: 'monospace', fontSize: 11, color: '#d97706' }}>
        Warning: Effect callbacks are synchronous to prevent race conditions. Put the async function inside.
      </div>
      <p style={{ fontSize: 11, color: th.sub, margin: 0 }}>useEffect(async () ={'>'}...) retorna uma Promise, não uma cleanup function!</p>
    </div>
  );
}
function P17Fixed({ dark }: { dark: boolean }) {
  const th = T(dark);
  const [data, setData] = useState<string | null>(null);
  useEffect(() => {
    async function fetchData() {
      await new Promise(r => setTimeout(r, 600));
      setData('{ "status": "ok", "usuario": "Ana" }');
    }
    fetchData();
  }, []);
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ padding: '8px 12px', background: th.okBg, border: `2px solid ${th.okBd}`, fontSize: 11, color: th.okBd }}>
        ✓ async function interna — cleanup function preservada
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#7ee787', background: th.code, padding: 10 }}>
        {data ?? 'Carregando...'}
      </div>
    </div>
  );
}

/* ── Ch18 ── */
function P18Broken({ dark }: { dark: boolean }) {
  const th = T(dark);
  const [count, setCount] = useState(0);
  const log = useRef<string[]>([]);
  const show = useCallback(() => {
    log.current = [...log.current, `Valor capturado: ${count}`];
    setCount(c => c); // force render to show log
  // eslint-disable-next-line
  }, []); // bug: count missing
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setCount(c => c + 1)} style={{ padding: '6px 12px', background: th.bugBg, border: `1px solid ${th.bugBd}`, color: th.bugBd, cursor: 'pointer', fontSize: 12 }}>
          Incrementar ({count})
        </button>
        <button onClick={show} style={{ padding: '6px 12px', background: th.bugBg, border: `1px solid ${th.bugBd}`, color: th.bugBd, cursor: 'pointer', fontSize: 12 }}>
          Mostrar valor
        </button>
      </div>
      {log.current.slice(-2).map((l, i) => <div key={i} style={{ fontSize: 11, color: th.bugBd, fontFamily: 'monospace' }}>{l} ← sempre 0!</div>)}
    </div>
  );
}
function P18Fixed({ dark }: { dark: boolean }) {
  const th = T(dark);
  const [count, setCount] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const show = useCallback(() => {
    setLog(l => [...l.slice(-1), `Valor atual: ${count}`]);
  }, [count]);
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setCount(c => c + 1)} style={{ padding: '6px 12px', background: th.okBg, border: `1px solid ${th.okBd}`, color: th.okBd, cursor: 'pointer', fontSize: 12 }}>
          Incrementar ({count})
        </button>
        <button onClick={show} style={{ padding: '6px 12px', background: th.okBg, border: `1px solid ${th.okBd}`, color: th.okBd, cursor: 'pointer', fontSize: 12 }}>
          Mostrar valor
        </button>
      </div>
      {log.map((l, i) => <div key={i} style={{ fontSize: 11, color: th.okBd, fontFamily: 'monospace' }}>{l} ✓</div>)}
    </div>
  );
}

/* ── Ch19 ── */
function P19Broken({ dark }: { dark: boolean }) {
  const th = T(dark);
  const [runs, setRuns] = useState(0);
  const runRef = useRef(0);
  useEffect(() => {
    runRef.current += 1;
    if (runRef.current <= 8) setRuns(runRef.current);
  }, [{}]); // new object every render
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
      <div style={{ fontSize: 11, color: th.bugBd }}>⚠ Execuções do useEffect:</div>
      <div style={{ fontSize: 36, fontWeight: 900, color: th.bugBd }}>{runs}+</div>
      <p style={{ fontSize: 11, color: th.sub, margin: 0, textAlign: 'center' }}>
        {'{ }'} cria um novo objeto a cada render → deps sempre "mudaram"
      </p>
    </div>
  );
}
function P19Fixed({ dark }: { dark: boolean }) {
  const th = T(dark);
  const [runs, setRuns] = useState(0);
  useEffect(() => {
    setRuns(1);
  }, []); // stable dep
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
      <div style={{ fontSize: 11, color: th.okBd }}>✓ Execuções do useEffect:</div>
      <div style={{ fontSize: 36, fontWeight: 900, color: th.okBd }}>{runs}</div>
      <p style={{ fontSize: 11, color: th.okBd, margin: 0, textAlign: 'center' }}>Executou apenas 1 vez ao montar!</p>
    </div>
  );
}

/* ── Ch20 ── */
function P20Broken({ dark }: { dark: boolean }) {
  const th = T(dark);
  const [n, setN] = useState(0);
  const tripleAdd = () => {
    setN(n + 1); setN(n + 1); setN(n + 1);
  };
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
      <div style={{ fontSize: 36, fontWeight: 900, color: th.bugBd }}>{n}</div>
      <button onClick={tripleAdd} style={{ padding: '8px 20px', background: th.bugBg, border: `2px solid ${th.bugBd}`, color: th.bugBd, cursor: 'pointer' }}>
        Adicionar 3
      </button>
      <p style={{ fontSize: 11, color: th.sub, margin: 0, textAlign: 'center' }}>Adiciona só 1 por vez — closure captura valor antigo</p>
    </div>
  );
}
function P20Fixed({ dark }: { dark: boolean }) {
  const th = T(dark);
  const [n, setN] = useState(0);
  const tripleAdd = () => {
    setN(p => p + 1); setN(p => p + 1); setN(p => p + 1);
  };
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
      <div style={{ fontSize: 36, fontWeight: 900, color: th.okBd }}>{n}</div>
      <button onClick={tripleAdd} style={{ padding: '8px 20px', background: th.okBg, border: `2px solid ${th.okBd}`, color: th.okBd, cursor: 'pointer' }}>
        Adicionar 3
      </button>
      <p style={{ fontSize: 11, color: th.okBd, margin: 0 }}>✓ Functional update — sempre o valor mais recente!</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   CHALLENGE DATA
══════════════════════════════════════════════════════════════════════════ */
const CHALLENGES: Challenge[] = [
  {
    id: 'rch-01', title: 'Botão que Dispara Sozinho', concept: 'Referência de Função',
    category: 'evento', difficulty: 'Iniciante', points: 10,
    description: 'O botão deve contar cliques, mas está disparando antes mesmo de ser clicado.',
    brokenCode: `function AvisoButton() {
  const [cliques, setCliques] = useState(0);

  const handleClick = () => {
    setCliques(c => c + 1);
  };

  return (
    <button onClick={handleClick()}>
      Cliques: {cliques}
    </button>
  );
}`,
    bugLines: [9], bugCode: `    <button onClick={handleClick()}>`,
    fixedCode: `    <button onClick={handleClick}>`,
    hint: 'handleClick() com parênteses executa a função imediatamente. Você quer passar a função, não o resultado dela.',
    explanation: 'onClick={handleClick()} chama a função durante a renderização e passa undefined como handler. O correto é onClick={handleClick} — uma referência à função, executada apenas no clique.',
    validate: s => s.replace(/\s/g,'').includes('onClick={handleClick}') && !s.replace(/\s/g,'').includes('handleClick()'),
    BrokenPreview: P01Broken, FixedPreview: P01Fixed,
  },
  {
    id: 'rch-02', title: 'Lista Sem Identidade', concept: 'key Prop',
    category: 'jsx', difficulty: 'Iniciante', points: 10,
    description: 'Uma lista de frutas é renderizada mas o React não consegue rastreá-las individualmente.',
    brokenCode: `function ListaFrutas() {
  const frutas = ['Maçã', 'Banana', 'Laranja'];

  return (
    <ul>
      {frutas.map(fruta => (
        <li>{fruta}</li>
      ))}
    </ul>
  );
}`,
    bugLines: [7], bugCode: `        <li>{fruta}</li>`,
    fixedCode: `        <li key={fruta}>{fruta}</li>`,
    hint: 'Cada elemento dentro de um .map() precisa de uma prop especial para o React identificá-lo.',
    explanation: 'O React usa a prop "key" para identificar quais itens mudaram, foram adicionados ou removidos. Sem ela, o React emite um warning e pode ter comportamento incorreto ao atualizar listas.',
    validate: s => s.includes('key='),
    BrokenPreview: P02Broken, FixedPreview: P02Fixed,
  },
  {
    id: 'rch-03', title: 'Array Imutável', concept: 'Imutabilidade de Estado',
    category: 'estado', difficulty: 'Iniciante', points: 10,
    description: 'Botão de adicionar tarefa não funciona — a lista nunca atualiza na tela.',
    brokenCode: `function ListaTarefas() {
  const [tarefas, setTarefas] = useState(['Estudar']);

  const adicionar = () => {
    tarefas.push('Nova tarefa');
    setTarefas(tarefas);
  };

  return (
    <>
      <button onClick={adicionar}>+ Adicionar</button>
      <ul>
        {tarefas.map((t, i) => <li key={i}>{t}</li>)}
      </ul>
    </>
  );
}`,
    bugLines: [5, 6], bugCode: `    tarefas.push('Nova tarefa');\n    setTarefas(tarefas);`,
    fixedCode: `    setTarefas([...tarefas, 'Nova tarefa']);`,
    hint: 'Nunca mute o array diretamente. Crie um novo array com spread operator ou .concat().',
    explanation: 'push() modifica o array existente sem criar uma nova referência. O React compara referências para detectar mudanças — como é o mesmo array, ele ignora a atualização. Crie sempre um novo array com spread: [...tarefas, novoItem].',
    validate: s => (s.includes('[...tarefas') || s.includes('.concat(')) && s.includes('setTarefas'),
    BrokenPreview: P03Broken, FixedPreview: P03Fixed,
  },
  {
    id: 'rch-04', title: 'O Zero Traidor', concept: 'Renderização Condicional',
    category: 'jsx', difficulty: 'Iniciante', points: 10,
    description: 'Quando o carrinho está vazio, aparece "0" na tela em vez de nada.',
    brokenCode: `function Carrinho() {
  const [itens, setItens] = useState(0);

  return (
    <div>
      {itens && <span>🛒 Você tem itens!</span>}
      <button onClick={() => setItens(1)}>
        Adicionar item
      </button>
    </div>
  );
}`,
    bugLines: [6], bugCode: `      {itens && <span>🛒 Você tem itens!</span>}`,
    fixedCode: `      {itens > 0 && <span>🛒 Você tem itens!</span>}`,
    hint: 'O valor 0 é falsy, mas o React ainda renderiza números. Converta para booleano explicitamente.',
    explanation: 'Com &&, se o lado esquerdo for falsy, o React renderiza o valor diretamente. 0 é falsy, mas é um valor numérico que o React renderiza na tela. Use itens > 0, Boolean(itens) ou !!itens para garantir um booleano real.',
    validate: s => s.includes('> 0') || s.includes('!== 0') || s.includes('Boolean(') || s.includes('!!'),
    BrokenPreview: P04Broken, FixedPreview: P04Fixed,
  },
  {
    id: 'rch-05', title: 'Evento Insensível', concept: 'Nomes de Eventos JSX',
    category: 'evento', difficulty: 'Iniciante', points: 10,
    description: 'Você digita no input mas o texto não aparece — o input está travado.',
    brokenCode: `function Campo() {
  const [valor, setValor] = useState('');

  return (
    <input
      value={valor}
      onchange={e => setValor(e.target.value)}
      placeholder="Digite aqui..."
    />
  );
}`,
    bugLines: [7], bugCode: `      onchange={e => setValor(e.target.value)}`,
    fixedCode: `      onChange={e => setValor(e.target.value)}`,
    hint: 'JSX não é HTML. Os nomes de eventos no React seguem camelCase.',
    explanation: 'No JSX, todos os event handlers usam camelCase: onChange, onClick, onSubmit, onKeyDown etc. "onchange" em minúsculas é ignorado pelo React — é tratado como atributo HTML inválido.',
    validate: s => s.trimStart().startsWith('onChange') && !s.trimStart().startsWith('onchange'),
    BrokenPreview: P05Broken, FixedPreview: P05Fixed,
  },
  {
    id: 'rch-06', title: 'Objeto Congelado', concept: 'Spread em Objetos',
    category: 'estado', difficulty: 'Intermediário', points: 25,
    description: 'Clicar em "Fazer aniversário" não atualiza a idade do usuário.',
    brokenCode: `function Perfil() {
  const [usuario, setUsuario] = useState(
    { nome: 'Ana', idade: 20 }
  );

  const aniversario = () => {
    usuario.idade += 1;
    setUsuario(usuario);
  };

  return (
    <div>
      <p>{usuario.nome} — {usuario.idade} anos</p>
      <button onClick={aniversario}>🎂 Aniversário</button>
    </div>
  );
}`,
    bugLines: [7, 8], bugCode: `    usuario.idade += 1;\n    setUsuario(usuario);`,
    fixedCode: `    setUsuario({ ...usuario, idade: usuario.idade + 1 });`,
    hint: 'Nunca mute propriedades de um objeto de estado diretamente. Crie um novo objeto com spread.',
    explanation: 'usuario.idade += 1 modifica o objeto existente. O React compara referências — como o objeto é o mesmo, não re-renderiza. A solução: { ...usuario, idade: usuario.idade + 1 } cria um NOVO objeto com todas as propriedades copiadas e idade atualizada.',
    validate: s => s.includes('...usuario') && s.includes('setUsuario'),
    BrokenPreview: P06Broken, FixedPreview: P06Fixed,
  },
  {
    id: 'rch-07', title: 'Efeito Amnésico', concept: 'Dependências do useEffect',
    category: 'efeito', difficulty: 'Intermediário', points: 25,
    description: 'A saudação é criada uma vez mas não atualiza quando o nome muda.',
    brokenCode: `function Saudacao({ nome }) {
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    setMensagem(\`Olá, \${nome}! Bem-vindo.\`);
  }, []);

  return <p>{mensagem}</p>;
}`,
    bugLines: [6], bugCode: `  }, []);`,
    fixedCode: `  }, [nome]);`,
    hint: 'O array de dependências diz ao React quando re-executar o efeito. Se você usa uma variável dentro do efeito, ela deve estar na lista.',
    explanation: '[] vazio executa o efeito apenas na montagem. Como "nome" não está nas deps, o efeito nunca re-executa quando nome muda — a saudação fica desatualizada. Adicionar [nome] garante que o efeito rode sempre que nome mudar.',
    validate: s => s.replace(/\s/g,'').includes('[nome]') || s.replace(/\s/g,'').includes('[nome,') || s.replace(/\s/g,'').includes(',nome]'),
    BrokenPreview: P07Broken, FixedPreview: P07Fixed,
  },
  {
    id: 'rch-08', title: 'Timer Fantasma', concept: 'Cleanup do useEffect',
    category: 'efeito', difficulty: 'Intermediário', points: 25,
    description: 'Um timer inicia mas não para quando o componente é desmontado — causando vazamento de memória.',
    brokenCode: `function Relogio() {
  const [tempo, setTempo] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTempo(t => t + 1);
    }, 1000);
  }, []);

  return <p>⏱ {tempo}s</p>;
}`,
    bugLines: [7], bugCode: `  }, []);`,
    fixedCode: `    return () => clearInterval(id);\n  }, []);`,
    hint: 'useEffect pode retornar uma função de cleanup. Ela é executada quando o componente desmonta ou o efeito re-executa.',
    explanation: 'Sem cleanup, setInterval continua rodando mesmo após o componente ser removido do DOM — causando memory leak e erros de "setState em componente desmontado". A função retornada pelo useEffect é chamada na desmontagem.',
    validate: s => s.includes('clearInterval') && s.includes('return'),
    BrokenPreview: P08Broken, FixedPreview: P08Fixed,
  },
  {
    id: 'rch-09', title: 'Closure Traiçoeira', concept: 'Functional Update',
    category: 'estado', difficulty: 'Intermediário', points: 25,
    description: 'O botão +3 deveria adicionar 3, mas adiciona apenas 1.',
    brokenCode: `function Contador() {
  const [count, setCount] = useState(0);

  const add3 = () => {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  };

  return (
    <div>
      <p>Total: {count}</p>
      <button onClick={add3}>+3</button>
    </div>
  );
}`,
    bugLines: [5, 6, 7], bugCode: `    setCount(count + 1);\n    setCount(count + 1);\n    setCount(count + 1);`,
    fixedCode: `    setCount(c => c + 1);\n    setCount(c => c + 1);\n    setCount(c => c + 1);`,
    hint: 'Cada setCount captura o mesmo valor de "count" da closure. Use a forma funcional para sempre trabalhar com o valor mais recente.',
    explanation: 'As três chamadas capturam o mesmo "count" (ex: 0) da closure, então todas calculam 0+1=1. Com a forma funcional setCount(c => c+1), o React passa o estado mais recente como argumento — garantindo que cada chamada use o resultado da anterior.',
    validate: s => s.includes('=> c + 1') || s.includes('=> prev + 1') || s.includes('(c)=>c+1') || s.includes('prev=>prev+1'),
    BrokenPreview: P09Broken, FixedPreview: P09Fixed,
  },
  {
    id: 'rch-10', title: 'Formulário Fugitivo', concept: 'preventDefault',
    category: 'evento', difficulty: 'Iniciante', points: 10,
    description: 'Ao enviar o formulário, a página recarrega em vez de processar os dados.',
    brokenCode: `function FormLogin() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    console.log('Enviando:', email);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
      />
      <button type="submit">Entrar</button>
    </form>
  );
}`,
    bugLines: [4, 5, 6], bugCode: `  const handleSubmit = (e) => {\n    console.log('Enviando:', email);\n  };`,
    fixedCode: `  const handleSubmit = (e) => {\n    e.preventDefault();\n    console.log('Enviando:', email);\n  };`,
    hint: 'O comportamento padrão de um formulário HTML é submeter e recarregar a página. Você precisa prevenir esse comportamento.',
    explanation: 'Formulários HTML recarregam a página ao submeter — esse é o comportamento padrão do browser. e.preventDefault() cancela esse comportamento padrão, permitindo que você gerencie o submit com JavaScript.',
    validate: s => s.includes('preventDefault'),
    BrokenPreview: P10Broken, FixedPreview: P10Fixed,
  },
  {
    id: 'rch-11', title: 'String ou Número?', concept: 'Props Tipadas',
    category: 'jsx', difficulty: 'Iniciante', points: 10,
    description: 'O cálculo de progresso retorna "5010" em vez de 60.',
    brokenCode: `function Progresso({ valor }) {
  const resultado = valor + 10;

  return (
    <div>
      <p>Progresso: {resultado}%</p>
      <div style={{ width: \`\${resultado}%\` }} />
    </div>
  );
}

// Uso incorreto:
<Progresso value="50" />`,
    bugLines: [13], bugCode: `<Progresso value="50" />`,
    fixedCode: `<Progresso value={50} />`,
    hint: 'Aspas passam strings. Para passar números, booleans ou expressões JS, use chaves {}.',
    explanation: 'value="50" passa a string "50". Quando você faz "50" + 10 em JavaScript, o resultado é "5010" (concatenação de string). Use value={50} para passar o número real.',
    validate: s => s.includes('{50}') || s.replace(/\s/g,'').includes('value={50}'),
    BrokenPreview: P11Broken, FixedPreview: P11Fixed,
  },
  {
    id: 'rch-12', title: 'Retorno Fantasma', concept: 'return null',
    category: 'jsx', difficulty: 'Iniciante', points: 10,
    description: 'Quando a condição é falsa, o componente retorna undefined e causa um erro.',
    brokenCode: `function Alerta({ mensagem }) {
  if (!mensagem) {
    return;
  }

  return (
    <div className="alerta">
      {mensagem}
    </div>
  );
}`,
    bugLines: [3], bugCode: `    return;`,
    fixedCode: `    return null;`,
    hint: 'Componentes React devem sempre retornar algo. Para renderizar nada, retorne null explicitamente.',
    explanation: 'Um componente que retorna undefined causa erro no React. Quando você não quer renderizar nada, retorne null — isso diz ao React explicitamente "não renderize nada aqui", sem erros.',
    validate: s => s.replace(/\s/g,'') === 'returnnull;' || s.trim() === 'return null;',
    BrokenPreview: P12Broken, FixedPreview: P12Fixed,
  },
  {
    id: 'rch-13', title: 'Hook Condicional', concept: 'Regras dos Hooks',
    category: 'hooks', difficulty: 'Avançado', points: 50,
    description: 'O componente quebra quando "ativo" muda — hook dentro de condicional viola as Regras dos Hooks.',
    brokenCode: `function Formulario({ ativo }) {
  if (ativo) {
    const [valor, setValor] = useState('');
  }

  return (
    <div>
      {ativo && <input />}
    </div>
  );
}`,
    bugLines: [2, 3, 4], bugCode: `  if (ativo) {\n    const [valor, setValor] = useState('');\n  }`,
    fixedCode: `  const [valor, setValor] = useState('');`,
    hint: 'Hooks sempre devem ser chamados no nível mais alto do componente — nunca dentro de ifs, loops ou funções aninhadas.',
    explanation: 'O React rastreia a ordem das chamadas de hooks. Se um hook estiver dentro de uma condição, a ordem pode mudar entre renders — corrompendo o estado interno do React. Sempre declare hooks no topo do componente, independente de condições.',
    validate: s => s.replace(/\s/g,'').includes('const[valor,setValor]=useState') && !s.includes('if'),
    BrokenPreview: P13Broken, FixedPreview: P13Fixed,
  },
  {
    id: 'rch-14', title: 'Loop Infinito', concept: 'setState no Render',
    category: 'estado', difficulty: 'Avançado', points: 50,
    description: 'O componente entra em loop infinito e trava o browser.',
    brokenCode: `function Contador() {
  const [count, setCount] = useState(0);

  setCount(count + 1); // BUG: durante o render!

  return <div>Count: {count}</div>;
}`,
    bugLines: [4], bugCode: `  setCount(count + 1); // BUG: durante o render!`,
    fixedCode: `  useEffect(() => {\n    setCount(42);\n  }, []);`,
    hint: 'Nunca chame setState diretamente no corpo do componente. Use useEffect para efeitos colaterais.',
    explanation: 'Chamar setState durante o render dispara um re-render, que chama setState novamente, criando um loop infinito. Para executar código com efeitos colaterais (como atualizar estado após montar), use useEffect.',
    validate: s => s.includes('useEffect') && s.includes('setCount') && !s.match(/^\s*setCount/m),
    BrokenPreview: P14Broken, FixedPreview: P14Fixed,
  },
  {
    id: 'rch-15', title: 'Key de Identidade', concept: 'key Estável',
    category: 'jsx', difficulty: 'Intermediário', points: 25,
    description: 'Ao remover um item do meio da lista, os elementos ficam trocados.',
    brokenCode: `function ListaDinamica({ itens }) {
  const [lista, setLista] = useState(itens);

  const remover = (id) =>
    setLista(l => l.filter(i => i.id !== id));

  return (
    <ul>
      {lista.map((item, index) => (
        <li key={index}>
          {item.nome}
          <button onClick={() => remover(item.id)}>✕</button>
        </li>
      ))}
    </ul>
  );
}`,
    bugLines: [10], bugCode: `        <li key={index}>`,
    fixedCode: `        <li key={item.id}>`,
    hint: 'O índice muda quando itens são removidos. Use um identificador estável e único de cada item.',
    explanation: 'Usar index como key funciona em listas estáticas, mas falha quando a lista muda. Ao remover o item do meio, os índices mudam — o React se confunde e pode exibir valores incorretos. Sempre use um ID único e estável como key.',
    validate: s => s.includes('key={item.id}') || s.includes("key={item['id']}"),
    BrokenPreview: P15Broken, FixedPreview: P15Fixed,
  },
  {
    id: 'rch-16', title: 'Input Travado', concept: 'Controlled Component',
    category: 'estado', difficulty: 'Iniciante', points: 10,
    description: 'O input tem um valor definido mas não aceita digitação.',
    brokenCode: `function BuscaInput() {
  const [busca, setBusca] = useState('');

  return (
    <input
      value={busca}
      placeholder="Pesquisar..."
    />
  );
}`,
    bugLines: [5, 6, 7], bugCode: `    <input\n      value={busca}\n      placeholder="Pesquisar..."`,
    fixedCode: `    <input\n      value={busca}\n      onChange={e => setBusca(e.target.value)}\n      placeholder="Pesquisar..."`,
    hint: 'Um input com "value" controlado precisa de "onChange" para atualizar o estado quando o usuário digita.',
    explanation: 'Quando você define value={busca}, o React controla o input — ele sempre mostra o valor do state. Sem onChange para atualizar o state, o input fica preso no valor inicial. É o "input controlado" do React: value + onChange andam juntos.',
    validate: s => s.includes('onChange') && (s.includes('setBusca') || s.includes('setValue') || s.includes('set')),
    BrokenPreview: P16Broken, FixedPreview: P16Fixed,
  },
  {
    id: 'rch-17', title: 'Async no Efeito', concept: 'async/await no useEffect',
    category: 'efeito', difficulty: 'Intermediário', points: 25,
    description: 'O useEffect com async direto causa um warning e problemas de cleanup.',
    brokenCode: `function DadosUsuario() {
  const [dados, setDados] = useState(null);

  useEffect(async () => {
    const res = await fetch('/api/usuario');
    const json = await res.json();
    setDados(json);
  }, []);

  return <div>{dados?.nome}</div>;
}`,
    bugLines: [4], bugCode: `  useEffect(async () => {`,
    fixedCode: `  useEffect(() => {\n    async function buscar() {\n      const res = await fetch('/api/usuario');\n      const json = await res.json();\n      setDados(json);\n    }\n    buscar();`,
    hint: 'useEffect não pode receber uma função async diretamente. Crie uma função async interna e a chame.',
    explanation: 'Uma função async retorna uma Promise. useEffect espera uma função de cleanup (ou nothing), não uma Promise. A solução é criar uma função async interna e chamá-la dentro do useEffect síncrono.',
    validate: s => s.includes('async function') || (s.includes('async') && s.includes('=>') && !s.match(/useEffect\s*\(\s*async/)),
    BrokenPreview: P17Broken, FixedPreview: P17Fixed,
  },
  {
    id: 'rch-18', title: 'Callback Desatualizado', concept: 'useCallback deps',
    category: 'hooks', difficulty: 'Avançado', points: 50,
    description: 'useCallback com deps vazias captura o valor inicial do state e nunca atualiza.',
    brokenCode: `function Painel() {
  const [count, setCount] = useState(0);

  const mostrarCount = useCallback(() => {
    alert(\`Count atual: \${count}\`);
  }, []); // BUG: count não está nas deps!

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>+</button>
      <button onClick={mostrarCount}>Mostrar</button>
    </div>
  );
}`,
    bugLines: [6], bugCode: `  }, []); // BUG: count não está nas deps!`,
    fixedCode: `  }, [count]);`,
    hint: 'useCallback memoriza a função, mas ela precisa ser recriada quando suas dependências mudam.',
    explanation: 'Com deps vazias, mostrarCount captura count=0 e nunca é recriada. Qualquer clique em "Mostrar" sempre exibe 0. Adicionar [count] nas deps garante que o callback seja recriado quando count muda, capturando sempre o valor atual.',
    validate: s => s.replace(/\s/g,'').includes('[count]') && !s.replace(/\s/g,'').includes('[],'),
    BrokenPreview: P18Broken, FixedPreview: P18Fixed,
  },
  {
    id: 'rch-19', title: 'Objeto nas Deps', concept: 'Referência em useEffect',
    category: 'efeito', difficulty: 'Avançado', points: 50,
    description: 'O useEffect executa infinitamente porque um objeto literal está nas dependências.',
    brokenCode: `function Configuracao() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api', {
      headers: { 'Content-Type': 'application/json' }
    }).then(r => r.json()).then(setData);
  }, [{ headers: { 'Content-Type': 'application/json' } }]);

  return <div>{data}</div>;
}`,
    bugLines: [8], bugCode: `  }, [{ headers: { 'Content-Type': 'application/json' } }]);`,
    fixedCode: `  }, []);`,
    hint: 'Objetos literais criam uma nova referência a cada render. Remova o objeto das deps ou mova-o para fora do componente.',
    explanation: 'A cada render, { headers: {...} } cria um novo objeto — nova referência. O React detecta "a dep mudou!" e re-executa o efeito, causando loop. A solução: [] se o objeto é estático, ou usar useMemo/variável externa para estabilizar a referência.',
    validate: s => s.replace(/\s/g,'').includes(',[])') || s.replace(/\s/g,'').includes(',[]);'),
    BrokenPreview: P19Broken, FixedPreview: P19Fixed,
  },
  {
    id: 'rch-20', title: 'Estado Desatualizado', concept: 'Functional Update Pattern',
    category: 'estado', difficulty: 'Intermediário', points: 25,
    description: 'Três atualizações simultâneas de estado se comportam como uma só.',
    brokenCode: `function Placar() {
  const [pontos, setPontos] = useState(0);

  const triploPoint = () => {
    setPontos(pontos + 1);
    setPontos(pontos + 1);
    setPontos(pontos + 1);
  };

  return (
    <div>
      <p>Pontos: {pontos}</p>
      <button onClick={triploPoint}>Triple Score!</button>
    </div>
  );
}`,
    bugLines: [5, 6, 7], bugCode: `    setPontos(pontos + 1);\n    setPontos(pontos + 1);\n    setPontos(pontos + 1);`,
    fixedCode: `    setPontos(p => p + 1);\n    setPontos(p => p + 1);\n    setPontos(p => p + 1);`,
    hint: 'Múltiplas chamadas de setState no mesmo evento usam o valor do state no início do evento, não o valor após cada chamada anterior.',
    explanation: 'O React agrupa (batches) múltiplas chamadas setState. Todas capturam o mesmo "pontos" da closure. Com functional update setPontos(p => p + 1), o React passa o resultado da última atualização — garantindo +1, +1, +1 = +3 total.',
    validate: s => (s.includes('=> p + 1') || s.includes('=> prev + 1') || s.includes('(p)=>p+1')) && s.includes('setPontos'),
    BrokenPreview: P20Broken, FixedPreview: P20Fixed,
  },
];

/* ══════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════════════════════════════ */

/* ── Code Display ── */
function CodeDisplay({ code, bugLines, isDark }: { code: string; bugLines: number[]; isDark: boolean }) {
  const th = T(isDark);
  const lines = code.split('\n');
  return (
    <div style={{ background: th.code, border: `1px solid ${th.border}`, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: isDark ? '#0d1117' : '#161b22', borderBottom: `1px solid ${th.border}` }}>
        {['#ff5f57', '#febc2e', '#28c840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
        <span style={{ marginLeft: 8, fontSize: 11, color: '#8b949e', fontFamily: 'monospace' }}>bug.jsx</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        {lines.map((line, i) => {
          const lineNum = i + 1;
          const isBug = bugLines.includes(lineNum);
          return (
            <div key={i} style={{
              display: 'flex', fontFamily: 'monospace', fontSize: 13, lineHeight: '22px',
              background: isBug ? th.bugBg : 'transparent',
              borderLeft: isBug ? `3px solid ${th.bugBd}` : '3px solid transparent',
            }}>
              <span style={{ width: 36, flexShrink: 0, color: isBug ? th.bugBd : '#4a5568', fontSize: 11, paddingRight: 12, textAlign: 'right', userSelect: 'none', paddingLeft: 4 }}>
                {lineNum}
              </span>
              <span style={{ color: isBug ? '#fca5a5' : '#abb2bf', whiteSpace: 'pre', paddingRight: 16 }}>
                {line || ' '}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Fix Editor ── */
function FixEditor({ bugCode, value, onChange, isDark, submitted, correct }: {
  bugCode: string; value: string; onChange: (v: string) => void;
  isDark: boolean; submitted: boolean; correct: boolean;
}) {
  const th = T(isDark);
  const borderColor = submitted ? (correct ? th.okBd : th.bugBd) : (value !== bugCode ? th.accent : th.inpBd);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Code2 size={13} color={th.sub} />
        <span style={{ fontSize: 11, fontFamily: 'monospace', color: th.sub }}>Corrija o código com bug:</span>
        {submitted && !correct && <span style={{ fontSize: 11, color: th.bugBd }}>— tente novamente!</span>}
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={submitted && correct}
        spellCheck={false}
        rows={Math.max(2, value.split('\n').length + 1)}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '10px 14px',
          fontFamily: 'monospace', fontSize: 13, lineHeight: '22px',
          background: th.inp, border: `2px solid ${borderColor}`,
          color: th.text, outline: 'none', resize: 'vertical',
          transition: 'border-color .2s',
          animation: submitted && !correct ? 'rbhShake 0.4s ease' : 'none',
        }}
      />
    </div>
  );
}

/* ── Progress Bar ── */
function XpBar({ pts, isDark }: { pts: number; isDark: boolean }) {
  const th = T(isDark);
  const lvIdx = getLevel(pts);
  const lv = LEVELS[lvIdx];
  const next = LEVELS[lvIdx + 1];
  const pct = next ? Math.min(100, ((pts - lv.min) / (next.min - lv.min)) * 100) : 100;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: th.accent, whiteSpace: 'nowrap' }}>
        {lv.label}
      </span>
      <div style={{ flex: 1, height: 8, background: th.border, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: th.accent, transition: 'width 0.6s ease' }} />
      </div>
      {next && <span style={{ fontSize: 10, color: th.sub, whiteSpace: 'nowrap' }}>{pts}/{next.min}</span>}
    </div>
  );
}

/* ── Win Overlay ── */
function WinOverlay({ pts, combo, isDark, onNext }: { pts: number; combo: number; isDark: boolean; onNext: () => void }) {
  const th = T(isDark);
  const comboBonus = combo >= 3 ? Math.floor(pts * 0.5) : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div style={{ textAlign: 'center', animation: 'rbhWin 0.5s ease both' }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🐛✅</div>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 14, color: th.okBd, marginBottom: 8 }}>BUG CORRIGIDO!</div>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 20, color: '#fbbf24', marginBottom: 4 }}>+{pts} XP</div>
        {comboBonus > 0 && (
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: '#f97316', marginBottom: 8 }}>
            🔥 COMBO x{combo} +{comboBonus} BONUS!
          </div>
        )}
        <button onClick={onNext} style={{
          display: 'flex', alignItems: 'center', gap: 8, margin: '16px auto 0',
          padding: '12px 24px', background: th.okBd, border: 'none',
          color: '#fff', fontFamily: "'Press Start 2P', monospace", fontSize: 10,
          cursor: 'pointer', boxShadow: `0 0 20px ${th.okBd}80`,
        }}>
          PRÓXIMO BUG →
        </button>
      </div>
    </div>
  );
}

/* ── Challenge List ── */
function ChallengeList({ challenges, solved, current, onSelect, isDark }: {
  challenges: Challenge[]; solved: Set<string>; current: string;
  onSelect: (id: string) => void; isDark: boolean;
}) {
  const th = T(isDark);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingRight: 4 }}>
      {challenges.map((ch, i) => {
        const isSolved = solved.has(ch.id);
        const isCurrent = current === ch.id;
        return (
          <button
            key={ch.id}
            onClick={() => onSelect(ch.id)}
            style={{
              textAlign: 'left', padding: '8px 10px',
              background: isCurrent ? th.accentDim : isSolved ? th.okBg : th.card,
              border: `1.5px solid ${isCurrent ? th.accent : isSolved ? th.okBd : th.border}`,
              cursor: 'pointer', transition: 'all .15s',
              opacity: 1,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: th.sub }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              {isSolved && <CheckCircle2 size={11} color={th.okBd} />}
              <span style={{ fontSize: 8, fontWeight: 700, padding: '1px 5px', background: CAT[ch.category].bg, color: CAT[ch.category].color }}>
                {CAT[ch.category].label}
              </span>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: isCurrent ? th.accent : th.text, lineHeight: 1.3 }}>
              {ch.title}
            </div>
            <div style={{ fontSize: 10, color: DIFF_C[ch.difficulty], marginTop: 2 }}>
              {ch.difficulty} · +{ch.points}xp
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════════════ */
interface Props { onBack: () => void; isDark?: boolean; }

export default function ReactBugHunterPage({ onBack, isDark = true }: Props) {
  const th = T(isDark);
  const { addCoins } = useGameState();
  const [currentId, setCurrentId] = useState(CHALLENGES[0].id);
  // ref síncrono para evitar double-click conceder moedas em dobro
  // (useState é assíncrono e não reflete no mesmo ciclo de evento)
  const solvedRef = useRef(new Set<string>());
  const [userInput, setUserInput]   = useState('');
  const [submitted, setSubmitted]   = useState(false);
  const [correct, setCorrect]       = useState(false);
  const [hintShown, setHintShown]   = useState(false);
  const [showWin, setShowWin]       = useState(false);
  const [totalPts, setTotalPts]     = useState(0);
  const [solved, setSolved]         = useState<Set<string>>(new Set());
  const [combo, setCombo]           = useState(0);
  const [previewFixed, setPreviewFixed] = useState(false);
  const [allDone, setAllDone]       = useState(false);

  const ch = CHALLENGES.find(c => c.id === currentId)!;

  // Reset when challenge changes
  useEffect(() => {
    setUserInput(ch.bugCode);
    setSubmitted(false);
    setCorrect(false);
    setHintShown(false);
    setShowWin(false);
    setPreviewFixed(solved.has(ch.id));
  }, [currentId]); // eslint-disable-line

  const handleVerify = () => {
    const ok = ch.validate(userInput);
    setSubmitted(true);
    setCorrect(ok);
    if (ok && !solvedRef.current.has(ch.id)) {
      solvedRef.current.add(ch.id); // marca imediatamente (síncrono) — previne double-click
      const pts = hintShown ? Math.floor(ch.points / 2) : ch.points;
      const newCombo = combo + 1;
      const bonus = newCombo >= 3 ? Math.floor(pts * 0.5) : 0;
      const earned = pts + bonus;
      setTotalPts(p => p + earned);
      setCombo(newCombo);
      setSolved(s => new Set([...s, ch.id]));
      addCoins(earned); // credita moedas para uso na loja (não altera ranking de pontos)
      setPreviewFixed(true);
      setTimeout(() => setShowWin(true), 400);
    } else if (!ok) {
      setCombo(0);
    } else {
      setPreviewFixed(true);
    }
  };

  const handleNext = () => {
    setShowWin(false);
    const idx = CHALLENGES.findIndex(c => c.id === currentId);
    if (idx < CHALLENGES.length - 1) {
      setCurrentId(CHALLENGES[idx + 1].id);
    } else {
      setAllDone(true);
    }
  };

  const handleReset = () => {
    setUserInput(ch.bugCode);
    setSubmitted(false);
    setCorrect(false);
    setHintShown(false);
  };

  const solvedCount = solved.size;
  const lvIdx = getLevel(totalPts);

  if (allDone) {
    return (
      <div style={{ minHeight: '100vh', background: th.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <style>{ANIM_CSS}</style>
        <div style={{ textAlign: 'center', animation: 'rbhSlideIn 0.5s ease', padding: 24 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🏆</div>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 16, color: '#fbbf24', marginBottom: 12 }}>PARABÉNS!</div>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: th.text, marginBottom: 8 }}>TODOS OS 20 BUGS CORRIGIDOS!</div>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 20, color: R, marginBottom: 24 }}>{totalPts} XP · {LEVELS[lvIdx].label}</div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => { setSolved(new Set()); setTotalPts(0); setCombo(0); setCurrentId(CHALLENGES[0].id); setAllDone(false); }}
              style={{ padding: '12px 24px', background: RD, border: `2px solid ${R}`, color: R, fontFamily: "'Press Start 2P', monospace", fontSize: 9, cursor: 'pointer' }}>
              JOGAR NOVAMENTE
            </button>
            <button onClick={onBack}
              style={{ padding: '12px 24px', background: 'transparent', border: `1px solid ${th.border}`, color: th.sub, fontFamily: "'Press Start 2P', monospace", fontSize: 9, cursor: 'pointer' }}>
              VOLTAR À ARENA
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: th.bg, fontFamily: 'system-ui, -apple-system, sans-serif', color: th.text }}>
      <style>{ANIM_CSS}</style>

      {/* ── Scanline ── */}
      {isDark && (
        <div style={{ position: 'fixed', left: 0, right: 0, height: 2, zIndex: 5, pointerEvents: 'none', background: `linear-gradient(90deg,transparent,${R}30,transparent)`, animation: 'rbhScan 8s linear infinite' }} />
      )}

      {/* ── TOP BAR ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: th.panel, borderBottom: `1px solid ${th.border}`, padding: '10px 20px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: `1px solid ${th.border}`, color: th.sub, cursor: 'pointer', padding: '6px 12px', fontSize: 11 }}>
            <ChevronLeft size={13} /> Voltar
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bug size={16} color={R} />
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: R }}>REACT BUG HUNTER</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: RD, border: `1px solid ${R}40` }}>
            <Trophy size={13} color="#fbbf24" />
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#fbbf24' }}>{totalPts} XP</span>
          </div>

          {combo >= 3 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'rgba(249,115,22,0.15)', border: '1px solid #f97316' }}>
              <Flame size={13} color="#f97316" />
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#f97316' }}>COMBO x{combo}</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: th.card, border: `1px solid ${th.border}` }}>
            <CheckCircle2 size={13} color={th.okBd} />
            <span style={{ fontSize: 12, color: th.sub }}>{solvedCount}/20</span>
          </div>

          <div style={{ flex: 1, minWidth: 120 }}>
            <XpBar pts={totalPts} isDark={isDark} />
          </div>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: '220px 1fr 1fr', gap: 0, minHeight: 'calc(100vh - 60px)' }}>

        {/* ── LEFT: Challenge list ── */}
        <div style={{ background: th.panel, borderRight: `1px solid ${th.border}`, padding: '16px 12px', overflowY: 'auto' }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: th.sub, marginBottom: 12, letterSpacing: '0.1em' }}>
            DESAFIOS ({solvedCount}/20)
          </div>
          <ChallengeList
            challenges={CHALLENGES}
            solved={solved}
            current={currentId}
            onSelect={id => { setCurrentId(id); }}
            isDark={isDark}
          />
        </div>

        {/* ── CENTER: Code editor ── */}
        <div style={{ borderRight: `1px solid ${th.border}`, display: 'flex', flexDirection: 'column', padding: 20, gap: 16, overflowY: 'auto' }}>

          {/* Challenge header */}
          <div style={{ animation: 'rbhSlideIn 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: th.sub }}>
                {String(CHALLENGES.findIndex(c => c.id === currentId) + 1).padStart(2, '0')}/20
              </span>
              <span style={{ padding: '2px 8px', fontSize: 10, fontWeight: 700, background: CAT[ch.category].bg, color: CAT[ch.category].color }}>
                {CAT[ch.category].label}
              </span>
              <span style={{ padding: '2px 8px', fontSize: 10, fontWeight: 700, background: `${DIFF_C[ch.difficulty]}20`, color: DIFF_C[ch.difficulty] }}>
                {ch.difficulty}
              </span>
              <span style={{ padding: '2px 8px', fontSize: 10, color: '#fbbf24', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)' }}>
                +{ch.points} XP
              </span>
            </div>
            <h2 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: R, margin: '0 0 6px' }}>{ch.title}</h2>
            <p style={{ fontSize: 13, color: th.sub, margin: '0 0 4px', lineHeight: 1.6 }}>{ch.description}</p>
            <div style={{ fontSize: 11, color: th.mut }}>
              Conceito: <span style={{ color: th.accent, fontWeight: 700 }}>{ch.concept}</span>
            </div>
          </div>

          {/* Code display */}
          <CodeDisplay code={ch.brokenCode} bugLines={ch.bugLines} isDark={isDark} />

          {/* Fix editor */}
          <FixEditor
            bugCode={ch.bugCode}
            value={userInput}
            onChange={setUserInput}
            isDark={isDark}
            submitted={submitted}
            correct={correct}
          />

          {/* Hint */}
          {hintShown && (
            <div style={{ display: 'flex', gap: 10, padding: '12px 14px', background: 'rgba(251,191,36,0.1)', border: '2px solid rgba(251,191,36,0.4)' }}>
              <Lightbulb size={14} color="#fbbf24" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: th.sub, margin: 0, lineHeight: 1.6 }}>{ch.hint}</p>
            </div>
          )}

          {/* Success explanation */}
          {submitted && correct && (
            <div style={{ padding: '14px', background: th.okBg, border: `2px solid ${th.okBd}`, animation: 'rbhSlideIn 0.3s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <CheckCircle2 size={15} color={th.okBd} />
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: th.okBd }}>BUG CORRIGIDO!</span>
              </div>
              <p style={{ fontSize: 13, color: th.sub, margin: 0, lineHeight: 1.7 }}>{ch.explanation}</p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 'auto' }}>
            {!hintShown && !(submitted && correct) && (
              <button onClick={() => setHintShown(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'none', border: '2px solid rgba(251,191,36,0.5)', color: '#fbbf24', cursor: 'pointer', fontSize: 12 }}>
                <Lightbulb size={13} /> Dica <span style={{ opacity: 0.7, fontSize: 10 }}>(−50% XP)</span>
              </button>
            )}
            {!(submitted && correct) && (
              <button onClick={handleReset}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', background: 'none', border: `1px solid ${th.border}`, color: th.sub, cursor: 'pointer', fontSize: 12 }}>
                <RotateCcw size={13} /> Resetar
              </button>
            )}
            {!(submitted && correct) ? (
              <button onClick={handleVerify}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 20px', background: RD, border: `2px solid ${R}`, color: R, cursor: 'pointer', fontFamily: "'Press Start 2P', monospace", fontSize: 10, transition: 'all .15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = R; (e.currentTarget as HTMLElement).style.color = '#000'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = RD; (e.currentTarget as HTMLElement).style.color = R; }}>
                <Zap size={14} /> VERIFICAR FIX
              </button>
            ) : (
              <button onClick={handleNext}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 20px', background: th.okBd, border: 'none', color: '#fff', cursor: 'pointer', fontFamily: "'Press Start 2P', monospace", fontSize: 10 }}>
                <Star size={14} /> PRÓXIMO BUG →
              </button>
            )}
          </div>
        </div>

        {/* ── RIGHT: Preview ── */}
        <div style={{ display: 'flex', flexDirection: 'column', padding: 20, gap: 16, overflowY: 'auto' }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: th.sub, letterSpacing: '0.12em' }}>
            VISUALIZAÇÃO AO VIVO
          </div>

          {/* Preview toggle */}
          <div style={{ display: 'flex', border: `1px solid ${th.border}`, overflow: 'hidden' }}>
            {[{ key: false, label: '🐛 COM BUG', color: th.bugBd }, { key: true, label: '✓ CORRIGIDO', color: th.okBd }].map(({ key, label, color }) => (
              <button key={String(key)} onClick={() => setPreviewFixed(key)}
                style={{
                  flex: 1, padding: '8px', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700,
                  background: previewFixed === key ? `${color}20` : th.card,
                  color: previewFixed === key ? color : th.sub,
                  borderBottom: previewFixed === key ? `2px solid ${color}` : '2px solid transparent',
                  transition: 'all .15s',
                }}>
                {label}
              </button>
            ))}
          </div>

          {/* Preview panel */}
          <div style={{ position: 'relative', flex: 1, background: th.card, border: `1px solid ${previewFixed ? th.okBd : th.bugBd}`, minHeight: 200, overflow: 'hidden', transition: 'border-color .3s' }}>
            <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 10, padding: '3px 8px', background: previewFixed ? th.okBg : th.bugBg, color: previewFixed ? th.okBd : th.bugBd, border: `1px solid ${previewFixed ? th.okBd : th.bugBd}` }}>
              {previewFixed ? '✓ FUNCIONANDO' : '⚠ COM BUG'}
            </div>

            {previewFixed
              ? <ch.FixedPreview dark={isDark} />
              : <ch.BrokenPreview dark={isDark} />
            }

            {/* Win overlay */}
            {showWin && (
              <WinOverlay
                pts={hintShown ? Math.floor(ch.points / 2) : ch.points}
                combo={combo}
                isDark={isDark}
                onNext={handleNext}
              />
            )}
          </div>

          {/* Fixed code reveal */}
          {submitted && correct && (
            <div style={{ animation: 'rbhSlideIn 0.4s ease' }}>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: th.okBd, marginBottom: 8 }}>SOLUÇÃO CORRETA:</div>
              <div style={{ background: th.code, border: `1px solid ${th.okBd}`, padding: 12, fontFamily: 'monospace', fontSize: 12, color: '#7ee787', whiteSpace: 'pre-wrap' }}>
                {ch.fixedCode}
              </div>
            </div>
          )}

          {/* Progress stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'RESOLVIDOS', val: solvedCount, color: th.okBd },
              { label: 'XP TOTAL',   val: totalPts,    color: '#fbbf24' },
              { label: 'COMBO',      val: combo,        color: '#f97316' },
              { label: 'NÍVEL',      val: LEVELS[lvIdx].label, color: th.accent },
            ].map(s => (
              <div key={s.label} style={{ padding: '10px', background: th.card, border: `1px solid ${th.border}`, textAlign: 'center' }}>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: th.sub, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: typeof s.val === 'string' ? 7 : 12, color: s.color }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Category legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {Object.entries(CAT).map(([k, v]) => {
              const catSolved = CHALLENGES.filter(c => c.category === k && solved.has(c.id)).length;
              const catTotal  = CHALLENGES.filter(c => c.category === k).length;
              return (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', background: v.bg, border: `1px solid ${v.color}40`, fontSize: 10 }}>
                  <span style={{ color: v.color, fontWeight: 700 }}>{v.label}</span>
                  <span style={{ color: th.sub }}>{catSolved}/{catTotal}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
