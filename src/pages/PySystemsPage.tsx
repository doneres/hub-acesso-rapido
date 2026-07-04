import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, Play, Loader2, Terminal, Car, Users, ShoppingCart } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode';
import { gameTheme } from '../lib/gameTheme';
import { SYSTEMS, findSystem } from '../games/pySystems/systems';
import { MainToWorker, WorkerToMain, MethodParam } from '../games/pySystems/types';

/* ═══════════════════════════════════════════════════════════════
   SISTEMAS.PY — LeetCode com interface gráfica de verdade:
   o aluno escreve uma classe Python, e cada botão do lado direito
   chama um método dela. A visualização lê o retorno de estado() —
   nunca um terminal/shell cru.
═══════════════════════════════════════════════════════════════ */
const CODE_KEY = (id: string) => `pysystems-code-${id}`;
const PY_BLUE = '#3776AB';
const PY_YELLOW = '#FFD43B';

interface Props { onBack?: () => void; isDark?: boolean }

export default function PySystemsPage({ onBack, isDark = true }: Props) {
  const base = gameTheme(isDark);
  const C = {
    ...base,
    accent: PY_BLUE,
    accentText: '#ffffff',
    gold: PY_YELLOW,
    red: '#f87171',
    card: base.panel2,
  };

  const [systemId, setSystemId] = useState(SYSTEMS[0].id);
  const system = findSystem(systemId);

  const [code, setCode] = useState(() => localStorage.getItem(CODE_KEY(SYSTEMS[0].id)) ?? SYSTEMS[0].starterCode);
  const [running, setRunning] = useState(false);
  const [pyodideLoading, setPyodideLoading] = useState(false);
  const [logs, setLogs] = useState<{ text: string; kind: 'log' | 'error' }[]>([]);
  const [state, setState] = useState<Record<string, unknown> | null>(null);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});

  const workerRef = useRef<Worker | null>(null);
  const nextCallId = useRef(1);
  const consoleEndRef = useRef<HTMLDivElement | null>(null);

  const appendLog = useCallback((text: string, kind: 'log' | 'error' = 'log') => {
    setLogs(prev => [...prev.slice(-199), { text, kind }]);
  }, []);

  /* Worker fica vivo a troca inteira da página — evita recarregar o
     Pyodide (~7MB) a cada clique em "Rodar". */
  useEffect(() => {
    const worker = new Worker(new URL('../games/pySystems/worker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;

    worker.onmessage = (ev: MessageEvent<WorkerToMain>) => {
      const msg = ev.data;
      if (msg.type === 'loading') {
        setPyodideLoading(true);
        appendLog('Carregando Python no navegador (só na primeira vez)…');
      } else if (msg.type === 'ready') {
        setPyodideLoading(false);
        setRunning(false);
        appendLog('Sistema pronto.');
      } else if (msg.type === 'state') {
        setState(msg.state);
      } else if (msg.type === 'log') {
        appendLog(msg.text, 'log');
      } else if (msg.type === 'error') {
        setPyodideLoading(false);
        setRunning(false);
        appendLog(msg.message, 'error');
      }
    };
    worker.onerror = (ev: ErrorEvent) => {
      setPyodideLoading(false);
      setRunning(false);
      appendLog(ev.message, 'error');
    };

    return () => worker.terminate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ block: 'nearest' });
  }, [logs]);

  const selectSystem = useCallback((id: string) => {
    setSystemId(id);
    const saved = localStorage.getItem(CODE_KEY(id));
    setCode(saved ?? findSystem(id).starterCode);
    setState(null);
    setLogs([]);
    setParamValues({});
  }, []);

  const runCode = useCallback(() => {
    localStorage.setItem(CODE_KEY(systemId), code);
    setLogs([]);
    setState(null);
    setRunning(true);
    workerRef.current?.postMessage({ type: 'run', code, className: system.className } satisfies MainToWorker);
  }, [code, systemId, system.className]);

  const callMethod = useCallback((methodId: string, params: MethodParam[]) => {
    const args = params.map(p => {
      const raw = paramValues[`${methodId}.${p.name}`] ?? '';
      return p.type === 'numero' ? Number(raw) || 0 : raw;
    });
    const id = nextCallId.current++;
    workerRef.current?.postMessage({ type: 'call', id, method: methodId, args } satisfies MainToWorker);
  }, [paramValues]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: C.bg, color: C.text, fontFamily: 'system-ui,-apple-system,sans-serif', overflow: 'hidden' }}>
      <style>{'@keyframes pysys-spin { to { transform: rotate(360deg); } } .pysys-spin { animation: pysys-spin 0.9s linear infinite; }'}</style>
      {/* HEADER */}
      <header style={{ height: 56, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 14, padding: '0 16px', borderBottom: `1px solid ${C.border}`, background: C.panel }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: C.sub, fontSize: 14, fontWeight: 600 }}>
          <ChevronLeft size={17} /> Voltar
        </button>
        <span style={{ fontWeight: 800, fontSize: 15, color: PY_YELLOW, letterSpacing: '0.02em' }}>SISTEMAS.PY</span>
        <div style={{ flex: 1 }} />
        {SYSTEMS.map(s => (
          <button key={s.id} onClick={() => selectSystem(s.id)}
            style={{ padding: '6px 12px', borderRadius: 5, border: `1px solid ${s.id === systemId ? PY_BLUE : C.border}`, background: s.id === systemId ? `${PY_BLUE}22` : 'transparent', color: s.id === systemId ? PY_BLUE : C.sub, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
            {s.title}
          </button>
        ))}
      </header>

      {/* BODY */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* LEFT: editor + console */}
        <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', borderRight: `1px solid ${C.border}`, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderBottom: `1px solid ${C.border}` }}>
            <button onClick={runCode} disabled={running || pyodideLoading}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: (running || pyodideLoading) ? C.card : PY_BLUE, border: 'none', borderRadius: 4, color: (running || pyodideLoading) ? C.sub : '#fff', fontSize: 13, fontWeight: 700, cursor: (running || pyodideLoading) ? 'not-allowed' : 'pointer' }}>
              {pyodideLoading ? <Loader2 size={14} className="pysys-spin" /> : <Play size={14} />}
              {pyodideLoading ? 'Carregando Python…' : 'Rodar'}
            </button>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 12, color: C.sub }}>{system.subtitle}</span>
          </div>

          <div style={{ flex: '1 1 55%', overflow: 'auto', minHeight: 0 }}>
            <CodeMirror
              value={code}
              onChange={v => setCode(v)}
              theme={isDark ? vscodeDark : vscodeLight}
              extensions={[python()]}
              height="100%"
              style={{ height: '100%', fontSize: 15 }}
            />
          </div>

          <div style={{ flex: '0 0 30%', display: 'flex', flexDirection: 'column', borderTop: `1px solid ${C.border}`, minHeight: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
              <Terminal size={13} color={C.sub} />
              <span style={{ fontSize: 12, color: C.sub, letterSpacing: '0.04em', fontWeight: 600 }}>CONSOLE</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px', fontFamily: 'monospace', fontSize: 13.5 }}>
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

        {/* RIGHT: enunciado + controles + visualização */}
        <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', overflow: 'auto', minWidth: 0 }}>
          <div style={{ margin: '14px 16px 0', padding: '11px 13px', border: `1px solid ${C.border}`, borderRadius: 6, background: C.card }}>
            <div style={{ fontSize: 11, color: PY_BLUE, fontWeight: 700, letterSpacing: '0.04em', marginBottom: 5 }}>ENUNCIADO</div>
            <p style={{ fontSize: 13.5, color: C.text, lineHeight: 1.55, margin: 0 }}>{system.prompt}</p>
          </div>

          {/* CONTROLES — botões/inputs que chamam os métodos da classe do aluno */}
          <div style={{ margin: '10px 16px 0', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {system.methods.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', border: `1px solid ${C.border}`, borderRadius: 6, background: C.card }}>
                {m.params.map(p => (
                  <input key={p.name} placeholder={p.placeholder ?? p.label}
                    type={p.type === 'numero' ? 'number' : 'text'}
                    value={paramValues[`${m.id}.${p.name}`] ?? ''}
                    onChange={e => setParamValues(prev => ({ ...prev, [`${m.id}.${p.name}`]: e.target.value }))}
                    style={{ width: 90, padding: '6px 8px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, fontSize: 12.5 }} />
                ))}
                <button onClick={() => callMethod(m.id, m.params)} disabled={!state}
                  style={{ padding: '6px 12px', background: state ? PY_BLUE : 'transparent', border: `1px solid ${state ? PY_BLUE : C.border}`, borderRadius: 4, color: state ? '#fff' : C.sub, fontSize: 12.5, fontWeight: 700, cursor: state ? 'pointer' : 'not-allowed' }}>
                  {m.label}
                </button>
              </div>
            ))}
          </div>

          {/* VISUALIZAÇÃO */}
          <div style={{ margin: '14px 16px', padding: 16, border: `1px solid ${C.border}`, borderRadius: 8, background: C.card, flex: 1 }}>
            {!state ? (
              <div style={{ color: C.sub, fontSize: 13.5, textAlign: 'center', padding: '30px 0' }}>Rode o código pra ver o sistema aqui.</div>
            ) : system.visual === 'estacionamento' ? (
              <EstacionamentoView state={state} theme={C} />
            ) : system.visual === 'fila' ? (
              <FilaView state={state} theme={C} />
            ) : (
              <CarrinhoView state={state} theme={C} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface Theme { bg: string; panel: string; border: string; text: string; sub: string; card: string; accent: string; gold: string; red: string }

/* ── Visualização: Estacionamento (grid de vagas) ────────────────── */
function EstacionamentoView({ state, theme: C }: { state: Record<string, unknown>; theme: Theme }) {
  const vagas = Array.isArray(state.vagas) ? state.vagas : [];
  if (vagas.length === 0) {
    return <EmptyHint text='estado() precisa devolver {"vagas": [...]}.' theme={C} />;
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <Car size={18} color={C.accent} />
      {vagas.map((placa, i) => (
        <div key={i} style={{
          width: 88, height: 60, borderRadius: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
          border: `2px solid ${placa ? C.accent : C.border}`, background: placa ? `${C.accent}1f` : 'transparent',
        }}>
          <span style={{ fontSize: 10, color: C.sub }}>Vaga {i + 1}</span>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: placa ? C.text : C.sub }}>{placa ? String(placa) : 'Livre'}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Visualização: Fila de atendimento ───────────────────────────── */
function FilaView({ state, theme: C }: { state: Record<string, unknown>; theme: Theme }) {
  const fila = Array.isArray(state.fila) ? state.fila : [];
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, color: C.sub, fontSize: 12.5 }}>
        <Users size={16} color={C.accent} /> {fila.length} pessoa(s) na fila
      </div>
      {fila.length === 0 ? (
        <EmptyHint text="Fila vazia — chame entrar(nome) pelos controles acima." theme={C} />
      ) : (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {fila.map((nome, i) => (
            <div key={i} style={{
              padding: '8px 12px', borderRadius: 20, border: `2px solid ${i === 0 ? C.gold : C.border}`,
              background: i === 0 ? `${C.gold}22` : 'transparent', fontSize: 12.5, fontWeight: i === 0 ? 700 : 500, color: C.text,
            }}>
              {i === 0 && '➜ '}{String(nome)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Visualização: Carrinho de compras ───────────────────────────── */
function CarrinhoView({ state, theme: C }: { state: Record<string, unknown>; theme: Theme }) {
  const itens = Array.isArray(state.itens) ? state.itens as Array<{ nome?: unknown; preco?: unknown }> : [];
  const total = typeof state.total === 'number' ? state.total : 0;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, color: C.sub, fontSize: 12.5 }}>
        <ShoppingCart size={16} color={C.accent} /> {itens.length} item(ns)
      </div>
      {itens.length === 0 ? (
        <EmptyHint text="Carrinho vazio — chame adicionar(nome, preco) pelos controles acima." theme={C} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {itens.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 10px', borderRadius: 5, border: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 13, color: C.text }}>{String(item.nome ?? '?')}</span>
              <span style={{ fontSize: 13, color: C.sub }}>R$ {Number(item.preco ?? 0).toFixed(2)}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 10px', marginTop: 4, borderTop: `1px solid ${C.border}`, fontWeight: 700 }}>
            <span style={{ color: C.text }}>Total</span>
            <span style={{ color: C.accent }}>R$ {total.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyHint({ text, theme: C }: { text: string; theme: Theme }) {
  return <div style={{ color: C.sub, fontSize: 12.5, fontStyle: 'italic' }}>{text}</div>;
}
