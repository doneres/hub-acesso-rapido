import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Copy, Check, RefreshCw, Users, Zap } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { db } from '../lib/firebase';
import { ref, set, update, onValue, get } from 'firebase/database';

/* ── Types ──────────────────────────────────────────────────────────────── */

interface Challenge {
  id: number;
  title: string;
  emoji: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  points: number;
  description: string;
  hint: string;
  targetHtml: string;
  targetCss: string;
  starterCss: string;
}

type PageView = 'menu' | 'setup' | 'lobby' | 'battle' | 'results';
type GameMode = 'create' | 'join' | 'solo';

interface PlayerData {
  name: string;
  score: number;
  submittedAt: number;
}

interface ScoreDetail {
  label: string;
  passed: boolean;
  weight: number;
}

/* ── Challenges ─────────────────────────────────────────────────────────── */

const CHALLENGES: Challenge[] = [
  {
    id: 0,
    title: 'Círculo Vermelho',
    emoji: '🔴',
    difficulty: 'Fácil',
    points: 100,
    description: 'Crie um círculo vermelho usando CSS.',
    hint: 'Use border-radius: 50% para transformar um quadrado em círculo, e background-color para colorir.',
    targetHtml: '<div class="shape"></div>',
    targetCss: `.shape { width: 100px; height: 100px; background-color: #e74c3c; border-radius: 50%; }`,
    starterCss: `.shape {
  /* Crie um círculo vermelho */
  width: ;
  height: ;
  background-color: ;
  border-radius: ;
}`,
  },
  {
    id: 1,
    title: 'Quadrado com Sombra',
    emoji: '🟦',
    difficulty: 'Fácil',
    points: 150,
    description: 'Crie um quadrado azul com sombra nas bordas.',
    hint: 'Use box-shadow para adicionar sombra. Ex: box-shadow: 6px 6px 15px rgba(0,0,0,0.4)',
    targetHtml: '<div class="box"></div>',
    targetCss: `.box { width: 100px; height: 100px; background-color: #3498db; box-shadow: 6px 6px 15px rgba(0,0,0,0.4); }`,
    starterCss: `.box {
  /* Crie um quadrado azul com sombra */
  width: ;
  height: ;
  background-color: ;
  box-shadow: ;
}`,
  },
  {
    id: 2,
    title: 'Gradiente Colorido',
    emoji: '🌈',
    difficulty: 'Fácil',
    points: 150,
    description: 'Crie um retângulo com gradiente do laranja ao vermelho.',
    hint: 'Use background: linear-gradient(direção, cor1, cor2)',
    targetHtml: '<div class="card"></div>',
    targetCss: `.card { width: 200px; height: 100px; background: linear-gradient(135deg, #f39c12, #e74c3c); border-radius: 12px; }`,
    starterCss: `.card {
  /* Crie um retângulo com gradiente */
  width: ;
  height: ;
  background: linear-gradient( , , );
  border-radius: ;
}`,
  },
  {
    id: 3,
    title: 'Texto Centralizado',
    emoji: '📐',
    difficulty: 'Médio',
    points: 200,
    description: 'Centralize o texto dentro de uma caixa escura.',
    hint: 'Use display: flex com justify-content: center e align-items: center',
    targetHtml: '<div class="box"><span class="text">CSS Battle!</span></div>',
    targetCss: `.box { width: 200px; height: 100px; background: #2c3e50; display: flex; justify-content: center; align-items: center; border-radius: 8px; } .text { color: white; font-size: 18px; font-weight: bold; font-family: sans-serif; }`,
    starterCss: `.box {
  width: 200px;
  height: 100px;
  background: #2c3e50;
  border-radius: 8px;
  /* centralize com flexbox */
  display: ;
  justify-content: ;
  align-items: ;
}
.text {
  color: ;
  font-size: ;
  font-weight: bold;
  font-family: sans-serif;
}`,
  },
  {
    id: 4,
    title: 'Botão Estilizado',
    emoji: '🟢',
    difficulty: 'Médio',
    points: 200,
    description: 'Estilize um botão verde com texto branco e bordas arredondadas.',
    hint: 'Lembre de remover a borda padrão com border: none',
    targetHtml: '<button class="btn">Clique aqui!</button>',
    targetCss: `.btn { background-color: #27ae60; color: white; border: none; padding: 14px 28px; border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: bold; font-family: sans-serif; }`,
    starterCss: `.btn {
  /* Estilize o botão */
  background-color: ;
  color: ;
  border: ;
  padding: ;
  border-radius: ;
  font-size: 16px;
  font-family: sans-serif;
  cursor: pointer;
}`,
  },
  {
    id: 5,
    title: 'Card de Perfil',
    emoji: '👤',
    difficulty: 'Médio',
    points: 250,
    description: 'Crie um card com avatar circular e nome abaixo.',
    hint: 'Use flexbox com flex-direction: column e align-items: center no card.',
    targetHtml: `<div class="card"><div class="avatar">JS</div><p class="name">JavaScript</p></div>`,
    targetCss: `.card { width: 140px; padding: 24px 16px; background: #1a1a2e; border-radius: 16px; display: flex; flex-direction: column; align-items: center; gap: 12px; } .avatar { width: 60px; height: 60px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px; font-family: sans-serif; } .name { color: white; font-weight: bold; margin: 0; font-family: sans-serif; }`,
    starterCss: `.card {
  width: 140px;
  padding: 24px 16px;
  background: #1a1a2e;
  border-radius: 16px;
  /* empilhe os itens verticalmente */
  display: ;
  flex-direction: ;
  align-items: ;
  gap: ;
}
.avatar {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: ;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-family: sans-serif;
}
.name {
  color: white;
  font-weight: bold;
  margin: 0;
  font-family: sans-serif;
}`,
  },
  {
    id: 6,
    title: 'Grid 2×2',
    emoji: '🔲',
    difficulty: 'Difícil',
    points: 300,
    description: 'Organize 4 células coloridas em um grid 2x2.',
    hint: 'Use display: grid e grid-template-columns: 1fr 1fr',
    targetHtml: `<div class="grid"><div class="cell" style="background:#e74c3c"></div><div class="cell" style="background:#3498db"></div><div class="cell" style="background:#2ecc71"></div><div class="cell" style="background:#f39c12"></div></div>`,
    targetCss: `.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 180px; } .cell { height: 80px; border-radius: 8px; }`,
    starterCss: `.grid {
  width: 180px;
  /* crie um grid 2x2 */
  display: ;
  grid-template-columns: ;
  gap: ;
}
.cell {
  height: 80px;
  border-radius: 8px;
}`,
  },
  {
    id: 7,
    title: 'Spinner Animado',
    emoji: '⏳',
    difficulty: 'Difícil',
    points: 300,
    description: 'Crie um spinner de carregamento giratório usando animação CSS.',
    hint: 'Use border com border-top-color diferente, border-radius: 50% e animation com rotate(360deg).',
    targetHtml: '<div class="spinner"></div>',
    targetCss: `.spinner { width: 60px; height: 60px; border: 6px solid rgba(52,152,219,0.2); border-top-color: #3498db; border-radius: 50%; animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`,
    starterCss: `.spinner {
  width: 60px;
  height: 60px;
  border: 6px solid rgba(52, 152, 219, 0.2);
  border-top-color: #3498db;
  border-radius: 50%;
  /* adicione animação de rotação */
  animation: ;
}
@keyframes spin {
  to { transform: ; }
}`,
  },
];

/* ── Scoring ────────────────────────────────────────────────────────────── */

function parseRgb(s: string): [number, number, number] | null {
  const m = s.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
  return m ? [+m[1], +m[2], +m[3]] : null;
}

function colorNear(actual: string, r: number, g: number, b: number, tol = 45): boolean {
  const v = parseRgb(actual);
  if (!v) return false;
  return Math.abs(v[0] - r) <= tol && Math.abs(v[1] - g) <= tol && Math.abs(v[2] - b) <= tol;
}

function px(v: string): number { return parseFloat(v) || 0; }

function calcScore(challengeId: number, iframe: HTMLIFrameElement): { score: number; details: ScoreDetail[] } {
  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;
  if (!doc || !win) return { score: 0, details: [] };

  const gs = (sel: string, prop: string): string => {
    const el = doc.querySelector(sel);
    return el ? win.getComputedStyle(el).getPropertyValue(prop).trim() : '';
  };

  const details: ScoreDetail[] = [];
  const add = (label: string, pass: boolean, weight: number) =>
    details.push({ label, passed: pass, weight });

  switch (challengeId) {
    case 0:
      add('border-radius: 50% (circular)', px(gs('.shape', 'border-radius')) >= 40, 35);
      add('background-color vermelho', colorNear(gs('.shape', 'background-color'), 231, 76, 60), 35);
      add('width definido (≥ 60px)', px(gs('.shape', 'width')) >= 60, 15);
      add('height definido (≥ 60px)', px(gs('.shape', 'height')) >= 60, 15);
      break;

    case 1:
      add('background-color azul', colorNear(gs('.box', 'background-color'), 52, 152, 219), 40);
      add('box-shadow aplicado', gs('.box', 'box-shadow') !== 'none', 30);
      add('width definido (≥ 60px)', px(gs('.box', 'width')) >= 60, 15);
      add('height definido (≥ 60px)', px(gs('.box', 'height')) >= 60, 15);
      break;

    case 2: {
      const bgImg = gs('.card', 'background-image');
      add('linear-gradient aplicado', bgImg.includes('gradient'), 50);
      add('border-radius > 0', px(gs('.card', 'border-radius')) > 0, 25);
      add('width ≥ 150px', px(gs('.card', 'width')) >= 150, 25);
      break;
    }

    case 3:
      add('display: flex', gs('.box', 'display') === 'flex', 30);
      add('justify-content: center', gs('.box', 'justify-content') === 'center', 20);
      add('align-items: center', gs('.box', 'align-items') === 'center', 20);
      add('texto branco (.text)', colorNear(gs('.text', 'color'), 255, 255, 255, 30), 30);
      break;

    case 4:
      add('background-color verde', colorNear(gs('.btn', 'background-color'), 39, 174, 96), 30);
      add('color branco', colorNear(gs('.btn', 'color'), 255, 255, 255, 30), 20);
      add('border: none', gs('.btn', 'border-top-style') === 'none', 20);
      add('border-radius > 0', px(gs('.btn', 'border-radius')) > 0, 15);
      add('padding aplicado', px(gs('.btn', 'padding-top')) >= 5, 15);
      break;

    case 5:
      add('.card: display: flex', gs('.card', 'display') === 'flex', 25);
      add('.card: flex-direction: column', gs('.card', 'flex-direction') === 'column', 25);
      add('.avatar: border-radius: 50%', px(gs('.avatar', 'border-radius')) >= 25, 25);
      add('.avatar: gradiente ou cor aplicada', gs('.avatar', 'background-image').includes('gradient'), 25);
      break;

    case 6:
      add('display: grid', gs('.grid', 'display') === 'grid', 40);
      add('grid-template-columns com 2 colunas', gs('.grid', 'grid-template-columns').trim().split(/\s+/).length >= 2, 30);
      add('.cell: height ≥ 50px', px(gs('.cell', 'height')) >= 50, 30);
      break;

    case 7:
      add('border-radius: 50%', px(gs('.spinner', 'border-radius')) >= 25, 25);
      add('border definido', gs('.spinner', 'border-top-style') !== 'none', 25);
      add('animation ativa', gs('.spinner', 'animation-name') !== 'none', 50);
      break;
  }

  const total = details.reduce((s, d) => s + d.weight, 0);
  const earned = details.reduce((s, d) => s + (d.passed ? d.weight : 0), 0);
  return { score: total > 0 ? Math.round((earned / total) * 100) : 0, details };
}

/* ── Helpers ─────────────────────────────────────────────────────────── */

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function buildDoc(html: string, css: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{box-sizing:border-box;}body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f0f0f0;}${css}</style></head><body>${html}</body></html>`;
}

const DIFF_COLOR: Record<string, string> = {
  Fácil: '#22c55e',
  Médio: '#f59e0b',
  Difícil: '#ef4444',
};

/* ── Component ────────────────────────────────────────────────────────── */

interface Props {
  onBackToHub: () => void;
}

const CssBattlePage: React.FC<Props> = ({ onBackToHub }) => {
  const { isDark } = useTheme();

  const [view, setView] = useState<PageView>('menu');
  const [mode, setMode] = useState<GameMode>('create');
  const [copiedCode, setCopiedCode] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [selectedChallenge, setSelectedChallenge] = useState(0);
  const [playerCode, setPlayerCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(180);
  const [playerScore, setPlayerScore] = useState(-1);
  const [scoreDetails, setScoreDetails] = useState<ScoreDetail[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [opponentData, setOpponentData] = useState<PlayerData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const previewRef = useRef<HTMLIFrameElement>(null);
  const targetRef = useRef<HTMLIFrameElement>(null);
  const playerId = useRef<string>(generateId());
  const unsubRef = useRef<(() => void) | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submittedRef = useRef(false);

  /* ── Theme tokens ── */
  const bg = isDark ? '#0f1117' : '#f8fafc';
  const cardBg = isDark ? '#1a1d2e' : '#ffffff';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)';
  const text = isDark ? '#e2e8f0' : '#1e293b';
  const dim = isDark ? '#64748b' : '#94a3b8';
  const inputBg = isDark ? '#0f1117' : '#f8fafc';

  /* ── Preview update (debounced) ── */
  useEffect(() => {
    const t = setTimeout(() => {
      if (previewRef.current) {
        previewRef.current.srcdoc = buildDoc(CHALLENGES[challengeIndex].targetHtml, playerCode);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [playerCode, challengeIndex]);

  /* ── Target preview ── */
  useEffect(() => {
    if (targetRef.current && view === 'battle') {
      const ch = CHALLENGES[challengeIndex];
      targetRef.current.srcdoc = buildDoc(ch.targetHtml, ch.targetCss);
    }
  }, [challengeIndex, view]);

  /* ── Submit handler ── */
  const handleSubmit = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);

    setTimeout(() => {
      const iframe = previewRef.current;
      if (!iframe) return;
      const { score, details } = calcScore(challengeIndex, iframe);
      setPlayerScore(score);
      setScoreDetails(details);
      setSubmitted(true);

      if (mode !== 'solo' && roomCode) {
        update(ref(db, `rooms/${roomCode}/players/${playerId.current}`), {
          score, submittedAt: Date.now()
        });
      } else {
        setView('results');
      }
    }, 400);
  }, [challengeIndex, mode, roomCode]);

  /* ── Timer ── */
  useEffect(() => {
    if (view !== 'battle') return;
    submittedRef.current = false;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [view]);

  /* ── Cleanup ── */
  useEffect(() => () => {
    unsubRef.current?.();
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  /* ── Firebase: subscribe room ── */
  const subscribeRoom = useCallback((code: string) => {
    unsubRef.current?.();
    const roomRef = ref(db, `rooms/${code}`);
    const unsub = onValue(roomRef, snap => {
      const data = snap.val();
      if (!data) return;

      const players: Record<string, PlayerData> = data.players || {};
      const oppEntry = Object.entries(players).find(([id]) => id !== playerId.current);
      if (oppEntry) setOpponentData(oppEntry[1] as PlayerData);

      const cIdx: number = data.challengeIndex ?? 0;

      if (data.status === 'waiting' && Object.keys(players).length >= 2) {
        update(roomRef, { status: 'playing' }).catch(() => {});
      }

      if (data.status === 'playing') {
        setChallengeIndex(cIdx);
        setView(v => {
          if (v !== 'battle') {
            setPlayerCode(CHALLENGES[cIdx].starterCss);
            setTimeLeft(180);
            setPlayerScore(-1);
            setScoreDetails([]);
            setSubmitted(false);
          }
          return 'battle';
        });
      }

      if (data.status === 'finished') {
        if (timerRef.current) clearInterval(timerRef.current);
        setView('results');
      }

      const allDone = Object.values(players).length >= 2 &&
        Object.values(players).every((p: PlayerData) => p.score >= 0);
      if (allDone && data.status !== 'finished') {
        update(roomRef, { status: 'finished' }).catch(() => {});
      }
    });
    unsubRef.current = unsub;
  }, []);

  /* ── Create room ── */
  const createRoom = async () => {
    if (!playerName.trim()) { setError('Digite seu nome.'); return; }
    setLoading(true); setError('');
    const code = generateRoomCode();
    const cIdx = Math.floor(Math.random() * CHALLENGES.length);
    try {
      await set(ref(db, `rooms/${code}`), {
        challengeIndex: cIdx,
        status: 'waiting',
        createdAt: Date.now(),
        players: { [playerId.current]: { name: playerName.trim(), score: -1, submittedAt: 0 } }
      });
      setRoomCode(code);
      subscribeRoom(code);
      setView('lobby');
    } catch { setError('Erro ao criar sala. Verifique a conexão.'); }
    setLoading(false);
  };

  /* ── Join room ── */
  const joinRoom = async () => {
    if (!playerName.trim()) { setError('Digite seu nome.'); return; }
    const code = joinCodeInput.trim().toUpperCase();
    if (code.length !== 4) { setError('Código deve ter 4 caracteres.'); return; }
    setLoading(true); setError('');
    try {
      const snap = await get(ref(db, `rooms/${code}`));
      if (!snap.exists()) { setError('Sala não encontrada.'); setLoading(false); return; }
      const data = snap.val();
      if (data.status === 'finished') { setError('Esta sala já terminou.'); setLoading(false); return; }
      if (Object.keys(data.players || {}).length >= 2) { setError('Sala cheia (máx. 2 jogadores).'); setLoading(false); return; }
      await update(ref(db, `rooms/${code}/players/${playerId.current}`), {
        name: playerName.trim(), score: -1, submittedAt: 0
      });
      setRoomCode(code);
      subscribeRoom(code);
    } catch { setError('Erro ao entrar na sala.'); }
    setLoading(false);
  };

  /* ── Solo start ── */
  const startSolo = () => {
    if (!playerName.trim()) { setError('Digite seu nome.'); return; }
    const cIdx = selectedChallenge;
    setChallengeIndex(cIdx);
    setPlayerCode(CHALLENGES[cIdx].starterCss);
    setTimeLeft(180);
    setPlayerScore(-1);
    setScoreDetails([]);
    setSubmitted(false);
    setView('battle');
  };

  /* ── Tab key handler ── */
  const handleTabKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const ta = e.currentTarget;
    const s = ta.selectionStart;
    const val = ta.value.substring(0, s) + '  ' + ta.value.substring(ta.selectionEnd);
    setPlayerCode(val);
    setTimeout(() => { ta.selectionStart = ta.selectionEnd = s + 2; }, 0);
  };

  /* ── Copy room code ── */
  const copyCode = () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    });
  };

  const fmtTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const challenge = CHALLENGES[challengeIndex];

  const inputStyle: React.CSSProperties = {
    width: '100%', background: inputBg, border: `1px solid ${border}`,
    color: text, borderRadius: 10, padding: '12px 14px', fontSize: 14,
    outline: 'none', boxSizing: 'border-box',
  };

  const btnPrimary: React.CSSProperties = {
    width: '100%', background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white', border: 'none', borderRadius: 10, padding: '14px',
    fontSize: 14, fontWeight: 700, cursor: 'pointer',
  };

  /* ══════════════════════════════════════════════════════
      MENU
  ══════════════════════════════════════════════════════ */
  if (view === 'menu') return (
    <div style={{ minHeight: '100vh', background: bg, color: text }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px' }}>

        <div style={{ padding: '20px 0 0' }}>
          <button onClick={onBackToHub} style={{ background: 'none', border: `1px solid ${border}`, color: dim, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <ArrowLeft size={14} /> Hub
          </button>
        </div>

        <div style={{ textAlign: 'center', padding: '48px 0 40px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>⚔️</div>
          <h1 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 22, margin: '0 0 12px', background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            CSS BATTLE
          </h1>
          <p style={{ color: dim, fontSize: 14, margin: 0 }}>
            Desafie um colega a recriar layouts CSS · pontuação automática por propriedades
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 48 }}>
          {[
            { mode: 'create' as GameMode, icon: '🏠', title: 'Criar Sala', desc: 'Crie uma sala e compartilhe o código com seu colega para batalhar.', glow: 'rgba(102,126,234,0.2)' },
            { mode: 'join' as GameMode, icon: '🔗', title: 'Entrar em Sala', desc: 'Digite o código de 4 letras para entrar na sala de um colega.', glow: 'rgba(52,152,219,0.2)' },
            { mode: 'solo' as GameMode, icon: '🎮', title: 'Praticar Solo', desc: 'Treine os desafios no seu próprio ritmo sem competição.', glow: 'rgba(34,197,94,0.2)' },
          ].map(card => (
            <button key={card.mode}
              onClick={() => { setMode(card.mode); setView('setup'); setError(''); }}
              style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, padding: '28px 24px', cursor: 'pointer', textAlign: 'left', transition: 'transform 0.15s, box-shadow 0.15s' }}
              onMouseEnter={e => { (e.currentTarget).style.transform = 'translateY(-2px)'; (e.currentTarget).style.boxShadow = `0 8px 32px ${card.glow}`; }}
              onMouseLeave={e => { (e.currentTarget).style.transform = ''; (e.currentTarget).style.boxShadow = ''; }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{card.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: text, marginBottom: 6 }}>{card.title}</div>
              <div style={{ fontSize: 12, color: dim, lineHeight: 1.6 }}>{card.desc}</div>
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 12, fontWeight: 700, color: dim, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Desafios disponíveis</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {CHALLENGES.map(ch => (
              <div key={ch.id} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 22 }}>{ch.emoji}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: text }}>{ch.title}</div>
                  <div style={{ fontSize: 11, color: DIFF_COLOR[ch.difficulty] }}>{ch.difficulty} · {ch.points}pts</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════
      SETUP
  ══════════════════════════════════════════════════════ */
  if (view === 'setup') return (
    <div style={{ minHeight: '100vh', background: bg, color: text, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 20, padding: '40px 36px', width: '100%', maxWidth: 440 }}>
        <button onClick={() => setView('menu')} style={{ background: 'none', border: 'none', color: dim, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginBottom: 24, padding: 0 }}>
          <ArrowLeft size={14} /> Voltar
        </button>

        <div style={{ fontSize: 32, marginBottom: 8 }}>{mode === 'create' ? '🏠' : mode === 'join' ? '🔗' : '🎮'}</div>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 24px', color: text }}>
          {mode === 'create' ? 'Criar Sala' : mode === 'join' ? 'Entrar em Sala' : 'Praticar Solo'}
        </h2>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: dim, display: 'block', marginBottom: 6 }}>Seu nome</label>
          <input value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder="Ex: Maria Silva" maxLength={24} style={inputStyle} />
        </div>

        {mode === 'join' && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: dim, display: 'block', marginBottom: 6 }}>Código da sala (4 letras)</label>
            <input
              value={joinCodeInput} onChange={e => setJoinCodeInput(e.target.value.toUpperCase().slice(0, 4))} placeholder="Ex: XKCD" maxLength={4}
              style={{ ...inputStyle, fontSize: 24, letterSpacing: '0.3em', fontFamily: 'monospace', textAlign: 'center', textTransform: 'uppercase' }}
            />
          </div>
        )}

        {mode === 'solo' && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: dim, display: 'block', marginBottom: 8 }}>Escolha o desafio</label>
            <div style={{ display: 'grid', gap: 6 }}>
              {CHALLENGES.map(ch => (
                <button key={ch.id} onClick={() => setSelectedChallenge(ch.id)}
                  style={{ background: selectedChallenge === ch.id ? (isDark ? 'rgba(102,126,234,0.15)' : 'rgba(102,126,234,0.08)') : 'transparent', border: `1px solid ${selectedChallenge === ch.id ? 'rgba(102,126,234,0.5)' : border}`, borderRadius: 8, padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
                  <span style={{ fontSize: 18 }}>{ch.emoji}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: text }}>{ch.title}</div>
                    <div style={{ fontSize: 11, color: DIFF_COLOR[ch.difficulty] }}>{ch.difficulty} · {ch.points}pts</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div style={{ color: '#ef4444', fontSize: 12, marginBottom: 14, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: 8 }}>
            {error}
          </div>
        )}

        <button
          onClick={mode === 'create' ? createRoom : mode === 'join' ? joinRoom : startSolo}
          disabled={loading}
          style={{ ...btnPrimary, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Aguarde...' : mode === 'create' ? 'Criar Sala' : mode === 'join' ? 'Entrar' : 'Iniciar Desafio'}
        </button>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════
      LOBBY
  ══════════════════════════════════════════════════════ */
  if (view === 'lobby') return (
    <div style={{ minHeight: '100vh', background: bg, color: text, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 20, padding: '40px 36px', width: '100%', maxWidth: 420, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: text, margin: '0 0 8px' }}>Aguardando oponente...</h2>
        <p style={{ color: dim, fontSize: 13, margin: '0 0 32px' }}>Compartilhe o código abaixo com seu colega</p>

        <div style={{ background: inputBg, border: `2px dashed ${border}`, borderRadius: 16, padding: '24px', marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: dim, marginBottom: 8, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Código da sala</div>
          <div style={{ fontFamily: 'monospace', fontSize: 44, fontWeight: 900, letterSpacing: '0.2em', color: text }}>{roomCode}</div>
        </div>

        <button onClick={copyCode}
          style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 auto 24px', background: copiedCode ? 'rgba(34,197,94,0.1)' : 'rgba(102,126,234,0.1)', border: `1px solid ${copiedCode ? 'rgba(34,197,94,0.3)' : 'rgba(102,126,234,0.3)'}`, color: copiedCode ? '#22c55e' : '#667eea', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          {copiedCode ? <><Check size={14} /> Copiado!</> : <><Copy size={14} /> Copiar código</>}
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', color: dim }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
            Você: <strong style={{ color: text }}>{playerName}</strong>
          </div>
          {opponentData ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', color: dim }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#667eea' }} />
              Oponente: <strong style={{ color: '#667eea' }}>{opponentData.name}</strong> — conectando...
            </div>
          ) : (
            <div style={{ color: dim, fontSize: 12 }}>Esperando o segundo jogador entrar...</div>
          )}
        </div>

        <button onClick={() => { unsubRef.current?.(); setView('menu'); }}
          style={{ marginTop: 28, background: 'none', border: 'none', color: dim, cursor: 'pointer', fontSize: 12 }}>
          Cancelar
        </button>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════
      BATTLE
  ══════════════════════════════════════════════════════ */
  if (view === 'battle') return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: bg, overflow: 'hidden' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', height: 52, background: cardBg, borderBottom: `1px solid ${border}`, gap: 10, flexShrink: 0 }}>
        <button onClick={onBackToHub} style={{ background: 'none', border: `1px solid ${border}`, color: dim, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <ArrowLeft size={12} /> Hub
        </button>
        <span style={{ fontSize: 16, flexShrink: 0 }}>{challenge.emoji}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{challenge.title}</span>
        <span style={{ fontSize: 10, color: DIFF_COLOR[challenge.difficulty], background: `${DIFF_COLOR[challenge.difficulty]}22`, padding: '2px 8px', borderRadius: 999, flexShrink: 0 }}>{challenge.difficulty}</span>
        <div style={{ flex: 1 }} />
        {opponentData && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: dim, flexShrink: 0 }}>
            <Users size={12} />
            <span style={{ display: 'none' }} className="sm:inline">{opponentData.name}:</span>
            <span style={{ color: opponentData.score >= 0 ? '#22c55e' : dim, fontWeight: 600 }}>
              {opponentData.score >= 0 ? `${opponentData.score}%` : '🎮'}
            </span>
          </div>
        )}
        {mode !== 'solo' && roomCode && (
          <div style={{ fontSize: 10, color: dim, fontFamily: 'monospace', padding: '3px 8px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 6, flexShrink: 0 }}>
            🏠 {roomCode}
          </div>
        )}
        <div style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 700, minWidth: 60, textAlign: 'right', flexShrink: 0, color: timeLeft <= 30 ? '#ef4444' : timeLeft <= 60 ? '#f59e0b' : text }}>
          {fmtTime(timeLeft)}
        </div>
      </div>

      {/* Hint */}
      <div style={{ padding: '5px 16px', background: isDark ? 'rgba(102,126,234,0.07)' : 'rgba(102,126,234,0.04)', borderBottom: `1px solid ${border}`, fontSize: 11, color: dim, flexShrink: 0 }}>
        💡 {challenge.hint}
      </div>

      {/* Three panels */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* Editor */}
        <div style={{ width: '38%', minWidth: 220, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${border}` }}>
          <div style={{ padding: '5px 12px', fontSize: 10, color: dim, background: '#1e1e2e', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0, letterSpacing: '0.08em' }}>
            CSS EDITOR {submitted && <span style={{ color: '#22c55e', marginLeft: 8 }}>✓ Enviado</span>}
          </div>
          <textarea
            value={playerCode}
            onChange={e => { if (!submitted) setPlayerCode(e.target.value); }}
            onKeyDown={handleTabKey}
            disabled={submitted}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            style={{ flex: 1, background: '#1e1e2e', color: '#cdd6f4', fontFamily: 'monospace', fontSize: 13, padding: 14, border: 'none', outline: 'none', resize: 'none', lineHeight: 1.7, opacity: submitted ? 0.65 : 1 }}
          />
        </div>

        {/* Student preview */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${border}`, minWidth: 0 }}>
          <div style={{ padding: '5px 12px', fontSize: 10, color: dim, background: cardBg, borderBottom: `1px solid ${border}`, flexShrink: 0, letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 8 }}>
            SEU PREVIEW
            {submitted && playerScore >= 0 && (
              <span style={{ color: playerScore >= 80 ? '#22c55e' : playerScore >= 50 ? '#f59e0b' : '#ef4444', fontWeight: 700, fontSize: 13 }}>
                {playerScore}%
              </span>
            )}
          </div>
          <iframe ref={previewRef} title="preview" style={{ flex: 1, border: 'none' }} />
        </div>

        {/* Target */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ padding: '5px 12px', fontSize: 10, color: dim, background: cardBg, borderBottom: `1px solid ${border}`, flexShrink: 0, letterSpacing: '0.08em' }}>
            🎯 ALVO
          </div>
          <iframe ref={targetRef} title="target" style={{ flex: 1, border: 'none' }} />
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ padding: '10px 16px', borderTop: `1px solid ${border}`, background: cardBg, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, flexWrap: 'wrap' }}>
        {!submitted ? (
          <button onClick={handleSubmit}
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', border: 'none', borderRadius: 8, padding: '10px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <Zap size={14} /> Enviar Resposta
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 700 }}>✓ Enviado</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: playerScore >= 80 ? '#22c55e' : playerScore >= 50 ? '#f59e0b' : '#ef4444' }}>
              {playerScore}%
            </span>
          </div>
        )}

        {submitted && scoreDetails.length > 0 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
            {scoreDetails.map((d, i) => (
              <span key={i} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 999, background: d.passed ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: d.passed ? '#22c55e' : '#ef4444', border: `1px solid ${d.passed ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, whiteSpace: 'nowrap' }}>
                {d.passed ? '✓' : '✗'} {d.label}
              </span>
            ))}
          </div>
        )}

        {mode === 'solo' && submitted && (
          <button onClick={() => setView('results')}
            style={{ background: 'rgba(102,126,234,0.1)', color: '#667eea', border: '1px solid rgba(102,126,234,0.3)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
            Ver resultado →
          </button>
        )}
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════
      RESULTS
  ══════════════════════════════════════════════════════ */
  if (view === 'results') {
    const myName = playerName || 'Você';
    const opName = opponentData?.name || '';
    const opScore = opponentData?.score ?? -1;
    const isDuo = mode !== 'solo' && opponentData !== null;

    let winnerMsg = '';
    let winnerColor = '#667eea';
    if (isDuo) {
      if (playerScore > opScore) { winnerMsg = `🏆 ${myName} venceu!`; winnerColor = '#22c55e'; }
      else if (opScore > playerScore) { winnerMsg = `🏆 ${opName} venceu!`; winnerColor = '#ef4444'; }
      else { winnerMsg = '🤝 Empate!'; winnerColor = '#f59e0b'; }
    } else {
      winnerMsg = playerScore >= 90 ? '🏆 Perfeito!' : playerScore >= 70 ? '🎉 Muito bom!' : playerScore >= 50 ? '💪 Continue praticando!' : '📚 Tente novamente!';
    }

    return (
      <div style={{ minHeight: '100vh', background: bg, color: text, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 20, padding: '40px 36px', width: '100%', maxWidth: 500, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>
            {playerScore >= 90 ? '🏆' : playerScore >= 70 ? '🎉' : playerScore >= 50 ? '💪' : '📚'}
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: winnerColor, margin: '0 0 6px' }}>{winnerMsg}</h2>
          <p style={{ color: dim, fontSize: 13, margin: '0 0 28px' }}>{challenge.emoji} {challenge.title}</p>

          <div style={{ display: 'grid', gridTemplateColumns: isDuo ? '1fr 1fr' : '1fr', gap: 12, marginBottom: 28 }}>
            <div style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', borderRadius: 14, padding: '20px 16px' }}>
              <div style={{ fontSize: 11, color: dim, marginBottom: 6 }}>{myName}</div>
              <div style={{ fontSize: 42, fontWeight: 900, color: playerScore >= 70 ? '#22c55e' : playerScore >= 50 ? '#f59e0b' : '#ef4444' }}>{playerScore}%</div>
            </div>
            {isDuo && (
              <div style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', borderRadius: 14, padding: '20px 16px' }}>
                <div style={{ fontSize: 11, color: dim, marginBottom: 6 }}>{opName}</div>
                <div style={{ fontSize: 42, fontWeight: 900, color: opScore >= 70 ? '#22c55e' : opScore >= 50 ? '#f59e0b' : '#ef4444' }}>{opScore >= 0 ? `${opScore}%` : '—'}</div>
              </div>
            )}
          </div>

          {scoreDetails.length > 0 && (
            <div style={{ textAlign: 'left', marginBottom: 28 }}>
              <div style={{ fontSize: 11, color: dim, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Detalhes — seu resultado</div>
              <div style={{ display: 'grid', gap: 5 }}>
                {scoreDetails.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, padding: '6px 10px', borderRadius: 8, background: d.passed ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)' }}>
                    <span style={{ color: d.passed ? '#22c55e' : '#ef4444', fontWeight: 700, minWidth: 14 }}>{d.passed ? '✓' : '✗'}</span>
                    <span style={{ color: text }}>{d.label}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 10, color: dim }}>peso {d.weight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => { unsubRef.current?.(); setOpponentData(null); setRoomCode(''); setView('menu'); }}
              style={{ flex: 1, background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: 10, padding: '12px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <RefreshCw size={14} /> Novo Jogo
            </button>
            <button onClick={onBackToHub}
              style={{ flex: 1, background: 'none', border: `1px solid ${border}`, color: dim, borderRadius: 10, padding: '12px', fontSize: 13, cursor: 'pointer' }}>
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
