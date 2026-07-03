import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft, Play, Square, RotateCcw, Eraser, Coins, Terminal, HelpCircle, X, Lock,
  Sun, Moon, Target, ChevronDown, ChevronUp, Check,
} from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode';
import {
  CROPS, CROP_TO_ITEM, ITEM_NAMES, SHOP_ITEMS, SELL_RATES, EXPAND_LEVELS, MAX_GRID_SIZE, createInitialFarm, applyAction, isCropReady,
  actionDelayMs, shopItemLevel, canAffordShopItem, buyShopItem, canBuyStructure, buyStructure, canBuyExpand, buyExpand,
} from '../games/jsFarm/engine';
import { CropId, ItemId, FarmState, MainToWorker, SaveData, WorkerToMain } from '../games/jsFarm/types';
import { STRUCTURE_ORDER, STRUCTURES, StructureId, nextStructure, createEmptyUnlocks } from '../games/jsFarm/curriculum';
import { validateCode, formatViolation } from '../games/jsFarm/validator';
import { useGameState } from '../hooks/useGameState';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTES
═══════════════════════════════════════════════════════════════ */
const SAVE_KEY = 'jsfarm-save-v2';
const THEME_KEY = 'jsfarm-theme';
const CELL = 46;

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
  { id: 'variaveis', label: 'Desbloqueie "Variáveis"', isDone: f => f.unlocks.variaveis },
  { id: 'operadores', label: 'Desbloqueie "Operadores e condicionais"', isDone: f => f.unlocks.operadores },
  { id: 'cenoura', label: 'Compre "Sementes de cenoura", are a terra com till() e colha uma Cenoura', isDone: f => f.stock.cenoura > 0 },
  { id: 'funcoes', label: 'Desbloqueie "Funções"', isDone: f => f.unlocks.funcoes },
  { id: 'expand', label: 'Expanda a fazenda pela primeira vez', isDone: f => f.upgrades.expand > 0 },
  { id: 'listas', label: 'Desbloqueie "Listas"', isDone: f => f.unlocks.listas },
  { id: 'dicionarios', label: 'Desbloqueie "Dicionários"', isDone: f => f.unlocks.dicionarios },
];

/* ═══════════════════════════════════════════════════════════════
   PERSISTÊNCIA
═══════════════════════════════════════════════════════════════ */
function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SaveData;
      if (parsed.farm && typeof parsed.code === 'string') {
        if (!parsed.farm.unlocks) parsed.farm.unlocks = createEmptyUnlocks();
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
  const [, forceTick] = useState(0);

  const C = isDark ? DARK : LIGHT;

  const workerRef = useRef<Worker | null>(null);
  const farmRef = useRef(farm);
  farmRef.current = farm;
  const consoleEndRef = useRef<HTMLDivElement | null>(null);

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
        // canHarvest() é uma leitura pura, praticamente de graça — sem o
        // delay normal de ação, igual ao can_harvest() do jogo original.
        const delay = msg.action.kind === 'canHarvest' ? 0 : actionDelayMs(farmRef.current.upgrades);
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
                addCoins(coins);
                addPoints(points);
              } else {
                appendLog('Faça login na Arena de Desafios pra sua colheita virar moeda de verdade.', 'log');
              }
            }
            const state = { ...farmRef.current, stock: { feno: 0, madeira: 0, cenoura: 0 } };
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} title={`${ITEM_NAMES.feno} — item da Grama`}>
          <CropIcon crop="grama" ready />
          <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 11, color: CROPS.grama.color }}>{farm.stock.feno}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} title={`${ITEM_NAMES.madeira} — item do Arbusto`}>
          <CropIcon crop="arbusto" ready />
          <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 11, color: CROPS.arbusto.color }}>{farm.stock.madeira}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} title={`${ITEM_NAMES.cenoura} — item da Cenoura`}>
          <CropIcon crop="cenoura" ready />
          <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 11, color: CROPS.cenoura.color }}>{farm.stock.cenoura}</span>
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
        <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', overflow: 'auto', minWidth: 0 }}>

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

          <div style={{ padding: 16, display: 'flex', justifyContent: 'center' }}>
            <FarmGrid farm={farm} now={now} droneMoveMs={actionDelayMs(farm.upgrades)} theme={C} />
          </div>

          <div style={{ padding: '0 16px 16px' }}>
            <div style={{ fontSize: 12, color: C.accent, letterSpacing: '0.04em', marginBottom: 9, fontWeight: 700 }}>ESTRUTURAS DE PROGRAMAÇÃO</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 22 }}>
              {STRUCTURE_ORDER.map(id => {
                const def = STRUCTURES[id];
                const owned = farm.unlocks[id];
                const { allowed, reason } = canBuyStructure(farm, id);
                const costLabel = (Object.keys(def.cost) as ItemId[])
                  .map(c => `${def.cost[c]} ${ITEM_NAMES[c].toLowerCase()}`)
                  .join(' + ');
                return (
                  <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', background: C.card, border: `1px solid ${owned ? C.borderStrong : C.border}`, borderRadius: 5, opacity: owned || allowed || reason === 'colheita insuficiente' ? 1 : 0.55 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 700, color: owned ? C.accent : C.text }}>{def.name}</div>
                      <div style={{ fontSize: 12.5, color: C.sub }}>{owned ? def.desc : (reason && reason !== 'colheita insuficiente' ? reason : def.desc)}</div>
                    </div>
                    <button onClick={() => buyStruct(id)} disabled={!allowed}
                      style={{ flexShrink: 0, padding: '8px 13px', background: owned ? 'transparent' : allowed ? C.accent : 'transparent', border: `1px solid ${owned ? C.borderStrong : allowed ? C.accent : C.border}`, borderRadius: 4, color: owned ? C.accent : allowed ? C.accentText : C.sub, fontSize: 13, fontWeight: 700, cursor: allowed ? 'pointer' : 'not-allowed' }}>
                      {owned ? 'OK' : !allowed && reason !== 'colheita insuficiente' ? <Lock size={13} /> : costLabel}
                    </button>
                  </div>
                );
              })}
            </div>

            <div style={{ fontSize: 12, color: C.sub, letterSpacing: '0.04em', marginBottom: 9, fontWeight: 700 }}>FERRAMENTAS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SHOP_ITEMS.map(item => {
                const level = shopItemLevel(farm, item.id);
                const maxed = level >= item.maxLevel;
                const cost = item.cost(level);
                const canBuy = !maxed && canAffordShopItem(farm, item.id);
                const costLabel = (Object.keys(cost) as ItemId[])
                  .map(c => `${cost[c]} ${ITEM_NAMES[c].toLowerCase()}`)
                  .join(' + ');
                return (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 5 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 700, color: C.text }}>{item.name} {item.maxLevel > 1 && <span style={{ color: C.sub, fontWeight: 400 }}>({level}/{item.maxLevel})</span>}</div>
                      <div style={{ fontSize: 12.5, color: C.sub }}>{item.desc}</div>
                    </div>
                    <button onClick={() => buy(item.id)} disabled={!canBuy}
                      style={{ flexShrink: 0, padding: '8px 13px', background: maxed ? 'transparent' : canBuy ? C.accent : 'transparent', border: `1px solid ${maxed ? C.border : C.accent}`, borderRadius: 4, color: maxed ? C.sub : canBuy ? C.accentText : C.sub, fontSize: 13, fontWeight: 700, cursor: canBuy ? 'pointer' : 'not-allowed' }}>
                      {maxed ? 'MAX' : costLabel}
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
                      <div style={{ fontSize: 12.5, color: C.sub }}>Aumenta o campo em +1. Limpa as plantações atuais, igual ao jogo original.</div>
                    </div>
                    <button onClick={expandFarm} disabled={!allowed}
                      style={{ flexShrink: 0, padding: '8px 13px', background: maxed ? 'transparent' : allowed ? C.accent : 'transparent', border: `1px solid ${maxed ? C.border : C.accent}`, borderRadius: 4, color: maxed ? C.sub : allowed ? C.accentText : C.sub, fontSize: 13, fontWeight: 700, cursor: allowed ? 'pointer' : 'not-allowed' }}>
                      {maxed ? 'MAX' : costLabel}
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {showHelp && <HelpModal farm={farm} theme={C} onClose={() => setShowHelp(false)} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MODAL DE AJUDA — API do drone e estruturas de JS disponíveis
═══════════════════════════════════════════════════════════════ */
function HelpModal({ farm, theme: C, onClose }: { farm: FarmState; theme: Theme; onClose: () => void }) {
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
  const next = nextStructure(farm.unlocks);

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
            arbusto e cenoura), sempre nessa ordem. Usar uma estrutura ainda não comprada trava a execução com
            um aviso, sem rodar nada.
          </p>

          {section('AS 3 CULTURAS')}
          <p style={{ fontSize: 15, color: C.text, lineHeight: 1.65, margin: 0 }}>
            <strong style={{ color: CROPS.grama.color }}>Grama</strong> cresce sozinha em qualquer casa vazia
            não arada — não precisa plantar. <strong style={{ color: CROPS.arbusto.color }}>Arbusto</strong> precisa
            de <code>plant('arbusto')</code>. <strong style={{ color: CROPS.cenoura.color }}>Cenoura</strong> só
            cresce em terra arada — use <code>till()</code> antes de <code>plant('cenoura')</code>. Igual ao jogo
            original, o item colhido tem nome diferente da planta: Grama vira <strong>Feno</strong>, Arbusto
            vira <strong>Madeira</strong>, Cenoura vira <strong>Cenoura</strong> mesmo (é o único caso 1-pra-1).
          </p>

          {section('API DO DRONE (sempre disponível)')}
          {apiRow(
            "await drone.move(direcao)",
            'Move uma casa na direção informada: "up", "down", "left" ou "right". O mapa é um toroide: se sair de um lado do campo, reaparece do outro — nunca trava na borda. Sempre retorna true.',
            "await drone.move('right');"
          )}
          {apiRow(
            'await drone.plant(cultura?)',
            'Planta na casa atual. Sem argumento planta grama (raramente precisa). Depois de comprar "Sementes de arbusto"/"Sementes de cenoura", aceita plant(\'arbusto\') e plant(\'cenoura\') — essa última só funciona em terra arada. Retorna true/false.',
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
            'await drone.sell()',
            'Troca todo o estoque de Feno/Madeira/Cenoura por moedas e pontos na SUA CONTA do hub (visíveis na Arena de Desafios), zerando o estoque. Retorna as moedas ganhas.',
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

          {next && (
            <>
              {section('PRÓXIMA ESTRUTURA')}
              <p style={{ fontSize: 15, color: C.text, lineHeight: 1.65, margin: 0 }}>
                <strong style={{ color: C.gold }}>{STRUCTURES[next].name}</strong> — {STRUCTURES[next].desc} Custa{' '}
                <strong style={{ color: C.gold }}>
                  {(Object.keys(STRUCTURES[next].cost) as ItemId[]).map(c => `${STRUCTURES[next].cost[c]} ${ITEM_NAMES[c].toLowerCase()}`).join(' + ')}
                </strong> na loja.
              </p>
            </>
          )}

          {section('ECONOMIA')}
          <p style={{ fontSize: 15, color: C.text, lineHeight: 1.65, margin: 0 }}>
            Não existe ouro: Feno, Madeira e Cenoura colhidos são a própria moeda. Feno é barato e paga
            Laços; Madeira e Cenoura pagam o resto das Estruturas — os desbloqueios finais (Funções, Listas,
            Dicionários) custam tanto que <strong>uma casa só farmando sem parar levaria muitas horas</strong>:
            o jeito rápido de verdade é expandir a fazenda e escrever um código que cubra várias casas por
            ciclo, não ficar preso numa única casa. <code>drone.sell()</code> é diferente — ele troca o
            estoque atual por moedas e pontos permanentes na sua conta do hub, então cada colheita é uma
            escolha: investir na loja da fazenda ou vender pra conta.
          </p>

          {section('EXPANDIR A FAZENDA')}
          <p style={{ fontSize: 15, color: C.text, lineHeight: 1.65, margin: 0 }}>
            A fazenda começa pequena (3×3) — igual ao jogo original. Compre "Expandir fazenda" nas Ferramentas
            pra aumentar o campo em +1 por vez (até 9×9). Cada expansão limpa as plantações atuais e volta o
            drone pra (0,0), então planeje: colha e venda antes de expandir.
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

function FarmGrid({ farm, now, droneMoveMs, theme: C }: { farm: FarmState; now: number; droneMoveMs: number; theme: Theme }) {
  const size = farm.gridSize * CELL;
  const [bursts, setBursts] = useState<Burst[]>([]);
  const prevTilesRef = useRef(farm.tiles);

  /* Detecta colheita (tile tinha planta, agora não tem) pra disparar um efeito de partícula */
  useEffect(() => {
    const prev = prevTilesRef.current;
    const added: Burst[] = [];
    farm.tiles.forEach((tile, i) => {
      if (prev[i]?.crop && !tile.crop) {
        added.push({ id: `${i}-${now}-${Math.random().toString(36).slice(2)}`, x: i % farm.gridSize, y: Math.floor(i / farm.gridSize) });
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
    <div style={{ position: 'relative', width: size, height: size, background: '#241a10', border: `1px solid ${C.border}`, borderRadius: 4 }}>
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
    return (
      <svg width="22" height="22" viewBox="0 0 20 20" style={{ animation: 'jsf-ready-glow 1.4s ease-in-out infinite' }}>
        {[-5, -1.7, 1.7, 5].map((dx, i) => (
          <path key={dx} d={`M${10 + dx} 18 Q${10 + dx + (i % 2 ? 2.2 : -2.2)} 10 ${10 + dx} 3`} stroke={def.color} strokeWidth="1.9" fill="none" strokeLinecap="round" />
        ))}
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

  return (
    <svg width="20" height="20" viewBox="0 0 20 20" style={{ animation: 'jsf-ready-glow 1.4s ease-in-out infinite' }}>
      <path d="M10 18 L6.3 8 Q10 6 13.7 8 Z" fill={def.color} />
      <line x1="9" y1="7.5" x2="7.3" y2="2" stroke="#3f6212" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="10" y1="7" x2="10" y2="1.3" stroke="#3f6212" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="11" y1="7.5" x2="12.7" y2="2" stroke="#3f6212" strokeWidth="1.6" strokeLinecap="round" />
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
    <svg className="jsf-drone-body" width="28" height="28" viewBox="0 0 32 32" style={{ filter: 'drop-shadow(0 0 5px rgba(74,222,128,0.55))' }}>
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
