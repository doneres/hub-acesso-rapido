import { MainToWorker, WorkerToMain } from './types';

/* ═══════════════════════════════════════════════════════════════
   SISTEMAS.PY — Web Worker que roda Python de verdade via Pyodide
   (Python compilado pra WebAssembly). Carregado via CDN dentro do
   worker — sem isso não precisa de nenhum servidor, só arquivo
   estático, então funciona liso no GitHub Pages.

   O worker fica vivo entre execuções: "Rodar" só re-executa a classe
   e cria uma instância nova, sem recarregar o Pyodide (~7MB) de novo
   a cada clique.
═══════════════════════════════════════════════════════════════ */

const ctx = self as unknown as {
  postMessage: (msg: WorkerToMain) => void;
  onmessage: ((ev: MessageEvent<MainToWorker>) => void) | null;
};

const PYODIDE_VERSION = '0.26.4';
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PyodideInstance = any;

let pyodidePromise: Promise<PyodideInstance> | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let instance: any = null;

async function getPyodide(): Promise<PyodideInstance> {
  if (!pyodidePromise) {
    ctx.postMessage({ type: 'loading' });
    pyodidePromise = (async () => {
      const mod = await import(/* @vite-ignore */ `${PYODIDE_CDN}pyodide.mjs`);
      const pyodide = await mod.loadPyodide({ indexURL: PYODIDE_CDN });
      pyodide.setStdout({ batched: (text: string) => ctx.postMessage({ type: 'log', text }) });
      pyodide.setStderr({ batched: (text: string) => ctx.postMessage({ type: 'log', text }) });
      return pyodide;
    })();
  }
  return pyodidePromise;
}

/** Converte o retorno de estado() (um dict Python) pra objeto JS puro. */
function toPlainJs(value: unknown): Record<string, unknown> {
  if (value && typeof (value as { toJs?: unknown }).toJs === 'function') {
    return (value as { toJs: (opts: unknown) => unknown }).toJs({ dict_converter: Object.fromEntries }) as Record<string, unknown>;
  }
  return (value ?? {}) as Record<string, unknown>;
}

/** O traceback completo do Pyodide é longo demais pro aluno — mostra só a última linha (a mensagem real do erro). */
function cleanPyError(message: string): string {
  const lines = message.trim().split('\n');
  return lines[lines.length - 1] || message;
}

ctx.onmessage = async (ev: MessageEvent<MainToWorker>) => {
  const msg = ev.data;
  try {
    const pyodide = await getPyodide();

    if (msg.type === 'run') {
      instance = null;
      pyodide.runPython(msg.code);
      const cls = pyodide.globals.get(msg.className);
      if (!cls) throw new Error(`Classe "${msg.className}" não encontrada — confira se o nome está exatamente igual ao do enunciado.`);
      instance = cls();
      ctx.postMessage({ type: 'ready' });
      const state = toPlainJs(instance.estado());
      ctx.postMessage({ type: 'state', id: 0, state });
      return;
    }

    if (msg.type === 'call') {
      if (!instance) throw new Error('Rode o código antes de usar os controles.');
      const method = instance[msg.method];
      if (typeof method !== 'function') throw new Error(`Método "${msg.method}" não existe na sua classe.`);
      method(...msg.args);
      const state = toPlainJs(instance.estado());
      ctx.postMessage({ type: 'state', id: msg.id, state });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    ctx.postMessage({ type: 'error', message: cleanPyError(message) });
  }
};
