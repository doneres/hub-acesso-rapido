import React, { useState } from 'react';
import {
  Trophy, Swords, Search, LogIn, LogOut, Crown, Medal,
  Lock, User, ChevronLeft, Users, Shield, X, Bug, Cpu,
  ShoppingBag, Check, Palette, Star,
} from 'lucide-react';
import { useGameState, GameUser, LoginResult } from '../hooks/useGameState';
import { COSMETICS, CosmeticDef } from '../data/cosmetics';

/* ─── TOKENS ─────────────────────────────────────────────────── */
const C = {
  bg:      '#07090f',
  panel:   '#0c1220',
  card:    '#0f1828',
  border:  'rgba(129,140,248,0.1)',
  borderH: 'rgba(129,140,248,0.35)',
  accent:  '#818cf8',
  gold:    '#f59e0b',
  red:     '#f87171',
  green:   '#4ade80',
  cyan:    '#22d3ee',
  purple:  '#c084fc',
  blue:    '#60a5fa',
  lime:    '#a3e635',
  sky:     '#38bdf8',
  text:    '#e2e8f0',
  sub:     '#64748b',
  muted:   '#1e293b',
};

/* ─── GLOBAL STYLES ──────────────────────────────────────────── */
const STYLES = `
  @keyframes fadeIn  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideL  { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
  @keyframes slideR  { from{opacity:0;transform:translateX(10px)}  to{opacity:1;transform:translateX(0)} }
  @keyframes scaleIn { from{opacity:0;transform:scale(.97)} to{opacity:1;transform:scale(1)} }

  * { scrollbar-width: thin; scrollbar-color: rgba(129,140,248,0.2) transparent; }
  ::-webkit-scrollbar { width: 3px; height: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(129,140,248,0.22); border-radius: 2px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(129,140,248,0.5); }

  .g-card { transition: border-color .15s, box-shadow .15s, transform .15s; }
  .g-card:hover { transform: translateY(-2px); }
  .g-play { transition: background .13s, color .13s, box-shadow .13s; }
  .rank-r { transition: background .1s; }
  .rank-r:hover { background: rgba(129,140,248,0.05) !important; }
  .hdr-btn { transition: color .15s, background .15s; }
`;

/* ─── HELPERS ────────────────────────────────────────────────── */
const AV_COLORS = ['#ef4444','#f97316','#f59e0b','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#ec4899','#14b8a6','#6366f1'];

function strColor(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = h * 31 + s.charCodeAt(i);
  return AV_COLORS[Math.abs(h) % AV_COLORS.length];
}

function Avatar({ avatar, name, size = 28 }: { avatar: string; name: string; size?: number }) {
  const bg = avatar?.startsWith('#') ? avatar : strColor(name);
  return (
    <div style={{ width: size, height: size, background: bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 3 }}>
      <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: size * .34, color: '#fff', lineHeight: 1 }}>
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

/* ─── AUTH MODAL ─────────────────────────────────────────────── */
function AuthModal({ users, onLogin, onRegister, onClose }: {
  users: any[];
  onLogin: (n: string, p: string) => Promise<LoginResult>;
  onRegister: (n: string, av: string, p: string) => Promise<string>;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<'login' | 'register'>(users.length > 0 ? 'login' : 'register');
  const [name, setName] = useState('');
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [av, setAv] = useState(AV_COLORS[0]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const inp: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '10px 12px 10px 36px',
    background: '#060a14', border: `1px solid rgba(129,140,248,0.18)`,
    color: C.text, fontSize: 13, fontFamily: 'inherit', outline: 'none', borderRadius: 3,
  };

  const doLogin = async () => {
    if (!name.trim() || !pass) { setErr('Preencha usuário e senha.'); return; }
    setLoading(true); setErr('');
    const r = await onLogin(name.trim(), pass);
    setLoading(false);
    if (r === 'not-found') { setErr('Usuário não encontrado.'); return; }
    if (r === 'wrong-password') { setErr('Senha incorreta.'); return; }
    onClose();
  };
  const doRegister = async () => {
    if (name.trim().length < 3) { setErr('Mínimo 3 caracteres.'); return; }
    if (pass.length < 4) { setErr('Senha com 4+ caracteres.'); return; }
    if (pass !== pass2) { setErr('Senhas não coincidem.'); return; }
    if (users.some((u: any) => u.name.toLowerCase() === name.trim().toLowerCase())) { setErr('Nome já em uso.'); return; }
    setLoading(true); setErr('');
    await onRegister(name.trim(), av, pass);
    setLoading(false); onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(6px)' }}>
      <div style={{ width: '100%', maxWidth: 370, background: C.panel, border: `1px solid ${C.borderH}`, borderRadius: 6, animation: 'scaleIn .17s ease' }}>

        <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 10, color: C.accent }}>
            {mode === 'login' ? 'ENTRAR' : 'CRIAR CONTA'}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.sub, padding: 4, lineHeight: 0 }}>
            <X size={15} />
          </button>
        </div>

        {users.length > 0 && (
          <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}` }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setErr(''); }}
                style={{ flex: 1, padding: '9px', border: 'none', cursor: 'pointer', background: 'transparent', borderBottom: mode === m ? `2px solid ${C.accent}` : '2px solid transparent', color: mode === m ? C.accent : C.sub, fontSize: 11, fontWeight: 700, transition: 'color .15s' }}>
                {m === 'login' ? 'Entrar' : 'Cadastrar'}
              </button>
            ))}
          </div>
        )}

        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mode === 'register' && (
            <div>
              <div style={{ fontSize: 11, color: C.sub, marginBottom: 8 }}>Cor do avatar</div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {AV_COLORS.map(a => (
                  <button key={a} onClick={() => setAv(a)}
                    style={{ width: 28, height: 28, background: a, border: av === a ? '2px solid #fff' : '2px solid transparent', borderRadius: 3, cursor: 'pointer', opacity: av === a ? 1 : 0.5, transition: 'opacity .1s' }} />
                ))}
              </div>
            </div>
          )}

          <div>
            <div style={{ fontSize: 11, color: C.sub, marginBottom: 6 }}>Usuário</div>
            <div style={{ position: 'relative' }}>
              <User size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: C.sub }} />
              <input value={name} onChange={e => { setName(e.target.value); setErr(''); }} placeholder="Seu nome" maxLength={20} style={inp}
                onFocus={e => (e.currentTarget.style.borderColor = `${C.accent}60`)}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(129,140,248,0.18)')} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: C.sub, marginBottom: 6 }}>Senha</div>
            <div style={{ position: 'relative' }}>
              <Lock size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: C.sub }} />
              <input type="password" value={pass} onChange={e => { setPass(e.target.value); setErr(''); }} placeholder="Mínimo 4 caracteres" style={inp}
                onFocus={e => (e.currentTarget.style.borderColor = `${C.accent}60`)}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(129,140,248,0.18)')}
                onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? doLogin() : doRegister())} />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <div style={{ fontSize: 11, color: C.sub, marginBottom: 6 }}>Confirmar senha</div>
              <div style={{ position: 'relative' }}>
                <Lock size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: C.sub }} />
                <input type="password" value={pass2} onChange={e => { setPass2(e.target.value); setErr(''); }} placeholder="Repita a senha" style={inp}
                  onFocus={e => (e.currentTarget.style.borderColor = `${C.accent}60`)}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(129,140,248,0.18)')}
                  onKeyDown={e => e.key === 'Enter' && doRegister()} />
              </div>
            </div>
          )}

          {err && (
            <div style={{ padding: '8px 10px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.22)', borderRadius: 3, fontSize: 12, color: C.red }}>
              {err}
            </div>
          )}

          <button onClick={mode === 'login' ? doLogin : doRegister} disabled={loading}
            style={{ padding: '11px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? C.muted : C.accent, color: '#fff', fontFamily: "'Press Start 2P',monospace", fontSize: 9, borderRadius: 3, opacity: loading ? 0.6 : 1 }}>
            {loading ? 'AGUARDE...' : mode === 'login' ? 'ENTRAR' : 'CRIAR CONTA'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── RANK ROW ───────────────────────────────────────────────── */
function RankRow({ rank, user, isMe }: { rank: number; user: any; isMe: boolean }) {
  const topColor = rank === 1 ? C.gold : rank === 2 ? '#94a3b8' : rank === 3 ? '#cd7c0f' : null;
  return (
    <div className="rank-r" style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px',
      background: isMe ? `${C.accent}0a` : 'transparent',
      borderLeft: topColor ? `2px solid ${topColor}` : '2px solid transparent',
    }}>
      <div style={{ width: 22, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
        {rank === 1 ? <Crown size={11} color={C.gold} /> :
         rank === 2 ? <Medal size={11} color="#94a3b8" /> :
         rank === 3 ? <Medal size={11} color="#cd7c0f" /> :
         <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: C.sub }}>#{rank}</span>}
      </div>
      <Avatar avatar={user.avatar} name={user.name} size={22} />
      <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: isMe ? C.accent : C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {user.name}{isMe ? ' ★' : ''}
      </span>
      <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: topColor ?? C.sub, flexShrink: 0 }}>
        {user.points >= 1000 ? `${(user.points / 1000).toFixed(1)}k` : user.points}
      </span>
    </div>
  );
}

/* ─── SHOP SIDEBAR ───────────────────────────────────────────── */
function ShopSidebar({ currentUser, onBuy, onEquip }: {
  currentUser: GameUser | null;
  onBuy: (id: string, cost: number) => boolean;
  onEquip: (id: string | null) => void;
}) {
  const [fb, setFb] = useState<{ msg: string; ok: boolean } | null>(null);
  const doFb = (msg: string, ok: boolean) => { setFb({ msg, ok }); setTimeout(() => setFb(null), 2500); };
  const buy    = (c: CosmeticDef) => { const ok = onBuy(c.id, c.cost); doFb(ok ? `${c.name} desbloqueado` : 'Moedas insuficientes', ok); };
  const equip  = (c: CosmeticDef) => { onEquip(c.id); doFb(`${c.name} equipado`, true); };
  const unequip = () => { onEquip(null); doFb('Tema padrão restaurado', true); };
  const owned  = (id: string) => currentUser?.purchasedCosmetics.includes(id) ?? false;

  if (!currentUser) {
    return (
      <div style={{ padding: '24px 14px', textAlign: 'center' }}>
        <ShoppingBag size={26} color={`${C.sub}50`} style={{ marginBottom: 12 }} />
        <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: C.sub, marginBottom: 10, lineHeight: 2 }}>FAÇA LOGIN</div>
        <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.65 }}>para acessar cosméticos e personalizar o Hub</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 11, color: C.sub }}>Saldo</span>
        <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 9, color: C.gold }}>
          {currentUser.coins.toLocaleString('pt-BR')} pts
        </span>
      </div>

      {fb && (
        <div style={{ margin: '10px 12px 0', padding: '7px 10px', borderRadius: 3, fontSize: 12, background: fb.ok ? 'rgba(74,222,128,0.07)' : 'rgba(248,113,113,0.07)', border: `1px solid ${fb.ok ? '#4ade8030' : '#f8717130'}`, color: fb.ok ? C.green : C.red }}>
          {fb.msg}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px' }}>
        {COSMETICS.map(c => {
          const isOwned  = owned(c.id);
          const isActive = currentUser.activeCosmeticId === c.id;
          const canBuy   = !isOwned && currentUser.coins >= c.cost;
          return (
            <div key={c.id} style={{ border: `1px solid ${isActive ? c.tagColor + '40' : C.border}`, borderRadius: 4, overflow: 'hidden', background: isActive ? `${c.tagColor}07` : 'transparent' }}>
              <div style={{ height: 34, background: c.previewGradient, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px' }}>
                <Palette size={13} color="rgba(255,255,255,0.45)" />
                {isActive && <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 5, color: '#fff', background: c.tagColor, padding: '2px 4px', borderRadius: 1 }}>ATIVO</span>}
                {isOwned && !isActive && <Check size={12} color={c.tagColor} />}
              </div>
              <div style={{ padding: '8px 10px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 2 }}>{c.name}</div>
                <div style={{ fontSize: 10, color: c.tagColor, marginBottom: 8 }}>{c.tag}</div>
                {!isOwned ? (
                  <button onClick={() => buy(c)} disabled={!canBuy}
                    style={{ width: '100%', padding: '6px', background: canBuy ? c.tagColor : 'transparent', border: `1px solid ${canBuy ? c.tagColor : C.muted}`, borderRadius: 2, color: canBuy ? '#fff' : C.sub, fontSize: 10, fontWeight: 600, cursor: canBuy ? 'pointer' : 'not-allowed' }}>
                    {c.cost} moedas
                  </button>
                ) : isActive ? (
                  <button onClick={unequip}
                    style={{ width: '100%', padding: '6px', background: 'transparent', border: `1px solid ${c.tagColor}40`, borderRadius: 2, color: c.tagColor, fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>
                    Retirar
                  </button>
                ) : (
                  <button onClick={() => equip(c)}
                    style={{ width: '100%', padding: '6px', background: `${c.tagColor}12`, border: `1px solid ${c.tagColor}35`, borderRadius: 2, color: c.tagColor, fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>
                    Equipar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── GAME CARD ──────────────────────────────────────────────── */
function GameCard({ title, subtitle, desc, tags, icon, color, onPlay }: {
  title: string; subtitle: string; desc: string; tags: string[];
  icon: React.ReactNode; color: string; onPlay: () => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      className="g-card"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onPlay}
      style={{
        background: C.card,
        border: `1px solid ${hov ? color + '45' : C.border}`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 4,
        cursor: 'pointer',
        boxShadow: hov ? `0 4px 22px rgba(0,0,0,0.45), 0 0 0 1px ${color}18` : '0 2px 8px rgba(0,0,0,0.3)',
      }}
    >
      <div style={{ padding: '14px 14px 12px' }}>
        <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ width: 42, height: 42, flexShrink: 0, background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 3, border: `1px solid ${color}1e` }}>
            {icon}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: color + 'b0', marginBottom: 5, letterSpacing: '0.05em' }}>{subtitle}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.text, lineHeight: 1.4 }}>{title}</div>
          </div>
        </div>

        <p style={{ fontSize: 11.5, color: C.sub, lineHeight: 1.6, margin: '0 0 10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>
          {desc}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {tags.slice(0, 2).map(t => (
              <span key={t} style={{ fontSize: 9, color: color + 'cc', background: `${color}0e`, padding: '2px 6px', borderRadius: 2, fontWeight: 600 }}>{t}</span>
            ))}
          </div>
          <button
            className="g-play"
            onClick={e => { e.stopPropagation(); onPlay(); }}
            style={{ flexShrink: 0, padding: '6px 12px', background: hov ? color : 'transparent', border: `1px solid ${color}55`, color: hov ? '#fff' : color, fontFamily: "'Press Start 2P',monospace", fontSize: 7, cursor: 'pointer', borderRadius: 2, boxShadow: hov ? `0 0 16px ${color}50` : 'none' }}>
            JOGAR
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN ───────────────────────────────────────────────────── */
interface GamesHubPageProps {
  onBackToHub: () => void; onOpenDetetive: () => void; onOpenCssBattle: () => void;
  onOpenFlexRocket: () => void; onOpenFlexTower: () => void; onOpenReactBugHunter: () => void;
  onOpenBlockCode: () => void; onOpenGodotArena: () => void; isDark?: boolean;
}

export default function GamesHubPage({
  onBackToHub, onOpenDetetive, onOpenCssBattle, onOpenFlexRocket, onOpenFlexTower,
  onOpenReactBugHunter, onOpenBlockCode, onOpenGodotArena, isDark = true,
}: GamesHubPageProps) {
  const { currentUser, leaderboard, users, login, registerUser, logout, buyCosmetic, equipCosmetic } = useGameState();
  const [showAuth, setShowAuth] = useState(false);
  const [search, setSearch] = useState('');

  const myRank = currentUser ? leaderboard.findIndex(u => u.id === currentUser.id) + 1 : 0;

  const bg    = isDark ? C.bg    : '#f0f4f8';
  const panel = isDark ? C.panel : '#ffffff';
  const brd   = isDark ? C.border : 'rgba(0,0,0,0.07)';
  const tx    = isDark ? C.text  : '#1e293b';

  const ALL_GAMES = [
    {
      id: 'detetive', title: 'DETETIVE DE CÓDIGO', subtitle: 'MODO SOLO',
      desc: 'Resolva casos de lógica, programação e matemática. Avance por níveis e conquiste o topo.',
      tags: ['Lógica', 'Algoritmos', '70+ casos'],
      icon: <Search size={20} color={C.purple} />, color: C.purple, onPlay: onOpenDetetive,
    },
    {
      id: 'cssbattle', title: 'CSS BATTLE', subtitle: 'SOLO & MULTIPLAYER',
      desc: 'Recrie layouts com CSS puro contra o relógio. Batalhas em tempo real contra outros jogadores.',
      tags: ['CSS', 'Multiplayer', '60+ desafios'],
      icon: <Swords size={20} color={C.red} />, color: C.red, onPlay: onOpenCssBattle,
    },
    {
      id: 'flexrocket', title: 'FOGUETES NA ÓRBITA', subtitle: 'TUTORIAL FLEXBOX',
      desc: 'Guie foguetes para estações espaciais aprendendo CSS Flexbox. 15 missões progressivas.',
      tags: ['Flexbox', 'CSS', '15 missões'],
      icon: (
        <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
          <path d="M13 2C13 2 18 6 18 13C18 17 16 20 13 22C10 20 8 17 8 13C8 6 13 2 13 2Z" fill={C.cyan} opacity="0.9"/>
          <rect x="11" y="12" width="4" height="8" rx="1" fill={C.cyan}/>
          <path d="M9 18L6 22L10 21Z" fill={C.gold}/>
          <path d="M17 18L20 22L16 21Z" fill={C.gold}/>
          <circle cx="13" cy="10" r="2" fill="#fff" opacity="0.7"/>
          <path d="M10 22L13 25L16 22" stroke={C.red} strokeWidth="1.5" fill="none"/>
        </svg>
      ),
      color: C.cyan, onPlay: onOpenFlexRocket,
    },
    {
      id: 'flextower', title: 'FLEX TOWER DEFENSE', subtitle: 'TOWER DEFENSE FLEXBOX',
      desc: 'Posicione torres usando CSS Flexbox para defender sua base de ondas de invasores.',
      tags: ['Flexbox', 'Tower Defense', '12 níveis'],
      icon: (
        <svg width="22" height="22" viewBox="0 0 58 62" fill="none">
          <rect x="10" y="44" width="38" height="16" rx="2" fill="#0d1a2b" stroke={C.green} strokeWidth="2"/>
          <rect x="16" y="22" width="26" height="26" rx="2" fill="#0d1a2b" stroke={C.green} strokeWidth="2"/>
          <rect x="26" y="4" width="6" height="22" rx="2" fill={C.green} opacity="0.9"/>
          <circle cx="20" cy="32" r="3" fill={C.green} opacity="0.6"/>
          <circle cx="38" cy="32" r="3" fill={C.green} opacity="0.6"/>
        </svg>
      ),
      color: C.green, onPlay: onOpenFlexTower,
    },
    {
      id: 'bughunter', title: 'REACT BUG HUNTER', subtitle: 'PRÁTICA REACT',
      desc: 'Encontre e corrija bugs reais em componentes React. Veja o resultado ao vivo enquanto resolve.',
      tags: ['React', 'Bugs', '20 desafios'],
      icon: <Bug size={20} color={C.blue} />, color: C.blue, onPlay: onOpenReactBugHunter,
    },
    {
      id: 'blockcode', title: 'BLOCOS DE CÓDIGO', subtitle: 'TURMAS CK',
      desc: 'Monte programas com blocos e guie o Steve pelo Minecraft! Lógica, loops e condicionais.',
      tags: ['Blocos', 'Lógica', 'CK'],
      icon: <Cpu size={20} color={C.lime} />, color: C.lime, onPlay: onOpenBlockCode,
    },
    {
      id: 'godot', title: 'GODOT ARENA', subtitle: 'QUIZ MULTIPLAYER — CT',
      desc: 'Quiz de GDScript em tempo real! Crie uma sala e desafie a turma. Solo ou em grupo.',
      tags: ['GDScript', 'Multiplayer', 'CT'],
      icon: (
        <svg width="22" height="22" viewBox="0 0 400 400" fill="none">
          <circle cx="200" cy="200" r="195" fill="#478cbf"/>
          <ellipse cx="200" cy="185" rx="80" ry="75" fill="white" opacity="0.97"/>
          <ellipse cx="200" cy="185" rx="55" ry="50" fill="#478cbf"/>
          <circle cx="175" cy="168" r="14" fill="white"/>
          <circle cx="225" cy="168" r="14" fill="white"/>
          <path d="M160 240 Q200 275 240 240 L245 265 Q200 305 155 265Z" fill="white" opacity="0.95"/>
        </svg>
      ),
      color: C.sky, onPlay: onOpenGodotArena,
    },
  ];

  const q = search.trim().toLowerCase();
  const filtered = q === ''
    ? ALL_GAMES
    : ALL_GAMES.filter(g =>
        g.title.toLowerCase().includes(q) ||
        g.tags.some(t => t.toLowerCase().includes(q))
      );

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: bg, color: tx, fontFamily: 'system-ui,-apple-system,sans-serif', overflow: 'hidden' }}>
      <style>{STYLES}</style>

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header style={{ height: 52, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: `1px solid ${brd}`, background: isDark ? `${panel}dd` : `${panel}ee`, backdropFilter: 'blur(8px)', zIndex: 20, gap: 16 }}>
        <button
          className="hdr-btn"
          onClick={onBackToHub}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: C.sub, fontSize: 12, fontWeight: 600, padding: '4px 0', flexShrink: 0 }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = C.accent}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = C.sub}>
          <ChevronLeft size={15} /> Voltar ao Hub
        </button>

        <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 9, color: C.accent, letterSpacing: '0.06em', flexShrink: 0 }}>
          ARENA DE DESAFIOS
        </span>

        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <Avatar avatar={currentUser.avatar} name={currentUser.name} size={26} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: tx }}>{currentUser.name}</div>
              <div style={{ fontSize: 10, color: C.sub }}>
                <span style={{ color: C.gold }}>{currentUser.points.toLocaleString('pt-BR')}</span> pts
                {myRank > 0 && <> · <span style={{ color: C.accent }}>#{myRank}</span></>}
              </div>
            </div>
            <button
              className="hdr-btn"
              onClick={logout}
              style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: `1px solid rgba(248,113,113,0.2)`, color: C.red, cursor: 'pointer', padding: '5px 10px', fontSize: 11, borderRadius: 3 }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.08)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}>
              <LogOut size={12} /> Sair
            </button>
          </div>
        ) : (
          <button
            className="hdr-btn"
            onClick={() => setShowAuth(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, background: `${C.accent}12`, border: `1px solid ${C.accent}38`, color: C.accent, cursor: 'pointer', padding: '7px 14px', fontSize: 12, fontWeight: 600, borderRadius: 3, flexShrink: 0 }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${C.accent}22`}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = `${C.accent}12`}>
            <LogIn size={14} /> Entrar / Criar conta
          </button>
        )}
      </header>

      {/* ── BODY ───────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* LEFT: RANKING */}
        <aside style={{ width: 216, flexShrink: 0, borderRight: `1px solid ${brd}`, overflowY: 'auto', animation: 'slideL .3s ease both' }}>
          <div style={{ padding: '12px 14px 10px', display: 'flex', alignItems: 'center', gap: 7, borderBottom: `1px solid ${brd}`, position: 'sticky', top: 0, background: bg, zIndex: 5 }}>
            <Trophy size={12} color={C.gold} />
            <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: C.gold }}>RANKING</span>
          </div>

          {leaderboard.length === 0 ? (
            <div style={{ padding: '28px 14px', textAlign: 'center' }}>
              <Trophy size={22} color={`${C.sub}35`} style={{ marginBottom: 10 }} />
              <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.6 }}>Sem jogadores ainda</div>
            </div>
          ) : (
            <>
              {leaderboard.slice(0, 20).map((u, i) => (
                <RankRow key={u.id} rank={i + 1} user={u} isMe={currentUser?.id === u.id} />
              ))}
              {currentUser && myRank > 20 && (
                <>
                  <div style={{ textAlign: 'center', padding: '2px', color: C.sub, fontSize: 11 }}>• • •</div>
                  <RankRow rank={myRank} user={currentUser} isMe={true} />
                </>
              )}
            </>
          )}

          {!currentUser && (
            <div style={{ margin: '12px', padding: '14px', background: `${C.accent}07`, border: `1px solid ${C.accent}18`, borderRadius: 4 }}>
              <div style={{ fontSize: 11, color: C.sub, marginBottom: 10, lineHeight: 1.6 }}>Entre no ranking e compita com outros jogadores</div>
              <button onClick={() => setShowAuth(true)}
                style={{ width: '100%', padding: '8px', background: C.accent, border: 'none', color: '#fff', fontFamily: "'Press Start 2P',monospace", fontSize: 6, cursor: 'pointer', borderRadius: 2 }}>
                CRIAR CONTA
              </button>
            </div>
          )}
        </aside>

        {/* CENTER: GAMES */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', animation: 'fadeIn .3s ease .05s both' }}>
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: C.sub, pointerEvents: 'none' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar jogo..."
              style={{ width: '100%', boxSizing: 'border-box', padding: '9px 36px 9px 34px', background: panel, border: `1px solid ${brd}`, color: tx, fontSize: 13, outline: 'none', borderRadius: 3 }}
              onFocus={e => (e.currentTarget.style.borderColor = `${C.accent}55`)}
              onBlur={e => (e.currentTarget.style.borderColor = brd)}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.sub, padding: 2, lineHeight: 0 }}>
                <X size={13} />
              </button>
            )}
          </div>

          {/* Info row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 11, color: C.sub }}>
              {filtered.length} {filtered.length === 1 ? 'jogo' : 'jogos'}{q ? ` para "${search}"` : ''}
            </span>
            <div style={{ display: 'flex', gap: 14 }}>
              {[
                { icon: <Users size={11} color={C.accent} />, val: leaderboard.length, label: 'jogadores' },
                { icon: <Shield size={11} color={C.purple} />, val: 7, label: 'jogos' },
                { icon: <Star size={11} color={C.gold} />, val: '70+', label: 'casos' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.sub }}>
                  {s.icon}
                  <span style={{ fontWeight: 700, color: tx }}>{s.val}</span>
                  {s.label}
                </div>
              ))}
            </div>
          </div>

          {/* Grid */}
          {filtered.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {filtered.map(g => (
                <GameCard key={g.id} title={g.title} subtitle={g.subtitle} desc={g.desc} tags={g.tags} icon={g.icon} color={g.color} onPlay={g.onPlay} />
              ))}
            </div>
          ) : (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <Search size={28} color={`${C.sub}35`} style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 13, color: C.sub }}>Nenhum jogo encontrado para "{search}"</div>
            </div>
          )}
        </main>

        {/* RIGHT: SHOP */}
        <aside style={{ width: 216, flexShrink: 0, borderLeft: `1px solid ${brd}`, overflowY: 'auto', animation: 'slideR .3s ease .1s both' }}>
          <div style={{ padding: '12px 14px 10px', display: 'flex', alignItems: 'center', gap: 7, borderBottom: `1px solid ${brd}`, position: 'sticky', top: 0, background: bg, zIndex: 5 }}>
            <ShoppingBag size={12} color={C.gold} />
            <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: C.gold }}>LOJA</span>
          </div>
          <ShopSidebar currentUser={currentUser} onBuy={buyCosmetic} onEquip={equipCosmetic} />
        </aside>
      </div>

      {showAuth && (
        <AuthModal users={users} onLogin={login} onRegister={registerUser} onClose={() => setShowAuth(false)} />
      )}
    </div>
  );
}
