import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft, Play, Users, Trophy, Clock, CheckCircle, XCircle,
  Copy, Check, RotateCcw, Crown, Star, User, LogIn, Zap, Shield,
} from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, set, update as dbUpdate, onValue, get } from 'firebase/database';

/* ── Constants ─────────────────────────────────────────────────────────── */
const QUESTION_TIME = 25; // seconds per question
const REVIEW_TIME   = 5;  // seconds showing explanation after question
const TOTAL_Q       = 10; // questions per game
const FB_PATH       = 'godot_arena';

/* ── Animations ──────────────────────────────────────────────────────── */
const ANIM = `
  @keyframes gaSlideIn { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
  @keyframes gaTimerBar { from { width:100%; } to { width:0%; } }
  @keyframes gaPop { 0%{opacity:0;transform:scale(.7)} 60%{transform:scale(1.07)} 100%{opacity:1;transform:scale(1)} }
  @keyframes gaCorrect { 0%,100%{box-shadow:0 0 0 2px #22c55e} 50%{box-shadow:0 0 0 6px #22c55e44, 0 0 24px #22c55e55} }
  @keyframes gaWrong   { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 60%{transform:translateX(5px)} }
  @keyframes gaCrown   { 0%{transform:rotate(-15deg) scale(0)} 60%{transform:rotate(5deg) scale(1.1)} 100%{transform:rotate(0) scale(1)} }
  @keyframes gaPulse   { 0%,100%{opacity:1} 50%{opacity:0.6} }
`;

/* ── Godot Logo SVG ─────────────────────────────────────────────────── */
const GodotLogo = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 400 400" fill="none">
    <circle cx="200" cy="200" r="195" fill="#478cbf"/>
    <ellipse cx="200" cy="185" rx="80" ry="75" fill="white" opacity="0.97"/>
    <ellipse cx="200" cy="185" rx="55" ry="50" fill="#478cbf"/>
    <circle cx="175" cy="168" r="14" fill="white"/>
    <circle cx="225" cy="168" r="14" fill="white"/>
    <circle cx="178" cy="170" r="5" fill="#1a1a2e"/>
    <circle cx="228" cy="170" r="5" fill="#1a1a2e"/>
    <path d="M160 240 Q200 275 240 240 L245 265 Q200 305 155 265Z" fill="white" opacity="0.95"/>
    <path d="M120 195 L140 185 L145 210 L125 215Z" fill="white" opacity="0.9"/>
    <path d="M280 195 L260 185 L255 210 L275 215Z" fill="white" opacity="0.9"/>
  </svg>
);

/* ── Question Bank ──────────────────────────────────────────────────── */
type Diff = 'facil' | 'medio' | 'dificil';

interface Question {
  id: number;
  diff: Diff;
  topic: string;
  q: string;
  code?: string;
  opts: string[];
  ans: number;
  exp: string;
}

const QUESTIONS: Question[] = [
  /* ── FÁCIL ─────────────────────────────────────────────────────── */
  {
    id: 1, diff: 'facil', topic: 'Variáveis',
    q: 'Como declarar uma variável chamada "vida" com valor 100 em GDScript?',
    opts: ['var vida = 100', 'int vida = 100', 'variable vida = 100', 'let vida = 100'],
    ans: 0,
    exp: 'Em GDScript usamos "var" para criar variáveis. O tipo é descoberto automaticamente!',
  },
  {
    id: 2, diff: 'facil', topic: 'print()',
    q: 'Qual é a saída desse código?',
    code: 'print(2 + 3)',
    opts: ['5', '23', '"2 + 3"', 'Erro'],
    ans: 0,
    exp: 'print() mostra o resultado da expressão. 2 + 3 = 5!',
  },
  {
    id: 3, diff: 'facil', topic: 'Strings',
    q: 'Qual é a saída desse código?',
    code: 'print("Olá " + "mundo")',
    opts: ['Olá mundo', 'Erro de tipo', '"Olá mundo"', 'OláMundo'],
    ans: 0,
    exp: 'O operador + junta (concatena) strings em GDScript. Muito simples!',
  },
  {
    id: 4, diff: 'facil', topic: 'Funções',
    q: 'Como definir uma função chamada "pular" em GDScript?',
    opts: ['func pular():', 'function pular() {', 'def pular():', 'void pular() {'],
    ans: 0,
    exp: 'Em GDScript funções usam "func". O bloco começa após os dois pontos (:).',
  },
  {
    id: 5, diff: 'facil', topic: 'if / else',
    q: 'O que esse código exibe quando vida = 0?',
    code: 'if vida > 0:\n    print("Vivo!")\nelse:\n    print("Game Over!")',
    opts: ['Game Over!', 'Vivo!', 'Nada', 'Erro'],
    ans: 0,
    exp: 'vida = 0 não é maior que 0, então o "else" é executado: "Game Over!"',
  },
  {
    id: 6, diff: 'facil', topic: 'for',
    q: 'Quantas vezes "oi" é impresso?',
    code: 'for i in range(5):\n    print("oi")',
    opts: ['5 vezes', '4 vezes', '6 vezes', '1 vez'],
    ans: 0,
    exp: 'range(5) gera [0,1,2,3,4] — 5 valores. O loop roda uma vez para cada.',
  },
  {
    id: 7, diff: 'facil', topic: 'Booleanos',
    q: 'Qual é o valor de "true and false" em GDScript?',
    opts: ['false', 'true', '0', 'Erro'],
    ans: 0,
    exp: 'O operador "and" retorna true só se AMBOS os lados forem true. Um é false, então false.',
  },
  {
    id: 8, diff: 'facil', topic: 'Arrays',
    q: 'Como criar um array com os números 1, 2 e 3?',
    opts: ['var arr = [1, 2, 3]', 'var arr = (1, 2, 3)', 'var arr = {1, 2, 3}', 'array arr = [1, 2, 3]'],
    ans: 0,
    exp: 'Arrays em GDScript usam colchetes [ ]. Declarados com var como qualquer variável.',
  },
  {
    id: 9, diff: 'facil', topic: 'Operadores',
    q: 'Qual é a saída?',
    code: 'var x = 10\nprint(x * 2)',
    opts: ['20', '10', 'x * 2', 'Erro'],
    ans: 0,
    exp: 'x vale 10. 10 * 2 = 20. O print exibe 20.',
  },
  {
    id: 10, diff: 'facil', topic: 'Comentários',
    q: 'Como escrever um comentário de linha em GDScript?',
    opts: ['# Comentário', '// Comentário', '/* Comentário */', '-- Comentário'],
    ans: 0,
    exp: 'Em GDScript o # inicia um comentário. Tudo depois dele na linha é ignorado pelo Godot.',
  },
  /* ── MÉDIO ─────────────────────────────────────────────────────── */
  {
    id: 11, diff: 'medio', topic: 'len()',
    q: 'Qual é a saída?',
    code: 'var frutas = ["maçã", "banana", "uva"]\nprint(len(frutas))',
    opts: ['3', '2', '0', 'Erro'],
    ans: 0,
    exp: 'len() retorna o número de elementos. O array tem 3 frutas → 3.',
  },
  {
    id: 12, diff: 'medio', topic: 'range()',
    q: 'Qual é o resultado de range(4)?',
    opts: ['[0, 1, 2, 3]', '[1, 2, 3, 4]', '[0, 1, 2, 3, 4]', '[4]'],
    ans: 0,
    exp: 'range(n) gera de 0 até n-1. range(4) = [0, 1, 2, 3].',
  },
  {
    id: 13, diff: 'medio', topic: 'Sinais',
    q: 'O que "signal pulou" faz em GDScript?',
    opts: [
      'Declara um sinal chamado pulou',
      'Emite o sinal pulou imediatamente',
      'Conecta o sinal pulou a uma função',
      'Remove o sinal pulou',
    ],
    ans: 0,
    exp: '"signal" apenas declara. Para emitir usa-se: pulou.emit() (Godot 4) ou emit_signal("pulou").',
  },
  {
    id: 14, diff: 'medio', topic: '@export',
    q: 'Qual a diferença entre "var vida" e "@export var vida"?',
    opts: [
      '@export mostra a variável no Inspetor do Godot',
      '@export deixa a variável mais rápida',
      '@export salva automaticamente',
      'Não há diferença alguma',
    ],
    ans: 0,
    exp: '@export expõe a variável no Inspetor, onde pode ser editada sem abrir o código.',
  },
  {
    id: 15, diff: 'medio', topic: 'Nós',
    q: 'O que "$Sprite2D" faz no script?',
    opts: [
      'Pega o nó filho chamado Sprite2D',
      'Cria um novo nó Sprite2D',
      'Remove o nó Sprite2D da cena',
      'Move o Sprite2D para cima',
    ],
    ans: 0,
    exp: '$ é atalho para get_node(). $Sprite2D busca e retorna o nó filho chamado Sprite2D.',
  },
  {
    id: 16, diff: 'medio', topic: 'Depuração',
    q: 'Qual o erro nesse código?',
    code: 'func _ready()\n    print("Iniciou!")',
    opts: [
      'Falta ":" após _ready()',
      'print usa aspas erradas',
      '_ready() é escrito errado',
      'O código está correto',
    ],
    ans: 0,
    exp: 'Funções em GDScript precisam de dois pontos após os parênteses: func _ready():',
  },
  {
    id: 17, diff: 'medio', topic: 'while',
    q: 'Qual é a saída?',
    code: 'var i = 0\nwhile i < 3:\n    print(i)\n    i += 1',
    opts: ['0  1  2', '1  2  3', '0  1  2  3', 'Loop infinito'],
    ans: 0,
    exp: 'i começa em 0, incrementa até 3. Imprime 0, 1, 2 e para quando i = 3.',
  },
  {
    id: 18, diff: 'medio', topic: 'Dicionários',
    q: 'Como acessar o valor "Ana" nesse dicionário?',
    code: 'var jogador = {"nome": "Ana", "vida": 100}',
    opts: ['jogador["nome"]', 'jogador.get(0)', 'jogador[0]', 'jogador.nome()'],
    ans: 0,
    exp: 'Dicionários são acessados pela chave: jogador["nome"] retorna "Ana".',
  },
  /* ── DIFÍCIL ───────────────────────────────────────────────────── */
  {
    id: 19, diff: 'dificil', topic: '@onready',
    q: 'O que "@onready var sprite = $Sprite2D" garante?',
    opts: [
      'Que sprite só é atribuído depois da cena estar pronta',
      'Que o Sprite2D é criado automaticamente',
      'Que sprite é exportado para o Inspetor',
      'Que sprite é null até ser atribuído',
    ],
    ans: 0,
    exp: '@onready faz a atribuição em _ready(), garantindo que todos os nós filhos existem.',
  },
  {
    id: 20, diff: 'dificil', topic: 'delta',
    q: 'Para que serve o parâmetro "delta" em _process(delta)?',
    opts: [
      'É o tempo decorrido desde o último frame',
      'É a velocidade atual do personagem',
      'É a posição do mouse na tela',
      'É o número do frame atual',
    ],
    ans: 0,
    exp: 'Multiplicar por delta garante que o movimento seja igual em qualquer FPS. Ex: posição += velocidade * delta',
  },
  {
    id: 21, diff: 'dificil', topic: 'Arrays',
    q: 'Qual é a saída?',
    code: 'var arr = [10, 20, 30]\nprint(arr[1])',
    opts: ['20', '10', '30', 'Erro'],
    ans: 0,
    exp: 'Arrays começam no índice 0. arr[0]=10, arr[1]=20, arr[2]=30.',
  },
  {
    id: 22, diff: 'dificil', topic: 'match',
    q: 'Qual palavra-chave substitui o "switch" de outras linguagens em GDScript?',
    opts: ['match', 'switch', 'case', 'select'],
    ans: 0,
    exp: 'GDScript usa "match" como estrutura de múltipla escolha. Mais poderoso que switch!',
  },
  {
    id: 23, diff: 'dificil', topic: 'Arrays',
    q: 'Qual é a saída?',
    code: 'var arr = [3, 1, 4, 1, 5]\narr.sort()\nprint(arr[0])',
    opts: ['1', '3', '5', '4'],
    ans: 0,
    exp: 'sort() ordena em ordem crescente: [1,1,3,4,5]. O primeiro elemento é 1.',
  },
  {
    id: 24, diff: 'dificil', topic: 'Funções com retorno',
    q: 'Qual é a saída?',
    code: 'func dobrar(n):\n    return n * 2\n\nprint(dobrar(7))',
    opts: ['14', '7', '2', 'Erro'],
    ans: 0,
    exp: 'dobrar(7) retorna 7 * 2 = 14. O print exibe 14.',
  },
  {
    id: 25, diff: 'dificil', topic: 'Erros em runtime',
    q: 'O que acontece quando esse código executa?',
    code: 'var arr = [1, 2, 3]\nprint(arr[5])',
    opts: [
      'Erro: índice fora dos limites (5)',
      'Imprime null',
      'Imprime 0',
      'Imprime o último elemento',
    ],
    ans: 0,
    exp: 'O array só tem índices 0, 1 e 2. Acessar o índice 5 causa um erro de runtime.',
  },
];

/* ── Helpers ─────────────────────────────────────────────────────────── */
function genCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function calcScore(correct: boolean, elapsedMs: number): number {
  if (!correct) return 0;
  const secs = elapsedMs / 1000;
  if (secs <= 5)  return 300;
  if (secs <= 10) return 250;
  if (secs <= 15) return 200;
  if (secs <= 20) return 150;
  return 100;
}

function diffColor(d: Diff) {
  return d === 'facil' ? '#22c55e' : d === 'medio' ? '#f59e0b' : '#ef4444';
}

function diffLabel(d: Diff) {
  return d === 'facil' ? 'FÁCIL' : d === 'medio' ? 'MÉDIO' : 'DIFÍCIL';
}

/* ── Code Block ─────────────────────────────────────────────────────── */
function CodeBlock({ code, isDark }: { code: string; isDark: boolean }) {
  const keywords = ['var', 'func', 'if', 'else', 'elif', 'for', 'while', 'in', 'return', 'print', 'true', 'false', 'null', 'and', 'or', 'not', 'signal', 'match', '@export', '@onready', 'range', 'len'];
  const lines = code.split('\n');

  function highlightLine(line: string): React.ReactNode[] {
    const tokens: React.ReactNode[] = [];
    let rest = line;
    let key = 0;

    while (rest.length > 0) {
      // comment
      if (rest.startsWith('#')) {
        tokens.push(<span key={key++} style={{ color: '#6a9955' }}>{rest}</span>);
        rest = '';
        continue;
      }
      // string
      const strMatch = rest.match(/^("(?:[^"\\]|\\.)*")/);
      if (strMatch) {
        tokens.push(<span key={key++} style={{ color: '#ce9178' }}>{strMatch[1]}</span>);
        rest = rest.slice(strMatch[1].length);
        continue;
      }
      // number
      const numMatch = rest.match(/^(\d+\.?\d*)/);
      if (numMatch) {
        tokens.push(<span key={key++} style={{ color: '#b5cea8' }}>{numMatch[1]}</span>);
        rest = rest.slice(numMatch[1].length);
        continue;
      }
      // keyword
      const kw = keywords.find(k => rest.startsWith(k) && (rest.length === k.length || /\W/.test(rest[k.length])));
      if (kw) {
        tokens.push(<span key={key++} style={{ color: '#569cd6' }}>{kw}</span>);
        rest = rest.slice(kw.length);
        continue;
      }
      // function call
      const fnMatch = rest.match(/^([a-zA-Z_]\w*)\s*(?=\()/);
      if (fnMatch) {
        tokens.push(<span key={key++} style={{ color: '#dcdcaa' }}>{fnMatch[1]}</span>);
        rest = rest.slice(fnMatch[1].length);
        continue;
      }
      // default char
      tokens.push(<span key={key++} style={{ color: isDark ? '#d4d4d4' : '#1e1e1e' }}>{rest[0]}</span>);
      rest = rest.slice(1);
    }
    return tokens;
  }

  return (
    <div style={{
      background: isDark ? '#1e1e1e' : '#f5f5f5',
      border: `2px solid ${isDark ? '#333' : '#ddd'}`,
      borderLeft: '4px solid #478cbf',
      padding: '12px 16px',
      fontFamily: "'Courier New', monospace",
      fontSize: 14,
      lineHeight: 1.7,
      overflowX: 'auto',
      marginBottom: 4,
    }}>
      {lines.map((line, i) => (
        <div key={i} style={{ display: 'flex', gap: 12 }}>
          <span style={{ color: '#858585', userSelect: 'none', minWidth: 20, textAlign: 'right', fontSize: 11 }}>{i + 1}</span>
          <span>{highlightLine(line)}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Room / Firebase types ──────────────────────────────────────────── */
interface PlayerRoom {
  name: string;
  score: number;
  answered: boolean;
  answers: Record<number, { opt: number; correct: boolean; ms: number }>;
}

interface RoomData {
  hostId: string;
  status: 'waiting' | 'question' | 'review' | 'finished';
  players: Record<string, PlayerRoom>;
  qIndices: number[];
  currentQ: number;
  totalQ: number;
  qStartedAt: number;
  createdAt: number;
}

type View = 'menu' | 'lobby' | 'game' | 'results';
type Mode = 'solo' | 'create' | 'join';

/* ── Main Component ─────────────────────────────────────────────────── */
interface Props { onBack: () => void; isDark?: boolean; }

export default function GodotArenaPage({ onBack, isDark = true }: Props) {
  /* ── UI State ── */
  const [view,      setView]      = useState<View>('menu');
  const [mode,      setMode]      = useState<Mode>('solo');
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [copied,    setCopied]    = useState(false);
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('godot_arena_name') ?? '');
  const [codeInput, setCodeInput] = useState('');

  /* ── Room / Multiplayer State ── */
  const [roomCode,    setRoomCode]    = useState('');
  const [roomData,    setRoomData]    = useState<RoomData | null>(null);

  /* ── Game State (solo) ── */
  const [soloIndices,  setSoloIndices]  = useState<number[]>([]);
  const [soloQ,        setSoloQ]        = useState(0);
  const [soloScore,    setSoloScore]    = useState(0);
  const [soloAnswers,  setSoloAnswers]  = useState<Record<number, { opt: number; correct: boolean; ms: number }>>({});
  const [soloQStart,   setSoloQStart]   = useState(0);

  /* ── Shared answer state ── */
  const [selected,   setSelected]   = useState<number | null>(null);
  const [answered,   setAnswered]   = useState(false);
  const [timeLeft,   setTimeLeft]   = useState(QUESTION_TIME);
  const [reviewing,  setReviewing]  = useState(false);

  /* ── Refs ── */
  const playerIdRef    = useRef<string>('');
  const unsubRef       = useRef<(() => void) | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reviewTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hostAdvanceRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHost = mode === 'create';

  /* ── Init player ID ── */
  useEffect(() => {
    let pid = sessionStorage.getItem('godot_arena_pid');
    if (!pid) {
      pid = `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      sessionStorage.setItem('godot_arena_pid', pid);
    }
    playerIdRef.current = pid;
  }, []);

  /* ── Cleanup on unmount ── */
  useEffect(() => () => {
    unsubRef.current?.();
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (reviewTimerRef.current)   clearTimeout(reviewTimerRef.current);
    if (hostAdvanceRef.current)   clearTimeout(hostAdvanceRef.current);
  }, []);

  /* ── Derived values ── */
  const roomPlayers = roomData?.players ?? {};
  const playerList  = Object.entries(roomPlayers).map(([id, p]) => ({ id, ...p }));
  const qIndices    = roomData?.qIndices ?? [];
  const currentQMp  = roomData?.currentQ ?? 0;
  const totalQMp    = roomData?.totalQ ?? TOTAL_Q;
  const mpStatus    = roomData?.status ?? 'waiting';
  const qStartAt    = roomData?.qStartedAt ?? 0;

  const currentMpQuestion  = mpStatus === 'question' || mpStatus === 'review'
    ? QUESTIONS[qIndices[currentQMp]] : null;
  const currentSoloQuestion = soloIndices[soloQ] !== undefined
    ? QUESTIONS[soloIndices[soloQ]] : null;

  /* ── Firebase room subscription ── */
  const subscribeRoom = useCallback((code: string) => {
    unsubRef.current?.();
    const roomRef = ref(db, `${FB_PATH}/${code}`);
    const unsub = onValue(roomRef, snap => {
      const data: RoomData | null = snap.val();
      if (!data) return;
      setRoomData(data);
    });
    unsubRef.current = unsub;
  }, []);

  /* ── Timer (multiplayer) synced to Firebase questionStartedAt ── */
  useEffect(() => {
    if (view !== 'game' || mode === 'solo' || mpStatus !== 'question' || qStartAt === 0) return;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const tick = () => {
      const elapsed = Math.floor((Date.now() - qStartAt) / 1000);
      const left = Math.max(0, QUESTION_TIME - elapsed);
      setTimeLeft(left);
    };
    tick();
    timerIntervalRef.current = setInterval(tick, 500);
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [view, mode, mpStatus, qStartAt]);

  /* ── Timer (solo) ── */
  useEffect(() => {
    if (view !== 'game' || mode !== 'solo' || reviewing || answered) return;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    const start = soloQStart || Date.now();

    const tick = () => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const left = Math.max(0, QUESTION_TIME - elapsed);
      setTimeLeft(left);
      if (left === 0) handleSoloTimeUp();
    };
    tick();
    timerIntervalRef.current = setInterval(tick, 500);
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [view, mode, reviewing, answered, soloQ, soloQStart]);

  /* ── Host: advance question after all answered or time up ── */
  useEffect(() => {
    if (!isHost || view !== 'game' || mpStatus !== 'question' || qStartAt === 0) return;

    const allAnswered = playerList.length > 0 && playerList.every(p => p.answered);
    if (allAnswered) {
      advanceMpToReview();
      return;
    }

    if (hostAdvanceRef.current) clearTimeout(hostAdvanceRef.current);
    const elapsed = Date.now() - qStartAt;
    const remaining = Math.max(0, QUESTION_TIME * 1000 - elapsed);
    hostAdvanceRef.current = setTimeout(advanceMpToReview, remaining);
    return () => { if (hostAdvanceRef.current) clearTimeout(hostAdvanceRef.current); };
  }, [isHost, view, mpStatus, qStartAt, playerList.length, playerList.map(p=>p.answered).join(',')]);

  /* ── Host: advance from review to next question ── */
  useEffect(() => {
    if (!isHost || view !== 'game' || mpStatus !== 'review') return;
    if (reviewTimerRef.current) clearTimeout(reviewTimerRef.current);
    reviewTimerRef.current = setTimeout(advanceMpNextOrFinish, REVIEW_TIME * 1000);
    return () => { if (reviewTimerRef.current) clearTimeout(reviewTimerRef.current); };
  }, [isHost, view, mpStatus]);

  /* ── Sync mp review state to local ── */
  useEffect(() => {
    if (mode === 'solo') return;
    if (mpStatus === 'review') {
      setReviewing(true);
    } else if (mpStatus === 'question') {
      setReviewing(false);
      setAnswered(false);
      setSelected(null);
      setTimeLeft(QUESTION_TIME);
    } else if (mpStatus === 'finished') {
      setView('results');
    }
  }, [mpStatus, mode]);

  /* ── Solo: advance to review ── */
  function handleSoloTimeUp() {
    if (answered) return;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setAnswered(true);
    setReviewing(true);
    const q = QUESTIONS[soloIndices[soloQ]];
    setSoloAnswers(prev => ({ ...prev, [soloQ]: { opt: -1, correct: false, ms: QUESTION_TIME * 1000 } }));
    reviewTimerRef.current = setTimeout(advanceSoloNext, REVIEW_TIME * 1000);
  }

  function advanceSoloNext() {
    const next = soloQ + 1;
    if (next >= TOTAL_Q) {
      setView('results');
      return;
    }
    setSoloQ(next);
    setSoloQStart(Date.now());
    setSelected(null);
    setAnswered(false);
    setReviewing(false);
    setTimeLeft(QUESTION_TIME);
  }

  /* ── MP room helpers ── */
  async function advanceMpToReview() {
    if (!isHost) return;
    const roomRef = ref(db, `${FB_PATH}/${roomCode}`);
    const snap = await get(roomRef);
    const data: RoomData | null = snap.val();
    if (!data || data.status !== 'question') return;
    await dbUpdate(roomRef, { status: 'review' });
  }

  async function advanceMpNextOrFinish() {
    if (!isHost) return;
    const roomRef = ref(db, `${FB_PATH}/${roomCode}`);
    const snap = await get(roomRef);
    const data: RoomData | null = snap.val();
    if (!data || data.status !== 'review') return;

    const next = (data.currentQ ?? 0) + 1;
    if (next >= (data.totalQ ?? TOTAL_Q)) {
      await dbUpdate(roomRef, { status: 'finished' });
    } else {
      await dbUpdate(roomRef, {
        status: 'question',
        currentQ: next,
        qStartedAt: Date.now(),
        [`players/${playerIdRef.current}/answered`]: false,
      });
      // Reset answered for all players
      const updates: Record<string, any> = { status: 'question', currentQ: next, qStartedAt: Date.now() };
      Object.keys(data.players ?? {}).forEach(pid => {
        updates[`players/${pid}/answered`] = false;
      });
      await dbUpdate(roomRef, updates);
    }
  }

  /* ── Create Room ── */
  async function createRoom() {
    const name = playerName.trim();
    if (name.length < 2) { setError('Nome deve ter pelo menos 2 caracteres.'); return; }
    setLoading(true); setError('');
    localStorage.setItem('godot_arena_name', name);
    const code = genCode();
    const pid   = playerIdRef.current;
    const indices = shuffle(QUESTIONS.map((_, i) => i)).slice(0, TOTAL_Q);

    try {
      await set(ref(db, `${FB_PATH}/${code}`), {
        hostId: pid,
        status: 'waiting',
        players: {
          [pid]: { name, score: 0, answered: false, answers: {} },
        },
        qIndices: indices,
        currentQ: 0,
        totalQ: TOTAL_Q,
        qStartedAt: 0,
        createdAt: Date.now(),
      } satisfies RoomData);
      setRoomCode(code);
      setMode('create');
      subscribeRoom(code);
      setView('lobby');
    } catch {
      setError('Erro ao criar sala. Verifique a conexão.');
    }
    setLoading(false);
  }

  /* ── Join Room ── */
  async function joinRoom() {
    const name = playerName.trim();
    const code = codeInput.toUpperCase().trim();
    if (name.length < 2) { setError('Nome deve ter pelo menos 2 caracteres.'); return; }
    if (code.length !== 4) { setError('Código da sala tem 4 letras.'); return; }
    setLoading(true); setError('');
    localStorage.setItem('godot_arena_name', name);

    try {
      const snap = await get(ref(db, `${FB_PATH}/${code}`));
      const data: RoomData | null = snap.val();
      if (!data) { setError('Sala não encontrada.'); setLoading(false); return; }
      if (data.status !== 'waiting') { setError('Essa sala já começou ou terminou.'); setLoading(false); return; }

      const pid = playerIdRef.current;
      await dbUpdate(ref(db, `${FB_PATH}/${code}/players/${pid}`), {
        name, score: 0, answered: false, answers: {},
      });
      setRoomCode(code);
      setMode('join');
      subscribeRoom(code);
      setView('lobby');
    } catch {
      setError('Erro ao entrar na sala.');
    }
    setLoading(false);
  }

  /* ── Start Game (host) ── */
  async function startGame() {
    if (!isHost) return;
    await dbUpdate(ref(db, `${FB_PATH}/${roomCode}`), {
      status: 'question',
      currentQ: 0,
      qStartedAt: Date.now(),
    });
    setView('game');
  }

  /* ── Answer (solo) ── */
  function handleSoloAnswer(optIdx: number) {
    if (answered) return;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    const q = QUESTIONS[soloIndices[soloQ]];
    const elapsedMs = Date.now() - soloQStart;
    const correct = optIdx === q.ans;
    const pts = calcScore(correct, elapsedMs);
    setSelected(optIdx);
    setAnswered(true);
    setReviewing(true);
    setSoloScore(s => s + pts);
    setSoloAnswers(prev => ({ ...prev, [soloQ]: { opt: optIdx, correct, ms: elapsedMs } }));
    reviewTimerRef.current = setTimeout(advanceSoloNext, REVIEW_TIME * 1000);
  }

  /* ── Answer (multiplayer) ── */
  async function handleMpAnswer(optIdx: number) {
    if (answered || mpStatus !== 'question' || !currentMpQuestion) return;
    const elapsedMs = Date.now() - qStartAt;
    const correct = optIdx === currentMpQuestion.ans;
    const pts = calcScore(correct, elapsedMs);
    const pid = playerIdRef.current;
    const myPlayer = roomPlayers[pid];
    const newScore = (myPlayer?.score ?? 0) + pts;

    setSelected(optIdx);
    setAnswered(true);

    await dbUpdate(ref(db, `${FB_PATH}/${roomCode}/players/${pid}`), {
      answered: true,
      score: newScore,
      [`answers/${currentQMp}`]: { opt: optIdx, correct, ms: elapsedMs },
    });
  }

  /* ── Start Solo ── */
  function startSolo() {
    const name = playerName.trim();
    if (name.length < 2) { setError('Digite seu nome para começar.'); return; }
    localStorage.setItem('godot_arena_name', name);
    const indices = shuffle(QUESTIONS.map((_, i) => i)).slice(0, TOTAL_Q);
    setSoloIndices(indices);
    setSoloQ(0);
    setSoloScore(0);
    setSoloAnswers({});
    setSelected(null);
    setAnswered(false);
    setReviewing(false);
    setTimeLeft(QUESTION_TIME);
    setSoloQStart(Date.now());
    setMode('solo');
    setView('game');
  }

  /* ── Copy room code ── */
  function copyCode() {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  /* ── Leave room ── */
  function leaveRoom() {
    unsubRef.current?.();
    setRoomCode('');
    setRoomData(null);
    setView('menu');
    setError('');
    setSelected(null);
    setAnswered(false);
    setReviewing(false);
  }

  /* ── Theme ── */
  const bg     = isDark ? '#060a14' : '#eef2ff';
  const panel  = isDark ? '#0d1117' : '#ffffff';
  const panel2 = isDark ? '#161b22' : '#f0f4ff';
  const border = isDark ? '#30363d' : '#d0d7de';
  const text   = isDark ? '#e6edf3' : '#1c2128';
  const sub    = isDark ? '#8b949e' : '#57606a';
  const accent = '#478cbf';
  const accent2 = isDark ? '#6cb6ff' : '#0366d6';

  /* ══════════════════════════════════════════════════════
     RENDER MENU
  ══════════════════════════════════════════════════════ */
  if (view === 'menu') return (
    <div style={{ minHeight: '100vh', background: bg, color: text, fontFamily: 'system-ui,-apple-system,sans-serif' }}>
      <style>{ANIM}</style>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', borderBottom: `1px solid ${border}`, background: panel }}>
        <button onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: `1px solid ${border}`, color: sub, cursor: 'pointer', padding: '7px 14px', fontSize: 12 }}>
          <ChevronLeft size={13}/> Voltar
        </button>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 20px', animation: 'gaSlideIn .5s ease both' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <GodotLogo size={80}/>
          </div>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: accent, marginBottom: 12, letterSpacing: '0.2em' }}>
            TURMAS CT
          </div>
          <h1 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 'clamp(18px,4vw,28px)', color: text, margin: '0 0 14px', lineHeight: 1.4 }}>
            GODOT ARENA
          </h1>
          <p style={{ fontSize: 15, color: sub, margin: 0, lineHeight: 1.6 }}>
            Quiz de GDScript — desafie seus amigos em tempo real!
          </p>
        </div>

        {/* Name input */}
        <div style={{ marginBottom: 32, background: panel2, border: `1px solid ${border}`, padding: '20px 24px' }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: sub, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Seu nome no jogo
          </label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <User size={16} color={sub}/>
            <input
              value={playerName}
              onChange={e => { setPlayerName(e.target.value); setError(''); }}
              placeholder="Ex: Programador123"
              maxLength={20}
              style={{ flex: 1, padding: '10px 12px', background: panel, border: `1.5px solid ${border}`, color: text, fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
              onFocus={e => (e.currentTarget.style.borderColor = accent)}
              onBlur={e => (e.currentTarget.style.borderColor = border)}
            />
          </div>
          {error && <div style={{ marginTop: 8, fontSize: 12, color: '#ef4444' }}>{error}</div>}
        </div>

        {/* Mode cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
          {/* Solo */}
          <div style={{ background: panel2, border: `2px solid ${border}`, padding: '20px 24px', cursor: 'pointer', transition: 'all .15s' }}
            onClick={startSolo}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = accent; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = border; (e.currentTarget as HTMLElement).style.transform = 'none'; }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, background: `${accent}22`, border: `2px solid ${accent}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Zap size={22} color={accent}/>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: text, marginBottom: 4 }}>Praticar Solo</div>
                <div style={{ fontSize: 13, color: sub }}>10 perguntas de GDScript — treine antes do duelo!</div>
              </div>
              <Play size={18} color={accent} style={{ marginLeft: 'auto', flexShrink: 0 }}/>
            </div>
          </div>

          {/* Create room */}
          <div style={{ background: panel2, border: `2px solid ${border}`, padding: '20px 24px', cursor: 'pointer', transition: 'all .15s' }}
            onClick={createRoom}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#22c55e'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = border; (e.currentTarget as HTMLElement).style.transform = 'none'; }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, background: '#22c55e22', border: '2px solid #22c55e55', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Users size={22} color="#22c55e"/>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: text, marginBottom: 4 }}>Criar Sala</div>
                <div style={{ fontSize: 13, color: sub }}>Crie uma sala e compartilhe o código com a turma!</div>
              </div>
              {loading ? <div style={{ marginLeft: 'auto', width: 18, height: 18, border: `2px solid #22c55e`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'gaPulse 0.8s linear infinite' }}/> : <Play size={18} color="#22c55e" style={{ marginLeft: 'auto', flexShrink: 0 }}/>}
            </div>
          </div>

          {/* Join room */}
          <div style={{ background: panel2, border: `2px solid ${border}`, padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
              <div style={{ width: 48, height: 48, background: '#a855f722', border: '2px solid #a855f755', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <LogIn size={22} color="#a855f7"/>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: text, marginBottom: 4 }}>Entrar em Sala</div>
                <div style={{ fontSize: 13, color: sub }}>Já tem o código da sala? Entre agora!</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                value={codeInput}
                onChange={e => setCodeInput(e.target.value.toUpperCase())}
                placeholder="XXXX"
                maxLength={4}
                style={{ flex: 1, padding: '10px 14px', background: panel, border: `2px solid #a855f755`, color: text, fontSize: 20, fontFamily: "'Press Start 2P', monospace", textAlign: 'center', letterSpacing: '0.3em', outline: 'none', textTransform: 'uppercase' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#a855f7')}
                onBlur={e => (e.currentTarget.style.borderColor = '#a855f755')}
                onKeyDown={e => e.key === 'Enter' && joinRoom()}
              />
              <button onClick={joinRoom} disabled={loading}
                style={{ padding: '10px 20px', background: '#a855f7', border: 'none', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <LogIn size={14}/> ENTRAR
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { label: 'Perguntas no banco', val: QUESTIONS.length, color: accent },
            { label: 'Por partida', val: TOTAL_Q, color: '#22c55e' },
            { label: 'Segundos por questão', val: QUESTION_TIME, color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} style={{ padding: '12px 20px', background: panel2, border: `1px solid ${border}`, textAlign: 'center' }}>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 16, color: s.color, marginBottom: 4 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: sub }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════
     RENDER LOBBY
  ══════════════════════════════════════════════════════ */
  if (view === 'lobby') {
    const myName = playerName.trim();
    return (
      <div style={{ minHeight: '100vh', background: bg, color: text, fontFamily: 'system-ui,-apple-system,sans-serif' }}>
        <style>{ANIM}</style>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: `1px solid ${border}`, background: panel }}>
          <button onClick={leaveRoom}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: `1px solid ${border}`, color: sub, cursor: 'pointer', padding: '7px 14px', fontSize: 12 }}>
            <ChevronLeft size={13}/> Sair da Sala
          </button>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: accent }}>GODOT ARENA</span>
        </div>

        <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 20px', animation: 'gaSlideIn .5s ease both' }}>
          {/* Room code */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 13, color: sub, marginBottom: 12, fontWeight: 500 }}>Código da Sala</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, padding: '16px 32px', background: `${accent}15`, border: `3px solid ${accent}55` }}>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 32, color: accent, letterSpacing: '0.25em' }}>
                {roomCode}
              </span>
              <button onClick={copyCode}
                style={{ background: 'none', border: `1px solid ${accent}55`, color: accent, cursor: 'pointer', padding: 8, display: 'flex', alignItems: 'center' }}>
                {copied ? <Check size={16}/> : <Copy size={16}/>}
              </button>
            </div>
            <div style={{ fontSize: 12, color: sub, marginTop: 10 }}>
              {isHost ? 'Compartilhe esse código com a turma!' : 'Aguardando o host iniciar...'}
            </div>
          </div>

          {/* Players */}
          <div style={{ background: panel2, border: `1px solid ${border}`, marginBottom: 24 }}>
            <div style={{ padding: '12px 18px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={14} color={accent}/>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: accent }}>
                JOGADORES ({playerList.length})
              </span>
            </div>
            <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {playerList.map((p, i) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: panel, border: `1px solid ${border}`, animation: `gaSlideIn .3s ease ${i * 0.08}s both` }}>
                  {roomData?.hostId === p.id && <Crown size={14} color="#fbbf24"/>}
                  <User size={14} color={sub}/>
                  <span style={{ fontSize: 14, fontWeight: 600, color: p.name === myName ? accent : text }}>
                    {p.name}{p.name === myName ? ' (você)' : ''}
                  </span>
                  {roomData?.hostId === p.id && <span style={{ fontSize: 10, color: '#fbbf24', marginLeft: 'auto' }}>HOST</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Start button (host only) */}
          {isHost && (
            <button onClick={startGame} disabled={playerList.length < 1}
              style={{ width: '100%', padding: '16px', background: playerList.length >= 1 ? '#22c55e' : (isDark ? '#21262d' : '#e5e7eb'),
                border: 'none', color: playerList.length >= 1 ? '#fff' : sub,
                fontFamily: "'Press Start 2P', monospace", fontSize: 11, cursor: playerList.length >= 1 ? 'pointer' : 'not-allowed',
                boxShadow: playerList.length >= 1 ? '3px 3px 0 #15803d' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <Play size={14} fill="currentColor"/>
              INICIAR JOGO {playerList.length < 2 ? '(mínimo 2 para desafiar)' : ''}
            </button>
          )}
          {!isHost && (
            <div style={{ textAlign: 'center', padding: '20px', background: panel2, border: `1px solid ${border}` }}>
              <div style={{ animation: 'gaPulse 1.5s ease infinite', fontSize: 13, color: sub }}>
                Aguardando o host iniciar a partida...
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════
     RENDER GAME
  ══════════════════════════════════════════════════════ */
  if (view === 'game') {
    const question = mode === 'solo' ? currentSoloQuestion : currentMpQuestion;
    const qNumber  = mode === 'solo' ? soloQ + 1 : currentQMp + 1;
    const total    = mode === 'solo' ? TOTAL_Q : totalQMp;
    const myAnswer = mode === 'solo' ? soloAnswers[soloQ] : undefined;
    const myMpPlayer = roomPlayers[playerIdRef.current];
    const myScore  = mode === 'solo' ? soloScore : (myMpPlayer?.score ?? 0);
    const isReviewPhase = mode === 'solo' ? reviewing : mpStatus === 'review';
    const myOptPicked = mode === 'solo' ? (myAnswer?.opt ?? selected) : selected;

    if (!question) {
      return (
        <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: sub }}>Carregando...</div>
        </div>
      );
    }

    const timerPct = (timeLeft / QUESTION_TIME) * 100;
    const timerColor = timerPct > 50 ? '#22c55e' : timerPct > 25 ? '#f59e0b' : '#ef4444';

    return (
      <div style={{ minHeight: '100vh', background: bg, color: text, fontFamily: 'system-ui,-apple-system,sans-serif' }}>
        <style>{ANIM}</style>

        {/* Header */}
        <div style={{ padding: '12px 20px', borderBottom: `1px solid ${border}`, background: panel, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <GodotLogo size={28}/>
            <div>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: accent }}>GODOT ARENA</div>
              <div style={{ fontSize: 11, color: sub, marginTop: 2 }}>
                {mode === 'solo' ? 'Solo' : `Sala ${roomCode}`}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            {/* Progress */}
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: sub }}>
              {qNumber} / {total}
            </div>
            {/* Score */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Star size={14} color="#fbbf24" fill="#fbbf24"/>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: '#fbbf24' }}>{myScore}</span>
            </div>
            {/* Timer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={14} color={isReviewPhase ? sub : timerColor}/>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: isReviewPhase ? sub : timerColor, minWidth: 24 }}>
                {isReviewPhase ? '' : timeLeft}
              </span>
            </div>
          </div>
        </div>

        {/* Timer bar */}
        <div style={{ height: 4, background: isDark ? '#21262d' : '#e5e7eb' }}>
          {!isReviewPhase && (
            <div style={{ height: '100%', background: timerColor, width: `${timerPct}%`, transition: 'width 0.5s linear, background 0.5s' }}/>
          )}
        </div>

        <div style={{ maxWidth: 780, margin: '0 auto', padding: '28px 20px' }}>
          {/* Question meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ padding: '3px 10px', fontSize: 10, fontWeight: 700, color: diffColor(question.diff), background: `${diffColor(question.diff)}18`, border: `1px solid ${diffColor(question.diff)}44` }}>
              {diffLabel(question.diff)}
            </span>
            <span style={{ fontSize: 12, color: sub, fontWeight: 600 }}>{question.topic}</span>
          </div>

          {/* Question text */}
          <div style={{ fontSize: 18, fontWeight: 700, color: text, marginBottom: 18, lineHeight: 1.5 }}>
            {question.q}
          </div>

          {/* Code block */}
          {question.code && <CodeBlock code={question.code} isDark={isDark}/>}

          {/* Options */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 24, marginTop: question.code ? 18 : 0 }}>
            {question.opts.map((opt, i) => {
              const isSelected = myOptPicked === i;
              const isCorrect  = i === question.ans;
              let borderC = border;
              let bgC     = panel2;
              let textC   = text;
              let anim    = '';

              if (isReviewPhase || answered) {
                if (isCorrect)                { borderC = '#22c55e'; bgC = '#22c55e15'; textC = '#22c55e'; anim = 'gaCorrect 1.5s ease infinite'; }
                else if (isSelected && !isCorrect) { borderC = '#ef4444'; bgC = '#ef444415'; textC = '#ef4444'; anim = 'gaWrong .4s ease'; }
                else                          { borderC = border; bgC = isDark ? '#21262d' : '#f0f4ff'; textC = sub; }
              } else {
                if (isSelected) { borderC = accent; bgC = `${accent}15`; textC = accent; }
              }

              const canClick = !answered && !isReviewPhase && (mode === 'solo' || mpStatus === 'question');

              return (
                <button key={i} onClick={() => canClick && (mode === 'solo' ? handleSoloAnswer(i) : handleMpAnswer(i))}
                  style={{ padding: '14px 18px', background: bgC, border: `2px solid ${borderC}`, color: textC,
                    fontSize: 14, cursor: canClick ? 'pointer' : 'default', textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'inherit',
                    transition: 'all .15s', animation: anim,
                  }}
                  onMouseEnter={e => { if (canClick) (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; }}>
                  <div style={{ width: 28, height: 28, flexShrink: 0, background: isReviewPhase || answered ? 'transparent' : `${accent}22`, border: `2px solid ${borderC}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: borderC }}>
                    {isReviewPhase && isCorrect ? <CheckCircle size={15}/> :
                     isReviewPhase && isSelected && !isCorrect ? <XCircle size={15}/> :
                     ['A','B','C','D'][i]}
                  </div>
                  <span style={{ lineHeight: 1.4, fontFamily: opt.match(/^\d+[\s\n]/) ? "'Courier New', monospace" : 'inherit' }}>{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation (review phase) */}
          {(isReviewPhase) && (
            <div style={{ padding: '16px 20px', background: `${accent}12`, border: `2px solid ${accent}33`, animation: 'gaPop .35s ease both', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <Shield size={18} color={accent} style={{ flexShrink: 0, marginTop: 2 }}/>
              <div>
                <div style={{ fontWeight: 700, fontSize: 12, color: accent, marginBottom: 6, fontFamily: "'Press Start 2P', monospace" }}>
                  {(mode === 'solo' ? soloAnswers[soloQ]?.correct : selected !== null && selected === question.ans) ? 'Correto!' : 'Quase!'}
                </div>
                <div style={{ fontSize: 14, color: text, lineHeight: 1.6 }}>{question.exp}</div>
              </div>
            </div>
          )}

          {/* MP: waiting for others */}
          {mode !== 'solo' && answered && mpStatus === 'question' && (
            <div style={{ textAlign: 'center', padding: '16px', fontSize: 13, color: sub, animation: 'gaPulse 1.5s ease infinite' }}>
              Aguardando os outros jogadores...
            </div>
          )}

          {/* MP: scoreboard during review */}
          {mode !== 'solo' && mpStatus === 'review' && (
            <div style={{ marginTop: 20, background: panel2, border: `1px solid ${border}` }}>
              <div style={{ padding: '10px 16px', borderBottom: `1px solid ${border}` }}>
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: accent }}>PLACAR</span>
              </div>
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {playerList
                  .sort((a, b) => b.score - a.score)
                  .map((p, i) => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: p.id === playerIdRef.current ? `${accent}15` : 'transparent', border: p.id === playerIdRef.current ? `1px solid ${accent}44` : '1px solid transparent' }}>
                      {i === 0 ? <Crown size={13} color="#fbbf24"/> : <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: sub, minWidth: 18 }}>#{i+1}</span>}
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: p.id === playerIdRef.current ? accent : text }}>
                        {p.name}
                      </span>
                      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#fbbf24' }}>{p.score} pts</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════
     RENDER RESULTS
  ══════════════════════════════════════════════════════ */
  if (view === 'results') {
    const isSolo = mode === 'solo';
    const sortedPlayers = isSolo ? [] : playerList.sort((a, b) => b.score - a.score);
    const correctCount = isSolo
      ? Object.values(soloAnswers).filter(a => a.correct).length
      : (roomPlayers[playerIdRef.current]?.answers
          ? Object.values(roomPlayers[playerIdRef.current].answers).filter(a => a.correct).length
          : 0);
    const myFinalScore = isSolo ? soloScore : (roomPlayers[playerIdRef.current]?.score ?? 0);
    const myRank = isSolo ? 1 : sortedPlayers.findIndex(p => p.id === playerIdRef.current) + 1;

    return (
      <div style={{ minHeight: '100vh', background: bg, color: text, fontFamily: 'system-ui,-apple-system,sans-serif' }}>
        <style>{ANIM}</style>

        <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px', animation: 'gaSlideIn .5s ease both' }}>
          {/* Trophy */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 64, marginBottom: 16, animation: 'gaCrown .6s ease both' }}>
              <Trophy size={64} color="#fbbf24" fill="#fbbf24"/>
            </div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 14, color: text, marginBottom: 8 }}>
              {isSolo ? 'FIM DO QUIZ!' : myRank === 1 ? 'VOCÊ VENCEU!' : 'FIM DE JOGO!'}
            </div>
            <div style={{ fontSize: 13, color: sub }}>{playerName}</div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
            {[
              { label: 'Pontos', val: myFinalScore, color: '#fbbf24' },
              { label: 'Acertos', val: `${correctCount}/${TOTAL_Q}`, color: '#22c55e' },
              ...(!isSolo ? [{ label: 'Posição', val: `#${myRank}`, color: accent }] : []),
            ].map(s => (
              <div key={s.label} style={{ padding: '16px 24px', background: panel2, border: `2px solid ${s.color}44`, textAlign: 'center', animation: 'gaPop .4s ease both' }}>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 18, color: s.color, marginBottom: 6 }}>{s.val}</div>
                <div style={{ fontSize: 11, color: sub }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* MP leaderboard */}
          {!isSolo && (
            <div style={{ background: panel2, border: `1px solid ${border}`, marginBottom: 24 }}>
              <div style={{ padding: '12px 18px', borderBottom: `1px solid ${border}` }}>
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: accent }}>RANKING FINAL</span>
              </div>
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {sortedPlayers.map((p, i) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                    background: p.id === playerIdRef.current ? `${accent}15` : i % 2 === 0 ? (isDark ? '#ffffff08' : '#00000004') : 'transparent',
                    border: p.id === playerIdRef.current ? `1px solid ${accent}44` : '1px solid transparent',
                    animation: `gaSlideIn .3s ease ${i * 0.07}s both` }}>
                    <div style={{ width: 24, display: 'flex', justifyContent: 'center' }}>
                      {i === 0 ? <Crown size={14} color="#fbbf24"/> :
                       i === 1 ? <Crown size={14} color="#94a3b8"/> :
                       i === 2 ? <Crown size={14} color="#cd7c0f"/> :
                       <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: sub }}>#{i+1}</span>}
                    </div>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: p.id === playerIdRef.current ? accent : text }}>
                      {p.name}{p.id === playerIdRef.current ? ' (você)' : ''}
                    </span>
                    <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#fbbf24' }}>{p.score} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Solo review */}
          {isSolo && (
            <div style={{ background: panel2, border: `1px solid ${border}`, marginBottom: 24 }}>
              <div style={{ padding: '12px 18px', borderBottom: `1px solid ${border}` }}>
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: accent }}>REVISÃO DAS QUESTÕES</span>
              </div>
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {soloIndices.map((qI, idx) => {
                  const q = QUESTIONS[qI];
                  const a = soloAnswers[idx];
                  const wasCorrect = a?.correct;
                  return (
                    <div key={idx} style={{ padding: '10px 14px', background: wasCorrect ? '#22c55e12' : '#ef444412', border: `1px solid ${wasCorrect ? '#22c55e44' : '#ef444444'}`, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      {wasCorrect ? <CheckCircle size={15} color="#22c55e" style={{ flexShrink: 0, marginTop: 2 }}/> : <XCircle size={15} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }}/>}
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: text, marginBottom: 2 }}>Q{idx+1}: {q.q.slice(0, 60)}{q.q.length > 60 ? '...' : ''}</div>
                        <div style={{ fontSize: 11, color: sub }}>
                          {wasCorrect ? 'Correto' : `Errou → Certa: ${q.opts[q.ans]}`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={() => { leaveRoom(); }}
              style={{ flex: 1, padding: '12px', background: 'none', border: `2px solid ${border}`, color: sub, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit' }}>
              <ChevronLeft size={14}/> Menu
            </button>
            <button onClick={() => {
              if (isSolo) { startSolo(); }
              else { leaveRoom(); }
            }}
              style={{ flex: 1, padding: '12px', background: accent, border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit', boxShadow: '3px 3px 0 #2a6496' }}>
              <RotateCcw size={14}/> {isSolo ? 'Jogar Novamente' : 'Nova Sala'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
