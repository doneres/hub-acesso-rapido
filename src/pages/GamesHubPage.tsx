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
  @keyframes scanV {
    from { top:-4px; } to { top:100%; }
  }
  @keyframes neonFlicker {
    0%,18%,20%,22%,52%,54%,100% {
      opacity:1;
      text-shadow:0 0 10px #00ffcc,0 0 22px #00ffcc,0 0 50px #00ffcc,0 0 90px #00ffcc44;
    }
    19%,21%,53% { opacity:0.5; text-shadow:none; }
  }
  @keyframes blink { 0%,49%{ opacity:1; } 50%,99%{ opacity:0; } }
  @keyframes floatUp {
    0%   { transform:translateY(0) scale(1); opacity:0.85; }
    100% { transform:translateY(-120px) scale(0); opacity:0; }
  }
  @keyframes cardGlow {
    0%,100% { box-shadow: 0 0 12px var(--gc), inset 0 0 18px var(--gi), 0 8px 40px rgba(0,0,0,.7); }
    50%     { box-shadow: 0 0 30px var(--gc), 0 0 55px var(--gc2), inset 0 0 28px var(--gi), 0 8px 40px rgba(0,0,0,.7); }
  }
  @keyframes slideUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideLeft { from{opacity:0;transform:translateX(-24px)} to{opacity:1;transform:translateX(0)} }
  @keyframes slideRight{ from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
  @keyframes rankIn    { from{opacity:0;transform:translateX(-14px)} to{opacity:1;transform:translateX(0)} }
  @keyframes podRise   { from{transform:scaleY(0);transform-origin:bottom} to{transform:scaleY(1);transform-origin:bottom} }
  @keyframes heroGlow  {
    0%,100%{ box-shadow:0 0 30px rgba(0,255,204,0.2),inset 0 0 40px rgba(0,255,204,0.06); }
    50%    { box-shadow:0 0 70px rgba(0,255,204,0.35),inset 0 0 80px rgba(0,255,204,0.12); }
  }
  @keyframes playBtn   { 0%,100%{letter-spacing:0.10em} 50%{letter-spacing:0.20em} }
  @keyframes coinPulse { 0%,100%{opacity:0.8;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
`;

/* ═══════════════════════════════════════════════════════════
   PARTICLES
═══════════════════════════════════════════════════════════ */
const PTCL = Array.from({ length: 30 }, (_, i) => ({
  id: i, left: `${(i * 17 + 3) % 97 + 1}%`,
  sz: (i % 3) + 1.5, dur: 6 + (i % 7), delay: -((i * 1.1) % 10),
  color: ['#00ffcc','#a78bfa','#f87171','#fbbf24','#60a5fa','#34d399','#fb7185'][i % 7],
}));

const AVATAR_COLORS = ['#ef4444','#f97316','#f59e0b','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#ec4899','#14b8a6','#6366f1','#84cc16','#dc2626'];

function strColor(s: string) {
  const c = ['#ef4444','#3b82f6','#22c55e','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#f97316'];
  let h = 0; for (let i=0;i<s.length;i++) h=h*31+s.charCodeAt(i);
  return c[Math.abs(h)%c.length];
}

function Avatar({ avatar, name, size=28 }: { avatar:string; name:string; size?:number }) {
  const color = avatar?.startsWith('#') ? avatar : strColor(name);
  return (
    <div style={{ width:size, height:size, background:color, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid rgba(255,255,255,0.25)', borderRadius:2 }}>
      <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:size*.34, color:'#fff', lineHeight:1 }}>{name.charAt(0).toUpperCase()}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   AUTH MODAL
═══════════════════════════════════════════════════════════ */
function AuthModal({ users, onLogin, onRegister, onClose, isDark }: {
  users:any[]; onLogin:(n:string,p:string)=>Promise<LoginResult>;
  onRegister:(n:string,av:string,p:string)=>Promise<string>;
  onClose:()=>void; isDark:boolean;
}) {
  const [mode,setMode] = useState<'login'|'register'>(users.length>0?'login':'register');
  const [name,setName] = useState('');
  const [pass,setPass] = useState('');
  const [pass2,setPass2] = useState('');
  const [av,setAv] = useState(AVATAR_COLORS[0]);
  const [err,setErr] = useState('');
  const [loading,setLoading] = useState(false);

  const acc = '#00ffcc';
  const mbg = isDark?'#070d1a':'#ffffff';
  const mtx = isDark?'#e2e8f0':'#1e293b';
  const msb = isDark?'#475569':'#64748b';
  const mib = isDark?'#060a14':'#f8fafc';
  const mbd = isDark?'rgba(0,255,204,0.25)':'rgba(0,0,0,0.18)';
  const inp: React.CSSProperties = { width:'100%', boxSizing:'border-box', padding:'9px 12px 9px 34px', background:mib, border:`1.5px solid ${mbd}`, color:mtx, fontSize:13, fontFamily:'inherit', outline:'none' };

  const doLogin = async () => {
    if (!name.trim()||!pass){setErr('Preencha usuário e senha.');return;}
    setLoading(true);setErr('');
    const r = await onLogin(name.trim(),pass);
    setLoading(false);
    if(r==='not-found'){setErr('Usuário não encontrado.');return;}
    if(r==='wrong-password'){setErr('Senha incorreta.');return;}
    onClose();
  };
  const doRegister = async () => {
    if(name.trim().length<3){setErr('Mínimo 3 caracteres.');return;}
    if(pass.length<4){setErr('Senha com 4+ caracteres.');return;}
    if(pass!==pass2){setErr('Senhas não coincidem.');return;}
    if(users.some((u:any)=>u.name.toLowerCase()===name.trim().toLowerCase())){setErr('Nome já em uso.');return;}
    setLoading(true);setErr('');
    await onRegister(name.trim(),av,pass);
    setLoading(false);onClose();
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:80, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(0,0,0,0.92)', backdropFilter:'blur(8px)' }}>
      <div style={{ width:'100%', maxWidth:400, background:mbg, border:'2px solid rgba(0,255,204,0.5)', boxShadow:'0 0 60px rgba(0,255,204,0.25),0 0 120px rgba(0,255,204,0.08)' }}>
        <div style={{ padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(0,255,204,0.07)', borderBottom:'2px solid rgba(0,255,204,0.2)' }}>
          <div>
            <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:7, color:'rgba(0,255,204,0.6)', marginBottom:6 }}>ARENA DE DESAFIOS</div>
            <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:11, color:acc }}>{mode==='login'?'IDENTIFICAÇÃO':'CRIAR CONTA'}</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:msb }}><X size={18}/></button>
        </div>
        {users.length>0&&(
          <div style={{ display:'flex', borderBottom:'2px solid rgba(0,255,204,0.12)' }}>
            {(['login','register'] as const).map(m=>(
              <button key={m} onClick={()=>{setMode(m);setErr('');}}
                style={{ flex:1, padding:'10px', border:'none', cursor:'pointer', background:mode===m?'rgba(0,255,204,0.08)':'transparent', borderBottom:mode===m?`2px solid ${acc}`:'2px solid transparent', fontFamily:"'Press Start 2P',monospace", fontSize:8, color:mode===m?acc:msb }}>
                {m==='login'?'ENTRAR':'CADASTRAR'}
              </button>
            ))}
          </div>
        )}
        <div style={{ padding:18, display:'flex', flexDirection:'column', gap:13 }}>
          {mode==='register'&&(
            <div>
              <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:8, color:msb, marginBottom:8 }}>AVATAR</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:5 }}>
                {AVATAR_COLORS.map(a=>(
                  <button key={a} onClick={()=>setAv(a)} style={{ height:36, background:av===a?'rgba(0,255,204,0.12)':'rgba(255,255,255,0.03)', border:`1.5px solid ${av===a?acc:'rgba(255,255,255,0.08)'}`, cursor:'pointer', transform:av===a?'translateY(-2px)':'none', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <div style={{ width:22, height:22, background:a, border:'2px solid rgba(255,255,255,0.3)' }}/>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:8, color:msb, marginBottom:7 }}>USUÁRIO</div>
            <div style={{ position:'relative' }}>
              <User size={13} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:msb }}/>
              <input value={name} onChange={e=>{setName(e.target.value);setErr('');}} placeholder="Seu nome" maxLength={20} style={inp} onFocus={e=>(e.currentTarget.style.borderColor=acc)} onBlur={e=>(e.currentTarget.style.borderColor=mbd)}/>
            </div>
          </div>
          <div>
            <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:8, color:msb, marginBottom:7 }}>SENHA</div>
            <div style={{ position:'relative' }}>
              <Lock size={13} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:msb }}/>
              <input type="password" value={pass} onChange={e=>{setPass(e.target.value);setErr('');}} placeholder="Mínimo 4 caracteres" style={inp} onFocus={e=>(e.currentTarget.style.borderColor=acc)} onBlur={e=>(e.currentTarget.style.borderColor=mbd)} onKeyDown={e=>e.key==='Enter'&&(mode==='login'?doLogin():doRegister())}/>
            </div>
          </div>
          {mode==='register'&&(
            <div>
              <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:8, color:msb, marginBottom:7 }}>CONFIRMAR</div>
              <div style={{ position:'relative' }}>
                <Lock size={13} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:msb }}/>
                <input type="password" value={pass2} onChange={e=>{setPass2(e.target.value);setErr('');}} placeholder="Repita a senha" style={inp} onFocus={e=>(e.currentTarget.style.borderColor=acc)} onBlur={e=>(e.currentTarget.style.borderColor=mbd)} onKeyDown={e=>e.key==='Enter'&&doRegister()}/>
              </div>
            </div>
          )}
          {err&&<div style={{ padding:'8px 12px', background:'rgba(239,68,68,0.12)', border:'1.5px solid #ef4444', fontSize:12, color:'#ef4444' }}>{err}</div>}
          <button onClick={mode==='login'?doLogin:doRegister} disabled={loading}
            style={{ padding:'12px', border:'none', cursor:loading?'not-allowed':'pointer', background:loading?'#1e2a3a':'linear-gradient(135deg,#00ffcc,#00ccaa)', color:'#060a14', fontFamily:"'Press Start 2P',monospace", fontSize:10, fontWeight:900, opacity:loading?0.7:1, boxShadow:loading?'none':'0 0 30px rgba(0,255,204,0.5),4px 4px 0 rgba(0,255,204,0.2)', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
            {loading?'AGUARDE...' : mode==='login'?<><LogIn size={14}/> ENTRAR</>:<><UserPlus size={14}/> CRIAR CONTA</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   RANK ROW
═══════════════════════════════════════════════════════════ */
function RankRow({ rank, user, isMe }: { rank:number; user:any; isMe:boolean }) {
  const medal =
    rank===1 ? <Crown size={12} color="#fbbf24"/> :
    rank===2 ? <Medal size={12} color="#94a3b8"/> :
    rank===3 ? <Medal size={12} color="#cd7c0f"/> :
    <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:7, color:'#334155', minWidth:16, textAlign:'center', display:'inline-block' }}>#{rank}</span>;

  return (
    <div style={{
      display:'flex', alignItems:'center', gap:7, padding:'6px 8px',
      background: isMe?'rgba(0,255,204,0.08)':'transparent',
      borderLeft: rank<=3 ? `3px solid ${rank===1?'#fbbf24':rank===2?'#94a3b8':'#cd7c0f'}` : '3px solid transparent',
      borderRadius:2, animation:`rankIn .3s ease ${Math.min(rank*.03,.45)}s both`,
    }}>
      <div style={{ width:18, display:'flex', justifyContent:'center', flexShrink:0 }}>{medal}</div>
      <Avatar avatar={user.avatar} name={user.name} size={22}/>
      <span style={{ flex:1, fontSize:11, fontWeight:700, color:isMe?'#00ffcc':'#cbd5e1', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
        {user.name}{isMe?' ★':''}
      </span>
      <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:7, color:rank<=3?'#fbbf24':'#475569', flexShrink:0 }}>
        {user.points.toLocaleString('pt-BR')}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PODIUM
═══════════════════════════════════════════════════════════ */
function Podium({ top3 }: { top3:any[] }) {
  if (!top3[0]) return null;
  const slots = [
    { p:top3[1], rank:2, h:50, color:'#94a3b8', icon:<Medal size={13} color="#94a3b8"/> },
    { p:top3[0], rank:1, h:66, color:'#fbbf24', icon:<Crown  size={14} color="#fbbf24"/> },
    { p:top3[2], rank:3, h:34, color:'#cd7c0f', icon:<Medal size={13} color="#cd7c0f"/> },
  ];
  return (
    <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'center', gap:5, padding:'4px 2px' }}>
      {slots.map(({p,rank,h,color,icon})=>p?(
        <div key={rank} style={{ display:'flex', flexDirection:'column', alignItems:'center', flex:1 }}>
          <div style={{ marginBottom:4, position:'relative', display:'inline-block' }}>
            <Avatar avatar={p.avatar} name={p.name} size={rank===1?34:26}/>
            <div style={{ position:'absolute', top:-10, left:'50%', transform:'translateX(-50%)' }}>{icon}</div>
          </div>
          <div style={{ fontSize:9, color:'#94a3b8', maxWidth:56, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textAlign:'center', marginBottom:3 }}>{p.name}</div>
          <div style={{ width:'100%', height:h, background:`linear-gradient(180deg,${color}28,${color}0c)`, border:`1.5px solid ${color}55`, borderTopLeftRadius:4, borderTopRightRadius:4, display:'flex', alignItems:'center', justifyContent:'center', animation:`podRise .5s ease ${rank===1?0:rank===2?.1:.2}s both` }}>
            <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:8, color }}>{rank}º</span>
          </div>
        </div>
      ):<div key={rank} style={{flex:1}}/>)}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SHOP SIDEBAR
═══════════════════════════════════════════════════════════ */
function ShopSidebar({ currentUser, onBuy, onEquip }: {
  currentUser:GameUser|null;
  onBuy:(id:string,cost:number)=>boolean;
  onEquip:(id:string|null)=>void;
}) {
  const [fb, setFb] = useState<{msg:string;ok:boolean}|null>(null);
  const doFb = (msg:string,ok:boolean) => { setFb({msg,ok}); setTimeout(()=>setFb(null),2800); };
  const buy    = (c:CosmeticDef) => { const ok=onBuy(c.id,c.cost); doFb(ok?`${c.emoji} Comprado!`:'❌ Moedas insuficientes',ok); };
  const equip  = (c:CosmeticDef) => { onEquip(c.id); doFb(`${c.emoji} Equipado!`,true); };
  const unequip = () => { onEquip(null); doFb('🎨 Tema padrão restaurado.',true); };
  const activeId = currentUser?.activeCosmeticId;
  const owned    = (id:string) => currentUser?.purchasedCosmetics.includes(id)??false;

  return (
    <div style={{ animation:'slideRight .55s ease .15s both' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
        <ShoppingBag size={14} color="#fbbf24"/>
        <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:9, color:'#fbbf24', textShadow:'0 0 8px rgba(251,191,36,0.5)' }}>LOJA</span>
        <div style={{ flex:1, height:1, background:'linear-gradient(90deg,rgba(251,191,36,.5),transparent)' }}/>
      </div>

      {!currentUser ? (
        <div style={{ padding:'24px 14px', textAlign:'center', background:'rgba(251,191,36,0.04)', border:'1.5px solid rgba(251,191,36,0.15)', borderRadius:6 }}>
          <ShoppingBag size={24} color="rgba(251,191,36,0.3)" style={{marginBottom:10}}/>
          <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:7, color:'rgba(251,191,36,0.5)', marginBottom:8 }}>FAÇA LOGIN</div>
          <div style={{ fontSize:11, color:'#334155', lineHeight:1.6 }}>para acessar cosméticos e personalizar o Hub</div>
        </div>
      ) : (
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', marginBottom:12, background:'rgba(251,191,36,0.07)', border:'1.5px solid rgba(251,191,36,0.25)', borderRadius:6, animation:'coinPulse 2.5s ease-in-out infinite' }}>
            <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:7, color:'#475569' }}>SALDO</span>
            <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:10, color:'#fbbf24' }}>🪙 {currentUser.coins.toLocaleString('pt-BR')}</span>
          </div>

          {fb&&<div style={{ padding:'7px 10px', marginBottom:10, borderRadius:4, fontSize:11, background:fb.ok?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)', border:`1px solid ${fb.ok?'#22c55e44':'#ef444444'}`, color:fb.ok?'#22c55e':'#ef4444' }}>{fb.msg}</div>}

          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {COSMETICS.map(c=>{
              const isOwned  = owned(c.id);
              const isActive = activeId===c.id;
              const canBuy   = !isOwned&&(currentUser.coins>=c.cost);
              return (
                <div key={c.id} style={{ background:isActive?`${c.tagColor}10`:'rgba(255,255,255,0.02)', border:`1.5px solid ${isActive?c.tagColor+'55':'rgba(255,255,255,0.07)'}`, borderRadius:6, overflow:'hidden', boxShadow:isActive?`0 0 14px ${c.tagColor}33`:'none', transition:'all .15s' }}>
                  <div style={{ height:46, background:c.previewGradient, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 12px' }}>
                    <span style={{fontSize:22}}>{c.emoji}</span>
                    {isActive&&<span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:6, color:'#fff', background:c.tagColor, padding:'2px 5px' }}>ATIVO</span>}
                    {isOwned&&!isActive&&<span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:6, color:c.tagColor, border:`1px solid ${c.tagColor}`, padding:'2px 5px' }}>✓</span>}
                  </div>
                  <div style={{padding:'8px 10px'}}>
                    <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:6, color:c.tagColor, marginBottom:2 }}>{c.tag}</div>
                    <div style={{ fontSize:12, fontWeight:700, color:'#e2e8f0', marginBottom:6 }}>{c.name}</div>
                    {!isOwned?(
                      <button onClick={()=>buy(c)} disabled={!canBuy} style={{ width:'100%', padding:'6px 4px', background:canBuy?c.tagColor:'#1a2535', border:'none', borderRadius:3, color:canBuy?'#fff':'#334155', fontFamily:"'Press Start 2P',monospace", fontSize:7, cursor:canBuy?'pointer':'not-allowed', opacity:canBuy?1:.55, boxShadow:canBuy?`0 0 10px ${c.tagColor}44`:'none' }}>
                        {c.cost} moedas
                      </button>
                    ):isActive?(
                      <button onClick={unequip} style={{ width:'100%', padding:'6px 4px', background:'transparent', border:`1.5px solid ${c.tagColor}`, borderRadius:3, color:c.tagColor, fontFamily:"'Press Start 2P',monospace", fontSize:7, cursor:'pointer' }}>
                        ✓ RETIRAR
                      </button>
                    ):(
                      <button onClick={()=>equip(c)} style={{ width:'100%', padding:'6px 4px', background:c.tagColor, border:'none', borderRadius:3, color:'#fff', fontFamily:"'Press Start 2P',monospace", fontSize:7, cursor:'pointer', boxShadow:`0 0 10px ${c.tagColor}44` }}>
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
   GAME CARD
═══════════════════════════════════════════════════════════ */
function GameCard({ title, subtitle, desc, tags, icon, gc, gc2, onPlay, isDark = true }: {
  title:string; subtitle:string; desc:string; tags:string[];
  icon:React.ReactNode; gc:string; gc2:string; onPlay:()=>void; isDark?:boolean;
}) {
  const [hov,setHov] = useState(false);
  const cardBg = isDark
    ? `linear-gradient(145deg, ${gc}0f 0%, #070d1a 55%, ${gc2}0a 100%)`
    : `linear-gradient(145deg, ${gc}0a 0%, #ffffff 55%, ${gc2}06 100%)`;
  const titleCol = isDark ? '#e2e8f0' : '#1e293b';

  return (
    <div
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>setHov(false)}
      onClick={onPlay}
      style={{
        background:cardBg,
        border:`2px solid ${hov?gc:gc+'55'}`,
        cursor:'pointer', position:'relative', overflow:'hidden',
        transform:hov?'translateY(-6px) scale(1.012)':'none',
        transition:'all .22s cubic-bezier(0.4,0,0.2,1)',
        '--gc': gc+'66', '--gc2': gc2+'44', '--gi': gc+'08',
        animation:'cardGlow 3.5s ease-in-out infinite',
        borderRadius:4,
      } as React.CSSProperties}
    >
      {/* Top neon stripe */}
      <div style={{ height:3, background:`linear-gradient(90deg,transparent,${gc},${gc2},${gc},transparent)`, boxShadow:`0 0 10px ${gc}` }}/>

      {/* Scan sweep on hover */}
      {hov&&<div style={{ position:'absolute', left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${gc}88,transparent)`, zIndex:2, pointerEvents:'none', animation:'scanV 1.4s linear infinite' }}/>}

      {/* Grid texture */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', backgroundImage:`repeating-linear-gradient(60deg,${gc}05 0px,${gc}05 1px,transparent 1px,transparent 18px)`, opacity:hov?1:0.5, transition:'opacity .2s' }}/>

      {/* Corner brackets */}
      <div style={{ position:'absolute', top:0, right:0, width:24, height:24, borderBottom:`2px solid ${gc}44`, borderLeft:`2px solid ${gc}44`, pointerEvents:'none' }}/>
      <div style={{ position:'absolute', bottom:0, left:0, width:24, height:24, borderTop:`2px solid ${gc}44`, borderRight:`2px solid ${gc}44`, pointerEvents:'none' }}/>

      <div style={{ padding:'16px 16px 14px', position:'relative', zIndex:1 }}>
        {/* Icon + title */}
        <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:11 }}>
          <div style={{ width:50, height:50, flexShrink:0, background:`linear-gradient(135deg,${gc}22,${gc2}11)`, border:`2px solid ${gc}55`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:hov?`0 0 20px ${gc}66,inset 0 0 14px ${gc}22`:`0 0 6px ${gc}33`, transition:'box-shadow .2s', borderRadius:3 }}>
            {icon}
          </div>
          <div style={{minWidth:0,flex:1}}>
            <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:6, color:gc, marginBottom:5, letterSpacing:'0.08em', opacity:0.8 }}>{subtitle}</div>
            <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:9, color:titleCol, lineHeight:1.55, textShadow:hov?`0 0 8px ${gc}88`:'none', transition:'text-shadow .2s' }}>{title}</div>
          </div>
        </div>

        <div style={{ height:1, background:`linear-gradient(90deg,${gc}44,${gc2}22,transparent)`, marginBottom:10 }}/>

        <p style={{ fontSize:11.5, color:'#64748b', lineHeight:1.65, margin:'0 0 11px', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as any, overflow:'hidden' }}>{desc}</p>

        <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:13 }}>
          {tags.slice(0,3).map(t=>(
            <span key={t} style={{ padding:'2px 7px', fontSize:9, fontWeight:700, background:`${gc}15`, color:gc, border:`1px solid ${gc}30`, borderRadius:2, textShadow:hov?`0 0 6px ${gc}88`:'none' }}>{t}</span>
          ))}
        </div>

        <button
          onClick={e=>{e.stopPropagation();onPlay();}}
          style={{ width:'100%', padding:'11px', background:hov?`linear-gradient(135deg,${gc},${gc2})`:`linear-gradient(135deg,${gc}1a,${gc2}0d)`, border:`2px solid ${gc}`, color:hov?'#060a14':gc, fontFamily:"'Press Start 2P',monospace", fontSize:10, cursor:'pointer', letterSpacing:'0.10em', boxShadow:hov?`0 0 24px ${gc}66,0 0 48px ${gc}33,inset 0 0 14px ${gc}22`:`0 0 6px ${gc}33`, transition:'all .2s', animation:hov?'playBtn 1.3s ease-in-out infinite':'none', textShadow:hov?'none':`0 0 8px ${gc}88`, borderRadius:2 }}>
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
  onBackToHub:()=>void; onOpenDetetive:()=>void; onOpenCssBattle:()=>void;
  onOpenFlexRocket:()=>void; onOpenFlexTower:()=>void; onOpenReactBugHunter:()=>void;
  onOpenBlockCode:()=>void; onOpenGodotArena:()=>void; isDark?:boolean;
}

export default function GamesHubPage({
  onBackToHub, onOpenDetetive, onOpenCssBattle, onOpenFlexRocket, onOpenFlexTower,
  onOpenReactBugHunter, onOpenBlockCode, onOpenGodotArena, isDark = true,
}: GamesHubPageProps) {
  const { currentUser, leaderboard, users, login, registerUser, logout, buyCosmetic, equipCosmetic } = useGameState();
  const [showAuth,setShowAuth] = useState(false);

  const myRank = currentUser ? leaderboard.findIndex(u=>u.id===currentUser.id)+1 : 0;
  const top3   = leaderboard.slice(0,3);

  // Theme variables — respects global isDark setting
  const pageBg   = isDark ? '#040810' : '#f0f4f8';
  const pageCol  = isDark ? '#e2e8f0' : '#1e293b';
  const cardBg   = isDark ? '#070d1a' : '#ffffff';
  const subCol   = isDark ? '#64748b' : '#475569';
  const heroBg   = isDark ? 'linear-gradient(180deg,rgba(0,255,204,0.04) 0%,rgba(0,0,0,0.5) 100%)' : 'linear-gradient(180deg,rgba(0,255,204,0.08) 0%,rgba(240,244,248,0.97) 100%)';
  const rankBg   = isDark ? 'linear-gradient(180deg,rgba(251,191,36,0.04),rgba(0,0,0,0.4))' : 'linear-gradient(180deg,rgba(251,191,36,0.07),rgba(255,255,255,0.95))';

  return (
    <div style={{ minHeight:'100vh', background:pageBg, backgroundImage: isDark ? 'linear-gradient(rgba(0,255,204,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,204,0.025) 1px,transparent 1px)' : undefined, backgroundSize:'40px 40px', position:'relative', fontFamily:'system-ui,-apple-system,sans-serif', color:pageCol }}>
      <style>{ANIM}</style>

      {/* Dark-only ambient effects */}
      {isDark && <>
        <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:1, background:'radial-gradient(ellipse 70% 50% at 50% 30%,rgba(0,255,204,0.05) 0%,transparent 70%)' }}/>
        <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:2 }}>
          {PTCL.map(p=>(
            <div key={p.id} style={{ position:'absolute', left:p.left, bottom:'3%', width:p.sz, height:p.sz, borderRadius:'50%', background:p.color, boxShadow:`0 0 ${p.sz*4}px ${p.color}`, animation:`floatUp ${p.dur}s linear ${p.delay}s infinite` }}/>
          ))}
        </div>
        <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:3, background:'radial-gradient(ellipse at center,transparent 30%,rgba(0,0,0,0.8) 100%)' }}/>
        <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:4, backgroundImage:'linear-gradient(transparent 50%,rgba(0,0,0,0.04) 50%)', backgroundSize:'100% 3px', opacity:0.4 }}/>
      </>}

      {/* ═══ CONTENT ═══ */}
      <div style={{ position:'relative', zIndex:10, maxWidth:1400, margin:'0 auto', padding:'0 16px 60px' }}>

        {/* HEADER */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom:'1px solid rgba(0,255,204,0.1)', marginBottom:22, flexWrap:'wrap', gap:10 }}>
          <button
            onClick={onBackToHub}
            style={{ display:'flex', alignItems:'center', gap:7, background:'none', border:'1.5px solid rgba(0,255,204,0.2)', color:'#475569', cursor:'pointer', padding:'7px 13px', fontFamily:"'Press Start 2P',monospace", fontSize:8, transition:'all .15s' }}
            onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.color='#00ffcc';el.style.borderColor='#00ffcc';el.style.boxShadow='0 0 14px rgba(0,255,204,0.3)';}}
            onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.color='#475569';el.style.borderColor='rgba(0,255,204,0.2)';el.style.boxShadow='none';}}
          >
            <ChevronLeft size={13}/> VOLTAR AO HUB
          </button>

          {currentUser ? (
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 14px', background:'rgba(0,255,204,0.06)', border:'1.5px solid rgba(0,255,204,0.2)', boxShadow:'0 0 14px rgba(0,255,204,0.1)' }}>
                <Avatar avatar={currentUser.avatar} name={currentUser.name} size={30}/>
                <div>
                  <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:8, color:'#00ffcc', textShadow:'0 0 8px rgba(0,255,204,0.5)' }}>{currentUser.name}</div>
                  <div style={{ fontSize:11, color:'#475569', marginTop:2 }}>
                    <span style={{ color:'#fbbf24', fontWeight:700 }}>{currentUser.points.toLocaleString('pt-BR')}</span> pts
                    &nbsp;·&nbsp;<span style={{ color:'#a78bfa', fontWeight:700 }}>{currentUser.coins.toLocaleString('pt-BR')}</span> moedas
                    {myRank>0&&<>&nbsp;·&nbsp;<span style={{ color:'#00ffcc', fontWeight:700 }}>#{myRank}</span></>}
                  </div>
                </div>
              </div>
              <button onClick={logout} style={{ display:'flex', alignItems:'center', gap:5, background:'none', border:'1.5px solid rgba(239,68,68,0.3)', color:'#f87171', cursor:'pointer', padding:'7px 11px', fontSize:11 }} onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(239,68,68,0.1)'} onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='none'}>
                <LogOut size={12}/> Sair
              </button>
            </div>
          ) : (
            <button onClick={()=>setShowAuth(true)} style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(0,255,204,0.08)', border:'2px solid rgba(0,255,204,0.4)', color:'#00ffcc', cursor:'pointer', padding:'8px 18px', fontFamily:"'Press Start 2P',monospace", fontSize:9, boxShadow:'0 0 20px rgba(0,255,204,0.2)', transition:'all .15s' }} onMouseEnter={e=>(e.currentTarget as HTMLElement).style.boxShadow='0 0 35px rgba(0,255,204,0.4)'} onMouseLeave={e=>(e.currentTarget as HTMLElement).style.boxShadow='0 0 20px rgba(0,255,204,0.2)'}>
              <LogIn size={13}/> ENTRAR / CRIAR CONTA
            </button>
          )}
        </div>

        {/* 3-COL BODY */}
        <div style={{ display:'flex', gap:16, alignItems:'flex-start' }}>

          {/* LEFT: RANKING */}
          <div style={{ width:248, flexShrink:0, animation:'slideLeft .5s ease .1s both' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
              <Trophy size={14} color="#fbbf24"/>
              <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:9, color:'#fbbf24', textShadow:'0 0 8px rgba(251,191,36,0.5)' }}>CAMPEÕES</span>
              <div style={{ flex:1, height:1, background:'linear-gradient(90deg,rgba(251,191,36,0.5),transparent)' }}/>
            </div>

            <div style={{ background:rankBg, border:'1.5px solid rgba(251,191,36,0.18)', borderRadius:6, overflow:'hidden', boxShadow:'0 0 20px rgba(251,191,36,0.07)' }}>
              {leaderboard.length===0 ? (
                <div style={{ padding:'28px 16px', textAlign:'center' }}>
                  <Trophy size={28} color="rgba(251,191,36,0.2)" style={{marginBottom:10}}/>
                  <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:7, color:'#334155', marginBottom:8 }}>SEM JOGADORES</div>
                  <div style={{ fontSize:12, color:'#334155' }}>Seja o primeiro!</div>
                </div>
              ) : (
                <>
                  {top3.length>=1&&(
                    <div style={{ padding:'14px 10px 10px', borderBottom:'1px solid rgba(251,191,36,0.12)' }}>
                      <Podium top3={top3}/>
                    </div>
                  )}
                  <div style={{ padding:'6px 4px', maxHeight:440, overflowY:'auto' }}>
                    {leaderboard.slice(0,20).map((u,i)=>(
                      <RankRow key={u.id} rank={i+1} user={u} isMe={currentUser?.id===u.id}/>
                    ))}
                    {currentUser&&myRank>20&&(
                      <>
                        <div style={{ textAlign:'center', padding:'4px', color:'#334155', fontSize:10 }}>• • •</div>
                        <RankRow rank={myRank} user={currentUser} isMe={true}/>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {!currentUser&&(
              <div style={{ marginTop:12, padding:'14px', textAlign:'center', background:'rgba(0,255,204,0.04)', border:'1.5px solid rgba(0,255,204,0.15)', borderRadius:6 }}>
                <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:7, color:'#00ffcc', marginBottom:8 }}>ENTRE NO RANKING</div>
                <button onClick={()=>setShowAuth(true)} style={{ padding:'8px 14px', background:'linear-gradient(135deg,#00ffcc,#00ccaa)', border:'none', color:'#060a14', fontFamily:"'Press Start 2P',monospace", fontSize:7, cursor:'pointer', boxShadow:'0 0 16px rgba(0,255,204,0.4)' }}>
                  CRIAR CONTA
                </button>
              </div>
            )}
          </div>

          {/* CENTER */}
          <div style={{ flex:1, minWidth:0, animation:'slideUp .45s ease .05s both' }}>

            {/* HERO */}
            <div style={{ textAlign:'center', marginBottom:20, padding:'28px 24px 22px', background:heroBg, border:'2px solid rgba(0,255,204,0.15)', position:'relative', overflow:'hidden', animation:'heroGlow 4.5s ease-in-out infinite', borderRadius:4 }}>
              {[{top:0,left:0},{top:0,right:0},{bottom:0,left:0},{bottom:0,right:0}].map((pos,i)=>(
                <div key={i} style={{ position:'absolute', ...pos, width:20, height:20, borderColor:'rgba(0,255,204,0.5)', borderStyle:'solid', borderWidth:0, ...(i===0?{borderTopWidth:2,borderLeftWidth:2}:i===1?{borderTopWidth:2,borderRightWidth:2}:i===2?{borderBottomWidth:2,borderLeftWidth:2}:{borderBottomWidth:2,borderRightWidth:2}), pointerEvents:'none' }}/>
              ))}
              <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:'linear-gradient(90deg,transparent,rgba(0,255,204,0.03),transparent)', animation:'scanV 6s linear infinite' }}/>
              <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:7, color:'rgba(0,255,204,0.4)', letterSpacing:'0.25em', marginBottom:14 }}>CTRL + PLAY · TURMAS</div>
              <h1 style={{ fontFamily:"'Press Start 2P',monospace", fontSize:'clamp(22px,3.5vw,34px)', color:'#00ffcc', margin:'0 0 4px', lineHeight:1.4, animation:'neonFlicker 8s ease-in-out infinite' }}>ARENA DE</h1>
              <h1 style={{ fontFamily:"'Press Start 2P',monospace", fontSize:'clamp(22px,3.5vw,34px)', color:'#00ffcc', margin:'0 0 16px', lineHeight:1.4, animation:'neonFlicker 8s ease-in-out 1s infinite' }}>DESAFIOS</h1>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12 }}>
                <div style={{ flex:1, height:1, background:'linear-gradient(90deg,transparent,rgba(167,139,250,0.5))' }}/>
                <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:10, color:'#a78bfa', animation:'blink 1.1s step-end infinite', letterSpacing:'0.14em', textShadow:'0 0 10px rgba(167,139,250,0.6)' }}>★ SELECIONE SEU DESAFIO ★</div>
                <div style={{ flex:1, height:1, background:'linear-gradient(90deg,rgba(167,139,250,0.5),transparent)' }}/>
              </div>
            </div>

            {/* GAME GRID */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <GameCard title="DETETIVE DE CÓDIGO" subtitle="MODO SOLO"
                desc="Resolva casos de lógica, programação e matemática. Avance por níveis e conquiste o topo."
                tags={['Lógica','Algoritmos','70+ casos']}
                icon={<Search size={26} color="#a78bfa"/>}
                gc="#a78bfa" gc2="#7c3aed" isDark={isDark} onPlay={onOpenDetetive}/>
              <GameCard title="CSS BATTLE" subtitle="SOLO & MULTIPLAYER"
                desc="Recrie layouts com CSS puro contra o relógio. Batalhas em tempo real contra outros jogadores."
                tags={['CSS','Multiplayer','60+ desafios']}
                icon={<Swords size={26} color="#f87171"/>}
                gc="#f87171" gc2="#ef4444" isDark={isDark} onPlay={onOpenCssBattle}/>
              <GameCard title="FOGUETES NA ÓRBITA" subtitle="TUTORIAL FLEXBOX"
                desc="Guie foguetes para estações espaciais aprendendo CSS Flexbox. 15 missões progressivas."
                tags={['Flexbox','CSS','15 missões']}
                icon={
                  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                    <path d="M13 2C13 2 18 6 18 13C18 17 16 20 13 22C10 20 8 17 8 13C8 6 13 2 13 2Z" fill="#00ffcc" opacity="0.9"/>
                    <rect x="11" y="12" width="4" height="8" rx="1" fill="#00ffcc"/>
                    <path d="M9 18L6 22L10 21Z" fill="#fbbf24"/>
                    <path d="M17 18L20 22L16 21Z" fill="#fbbf24"/>
                    <circle cx="13" cy="10" r="2" fill="#fff" opacity="0.7"/>
                    <path d="M10 22L13 25L16 22" stroke="#f87171" strokeWidth="1.5" fill="none"/>
                  </svg>
                }
                gc="#00ffcc" gc2="#00ccaa" isDark={isDark} onPlay={onOpenFlexRocket}/>
              <GameCard title="FLEX TOWER DEFENSE" subtitle="TOWER DEFENSE FLEXBOX"
                desc="Posicione torres usando CSS Flexbox para defender sua base de ondas de invasores."
                tags={['Flexbox','Tower Defense','6 níveis']}
                icon={
                  <svg width="26" height="26" viewBox="0 0 58 62" fill="none">
                    <rect x="10" y="44" width="38" height="16" rx="2" fill="#0d1a2b" stroke="#34d399" strokeWidth="2"/>
                    <rect x="16" y="22" width="26" height="26" rx="2" fill="#0d1a2b" stroke="#34d399" strokeWidth="2"/>
                    <rect x="26" y="4" width="6" height="22" rx="2" fill="#34d399" opacity="0.9"/>
                    <circle cx="20" cy="32" r="3" fill="#34d399" opacity="0.6"/>
                    <circle cx="38" cy="32" r="3" fill="#34d399" opacity="0.6"/>
                  </svg>
                }
                gc="#34d399" gc2="#059669" isDark={isDark} onPlay={onOpenFlexTower}/>
              <GameCard title="REACT BUG HUNTER" subtitle="PRÁTICA REACT"
                desc="Encontre e corrija bugs reais em componentes React. Veja o resultado ao vivo enquanto resolve."
                tags={['React','Bugs','20 desafios']}
                icon={<Bug size={26} color="#61dafb"/>}
                gc="#61dafb" gc2="#38bdf8" isDark={isDark} onPlay={onOpenReactBugHunter}/>
              <GameCard title="BLOCOS DE CÓDIGO" subtitle="TURMAS CK"
                desc="Monte programas com blocos e guie o Steve pelo Minecraft! Lógica, loops e condicionais."
                tags={['Blocos','Lógica','CK']}
                icon={<Cpu size={26} color="#5D9E40"/>}
                gc="#5D9E40" gc2="#3a6e22" isDark={isDark} onPlay={onOpenBlockCode}/>
              <GameCard title="GODOT ARENA" subtitle="QUIZ MULTIPLAYER — CT"
                desc="Quiz de GDScript em tempo real! Crie uma sala e desafie a turma. Solo ou em grupo."
                tags={['GDScript','Multiplayer','CT']}
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
                gc="#478cbf" gc2="#2a6496" isDark={isDark} onPlay={onOpenGodotArena}/>
            </div>

            {/* Stats */}
            <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap', marginTop:16 }}>
              {[
                { icon:<Users size={13} color="#00ffcc"/>, val:leaderboard.length, label:'jogadores', gc:'#00ffcc' },
                { icon:<Star  size={13} color="#fbbf24"/>, val:'70+', label:'casos',        gc:'#fbbf24' },
                { icon:<Zap   size={13} color="#f87171"/>, val:'60+', label:'CSS desafios', gc:'#f87171' },
                { icon:<Shield size={13} color="#a78bfa"/>, val:7,    label:'jogos',        gc:'#a78bfa' },
              ].map(s=>(
                <div key={s.label} style={{ display:'flex', alignItems:'center', gap:7, padding:'7px 14px', background:`${s.gc}08`, border:`1px solid ${s.gc}30`, borderRadius:4, flexShrink:0, boxShadow:`0 0 8px ${s.gc}18` }}>
                  {s.icon}
                  <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:9, color:s.gc, textShadow:`0 0 8px ${s.gc}66` }}>{s.val}</span>
                  <span style={{ fontSize:11, color:'#475569' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: SHOP */}
          <div style={{ width:248, flexShrink:0 }}>
            <ShopSidebar currentUser={currentUser} onBuy={buyCosmetic} onEquip={equipCosmetic}/>
          </div>
        </div>
      </div>

      {showAuth&&(
        <AuthModal users={users} onLogin={login} onRegister={registerUser} onClose={()=>setShowAuth(false)} isDark={isDark}/>
      )}
    </div>
  );
}
