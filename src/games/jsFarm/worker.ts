import { CropId, DroneAction, MainToWorker, WorkerToMain } from './types';

/* ═══════════════════════════════════════════════════════════════
   FAZENDA.JS — Web Worker que executa o código do jogador
   Cada ação do drone é async e só resolve quando a main thread
   processa o efeito, permitindo while(true) sem travar a UI.
═══════════════════════════════════════════════════════════════ */

const ctx = self as unknown as {
  postMessage: (msg: WorkerToMain) => void;
  onmessage: ((ev: MessageEvent<MainToWorker>) => void) | null;
};

let nextId = 1;
const pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();

function sendAction(action: DroneAction): Promise<unknown> {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    ctx.postMessage({ type: 'action', id, action });
  });
}

const drone = {
  move: (dir: 'up' | 'down' | 'left' | 'right') => sendAction({ kind: 'move', dir }),
  plant: (crop?: CropId) => sendAction({ kind: 'plant', crop }),
  till: () => sendAction({ kind: 'till' }),
  harvest: () => sendAction({ kind: 'harvest' }),
  canHarvest: () => sendAction({ kind: 'canHarvest' }),
  info: () => sendAction({ kind: 'info' }),
  size: () => sendAction({ kind: 'size' }),
  sell: () => sendAction({ kind: 'sell' }),
  home: () => sendAction({ kind: 'home' }),
  clear: () => sendAction({ kind: 'clear' }),
};

function workerLog(...args: unknown[]) {
  const text = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
  ctx.postMessage({ type: 'log', text });
}

ctx.onmessage = (ev: MessageEvent<MainToWorker>) => {
  const msg = ev.data;
  if (msg.type === 'result') {
    const p = pending.get(msg.id);
    if (p) { pending.delete(msg.id); p.resolve(msg.value); }
    return;
  }
  if (msg.type === 'error-result') {
    const p = pending.get(msg.id);
    if (p) { pending.delete(msg.id); p.reject(new Error(msg.message)); }
    return;
  }
  if (msg.type === 'run') {
    runUserCode(msg.code);
  }
};

async function runUserCode(code: string) {
  try {
    const fn = new Function(
      'drone', 'console',
      `"use strict"; return (async () => { ${code} })();`
    ) as (drone: unknown, console: unknown) => Promise<void>;
    await fn(drone, { log: workerLog });
    ctx.postMessage({ type: 'done' });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    ctx.postMessage({ type: 'error', message });
  }
}
