import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft, Play, Square, RotateCcw, Eraser, Coins, Terminal, HelpCircle, X, Lock,
  Sun, Moon, Target, ChevronDown, ChevronUp, Check, BarChart3, GitBranch, Wrench,
} from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode';
import {
  CROPS, CROP_TO_ITEM, ITEM_NAMES, SHOP_ITEMS, SELL_RATES, EXPAND_LEVELS, MAX_GRID_SIZE, createInitialFarm, applyAction, isCropReady,
  actionDelayMs, shopItemLevel, canBuyShopItem, buyShopItem, canBuyStructure, buyStructure, canBuyExpand, buyExpand,
} from '../games/jsFarm/engine';
import { CropId, ItemId, FarmState, MainToWorker, SaveData, WorkerToMain } from '../games/jsFarm/types';
import { STRUCTURE_ORDER, STRUCTURE_TIERS, STRUCTURES, StructureId, buyableNow, createEmptyUnlocks } from '../games/jsFarm/curriculum';
import { validateCode, formatViolation } from '../games/jsFarm/validator';
import { useGameState } from '../hooks/useGameState';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTES
═══════════════════════════════════════════════════════════════ */
const SAVE_KEY = 'jsfarm-save-v2';
const THEME_KEY = 'jsfarm-theme';
const CELL = 56;

/** Cor de cada item colhido nos contadores do header (independente da cor
 *  da planta em si — feno/madeira/cenoura têm ícone e cor próprios ali). */
const ITEM_COLORS: Record<ItemId, string> = {
  feno: '#ca8a04', madeira: '#8b5e34', cenoura: '#ea7c1e',
  oleo: '#eab308', abobora: '#c2410c', fibra: '#4ade80',
};

/** Ícone que "voa" da casa colhida até o contador do item no header. */
interface Flight { id: string; item: ItemId; x1: number; y1: number; x2: number; y2: number }

const DEFAULT_CODE = `// Bem-vindo à Fazenda.js!
// A grama já cresce sozinha em qualquer casa vazia — não precisa
// plantar. drone.harvest() é EXATO: se ainda não estiver madura,
// falha na hora (retorna 0), sem esperar.

await drone.harvest();
await drone.move('right');
await drone.harvest();
await drone.move('right');
await drone.harvest();

// A primeira casa já deve estar pronta quando você voltar — mas a
// grama que acabou de crescer nas últimas provavelmente não.
await drone.move('left');
await drone.move('left');
await drone.harvest();

// Cansativo controlar isso na mão, né? Compre "Laços" na loja (custa
// só Feno, o item que a grama rende) e use drone.canHarvest() pra checar,
// decidindo no seu código quando esperar ou seguir em frente.
// Depois compre "Sementes de arbusto" (plant('arbusto')) e mais
// tarde "Sementes de cenoura" — essa precisa de till() (arar) antes.
`;

/* ═══════════════════════════════════════════════════════════════
   TEMA — claro por padrão, com opção de alternar pra escuro
═══════════════════════════════════════════════════════════════ */
interface Theme {
  bg: string; panel: string; card: string; border: string; borderStrong: string;
  accent: string; accentText: string; gold: string; text: string; sub: string; red: string;
}
const DARK: Theme = {
  bg: '#07120a', panel: '#0c1a10', card: '#0f2015',
  border: 'rgba(74,222,128,0.15)', borderStrong: 'rgba(74,222,128,0.4)',
  accent: '#4ade80', accentText: '#052210', gold: '#e0932a', text: '#e2e8f0', sub: '#9db6a5', red: '#f87171',
};
const LIGHT: Theme = {
  bg: '#f3f7f1', panel: '#ffffff', card: '#eef4ea',
  border: 'rgba(45,95,45,0.16)', borderStrong: 'rgba(22,101,52,0.45)',
  accent: '#16a34a', accentText: '#ffffff', gold: '#b45309', text: '#1a2e1a', sub: '#4b5f48', red: '#dc2626',
};

const STYLES = `
  @keyframes jsf-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes jsf-pulse { 0%,100%{opacity:.55} 50%{opacity:1} }
  @keyframes jsf-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }
  @keyframes jsf-seed-in { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
  @keyframes jsf-ready-glow { 0%,100%{filter:drop-shadow(0 0 1px rgba(255,255,255,0))} 50%{filter:drop-shadow(0 0 4px rgba(255,255,255,0.85))} }
  @keyframes jsf-harvest-burst { 0%{transform:translateY(0) scale(1);opacity:1} 100%{transform:translateY(-26px) scale(1.3);opacity:0} }
  .jsf-tile { transition: background .15s; }
  .jsf-drone-body { animation: jsf-bob 1.6s ease-in-out infinite; }
`;

/* ═══════════════════════════════════════════════════════════════
   OBJETIVOS — checklist progressivo, calculado direto do FarmState
═══════════════════════════════════════════════════════════════ */
interface Objective { id: string; label: string; isDone: (farm: FarmState) => boolean }
const OBJECTIVES: Objective[] = [
  { id: 'harvest1', label: 'Colha qualquer coisa pela primeira vez (a grama já cresce sozinha)', isDone: f => f.stock.feno + f.stock.madeira + f.stock.cenoura > 0 },
  { id: 'lacos', label: 'Desbloqueie "Laços" na loja', isDone: f => f.unlocks.lacos },
  { id: 'arbusto', label: 'Compre "Sementes de arbusto" e colha Madeira', isDone: f => f.stock.madeira > 0 },
  { id: 'variaveis', label: 'Desbloqueie "Variáveis" e plante uma Árvore sem matar a muda', isDone: f => f.stock.madeira > 0 && f.upgrades.arvore > 0 },
  { id: 'condicionais', label: 'Desbloqueie "Condicionais" e colha o Girassol de maior valor da região', isDone: f => f.unlocks.condicionais },
  { id: 'cenoura', label: 'Compre "Sementes de cenoura", are a terra com till() e colha uma Cenoura', isDone: f => f.stock.cenoura > 0 },
  { id: 'funcoes', label: 'Desbloqueie "Funções" e feche um bloco 2×2 de Abóbora sincronizado', isDone: f => f.unlocks.funcoes },
  { id: 'expand', label: 'Expanda a fazenda pela primeira vez', isDone: f => f.upgrades.expand > 0 },
  { id: 'listas', label: 'Desbloqueie "Listas" e colha Cacto em ordem crescente de tamanho', isDone: f => f.unlocks.listas },
  { id: 'dicionarios', label: 'Desbloqueie "Dicionários"', isDone: f => f.unlocks.dicionarios },
];

/** Peso extra pras ações que falharam de verdade (harvest vazio, plant/till
 *  errado, move na borda) — sem isso, "colheitas / ações totais" empata um
 *  código preso na borda (metade das ações é um move que falha sempre) com um
 *  código bem escrito que nunca falha nada (metade das ações é um move que
 *  sempre funciona, só porque cada casa visitada custa 1 move + 1 harvest).
 *  Multiplicar wasted por esse peso separa "nunca erra" de "fica preso". */
const WASTE_PENALTY = 4;

/** Eficiência: colheitas de verdade contra ações totais + o peso extra das
 *  ações desperdiçadas — base do bônus de pontos na Arena de Desafios. */
function efficiency(stats: FarmState['stats']): number {
  const denom = stats.actions + WASTE_PENALTY * stats.wasted;
  return denom === 0 ? 0 : stats.harvests / denom;
}

/* ═══════════════════════════════════════════════════════════════
   PERSISTÊNCIA
═══════════════════════════════════════════════════════════════ */
function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SaveData;
      if (parsed.farm && typeof parsed.code === 'string') {
        // Object.assign preserva compras antigas e preenche as novas
        // estruturas da árvore (saves anteriores não têm essas chaves).
        parsed.farm.unlocks = Object.assign(createEmptyUnlocks(), parsed.farm.unlocks);
        // Saves antigos não têm os campos das culturas/placar novos — preenche
        // com os valores neutros em vez de invalidar o save inteiro.
        parsed.farm.stock = Object.assign({ feno: 0, madeira: 0, cenoura: 0, oleo: 0, abobora: 0, fibra: 0 }, parsed.farm.stock);
        parsed.farm.upgrades = Object.assign({ arvore: 0, girassol: 0, abobora: 0, cacto: 0 }, parsed.farm.upgrades);
        if (!parsed.farm.stats) parsed.farm.stats = { actions: 0, harvests: 0, wasted: 0 };
        if (parsed.farm.cactoStreak === undefined) parsed.farm.cactoStreak = 0;
        if (parsed.farm.lastCactoValue === undefined) parsed.farm.lastCactoValue = null;
        return parsed;
      }
    }
  } catch { /* ignora save corrompido */ }
  return { farm: createInitialFarm(), code: DEFAULT_CODE };
}

function persist(data: SaveData) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

function loadTheme(): boolean {
  try { return localStorage.getItem(THEME_KEY) === 'dark'; } catch { return false; }
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════════════════════ */
interface Props { onBack?: () => void; onBackToHub?: () => void }

export default function JsFarmPage({ onBack, onBackToHub }: Props) {
  const { currentUser, addCoins, addPoints } = useGameState();
  const isFirstVisit = useRef(localStorage.getItem(SAVE_KEY) === null).current;
  const initial = useRef(loadSave()).current;
  const [farm, setFarm] = useState<FarmState>(initial.farm);
  const [code, setCode] = useState(initial.code);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<{ text: string; kind: 'log' | 'error' }[]>([]);
  const [showHelp, setShowHelp] = useState(isFirstVisit);
  const [isDark, setIsDark] = useState(loadTheme);
  const [objectivesOpen, setObjectivesOpen] = useState(false);
  const [showStructModal, setShowStructModal] = useState(false);
  const [showToolsModal, setShowToolsModal] = useState(false);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [, forceTick] = useState(0);

  const C = isDark ? DARK : LIGHT;

  const workerRef = useRef<Worker | null>(null);
  const farmRef = useRef(farm);
  farmRef.current = farm;
  const consoleEndRef = useRef<HTMLDivElement | null>(null);
  const fenoRef = useRef<HTMLDivElement | null>(null);
  const madeiraRef = useRef<HTMLDivElement | null>(null);
  const cenouraRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Partial<Record<ItemId, React.RefObject<HTMLDivElement>>>>({});
  itemRefs.current = { feno: fenoRef, madeira: madeiraRef, cenoura: cenouraRef };

  /* Voa um ícone do item da casa colhida até o contador correspondente no
     header — feedback visual de "pra onde" a colheita foi, só pros itens
     que têm contador visível (feno/madeira/cenoura). */
  const handleCollect = useCallback((item: ItemId, x: number, y: number) => {
    const ref = itemRefs.current[item];
    if (!ref?.current) return;
    const rect = ref.current.getBoundingClientRect();
    const id = `${item}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setFlights(prev => [...prev, { id, item, x1: x, y1: y, x2: rect.left + rect.width / 2, y2: rect.top + rect.height / 2 }]);
  }, []);

  const removeFlight = useCallback((id: string) => {
    setFlights(prev => prev.filter(f => f.id !== id));
  }, []);

  /* Salva progresso sempre que fazenda ou código mudam */
  useEffect(() => {
    persist({ farm, code });
  }, [farm, code]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  }, [isDark]);

  /* Re-renderiza periodicamente para refletir crescimento das plantas em tempo real */
  useEffect(() => {
    const id = setInterval(() => forceTick(t => t + 1), 300);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ block: 'nearest' });
  }, [logs]);

  const appendLog = useCallback((text: string, kind: 'log' | 'error' = 'log') => {
    setLogs(prev => [...prev.slice(-199), { text, kind }]);
  }, []);

  const stopWorker = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
    setRunning(false);
  }, []);

  const runCode = useCallback(() => {
    setLogs([]);

    let violations;
    try {
      violations = validateCode(code, farmRef.current.unlocks);
    } catch (err) {
      appendLog(err instanceof Error ? err.message : String(err), 'error');
      return;
    }
    if (violations.length > 0) {
      violations.forEach(v => appendLog(formatViolation(v), 'error'));
      return;
    }

    stopWorker();
    setRunning(true);

    const worker = new Worker(new URL('../games/jsFarm/worker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;

    worker.onmessage = (ev: MessageEvent<WorkerToMain>) => {
      const msg = ev.data;
      if (msg.type === 'action') {
        // Leituras puras (canHarvest/info/size) são praticamente de graça —
        // sem o delay normal de ação, igual ao can_harvest() do jogo original.
        const isReadOnly = msg.action.kind === 'canHarvest' || msg.action.kind === 'info' || msg.action.kind === 'size';
        const delay = isReadOnly ? 0 : actionDelayMs(farmRef.current.upgrades);
        window.setTimeout(() => {
          if (workerRef.current !== worker) return; // worker já parado

          if (msg.action.kind === 'sell') {
            const stock = farmRef.current.stock;
            let coins = 0, points = 0;
            (Object.keys(stock) as ItemId[]).forEach(c => {
              coins += stock[c] * SELL_RATES[c].coins;
              points += stock[c] * SELL_RATES[c].points;
            });
            if (coins > 0) {
              if (currentUser) {
                // Bônus de eficiência: não é só "quanto colheu", é quantas ações
                // renderam colheita de verdade — código que erra menos ganha mais.
                const eff = efficiency(farmRef.current.stats);
                const bonus = Math.round(points * eff);
                addCoins(coins);
                addPoints(points + bonus);
                if (bonus > 0) {
                  appendLog(`+${bonus} pontos de bônus por eficiência (${Math.round(eff * 100)}% das ações viraram colheita).`, 'log');
                }
              } else {
                appendLog('Faça login na Arena de Desafios pra sua colheita virar moeda de verdade.', 'log');
              }
            }
            const state = { ...farmRef.current, stock: { feno: 0, madeira: 0, cenoura: 0, oleo: 0, abobora: 0, fibra: 0 } };
            setFarm(state);
            farmRef.current = state;
            worker.postMessage({ type: 'result', id: msg.id, value: coins } satisfies MainToWorker);
            return;
          }

          const now = Date.now();
          const { state, value } = applyAction(farmRef.current, msg.action, now);
          setFarm(state);
          farmRef.current = state;
          worker.postMessage({ type: 'result', id: msg.id, value } satisfies MainToWorker);
        }, delay);
      } else if (msg.type === 'log') {
        appendLog(msg.text, 'log');
      } else if (msg.type === 'error') {
        appendLog(msg.message, 'error');
        setRunning(false);
        workerRef.current = null;
      } else if (msg.type === 'done') {
        appendLog('Script finalizado.', 'log');
        setRunning(false);
        workerRef.current = null;
      }
    };

    worker.onerror = (ev: ErrorEvent) => {
      appendLog(ev.message, 'error');
      setRunning(false);
      workerRef.current = null;
    };

    worker.postMessage({ type: 'run', code } satisfies MainToWorker);
  }, [code, appendLog, stopWorker, currentUser, addCoins, addPoints]);

  useEffect(() => () => { workerRef.current?.terminate(); }, []);

  /* Reset total: apaga estoque, upgrades e estruturas compradas (equivalente a começar o jogo de novo) */
  const wipeEverything = useCallback(() => {
    if (!window.confirm('Isso apaga TUDO: colheita guardada, ferramentas e estruturas de programação compradas. Continuar?')) return;
    stopWorker();
    const fresh = createInitialFarm();
    setFarm(fresh);
    farmRef.current = fresh;
    setLogs([]);
  }, [stopWorker]);

  /* Limpa só a fazenda (tiles + posição do drone) — mesma lógica pura de drone.clear(), preserva estoque/upgrades/estruturas */
  const clearFarm = useCallback(() => {
    setFarm(prev => {
      const { state } = applyAction(prev, { kind: 'clear' }, Date.now());
      farmRef.current = state;
      return state;
    });
  }, []);

  const buy = useCallback((id: string) => {
    setFarm(prev => {
      const { state } = buyShopItem(prev, id);
      farmRef.current = state;
      return state;
    });
  }, []);

  const buyStruct = useCallback((id: StructureId) => {
    setFarm(prev => {
      const { state } = buyStructure(prev, id);
      farmRef.current = state;
      return state;
    });
  }, []);

  const expandFarm = useCallback(() => {
    setFarm(prev => {
      const { state } = buyExpand(prev);
      farmRef.current = state;
      return state;
    });
  }, []);

  const now = Date.now();
  const doneCount = OBJECTIVES.filter(o => o.isDone(farm)).length;
  const nextObjective = OBJECTIVES.find(o => !o.isDone(farm));
  const effValue = efficiency(farm.stats);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: C.bg, color: C.text, fontFamily: 'system-ui,-apple-system,sans-serif', overflow: 'hidden' }}>
      <style>{STYLES}</style>

      {/* HEADER */}
      <header style={{ height: 56, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 14, padding: '0 16px', borderBottom: `1px solid ${C.border}`, background: C.panel }}>
        <button onClick={onBack ?? onBackToHub}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: C.sub, fontSize: 14, fontWeight: 600 }}>
          <ChevronLeft size={17} /> Voltar
        </button>
        <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 12, color: C.accent, letterSpacing: '0.06em' }}>
          FAZENDA.JS
        </span>
        <div style={{ flex: 1 }} />
        <div ref={fenoRef} style={{ display: 'flex', alignItems: 'center', gap: 6 }} title={`${ITEM_NAMES.feno} — item da Grama`}>
          <ItemIcon item="feno" />
          <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 11, color: ITEM_COLORS.feno }}>{farm.stock.feno}</span>
        </div>
        <div ref={madeiraRef} style={{ display: 'flex', alignItems: 'center', gap: 6 }} title={`${ITEM_NAMES.madeira} — item do Arbusto`}>
          <ItemIcon item="madeira" />
          <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 11, color: ITEM_COLORS.madeira }}>{farm.stock.madeira}</span>
        </div>
        <div ref={cenouraRef} style={{ display: 'flex', alignItems: 'center', gap: 6 }} title={`${ITEM_NAMES.cenoura} — item da Cenoura`}>
          <ItemIcon item="cenoura" />
          <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 11, color: ITEM_COLORS.cenoura }}>{farm.stock.cenoura}</span>
        </div>
        {currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 10, borderLeft: `1px solid ${C.border}` }} title="Moedas da conta">
            <Coins size={16} color={C.gold} />
            <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 11, color: C.gold }}>{currentUser.coins}</span>
          </div>
        )}
        <button onClick={() => setIsDark(d => !d)}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 10px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, fontSize: 13, cursor: 'pointer' }}
          title={isDark ? 'Mudar pra tema claro' : 'Mudar pra tema escuro'}>
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </header>

      {/* BODY */}
      <div className="jsf-split" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* LEFT: editor + console */}
        <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', borderRight: `1px solid ${C.border}`, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderBottom: `1px solid ${C.border}`, flexWrap: 'wrap' }}>
            <button onClick={runCode} disabled={running}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: running ? C.card : C.accent, border: 'none', borderRadius: 4, color: running ? C.sub : C.accentText, fontSize: 13, fontWeight: 700, cursor: running ? 'not-allowed' : 'pointer' }}>
              <Play size={14} /> Rodar
            </button>
            <button onClick={stopWorker} disabled={!running}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'transparent', border: `1px solid ${running ? C.red : C.border}`, borderRadius: 4, color: running ? C.red : C.sub, fontSize: 13, fontWeight: 700, cursor: running ? 'pointer' : 'not-allowed' }}>
              <Square size={14} /> Parar
            </button>
            <div style={{ flex: 1 }} />
            <button onClick={() => setShowHelp(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'transparent', border: `1px solid ${C.accent}55`, borderRadius: 4, color: C.accent, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              <HelpCircle size={14} /> Ajuda
            </button>
            <button onClick={clearFarm} disabled={running}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 4, color: running ? C.sub : C.text, fontSize: 13, cursor: running ? 'not-allowed' : 'pointer', opacity: running ? 0.5 : 1 }}
              title="Limpa as plantações e volta o drone pro início — mantém colheita guardada e estruturas compradas">
              <Eraser size={14} /> Limpar fazenda
            </button>
            <button onClick={wipeEverything}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 4, color: C.sub, fontSize: 13, cursor: 'pointer' }}
              title="Apaga tudo: colheita guardada, ferramentas e estruturas compradas">
              <RotateCcw size={14} /> Apagar tudo
            </button>
          </div>

          <div style={{ flex: '1 1 60%', overflow: 'auto', minHeight: 0 }}>
            <CodeMirror
              value={code}
              onChange={v => setCode(v)}
              theme={isDark ? vscodeDark : vscodeLight}
              extensions={[javascript()]}
              height="100%"
              style={{ height: '100%', fontSize: 15 }}
            />
          </div>

          <div style={{ flex: '0 0 34%', display: 'flex', flexDirection: 'column', borderTop: `1px solid ${C.border}`, minHeight: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
              <Terminal size={13} color={C.sub} />
              <span style={{ fontSize: 12, color: C.sub, letterSpacing: '0.04em', fontWeight: 600 }}>CONSOLE</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px', fontFamily: 'monospace', fontSize: 14 }}>
              {logs.length === 0 && <div style={{ color: C.sub, opacity: 0.7 }}>Nenhuma saída ainda. Clique em Rodar.</div>}
              {logs.map((l, i) => (
                <div key={i} style={{ color: l.kind === 'error' ? C.red : C.text, marginBottom: 3, wordBreak: 'break-word' }}>
                  {l.kind === 'error' ? '✖ ' : '› '}{l.text}
                </div>
              ))}
              <div ref={consoleEndRef} />
            </div>
          </div>
        </div>

        {/* RIGHT: objetivos + farm + shop */}
        <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {/* OBJETIVOS */}
          <div style={{ margin: '14px 16px 0', border: `1px solid ${C.border}`, borderRadius: 6, background: C.card, overflow: 'hidden', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <button onClick={() => setObjectivesOpen(o => !o)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
              <Target size={16} color={C.accent} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, letterSpacing: '0.04em' }}>OBJETIVOS · {doneCount}/{OBJECTIVES.length}</div>
                <div style={{ fontSize: 14, color: C.text, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {nextObjective ? nextObjective.label : 'Tudo concluído! 🎉'}
                </div>
              </div>
              {objectivesOpen ? <ChevronUp size={16} color={C.sub} /> : <ChevronDown size={16} color={C.sub} />}
            </button>
            {objectivesOpen && (
              <div style={{ borderTop: `1px solid ${C.border}`, padding: '8px 12px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {OBJECTIVES.map(o => {
                  const done = o.isDone(farm);
                  return (
                    <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: done ? 0.55 : 1 }}>
                      <div style={{ width: 18, height: 18, flexShrink: 0, borderRadius: 4, border: `1.5px solid ${done ? C.accent : C.border}`, background: done ? C.accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {done && <Check size={12} color={C.accentText} strokeWidth={3} />}
                      </div>
                      <span style={{ fontSize: 13.5, color: C.text, textDecoration: done ? 'line-through' : 'none' }}>{o.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* EFICIÊNCIA — placar da Arena de Desafios: não é só quanto colheu,
              é quanta ação virou colheita de verdade. */}
          <div style={{ margin: '10px 16px 0', padding: '9px 12px', border: `1px solid ${C.border}`, borderRadius: 6, background: C.card, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}
            title="Ações que renderam colheita ÷ ações totais (move/plant/till/harvest). Vender concede bônus de pontos proporcional a isso.">
            <BarChart3 size={15} color={C.accent} />
            <div style={{ fontSize: 12.5, color: C.sub, flex: 1 }}>
              EFICIÊNCIA <strong style={{ color: C.text }}>{Math.round(effValue * 100)}%</strong>
              {' '}· {farm.stats.harvests} colheitas / {farm.stats.actions} ações
              {farm.stats.wasted > 0 && <span> · {farm.stats.wasted} desperdiçadas</span>}
            </div>
          </div>

          <div style={{ padding: 16, display: 'flex', justifyContent: 'center' }}>
            <FarmGrid farm={farm} now={now} droneMoveMs={actionDelayMs(farm.upgrades)} theme={C} onCollect={handleCollect} />
          </div>
        </div>

        {/* Botões fixos no rodapé — não rolam junto com objetivos/fazenda */}
        <div style={{ flexShrink: 0, padding: '10px 16px 16px', display: 'flex', gap: 10, borderTop: `1px solid ${C.border}`, background: C.panel }}>
          <button onClick={() => setShowStructModal(true)}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3, padding: '12px 14px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, cursor: 'pointer', textAlign: 'left' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: C.accent, fontWeight: 700, fontSize: 13.5 }}>
              <GitBranch size={15} /> Estruturas
            </span>
            <span style={{ fontSize: 12, color: C.sub }}>{STRUCTURE_ORDER.filter(id => farm.unlocks[id]).length}/{STRUCTURE_ORDER.length} desbloqueadas</span>
          </button>
          <button onClick={() => setShowToolsModal(true)}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3, padding: '12px 14px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, cursor: 'pointer', textAlign: 'left' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: C.accent, fontWeight: 700, fontSize: 13.5 }}>
              <Wrench size={15} /> Ferramentas
            </span>
            <span style={{ fontSize: 12, color: C.sub }}>
              {SHOP_ITEMS.filter(item => shopItemLevel(farm, item.id) >= 1).length + (farm.upgrades.expand >= 1 ? 1 : 0)}/{SHOP_ITEMS.length + 1} compradas
            </span>
          </button>
        </div>
      </div>
      </div>

      {flights.map(f => (
        <FlightIcon key={f.id} item={f.item} x1={f.x1} y1={f.y1} x2={f.x2} y2={f.y2} onDone={() => removeFlight(f.id)} />
      ))}

      {showHelp && <HelpModal farm={farm} theme={C} onClose={() => setShowHelp(false)} />}
      {showStructModal && <StructureTreeModal farm={farm} onBuy={buyStruct} theme={C} onClose={() => setShowStructModal(false)} />}
      {showToolsModal && (
        <ToolsModal farm={farm} theme={C} onBuy={buy} onExpand={expandFarm} onClose={() => setShowToolsModal(false)} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ÁRVORE DE ESTRUTURAS — layout fixo em pixels: cada estrutura tem
   uma posição (x, linha) escolhida à mão pra que os filhos fiquem
   alinhados embaixo do pai (mesma coordenada x quando há 1 pai só).
   As linhas do SVG usam essas mesmas coordenadas, sem precisar medir
   o DOM.
═══════════════════════════════════════════════════════════════ */
const TREE_W = 760;
const TREE_ROW_H = 132;
const TREE_CARD_W = 118;
const TREE_CARD_H = 72;

const TREE_LAYOUT: Record<StructureId, { x: number; row: number }> = {
  lacos:         { x: 150, row: 0 },
  variaveis:     { x: 550, row: 0 },
  controle_laco: { x: 150, row: 1 },
  operadores:    { x: 420, row: 1 },
  listas:        { x: 680, row: 1 },
  condicionais:  { x: 290, row: 2 },
  logicos:       { x: 420, row: 2 },
  laco_for:      { x: 550, row: 2 },
  for_of:        { x: 680, row: 2 },
  funcoes:       { x: 290, row: 3 },
  dicionarios:   { x: 680, row: 3 },
};

function StructureTreeModal({ farm, onBuy, theme: C, onClose }: { farm: FarmState; onBuy: (id: StructureId) => void; theme: Theme; onClose: () => void }) {
  const [selected, setSelected] = useState<StructureId>(
    () => buyableNow(farm.unlocks)[0] ?? STRUCTURE_ORDER.find(id => !farm.unlocks[id]) ?? STRUCTURE_ORDER[0]
  );
  const def = STRUCTURES[selected];
  const owned = farm.unlocks[selected];
  const { allowed, reason } = canBuyStructure(farm, selected);
  const costLabel = (Object.keys(def.cost) as ItemId[])
    .map(c => `${def.cost[c]} ${ITEM_NAMES[c].toLowerCase()}`)
    .join(' + ');
  const prereqNames = def.prereqs.map(p => STRUCTURES[p].name).join(' + ');
  const treeHeight = STRUCTURE_TIERS.length * TREE_ROW_H;

  const edges = STRUCTURE_ORDER.flatMap(id => STRUCTURES[id].prereqs.map(p => ({ from: p, to: id })));

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.75)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 820, maxHeight: '88vh', display: 'flex', flexDirection: 'column', background: C.panel, border: `1px solid ${C.border}`, borderRadius: 6, animation: 'jsf-in .18s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 18px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 13, color: C.accent, display: 'flex', alignItems: 'center', gap: 8 }}>
            <GitBranch size={16} /> ESTRUTURAS DE PROGRAMAÇÃO
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.sub, padding: 4, lineHeight: 0 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ overflow: 'auto', padding: 18 }}>
          <div style={{ position: 'relative', width: TREE_W, height: treeHeight, margin: '0 auto' }}>
            <svg width={TREE_W} height={treeHeight} style={{ position: 'absolute', top: 0, left: 0 }}>
              {edges.map(({ from, to }) => {
                const a = TREE_LAYOUT[from], b = TREE_LAYOUT[to];
                const active = farm.unlocks[from];
                return (
                  <line key={`${from}-${to}`}
                    x1={a.x} y1={a.row * TREE_ROW_H + TREE_CARD_H} x2={b.x} y2={b.row * TREE_ROW_H}
                    stroke={active ? C.accent : C.border} strokeWidth={2} />
                );
              })}
            </svg>
            {STRUCTURE_ORDER.map(id => {
              const pos = TREE_LAYOUT[id];
              const o = farm.unlocks[id];
              const buyableCandidate = canBuyStructure(farm, id).allowed;
              const isSelected = id === selected;
              return (
                <button key={id} onClick={() => setSelected(id)}
                  style={{
                    position: 'absolute', left: pos.x - TREE_CARD_W / 2, top: pos.row * TREE_ROW_H, width: TREE_CARD_W, height: TREE_CARD_H,
                    background: o ? `${C.accent}1f` : C.card,
                    border: `2px solid ${isSelected ? C.accent : o ? C.borderStrong : buyableCandidate ? `${C.accent}88` : C.border}`,
                    borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer', padding: 6,
                    opacity: o || buyableCandidate ? 1 : 0.5,
                  }}>
                  {o ? <Check size={13} color={C.accent} /> : !buyableCandidate ? <Lock size={12} color={C.sub} /> : null}
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: o ? C.accent : C.text, textAlign: 'center', lineHeight: 1.25 }}>{STRUCTURES[id].name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${C.border}`, padding: '14px 18px', flexShrink: 0 }}>
          {prereqNames && <div style={{ fontSize: 11.5, color: C.sub, marginBottom: 2 }}>↳ requer {prereqNames}</div>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: owned ? C.accent : C.text }}>{def.name}</span>
            <div style={{ flex: 1 }} />
            <button onClick={() => onBuy(selected)} disabled={!allowed}
              style={{ padding: '8px 14px', background: owned ? 'transparent' : allowed ? C.accent : 'transparent', border: `1px solid ${owned ? C.borderStrong : allowed ? C.accent : C.border}`, borderRadius: 4, color: owned ? C.accent : allowed ? C.accentText : C.sub, fontSize: 13, fontWeight: 700, cursor: allowed ? 'pointer' : 'not-allowed' }}>
              {owned ? 'OK' : !allowed && reason !== 'colheita insuficiente' ? reason : costLabel}
            </button>
          </div>
          <p style={{ fontSize: 14, color: C.text, lineHeight: 1.55, margin: '0 0 10px' }}>{def.desc}</p>
          {owned && (
            <code style={{ display: 'block', color: C.text, fontSize: 13, fontFamily: 'monospace', background: C.bg, padding: '9px 11px', borderRadius: 3, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{def.example}</code>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FERRAMENTAS — lista de upgrades/culturas + expansão da fazenda
═══════════════════════════════════════════════════════════════ */
function ToolsModal({ farm, onBuy, onExpand, theme: C, onClose }: {
  farm: FarmState; onBuy: (id: string) => void; onExpand: () => void; theme: Theme; onClose: () => void;
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.75)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 640, maxHeight: '86vh', overflowY: 'auto', background: C.panel, border: `1px solid ${C.border}`, borderRadius: 6, animation: 'jsf-in .18s ease' }}>
        <div style={{ position: 'sticky', top: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 18px', borderBottom: `1px solid ${C.border}`, background: C.panel }}>
          <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 13, color: C.accent, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Wrench size={16} /> FERRAMENTAS
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.sub, padding: 4, lineHeight: 0 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {SHOP_ITEMS.map(item => {
            const level = shopItemLevel(farm, item.id);
            const maxed = level >= item.maxLevel;
            const cost = item.cost(level);
            const { allowed, reason } = canBuyShopItem(farm, item.id);
            const locked = !!item.requiresStructure && !farm.unlocks[item.requiresStructure];
            const costLabel = (Object.keys(cost) as ItemId[])
              .map(c => `${cost[c]} ${ITEM_NAMES[c].toLowerCase()}`)
              .join(' + ');
            return (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 5, opacity: maxed || allowed || !locked ? 1 : 0.55 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: C.text }}>{item.name} {item.maxLevel > 1 && <span style={{ color: C.sub, fontWeight: 400 }}>({level}/{item.maxLevel})</span>}</div>
                  <div style={{ fontSize: 12.5, color: C.sub }}>{maxed ? item.desc : (locked && reason ? reason : item.desc)}</div>
                </div>
                <button onClick={() => onBuy(item.id)} disabled={!allowed}
                  style={{ flexShrink: 0, padding: '8px 13px', background: maxed ? 'transparent' : allowed ? C.accent : 'transparent', border: `1px solid ${maxed ? C.border : allowed ? C.accent : C.border}`, borderRadius: 4, color: maxed ? C.sub : allowed ? C.accentText : C.sub, fontSize: 13, fontWeight: 700, cursor: allowed ? 'pointer' : 'not-allowed' }}>
                  {maxed ? 'MAX' : locked ? <Lock size={13} /> : costLabel}
                </button>
              </div>
            );
          })}

          {(() => {
            const expandLevel = farm.upgrades.expand;
            const maxed = expandLevel >= EXPAND_LEVELS.length;
            const { allowed } = canBuyExpand(farm);
            const costLabel = maxed ? null : (Object.keys(EXPAND_LEVELS[expandLevel].cost) as ItemId[])
              .map(c => `${EXPAND_LEVELS[expandLevel].cost[c]} ${ITEM_NAMES[c].toLowerCase()}`)
              .join(' + ');
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 5 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: C.text }}>
                    Expandir fazenda <span style={{ color: C.sub, fontWeight: 400 }}>({farm.gridSize}×{farm.gridSize}, máx {MAX_GRID_SIZE}×{MAX_GRID_SIZE})</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: C.sub }}>Aumenta o campo em +1. Limpa as plantações atuais.</div>
                </div>
                <button onClick={onExpand} disabled={!allowed}
                  style={{ flexShrink: 0, padding: '8px 13px', background: maxed ? 'transparent' : allowed ? C.accent : 'transparent', border: `1px solid ${maxed ? C.border : C.accent}`, borderRadius: 4, color: maxed ? C.sub : allowed ? C.accentText : C.sub, fontSize: 13, fontWeight: 700, cursor: allowed ? 'pointer' : 'not-allowed' }}>
                  {maxed ? 'MAX' : costLabel}
                </button>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AJUDA PROGRESSIVA DAS CULTURAS — não despeja as 7 de uma vez pro
   jogador novo: mostra só as já desbloqueadas + a próxima (preview),
   revelando mais conforme compra as Ferramentas correspondentes.
═══════════════════════════════════════════════════════════════ */
const CROP_PROGRESSION: CropId[] = ['arbusto', 'cenoura', 'arvore', 'girassol', 'abobora', 'cacto'];

function isCropOwned(farm: FarmState, crop: CropId): boolean {
  if (crop === 'grama') return true;
  return farm.upgrades[crop] >= 1;
}

/** Grama + culturas já desbloqueadas + a próxima ainda não comprada (preview) — pára aí. */
function progressiveCrops(farm: FarmState): CropId[] {
  const visible: CropId[] = ['grama'];
  for (const c of CROP_PROGRESSION) {
    visible.push(c);
    if (!isCropOwned(farm, c)) break;
  }
  return visible;
}

const CROP_HELP_TEXT: Record<CropId, string> = {
  grama: 'Cresce sozinha em qualquer casa vazia não arada, sem precisar plantar — vira o item Feno.',
  arbusto: "Precisa de plant('arbusto') — cresce mais devagar que a grama. Vira o item Madeira.",
  cenoura: "Só cresce em terra arada — use till() antes de plant('cenoura'). Vira o item Cenoura (mesmo nome).",
  arvore: "Morre se plantada colada em outra árvore (N/S/L/O) — confira as 4 vizinhas com drone.info() antes de plantar. Vira o item Madeira.",
  girassol: 'Nasce com um valor aleatório (drone.info().value) — colher o de MAIOR valor pronto agora em toda a fazenda rende 5x mais. Vira o item Óleo.',
  abobora: 'Só rende bônus (5x) se as 4 casas de um bloco 2×2 forem plantadas em sequência próxima — não basta esperar todas ficarem prontas. Vira o item Abóbora (mesmo nome).',
  cacto: 'Nasce com um tamanho aleatório — só rende bônus de Fibra se colhido em ordem crescente de tamanho.',
};

/* ═══════════════════════════════════════════════════════════════
   MODAL DE AJUDA — API do drone e estruturas de JS disponíveis
═══════════════════════════════════════════════════════════════ */
function HelpModal({ farm, theme: C, onClose }: { farm: FarmState; theme: Theme; onClose: () => void }) {
  const [showAllCrops, setShowAllCrops] = useState(false);
  const section = (title: string) => (
    <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 11, color: C.accent, margin: '20px 0 12px' }}>{title}</div>
  );
  const apiRow = (sig: string, desc: string, ex: string) => (
    <div style={{ marginBottom: 13, padding: '11px 13px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 5 }}>
      <code style={{ color: C.gold, fontSize: 15, fontFamily: 'monospace' }}>{sig}</code>
      <div style={{ fontSize: 14, color: C.text, margin: '5px 0 7px', lineHeight: 1.5 }}>{desc}</div>
      <code style={{ display: 'block', color: C.sub, fontSize: 13, fontFamily: 'monospace', background: C.bg, padding: '7px 9px', borderRadius: 3 }}>{ex}</code>
    </div>
  );

  const unlocked = STRUCTURE_ORDER.filter(id => farm.unlocks[id]);
  const next = buyableNow(farm.unlocks);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.75)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 660, maxHeight: '86vh', overflowY: 'auto', background: C.panel, border: `1px solid ${C.border}`, borderRadius: 6, animation: 'jsf-in .18s ease' }}>
        <div style={{ position: 'sticky', top: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 18px', borderBottom: `1px solid ${C.border}`, background: C.panel }}>
          <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 13, color: C.accent }}>COMO PROGRAMAR O DRONE</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.sub, padding: 4, lineHeight: 0 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '6px 18px 22px' }}>
          <p style={{ fontSize: 15, color: C.text, lineHeight: 1.65 }}>
            Você escreve JavaScript de verdade, mas do zero: no começo só dá pra chamar o drone em sequência,
            uma linha depois da outra. Cada estrutura da linguagem — laços, variáveis, condicionais, funções,
            listas, dicionários — é <strong>comprada na loja pagando com a própria colheita</strong> (grama,
            arbusto e cenoura), numa árvore de pré-requisitos: cada item só libera depois dos anteriores
            necessários. Usar uma estrutura ainda não comprada trava a execução com um aviso, sem rodar nada.
          </p>

          {section('CULTURAS')}
          <p style={{ fontSize: 15, color: C.text, lineHeight: 1.65, margin: '0 0 12px' }}>
            Cada cultura nova quebra a estratégia que resolvia a anterior — não dá pra usar o mesmo código
            de novo, precisa evoluir.
          </p>
          {(showAllCrops ? (['grama', ...CROP_PROGRESSION] as CropId[]) : progressiveCrops(farm)).map(c => {
            const owned = isCropOwned(farm, c);
            return (
              <p key={c} style={{ fontSize: 15, color: C.text, lineHeight: 1.6, margin: '0 0 10px' }}>
                <strong style={{ color: CROPS[c].color }}>{CROPS[c].name}</strong>
                {!owned && <span style={{ color: C.sub, fontWeight: 600 }}> (próxima — ainda não desbloqueada)</span>}
                {' '}{CROP_HELP_TEXT[c]}
              </p>
            );
          })}
          {!showAllCrops && progressiveCrops(farm).length < 1 + CROP_PROGRESSION.length && (
            <button onClick={() => setShowAllCrops(true)}
              style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 4, color: C.sub, fontSize: 13, padding: '6px 10px', cursor: 'pointer', marginBottom: 4 }}>
              Ver todas as {1 + CROP_PROGRESSION.length} culturas (spoiler)
            </button>
          )}

          {section('API DO DRONE (sempre disponível)')}
          {apiRow(
            "await drone.move(direcao)",
            'Move uma casa na direção informada: "up", "down", "left" ou "right". A fazenda é FINITA: tentar sair da borda falha e retorna false, sem mover o drone — trate a posição no seu código (com drone.size()) em vez de repetir uma direção cegamente.',
            "await drone.move('right');"
          )}
          {apiRow(
            'await drone.plant(cultura?)',
            'Planta na casa atual. Sem argumento planta grama (raramente precisa, nunca gasta nada). Cada cultura (\'arbusto\', \'cenoura\', \'arvore\', \'girassol\', \'abobora\', \'cacto\') só fica disponível depois da Ferramenta correspondente comprada. ATENÇÃO: chamar plant() com uma casa errada (ocupada, não arada, ou árvore colada em outra árvore) desperdiça 2 Feno — confira com drone.info() antes de plantar às cegas.',
            "await drone.plant('arbusto');"
          )}
          {apiRow(
            'await drone.till()',
            'Ara (ou desara) a terra da casa atual — só funciona em casa vazia. Terra arada é necessária pra plantar cenoura, e não deixa a grama crescer sozinha ali.',
            'await drone.till();'
          )}
          {apiRow(
            'await drone.harvest()',
            'Exato: colhe na hora se a casa tiver uma plantação madura, guardando no estoque. Se estiver vazia OU ainda não madura, falha imediatamente e retorna 0 — não espera.',
            'await drone.harvest();'
          )}
          {apiRow(
            'await drone.canHarvest()',
            'Checagem sem custo de tempo (diferente das outras ações): retorna true se a casa atual tem uma plantação pronta pra colher agora.',
            "if (await drone.canHarvest()) { await drone.harvest(); }"
          )}
          {apiRow(
            'await drone.info()',
            'Checagem completa da casa atual, sem custo de tempo: retorna um objeto { crop, ready, tilled, value }. "value" é o valor/tamanho sorteado ao plantar Girassol ou Cacto (null nas outras culturas) — o jeito de comparar antes de decidir qual colher.',
            "const casa = await drone.info();\nif (casa.crop === null && casa.tilled) { await drone.plant('cenoura'); }"
          )}
          {apiRow(
            'await drone.size()',
            'Checagem sem custo de tempo: retorna o tamanho atual do lado da fazenda (3 a 9). Junto com um loop, dá pra escrever um código que cobre o campo inteiro e continua funcionando depois de expandir, sem precisar reescrever nada.',
            'const lado = await drone.size();\nfor (let i = 0; i < lado * lado; i++) { /* ... */ }'
          )}
          {apiRow(
            'await drone.sell()',
            'Troca todo o estoque de itens por moedas e pontos na SUA CONTA do hub (visíveis na Arena de Desafios), zerando o estoque. Retorna as moedas ganhas. Concede também um bônus de pontos proporcional à sua EFICIÊNCIA (colheitas contra ações totais, com as que falharam pesando bem mais) — código que erra menos ganha mais, não só quem colhe mais devagar com força bruta.',
            'await drone.sell();'
          )}
          {apiRow(
            'await drone.home()',
            'Volta o drone direto pra casa (0,0), de qualquer posição do mapa.',
            'await drone.home();'
          )}
          {apiRow(
            'await drone.clear()',
            'Remove todas as plantações do campo e volta o drone pra (0,0). Não mexe no estoque nem nas estruturas compradas — é o mesmo que o botão "Limpar fazenda".',
            'await drone.clear();'
          )}

          {section('ESTRUTURAS DESBLOQUEADAS')}
          {unlocked.length === 0 && <p style={{ fontSize: 14.5, color: C.sub, margin: 0 }}>Nenhuma ainda — só sequência de chamadas ao drone.</p>}
          {unlocked.map(id => (
            <div key={id} style={{ marginBottom: 11 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.accent, marginBottom: 5 }}>{STRUCTURES[id].name}</div>
              <code style={{ display: 'block', color: C.text, fontSize: 13, fontFamily: 'monospace', background: C.bg, padding: '7px 9px', borderRadius: 3, whiteSpace: 'pre-wrap' }}>{STRUCTURES[id].example}</code>
            </div>
          ))}

          {next.length > 0 && (
            <>
              {section('PRÓXIMAS ESTRUTURAS')}
              {next.map(id => (
                <p key={id} style={{ fontSize: 15, color: C.text, lineHeight: 1.65, margin: '0 0 8px' }}>
                  <strong style={{ color: C.gold }}>{STRUCTURES[id].name}</strong> — {STRUCTURES[id].desc} Custa{' '}
                  <strong style={{ color: C.gold }}>
                    {(Object.keys(STRUCTURES[id].cost) as ItemId[]).map(c => `${STRUCTURES[id].cost[c]} ${ITEM_NAMES[c].toLowerCase()}`).join(' + ')}
                  </strong> na loja.
                </p>
              ))}
            </>
          )}

          {section('PADRÃO RECOMENDADO')}
          <p style={{ fontSize: 15, color: C.text, lineHeight: 1.65, margin: '0 0 10px' }}>
            Depois de ter Laços + Operadores + Funções + Listas, o jeito eficiente de cobrir a fazenda
            inteira parece com isto — repare que cada estrutura tem um motivo real de estar aí, não é só
            burocracia pra desbloquear:
          </p>
          <code style={{ display: 'block', color: C.text, fontSize: 13, fontFamily: 'monospace', background: C.bg, padding: '10px 12px', borderRadius: 3, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{
`async function cuidarDaCasa() {           // Funções: uma decisão, reaproveitada em cada casa
  const casa = await drone.info();        // olha antes de agir — sem isso, plant()/till() no chute desperdiça semente
  if (casa.ready) { await drone.harvest(); return; }
  if (casa.crop === null && !casa.tilled) { await drone.till(); return; }
  if (casa.crop === null && casa.tilled) { await drone.plant('cenoura'); }
}

const direcoes = ['right', 'right', 'down', 'left', 'left', 'down']; // Listas: o caminho pra varrer o campo
while (true) {                                                        // Laços
  for (const dir of direcoes) {                                       // Laços + Listas juntos
    await cuidarDaCasa();
    await drone.move(dir);
  }
}`
          }</code>

          {section('ECONOMIA')}
          <p style={{ fontSize: 15, color: C.text, lineHeight: 1.65, margin: 0 }}>
            Não existe ouro: os itens colhidos são a própria moeda. Feno é barato e paga Laços; os demais
            pagam o resto das Estruturas — os desbloqueios finais (Funções, Listas, Dicionários) custam
            tanto que <strong>uma casa só farmando sem parar levaria muitas horas</strong>: o jeito rápido
            de verdade é expandir a fazenda e escrever um código que cubra várias casas por ciclo, não
            ficar preso numa única casa. Além disso, <code>plant()</code> chamado sem checar o estado da
            casa antes (com <code>drone.info()</code>) desperdiça Feno quando erra — então um loop "no
            escuro" que tenta plantar tudo em toda casa sai caro, mesmo rodando rápido.{' '}
            <code>drone.sell()</code> é diferente — ele troca o estoque atual por moedas e pontos
            permanentes na sua conta do hub (com bônus de eficiência), então cada colheita é uma escolha:
            investir na loja da fazenda ou vender pra conta.
          </p>

          {section('EFICIÊNCIA (ARENA DE DESAFIOS)')}
          <p style={{ fontSize: 15, color: C.text, lineHeight: 1.65, margin: 0 }}>
            O placar de cada venda não é só "quanto colheu" — é quantas das suas ações (mover, plantar,
            arar, colher) realmente renderam colheita, com as que <strong>falharam de verdade</strong> (harvest
            vazio, plant em casa ocupada, mover pra fora da borda) pesando 4x mais que uma ação normal na
            conta. Isso separa um código que nunca erra nada (mas ainda visita casa por casa) de um código
            preso na borda repetindo a mesma falha sem parar — os dois colhem, mas só o primeiro tem
            eficiência alta de verdade. Um código que erra pouco (confere com <code>info()</code>/
            <code>canHarvest()</code> antes de agir) ganha bônus de pontos ao vender; um loop cego que fica
            tentando ações que falham desperdiça muito mais nessa conta e ganha bem menos, mesmo colhendo a
            mesma quantidade. O painel "EFICIÊNCIA" ao lado do placar de objetivos mostra esse número em
            tempo real.
          </p>

          {section('EXPANDIR A FAZENDA')}
          <p style={{ fontSize: 15, color: C.text, lineHeight: 1.65, margin: 0 }}>
            A fazenda começa pequena (3×3). Compre "Expandir fazenda" nas Ferramentas
            pra aumentar o campo em +1 por vez (até 9×9). Cada expansão limpa as plantações atuais e volta o
            drone pra (0,0), então planeje: colha e venda antes de expandir. Como a fazenda é finita, um
            código com posições fixas (tipo <code>move('right'); move('right')</code> sempre igual) fica
            incompleto num grid maior — use <code>drone.size()</code> dentro de um loop pra continuar
            cobrindo o campo inteiro depois de expandir.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   GRID DA FAZENDA
═══════════════════════════════════════════════════════════════ */
const SOIL_A = '#3a2a1a';
const SOIL_B = '#33240f';
const TILLED_A = '#4a3820';
const TILLED_B = '#40300f';
const SEED_GREEN = '#4ade80';

interface Burst { id: string; x: number; y: number }

function FarmGrid({ farm, now, droneMoveMs, theme: C, onCollect }: {
  farm: FarmState; now: number; droneMoveMs: number; theme: Theme; onCollect?: (item: ItemId, x: number, y: number) => void;
}) {
  const size = farm.gridSize * CELL;
  const [bursts, setBursts] = useState<Burst[]>([]);
  const prevTilesRef = useRef(farm.tiles);
  const gridRef = useRef<HTMLDivElement>(null);

  /* Detecta colheita (tile tinha planta, agora não tem) pra disparar um efeito de partícula
     e mandar o ícone do item colhido voando até o contador dele no header. */
  useEffect(() => {
    const prev = prevTilesRef.current;
    const added: Burst[] = [];
    const gridRect = gridRef.current?.getBoundingClientRect();
    farm.tiles.forEach((tile, i) => {
      if (prev[i]?.crop && !tile.crop) {
        const x = i % farm.gridSize;
        const y = Math.floor(i / farm.gridSize);
        added.push({ id: `${i}-${now}-${Math.random().toString(36).slice(2)}`, x, y });
        if (onCollect && gridRect) {
          onCollect(CROP_TO_ITEM[prev[i].crop as CropId], gridRect.left + x * CELL + CELL / 2, gridRect.top + y * CELL + CELL / 2);
        }
      }
    });
    prevTilesRef.current = farm.tiles;
    if (added.length) {
      setBursts(b => [...b, ...added]);
      added.forEach(burst => {
        window.setTimeout(() => setBursts(cur => cur.filter(b => b.id !== burst.id)), 600);
      });
    }
  }, [farm.tiles, now]);

  return (
    <div ref={gridRef} style={{ position: 'relative', width: size, height: size, background: '#241a10', border: `1px solid ${C.border}`, borderRadius: 4 }}>
      {farm.tiles.map((tile, i) => {
        const x = i % farm.gridSize;
        const y = Math.floor(i / farm.gridSize);
        const ready = isCropReady(tile, now);
        const soil = tile.tilled
          ? ((x + y) % 2 === 0 ? TILLED_A : TILLED_B)
          : ((x + y) % 2 === 0 ? SOIL_A : SOIL_B);
        const progress = tile.crop && tile.plantedAt !== null
          ? Math.min(1, (now - tile.plantedAt) / CROPS[tile.crop].growMs)
          : 0;
        return (
          <div key={i} className="jsf-tile" title={tile.tilled ? 'Terra arada' : undefined} style={{
            position: 'absolute', left: x * CELL, top: y * CELL, width: CELL - 2, height: CELL - 2,
            margin: 1, background: soil, border: tile.tilled ? '1px dashed rgba(255,255,255,0.25)' : '1px solid rgba(0,0,0,0.25)', borderRadius: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          }}>
            {tile.crop && (
              <div key={`${i}-${tile.plantedAt}`} style={{ animation: 'jsf-seed-in .25s ease' }}>
                <CropIcon crop={tile.crop as CropId} ready={ready} />
              </div>
            )}
            {ready && tile.value !== undefined && (
              <div style={{ position: 'absolute', top: 1, right: 2, fontSize: 9, fontWeight: 700, color: '#fff', textShadow: '0 0 2px #000, 0 0 2px #000' }}>
                {tile.value}
              </div>
            )}
            {tile.crop && !ready && (
              <div style={{ position: 'absolute', left: 3, right: 3, bottom: 3, height: 3, background: 'rgba(0,0,0,0.4)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${progress * 100}%`, height: '100%', background: SEED_GREEN, transition: 'width .3s linear' }} />
              </div>
            )}
          </div>
        );
      })}

      {bursts.map(b => (
        <div key={b.id} style={{
          position: 'absolute', left: b.x * CELL, top: b.y * CELL, width: CELL - 2, height: CELL - 2, margin: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
          animation: 'jsf-harvest-burst .6s ease-out forwards',
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <circle cx="9" cy="9" r="3" fill={C.gold} />
            <circle cx="3" cy="4" r="1.4" fill={C.gold} />
            <circle cx="15" cy="4" r="1.4" fill={C.gold} />
            <circle cx="3" cy="14" r="1.4" fill={C.gold} />
            <circle cx="15" cy="14" r="1.4" fill={C.gold} />
          </svg>
        </div>
      ))}

      <div className="jsf-drone" style={{
        position: 'absolute', left: farm.drone.x * CELL, top: farm.drone.y * CELL,
        width: CELL - 2, height: CELL - 2, margin: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none', transition: `left ${droneMoveMs}ms linear, top ${droneMoveMs}ms linear`,
      }}>
        <DroneIcon />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ÍCONES SVG — sem emojis, no padrão visual do hub
   Estágio "crescendo" é sempre verde (sementeira), independente da
   cultura, pra ficar bem distinto do estágio "pronto" (formato e
   cor própria de cada cultura: grama = tufo, arbusto = moita,
   cenoura = raiz laranja com folhas).
═══════════════════════════════════════════════════════════════ */
function CropIcon({ crop, ready }: { crop: CropId; ready: boolean }) {
  const def = CROPS[crop];

  if (!ready) {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20">
        <line x1="10" y1="18" x2="10" y2="11" stroke={SEED_GREEN} strokeWidth="1.8" />
        <path d="M10 13 Q5 11 5 6 Q11 7 10 13Z" fill={SEED_GREEN} />
        <path d="M10 13 Q15 11 15 6 Q9 7 10 13Z" fill={SEED_GREEN} opacity="0.75" />
      </svg>
    );
  }

  if (crop === 'grama') {
    // Tufo de grama: folhas preenchidas (não traços cruzados) saindo de uma
    // base comum, cada uma com altura/inclinação própria — silhueta de moita.
    const blades = [
      { dx: -6, h: 12 }, { dx: -3, h: 15 }, { dx: 0, h: 17 }, { dx: 3, h: 15 }, { dx: 6, h: 12 },
    ];
    return (
      <svg width="22" height="22" viewBox="0 0 20 20" style={{ animation: 'jsf-ready-glow 1.4s ease-in-out infinite' }}>
        {blades.map((b, i) => {
          const baseX = 10 + b.dx * 0.4;
          const tipX = 10 + b.dx;
          const tipY = 18 - b.h;
          return (
            <path key={i}
              d={`M${baseX - 1} 18 Q${baseX - 1.8} ${18 - b.h * 0.55} ${tipX} ${tipY} Q${baseX + 1.8} ${18 - b.h * 0.55} ${baseX + 1} 18 Z`}
              fill={def.color} opacity={i === 2 ? 1 : 0.85} />
          );
        })}
      </svg>
    );
  }

  if (crop === 'arbusto') {
    return (
      <svg width="24" height="24" viewBox="0 0 20 20" style={{ animation: 'jsf-ready-glow 1.4s ease-in-out infinite' }}>
        <line x1="10" y1="18" x2="10" y2="13" stroke="#6b4a24" strokeWidth="1.8" />
        <circle cx="6.8" cy="9.5" r="4" fill={def.color} />
        <circle cx="13.2" cy="9.5" r="4" fill={def.color} />
        <circle cx="10" cy="6.5" r="4.3" fill={def.color} />
        <circle cx="8" cy="8" r="0.9" fill="#a3441f" />
        <circle cx="12.2" cy="9" r="0.9" fill="#a3441f" />
      </svg>
    );
  }

  if (crop === 'cenoura') {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" style={{ animation: 'jsf-ready-glow 1.4s ease-in-out infinite' }}>
        <path d="M10 18 L6.3 8 Q10 6 13.7 8 Z" fill={def.color} />
        <line x1="9" y1="7.5" x2="7.3" y2="2" stroke="#3f6212" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="10" y1="7" x2="10" y2="1.3" stroke="#3f6212" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="11" y1="7.5" x2="12.7" y2="2" stroke="#3f6212" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (crop === 'arvore') {
    return (
      <svg width="24" height="24" viewBox="0 0 20 20" style={{ animation: 'jsf-ready-glow 1.4s ease-in-out infinite' }}>
        <rect x="9" y="13" width="2" height="6" fill="#6b4a24" />
        <path d="M10 2 L4 13 H16 Z" fill={def.color} />
        <path d="M10 6 L5.5 15 H14.5 Z" fill={def.color} opacity="0.8" />
      </svg>
    );
  }

  if (crop === 'girassol') {
    return (
      <svg width="22" height="22" viewBox="0 0 20 20" style={{ animation: 'jsf-ready-glow 1.4s ease-in-out infinite' }}>
        <line x1="10" y1="18" x2="10" y2="12" stroke="#3f6212" strokeWidth="1.6" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
          <ellipse key={a} cx="10" cy="6" rx="1.3" ry="3.2" fill={def.color} transform={`rotate(${a} 10 9)`} />
        ))}
        <circle cx="10" cy="9" r="2.6" fill="#78350f" />
      </svg>
    );
  }

  if (crop === 'abobora') {
    return (
      <svg width="22" height="22" viewBox="0 0 20 20" style={{ animation: 'jsf-ready-glow 1.4s ease-in-out infinite' }}>
        <line x1="10" y1="4" x2="10" y2="1.5" stroke="#3f6212" strokeWidth="1.6" strokeLinecap="round" />
        <ellipse cx="7" cy="11" rx="3.4" ry="5.2" fill={def.color} />
        <ellipse cx="10" cy="11" rx="3.4" ry="5.6" fill={def.color} />
        <ellipse cx="13" cy="11" rx="3.4" ry="5.2" fill={def.color} />
      </svg>
    );
  }

  // cacto
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" style={{ animation: 'jsf-ready-glow 1.4s ease-in-out infinite' }}>
      <rect x="8.5" y="4" width="3" height="14" rx="1.5" fill={def.color} />
      <rect x="4" y="8" width="3" height="7" rx="1.5" fill={def.color} />
      <rect x="13" y="6" width="3" height="9" rx="1.5" fill={def.color} />
    </svg>
  );
}

function DroneIcon() {
  // Pivô da rotação vai explícito em "rotate(ang cx cy)" — evita o bug de
  // transform-origin com transform-box:fill-box, que calcula o pivô como
  // deslocamento a partir da bounding box (minúscula) de cada hélice, e não
  // como coordenada absoluta do SVG, jogando o giro pra longe do corpo.
  const rotor = (cx: number, cy: number) => (
    <g>
      <line x1={cx - 3.4} y1={cy} x2={cx + 3.4} y2={cy} stroke="#86efac" strokeWidth="1.4">
        <animateTransform attributeName="transform" type="rotate" from={`0 ${cx} ${cy}`} to={`360 ${cx} ${cy}`} dur="0.35s" repeatCount="indefinite" />
      </line>
      <line x1={cx} y1={cy - 3.4} x2={cx} y2={cy + 3.4} stroke="#86efac" strokeWidth="1.4" opacity="0.6">
        <animateTransform attributeName="transform" type="rotate" from={`0 ${cx} ${cy}`} to={`360 ${cx} ${cy}`} dur="0.35s" repeatCount="indefinite" />
      </line>
      <circle cx={cx} cy={cy} r="1.1" fill="#052210" stroke="#86efac" strokeWidth="0.8" />
    </g>
  );
  return (
    <svg className="jsf-drone-body" width="38" height="38" viewBox="0 0 32 32" style={{ filter: 'drop-shadow(0 0 5px rgba(74,222,128,0.55))' }}>
      <ellipse cx="16" cy="27" rx="7" ry="1.6" fill="#000" opacity="0.35" />
      <line x1="16" y1="16" x2="5" y2="6" stroke="#2f7d4f" strokeWidth="1.6" />
      <line x1="16" y1="16" x2="27" y2="6" stroke="#2f7d4f" strokeWidth="1.6" />
      <line x1="16" y1="16" x2="5" y2="20" stroke="#2f7d4f" strokeWidth="1.6" />
      <line x1="16" y1="16" x2="27" y2="20" stroke="#2f7d4f" strokeWidth="1.6" />
      {rotor(5, 6)}
      {rotor(27, 6)}
      {rotor(5, 20)}
      {rotor(27, 20)}
      <rect x="10" y="11" width="12" height="11" rx="3" fill="#0f2015" stroke="#4ade80" strokeWidth="1.6" />
      <circle cx="16" cy="16.5" r="2.2" fill="#4ade80" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ÍCONE DO ITEM COLHIDO — usado nos contadores do header. Deliberadamente
   diferente do ícone da planta (CropIcon): aqui é o item já guardado no
   estoque (fardo de feno, tora de madeira, cenoura colhida...), não a
   planta crescendo na terra.
═══════════════════════════════════════════════════════════════ */
function ItemIcon({ item, size = 18 }: { item: ItemId; size?: number }) {
  if (item === 'feno') {
    return (
      <svg width={size} height={size} viewBox="0 0 20 20">
        <rect x="3" y="6" width="14" height="9" rx="3" fill={ITEM_COLORS.feno} />
        <line x1="4.5" y1="7" x2="14" y2="14" stroke="#7c5a06" strokeWidth="1.2" />
        <line x1="6.5" y1="6.2" x2="16" y2="13.5" stroke="#7c5a06" strokeWidth="1.2" />
      </svg>
    );
  }
  if (item === 'madeira') {
    return (
      <svg width={size} height={size} viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="7" fill="#a9713f" />
        <circle cx="10" cy="10" r="4.4" fill="none" stroke="#7a4e28" strokeWidth="1.2" />
        <circle cx="10" cy="10" r="1.6" fill="#7a4e28" />
      </svg>
    );
  }
  if (item === 'cenoura') {
    return (
      <svg width={size} height={size} viewBox="0 0 20 20">
        <path d="M10 18 L6.3 8 Q10 6 13.7 8 Z" fill={ITEM_COLORS.cenoura} />
        <line x1="9" y1="7.5" x2="7.3" y2="2" stroke="#3f6212" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="10" y1="7" x2="10" y2="1.3" stroke="#3f6212" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="11" y1="7.5" x2="12.7" y2="2" stroke="#3f6212" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (item === 'oleo') {
    return (
      <svg width={size} height={size} viewBox="0 0 20 20">
        <path d="M10 2 Q15 10 15 13.5 A5 5 0 0 1 5 13.5 Q5 10 10 2 Z" fill={ITEM_COLORS.oleo} />
      </svg>
    );
  }
  if (item === 'abobora') {
    return (
      <svg width={size} height={size} viewBox="0 0 20 20">
        <line x1="10" y1="4" x2="10" y2="1.5" stroke="#3f6212" strokeWidth="1.6" strokeLinecap="round" />
        <ellipse cx="7" cy="11" rx="3.4" ry="5.2" fill={ITEM_COLORS.abobora} />
        <ellipse cx="10" cy="11" rx="3.4" ry="5.6" fill={ITEM_COLORS.abobora} />
        <ellipse cx="13" cy="11" rx="3.4" ry="5.2" fill={ITEM_COLORS.abobora} />
      </svg>
    );
  }
  // fibra
  return (
    <svg width={size} height={size} viewBox="0 0 20 20">
      <path d="M6 3 Q9 10 6 17" stroke={ITEM_COLORS.fibra} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M10 2 Q11 10 10 18" stroke={ITEM_COLORS.fibra} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M14 3 Q11 10 14 17" stroke={ITEM_COLORS.fibra} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <line x1="4.5" y1="10" x2="15.5" y2="10" stroke={ITEM_COLORS.fibra} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FLIGHT ICON — ícone do item que voa da casa colhida até o contador
   no header. Monta na posição de origem e, um frame depois, muda pra
   posição de destino: a transição CSS de left/top/opacity faz o "voo".
═══════════════════════════════════════════════════════════════ */
function FlightIcon({ item, x1, y1, x2, y2, onDone }: {
  item: ItemId; x1: number; y1: number; x2: number; y2: number; onDone: () => void;
}) {
  const [arrived, setArrived] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setArrived(true));
    const timeout = window.setTimeout(onDone, 650);
    return () => { cancelAnimationFrame(raf); window.clearTimeout(timeout); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{
      position: 'fixed', left: arrived ? x2 : x1, top: arrived ? y2 : y1, zIndex: 200,
      transform: `translate(-50%, -50%) scale(${arrived ? 0.4 : 1})`,
      opacity: arrived ? 0 : 1, pointerEvents: 'none',
      transition: 'left .55s cubic-bezier(.2,.8,.3,1), top .55s cubic-bezier(.2,.8,.3,1), transform .55s ease, opacity .55s ease',
    }}>
      <ItemIcon item={item} size={20} />
    </div>
  );
}
