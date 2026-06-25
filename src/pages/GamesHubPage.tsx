import React, { useState } from 'react';
import {
  Trophy, Swords, Search, LogIn, UserPlus, LogOut,
  Crown, Medal, Lock, User, Zap, ChevronLeft, Star, Users, Shield, X,
} from 'lucide-react';
import { useGameState, LoginResult } from '../hooks/useGameState';

/* ═══════════════════════════════════════════════════════════
   KEYFRAMES
═══════════════════════════════════════════════════════════ */
const ANIM = `
  @keyframes hubScanline {
    from { top: -3px; }
    to   { top: 100%; }
  }
  @keyframes hubFlicker {
    0%,18%,20%,22%,52%,54%,100% {
      opacity:1;
      text-shadow:0 0 8px #00ffcc,0 0 18px #00ffcc,0 0 36px #00ffcc,0 0 60px #00ffcc44;
    }
    19%,21%,53% { opacity:0.55; text-shadow:none; }
  }
  @keyframes hubCoin {
    0%,49% { opacity:1; }
    50%,99%{ opacity:0; }
  }
  @keyframes hubFloat {
    0%   { transform:translateY(0)   scale(1);   opacity:0.9; }
    100% { transform:translateY(-100px) scale(0); opacity:0; }
  }
  @keyframes hubCardPulse {
    0%,100% { opacity:.55; }
    50%     { opacity:1; }
  }
  @keyframes hubSlideIn {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes hubRankRow {
    from { opacity:0; transform:translateX(-14px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes hubBorderRotate {
    from { --angle:0deg; }
    to   { --angle:360deg; }
  }
  @keyframes hubGlowPulse {
    0%,100% { box-shadow: 0 0 12px var(--gc), 0 6px 40px rgba(0,0,0,0.6); }
    50%     { box-shadow: 0 0 28px var(--gc), 0 0 55px var(--gc2,transparent), 0 6px 40px rgba(0,0,0,0.6); }
  }
  @keyframes hubPlayBtn {
    0%,100% { letter-spacing:0.12em; }
    50%     { letter-spacing:0.22em; }
  }
`;

/* ═══════════════════════════════════════════════════════════
   STATIC PARTICLES (deterministic, no re-randomize)
═══════════════════════════════════════════════════════════ */
const PTCL = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  left: `${(i * 19 + 5) % 97 + 2}%`,
  sz: (i % 3) + 2,
  dur: 5 + (i % 6),
  delay: -((i * 1.3) % 9),
  color: ['#00ffcc', '#a78bfa', '#f87171', '#fbbf24', '#60a5fa'][i % 5],
}));

const AVATARS = ['🕵', '🔍', '🧠', '🤖', '💻', '🎯', '⚡', '🦊', '🐉', '🚀', '🎲', '🦁'];

/* ═══════════════════════════════════════════════════════════
   AUTH MODAL
═══════════════════════════════════════════════════════════ */
function AuthModal({ users, onLogin, onRegister, onClose }: {
  users: any[];
  onLogin: (n: string, p: string) => Promise<LoginResult>;
  onRegister: (n: string, av: string, p: string) => Promise<string>;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<'login' | 'register'>(users.length > 0 ? 'login' : 'register');
  const [name, setName]   = useState('');
  const [pass, setPass]   = useState('');
  const [pass2, setPass2] = useState('');
  const [av, setAv]       = useState(AVATARS[0]);
  const [err, setErr]     = useState('');
  const [loading, setLoading] = useState(false);

  const inp: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    padding: '9px 12px 9px 34px',
    background: '#060a14', border: '1.5px solid rgba(0,255,204,0.22)',
    color: '#e2e8f0', fontSize: 13, fontFamily: 'inherit', outline: 'none',
    borderRadius: 4, transition: 'border-color .15s',
  };

  const doLogin = async () => {
    if (!name.trim() || !pass) { setErr('Preencha usuário e senha.'); return; }
    setLoading(true); setErr('');
    const r = await onLogin(name.trim(), pass);
    setLoading(false);
    if (r === 'not-found')      { setErr('Usuário não encontrado.'); return; }
    if (r === 'wrong-password') { setErr('Senha incorreta.'); return; }
    onClose();
  };

  const doRegister = async () => {
    if (name.trim().length < 3) { setErr('Mínimo 3 caracteres.'); return; }
    if (pass.length < 4)        { setErr('Senha com 4+ caracteres.'); return; }
    if (pass !== pass2)         { setErr('Senhas não coincidem.'); return; }
    if (users.some((u: any) => u.name.toLowerCase() === name.trim().toLowerCase())) {
      setErr('Nome já em uso.'); return;
    }
    setLoading(true); setErr('');
    await onRegister(name.trim(), av, pass);
    setLoading(false);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 80,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(6px)',
    }}>
      <div style={{
        width: '100%', maxWidth: 400, background: '#0a0e1a',
        border: '2px solid rgba(0,255,204,0.4)',
        boxShadow: '0 0 40px rgba(0,255,204,0.2), 6px 6px 0 rgba(0,255,204,0.12)',
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(0,255,204,0.06)', borderBottom: '1.5px solid rgba(0,255,204,0.15)',
        }}>
          <div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#00ffcc', marginBottom: 6 }}>
              ARENA DE DESAFIOS
            </div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: '#e2e8f0' }}>
              {mode === 'login' ? 'IDENTIFICAÇÃO' : 'CRIAR CONTA'}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}>
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        {users.length > 0 && (
          <div style={{ display: 'flex', borderBottom: '1.5px solid rgba(0,255,204,0.1)' }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setErr(''); }}
                style={{
                  flex: 1, padding: '10px', border: 'none', cursor: 'pointer',
                  background: mode === m ? 'rgba(0,255,204,0.08)' : 'transparent',
                  borderBottom: mode === m ? '2px solid #00ffcc' : '2px solid transparent',
                  fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                  color: mode === m ? '#00ffcc' : '#475569',
                }}>
                {m === 'login' ? 'ENTRAR' : 'CADASTRAR'}
              </button>
            ))}
          </div>
        )}

        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 13 }}>
          {/* Avatar */}
          {mode === 'register' && (
            <div>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#475569', marginBottom: 8 }}>
                AVATAR
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 5 }}>
                {AVATARS.map(a => (
                  <button key={a} onClick={() => setAv(a)}
                    style={{
                      height: 36, fontSize: 18,
                      background: av === a ? 'rgba(0,255,204,0.12)' : 'rgba(255,255,255,0.03)',
                      border: `1.5px solid ${av === a ? '#00ffcc' : 'rgba(255,255,255,0.08)'}`,
                      cursor: 'pointer', borderRadius: 4,
                      transform: av === a ? 'translateY(-2px)' : 'none',
                      transition: 'all .1s',
                    }}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Usuário */}
          <div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#475569', marginBottom: 7 }}>USUÁRIO</div>
            <div style={{ position: 'relative' }}>
              <User size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
              <input value={name} onChange={e => { setName(e.target.value); setErr(''); }}
                placeholder="Seu nome de usuário" maxLength={20} style={inp}
                onFocus={e => (e.currentTarget.style.borderColor = '#00ffcc')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(0,255,204,0.22)')} />
            </div>
          </div>

          {/* Senha */}
          <div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#475569', marginBottom: 7 }}>SENHA</div>
            <div style={{ position: 'relative' }}>
              <Lock size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
              <input type="password" value={pass} onChange={e => { setPass(e.target.value); setErr(''); }}
                placeholder="Mínimo 4 caracteres" style={inp}
                onFocus={e => (e.currentTarget.style.borderColor = '#00ffcc')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(0,255,204,0.22)')}
                onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? doLogin() : doRegister())} />
            </div>
          </div>

          {/* Confirmar senha */}
          {mode === 'register' && (
            <div>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#475569', marginBottom: 7 }}>CONFIRMAR</div>
              <div style={{ position: 'relative' }}>
                <Lock size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                <input type="password" value={pass2} onChange={e => { setPass2(e.target.value); setErr(''); }}
                  placeholder="Repita a senha" style={inp}
                  onFocus={e => (e.currentTarget.style.borderColor = '#00ffcc')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(0,255,204,0.22)')}
                  onKeyDown={e => e.key === 'Enter' && doRegister()} />
              </div>
            </div>
          )}

          {err && (
            <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.12)', border: '1.5px solid #ef4444', fontSize: 12, color: '#ef4444', borderRadius: 4 }}>
              {err}
            </div>
          )}

          <button
            onClick={mode === 'login' ? doLogin : doRegister}
            disabled={loading}
            style={{
              padding: '12px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? '#1e2a3a' : 'linear-gradient(135deg,#00ffcc,#00ccaa)',
              color: '#060a14', fontFamily: "'Press Start 2P', monospace", fontSize: 10,
              fontWeight: 900, opacity: loading ? 0.7 : 1,
              boxShadow: loading ? 'none' : '0 0 20px rgba(0,255,204,0.4), 4px 4px 0 rgba(0,255,204,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'all .15s',
            }}>
            {loading ? 'AGUARDE...' : mode === 'login'
              ? <><LogIn size={14} /> ENTRAR</>
              : <><UserPlus size={14} /> CRIAR CONTA</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   GAME CARD
═══════════════════════════════════════════════════════════ */
function GameCard({ title, subtitle, desc, tags, icon, glowColor, glowColor2, accentText, onPlay }: {
  title: string; subtitle: string; desc: string;
  tags: string[]; icon: React.ReactNode;
  glowColor: string; glowColor2: string; accentText: string;
  onPlay: () => void;
}) {
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: '1 1 260px', minWidth: 240, maxWidth: 400,
        background: '#0a0e1a',
        border: `2px solid ${hov ? glowColor : glowColor + '55'}`,
        cursor: 'pointer',
        position: 'relative', overflow: 'hidden',
        transform: hov ? 'translateY(-6px) scale(1.01)' : 'none',
        transition: 'all .22s cubic-bezier(0.4,0,0.2,1)',
        '--gc': glowColor + '55',
        '--gc2': glowColor2 + '33',
        animation: `hubGlowPulse 3s ease-in-out infinite`,
      } as React.CSSProperties}
      onClick={onPlay}
    >
      {/* Top accent line */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${glowColor}, ${glowColor2})` }} />

      {/* Background grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(${glowColor}08 1px, transparent 1px),
          linear-gradient(90deg, ${glowColor}08 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
      }} />

      {/* Scanline hover effect */}
      {hov && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `linear-gradient(180deg, transparent 0%, ${glowColor}06 50%, transparent 100%)`,
          animation: 'hubScanline 1.2s linear infinite',
        }} />
      )}

      <div style={{ padding: '22px 20px', position: 'relative', zIndex: 1 }}>
        {/* Icon + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{
            width: 52, height: 52, flexShrink: 0,
            background: `linear-gradient(135deg, ${glowColor}22, ${glowColor2}11)`,
            border: `2px solid ${glowColor}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: hov ? `0 0 18px ${glowColor}55` : `0 0 8px ${glowColor}22`,
            transition: 'box-shadow .22s',
          }}>
            {icon}
          </div>
          <div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: accentText, marginBottom: 5, letterSpacing: '0.1em' }}>
              {subtitle}
            </div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: '#e2e8f0', lineHeight: 1.6 }}>
              {title}
            </div>
          </div>
        </div>

        {/* Description */}
        <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.65, marginBottom: 16, marginTop: 0 }}>
          {desc}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
          {tags.map(t => (
            <span key={t} style={{
              padding: '3px 8px', fontSize: 10, fontWeight: 700,
              background: `${glowColor}15`, color: accentText,
              border: `1px solid ${glowColor}33`, borderRadius: 3,
            }}>
              {t}
            </span>
          ))}
        </div>

        {/* Play button */}
        <button
          style={{
            width: '100%', padding: '13px',
            background: hov
              ? `linear-gradient(135deg, ${glowColor}, ${glowColor2})`
              : `linear-gradient(135deg, ${glowColor}22, ${glowColor2}11)`,
            border: `2px solid ${glowColor}`,
            color: hov ? '#060a14' : glowColor,
            fontFamily: "'Press Start 2P', monospace", fontSize: 11,
            cursor: 'pointer', letterSpacing: '0.12em',
            boxShadow: hov ? `0 0 24px ${glowColor}66, 4px 4px 0 ${glowColor}33` : 'none',
            transition: 'all .22s',
            animation: hov ? 'hubPlayBtn 1.2s ease-in-out infinite' : 'none',
          }}
          onClick={e => { e.stopPropagation(); onPlay(); }}
        >
          &gt;&gt; JOGAR
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   RANKING ROW
═══════════════════════════════════════════════════════════ */
function RankRow({ rank, user, isMe }: { rank: number; user: any; isMe: boolean }) {
  const medal =
    rank === 1 ? <Crown size={13} color="#fbbf24" /> :
    rank === 2 ? <Medal size={13} color="#94a3b8" /> :
    rank === 3 ? <Medal size={13} color="#cd7c0f" /> :
    <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#334155', minWidth: 18, textAlign: 'center' }}>
      #{rank}
    </span>;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '9px 14px',
      background: isMe ? 'rgba(0,255,204,0.07)' : rank % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
      border: isMe ? '1px solid rgba(0,255,204,0.25)' : '1px solid transparent',
      borderRadius: 6,
      animation: `hubRankRow .35s ease ${rank * 0.05}s both`,
    }}>
      <div style={{ width: 22, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
        {medal}
      </div>
      <span style={{ fontSize: 18, flexShrink: 0 }}>{user.avatar}</span>
      <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: isMe ? '#00ffcc' : '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {user.name}{isMe ? ' (você)' : ''}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: rank <= 3 ? '#fbbf24' : '#475569' }}>
          {user.points.toLocaleString('pt-BR')}
        </span>
        <span style={{ fontSize: 10, color: '#334155' }}>pts</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
interface GamesHubPageProps {
  onBackToHub: () => void;
  onOpenDetetive: () => void;
  onOpenCssBattle: () => void;
  onOpenFlexRocket: () => void;
}

export default function GamesHubPage({ onBackToHub, onOpenDetetive, onOpenCssBattle, onOpenFlexRocket }: GamesHubPageProps) {
  const { currentUser, leaderboard, users, login, registerUser, logout } = useGameState();
  const [showAuth, setShowAuth] = useState(false);

  const myRank = currentUser
    ? leaderboard.findIndex(u => u.id === currentUser.id) + 1
    : 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#060a14',
      backgroundImage: `
        linear-gradient(rgba(0,255,204,0.035) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,255,204,0.035) 1px, transparent 1px)
      `,
      backgroundSize: '44px 44px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#e2e8f0',
    }}>
      <style>{ANIM}</style>

      {/* ── Scanline animada ── */}
      <div style={{
        position: 'fixed', left: 0, right: 0, height: 2, zIndex: 5, pointerEvents: 'none',
        background: 'linear-gradient(90deg, transparent, rgba(0,255,204,0.18), transparent)',
        animation: 'hubScanline 6s linear infinite',
      }} />

      {/* ── Partículas flutuantes ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
        {PTCL.map(p => (
          <div key={p.id} style={{
            position: 'absolute', left: p.left, bottom: '5%',
            width: p.sz, height: p.sz, borderRadius: '50%',
            background: p.color, boxShadow: `0 0 ${p.sz * 3}px ${p.color}`,
            animation: `hubFloat ${p.dur}s linear ${p.delay}s infinite`,
          }} />
        ))}
      </div>

      {/* ── Vignette nas bordas ── */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 3,
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)',
      }} />

      <div style={{ position: 'relative', zIndex: 10, maxWidth: 960, margin: '0 auto', padding: '0 20px 60px' }}>

        {/* ════ TOP BAR ════ */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 0', borderBottom: '1px solid rgba(0,255,204,0.1)',
          marginBottom: 40, flexWrap: 'wrap', gap: 12,
        }}>
          <button
            onClick={onBackToHub}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'none', border: '1.5px solid rgba(0,255,204,0.25)',
              color: '#64748b', cursor: 'pointer', padding: '8px 16px',
              fontFamily: "'Press Start 2P', monospace", fontSize: 8,
              borderRadius: 4, transition: 'all .15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#00ffcc'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,255,204,0.6)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#64748b'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,255,204,0.25)'; }}
          >
            <ChevronLeft size={14} /> VOLTAR AO HUB
          </button>

          {/* Auth bar */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '7px 14px', background: 'rgba(0,255,204,0.07)',
                border: '1.5px solid rgba(0,255,204,0.2)', borderRadius: 6,
              }}>
                <span style={{ fontSize: 22 }}>{currentUser.avatar}</span>
                <div>
                  <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#00ffcc' }}>
                    {currentUser.name}
                  </div>
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 3 }}>
                    <span style={{ color: '#fbbf24', fontWeight: 700 }}>{currentUser.points.toLocaleString('pt-BR')}</span> pts
                    &nbsp;·&nbsp;
                    <span style={{ color: '#a78bfa', fontWeight: 700 }}>{currentUser.coins.toLocaleString('pt-BR')}</span> moedas
                    {myRank > 0 && (
                      <>&nbsp;·&nbsp;<span style={{ color: '#00ffcc', fontWeight: 700 }}>#{myRank}</span> rank</>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={logout}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'none', border: '1.5px solid rgba(239,68,68,0.3)',
                  color: '#ef4444', cursor: 'pointer', padding: '8px 12px',
                  fontSize: 11, borderRadius: 4, transition: 'all .15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
              >
                <LogOut size={13} /> Sair
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(0,255,204,0.1)', border: '1.5px solid rgba(0,255,204,0.4)',
                color: '#00ffcc', cursor: 'pointer', padding: '9px 18px',
                fontFamily: "'Press Start 2P', monospace", fontSize: 9, borderRadius: 4,
                boxShadow: '0 0 14px rgba(0,255,204,0.2)', transition: 'all .15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 28px rgba(0,255,204,0.4)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 14px rgba(0,255,204,0.2)'; }}
            >
              <LogIn size={14} /> ENTRAR / CRIAR CONTA
            </button>
          )}
        </div>

        {/* ════ HERO TITLE ════ */}
        <div style={{ textAlign: 'center', marginBottom: 52, animation: 'hubSlideIn .6s ease both' }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#334155', letterSpacing: '0.25em', marginBottom: 14 }}>
            CTRL + PLAY PRESENTS
          </div>
          <h1 style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 'clamp(20px, 4vw, 34px)',
            color: '#00ffcc', margin: '0 0 14px',
            animation: 'hubFlicker 8s ease-in-out infinite',
            lineHeight: 1.4,
          }}>
            ARENA DE<br />DESAFIOS
          </h1>
          <div style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 11,
            color: '#a78bfa', animation: 'hubCoin 1.1s step-end infinite',
            letterSpacing: '0.15em',
          }}>
            *** INSERT COIN ***
          </div>
        </div>

        {/* ════ GAME CARDS ════ */}
        <div style={{
          display: 'flex', gap: 24, justifyContent: 'center',
          flexWrap: 'wrap', marginBottom: 52,
          animation: 'hubSlideIn .7s ease .1s both',
        }}>
          <GameCard
            title="DETETIVE DE CÓDIGO"
            subtitle="MODO SOLO"
            desc="Resolva casos de lógica, programação e matemática. Avance por níveis e conquiste o topo do ranking."
            tags={['Lógica', 'Algoritmos', 'Sequências', '70+ casos']}
            icon={<Search size={26} color="#a78bfa" />}
            glowColor="#a78bfa"
            glowColor2="#7c3aed"
            accentText="#a78bfa"
            onPlay={onOpenDetetive}
          />
          <GameCard
            title="CSS BATTLE"
            subtitle="SOLO & MULTIPLAYER"
            desc="Recrie layouts com CSS puro contra o relógio. Enfrente outros jogadores em batalhas de código em tempo real."
            tags={['CSS', 'Multiplayer', 'Solo', '60+ desafios']}
            icon={<Swords size={26} color="#f87171" />}
            glowColor="#f87171"
            glowColor2="#ef4444"
            accentText="#f87171"
            onPlay={onOpenCssBattle}
          />
          <GameCard
            title="FOGUETES NA ÓRBITA"
            subtitle="TUTORIAL FLEXBOX"
            desc="Aprenda CSS Flexbox guiando foguetes para estações espaciais. 15 missões progressivas do básico ao avançado."
            tags={['Flexbox', 'CSS', 'Solo', '15 missões']}
            icon={<span style={{ fontSize: 26 }}>🚀</span>}
            glowColor="#00ffcc"
            glowColor2="#00ccaa"
            accentText="#00ffcc"
            onPlay={onOpenFlexRocket}
          />
        </div>

        {/* ════ STATS BAR ════ */}
        <div style={{
          display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap',
          marginBottom: 44, animation: 'hubSlideIn .7s ease .15s both',
        }}>
          {[
            { icon: <Users size={15} color="#00ffcc" />, label: 'Jogadores', val: leaderboard.length },
            { icon: <Star size={15} color="#fbbf24" />, label: 'Casos disponíveis', val: '70+' },
            { icon: <Zap size={15} color="#f87171" />, label: 'Desafios CSS', val: '60+' },
            { icon: <Shield size={15} color="#a78bfa" />, label: 'Níveis de dificuldade', val: 4 },
          ].map(s => (
            <div key={s.label} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 18px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 8, flexShrink: 0,
            }}>
              {s.icon}
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: '#e2e8f0' }}>{s.val}</span>
              <span style={{ fontSize: 11, color: '#334155' }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* ════ LEADERBOARD ════ */}
        <div style={{ animation: 'hubSlideIn .7s ease .2s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Trophy size={20} color="#fbbf24" />
            <h2 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 12, color: '#fbbf24', margin: 0 }}>
              RANKING GLOBAL
            </h2>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(251,191,36,0.3), transparent)' }} />
          </div>

          {leaderboard.length === 0 ? (
            <div style={{
              padding: '32px', textAlign: 'center',
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 8,
            }}>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#334155', marginBottom: 10 }}>
                SEM JOGADORES AINDA
              </div>
              <div style={{ fontSize: 13, color: '#334155' }}>
                Seja o primeiro a criar uma conta e entrar no ranking!
              </div>
            </div>
          ) : (
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 8, overflow: 'hidden',
            }}>
              {/* Cabeçalho */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                background: 'rgba(251,191,36,0.06)', borderBottom: '1px solid rgba(251,191,36,0.12)',
              }}>
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: '#475569', flex: 1 }}>
                  # &nbsp; JOGADOR
                </span>
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: '#475569' }}>
                  PONTOS
                </span>
              </div>

              <div style={{ padding: '8px 4px', maxHeight: 360, overflowY: 'auto' }}>
                {leaderboard.slice(0, 15).map((u, i) => (
                  <RankRow
                    key={u.id}
                    rank={i + 1}
                    user={u}
                    isMe={currentUser?.id === u.id}
                  />
                ))}
                {currentUser && myRank > 15 && (
                  <>
                    <div style={{ textAlign: 'center', padding: '6px', color: '#334155', fontSize: 11 }}>• • •</div>
                    <RankRow rank={myRank} user={currentUser} isMe={true} />
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ════ CTA LOGIN (se não logado) ════ */}
        {!currentUser && (
          <div style={{
            marginTop: 36, padding: '24px 28px',
            background: 'rgba(0,255,204,0.04)',
            border: '2px solid rgba(0,255,204,0.2)',
            borderRadius: 10, textAlign: 'center',
            animation: 'hubSlideIn .7s ease .3s both',
          }}>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: '#00ffcc', marginBottom: 10 }}>
              SALVE SEU PROGRESSO
            </div>
            <p style={{ fontSize: 13, color: '#475569', marginBottom: 20, lineHeight: 1.7 }}>
              Crie uma conta para guardar sua pontuação, aparecer no ranking e acumular moedas para usar nas dicas.
            </p>
            <button
              onClick={() => setShowAuth(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '12px 28px',
                background: 'linear-gradient(135deg, #00ffcc, #00ccaa)',
                border: 'none', color: '#060a14',
                fontFamily: "'Press Start 2P', monospace", fontSize: 10,
                cursor: 'pointer', fontWeight: 900,
                boxShadow: '0 0 24px rgba(0,255,204,0.4), 4px 4px 0 rgba(0,255,204,0.2)',
              }}
            >
              <UserPlus size={16} /> CRIAR CONTA GRÁTIS
            </button>
          </div>
        )}
      </div>

      {/* Auth modal */}
      {showAuth && (
        <AuthModal
          users={users}
          onLogin={login}
          onRegister={registerUser}
          onClose={() => setShowAuth(false)}
        />
      )}
    </div>
  );
}
