import React, { useState } from 'react';
import {
  Trophy, Swords, Search, LogIn, UserPlus, LogOut,
  Crown, Medal, Lock, User, Zap, ChevronLeft, Star, Users, Shield, X, Bug, Cpu, Gamepad2,
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

const AVATAR_COLORS = ['#ef4444','#f97316','#f59e0b','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#ec4899','#14b8a6','#6366f1','#84cc16','#dc2626'];

function stringToColor(str: string): string {
  const colors = ['#ef4444','#3b82f6','#22c55e','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#f97316'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = hash * 31 + str.charCodeAt(i);
  return colors[Math.abs(hash) % colors.length];
}

function AvatarDisplay({ avatar, name, size = 28 }: { avatar: string; name: string; size?: number }) {
  const isColor = avatar?.startsWith('#');
  const color = isColor ? avatar : stringToColor(name);
  return (
    <div style={{
      width: size, height: size, background: color, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: '2px solid rgba(255,255,255,0.2)',
    }}>
      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: size * 0.35, color: '#fff', lineHeight: 1 }}>
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   AUTH MODAL
═══════════════════════════════════════════════════════════ */
function AuthModal({ users, onLogin, onRegister, onClose, isDark }: {
  users: any[];
  onLogin: (n: string, p: string) => Promise<LoginResult>;
  onRegister: (n: string, av: string, p: string) => Promise<string>;
  onClose: () => void;
  isDark: boolean;
}) {
  const [mode, setMode] = useState<'login' | 'register'>(users.length > 0 ? 'login' : 'register');
  const [name, setName]   = useState('');
  const [pass, setPass]   = useState('');
  const [pass2, setPass2] = useState('');
  const [av, setAv]       = useState(AVATAR_COLORS[0]);
  const [err, setErr]     = useState('');
  const [loading, setLoading] = useState(false);

  const modalAccent = isDark ? '#00ffcc' : '#0d9488';
  const modalBg     = isDark ? '#0a0e1a' : '#ffffff';
  const modalText   = isDark ? '#e2e8f0' : '#1e293b';
  const modalSub    = isDark ? '#475569' : '#64748b';
  const modalInpBg  = isDark ? '#060a14' : '#f8fafc';
  const modalInpBd  = isDark ? 'rgba(0,255,204,0.22)' : 'rgba(0,0,0,0.18)';
  const modalAvatBg = isDark ? 'rgba(255,255,255,0.03)' : '#f1f5f9';
  const modalAvatBd = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)';

  const inp: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    padding: '9px 12px 9px 34px',
    background: modalInpBg, border: `1.5px solid ${modalInpBd}`,
    color: modalText, fontSize: 13, fontFamily: 'inherit', outline: 'none',
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
        width: '100%', maxWidth: 400, background: modalBg,
        border: `2px solid ${isDark ? 'rgba(0,255,204,0.4)' : 'rgba(13,148,136,0.35)'}`,
        boxShadow: isDark
          ? '0 0 40px rgba(0,255,204,0.2), 6px 6px 0 rgba(0,255,204,0.12)'
          : '0 8px 40px rgba(0,0,0,0.15)',
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: isDark ? 'rgba(0,255,204,0.06)' : 'rgba(13,148,136,0.07)',
          borderBottom: `1.5px solid ${isDark ? 'rgba(0,255,204,0.15)' : 'rgba(13,148,136,0.2)'}`,
        }}>
          <div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: modalAccent, marginBottom: 6 }}>
              ARENA DE DESAFIOS
            </div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: modalText }}>
              {mode === 'login' ? 'IDENTIFICAÇÃO' : 'CRIAR CONTA'}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: modalSub }}>
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        {users.length > 0 && (
          <div style={{ display: 'flex', borderBottom: `1.5px solid ${isDark ? 'rgba(0,255,204,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setErr(''); }}
                style={{
                  flex: 1, padding: '10px', border: 'none', cursor: 'pointer',
                  background: mode === m ? (isDark ? 'rgba(0,255,204,0.08)' : 'rgba(13,148,136,0.07)') : 'transparent',
                  borderBottom: mode === m ? `2px solid ${modalAccent}` : '2px solid transparent',
                  fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                  color: mode === m ? modalAccent : modalSub,
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
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: modalSub, marginBottom: 8 }}>
                AVATAR
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 5 }}>
                {AVATAR_COLORS.map(a => (
                  <button key={a} onClick={() => setAv(a)}
                    style={{
                      height: 36,
                      background: av === a ? (isDark ? 'rgba(0,255,204,0.12)' : 'rgba(13,148,136,0.12)') : modalAvatBg,
                      border: `1.5px solid ${av === a ? modalAccent : modalAvatBd}`,
                      cursor: 'pointer', borderRadius: 4,
                      transform: av === a ? 'translateY(-2px)' : 'none',
                      transition: 'all .1s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                    <div style={{ width: 22, height: 22, background: a, border: '2px solid rgba(255,255,255,0.3)' }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Usuário */}
          <div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: modalSub, marginBottom: 7 }}>USUÁRIO</div>
            <div style={{ position: 'relative' }}>
              <User size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: modalSub }} />
              <input value={name} onChange={e => { setName(e.target.value); setErr(''); }}
                placeholder="Seu nome de usuário" maxLength={20} style={inp}
                onFocus={e => (e.currentTarget.style.borderColor = modalAccent)}
                onBlur={e => (e.currentTarget.style.borderColor = modalInpBd)} />
            </div>
          </div>

          {/* Senha */}
          <div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: modalSub, marginBottom: 7 }}>SENHA</div>
            <div style={{ position: 'relative' }}>
              <Lock size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: modalSub }} />
              <input type="password" value={pass} onChange={e => { setPass(e.target.value); setErr(''); }}
                placeholder="Mínimo 4 caracteres" style={inp}
                onFocus={e => (e.currentTarget.style.borderColor = modalAccent)}
                onBlur={e => (e.currentTarget.style.borderColor = modalInpBd)}
                onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? doLogin() : doRegister())} />
            </div>
          </div>

          {/* Confirmar senha */}
          {mode === 'register' && (
            <div>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: modalSub, marginBottom: 7 }}>CONFIRMAR</div>
              <div style={{ position: 'relative' }}>
                <Lock size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: modalSub }} />
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
              background: loading ? (isDark ? '#1e2a3a' : '#e2e8f0') : `linear-gradient(135deg,${modalAccent},${isDark ? '#00ccaa' : '#0f766e'})`,
              color: isDark ? '#060a14' : '#ffffff', fontFamily: "'Press Start 2P', monospace", fontSize: 10,
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
function GameCard({ title, subtitle, desc, tags, icon, glowColor, glowColor2, accentText, onPlay, isDark }: {
  title: string; subtitle: string; desc: string;
  tags: string[]; icon: React.ReactNode;
  glowColor: string; glowColor2: string; accentText: string;
  onPlay: () => void; isDark: boolean;
}) {
  const [hov, setHov] = useState(false);
  const cardBg   = isDark ? '#0a0e1a' : '#ffffff';
  const titleClr = isDark ? '#e2e8f0' : '#1e293b';
  const descClr  = isDark ? '#64748b' : '#475569';

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: '1 1 260px', minWidth: 240, maxWidth: 400,
        background: cardBg,
        border: `2px solid ${hov ? glowColor : glowColor + '55'}`,
        cursor: 'pointer',
        position: 'relative', overflow: 'hidden',
        transform: hov ? 'translateY(-6px) scale(1.01)' : 'none',
        transition: 'all .22s cubic-bezier(0.4,0,0.2,1)',
        '--gc': glowColor + '55',
        '--gc2': glowColor2 + '33',
        animation: isDark ? `hubGlowPulse 3s ease-in-out infinite` : 'none',
        boxShadow: !isDark ? (hov ? `0 4px 20px rgba(0,0,0,0.12)` : `0 2px 8px rgba(0,0,0,0.08)`) : undefined,
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
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: titleClr, lineHeight: 1.6 }}>
              {title}
            </div>
          </div>
        </div>

        {/* Description */}
        <p style={{ fontSize: 13, color: descClr, lineHeight: 1.65, marginBottom: 16, marginTop: 0 }}>
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
function RankRow({ rank, user, isMe, isDark }: { rank: number; user: any; isMe: boolean; isDark: boolean }) {
  const nameclr  = isDark ? '#cbd5e1' : '#1e293b';
  const rankclr  = isDark ? '#334155' : '#64748b';
  const ptsclr   = isDark ? '#475569' : '#64748b';
  const evenBg   = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)';

  const medal =
    rank === 1 ? <Crown size={13} color="#fbbf24" /> :
    rank === 2 ? <Medal size={13} color="#94a3b8" /> :
    rank === 3 ? <Medal size={13} color="#cd7c0f" /> :
    <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: rankclr, minWidth: 18, textAlign: 'center' }}>
      #{rank}
    </span>;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '9px 14px',
      background: isMe ? (isDark ? 'rgba(0,255,204,0.07)' : 'rgba(13,148,136,0.07)') : rank % 2 === 0 ? evenBg : 'transparent',
      border: isMe ? `1px solid ${isDark ? 'rgba(0,255,204,0.25)' : 'rgba(13,148,136,0.3)'}` : '1px solid transparent',
      borderRadius: 6,
      animation: `hubRankRow .35s ease ${rank * 0.05}s both`,
    }}>
      <div style={{ width: 22, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
        {medal}
      </div>
      <AvatarDisplay avatar={user.avatar} name={user.name} size={28} />
      <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: isMe ? '#00ffcc' : nameclr, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {user.name}{isMe ? ' (você)' : ''}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: rank <= 3 ? '#fbbf24' : ptsclr }}>
          {user.points.toLocaleString('pt-BR')}
        </span>
        <span style={{ fontSize: 10, color: rankclr }}>pts</span>
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
  onOpenReactBugHunter: () => void;
  onOpenBlockCode: () => void;
  onOpenGodotArena: () => void;
  isDark?: boolean;
}

export default function GamesHubPage({ onBackToHub, onOpenDetetive, onOpenCssBattle, onOpenFlexRocket, onOpenReactBugHunter, onOpenBlockCode, onOpenGodotArena, isDark = true }: GamesHubPageProps) {
  const { currentUser, leaderboard, users, login, registerUser, logout } = useGameState();
  const [showAuth, setShowAuth] = useState(false);

  const myRank = currentUser
    ? leaderboard.findIndex(u => u.id === currentUser.id) + 1
    : 0;

  /* ── Tema ── */
  const bg        = isDark ? '#060a14'  : '#dde4ef';
  const mainText  = isDark ? '#e2e8f0'  : '#1e293b';
  const subText   = isDark ? '#64748b'  : '#475569';
  const mutedText = isDark ? '#334155'  : '#64748b';
  const panelBg   = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.75)';
  const panelBd   = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.12)';
  const gridLine  = isDark ? 'rgba(0,255,204,0.035)' : 'rgba(0,100,80,0.04)';

  /* Cores accent — neon no escuro, sólidas/legíveis no claro */
  const accent    = isDark ? '#00ffcc' : '#0d9488'; // teal
  const accent2   = isDark ? '#a78bfa' : '#7c3aed'; // purple
  const accentRd  = isDark ? '#f87171' : '#dc2626'; // red
  const accentGd  = isDark ? '#fbbf24' : '#d97706'; // gold
  const topBd     = isDark ? 'rgba(0,255,204,0.1)'  : 'rgba(0,0,0,0.12)';
  const accentBd  = isDark ? 'rgba(0,255,204,0.25)' : 'rgba(0,0,0,0.18)';

  return (
    <div style={{
      minHeight: '100vh',
      background: bg,
      backgroundImage: `
        linear-gradient(${gridLine} 1px, transparent 1px),
        linear-gradient(90deg, ${gridLine} 1px, transparent 1px)
      `,
      backgroundSize: '44px 44px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: mainText,
    }}>
      <style>{ANIM}</style>

      {/* ── Scanline animada — apenas modo escuro ── */}
      {isDark && (
        <div style={{
          position: 'fixed', left: 0, right: 0, height: 2, zIndex: 5, pointerEvents: 'none',
          background: 'linear-gradient(90deg, transparent, rgba(0,255,204,0.18), transparent)',
          animation: 'hubScanline 6s linear infinite',
        }} />
      )}

      {/* ── Partículas flutuantes ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
        {PTCL.map(p => (
          <div key={p.id} style={{
            position: 'absolute', left: p.left, bottom: '5%',
            width: p.sz, height: p.sz, borderRadius: '50%',
            background: p.color, boxShadow: isDark ? `0 0 ${p.sz * 3}px ${p.color}` : 'none',
            opacity: isDark ? 1 : 0.35,
            animation: `hubFloat ${p.dur}s linear ${p.delay}s infinite`,
          }} />
        ))}
      </div>

      {/* ── Vignette nas bordas ── */}
      {isDark && (
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 3,
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)',
        }} />
      )}

      <div style={{ position: 'relative', zIndex: 10, maxWidth: 960, margin: '0 auto', padding: '0 20px 60px' }}>

        {/* ════ TOP BAR ════ */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 0', borderBottom: `1px solid ${topBd}`,
          marginBottom: 40, flexWrap: 'wrap', gap: 12,
        }}>
          <button
            onClick={onBackToHub}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'none', border: `1.5px solid ${accentBd}`,
              color: subText, cursor: 'pointer', padding: '8px 16px',
              fontFamily: "'Press Start 2P', monospace", fontSize: 8,
              borderRadius: 4, transition: 'all .15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = accent; (e.currentTarget as HTMLElement).style.borderColor = accent; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = subText; (e.currentTarget as HTMLElement).style.borderColor = accentBd; }}
          >
            <ChevronLeft size={14} /> VOLTAR AO HUB
          </button>

          {/* Auth bar */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '7px 14px',
                background: isDark ? 'rgba(0,255,204,0.07)' : 'rgba(13,148,136,0.07)',
                border: `1.5px solid ${isDark ? 'rgba(0,255,204,0.2)' : 'rgba(13,148,136,0.25)'}`,
                borderRadius: 6,
              }}>
                <AvatarDisplay avatar={currentUser.avatar} name={currentUser.name} size={32} />
                <div>
                  <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: accent }}>
                    {currentUser.name}
                  </div>
                  <div style={{ fontSize: 11, color: subText, marginTop: 3 }}>
                    <span style={{ color: accentGd, fontWeight: 700 }}>{currentUser.points.toLocaleString('pt-BR')}</span> pts
                    &nbsp;·&nbsp;
                    <span style={{ color: accent2, fontWeight: 700 }}>{currentUser.coins.toLocaleString('pt-BR')}</span> moedas
                    {myRank > 0 && (
                      <>&nbsp;·&nbsp;<span style={{ color: accent, fontWeight: 700 }}>#{myRank}</span> rank</>
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
                background: isDark ? 'rgba(0,255,204,0.1)' : 'rgba(13,148,136,0.1)',
                border: `1.5px solid ${isDark ? 'rgba(0,255,204,0.4)' : 'rgba(13,148,136,0.5)'}`,
                color: accent, cursor: 'pointer', padding: '9px 18px',
                fontFamily: "'Press Start 2P', monospace", fontSize: 9, borderRadius: 4,
                boxShadow: isDark ? '0 0 14px rgba(0,255,204,0.2)' : 'none',
                transition: 'all .15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = isDark ? '0 0 28px rgba(0,255,204,0.4)' : '0 2px 8px rgba(13,148,136,0.3)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = isDark ? '0 0 14px rgba(0,255,204,0.2)' : 'none'; }}
            >
              <LogIn size={14} /> ENTRAR / CRIAR CONTA
            </button>
          )}
        </div>

        {/* ════ HERO TITLE ════ */}
        <div style={{ textAlign: 'center', marginBottom: 52, animation: 'hubSlideIn .6s ease both' }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: mutedText, letterSpacing: '0.25em', marginBottom: 14 }}>
            CTRL + PLAY PRESENTS
          </div>
          <h1 style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 'clamp(20px, 4vw, 34px)',
            color: accent, margin: '0 0 14px',
            animation: isDark ? 'hubFlicker 8s ease-in-out infinite' : 'hubSlideIn .6s ease both',
            lineHeight: 1.4,
          }}>
            ARENA DE<br />DESAFIOS
          </h1>
          <div style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 11,
            color: accent2, animation: 'hubCoin 1.1s step-end infinite',
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
            icon={<Search size={26} color={accent2} />}
            glowColor={isDark ? '#a78bfa' : '#7c3aed'}
            glowColor2={isDark ? '#7c3aed' : '#5b21b6'}
            accentText={accent2}
            onPlay={onOpenDetetive}
            isDark={isDark}
          />
          <GameCard
            title="CSS BATTLE"
            subtitle="SOLO & MULTIPLAYER"
            desc="Recrie layouts com CSS puro contra o relógio. Enfrente outros jogadores em batalhas de código em tempo real."
            tags={['CSS', 'Multiplayer', 'Solo', '60+ desafios']}
            icon={<Swords size={26} color={accentRd} />}
            glowColor={isDark ? '#f87171' : '#dc2626'}
            glowColor2={isDark ? '#ef4444' : '#b91c1c'}
            accentText={accentRd}
            onPlay={onOpenCssBattle}
            isDark={isDark}
          />
          <GameCard
            title="FOGUETES NA ÓRBITA"
            subtitle="TUTORIAL FLEXBOX"
            desc="Aprenda CSS Flexbox guiando foguetes para estações espaciais. 15 missões progressivas do básico ao avançado."
            tags={['Flexbox', 'CSS', 'Solo', '15 missões']}
            icon={
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <path d="M13 2C13 2 18 6 18 13C18 17 16 20 13 22C10 20 8 17 8 13C8 6 13 2 13 2Z" fill={accent} opacity="0.9"/>
                <rect x="11" y="12" width="4" height="8" rx="1" fill={accent}/>
                <path d="M9 18L6 22L10 21Z" fill={accentGd}/>
                <path d="M17 18L20 22L16 21Z" fill={accentGd}/>
                <circle cx="13" cy="10" r="2" fill="#fff" opacity="0.7"/>
                <path d="M10 22L13 25L16 22" stroke={accentRd} strokeWidth="1.5" fill="none"/>
              </svg>
            }
            glowColor={isDark ? '#00ffcc' : '#0d9488'}
            glowColor2={isDark ? '#00ccaa' : '#0f766e'}
            accentText={accent}
            onPlay={onOpenFlexRocket}
            isDark={isDark}
          />
          <GameCard
            title="REACT BUG HUNTER"
            subtitle="PRÁTICA REACT"
            desc="Encontre e corrija bugs reais em componentes React. Veja o resultado ao vivo enquanto resolve os 20 desafios progressivos."
            tags={['React', 'Bugs', 'useState', 'useEffect', '20 desafios']}
            icon={<Bug size={26} color={isDark ? '#61dafb' : '#0891b2'} />}
            glowColor={isDark ? '#61dafb' : '#0891b2'}
            glowColor2={isDark ? '#38bdf8' : '#0284c7'}
            accentText={isDark ? '#61dafb' : '#0891b2'}
            onPlay={onOpenReactBugHunter}
            isDark={isDark}
          />
          <GameCard
            title="PROGRAMAÇÃO EM BLOCOS"
            subtitle="TURMAS CK"
            desc="Monte programas arrastando blocos de código e guie o Steve pelo mundo Minecraft! Aprenda lógica, loops e condicionais."
            tags={['Blocos', 'Lógica', 'Loops', 'CK', '5 níveis']}
            icon={<Cpu size={26} color={isDark ? '#5D9E40' : '#3a6e22'} />}
            glowColor={isDark ? '#5D9E40' : '#3a6e22'}
            glowColor2={isDark ? '#3a6e22' : '#2d5219'}
            accentText={isDark ? '#5D9E40' : '#3a6e22'}
            onPlay={onOpenBlockCode}
            isDark={isDark}
          />
          <GameCard
            title="GODOT ARENA"
            subtitle="QUIZ MULTIPLAYER — CT"
            desc="Quiz de GDScript em tempo real! Crie uma sala, desafie a turma e veja quem domina o Godot. Solo ou em grupo."
            tags={['GDScript', 'Godot', 'Multiplayer', 'CT', '25 questões']}
            icon={
              <svg width="26" height="26" viewBox="0 0 400 400" fill="none">
                <circle cx="200" cy="200" r="195" fill="#478cbf"/>
                <ellipse cx="200" cy="185" rx="80" ry="75" fill="white" opacity="0.97"/>
                <ellipse cx="200" cy="185" rx="55" ry="50" fill="#478cbf"/>
                <circle cx="175" cy="168" r="14" fill="white"/>
                <circle cx="225" cy="168" r="14" fill="white"/>
                <path d="M160 240 Q200 275 240 240 L245 265 Q200 305 155 265Z" fill="white" opacity="0.95"/>
              </svg>
            }
            glowColor={isDark ? '#478cbf' : '#2a6496'}
            glowColor2={isDark ? '#2a6496' : '#1a4a70'}
            accentText={isDark ? '#6cb6ff' : '#0366d6'}
            onPlay={onOpenGodotArena}
            isDark={isDark}
          />
        </div>

        {/* ════ STATS BAR ════ */}
        <div style={{
          display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap',
          marginBottom: 44, animation: 'hubSlideIn .7s ease .15s both',
        }}>
          {[
            { icon: <Users size={15} color={accent} />, label: 'Jogadores', val: leaderboard.length },
            { icon: <Star size={15} color={accentGd} />, label: 'Casos disponíveis', val: '70+' },
            { icon: <Zap size={15} color={accentRd} />, label: 'Desafios CSS', val: '60+' },
            { icon: <Shield size={15} color={accent2} />, label: 'Níveis de dificuldade', val: 4 },
          ].map(s => (
            <div key={s.label} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 18px',
              background: panelBg,
              border: `1px solid ${panelBd}`,
              borderRadius: 8, flexShrink: 0,
            }}>
              {s.icon}
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: mainText }}>{s.val}</span>
              <span style={{ fontSize: 11, color: mutedText }}>{s.label}</span>
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
              background: panelBg, border: `1px solid ${panelBd}`,
              borderRadius: 8,
            }}>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: mutedText, marginBottom: 10 }}>
                SEM JOGADORES AINDA
              </div>
              <div style={{ fontSize: 13, color: mutedText }}>
                Seja o primeiro a criar uma conta e entrar no ranking!
              </div>
            </div>
          ) : (
            <div style={{
              background: panelBg,
              border: `1px solid ${panelBd}`,
              borderRadius: 8, overflow: 'hidden',
            }}>
              {/* Cabeçalho */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                background: 'rgba(251,191,36,0.06)', borderBottom: '1px solid rgba(251,191,36,0.12)',
              }}>
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: subText, flex: 1 }}>
                  # &nbsp; JOGADOR
                </span>
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: subText }}>
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
                    isDark={isDark}
                  />
                ))}
                {currentUser && myRank > 15 && (
                  <>
                    <div style={{ textAlign: 'center', padding: '6px', color: mutedText, fontSize: 11 }}>• • •</div>
                    <RankRow rank={myRank} user={currentUser} isMe={true} isDark={isDark} />
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
            background: isDark ? 'rgba(0,255,204,0.04)' : 'rgba(13,148,136,0.06)',
            border: `2px solid ${isDark ? 'rgba(0,255,204,0.2)' : 'rgba(13,148,136,0.3)'}`,
            borderRadius: 10, textAlign: 'center',
            animation: 'hubSlideIn .7s ease .3s both',
          }}>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: accent, marginBottom: 10 }}>
              SALVE SEU PROGRESSO
            </div>
            <p style={{ fontSize: 13, color: subText, marginBottom: 20, lineHeight: 1.7 }}>
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
          isDark={isDark}
        />
      )}
    </div>
  );
}
