import React, { useState } from 'react';
import {
  Trophy, Swords, Search, LogIn, UserPlus, LogOut,
  Crown, Medal, Lock, User, Zap, ChevronLeft, Star, Users, Shield, X, Bug, Cpu,
  ShoppingBag,
} from 'lucide-react';
import { useGameState, GameUser, LoginResult } from '../hooks/useGameState';
import { COSMETICS, CosmeticDef } from '../data/cosmetics';

/* ═══════════════════════════════════════════════════════════
   KEYFRAMES
═══════════════════════════════════════════════════════════ */
const ANIM = `
  @keyframes hubScanline {
    from { top: -3px; } to { top: 100%; }
  }
  @keyframes hubFlicker {
    0%,18%,20%,22%,52%,54%,100% {
      opacity:1;
      text-shadow:0 0 8px #00ffcc,0 0 18px #00ffcc,0 0 36px #00ffcc,0 0 60px #00ffcc44;
    }
    19%,21%,53% { opacity:0.55; text-shadow:none; }
  }
  @keyframes hubCoin { 0%,49%{ opacity:1; } 50%,99%{ opacity:0; } }
  @keyframes hubFloat {
    0%   { transform:translateY(0) scale(1); opacity:0.9; }
    100% { transform:translateY(-110px) scale(0); opacity:0; }
  }
  @keyframes hubGlowPulse {
    0%,100% { box-shadow:0 0 10px var(--gc),0 4px 32px rgba(0,0,0,.55); }
    50%     { box-shadow:0 0 24px var(--gc),0 0 44px var(--gc2,transparent),0 4px 32px rgba(0,0,0,.55); }
  }
  @keyframes hubPlayBtn {
    0%,100% { letter-spacing:0.10em; } 50% { letter-spacing:0.20em; }
  }
  @keyframes hubSlideIn {
    from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); }
  }
  @keyframes hubSlideLeft {
    from { opacity:0; transform:translateX(-22px); } to { opacity:1; transform:translateX(0); }
  }
  @keyframes hubSlideRight {
    from { opacity:0; transform:translateX(22px); } to { opacity:1; transform:translateX(0); }
  }
  @keyframes hubRankRow {
    from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); }
  }
  @keyframes podiumRise {
    from { transform:scaleY(0); transform-origin:bottom; }
    to   { transform:scaleY(1); transform-origin:bottom; }
  }
  @keyframes arenaGlow {
    0%,100% { box-shadow:0 0 18px rgba(0,255,204,0.12), inset 0 0 22px rgba(0,255,204,0.05); }
    50%     { box-shadow:0 0 36px rgba(0,255,204,0.22), inset 0 0 40px rgba(0,255,204,0.10); }
  }
  @keyframes coinPulse {
    0%,100% { opacity:0.8; transform:scale(1); }
    50%     { opacity:1; transform:scale(1.04); }
  }
`;

/* ═══════════════════════════════════════════════════════════
   PARTICLES
═══════════════════════════════════════════════════════════ */
const PTCL = Array.from({ length: 22 }, (_, i) => ({
  id: i, left: `${(i * 19 + 5) % 97 + 2}%`,
  sz: (i % 3) + 2, dur: 5 + (i % 6), delay: -((i * 1.3) % 9),
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
  const color = avatar?.startsWith('#') ? avatar : stringToColor(name);
  return (
    <div style={{ width: size, height: size, background: color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.2)' }}>
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
  users: any[]; onLogin: (n: string, p: string) => Promise<LoginResult>;
  onRegister: (n: string, av: string, p: string) => Promise<string>;
  onClose: () => void; isDark: boolean;
}) {
  const [mode, setMode] = useState<'login'|'register'>(users.length > 0 ? 'login' : 'register');
  const [name, setName] = useState('');
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [av, setAv] = useState(AVATAR_COLORS[0]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const acc = isDark ? '#00ffcc' : '#0d9488';
  const mbg = isDark ? '#0a0e1a' : '#ffffff';
  const mtx = isDark ? '#e2e8f0' : '#1e293b';
  const msb = isDark ? '#475569' : '#64748b';
  const mib = isDark ? '#060a14' : '#f8fafc';
  const mbd = isDark ? 'rgba(0,255,204,0.22)' : 'rgba(0,0,0,0.18)';

  const inp: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '9px 12px 9px 34px',
    background: mib, border: `1.5px solid ${mbd}`, color: mtx,
    fontSize: 13, fontFamily: 'inherit', outline: 'none', borderRadius: 4,
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
    if (users.some((u: any) => u.name.toLowerCase() === name.trim().toLowerCase())) { setErr('Nome já em uso.'); return; }
    setLoading(true); setErr('');
    await onRegister(name.trim(), av, pass);
    setLoading(false); onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(6px)' }}>
      <div style={{ width: '100%', maxWidth: 400, background: mbg, border: `2px solid ${isDark ? 'rgba(0,255,204,0.4)' : 'rgba(13,148,136,0.35)'}`, boxShadow: isDark ? '0 0 40px rgba(0,255,204,0.2),6px 6px 0 rgba(0,255,204,0.12)' : '0 8px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: isDark ? 'rgba(0,255,204,0.06)' : 'rgba(13,148,136,0.07)', borderBottom: `1.5px solid ${isDark ? 'rgba(0,255,204,0.15)' : 'rgba(13,148,136,0.2)'}` }}>
          <div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: acc, marginBottom: 6 }}>ARENA DE DESAFIOS</div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: mtx }}>{mode === 'login' ? 'IDENTIFICAÇÃO' : 'CRIAR CONTA'}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: msb }}><X size={18} /></button>
        </div>

        {users.length > 0 && (
          <div style={{ display: 'flex', borderBottom: `1.5px solid ${isDark ? 'rgba(0,255,204,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
            {(['login','register'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setErr(''); }}
                style={{ flex: 1, padding: '10px', border: 'none', cursor: 'pointer', background: mode===m ? (isDark?'rgba(0,255,204,0.08)':'rgba(13,148,136,0.07)'):'transparent', borderBottom: mode===m?`2px solid ${acc}`:'2px solid transparent', fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: mode===m?acc:msb }}>
                {m==='login'?'ENTRAR':'CADASTRAR'}
              </button>
            ))}
          </div>
        )}

        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 13 }}>
          {mode==='register' && (
            <div>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: msb, marginBottom: 8 }}>AVATAR</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 5 }}>
                {AVATAR_COLORS.map(a => (
                  <button key={a} onClick={() => setAv(a)} style={{ height: 36, background: av===a?(isDark?'rgba(0,255,204,0.12)':'rgba(13,148,136,0.12)'):(isDark?'rgba(255,255,255,0.03)':'#f1f5f9'), border: `1.5px solid ${av===a?acc:(isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.12)')}`, cursor: 'pointer', borderRadius: 4, transform: av===a?'translateY(-2px)':'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 22, height: 22, background: a, border: '2px solid rgba(255,255,255,0.3)' }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: msb, marginBottom: 7 }}>USUÁRIO</div>
            <div style={{ position: 'relative' }}>
              <User size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: msb }} />
              <input value={name} onChange={e=>{setName(e.target.value);setErr('');}} placeholder="Seu nome de usuário" maxLength={20} style={inp} onFocus={e=>(e.currentTarget.style.borderColor=acc)} onBlur={e=>(e.currentTarget.style.borderColor=mbd)} />
            </div>
          </div>

          <div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: msb, marginBottom: 7 }}>SENHA</div>
            <div style={{ position: 'relative' }}>
              <Lock size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: msb }} />
              <input type="password" value={pass} onChange={e=>{setPass(e.target.value);setErr('');}} placeholder="Mínimo 4 caracteres" style={inp} onFocus={e=>(e.currentTarget.style.borderColor=acc)} onBlur={e=>(e.currentTarget.style.borderColor=mbd)} onKeyDown={e=>e.key==='Enter'&&(mode==='login'?doLogin():doRegister())} />
            </div>
          </div>

          {mode==='register' && (
            <div>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: msb, marginBottom: 7 }}>CONFIRMAR</div>
              <div style={{ position: 'relative' }}>
                <Lock size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: msb }} />
                <input type="password" value={pass2} onChange={e=>{setPass2(e.target.value);setErr('');}} placeholder="Repita a senha" style={inp} onFocus={e=>(e.currentTarget.style.borderColor=acc)} onBlur={e=>(e.currentTarget.style.borderColor=mbd)} onKeyDown={e=>e.key==='Enter'&&doRegister()} />
              </div>
            </div>
          )}

          {err && <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.12)', border: '1.5px solid #ef4444', fontSize: 12, color: '#ef4444', borderRadius: 4 }}>{err}</div>}

          <button onClick={mode==='login'?doLogin:doRegister} disabled={loading}
            style={{ padding: '12px', border: 'none', cursor: loading?'not-allowed':'pointer', background: loading?(isDark?'#1e2a3a':'#e2e8f0'):`linear-gradient(135deg,${acc},${isDark?'#00ccaa':'#0f766e'})`, color: isDark?'#060a14':'#ffffff', fontFamily: "'Press Start 2P', monospace", fontSize: 10, fontWeight: 900, opacity: loading?0.7:1, boxShadow: loading?'none':'0 0 20px rgba(0,255,204,0.4),4px 4px 0 rgba(0,255,204,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            {loading?'AGUARDE...' : mode==='login' ? <><LogIn size={14}/> ENTRAR</> : <><UserPlus size={14}/> CRIAR CONTA</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   RANKING ROW
═══════════════════════════════════════════════════════════ */
function RankRow({ rank, user, isMe, isDark }: { rank: number; user: any; isMe: boolean; isDark: boolean }) {
  const accent  = isDark ? '#00ffcc' : '#0d9488';
  const nameclr = isDark ? '#cbd5e1' : '#1e293b';
  const rankclr = isDark ? '#334155' : '#64748b';
  const ptsclr  = isDark ? '#475569' : '#64748b';

  const medal =
    rank === 1 ? <Crown size={12} color="#fbbf24" /> :
    rank === 2 ? <Medal size={12} color="#94a3b8" /> :
    rank === 3 ? <Medal size={12} color="#cd7c0f" /> :
    <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: rankclr, minWidth: 16, textAlign: 'center', display: 'inline-block' }}>#{rank}</span>;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7, padding: '6px 8px',
      background: isMe ? (isDark?'rgba(0,255,204,0.07)':'rgba(13,148,136,0.07)') : 'transparent',
      border: isMe ? `1px solid ${isDark?'rgba(0,255,204,0.2)':'rgba(13,148,136,0.25)'}` : '1px solid transparent',
      borderRadius: 4, animation: `hubRankRow .3s ease ${Math.min(rank*0.03,0.45)}s both`,
    }}>
      <div style={{ width: 18, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>{medal}</div>
      <AvatarDisplay avatar={user.avatar} name={user.name} size={22} />
      <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: isMe ? accent : nameclr, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {user.name}{isMe ? ' ★' : ''}
      </span>
      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: rank<=3?'#fbbf24':ptsclr, flexShrink: 0 }}>
        {user.points.toLocaleString('pt-BR')}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PODIUM (top 3 visual)
═══════════════════════════════════════════════════════════ */
function Podium({ top3, isDark }: { top3: any[]; isDark: boolean }) {
  if (!top3[0]) return null;

  const slots = [
    { player: top3[1], rank: 2, h: 52, color: '#94a3b8', icon: <Medal size={13} color="#94a3b8" /> },
    { player: top3[0], rank: 1, h: 68, color: '#fbbf24', icon: <Crown  size={13} color="#fbbf24" /> },
    { player: top3[2], rank: 3, h: 36, color: '#cd7c0f', icon: <Medal size={13} color="#cd7c0f" /> },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 6, padding: '4px 2px' }}>
      {slots.map(({ player, rank, h, color, icon }) =>
        player ? (
          <div key={rank} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <div style={{ marginBottom: 4, position: 'relative', display: 'inline-block' }}>
              <AvatarDisplay avatar={player.avatar} name={player.name} size={rank===1 ? 34 : 26} />
              <div style={{ position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)' }}>{icon}</div>
            </div>
            <div style={{ fontSize: 9, color: isDark?'#94a3b8':'#475569', maxWidth: 58, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center', marginBottom: 3 }}>
              {player.name}
            </div>
            <div style={{
              width: '100%', height: h,
              background: `linear-gradient(180deg,${color}2a,${color}0e)`,
              border: `1.5px solid ${color}44`, borderTopLeftRadius: 4, borderTopRightRadius: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: `podiumRise .5s ease ${rank===1?0:rank===2?0.1:0.2}s both`,
            }}>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color }}>{rank}º</span>
            </div>
          </div>
        ) : <div key={rank} style={{ flex: 1 }} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SHOP SIDEBAR (cosméticos)
═══════════════════════════════════════════════════════════ */
function ShopSidebar({ currentUser, onBuy, onEquip, isDark, accent, panelBg, panelBd, subText, mutedText, mainText }: {
  currentUser: GameUser | null;
  onBuy: (id: string, cost: number) => boolean;
  onEquip: (id: string | null) => void;
  isDark: boolean; accent: string;
  panelBg: string; panelBd: string;
  subText: string; mutedText: string; mainText: string;
}) {
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null);
  const accentGd = isDark ? '#fbbf24' : '#d97706';

  const doFeedback = (msg: string, ok: boolean) => {
    setFeedback({ msg, ok });
    setTimeout(() => setFeedback(null), 2800);
  };

  const handleBuy = (c: CosmeticDef) => {
    const ok = onBuy(c.id, c.cost);
    doFeedback(ok ? `${c.emoji} Comprado e equipado!` : '❌ Moedas insuficientes', ok);
  };

  const handleEquip = (c: CosmeticDef) => { onEquip(c.id); doFeedback(`${c.emoji} Equipado! Volte ao Hub.`, true); };
  const handleUnequip = () => { onEquip(null); doFeedback('🎨 Tema padrão restaurado.', true); };

  const activeId  = currentUser?.activeCosmeticId;
  const isOwned   = (id: string) => currentUser?.purchasedCosmetics.includes(id) ?? false;

  return (
    <div style={{ animation: 'hubSlideRight .55s ease .15s both' }}>
      {/* Sidebar header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <ShoppingBag size={15} color={accentGd} />
        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: accentGd }}>LOJA</span>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${accentGd}44,transparent)` }} />
      </div>

      {!currentUser ? (
        <div style={{ padding: '22px 14px', textAlign: 'center', background: panelBg, border: `1.5px solid ${panelBd}`, borderRadius: 10 }}>
          <Lock size={22} color={mutedText} style={{ marginBottom: 10 }} />
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: mutedText, marginBottom: 8 }}>FAÇA LOGIN</div>
          <div style={{ fontSize: 11, color: mutedText, lineHeight: 1.6 }}>para acessar cosméticos e personalizar o Hub</div>
        </div>
      ) : (
        <div>
          {/* Coins */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 11px', marginBottom: 12, background: isDark?'rgba(251,191,36,0.06)':'rgba(217,119,6,0.05)', border: `1px solid ${accentGd}33`, borderRadius: 6, animation: 'coinPulse 2.5s ease-in-out infinite' }}>
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: mutedText }}>SALDO</span>
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: accentGd }}>🪙 {currentUser.coins.toLocaleString('pt-BR')}</span>
          </div>

          {feedback && (
            <div style={{ padding: '7px 10px', marginBottom: 10, borderRadius: 4, fontSize: 11, background: feedback.ok?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)', border: `1px solid ${feedback.ok?'#22c55e44':'#ef444444'}`, color: feedback.ok?'#22c55e':'#ef4444' }}>
              {feedback.msg}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {COSMETICS.map(c => {
              const owned    = isOwned(c.id);
              const isActive = activeId === c.id;
              const canBuy   = !owned && (currentUser.coins >= c.cost);

              return (
                <div key={c.id} style={{ background: panelBg, border: `1.5px solid ${isActive?c.tagColor+'66':panelBd}`, borderRadius: 8, overflow: 'hidden', boxShadow: isActive?`0 0 10px ${c.tagColor}33`:'none', transition: 'all .15s' }}>
                  {/* Preview strip */}
                  <div style={{ height: 44, background: c.previewGradient, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px' }}>
                    <span style={{ fontSize: 22 }}>{c.emoji}</span>
                    {isActive && <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: '#fff', background: c.tagColor, padding: '2px 5px', borderRadius: 2 }}>ON</span>}
                    {owned && !isActive && <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: c.tagColor, border: `1px solid ${c.tagColor}`, padding: '2px 5px', borderRadius: 2 }}>✓</span>}
                  </div>

                  <div style={{ padding: '8px 10px' }}>
                    <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: c.tagColor, marginBottom: 2 }}>{c.tag}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: mainText, marginBottom: 6 }}>{c.name}</div>

                    {!owned ? (
                      <button onClick={() => handleBuy(c)} disabled={!canBuy}
                        style={{ width: '100%', padding: '6px 4px', background: canBuy?c.tagColor:(isDark?'#1e2a3a':'#e5e7eb'), border: 'none', borderRadius: 3, color: canBuy?'#fff':mutedText, fontFamily: "'Press Start 2P', monospace", fontSize: 7, cursor: canBuy?'pointer':'not-allowed', opacity: canBuy?1:0.55 }}>
                        {c.cost} moedas
                      </button>
                    ) : isActive ? (
                      <button onClick={handleUnequip}
                        style={{ width: '100%', padding: '6px 4px', background: 'transparent', border: `1.5px solid ${c.tagColor}`, borderRadius: 3, color: c.tagColor, fontFamily: "'Press Start 2P', monospace", fontSize: 7, cursor: 'pointer' }}>
                        ✓ RETIRAR
                      </button>
                    ) : (
                      <button onClick={() => handleEquip(c)}
                        style={{ width: '100%', padding: '6px 4px', background: c.tagColor, border: 'none', borderRadius: 3, color: '#fff', fontFamily: "'Press Start 2P', monospace", fontSize: 7, cursor: 'pointer' }}>
                        EQUIPAR
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   GAME CARD (otimizado para grid 2 colunas)
═══════════════════════════════════════════════════════════ */
function GameCard({ title, subtitle, desc, tags, icon, glowColor, glowColor2, accentText, onPlay, isDark }: {
  title: string; subtitle: string; desc: string; tags: string[];
  icon: React.ReactNode; glowColor: string; glowColor2: string;
  accentText: string; onPlay: () => void; isDark: boolean;
}) {
  const [hov, setHov] = useState(false);
  const cardBg  = isDark ? '#0a0e1a' : '#ffffff';
  const titleClr = isDark ? '#e2e8f0' : '#1e293b';
  const descClr  = isDark ? '#64748b' : '#475569';

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onPlay}
      style={{
        background: cardBg, border: `2px solid ${hov?glowColor:glowColor+'44'}`,
        cursor: 'pointer', position: 'relative', overflow: 'hidden',
        transform: hov ? 'translateY(-5px) scale(1.01)' : 'none',
        transition: 'all .2s cubic-bezier(0.4,0,0.2,1)',
        '--gc': glowColor+'55', '--gc2': glowColor2+'33',
        animation: isDark ? 'hubGlowPulse 3.5s ease-in-out infinite' : 'none',
        boxShadow: !isDark ? (hov?`0 6px 24px rgba(0,0,0,0.14)`:`0 2px 8px rgba(0,0,0,0.08)`) : undefined,
      } as React.CSSProperties}
    >
      {/* Accent stripe */}
      <div style={{ height: 3, background: `linear-gradient(90deg,${glowColor},${glowColor2})` }} />

      {/* BG grid */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(${glowColor}05 1px,transparent 1px),linear-gradient(90deg,${glowColor}05 1px,transparent 1px)`, backgroundSize: '18px 18px' }} />

      {hov && <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `linear-gradient(180deg,transparent,${glowColor}05,transparent)`, animation: 'hubScanline 1.6s linear infinite' }} />}

      <div style={{ padding: '16px 16px', position: 'relative', zIndex: 1 }}>
        {/* Icon + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 10 }}>
          <div style={{ width: 42, height: 42, flexShrink: 0, background: `linear-gradient(135deg,${glowColor}1a,${glowColor2}0d)`, border: `1.5px solid ${glowColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: hov?`0 0 14px ${glowColor}55`:'none', transition: 'box-shadow .2s' }}>
            {icon}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: accentText, marginBottom: 4, letterSpacing: '0.07em' }}>{subtitle}</div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: titleClr, lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
          </div>
        </div>

        {/* Desc (2 lines max) */}
        <p style={{ fontSize: 12, color: descClr, lineHeight: 1.6, margin: '0 0 10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>
          {desc}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
          {tags.slice(0, 3).map(t => (
            <span key={t} style={{ padding: '2px 6px', fontSize: 9, fontWeight: 700, background: `${glowColor}12`, color: accentText, border: `1px solid ${glowColor}28`, borderRadius: 2 }}>{t}</span>
          ))}
        </div>

        {/* Play btn */}
        <button
          onClick={e => { e.stopPropagation(); onPlay(); }}
          style={{ width: '100%', padding: '10px', background: hov?`linear-gradient(135deg,${glowColor},${glowColor2})`:`linear-gradient(135deg,${glowColor}18,${glowColor2}0d)`, border: `1.5px solid ${glowColor}`, color: hov?'#060a14':glowColor, fontFamily: "'Press Start 2P', monospace", fontSize: 10, cursor: 'pointer', letterSpacing: '0.10em', boxShadow: hov?`0 0 20px ${glowColor}55,3px 3px 0 ${glowColor}33`:'none', transition: 'all .2s', animation: hov?'hubPlayBtn 1.3s ease-in-out infinite':'none' }}>
          ▶ JOGAR
        </button>
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

export default function GamesHubPage({
  onBackToHub, onOpenDetetive, onOpenCssBattle, onOpenFlexRocket,
  onOpenReactBugHunter, onOpenBlockCode, onOpenGodotArena, isDark = true,
}: GamesHubPageProps) {
  const { currentUser, leaderboard, users, login, registerUser, logout, buyCosmetic, equipCosmetic } = useGameState();
  const [showAuth, setShowAuth] = useState(false);

  const myRank    = currentUser ? leaderboard.findIndex(u => u.id === currentUser.id) + 1 : 0;
  const top3      = leaderboard.slice(0, 3);

  /* ── tema ── */
  const bg        = isDark ? '#060a14' : '#dde4ef';
  const mainText  = isDark ? '#e2e8f0' : '#1e293b';
  const subText   = isDark ? '#64748b' : '#475569';
  const mutedText = isDark ? '#334155' : '#64748b';
  const panelBg   = isDark ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.82)';
  const panelBd   = isDark ? 'rgba(255,255,255,0.08)'  : 'rgba(0,0,0,0.12)';
  const gridLine  = isDark ? 'rgba(0,255,204,0.04)'    : 'rgba(0,100,80,0.04)';
  const accent    = isDark ? '#00ffcc' : '#0d9488';
  const accent2   = isDark ? '#a78bfa' : '#7c3aed';
  const accentRd  = isDark ? '#f87171' : '#dc2626';
  const accentGd  = isDark ? '#fbbf24' : '#d97706';
  const accentBd  = isDark ? 'rgba(0,255,204,0.25)' : 'rgba(0,0,0,0.18)';
  const topBd     = isDark ? 'rgba(0,255,204,0.1)'  : 'rgba(0,0,0,0.12)';

  return (
    <div style={{ minHeight: '100vh', background: bg, backgroundImage: `linear-gradient(${gridLine} 1px,transparent 1px),linear-gradient(90deg,${gridLine} 1px,transparent 1px)`, backgroundSize: '44px 44px', position: 'relative', fontFamily: 'system-ui,-apple-system,sans-serif', color: mainText }}>
      <style>{ANIM}</style>

      {/* Fixed effects */}
      {isDark && <div style={{ position: 'fixed', left: 0, right: 0, height: 2, zIndex: 5, pointerEvents: 'none', background: 'linear-gradient(90deg,transparent,rgba(0,255,204,0.18),transparent)', animation: 'hubScanline 7s linear infinite' }} />}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
        {PTCL.map(p => <div key={p.id} style={{ position: 'absolute', left: p.left, bottom: '5%', width: p.sz, height: p.sz, borderRadius: '50%', background: p.color, boxShadow: isDark?`0 0 ${p.sz*3}px ${p.color}`:'none', opacity: isDark?1:0.35, animation: `hubFloat ${p.dur}s linear ${p.delay}s infinite` }} />)}
      </div>
      {isDark && <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 3, background: 'radial-gradient(ellipse at center,transparent 35%,rgba(0,0,0,0.72) 100%)' }} />}

      {/* ══ CONTENT ══ */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 1380, margin: '0 auto', padding: '0 16px 60px' }}>

        {/* ════ HEADER ════ */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: `1px solid ${topBd}`, marginBottom: 24, flexWrap: 'wrap', gap: 10 }}>
          <button
            onClick={onBackToHub}
            style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: `1.5px solid ${accentBd}`, color: subText, cursor: 'pointer', padding: '7px 13px', fontFamily: "'Press Start 2P', monospace", fontSize: 8, borderRadius: 4, transition: 'all .15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = accent; (e.currentTarget as HTMLElement).style.borderColor = accent; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = subText; (e.currentTarget as HTMLElement).style.borderColor = accentBd; }}
          >
            <ChevronLeft size={13} /> VOLTAR AO HUB
          </button>

          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', background: isDark?'rgba(0,255,204,0.07)':'rgba(13,148,136,0.07)', border: `1.5px solid ${isDark?'rgba(0,255,204,0.2)':'rgba(13,148,136,0.25)'}`, borderRadius: 6 }}>
                <AvatarDisplay avatar={currentUser.avatar} name={currentUser.name} size={30} />
                <div>
                  <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: accent }}>{currentUser.name}</div>
                  <div style={{ fontSize: 11, color: subText, marginTop: 2 }}>
                    <span style={{ color: accentGd, fontWeight: 700 }}>{currentUser.points.toLocaleString('pt-BR')}</span> pts
                    &nbsp;·&nbsp;<span style={{ color: accent2, fontWeight: 700 }}>{currentUser.coins.toLocaleString('pt-BR')}</span> moedas
                    {myRank > 0 && <>&nbsp;·&nbsp;<span style={{ color: accent, fontWeight: 700 }}>#{myRank}</span></>}
                  </div>
                </div>
              </div>
              <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: '1.5px solid rgba(239,68,68,0.3)', color: '#ef4444', cursor: 'pointer', padding: '7px 11px', fontSize: 11, borderRadius: 4, transition: 'all .15s' }} onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(239,68,68,0.1)'} onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='none'}>
                <LogOut size={12} /> Sair
              </button>
            </div>
          ) : (
            <button onClick={() => setShowAuth(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: isDark?'rgba(0,255,204,0.1)':'rgba(13,148,136,0.1)', border: `1.5px solid ${isDark?'rgba(0,255,204,0.4)':'rgba(13,148,136,0.5)'}`, color: accent, cursor: 'pointer', padding: '8px 16px', fontFamily: "'Press Start 2P', monospace", fontSize: 9, borderRadius: 4, boxShadow: isDark?'0 0 14px rgba(0,255,204,0.2)':'none', transition: 'all .15s' }}>
              <LogIn size={13} /> ENTRAR / CRIAR CONTA
            </button>
          )}
        </div>

        {/* ════ 3-COLUMN BODY ════ */}
        <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>

          {/* ── LEFT: RANKING ── */}
          <div style={{ width: 244, flexShrink: 0, animation: 'hubSlideLeft .5s ease .1s both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Trophy size={15} color={accentGd} />
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: accentGd }}>CAMPEÕES</span>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${accentGd}44,transparent)` }} />
            </div>

            <div style={{ background: panelBg, border: `1.5px solid ${panelBd}`, borderRadius: 10, overflow: 'hidden' }}>
              {leaderboard.length === 0 ? (
                <div style={{ padding: '28px 16px', textAlign: 'center' }}>
                  <Trophy size={28} color={mutedText} style={{ marginBottom: 10 }} />
                  <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: mutedText, marginBottom: 8 }}>SEM JOGADORES</div>
                  <div style={{ fontSize: 12, color: mutedText }}>Seja o primeiro!</div>
                </div>
              ) : (
                <>
                  {top3.length >= 1 && (
                    <div style={{ padding: '14px 10px 10px', borderBottom: `1px solid ${isDark?'rgba(251,191,36,0.1)':'rgba(0,0,0,0.07)'}` }}>
                      <Podium top3={top3} isDark={isDark} />
                    </div>
                  )}
                  <div style={{ padding: '6px 4px', maxHeight: 460, overflowY: 'auto' }}>
                    {leaderboard.slice(0, 20).map((u, i) => (
                      <RankRow key={u.id} rank={i+1} user={u} isMe={currentUser?.id===u.id} isDark={isDark} />
                    ))}
                    {currentUser && myRank > 20 && (
                      <>
                        <div style={{ textAlign: 'center', padding: '4px', color: mutedText, fontSize: 10 }}>• • •</div>
                        <RankRow rank={myRank} user={currentUser} isMe={true} isDark={isDark} />
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {!currentUser && (
              <div style={{ marginTop: 12, padding: '14px 14px', textAlign: 'center', background: isDark?'rgba(0,255,204,0.04)':'rgba(13,148,136,0.05)', border: `1.5px solid ${isDark?'rgba(0,255,204,0.15)':'rgba(13,148,136,0.2)'}`, borderRadius: 8 }}>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: accent, marginBottom: 8 }}>ENTRE NO RANKING</div>
                <button onClick={() => setShowAuth(true)} style={{ padding: '8px 14px', background: `linear-gradient(135deg,${accent},${isDark?'#00ccaa':'#0f766e'})`, border: 'none', color: '#060a14', fontFamily: "'Press Start 2P', monospace", fontSize: 7, cursor: 'pointer', borderRadius: 4 }}>
                  CRIAR CONTA
                </button>
              </div>
            )}
          </div>

          {/* ── CENTER: HERO + CARDS ── */}
          <div style={{ flex: 1, minWidth: 0, animation: 'hubSlideIn .45s ease .05s both' }}>

            {/* HERO */}
            <div style={{
              textAlign: 'center', marginBottom: 22, padding: '24px 20px 20px',
              background: isDark?'rgba(0,255,204,0.025)':'rgba(13,148,136,0.03)',
              border: `2px solid ${isDark?'rgba(0,255,204,0.13)':'rgba(13,148,136,0.14)'}`,
              borderRadius: 12,
              animation: isDark ? 'arenaGlow 4.5s ease-in-out infinite' : 'hubSlideIn .45s ease both',
            }}>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: mutedText, letterSpacing: '0.2em', marginBottom: 12 }}>
                CTRL + PLAY · TURMAS
              </div>
              <h1 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 'clamp(18px,3vw,28px)', color: accent, margin: '0 0 12px', lineHeight: 1.5, animation: isDark?'hubFlicker 8s ease-in-out infinite':'none' }}>
                ARENA DE<br />DESAFIOS
              </h1>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: accent2, animation: 'hubCoin 1.1s step-end infinite', letterSpacing: '0.14em' }}>
                ★ SELECIONE SEU DESAFIO ★
              </div>
            </div>

            {/* GAME GRID 2×3 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <GameCard
                title="DETETIVE DE CÓDIGO"
                subtitle="MODO SOLO"
                desc="Resolva casos de lógica, programação e matemática. Avance por níveis e conquiste o topo do ranking."
                tags={['Lógica', 'Algoritmos', '70+ casos']}
                icon={<Search size={24} color={accent2} />}
                glowColor={isDark?'#a78bfa':'#7c3aed'}
                glowColor2={isDark?'#7c3aed':'#5b21b6'}
                accentText={accent2}
                onPlay={onOpenDetetive}
                isDark={isDark}
              />
              <GameCard
                title="CSS BATTLE"
                subtitle="SOLO & MULTIPLAYER"
                desc="Recrie layouts com CSS puro contra o relógio. Batalhas em tempo real contra outros jogadores."
                tags={['CSS', 'Multiplayer', '60+ desafios']}
                icon={<Swords size={24} color={accentRd} />}
                glowColor={isDark?'#f87171':'#dc2626'}
                glowColor2={isDark?'#ef4444':'#b91c1c'}
                accentText={accentRd}
                onPlay={onOpenCssBattle}
                isDark={isDark}
              />
              <GameCard
                title="FOGUETES NA ÓRBITA"
                subtitle="TUTORIAL FLEXBOX"
                desc="Guie foguetes para estações espaciais aprendendo CSS Flexbox. 15 missões progressivas."
                tags={['Flexbox', 'CSS', '15 missões']}
                icon={
                  <svg width="24" height="24" viewBox="0 0 26 26" fill="none">
                    <path d="M13 2C13 2 18 6 18 13C18 17 16 20 13 22C10 20 8 17 8 13C8 6 13 2 13 2Z" fill={accent} opacity="0.9"/>
                    <rect x="11" y="12" width="4" height="8" rx="1" fill={accent}/>
                    <path d="M9 18L6 22L10 21Z" fill={accentGd}/>
                    <path d="M17 18L20 22L16 21Z" fill={accentGd}/>
                    <circle cx="13" cy="10" r="2" fill="#fff" opacity="0.7"/>
                    <path d="M10 22L13 25L16 22" stroke={accentRd} strokeWidth="1.5" fill="none"/>
                  </svg>
                }
                glowColor={isDark?'#00ffcc':'#0d9488'}
                glowColor2={isDark?'#00ccaa':'#0f766e'}
                accentText={accent}
                onPlay={onOpenFlexRocket}
                isDark={isDark}
              />
              <GameCard
                title="REACT BUG HUNTER"
                subtitle="PRÁTICA REACT"
                desc="Encontre e corrija bugs reais em componentes React. Veja o resultado ao vivo enquanto resolve."
                tags={['React', 'Bugs', '20 desafios']}
                icon={<Bug size={24} color={isDark?'#61dafb':'#0891b2'} />}
                glowColor={isDark?'#61dafb':'#0891b2'}
                glowColor2={isDark?'#38bdf8':'#0284c7'}
                accentText={isDark?'#61dafb':'#0891b2'}
                onPlay={onOpenReactBugHunter}
                isDark={isDark}
              />
              <GameCard
                title="BLOCOS DE CÓDIGO"
                subtitle="TURMAS CK"
                desc="Monte programas com blocos e guie o Steve pelo Minecraft! Lógica, loops e condicionais."
                tags={['Blocos', 'Lógica', 'CK']}
                icon={<Cpu size={24} color={isDark?'#5D9E40':'#3a6e22'} />}
                glowColor={isDark?'#5D9E40':'#3a6e22'}
                glowColor2={isDark?'#3a6e22':'#2d5219'}
                accentText={isDark?'#5D9E40':'#3a6e22'}
                onPlay={onOpenBlockCode}
                isDark={isDark}
              />
              <GameCard
                title="GODOT ARENA"
                subtitle="QUIZ MULTIPLAYER — CT"
                desc="Quiz de GDScript em tempo real! Crie uma sala e desafie a turma. Solo ou em grupo."
                tags={['GDScript', 'Multiplayer', 'CT']}
                icon={
                  <svg width="24" height="24" viewBox="0 0 400 400" fill="none">
                    <circle cx="200" cy="200" r="195" fill="#478cbf"/>
                    <ellipse cx="200" cy="185" rx="80" ry="75" fill="white" opacity="0.97"/>
                    <ellipse cx="200" cy="185" rx="55" ry="50" fill="#478cbf"/>
                    <circle cx="175" cy="168" r="14" fill="white"/>
                    <circle cx="225" cy="168" r="14" fill="white"/>
                    <path d="M160 240 Q200 275 240 240 L245 265 Q200 305 155 265Z" fill="white" opacity="0.95"/>
                  </svg>
                }
                glowColor={isDark?'#478cbf':'#2a6496'}
                glowColor2={isDark?'#2a6496':'#1a4a70'}
                accentText={isDark?'#6cb6ff':'#0366d6'}
                onPlay={onOpenGodotArena}
                isDark={isDark}
              />
            </div>

            {/* Stats bar */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 18 }}>
              {[
                { icon: <Users size={13} color={accent} />, val: leaderboard.length, label: 'jogadores' },
                { icon: <Star size={13} color={accentGd} />, val: '70+', label: 'casos' },
                { icon: <Zap size={13} color={accentRd} />, val: '60+', label: 'CSS desafios' },
                { icon: <Shield size={13} color={accent2} />, val: 6, label: 'jogos' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', background: panelBg, border: `1px solid ${panelBd}`, borderRadius: 6, flexShrink: 0 }}>
                  {s.icon}
                  <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: mainText }}>{s.val}</span>
                  <span style={{ fontSize: 11, color: mutedText }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: SHOP ── */}
          <div style={{ width: 244, flexShrink: 0 }}>
            <ShopSidebar
              currentUser={currentUser}
              onBuy={buyCosmetic}
              onEquip={equipCosmetic}
              isDark={isDark}
              accent={accent}
              panelBg={panelBg}
              panelBd={panelBd}
              subText={subText}
              mutedText={mutedText}
              mainText={mainText}
            />
          </div>
        </div>
      </div>

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
