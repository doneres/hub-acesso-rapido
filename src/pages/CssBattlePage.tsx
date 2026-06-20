import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft, Copy, Check, RefreshCw, Zap, Trophy, Clock,
  Lightbulb, ChevronDown, ChevronUp, Play, Swords, Home,
  Link, Gamepad2, Crown, Eye, Code2, Circle, Square,
  Palette, AlignCenter, MousePointer, User, LayoutGrid,
  RotateCw, Users, Star, X, TrendingUp, type LucideIcon
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { db } from '../lib/firebase';
import { ref, set, update, onValue, get } from 'firebase/database';

/* ── Types ─────────────────────────────────────────────────────────────── */

interface Challenge {
  id: number;
  title: string;
  Icon: LucideIcon;
  iconColor: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  points: number;
  description: string;
  hint: string;
  htmlStructure: string;
  targetHtml: string;
  targetCss: string;
  starterCss: string;
}

type PageView = 'menu' | 'setup' | 'lobby' | 'battle' | 'results';
type GameMode = 'create' | 'join' | 'solo';

interface PlayerData { name: string; score: number; submittedAt: number; }
interface ScoreDetail { label: string; passed: boolean; weight: number; }

/* ── Challenges ─────────────────────────────────────────────────────────── */

const CHALLENGES: Challenge[] = [
  {
    id: 0, title: 'Círculo Vermelho', Icon: Circle, iconColor: '#ef4444',
    difficulty: 'Fácil', points: 100,
    description: 'Crie um círculo vermelho de 100×100px usando CSS puro.',
    hint: 'Dica: todo círculo começa como um quadrado. Use border-radius: 50% para arredondar completamente, e background-color para definir a cor vermelha.',
    htmlStructure: '<div class="shape"></div>',
    targetHtml: '<div class="shape"></div>',
    targetCss: `.shape { width: 100px; height: 100px; background-color: #e74c3c; border-radius: 50%; }`,
    starterCss: `.shape {\n  width: 100px;\n  height: 100px;\n  background-color: /* ex: #e74c3c */;\n  border-radius: /* ex: 50% */;\n}`,
  },
  {
    id: 1, title: 'Quadrado com Sombra', Icon: Square, iconColor: '#3b82f6',
    difficulty: 'Fácil', points: 150,
    description: 'Crie um quadrado azul de 100×100px com sombra ao redor.',
    hint: 'Dica: box-shadow aceita 4 valores — deslocamento X, deslocamento Y, desfoque e cor. Ex: box-shadow: 6px 6px 15px rgba(0,0,0,0.4)',
    htmlStructure: '<div class="box"></div>',
    targetHtml: '<div class="box"></div>',
    targetCss: `.box { width: 100px; height: 100px; background-color: #3498db; box-shadow: 6px 6px 15px rgba(0,0,0,0.4); }`,
    starterCss: `.box {\n  width: 100px;\n  height: 100px;\n  background-color: /* ex: #3498db */;\n  box-shadow: /* ex: 6px 6px 15px rgba(0,0,0,0.4) */;\n}`,
  },
  {
    id: 2, title: 'Gradiente Colorido', Icon: Palette, iconColor: '#f59e0b',
    difficulty: 'Fácil', points: 150,
    description: 'Crie um retângulo com gradiente linear do laranja ao vermelho.',
    hint: 'Dica: background: linear-gradient(ângulo, cor1, cor2). Use 135deg como ângulo. Cores sugeridas: #f39c12 e #e74c3c.',
    htmlStructure: '<div class="card"></div>',
    targetHtml: '<div class="card"></div>',
    targetCss: `.card { width: 200px; height: 100px; background: linear-gradient(135deg, #f39c12, #e74c3c); border-radius: 12px; }`,
    starterCss: `.card {\n  width: 200px;\n  height: 100px;\n  border-radius: 12px;\n  background: linear-gradient(/* ângulo */, /* cor1 */, /* cor2 */);\n}`,
  },
  {
    id: 3, title: 'Texto Centralizado', Icon: AlignCenter, iconColor: '#8b5cf6',
    difficulty: 'Médio', points: 200,
    description: 'Centralize o texto "CSS Battle!" dentro de uma caixa escura, horizontal e verticalmente.',
    hint: 'Dica: adicione display: flex no .box. Depois use justify-content: center (horizontal) e align-items: center (vertical). O texto .text deve ter color: white.',
    htmlStructure: '<div class="box">\n  <span class="text">CSS Battle!</span>\n</div>',
    targetHtml: '<div class="box"><span class="text">CSS Battle!</span></div>',
    targetCss: `.box { width: 200px; height: 100px; background: #2c3e50; display: flex; justify-content: center; align-items: center; border-radius: 8px; } .text { color: white; font-size: 18px; font-weight: bold; font-family: sans-serif; }`,
    starterCss: `.box {\n  width: 200px;\n  height: 100px;\n  background: #2c3e50;\n  border-radius: 8px;\n  display: /* flex */;\n  justify-content: /* center */;\n  align-items: /* center */;\n}\n.text {\n  color: /* white */;\n  font-size: 18px;\n  font-weight: bold;\n  font-family: sans-serif;\n}`,
  },
  {
    id: 4, title: 'Botão Estilizado', Icon: MousePointer, iconColor: '#22c55e',
    difficulty: 'Médio', points: 200,
    description: 'Estilize o botão: fundo verde, texto branco, sem borda padrão, cantos arredondados.',
    hint: 'Dica: botões HTML têm uma borda padrão — remova-a com border: none. Use background-color verde, color white, e border-radius para arredondar.',
    htmlStructure: '<button class="btn">Clique aqui!</button>',
    targetHtml: '<button class="btn">Clique aqui!</button>',
    targetCss: `.btn { background-color: #27ae60; color: white; border: none; padding: 14px 28px; border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: bold; font-family: sans-serif; }`,
    starterCss: `.btn {\n  background-color: /* ex: #27ae60 */;\n  color: /* white */;\n  border: /* none */;\n  padding: 14px 28px;\n  border-radius: /* ex: 8px */;\n  font-size: 16px;\n  font-family: sans-serif;\n  cursor: pointer;\n}`,
  },
  {
    id: 5, title: 'Card de Perfil', Icon: User, iconColor: '#6366f1',
    difficulty: 'Médio', points: 250,
    description: 'Monte um card com avatar circular (texto "JS") e nome "JavaScript" abaixo.',
    hint: 'Dica: use flex-direction: column no .card para empilhar verticalmente. No .avatar, use border-radius: 50% para tornar circular e um gradient como background.',
    htmlStructure: '<div class="card">\n  <div class="avatar">JS</div>\n  <p class="name">JavaScript</p>\n</div>',
    targetHtml: '<div class="card"><div class="avatar">JS</div><p class="name">JavaScript</p></div>',
    targetCss: `.card { width: 140px; padding: 24px 16px; background: #1a1a2e; border-radius: 16px; display: flex; flex-direction: column; align-items: center; gap: 12px; } .avatar { width: 60px; height: 60px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px; font-family: sans-serif; } .name { color: white; font-weight: bold; margin: 0; font-family: sans-serif; }`,
    starterCss: `.card {\n  width: 140px;\n  padding: 24px 16px;\n  background: #1a1a2e;\n  border-radius: 16px;\n  display: flex;\n  flex-direction: /* column */;\n  align-items: /* center */;\n  gap: 12px;\n}\n.avatar {\n  width: 60px;\n  height: 60px;\n  background: linear-gradient(135deg, #667eea, #764ba2);\n  border-radius: /* 50% */;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: white;\n  font-size: 18px;\n  font-family: sans-serif;\n}\n.name {\n  color: /* white */;\n  font-weight: bold;\n  margin: 0;\n  font-family: sans-serif;\n}`,
  },
  {
    id: 6, title: 'Grid 2×2', Icon: LayoutGrid, iconColor: '#14b8a6',
    difficulty: 'Difícil', points: 300,
    description: 'Organize as 4 células coloridas em uma grade 2×2 usando CSS Grid.',
    hint: 'Dica: use display: grid no .grid e defina grid-template-columns: 1fr 1fr para criar 2 colunas de tamanho igual. O gap define o espaço entre as células.',
    htmlStructure: '<div class="grid">\n  <div class="cell" style="background:#e74c3c"></div>\n  <div class="cell" style="background:#3498db"></div>\n  <div class="cell" style="background:#2ecc71"></div>\n  <div class="cell" style="background:#f39c12"></div>\n</div>',
    targetHtml: '<div class="grid"><div class="cell" style="background:#e74c3c"></div><div class="cell" style="background:#3498db"></div><div class="cell" style="background:#2ecc71"></div><div class="cell" style="background:#f39c12"></div></div>',
    targetCss: `.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 180px; } .cell { height: 80px; border-radius: 8px; }`,
    starterCss: `.grid {\n  width: 180px;\n  display: /* grid */;\n  grid-template-columns: /* 1fr 1fr */;\n  gap: 8px;\n}\n.cell {\n  height: 80px;\n  border-radius: 8px;\n}`,
  },
  {
    id: 7, title: 'Spinner Animado', Icon: RotateCw, iconColor: '#f97316',
    difficulty: 'Difícil', points: 300,
    description: 'Crie um spinner circular girando continuamente com animação CSS.',
    hint: 'Dica: use border com border-top-color diferente (azul) para o efeito. Crie @keyframes com transform: rotate(360deg) e aplique com animation: spin 1s linear infinite.',
    htmlStructure: '<div class="spinner"></div>',
    targetHtml: '<div class="spinner"></div>',
    targetCss: `.spinner { width: 60px; height: 60px; border: 6px solid rgba(52,152,219,0.2); border-top-color: #3498db; border-radius: 50%; animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`,
    starterCss: `.spinner {\n  width: 60px;\n  height: 60px;\n  border: 6px solid rgba(52, 152, 219, 0.2);\n  border-top-color: #3498db;\n  border-radius: 50%;\n  animation: /* spin 1s linear infinite */;\n}\n@keyframes spin {\n  to { transform: /* rotate(360deg) */; }\n}`,
  },
];

/* ── Scoring ─────────────────────────────────────────────────────────────── */

function parseRgb(s: string): [number, number, number] | null {
  const m = s.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
  return m ? [+m[1], +m[2], +m[3]] : null;
}
function colorNear(a: string, r: number, g: number, b: number, t = 45): boolean {
  const v = parseRgb(a); if (!v) return false;
  return Math.abs(v[0]-r)<=t && Math.abs(v[1]-g)<=t && Math.abs(v[2]-b)<=t;
}
function px(v: string): number { return parseFloat(v) || 0; }

function calcScore(cid: number, iframe: HTMLIFrameElement): { score: number; details: ScoreDetail[] } {
  const doc = iframe.contentDocument; const win = iframe.contentWindow;
  if (!doc || !win) return { score: 0, details: [] };
  const gs = (sel: string, prop: string) => {
    const el = doc.querySelector(sel);
    return el ? win.getComputedStyle(el).getPropertyValue(prop).trim() : '';
  };
  const details: ScoreDetail[] = [];
  const add = (label: string, pass: boolean, weight: number) => details.push({ label, passed: pass, weight });

  switch (cid) {
    case 0:
      add('border-radius circular (50%)', px(gs('.shape','border-radius'))>=40, 35);
      add('cor vermelha (background-color)', colorNear(gs('.shape','background-color'),231,76,60), 35);
      add('width >= 60px', px(gs('.shape','width'))>=60, 15);
      add('height >= 60px', px(gs('.shape','height'))>=60, 15);
      break;
    case 1:
      add('cor azul (background-color)', colorNear(gs('.box','background-color'),52,152,219), 40);
      add('box-shadow aplicado', gs('.box','box-shadow')!=='none', 30);
      add('width >= 60px', px(gs('.box','width'))>=60, 15);
      add('height >= 60px', px(gs('.box','height'))>=60, 15);
      break;
    case 2: {
      const bi = gs('.card','background-image');
      add('linear-gradient aplicado', bi.includes('gradient'), 50);
      add('border-radius > 0', px(gs('.card','border-radius'))>0, 25);
      add('width >= 150px', px(gs('.card','width'))>=150, 25);
      break;
    }
    case 3:
      add('display: flex no .box', gs('.box','display')==='flex', 30);
      add('justify-content: center', gs('.box','justify-content')==='center', 20);
      add('align-items: center', gs('.box','align-items')==='center', 20);
      add('texto branco (.text)', colorNear(gs('.text','color'),255,255,255,30), 30);
      break;
    case 4:
      add('background verde', colorNear(gs('.btn','background-color'),39,174,96), 30);
      add('texto branco', colorNear(gs('.btn','color'),255,255,255,30), 20);
      add('border: none', gs('.btn','border-top-style')==='none', 20);
      add('border-radius > 0', px(gs('.btn','border-radius'))>0, 15);
      add('padding aplicado', px(gs('.btn','padding-top'))>=5, 15);
      break;
    case 5:
      add('.card display: flex', gs('.card','display')==='flex', 25);
      add('.card flex-direction: column', gs('.card','flex-direction')==='column', 25);
      add('.avatar border-radius: 50%', px(gs('.avatar','border-radius'))>=25, 25);
      add('.avatar com gradiente', gs('.avatar','background-image').includes('gradient'), 25);
      break;
    case 6:
      add('display: grid', gs('.grid','display')==='grid', 40);
      add('2 colunas (grid-template-columns)', gs('.grid','grid-template-columns').trim().split(/\s+/).length>=2, 30);
      add('.cell height >= 50px', px(gs('.cell','height'))>=50, 30);
      break;
    case 7:
      add('border-radius: 50%', px(gs('.spinner','border-radius'))>=25, 25);
      add('border definido', gs('.spinner','border-top-style')!=='none', 25);
      add('animation ativa', gs('.spinner','animation-name')!=='none', 50);
      break;
  }
  const total = details.reduce((s,d)=>s+d.weight,0);
  const earned = details.reduce((s,d)=>s+(d.passed?d.weight:0),0);
  return { score: total>0 ? Math.round((earned/total)*100) : 0, details };
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function genId() { return Math.random().toString(36).slice(2,10); }
function genCode() {
  const ch='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({length:4},()=>ch[Math.floor(Math.random()*ch.length)]).join('');
}
function buildDoc(html: string, css: string) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{box-sizing:border-box;}body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f0f0f0;}${css}</style></head><body>${html}</body></html>`;
}

const DIFF_COLOR: Record<string,string> = { Fácil:'#22c55e', Médio:'#f59e0b', Difícil:'#ef4444' };
const BATTLE_DURATION = 180;

/* ── Component ───────────────────────────────────────────────────────────── */

const CssBattlePage: React.FC<{ onBackToHub: () => void }> = ({ onBackToHub }) => {
  const { isDark } = useTheme();

  /* view state */
  const [view, setView]           = useState<PageView>('menu');
  const [mode, setMode]           = useState<GameMode>('create');
  const [showInstr, setShowInstr] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  /* form state */
  const [playerName, setPlayerName]       = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [maxPlayers, setMaxPlayers]       = useState<2|3|4>(2);
  const [selectedChallenge, setSelectedChallenge] = useState(0);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  /* game state */
  const [roomCode, setRoomCode]       = useState('');
  const [isHost, setIsHost]           = useState(false);
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [roomMaxPlayers, setRoomMaxPlayers] = useState(2);
  const [allPlayers, setAllPlayers]   = useState<Record<string, PlayerData>>({});
  const [playerCode, setPlayerCode]   = useState('');
  const [timeLeft, setTimeLeft]       = useState(BATTLE_DURATION);
  const [playerScore, setPlayerScore] = useState(-1);
  const [scoreDetails, setScoreDetails] = useState<ScoreDetail[]>([]);
  const [submitted, setSubmitted]     = useState(false);

  /* refs */
  const previewRef   = useRef<HTMLIFrameElement>(null);
  const targetRef    = useRef<HTMLIFrameElement>(null);
  const playerId     = useRef(genId());
  const unsubRef     = useRef<(()=>void)|null>(null);
  const timerRef     = useRef<ReturnType<typeof setInterval>|null>(null);
  const submittedRef = useRef(false);

  /* theme tokens */
  const bg      = isDark ? '#0f1117' : '#f8fafc';
  const card    = isDark ? '#1a1d2e' : '#ffffff';
  const border  = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)';
  const text    = isDark ? '#e2e8f0' : '#1e293b';
  const dim     = isDark ? '#64748b' : '#94a3b8';
  const inputBg = isDark ? '#0f1117' : '#f8fafc';

  const inputStyle: React.CSSProperties = {
    width:'100%', background:inputBg, border:`1px solid ${border}`,
    color:text, borderRadius:10, padding:'12px 14px', fontSize:14,
    outline:'none', boxSizing:'border-box',
  };

  /* ── preview (debounced) ── */
  useEffect(()=>{
    const t = setTimeout(()=>{
      if (previewRef.current)
        previewRef.current.srcdoc = buildDoc(CHALLENGES[challengeIdx].targetHtml, playerCode);
    }, 250);
    return ()=>clearTimeout(t);
  }, [playerCode, challengeIdx]);

  /* ── target iframe ── */
  useEffect(()=>{
    if (targetRef.current && view==='battle') {
      const ch = CHALLENGES[challengeIdx];
      targetRef.current.srcdoc = buildDoc(ch.targetHtml, ch.targetCss);
    }
  }, [challengeIdx, view]);

  /* ── cleanup ── */
  useEffect(()=>()=>{
    unsubRef.current?.();
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  /* ── timer ── */
  useEffect(()=>{
    if (view!=='battle') return;
    submittedRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(()=>{
      setTimeLeft(prev=>{
        if (prev<=1){ clearInterval(timerRef.current!); handleSubmit(); return 0; }
        return prev-1;
      });
    },1000);
    return ()=>{ if(timerRef.current) clearInterval(timerRef.current); };
  }, [view]);

  /* ── submit ── */
  const handleSubmit = useCallback(()=>{
    if (submittedRef.current) return;
    submittedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(()=>{
      const iframe = previewRef.current;
      if (!iframe) return;
      const { score, details } = calcScore(challengeIdx, iframe);
      setPlayerScore(score);
      setScoreDetails(details);
      setSubmitted(true);
      if (mode!=='solo' && roomCode) {
        update(ref(db,`rooms/${roomCode}/players/${playerId.current}`),
          { score, submittedAt: Date.now() });
      } else {
        setView('results');
      }
    }, 400);
  }, [challengeIdx, mode, roomCode]);

  /* ── Firebase subscribe ── */
  const subscribeRoom = useCallback((code: string)=>{
    unsubRef.current?.();
    const roomRef = ref(db,`rooms/${code}`);
    const unsub = onValue(roomRef, snap=>{
      const data = snap.val();
      if (!data) return;
      const players: Record<string,PlayerData> = data.players || {};
      setAllPlayers(players);
      setRoomMaxPlayers(data.maxPlayers ?? 2);

      const cIdx: number = data.challengeIndex ?? 0;

      if (data.status==='playing') {
        setChallengeIdx(cIdx);
        const elapsed = data.startedAt ? Math.floor((Date.now()-data.startedAt)/1000) : 0;
        const remaining = Math.max(0, BATTLE_DURATION - elapsed);
        setView(v=>{
          if (v!=='battle') {
            setPlayerCode(CHALLENGES[cIdx].starterCss);
            setTimeLeft(remaining);
            setPlayerScore(-1); setScoreDetails([]); setSubmitted(false);
          }
          return 'battle';
        });
      }

      if (data.status==='finished') {
        if (timerRef.current) clearInterval(timerRef.current);
        setView('results');
      }

      /* auto-finish when everyone submitted */
      const vals = Object.values(players) as PlayerData[];
      const count = vals.length;
      if (count>=2 && vals.every(p=>p.score>=0) && data.status!=='finished') {
        update(roomRef,{status:'finished'}).catch(()=>{});
      }
    });
    unsubRef.current = unsub;
  }, []);

  /* ── create room ── */
  const createRoom = async ()=>{
    if (!playerName.trim()){ setError('Digite seu nome.'); return; }
    setLoading(true); setError('');
    const code = genCode();
    const cIdx = Math.floor(Math.random()*CHALLENGES.length);
    try {
      await set(ref(db,`rooms/${code}`),{
        challengeIndex: cIdx, maxPlayers, status:'waiting',
        hostId: playerId.current, createdAt: Date.now(),
        players:{ [playerId.current]:{ name:playerName.trim(), score:-1, submittedAt:0 } }
      });
      setRoomCode(code); setIsHost(true);
      subscribeRoom(code); setView('lobby');
    } catch { setError('Erro ao criar sala. Verifique a conexão.'); }
    setLoading(false);
  };

  /* ── join room ── */
  const joinRoom = async ()=>{
    if (!playerName.trim()){ setError('Digite seu nome.'); return; }
    const code = joinCodeInput.trim().toUpperCase();
    if (code.length!==4){ setError('Código deve ter 4 caracteres.'); return; }
    setLoading(true); setError('');
    try {
      const snap = await get(ref(db,`rooms/${code}`));
      if (!snap.exists()){ setError('Sala não encontrada.'); setLoading(false); return; }
      const data = snap.val();
      if (data.status==='finished'){ setError('Esta sala já terminou.'); setLoading(false); return; }
      const count = Object.keys(data.players||{}).length;
      if (count>=(data.maxPlayers??2)){ setError(`Sala cheia (máx. ${data.maxPlayers??2} jogadores).`); setLoading(false); return; }
      await update(ref(db,`rooms/${code}/players/${playerId.current}`),
        { name:playerName.trim(), score:-1, submittedAt:0 });
      setRoomCode(code); setIsHost(false);
      subscribeRoom(code);
    } catch { setError('Erro ao entrar na sala.'); }
    setLoading(false);
  };

  /* ── host starts battle ── */
  const hostStart = async ()=>{
    if (!roomCode) return;
    const snap = await get(ref(db,`rooms/${roomCode}`));
    const data = snap.val();
    if (!data) return;
    const count = Object.keys(data.players||{}).length;
    if (count<2){ setError('Aguarde ao menos 2 jogadores.'); return; }
    await update(ref(db,`rooms/${roomCode}`),{ status:'playing', startedAt: Date.now() });
  };

  /* ── solo start ── */
  const startSolo = ()=>{
    if (!playerName.trim()){ setError('Digite seu nome.'); return; }
    const cIdx = selectedChallenge;
    setChallengeIdx(cIdx);
    setPlayerCode(CHALLENGES[cIdx].starterCss);
    setTimeLeft(BATTLE_DURATION); setPlayerScore(-1); setScoreDetails([]); setSubmitted(false);
    setView('battle');
  };

  /* ── tab key in editor ── */
  const handleTab = (e: React.KeyboardEvent<HTMLTextAreaElement>)=>{
    if (e.key!=='Tab') return;
    e.preventDefault();
    const ta=e.currentTarget, s=ta.selectionStart;
    const v=ta.value.substring(0,s)+'  '+ta.value.substring(ta.selectionEnd);
    setPlayerCode(v);
    setTimeout(()=>{ ta.selectionStart=ta.selectionEnd=s+2; },0);
  };

  const copyCode = ()=>{ navigator.clipboard.writeText(roomCode).then(()=>{ setCopiedCode(true); setTimeout(()=>setCopiedCode(false),2000); }); };
  const fmtTime = (s: number)=>`${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  const challenge = CHALLENGES[challengeIdx];
  const myEntry   = allPlayers[playerId.current];
  const opponents = Object.entries(allPlayers).filter(([id])=>id!==playerId.current);
  const timerPct  = (timeLeft/BATTLE_DURATION)*100;
  const timerColor = timeLeft>120 ? '#22c55e' : timeLeft>60 ? '#f59e0b' : '#ef4444';

  /* ══════════════════════════════════════════════════════════
      MENU
  ══════════════════════════════════════════════════════════ */
  if (view==='menu') return (
    <div style={{minHeight:'100vh',background:bg,color:text}}>
      <div style={{maxWidth:960,margin:'0 auto',padding:'0 16px'}}>

        <div style={{padding:'20px 0 0'}}>
          <button onClick={onBackToHub} style={{background:'none',border:`1px solid ${border}`,color:dim,padding:'6px 12px',borderRadius:8,cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontSize:13}}>
            <ArrowLeft size={14}/> Hub
          </button>
        </div>

        <div style={{textAlign:'center',padding:'40px 0 32px'}}>
          <div style={{display:'flex',justifyContent:'center',marginBottom:14}}>
            <div style={{width:72,height:72,background:'linear-gradient(135deg,#667eea,#764ba2)',borderRadius:20,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Swords size={36} color="white"/>
            </div>
          </div>
          <h1 style={{fontFamily:"'Press Start 2P',monospace",fontSize:22,margin:'0 0 12px',background:'linear-gradient(135deg,#667eea,#764ba2)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
            CSS BATTLE
          </h1>
          <p style={{color:dim,fontSize:14,margin:0}}>
            Desafie colegas a recriar layouts CSS — pontuação automática em tempo real
          </p>
        </div>

        {/* Mode cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:14,marginBottom:40}}>
          {[
            {m:'create' as GameMode, Icon:Home, color:'#667eea', bg:'rgba(102,126,234,0.12)', title:'Criar Sala', desc:'Crie uma sala, defina quantos jogadores e compartilhe o código.'},
            {m:'join' as GameMode, Icon:Link, color:'#3b82f6', bg:'rgba(59,130,246,0.12)', title:'Entrar em Sala', desc:'Digite o código de 4 letras para entrar na sala de um colega.'},
            {m:'solo' as GameMode, Icon:Gamepad2, color:'#22c55e', bg:'rgba(34,197,94,0.12)', title:'Praticar Solo', desc:'Treine os desafios no seu ritmo, sem competição.'},
          ].map(({m,Icon:Ic,color,bg:cbg,title,desc})=>(
            <button key={m} onClick={()=>{ setMode(m); setView('setup'); setError(''); }}
              style={{background:card,border:`1px solid ${border}`,borderRadius:16,padding:'22px',cursor:'pointer',textAlign:'left',transition:'transform 0.15s,box-shadow 0.15s'}}
              onMouseEnter={e=>{(e.currentTarget).style.transform='translateY(-2px)';(e.currentTarget).style.boxShadow=`0 8px 28px ${cbg}`;}}
              onMouseLeave={e=>{(e.currentTarget).style.transform='';(e.currentTarget).style.boxShadow='';}}>
              <div style={{width:40,height:40,background:cbg,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:12}}>
                <Ic size={20} color={color}/>
              </div>
              <div style={{fontSize:14,fontWeight:700,color:text,marginBottom:4}}>{title}</div>
              <div style={{fontSize:12,color:dim,lineHeight:1.6}}>{desc}</div>
            </button>
          ))}
        </div>

        {/* Challenge list */}
        <div style={{marginBottom:40}}>
          <h2 style={{fontSize:11,fontWeight:700,color:dim,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:12}}>Desafios disponíveis</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:8}}>
            {CHALLENGES.map(ch=>{
              const Ic = ch.Icon;
              return (
                <div key={ch.id} style={{background:card,border:`1px solid ${border}`,borderRadius:12,padding:'12px 14px',display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:34,height:34,background:`${ch.iconColor}18`,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <Ic size={16} color={ch.iconColor}/>
                  </div>
                  <div>
                    <div style={{fontSize:12,fontWeight:600,color:text}}>{ch.title}</div>
                    <div style={{fontSize:10,color:DIFF_COLOR[ch.difficulty]}}>{ch.difficulty} · {ch.points}pts</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════════
      SETUP
  ══════════════════════════════════════════════════════════ */
  if (view==='setup') {
    const ModeIcon = mode==='create' ? Home : mode==='join' ? Link : Gamepad2;
    return (
      <div style={{minHeight:'100vh',background:bg,color:text,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
        <div style={{background:card,border:`1px solid ${border}`,borderRadius:20,padding:'36px 32px',width:'100%',maxWidth:460}}>
          <button onClick={()=>setView('menu')} style={{background:'none',border:'none',color:dim,cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontSize:13,marginBottom:22,padding:0}}>
            <ArrowLeft size={14}/> Voltar
          </button>

          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:22}}>
            <div style={{width:44,height:44,background:'rgba(102,126,234,0.12)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <ModeIcon size={22} color="#667eea"/>
            </div>
            <h2 style={{fontSize:17,fontWeight:700,margin:0,color:text}}>
              {mode==='create' ? 'Criar Sala' : mode==='join' ? 'Entrar em Sala' : 'Praticar Solo'}
            </h2>
          </div>

          <div style={{marginBottom:14}}>
            <label style={{fontSize:12,color:dim,display:'block',marginBottom:6}}>Seu nome</label>
            <input value={playerName} onChange={e=>setPlayerName(e.target.value)} placeholder="Ex: Maria Silva" maxLength={24} style={inputStyle}/>
          </div>

          {mode==='join' && (
            <div style={{marginBottom:14}}>
              <label style={{fontSize:12,color:dim,display:'block',marginBottom:6}}>Código da sala</label>
              <input value={joinCodeInput} onChange={e=>setJoinCodeInput(e.target.value.toUpperCase().slice(0,4))}
                placeholder="XXXX" maxLength={4}
                style={{...inputStyle,fontSize:28,letterSpacing:'0.3em',fontFamily:'monospace',textAlign:'center',textTransform:'uppercase'}}/>
            </div>
          )}

          {mode==='create' && (
            <div style={{marginBottom:14}}>
              <label style={{fontSize:12,color:dim,display:'block',marginBottom:8}}>Número de jogadores</label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                {([2,3,4] as (2|3|4)[]).map(n=>(
                  <button key={n} onClick={()=>setMaxPlayers(n)}
                    style={{padding:'10px',borderRadius:10,border:`2px solid ${maxPlayers===n?'#667eea':border}`,background:maxPlayers===n?'rgba(102,126,234,0.12)':'transparent',cursor:'pointer',color:maxPlayers===n?'#667eea':dim,fontWeight:700,fontSize:15,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                    {n}
                    <span style={{fontSize:10,fontWeight:400}}>{n===2?'Duo':n===3?'Trio':'Squad'}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode==='solo' && (
            <div style={{marginBottom:14}}>
              <label style={{fontSize:12,color:dim,display:'block',marginBottom:8}}>Escolha o desafio</label>
              <div style={{display:'grid',gap:6,maxHeight:280,overflowY:'auto'}}>
                {CHALLENGES.map(ch=>{ const Ic=ch.Icon; return (
                  <button key={ch.id} onClick={()=>setSelectedChallenge(ch.id)}
                    style={{background:selectedChallenge===ch.id?`${ch.iconColor}18`:'transparent',border:`1px solid ${selectedChallenge===ch.id?ch.iconColor:border}`,borderRadius:10,padding:'10px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:10,textAlign:'left'}}>
                    <div style={{width:28,height:28,background:`${ch.iconColor}20`,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <Ic size={14} color={ch.iconColor}/>
                    </div>
                    <div>
                      <div style={{fontSize:12,fontWeight:600,color:text}}>{ch.title}</div>
                      <div style={{fontSize:10,color:DIFF_COLOR[ch.difficulty]}}>{ch.difficulty} · {ch.points}pts</div>
                    </div>
                  </button>
                ); })}
              </div>
            </div>
          )}

          {error && <div style={{color:'#ef4444',fontSize:12,marginBottom:12,padding:'8px 12px',background:'rgba(239,68,68,0.1)',borderRadius:8}}>{error}</div>}

          <button onClick={mode==='create'?createRoom:mode==='join'?joinRoom:startSolo} disabled={loading}
            style={{width:'100%',background:'linear-gradient(135deg,#667eea,#764ba2)',color:'white',border:'none',borderRadius:10,padding:'14px',fontSize:14,fontWeight:700,cursor:loading?'not-allowed':'pointer',opacity:loading?0.7:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            <Play size={16}/>
            {loading?'Aguarde...' : mode==='create'?'Criar Sala' : mode==='join'?'Entrar' : 'Iniciar Desafio'}
          </button>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════
      LOBBY
  ══════════════════════════════════════════════════════════ */
  if (view==='lobby') {
    const joined = Object.values(allPlayers).length;
    const max    = roomMaxPlayers;
    const canStart = isHost && joined>=2;

    return (
      <div style={{minHeight:'100vh',background:bg,color:text,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
        <div style={{background:card,border:`1px solid ${border}`,borderRadius:20,padding:'36px 32px',width:'100%',maxWidth:460}}>

          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
            <div style={{width:44,height:44,background:'rgba(102,126,234,0.12)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Users size={22} color="#667eea"/>
            </div>
            <div>
              <h2 style={{fontSize:16,fontWeight:700,margin:'0 0 2px',color:text}}>Sala criada</h2>
              <p style={{fontSize:12,color:dim,margin:0}}>Aguardando jogadores entrarem</p>
            </div>
          </div>

          {/* Room code */}
          <div style={{background:inputBg,border:`1px dashed ${border}`,borderRadius:14,padding:'20px',marginBottom:16,textAlign:'center'}}>
            <div style={{fontSize:10,color:dim,marginBottom:6,letterSpacing:'0.12em',textTransform:'uppercase'}}>Código da sala</div>
            <div style={{fontFamily:'monospace',fontSize:46,fontWeight:900,letterSpacing:'0.22em',color:text}}>{roomCode}</div>
            <div style={{fontSize:11,color:dim,marginTop:4}}>Compartilhe com seus colegas</div>
          </div>

          <button onClick={copyCode}
            style={{display:'flex',alignItems:'center',gap:8,width:'100%',justifyContent:'center',marginBottom:20,background:copiedCode?'rgba(34,197,94,0.1)':'rgba(102,126,234,0.08)',border:`1px solid ${copiedCode?'rgba(34,197,94,0.3)':'rgba(102,126,234,0.25)'}`,color:copiedCode?'#22c55e':'#667eea',borderRadius:8,padding:'10px',cursor:'pointer',fontSize:13,fontWeight:600}}>
            {copiedCode?<><Check size={14}/> Copiado!</>:<><Copy size={14}/> Copiar código</>}
          </button>

          {/* Players list */}
          <div style={{marginBottom:20}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
              <span style={{fontSize:11,color:dim,textTransform:'uppercase',letterSpacing:'0.08em'}}>Jogadores na sala</span>
              <span style={{fontSize:12,fontWeight:700,color:joined>=max?'#22c55e':dim}}>{joined}/{max}</span>
            </div>

            {/* Filled slots */}
            {Object.values(allPlayers).map((p,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)',borderRadius:10,marginBottom:6}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:'#22c55e',flexShrink:0}}/>
                <span style={{fontSize:13,fontWeight:600,color:text,flex:1}}>{p.name}</span>
                {p.name===playerName && <span style={{fontSize:10,color:'#667eea',background:'rgba(102,126,234,0.12)',padding:'2px 8px',borderRadius:999}}>você</span>}
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({length: Math.max(0, max-joined)}).map((_,i)=>(
              <div key={`empty-${i}`} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',border:`1px dashed ${border}`,borderRadius:10,marginBottom:6}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:border,flexShrink:0}}/>
                <span style={{fontSize:12,color:dim,fontStyle:'italic'}}>Aguardando jogador...</span>
              </div>
            ))}
          </div>

          {error && <div style={{color:'#ef4444',fontSize:12,marginBottom:12,padding:'8px 12px',background:'rgba(239,68,68,0.1)',borderRadius:8}}>{error}</div>}

          {isHost ? (
            <button onClick={hostStart} disabled={!canStart}
              style={{width:'100%',background:canStart?'linear-gradient(135deg,#22c55e,#16a34a)':'rgba(100,116,139,0.2)',color:canStart?'white':dim,border:'none',borderRadius:10,padding:'14px',fontSize:14,fontWeight:700,cursor:canStart?'pointer':'not-allowed',display:'flex',alignItems:'center',justifyContent:'center',gap:8,transition:'all 0.2s'}}>
              <Play size={16}/> {canStart ? 'Iniciar Batalha' : `Aguardando jogadores (${joined}/${max})`}
            </button>
          ) : (
            <div style={{textAlign:'center',padding:'12px',fontSize:13,color:dim,background:isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.03)',borderRadius:10}}>
              <Clock size={14} style={{display:'inline',verticalAlign:'middle',marginRight:6}}/>
              Aguardando o host iniciar a partida...
            </div>
          )}

          <button onClick={()=>{ unsubRef.current?.(); setView('menu'); }}
            style={{marginTop:14,width:'100%',background:'none',border:'none',color:dim,cursor:'pointer',fontSize:12}}>
            Sair da sala
          </button>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════
      BATTLE
  ══════════════════════════════════════════════════════════ */
  if (view==='battle') {
    const ChIcon = challenge.Icon;
    return (
      <div style={{height:'100vh',display:'flex',flexDirection:'column',background:bg,overflow:'hidden'}}>

        {/* Timer progress bar */}
        <div style={{height:5,background:isDark?'#1e293b':'#e2e8f0',flexShrink:0,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',left:0,top:0,bottom:0,width:`${timerPct}%`,background:timerColor,transition:'width 1s linear, background 0.5s'}}/>
        </div>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',padding:'0 14px',height:54,background:card,borderBottom:`1px solid ${border}`,gap:10,flexShrink:0}}>
          <button onClick={onBackToHub} style={{background:'none',border:`1px solid ${border}`,color:dim,padding:'4px 10px',borderRadius:6,cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:4,flexShrink:0}}>
            <ArrowLeft size={12}/> Hub
          </button>

          <div style={{display:'flex',alignItems:'center',gap:8,flex:1,minWidth:0}}>
            <div style={{width:26,height:26,background:`${challenge.iconColor}20`,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <ChIcon size={13} color={challenge.iconColor}/>
            </div>
            <span style={{fontSize:13,fontWeight:700,color:text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{challenge.title}</span>
            <span style={{fontSize:10,color:DIFF_COLOR[challenge.difficulty],background:`${DIFF_COLOR[challenge.difficulty]}18`,padding:'2px 8px',borderRadius:999,flexShrink:0}}>{challenge.difficulty}</span>
          </div>

          {/* Instructions toggle */}
          <button onClick={()=>setShowInstr(v=>!v)}
            style={{display:'flex',alignItems:'center',gap:5,background:showInstr?'rgba(102,126,234,0.12)':'none',border:`1px solid ${showInstr?'rgba(102,126,234,0.4)':border}`,color:showInstr?'#667eea':dim,borderRadius:6,padding:'4px 10px',cursor:'pointer',fontSize:11,fontWeight:600,flexShrink:0}}>
            <Lightbulb size={12}/> Instruções {showInstr?<ChevronUp size={11}/>:<ChevronDown size={11}/>}
          </button>

          {/* Players in header */}
          <div style={{display:'flex',gap:6,alignItems:'center',flexShrink:0}}>
            {/* Me */}
            <div style={{display:'flex',alignItems:'center',gap:4,padding:'3px 8px',background:isDark?'rgba(34,197,94,0.12)':'rgba(34,197,94,0.08)',borderRadius:6,border:'1px solid rgba(34,197,94,0.3)'}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:'#22c55e'}}/>
              <span style={{fontSize:11,color:'#22c55e',fontWeight:600}}>{playerName || 'Você'}</span>
              {submitted && <span style={{fontSize:11,color:'#22c55e',fontWeight:700}}>{playerScore}%</span>}
            </div>
            {/* Opponents */}
            {opponents.map(([id,p])=>(
              <div key={id} style={{display:'flex',alignItems:'center',gap:4,padding:'3px 8px',background:isDark?'rgba(102,126,234,0.10)':'rgba(102,126,234,0.06)',borderRadius:6,border:'1px solid rgba(102,126,234,0.25)'}}>
                <div style={{width:6,height:6,borderRadius:'50%',background:p.score>=0?'#667eea':'#94a3b8'}}/>
                <span style={{fontSize:11,color:'#667eea',fontWeight:600}}>{p.name}</span>
                {p.score>=0 ? <span style={{fontSize:11,color:'#667eea',fontWeight:700}}>{p.score}%</span>
                  : <span style={{fontSize:10,color:dim}}>jogando</span>}
              </div>
            ))}
          </div>

          {/* Timer */}
          <div style={{fontFamily:'monospace',fontSize:22,fontWeight:800,minWidth:64,textAlign:'right',flexShrink:0,color:timerColor,animation:timeLeft<=10?'pulse 0.5s infinite':'none'}}>
            {fmtTime(timeLeft)}
          </div>
        </div>

        {/* Instructions panel (collapsible) */}
        {showInstr && (
          <div style={{flexShrink:0,background:isDark?'#0d1117':'#f0f4ff',borderBottom:`1px solid ${border}`,padding:'14px 16px',display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14,maxHeight:200,overflowY:'auto'}}>
            <div>
              <div style={{fontSize:10,color:dim,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6,display:'flex',alignItems:'center',gap:4}}>
                <Eye size={10}/> Objetivo
              </div>
              <p style={{fontSize:12,color:text,margin:0,lineHeight:1.6}}>{challenge.description}</p>
            </div>
            <div>
              <div style={{fontSize:10,color:dim,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6,display:'flex',alignItems:'center',gap:4}}>
                <Code2 size={10}/> HTML disponível
              </div>
              <pre style={{fontSize:11,color:'#667eea',margin:0,background:isDark?'rgba(102,126,234,0.08)':'rgba(102,126,234,0.06)',padding:'8px',borderRadius:6,overflowX:'auto',lineHeight:1.5}}>
                {challenge.htmlStructure}
              </pre>
            </div>
            <div>
              <div style={{fontSize:10,color:dim,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6,display:'flex',alignItems:'center',gap:4}}>
                <Lightbulb size={10}/> Dica
              </div>
              <p style={{fontSize:12,color:text,margin:0,lineHeight:1.6}}>{challenge.hint}</p>
            </div>
          </div>
        )}

        {/* Three panels */}
        <div style={{flex:1,display:'flex',minHeight:0,overflow:'hidden'}}>

          {/* Editor */}
          <div style={{width:'38%',minWidth:200,display:'flex',flexDirection:'column',borderRight:`1px solid ${border}`,minHeight:0}}>
            <div style={{padding:'5px 12px',fontSize:10,color:dim,background:'#1e1e2e',borderBottom:'1px solid rgba(255,255,255,0.05)',flexShrink:0,letterSpacing:'0.08em',display:'flex',alignItems:'center',gap:6}}>
              <Code2 size={10}/> EDITOR CSS
              {submitted && <span style={{color:'#22c55e',marginLeft:'auto',display:'flex',alignItems:'center',gap:4}}><Check size={10}/> enviado</span>}
            </div>
            <textarea
              value={playerCode}
              onChange={e=>{ if(!submitted) setPlayerCode(e.target.value); }}
              onKeyDown={handleTab}
              disabled={submitted}
              spellCheck={false} autoCorrect="off" autoCapitalize="off"
              style={{flex:1,minHeight:0,background:'#1e1e2e',color:'#cdd6f4',fontFamily:'monospace',fontSize:13,padding:14,border:'none',outline:'none',resize:'none',lineHeight:1.7,opacity:submitted?0.65:1}}
            />
          </div>

          {/* Student preview */}
          <div style={{flex:1,display:'flex',flexDirection:'column',borderRight:`1px solid ${border}`,minHeight:0,minWidth:0}}>
            <div style={{padding:'5px 12px',fontSize:10,color:dim,background:card,borderBottom:`1px solid ${border}`,flexShrink:0,letterSpacing:'0.08em',display:'flex',alignItems:'center',gap:6}}>
              <Eye size={10}/> SEU PREVIEW
              <span style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:4,fontSize:9,color:'#22c55e',background:'rgba(34,197,94,0.12)',padding:'1px 6px',borderRadius:999,border:'1px solid rgba(34,197,94,0.3)'}}>
                <span style={{width:4,height:4,borderRadius:'50%',background:'#22c55e',display:'inline-block'}}/>
                AO VIVO
              </span>
              {submitted && playerScore>=0 && (
                <span style={{color:playerScore>=80?'#22c55e':playerScore>=50?'#f59e0b':'#ef4444',fontWeight:700,fontSize:14,marginLeft:8}}>{playerScore}%</span>
              )}
            </div>
            <div style={{flex:1,position:'relative',minHeight:0}}>
              <iframe ref={previewRef} title="preview" style={{position:'absolute',top:0,left:0,right:0,bottom:0,width:'100%',height:'100%',border:'none'}}/>
            </div>
          </div>

          {/* Target */}
          <div style={{flex:1,display:'flex',flexDirection:'column',minHeight:0,minWidth:0}}>
            <div style={{padding:'5px 12px',fontSize:10,color:dim,background:card,borderBottom:`1px solid ${border}`,flexShrink:0,letterSpacing:'0.08em',display:'flex',alignItems:'center',gap:6}}>
              <ChIcon size={10} color={challenge.iconColor}/>
              <span style={{color:challenge.iconColor}}>ALVO — {challenge.title}</span>
            </div>
            <div style={{flex:1,position:'relative',minHeight:0}}>
              <iframe ref={targetRef} title="target" style={{position:'absolute',top:0,left:0,right:0,bottom:0,width:'100%',height:'100%',border:'none'}}/>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{padding:'10px 16px',borderTop:`1px solid ${border}`,background:card,display:'flex',alignItems:'center',gap:12,flexShrink:0,flexWrap:'wrap'}}>
          {!submitted ? (
            <button onClick={handleSubmit}
              style={{background:'linear-gradient(135deg,#22c55e,#16a34a)',color:'white',border:'none',borderRadius:8,padding:'10px 22px',fontSize:13,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
              <Zap size={14}/> Enviar Resposta
            </button>
          ) : (
            <div style={{display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
              <Check size={14} color="#22c55e"/>
              <span style={{fontSize:13,color:'#22c55e',fontWeight:700}}>Resposta enviada</span>
              <span style={{fontSize:20,fontWeight:900,color:playerScore>=80?'#22c55e':playerScore>=50?'#f59e0b':'#ef4444'}}>{playerScore}%</span>
            </div>
          )}

          {submitted && scoreDetails.length>0 && (
            <div style={{display:'flex',gap:5,flexWrap:'wrap',flex:1,justifyContent:'flex-end'}}>
              {scoreDetails.map((d,i)=>(
                <span key={i} style={{fontSize:10,padding:'3px 8px',borderRadius:999,background:d.passed?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)',color:d.passed?'#22c55e':'#ef4444',border:`1px solid ${d.passed?'rgba(34,197,94,0.3)':'rgba(239,68,68,0.3)'}`,whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:3}}>
                  {d.passed?<Check size={9}/>:<X size={9}/>} {d.label}
                </span>
              ))}
            </div>
          )}

          {mode==='solo' && submitted && (
            <button onClick={()=>setView('results')}
              style={{background:'rgba(102,126,234,0.1)',color:'#667eea',border:'1px solid rgba(102,126,234,0.3)',borderRadius:8,padding:'8px 16px',cursor:'pointer',fontSize:12,fontWeight:600,flexShrink:0}}>
              Ver resultado →
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════
      RESULTS
  ══════════════════════════════════════════════════════════ */
  if (view==='results') {
    const ChIcon = challenge.Icon;
    const isDuo  = mode!=='solo' && Object.keys(allPlayers).length>=2;
    const sorted = Object.entries(allPlayers).sort(([,a],[,b])=>(b.score??-1)-(a.score??-1));
    const topScore = sorted[0]?.[1]?.score ?? -1;
    const isWinner = myEntry ? myEntry.score===topScore && topScore>=0 : false;

    let headline = ''; let headColor = '#667eea';
    if (isDuo) {
      const winner = sorted[0]?.[1];
      if (!winner || sorted.filter(([,p])=>p.score===topScore).length>1) {
        headline='Empate!'; headColor='#f59e0b';
      } else if (sorted[0][0]===playerId.current) {
        headline='Você venceu!'; headColor='#22c55e';
      } else {
        headline=`${winner.name} venceu!`; headColor='#ef4444';
      }
    } else {
      headline = playerScore>=90?'Perfeito!':playerScore>=70?'Muito bom!':playerScore>=50?'Continue praticando!':'Tente novamente!';
      headColor = playerScore>=70?'#22c55e':playerScore>=50?'#f59e0b':'#ef4444';
    }

    const ResultIcon = playerScore>=90?Crown:playerScore>=70?Trophy:playerScore>=50?TrendingUp:Star;

    return (
      <div style={{minHeight:'100vh',background:bg,color:text,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
        <div style={{background:card,border:`1px solid ${border}`,borderRadius:20,padding:'36px 32px',width:'100%',maxWidth:520,textAlign:'center'}}>

          <div style={{display:'flex',justifyContent:'center',marginBottom:14}}>
            <div style={{width:64,height:64,background:`${headColor}18`,borderRadius:18,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <ResultIcon size={32} color={headColor}/>
            </div>
          </div>

          <h2 style={{fontSize:20,fontWeight:700,color:headColor,margin:'0 0 4px'}}>{headline}</h2>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,color:dim,fontSize:12,marginBottom:28}}>
            <ChIcon size={12} color={challenge.iconColor}/> {challenge.title}
          </div>

          {/* Scores */}
          <div style={{display:'grid',gridTemplateColumns:isDuo&&sorted.length>1?`repeat(${Math.min(sorted.length,3)},1fr)`:'1fr',gap:10,marginBottom:24}}>
            {isDuo ? sorted.map(([id,p],i)=>(
              <div key={id} style={{background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.04)',borderRadius:14,padding:'16px 10px',border:i===0?`2px solid ${headColor}22`:'none'}}>
                {i===0 && <div style={{display:'flex',justifyContent:'center',marginBottom:4}}><Crown size={14} color={headColor}/></div>}
                <div style={{fontSize:10,color:dim,marginBottom:4}}>{p.name}{id===playerId.current?' (você)':''}</div>
                <div style={{fontSize:36,fontWeight:900,color:p.score>=70?'#22c55e':p.score>=50?'#f59e0b':'#ef4444'}}>{p.score>=0?`${p.score}%`:'—'}</div>
              </div>
            )) : (
              <div style={{background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.04)',borderRadius:14,padding:'20px'}}>
                <div style={{fontSize:11,color:dim,marginBottom:6}}>{playerName || 'Você'}</div>
                <div style={{fontSize:52,fontWeight:900,color:playerScore>=70?'#22c55e':playerScore>=50?'#f59e0b':'#ef4444'}}>{playerScore}%</div>
              </div>
            )}
          </div>

          {/* Score breakdown */}
          {scoreDetails.length>0 && (
            <div style={{textAlign:'left',marginBottom:24}}>
              <div style={{fontSize:10,color:dim,marginBottom:8,textTransform:'uppercase',letterSpacing:'0.08em'}}>
                Detalhes da sua pontuação
              </div>
              <div style={{display:'grid',gap:5}}>
                {scoreDetails.map((d,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:8,fontSize:12,padding:'7px 10px',borderRadius:8,background:d.passed?'rgba(34,197,94,0.07)':'rgba(239,68,68,0.07)'}}>
                    {d.passed?<Check size={12} color="#22c55e"/>:<X size={12} color="#ef4444"/>}
                    <span style={{color:text,flex:1}}>{d.label}</span>
                    <span style={{fontSize:10,color:dim}}>×{d.weight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{display:'flex',gap:10}}>
            <button onClick={()=>{ unsubRef.current?.(); setAllPlayers({}); setRoomCode(''); setView('menu'); }}
              style={{flex:1,background:'linear-gradient(135deg,#667eea,#764ba2)',color:'white',border:'none',borderRadius:10,padding:'12px',fontSize:13,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              <RefreshCw size={14}/> Jogar novamente
            </button>
            <button onClick={onBackToHub}
              style={{flex:1,background:'none',border:`1px solid ${border}`,color:dim,borderRadius:10,padding:'12px',fontSize:13,cursor:'pointer'}}>
              Voltar ao Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default CssBattlePage;
