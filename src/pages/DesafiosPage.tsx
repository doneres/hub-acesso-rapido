import React, { useState, useEffect, ElementType } from 'react';
import {
  Home, Sun, Moon, Trophy, Bug, Hash, Brain, Cpu,
  Search, Eye, Star, Crown, BookOpen, Lightbulb,
  CheckCircle2, XCircle, Zap, ChevronDown, ChevronUp,
  LogIn, UserPlus, LogOut, Shield, Lock, User,
  Medal, ChevronRight, X, Info, ArrowRight,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useGameState, GameUser } from '../hooks/useGameState';
import { PUZZLES, CATEGORY_CONFIG, getRank, Puzzle } from '../data/puzzles';

/* ── Theme ──────────────────────────────────────────────────────────────── */
function getTheme(isDark: boolean) {
  return isDark ? {
    pageBg:       '#080d1a',
    topBg:        '#0a0f1e',
    topBorder:    '#2a1a4e',
    heroBg:       'linear-gradient(180deg,#0a0f1e 0%,#080d1a 100%)',
    gridColor:    'rgba(167,139,250,0.05)',
    cardBg:       '#111827',
    cardBorder:   '#2a1a4e',
    cardShadow:   '#0a0520',
    modalBg:      '#0e1425',
    text:         '#e2e8f0',
    textSec:      '#94a3b8',
    textMut:      '#475569',
    inputBg:      '#0a0f1e',
    inputBorder:  '#2a1a4e',
    accent:       '#a78bfa',
    accentDim:    'rgba(167,139,250,0.15)',
    tabInact:     '#111827',
    tabInactText: '#64748b',
    divider:      '#1e2a3a',
    codeBg:       '#0d1117',
  } : {
    pageBg:       '#f8f6ff',
    topBg:        '#ffffff',
    topBorder:    '#ede9fe',
    heroBg:       'linear-gradient(180deg,#ffffff 0%,#f8f6ff 100%)',
    gridColor:    'rgba(109,40,217,0.04)',
    cardBg:       '#ffffff',
    cardBorder:   '#ede9fe',
    cardShadow:   '#ddd6fe',
    modalBg:      '#ffffff',
    text:         '#0f172a',
    textSec:      '#334155',
    textMut:      '#64748b',
    inputBg:      '#f8f6ff',
    inputBorder:  '#ede9fe',
    accent:       '#7c3aed',
    accentDim:    'rgba(124,58,237,0.08)',
    tabInact:     '#ffffff',
    tabInactText: '#64748b',
    divider:      '#ede9fe',
    codeBg:       '#1e1e2e',
  };
}

/* ── Icon lookup (same pattern as RoadmapsPage) ─────────────────────────── */
const ICON_MAP: Record<string, ElementType> = {
  Trophy, Bug, Hash, Brain, Cpu, Search, Eye, Star, Crown,
  BookOpen, Lightbulb, CheckCircle2, XCircle, Shield, Medal,
};
function LIcon({ name, size = 18, color }: { name: string; size?: number; color?: string }) {
  const Ic = ICON_MAP[name];
  return Ic ? <Ic size={size} color={color} /> : null;
}

/* ── Constants ──────────────────────────────────────────────────────────── */
const AVATARS = ['🕵','🔍','🧠','🤖','💻','🎯','⚡','🦊','🐉','🚀','🎲','🦁'];
const TUTORIAL_KEY = 'ctrlplay_desafios_tutorial_v1';

type CatFilter = 'todos' | 'bug' | 'sequencia' | 'logica' | 'algoritmo';

const DIFF_COLOR: Record<string, string> = {
  Iniciante: '#22c55e', Intermediário: '#f59e0b', Avançado: '#ef4444',
};

const CAT_TABS: { id: CatFilter; label: string; icon: string }[] = [
  { id: 'todos',     label: 'TODOS',      icon: 'Trophy'  },
  { id: 'bug',       label: 'CAÇA AO BUG', icon: 'Bug'    },
  { id: 'sequencia', label: 'SEQUÊNCIAS', icon: 'Hash'    },
  { id: 'logica',    label: 'LÓGICA PURA', icon: 'Brain'  },
  { id: 'algoritmo', label: 'ALGORITMOS', icon: 'Cpu'     },
];

const RANKS_IN_ORDER = [0, 75, 200, 500, 1000];

/* ════════════════════════════════════════════════════════════════════════
   TUTORIAL MODAL
════════════════════════════════════════════════════════════════════════ */
function TutorialModal({ T, isDark, onClose }: { T: ReturnType<typeof getTheme>; isDark: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'O QUE É DETETIVE DE CÓDIGO?',
      content: (
        <div>
          <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.7, marginBottom: 20 }}>
            Uma plataforma de desafios gamificada onde você resolve casos de lógica, programação e matemática — como um verdadeiro detetive digital.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
              <div key={key} style={{ padding: '12px 14px', background: cfg.bg, border: `2px solid ${cfg.color}40`, display: 'flex', alignItems: 'center', gap: 10 }}>
                <LIcon name={key === 'bug' ? 'Bug' : key === 'sequencia' ? 'Hash' : key === 'logica' ? 'Brain' : 'Cpu'} size={18} color={cfg.color} />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 900, color: cfg.color }}>{cfg.label}</div>
                  <div style={{ fontSize: 11, color: T.textMut }}>
                    {key === 'bug' ? 'Encontre erros no código' : key === 'sequencia' ? 'Descubra o próximo número' : key === 'logica' ? 'Deduza com lógica pura' : 'Analise algoritmos'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'COMO PONTUAR?',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Iniciante', pts: 10, color: '#22c55e' },
            { label: 'Intermediário', pts: 25, color: '#f59e0b' },
            { label: 'Avançado', pts: 50, color: '#ef4444' },
          ].map(d => (
            <div key={d.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: T.cardBg, border: `2px solid ${d.color}40`, boxShadow: `3px 3px 0 ${d.color}20` }}>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: d.color }}>{d.label.toUpperCase()}</span>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: d.color }}>+{d.pts} PTS</span>
            </div>
          ))}
          <div style={{ padding: '12px 16px', background: T.accentDim, border: `2px solid ${T.accent}40`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Zap size={16} color={T.accent} />
            <span style={{ fontSize: 13, color: T.textSec }}>A cada <strong style={{ color: T.accent }}>5 acertos seguidos</strong>, ganhe <strong style={{ color: T.accent }}>+10 pts</strong> bônus!</span>
          </div>
          <div style={{ padding: '12px 16px', background: T.cardBg, border: `2px solid ${T.textMut}30`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Lightbulb size={16} color='#fbbf24' />
            <span style={{ fontSize: 13, color: T.textSec }}>Pedir uma dica custa <strong style={{ color: '#fbbf24' }}>-5 pts</strong> do prêmio do caso.</span>
          </div>
        </div>
      ),
    },
    {
      title: 'TÍTULOS & RANKING',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {RANKS_IN_ORDER.map(pts => {
            const r = getRank(pts);
            return (
              <div key={r.title} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 16px', background: T.cardBg, border: `2px solid ${r.color}40`, boxShadow: `3px 3px 0 ${r.color}20` }}>
                <LIcon name={r.icon} size={18} color={r.color} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: r.color }}>{r.title.toUpperCase()}</div>
                  <div style={{ fontSize: 12, color: T.textMut, marginTop: 3 }}>{pts === 0 ? 'Ponto de partida' : `A partir de ${pts} pontos`}</div>
                </div>
              </div>
            );
          })}
        </div>
      ),
    },
    {
      title: 'SALVE SEU PROGRESSO',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.7 }}>
            Crie um perfil com <strong style={{ color: T.accent }}>usuário e senha</strong> para salvar sua pontuação e continuar de onde parou em qualquer computador da escola.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: <UserPlus size={16} color={T.accent} />, text: 'Crie uma conta com usuário e senha' },
              { icon: <LogIn size={16} color='#34d399' />, text: 'Faça login em qualquer computador' },
              { icon: <Trophy size={16} color='#fbbf24' />, text: 'Compete no placar geral da escola' },
              { icon: <Shield size={16} color='#60a5fa' />, text: 'Seus pontos ficam guardados com segurança' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: T.cardBg, border: `2px solid ${T.cardBorder}` }}>
                {item.icon}
                <span style={{ fontSize: 13, color: T.textSec }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  const cur = steps[step];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
      <div style={{ width: '100%', maxWidth: 520, background: T.modalBg, border: `2px solid ${T.accent}`, boxShadow: `6px 6px 0 ${T.accent}40`, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: `2px solid ${T.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.accentDim }}>
          <div>
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: T.accent }}>
              TUTORIAL · {step + 1}/{steps.length}
            </span>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: isDark ? 10 : 9, color: T.text, marginTop: 6, lineHeight: 1.5 }}>
              {cur.title}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textMut, padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', flex: 1, overflowY: 'auto', maxHeight: '55vh' }}>
          {cur.content}
        </div>

        {/* Stepper dots + buttons */}
        <div style={{ padding: '16px 20px', borderTop: `2px solid ${T.topBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {steps.map((_, i) => (
              <div key={i} style={{ width: i === step ? 18 : 8, height: 8, background: i === step ? T.accent : T.textMut + '40', transition: 'all .2s' }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: T.accent, border: 'none', color: '#fff', fontFamily: "'Press Start 2P', monospace", fontSize: 9, cursor: 'pointer', boxShadow: `3px 3px 0 ${T.accent}60` }}
              >
                PRÓXIMO <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={onClose}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: T.accent, border: 'none', color: '#fff', fontFamily: "'Press Start 2P', monospace", fontSize: 9, cursor: 'pointer', boxShadow: `3px 3px 0 ${T.accent}60` }}
              >
                COMEÇAR! <Trophy size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   AUTH MODAL (login + register)
════════════════════════════════════════════════════════════════════════ */
function AuthModal({ T, isDark, users, onLogin, onRegister, onClose }: {
  T: ReturnType<typeof getTheme>;
  isDark: boolean;
  users: GameUser[];
  onLogin: (name: string, pass: string) => 'ok' | 'wrong-password' | 'not-found';
  onRegister: (name: string, avatar: string, pass: string) => void;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<'login' | 'register'>(users.length > 0 ? 'login' : 'register');
  const [name, setName]     = useState('');
  const [pass, setPass]     = useState('');
  const [pass2, setPass2]   = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [error, setError]   = useState('');

  const inputStyle = {
    width: '100%', boxSizing: 'border-box' as const,
    padding: '10px 14px',
    background: T.inputBg,
    border: `2px solid ${T.inputBorder}`,
    color: T.text,
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
  };

  const handleLogin = () => {
    if (!name.trim() || !pass) { setError('Preencha usuário e senha.'); return; }
    const result = onLogin(name.trim(), pass);
    if (result === 'not-found') { setError('Usuário não encontrado.'); return; }
    if (result === 'wrong-password') { setError('Senha incorreta. Tente novamente.'); return; }
    onClose();
  };

  const handleRegister = () => {
    if (!name.trim()) { setError('Digite um nome de usuário.'); return; }
    if (name.trim().length < 3) { setError('Mínimo de 3 caracteres.'); return; }
    if (pass.length < 4) { setError('Senha com pelo menos 4 caracteres.'); return; }
    if (pass !== pass2) { setError('As senhas não coincidem.'); return; }
    if (users.some(u => u.name.toLowerCase() === name.trim().toLowerCase())) {
      setError('Esse nome já está em uso. Faça login.'); return;
    }
    onRegister(name.trim(), avatar, pass);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
      <div style={{ width: '100%', maxWidth: 420, background: T.modalBg, border: `2px solid ${T.accent}`, boxShadow: `6px 6px 0 ${T.accent}40` }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', background: T.accentDim, borderBottom: `2px solid ${T.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: T.accent }}>DETETIVE DE CÓDIGO</div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: T.text, marginTop: 6 }}>
              {mode === 'login' ? 'IDENTIFICAÇÃO' : 'CRIAR CONTA'}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textMut }}><X size={18} /></button>
        </div>

        {/* Mode tabs */}
        {users.length > 0 && (
          <div style={{ display: 'flex', borderBottom: `2px solid ${T.topBorder}` }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                style={{ flex: 1, padding: '12px', background: mode === m ? T.accentDim : T.cardBg, border: 'none', borderBottom: mode === m ? `2px solid ${T.accent}` : 'none', cursor: 'pointer', fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: mode === m ? T.accent : T.tabInactText }}>
                {m === 'login' ? 'ENTRAR' : 'CADASTRAR'}
              </button>
            ))}
          </div>
        )}

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Avatar (register only) */}
          {mode === 'register' && (
            <div>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: T.textMut, marginBottom: 10 }}>AVATAR</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
                {AVATARS.map(a => (
                  <button key={a} onClick={() => setAvatar(a)}
                    style={{ height: 40, fontSize: 20, background: avatar === a ? T.accentDim : T.cardBg, border: `2px solid ${avatar === a ? T.accent : T.cardBorder}`, cursor: 'pointer', boxShadow: avatar === a ? `2px 2px 0 ${T.accent}50` : `2px 2px 0 ${T.cardShadow}`, transform: avatar === a ? 'translateY(-2px)' : 'none', transition: 'all .1s' }}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Name */}
          <div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: T.textMut, marginBottom: 8 }}>USUÁRIO</div>
            <div style={{ position: 'relative' }}>
              <User size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.textMut }} />
              <input value={name} onChange={e => { setName(e.target.value); setError(''); }}
                placeholder="Digite seu nome de usuário" maxLength={20}
                style={{ ...inputStyle, paddingLeft: 34 }}
                onFocus={e => (e.currentTarget.style.borderColor = T.accent)}
                onBlur={e => (e.currentTarget.style.borderColor = T.inputBorder)} />
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: T.textMut, marginBottom: 8 }}>SENHA</div>
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.textMut }} />
              <input type="password" value={pass} onChange={e => { setPass(e.target.value); setError(''); }}
                placeholder="Mínimo 4 caracteres"
                style={{ ...inputStyle, paddingLeft: 34 }}
                onFocus={e => (e.currentTarget.style.borderColor = T.accent)}
                onBlur={e => (e.currentTarget.style.borderColor = T.inputBorder)}
                onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleRegister())} />
            </div>
          </div>

          {/* Confirm password */}
          {mode === 'register' && (
            <div>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: T.textMut, marginBottom: 8 }}>CONFIRMAR SENHA</div>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.textMut }} />
                <input type="password" value={pass2} onChange={e => { setPass2(e.target.value); setError(''); }}
                  placeholder="Repita a senha"
                  style={{ ...inputStyle, paddingLeft: 34 }}
                  onFocus={e => (e.currentTarget.style.borderColor = T.accent)}
                  onBlur={e => (e.currentTarget.style.borderColor = T.inputBorder)}
                  onKeyDown={e => e.key === 'Enter' && handleRegister()} />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#ef444420', border: '2px solid #ef4444' }}>
              <XCircle size={14} color="#ef4444" />
              <span style={{ fontSize: 12, color: '#ef4444' }}>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={mode === 'login' ? handleLogin : handleRegister}
            style={{ padding: '12px 20px', background: T.accent, border: 'none', color: '#fff', fontFamily: "'Press Start 2P', monospace", fontSize: 10, cursor: 'pointer', boxShadow: `4px 4px 0 ${T.accent}60`, transition: 'all .1s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.transform = 'none'}
          >
            {mode === 'login' ? <><LogIn size={14} /> ENTRAR</> : <><UserPlus size={14} /> CRIAR CONTA</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PUZZLE CARD
════════════════════════════════════════════════════════════════════════ */
function PuzzleCard({ puzzle, solved, T, onClick }: { puzzle: Puzzle; solved: boolean; T: ReturnType<typeof getTheme>; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  const cfg = CATEGORY_CONFIG[puzzle.category];
  const catIconName = puzzle.category === 'bug' ? 'Bug' : puzzle.category === 'sequencia' ? 'Hash' : puzzle.category === 'logica' ? 'Brain' : 'Cpu';

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        textAlign: 'left', width: '100%', padding: 0,
        background: T.cardBg,
        border: `2px solid ${hov || solved ? cfg.color : T.cardBorder}`,
        borderTop: `4px solid ${cfg.color}`,
        boxShadow: hov ? `5px 5px 0 ${cfg.color}40` : `3px 3px 0 ${T.cardShadow}`,
        transform: hov ? 'translate(-2px,-2px)' : 'translate(0,0)',
        transition: 'all .15s',
        cursor: 'pointer',
        opacity: solved ? 0.85 : 1,
      }}
    >
      {/* Top */}
      <div style={{ padding: '14px 14px 10px', borderBottom: `1px solid ${T.topBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: cfg.color }}>{puzzle.caseNumber}</span>
          {solved && <CheckCircle2 size={14} color={cfg.color} />}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 8px', background: cfg.bg, width: 'fit-content' }}>
          <LIcon name={catIconName} size={11} color={cfg.color} />
          <span style={{ fontSize: 10, fontWeight: 900, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cfg.label}</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '10px 14px 12px' }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: hov ? cfg.color : T.text, lineHeight: 1.3, marginBottom: 10, transition: 'color .15s' }}>
          {puzzle.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', background: `${DIFF_COLOR[puzzle.difficulty]}20`, color: DIFF_COLOR[puzzle.difficulty], border: `1px solid ${DIFF_COLOR[puzzle.difficulty]}40` }}>
            {puzzle.difficulty.toUpperCase()}
          </span>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: cfg.color }}>+{puzzle.points}</span>
        </div>
      </div>
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PUZZLE MODAL
════════════════════════════════════════════════════════════════════════ */
function PuzzleModal({ puzzle, T, isDark, solved, hintUsed: initHintUsed, onSolve, onUseHint, onClose }: {
  puzzle: Puzzle; T: ReturnType<typeof getTheme>; isDark: boolean;
  solved: boolean; hintUsed: boolean;
  onSolve: (correct: boolean) => void; onUseHint: () => void; onClose: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [hintShown, setHintShown] = useState(initHintUsed);
  const cfg = CATEGORY_CONFIG[puzzle.category];
  const correct = submitted && selected === puzzle.answer;
  const wrong   = submitted && selected !== puzzle.answer;
  const optLabels = ['A', 'B', 'C', 'D'];

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px', overflowY: 'auto', background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(4px)' }}>
      <div style={{ width: '100%', maxWidth: 640, background: T.modalBg, border: `2px solid ${cfg.color}`, borderTop: `4px solid ${cfg.color}`, boxShadow: `6px 6px 0 ${cfg.color}40`, margin: 'auto' }}>
        {/* Header */}
        <div style={{ padding: '14px 18px', borderBottom: `2px solid ${T.topBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: cfg.bg }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: cfg.color }}>{puzzle.caseNumber}</span>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', background: `${DIFF_COLOR[puzzle.difficulty]}20`, color: DIFF_COLOR[puzzle.difficulty] }}>{puzzle.difficulty.toUpperCase()}</span>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: cfg.color, marginLeft: 'auto' }}>+{puzzle.points} PTS</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{puzzle.title}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textMut, marginLeft: 16, flexShrink: 0 }}><X size={18} /></button>
        </div>

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Narrative */}
          <div style={{ display: 'flex', gap: 12, padding: '14px 16px', background: T.accentDim, border: `2px solid ${T.accent}30` }}>
            <Search size={16} color={T.accent} style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.7, fontStyle: 'italic', margin: 0 }}>{puzzle.narrative}</p>
          </div>

          {/* Evidence */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 3, height: 14, background: cfg.color }} />
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: T.textMut }}>EVIDÊNCIA</span>
            </div>
            {puzzle.evidenceType === 'code' ? (
              <div style={{ background: '#0d1117', border: `2px solid ${T.topBorder}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#161b22', borderBottom: `1px solid ${T.topBorder}` }}>
                  {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
                  <span style={{ marginLeft: 8, fontSize: 11, color: '#8b949e', fontFamily: 'monospace' }}>{puzzle.language}</span>
                </div>
                <pre style={{ padding: '16px', margin: 0, fontSize: 13, color: '#7ee787', fontFamily: 'monospace', overflowX: 'auto', lineHeight: 1.6, whiteSpace: 'pre' }}>{puzzle.evidence}</pre>
              </div>
            ) : puzzle.evidenceType === 'sequence' ? (
              <div style={{ padding: '24px', background: T.cardBg, border: `2px dashed ${cfg.color}60`, textAlign: 'center' }}>
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 16, color: cfg.color, letterSpacing: '0.08em' }}>{puzzle.evidence}</span>
              </div>
            ) : (
              <div style={{ padding: 16, background: T.cardBg, border: `2px solid ${T.cardBorder}` }}>
                <pre style={{ margin: 0, fontSize: 13, color: T.textSec, fontFamily: 'inherit', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{puzzle.evidence}</pre>
              </div>
            )}
          </div>

          {/* Hint */}
          {hintShown && (
            <div style={{ display: 'flex', gap: 10, padding: '12px 16px', background: '#fbbf2415', border: '2px solid #fbbf2440' }}>
              <Lightbulb size={16} color="#fbbf24" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: T.textSec, margin: 0, lineHeight: 1.6 }}>{puzzle.hint}</p>
            </div>
          )}

          {/* Question */}
          <div>
            <p style={{ fontSize: 15, fontWeight: 900, color: T.text, marginBottom: 12 }}>{puzzle.question}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {puzzle.options.map((opt, i) => {
                const isSel  = selected === i;
                const isCorr = submitted && i === puzzle.answer;
                const isWrong = submitted && isSel && i !== puzzle.answer;
                let borderColor = T.cardBorder;
                let bg = T.cardBg;
                let textColor = T.textSec;
                if (!submitted && isSel) { borderColor = cfg.color; bg = cfg.bg; textColor = T.text; }
                if (isCorr)  { borderColor = '#22c55e'; bg = '#22c55e15'; textColor = '#22c55e'; }
                if (isWrong) { borderColor = '#ef4444'; bg = '#ef444415'; textColor = '#ef4444'; }

                return (
                  <button key={i} disabled={submitted || solved} onClick={() => setSelected(i)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: bg, border: `2px solid ${borderColor}`, boxShadow: !submitted && isSel ? `3px 3px 0 ${cfg.color}40` : 'none', cursor: submitted || solved ? 'default' : 'pointer', textAlign: 'left', transition: 'all .1s', color: textColor, fontSize: 14 }}>
                    <span style={{ flexShrink: 0, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: !submitted && isSel ? cfg.color : isCorr ? '#22c55e' : isWrong ? '#ef4444' : T.accentDim, fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: (isSel && !submitted) || isCorr || isWrong ? '#fff' : T.textMut }}>
                      {optLabels[i]}
                    </span>
                    <span style={{ flex: 1, lineHeight: 1.5 }}>{opt}</span>
                    {isCorr  && <CheckCircle2 size={16} color="#22c55e" style={{ flexShrink: 0 }} />}
                    {isWrong && <XCircle      size={16} color="#ef4444" style={{ flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Result explanation */}
          {submitted && (
            <div style={{ padding: '14px 16px', background: correct ? '#22c55e15' : '#ef444415', border: `2px solid ${correct ? '#22c55e' : '#ef4444'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                {correct ? <CheckCircle2 size={16} color="#22c55e" /> : <XCircle size={16} color="#ef4444" />}
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: correct ? '#22c55e' : '#ef4444' }}>
                  {correct ? `CASO RESOLVIDO! +${puzzle.points - (initHintUsed ? 5 : 0)} PTS` : 'INVESTIGAÇÃO CONTINUA...'}
                </span>
              </div>
              <p style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7, margin: 0 }}>{puzzle.explanation}</p>
            </div>
          )}

          {solved && !submitted && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: cfg.bg, border: `2px solid ${cfg.color}40` }}>
              <CheckCircle2 size={16} color={cfg.color} />
              <span style={{ fontSize: 13, color: T.textSec }}>Caso já resolvido. Leia a explicação novamente para revisar.</span>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            {!hintShown && !submitted && !solved && (
              <button onClick={() => { onUseHint(); setHintShown(true); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'none', border: '2px solid #fbbf24', color: '#fbbf24', fontFamily: "'Press Start 2P', monospace", fontSize: 8, cursor: 'pointer' }}>
                <Lightbulb size={13} /> DICA <span style={{ opacity: 0.7 }}>(-5 PTS)</span>
              </button>
            )}
            {!submitted && !solved ? (
              <button
                disabled={selected === null}
                onClick={() => { setSubmitted(true); onSolve(selected === puzzle.answer); }}
                style={{ flex: 1, padding: '12px 20px', background: selected !== null ? cfg.color : T.textMut, border: 'none', color: '#fff', fontFamily: "'Press Start 2P', monospace", fontSize: 10, cursor: selected !== null ? 'pointer' : 'not-allowed', boxShadow: selected !== null ? `4px 4px 0 ${cfg.color}60` : 'none', transition: 'all .1s' }}>
                CONFIRMAR RESPOSTA
              </button>
            ) : (
              <button onClick={onClose}
                style={{ flex: 1, padding: '12px 20px', background: cfg.color, border: 'none', color: '#fff', fontFamily: "'Press Start 2P', monospace", fontSize: 10, cursor: 'pointer', boxShadow: `4px 4px 0 ${cfg.color}60` }}>
                FECHAR CASO
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════════════ */
interface DesafiosPageProps { onBackToHub: () => void; }

export default function DesafiosPage({ onBackToHub }: DesafiosPageProps) {
  const { isDark, toggleTheme } = useTheme();
  const T = getTheme(isDark);
  const { currentUser, users, leaderboard, registerUser, login, logout, useHint, recordAnswer } = useGameState();

  const [showTutorial, setShowTutorial] = useState(() => !localStorage.getItem(TUTORIAL_KEY));
  const [showAuth, setShowAuth]         = useState(false);
  const [showBoard, setShowBoard]       = useState(false);
  const [catFilter, setCatFilter]       = useState<CatFilter>('todos');
  const [activePuzzle, setActivePuzzle] = useState<Puzzle | null>(null);
  const [streakMsg, setStreakMsg]       = useState('');
  const [count, setCount]               = useState(0);

  useEffect(() => {
    const target = PUZZLES.length;
    let c = 0;
    const tick = () => { c++; setCount(c); if (c < target) setTimeout(tick, 55); };
    const d = setTimeout(tick, 400);
    return () => clearTimeout(d);
  }, []);

  const closeTutorial = () => {
    localStorage.setItem(TUTORIAL_KEY, '1');
    setShowTutorial(false);
  };

  const handleRegister = (name: string, avatar: string, pass: string) => { registerUser(name, avatar, pass); };
  const handleLogin    = (name: string, pass: string) => login(name, pass);

  const filtered = catFilter === 'todos' ? PUZZLES : PUZZLES.filter(p => p.category === catFilter);
  const isSolved   = (id: string) => currentUser?.solvedPuzzles.includes(id) ?? false;
  const isHintUsed = (id: string) => currentUser?.hintsUsed.includes(id) ?? false;

  const handleSolve = (puzzle: Puzzle, correct: boolean) => {
    const bonus = recordAnswer(puzzle.id, correct, puzzle.points);
    if (bonus > 0) { setStreakMsg(`SEQUÊNCIA! +${bonus} PTS BÔNUS`); setTimeout(() => setStreakMsg(''), 3000); }
  };

  const rank = currentUser ? getRank(currentUser.points) : null;

  const btnBase = {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 16px',
    background: T.cardBg,
    border: `2px solid ${T.cardBorder}`,
    boxShadow: `3px 3px 0 ${T.cardShadow}`,
    cursor: 'pointer',
    color: T.textMut,
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '8px',
    transition: 'all .15s',
  } as React.CSSProperties;

  return (
    <div style={{ background: T.pageBg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Streak toast */}
      {streakMsg && (
        <div style={{ position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 70, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: T.accent, color: '#fff', fontFamily: "'Press Start 2P', monospace", fontSize: 9, boxShadow: `4px 4px 0 ${T.accent}60`, animation: 'fadeUp .3s ease' }}>
          <Zap size={14} /> {streakMsg}
        </div>
      )}

      {/* ── TOP BAR ────────────────────────────────────────────────────── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: T.topBg, borderBottom: `2px solid ${T.topBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <a href="https://ctrlplay.com.br" target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
            <img src="https://ctrlplay.com.br/wp-content/uploads/2024/11/logo-colorido.svg" alt="Ctrl+Play" style={{ height: 36 }} />
          </a>
          <div style={{ width: 1, height: 28, background: T.topBorder }} />
          <div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: T.textMut }}>DETETIVE DE</div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: T.accent }}>CÓDIGO</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Tutorial */}
          <button onClick={() => setShowTutorial(true)}
            style={{ ...btnBase, padding: '8px 12px' }}
            title="Ver tutorial"
            onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = T.accent; el.style.color = T.accent; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = T.cardBorder; el.style.color = T.textMut; }}>
            <Info size={14} />
          </button>

          {/* Theme */}
          <button onClick={toggleTheme}
            style={{ ...btnBase, padding: '8px 12px', color: isDark ? '#fbbf24' : '#475569' }}
            title={isDark ? 'Modo claro' : 'Modo escuro'}
            onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = isDark ? '#fbbf24' : '#06b6d4'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = T.cardBorder; }}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* User info or login */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ padding: '6px 14px', background: T.accentDim, border: `2px solid ${T.accent}40`, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>{currentUser.avatar}</span>
                <div>
                  <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: rank?.color }}>{rank?.title.toUpperCase()}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{currentUser.name} · {currentUser.points} pts</div>
                </div>
              </div>
              <button onClick={logout}
                style={{ ...btnBase, padding: '8px 12px' }}
                title="Sair"
                onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = '#ef4444'; el.style.color = '#ef4444'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = T.cardBorder; el.style.color = T.textMut; }}>
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button onClick={() => setShowAuth(true)}
              style={{ ...btnBase, color: T.accent, borderColor: T.accent }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.transform = 'none'; }}>
              <LogIn size={14} /> <span className="hidden sm:inline">ENTRAR</span>
            </button>
          )}

          {/* Back */}
          <button onClick={onBackToHub}
            style={btnBase}
            onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = '#0054a6'; el.style.color = '#0054a6'; el.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = T.cardBorder; el.style.color = T.textMut; el.style.transform = 'none'; }}>
            <Home size={14} /> <span className="hidden sm:inline">HUB</span>
          </button>
        </div>
      </div>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <div style={{ background: T.heroBg, backgroundImage: `linear-gradient(${T.gridColor} 1px,transparent 1px),linear-gradient(90deg,${T.gridColor} 1px,transparent 1px)`, backgroundSize: '40px 40px', padding: '56px 24px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {isDark && <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 4px)' }} />}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 60% 50% at 50% 50%,${isDark ? 'rgba(167,139,250,0.08)' : 'rgba(167,139,250,0.06)'} 0%,transparent 70%)` }} />

        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 24, padding: '8px 18px', background: T.cardBg, border: `2px solid ${T.cardBorder}`, boxShadow: `3px 3px 0 ${T.cardShadow}` }}>
          <Trophy size={18} color={T.accent} />
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 14, color: T.accent }}>{String(count).padStart(2, '0')}</span>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: T.textMut }}>CASOS DISPONÍVEIS</span>
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 'clamp(16px,3vw,28px)', lineHeight: 1.4, color: T.text, position: 'relative', zIndex: 1, marginBottom: 16 }}>
          <span style={{ color: T.accent, textShadow: isDark ? `0 0 20px ${T.accent}80` : 'none' }}>DETETIVE</span>
          {' '}DE{' '}
          <span style={{ color: '#f37021', textShadow: isDark ? '0 0 20px rgba(243,112,33,0.5)' : 'none' }}>CÓDIGO</span>
        </h1>
        <p style={{ fontSize: 16, color: T.textSec, maxWidth: 520, margin: '0 auto 12px', lineHeight: 1.6, position: 'relative', zIndex: 1 }}>
          Resolva casos de lógica, programação e matemática. Cada caso resolvido te aproxima do título de Mestre Detetive!
        </p>
        <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: T.textMut, position: 'relative', zIndex: 1 }}>▼ SELECIONE UM CASO ▼</p>

        {/* Stats */}
        {currentUser && rank && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 0, marginTop: 24, background: T.cardBg, border: `2px solid ${T.cardBorder}`, boxShadow: `3px 3px 0 ${T.cardShadow}` }}>
            {[
              { label: 'RANK', value: rank.title.toUpperCase(), color: rank.color, icon: <LIcon name={rank.icon} size={14} color={rank.color} /> },
              { label: 'PONTOS', value: `${currentUser.points}`, color: T.accent, icon: <Trophy size={14} color={T.accent} /> },
              { label: 'SEQUÊNCIA', value: `${currentUser.streak}`, color: '#f59e0b', icon: <Zap size={14} color="#f59e0b" /> },
              { label: 'RESOLVIDOS', value: `${currentUser.solvedPuzzles.length}/${PUZZLES.length}`, color: '#22c55e', icon: <CheckCircle2 size={14} color="#22c55e" /> },
            ].map((s, i) => (
              <div key={s.label} style={{ padding: '12px 18px', borderLeft: i > 0 ? `2px solid ${T.topBorder}` : 'none', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: s.color }}>{s.value}</div>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: T.textMut, marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── CATEGORY TABS ──────────────────────────────────────────────── */}
      <div style={{ background: isDark ? '#0a0f1e' : '#f8f6ff', padding: '20px 24px 0', borderBottom: `2px solid ${T.topBorder}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 10, paddingBottom: 20 }}>
          {CAT_TABS.map(tab => {
            const isActive = catFilter === tab.id;
            const color = tab.id === 'todos' ? T.accent : CATEGORY_CONFIG[tab.id as keyof typeof CATEGORY_CONFIG]?.color ?? T.accent;
            return (
              <button key={tab.id} onClick={() => setCatFilter(tab.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: isActive ? color : T.tabInact, color: isActive ? '#fff' : color, border: `2px solid ${color}`, boxShadow: isActive ? `4px 4px 0 ${color}50` : `3px 3px 0 ${T.cardShadow}`, cursor: 'pointer', fontFamily: "'Press Start 2P', monospace", fontSize: 9, transition: 'all .15s' }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'none'; }}>
                <LIcon name={tab.icon} size={14} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MAIN CONTENT ───────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: '36px 24px 64px', background: T.pageBg }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* No user warning */}
          {!currentUser && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 18px', marginBottom: 28, background: T.accentDim, border: `2px solid ${T.accent}40`, boxShadow: `3px 3px 0 ${T.accent}20` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Shield size={16} color={T.accent} />
                <span style={{ fontSize: 14, color: T.textSec }}>Crie um perfil para salvar sua pontuação e aparecer no ranking!</span>
              </div>
              <button onClick={() => setShowAuth(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: T.accent, border: 'none', color: '#fff', fontFamily: "'Press Start 2P', monospace", fontSize: 8, cursor: 'pointer', boxShadow: `3px 3px 0 ${T.accent}60`, flexShrink: 0 }}>
                <UserPlus size={13} /> CRIAR CONTA
              </button>
            </div>
          )}

          {/* Leaderboard */}
          {users.length > 0 && (
            <div style={{ marginBottom: 32, background: T.cardBg, border: `2px solid ${T.cardBorder}`, boxShadow: `4px 4px 0 ${T.cardShadow}` }}>
              <button onClick={() => setShowBoard(v => !v)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', borderBottom: showBoard ? `2px solid ${T.topBorder}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Trophy size={16} color={T.accent} />
                  <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: T.text }}>PLACAR GERAL — {users.length} {users.length === 1 ? 'DETETIVE' : 'DETETIVES'}</span>
                </div>
                {showBoard ? <ChevronUp size={16} color={T.textMut} /> : <ChevronDown size={16} color={T.textMut} />}
              </button>
              {showBoard && leaderboard.slice(0, 10).map((u, idx) => {
                const r = getRank(u.points);
                const isMe = u.id === currentUser?.id;
                const posColor = idx === 0 ? '#fbbf24' : idx === 1 ? '#94a3b8' : idx === 2 ? '#d97706' : T.textMut;
                return (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px', background: isMe ? T.accentDim : 'transparent', borderBottom: `1px solid ${T.divider}` }}>
                    <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: posColor, width: 24, textAlign: 'center' }}>#{idx + 1}</span>
                    <span style={{ fontSize: 20 }}>{u.avatar}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: T.text }}>{u.name}{isMe && <span style={{ fontSize: 11, fontWeight: 400, color: T.accent, marginLeft: 8 }}>(você)</span>}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}><LIcon name={r.icon} size={12} color={r.color} /><span style={{ fontSize: 11, color: r.color }}>{r.title}</span></div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: r.color }}>{u.points}</div>
                      <div style={{ fontSize: 11, color: T.textMut, marginTop: 2 }}>{u.solvedPuzzles.length} casos</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Section divider */}
          {catFilter !== 'todos' && (() => {
            const cfg = CATEGORY_CONFIG[catFilter as keyof typeof CATEGORY_CONFIG];
            const iconName = catFilter === 'bug' ? 'Bug' : catFilter === 'sequencia' ? 'Hash' : catFilter === 'logica' ? 'Brain' : 'Cpu';
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                <div style={{ flex: 1, height: 1, background: `${cfg.color}40` }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: cfg.color }}>
                  <LIcon name={iconName} size={16} color={cfg.color} />
                  <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10 }}>{cfg.label.toUpperCase()}</span>
                </div>
                <div style={{ flex: 1, height: 1, background: `${cfg.color}40` }} />
              </div>
            );
          })()}

          {/* Puzzle grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
            {filtered.map(puzzle => (
              <PuzzleCard key={puzzle.id} puzzle={puzzle} solved={isSolved(puzzle.id)} T={T} onClick={() => setActivePuzzle(puzzle)} />
            ))}
          </div>

          {/* Rank legend */}
          <div style={{ marginTop: 56, background: T.cardBg, border: `2px solid ${T.cardBorder}`, boxShadow: `4px 4px 0 ${T.cardShadow}` }}>
            <div style={{ padding: '14px 18px', borderBottom: `2px solid ${T.topBorder}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Medal size={16} color={T.accent} />
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: T.text }}>TÍTULOS DE DETETIVE</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 0 }}>
              {RANKS_IN_ORDER.map((pts, i) => {
                const r = getRank(pts);
                const isCurrentRank = currentUser ? getRank(currentUser.points).title === r.title : false;
                return (
                  <div key={r.title} style={{ padding: '18px', borderLeft: i > 0 ? `2px solid ${T.topBorder}` : 'none', background: isCurrentRank ? T.accentDim : 'transparent', borderBottom: isCurrentRank ? `2px solid ${T.accent}` : 'none' }}>
                    <LIcon name={r.icon} size={22} color={r.color} />
                    <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: r.color, marginTop: 10, marginBottom: 4 }}>{r.title.toUpperCase()}</div>
                    <div style={{ fontSize: 12, color: T.textMut }}>{pts === 0 ? 'Início' : `${pts}+ pts`}</div>
                    {isCurrentRank && <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: T.accent, marginTop: 6 }}>← VOCÊ</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <div style={{ padding: 24, textAlign: 'center', background: T.topBg, borderTop: `2px solid ${T.topBorder}` }}>
        <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: T.textMut }}>
          © 2026 DOUGLAS ·{' '}
          <a href="https://doneres.dev" target="_blank" rel="noopener noreferrer" style={{ color: T.accent, textDecoration: 'none' }}>DONERES.DEV</a>
        </p>
      </div>

      {/* Modals */}
      {showTutorial && <TutorialModal T={T} isDark={isDark} onClose={closeTutorial} />}
      {showAuth     && <AuthModal T={T} isDark={isDark} users={users} onLogin={handleLogin} onRegister={handleRegister} onClose={() => setShowAuth(false)} />}
      {activePuzzle && (
        <PuzzleModal
          puzzle={activePuzzle} T={T} isDark={isDark}
          solved={isSolved(activePuzzle.id)} hintUsed={isHintUsed(activePuzzle.id)}
          onSolve={correct => handleSolve(activePuzzle, correct)}
          onUseHint={() => useHint(activePuzzle.id)}
          onClose={() => setActivePuzzle(null)}
        />
      )}
    </div>
  );
}
