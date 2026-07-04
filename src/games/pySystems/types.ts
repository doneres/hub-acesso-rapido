/* ═══════════════════════════════════════════════════════════════
   SISTEMAS.PY — tipos compartilhados entre main thread e worker
═══════════════════════════════════════════════════════════════ */

export type ParamType = 'texto' | 'numero';

export interface MethodParam {
  name: string;
  label: string;
  type: ParamType;
  placeholder?: string;
}

/** Uma ação que vira botão (+ inputs dos parâmetros) na interface. */
export interface SystemMethod {
  id: string; // nome exato do método Python
  label: string;
  params: MethodParam[];
}

export type VisualKind = 'estacionamento' | 'fila' | 'carrinho';

export interface SystemDef {
  id: string;
  title: string;
  subtitle: string;
  prompt: string;
  className: string; // nome exato da classe Python esperada
  starterCode: string;
  methods: SystemMethod[];
  visual: VisualKind;
}

/* ── Protocolo Worker ↔ Main thread ──────────────────────────── */
export interface MainRunMsg { type: 'run'; code: string; className: string }
export interface MainCallMsg { type: 'call'; id: number; method: string; args: (string | number)[] }
export type MainToWorker = MainRunMsg | MainCallMsg;

export interface WorkerLoadingMsg { type: 'loading' }
export interface WorkerReadyMsg { type: 'ready' }
export interface WorkerStateMsg { type: 'state'; id: number; state: Record<string, unknown> }
export interface WorkerLogMsg { type: 'log'; text: string }
export interface WorkerErrorMsg { type: 'error'; message: string }
export type WorkerToMain = WorkerLoadingMsg | WorkerReadyMsg | WorkerStateMsg | WorkerLogMsg | WorkerErrorMsg;
