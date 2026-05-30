/* ── Copa do Mundo 2026 — sons via Web Audio API ─────────────────────────
   Sem arquivos externos. Tudo sintetizado em tempo real.
─────────────────────────────────────────────────────────────────────────── */

function getCtx(): AudioContext | null {
  try { return new AudioContext(); } catch { return null; }
}

/** Apito de árbitro */
export function playWhistle() {
  const ctx = getCtx();
  if (!ctx) return;
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(1000, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(1300, ctx.currentTime + 0.08);
  osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.15);
  osc.frequency.linearRampToValueAtTime(1400, ctx.currentTime + 0.28);
  osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.45);

  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.02);
  gain.gain.setValueAtTime(0.22, ctx.currentTime + 0.42);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.6);
}

/** Rugido da torcida (ruído filtrado) */
export function playCrowd() {
  const ctx = getCtx();
  if (!ctx) return;
  const dur     = 1.4;
  const bufSize = Math.floor(ctx.sampleRate * dur);
  const buf     = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data    = buf.getChannelData(0);

  for (let i = 0; i < bufSize; i++) {
    const t   = i / ctx.sampleRate;
    const env = Math.sin((t / dur) * Math.PI);        // fade in/out
    data[i]   = (Math.random() * 2 - 1) * env * 0.9;
  }

  const src    = ctx.createBufferSource();
  src.buffer   = buf;

  const lo     = ctx.createBiquadFilter();
  lo.type      = 'lowpass';
  lo.frequency.value = 800;

  const hi     = ctx.createBiquadFilter();
  hi.type      = 'highpass';
  hi.frequency.value = 180;

  const gain   = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.35, ctx.currentTime + 0.9);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

  src.connect(lo);
  lo.connect(hi);
  hi.connect(gain);
  gain.connect(ctx.destination);
  src.start();

  // Apito de gol no meio
  setTimeout(playWhistle, 300);
}
