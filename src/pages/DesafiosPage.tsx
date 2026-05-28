import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Search, Trophy, Star, Zap, ChevronDown, ChevronUp,
  X, Lightbulb, CheckCircle2, XCircle, AlertCircle, Medal,
  Bug, Hash, Brain, Cpu, User, Plus, RefreshCw,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useGameState, GameUser } from '../hooks/useGameState';
import { PUZZLES, CATEGORY_CONFIG, getRank, Puzzle } from '../data/puzzles';

/* ── Types ─────────────────────────────────────────────────────────────── */

type CategoryFilter = 'todos' | 'bug' | 'sequencia' | 'logica' | 'algoritmo';

const AVATARS = ['🕵️','🔍','🧠','🤖','💻','🎯','⚡','🦊','🐉','🚀','🎲','🦁'];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  bug:       <Bug  className="w-3.5 h-3.5" />,
  sequencia: <Hash className="w-3.5 h-3.5" />,
  logica:    <Brain className="w-3.5 h-3.5" />,
  algoritmo: <Cpu  className="w-3.5 h-3.5" />,
};

const DIFF_COLORS: Record<string, string> = {
  Iniciante:     'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Intermediário: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Avançado:      'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

/* ── Sub-components ─────────────────────────────────────────────────────── */

/* Registration modal */
function RegisterModal({ onRegister, existingUsers, onSwitch, onClose }: {
  onRegister: (name: string, avatar: string) => void;
  existingUsers: GameUser[];
  onSwitch: (id: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [tab, setTab] = useState<'new' | 'switch'>(existingUsers.length > 0 ? 'switch' : 'new');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onRegister(name.trim().slice(0, 20), avatar);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <X className="w-4 h-4 text-slate-400" />
        </button>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 px-6 py-5">
          <div className="text-3xl mb-1">🔍</div>
          <h2 className="text-lg font-black text-white">Detetive de Código</h2>
          <p className="text-amber-100 text-xs mt-0.5">Identifique-se para começar a investigação</p>
        </div>

        {/* Tab switcher */}
        {existingUsers.length > 0 && (
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            {(['switch', 'new'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-xs font-bold transition-colors ${
                  tab === t
                    ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {t === 'switch' ? 'Trocar Detetive' : 'Novo Detetive'}
              </button>
            ))}
          </div>
        )}

        <div className="p-6">
          {tab === 'switch' && existingUsers.length > 0 ? (
            <div className="space-y-2">
              {existingUsers.map(u => {
                const rank = getRank(u.points);
                return (
                  <button
                    key={u.id}
                    onClick={() => { onSwitch(u.id); onClose(); }}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-700 transition-all"
                  >
                    <span className="text-2xl">{u.avatar}</span>
                    <div className="flex-1 text-left">
                      <div className="font-black text-sm text-slate-700 dark:text-slate-100">{u.name}</div>
                      <div className="text-xs" style={{ color: rank.color }}>{rank.emoji} {rank.title} · {u.points} pts</div>
                    </div>
                  </button>
                );
              })}
              <button
                onClick={() => setTab('new')}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Criar novo detetive
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Escolha seu avatar
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map(a => (
                    <button
                      type="button"
                      key={a}
                      onClick={() => setAvatar(a)}
                      className={`text-xl h-10 rounded-xl transition-all ${
                        avatar === a
                          ? 'bg-amber-100 dark:bg-amber-900/40 ring-2 ring-amber-500 scale-110'
                          : 'bg-slate-100 dark:bg-slate-700 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Nome do Detetive
                </label>
                <input
                  autoFocus
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Detetive Silva"
                  maxLength={20}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm font-bold placeholder:font-normal placeholder:text-slate-300 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={!name.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-sm hover:from-amber-400 hover:to-orange-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                Iniciar Investigação →
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* Puzzle card */
function PuzzleCard({ puzzle, solved, onClick }: {
  puzzle: Puzzle;
  solved: boolean;
  onClick: () => void;
}) {
  const cfg = CATEGORY_CONFIG[puzzle.category];
  return (
    <button
      onClick={onClick}
      className="relative group w-full text-left rounded-2xl overflow-hidden border-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
      style={{
        borderColor: solved ? cfg.color + '88' : 'transparent',
        borderTopColor: cfg.color,
        borderTopWidth: 4,
        background: undefined,
      }}
    >
      <div className="absolute inset-0 bg-white dark:bg-slate-800 group-hover:bg-slate-50 dark:group-hover:bg-slate-750 transition-colors" />

      <div className="relative p-4">
        {/* Case number + status */}
        <div className="flex items-start justify-between mb-2">
          <span className="text-[10px] font-black tracking-widest" style={{ color: cfg.color }}>
            {puzzle.caseNumber}
          </span>
          {solved && (
            <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: cfg.color }} />
          )}
        </div>

        {/* Category badge */}
        <div className="flex items-center gap-1 mb-2">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
            style={{ background: cfg.bg, color: cfg.color }}>
            {CATEGORY_ICONS[puzzle.category]}
            {cfg.label}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-black text-sm text-slate-700 dark:text-slate-100 leading-snug mb-3">
          {puzzle.title}
        </h3>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${DIFF_COLORS[puzzle.difficulty]}`}>
            {puzzle.difficulty}
          </span>
          <span className="text-xs font-black" style={{ color: cfg.color }}>
            {puzzle.points} pts
          </span>
        </div>
      </div>
    </button>
  );
}

/* Puzzle modal */
function PuzzleModal({ puzzle, onClose, onSolve, solved, hintUsed: initHintUsed, onUseHint }: {
  puzzle: Puzzle;
  onClose: () => void;
  onSolve: (correct: boolean) => void;
  solved: boolean;
  hintUsed: boolean;
  onUseHint: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [hintShown, setHintShown] = useState(initHintUsed);
  const cfg = CATEGORY_CONFIG[puzzle.category];

  const correct = submitted && selected === puzzle.answer;
  const wrong   = submitted && selected !== puzzle.answer;

  const handleHint = () => {
    onUseHint();
    setHintShown(true);
  };

  const handleSubmit = () => {
    if (selected === null || submitted) return;
    setSubmitted(true);
    onSolve(selected === puzzle.answer);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 py-8 overflow-y-auto bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-auto">

        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
          <X className="w-4 h-4 text-slate-500" />
        </button>

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800"
          style={{ borderTopColor: cfg.color, borderTopWidth: 4 }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black tracking-widest" style={{ color: cfg.color }}>
              {puzzle.caseNumber}
            </span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${DIFF_COLORS[puzzle.difficulty]}`}>
              {puzzle.difficulty}
            </span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="flex items-center gap-1 text-[9px] font-black uppercase"
              style={{ color: cfg.color, background: cfg.bg, padding: '2px 8px', borderRadius: 999 }}>
              {CATEGORY_ICONS[puzzle.category]}{cfg.label}
            </span>
            <span className="ml-auto text-sm font-black" style={{ color: cfg.color }}>
              {puzzle.points} pts
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">{puzzle.title}</h2>
        </div>

        <div className="p-6 space-y-5">
          {/* Narrative */}
          <div className="flex gap-3">
            <div className="text-2xl shrink-0 mt-0.5">🔍</div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
              {puzzle.narrative}
            </p>
          </div>

          {/* Evidence */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Evidência
              </span>
            </div>

            {puzzle.evidenceType === 'code' ? (
              <div className="rounded-2xl bg-[#0d1117] border border-slate-700 overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 border-b border-slate-700">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="ml-2 text-[10px] text-slate-400 font-mono">{puzzle.language}</span>
                </div>
                <pre className="p-4 text-sm font-mono text-emerald-300 overflow-x-auto leading-relaxed whitespace-pre">
                  {puzzle.evidence}
                </pre>
              </div>
            ) : puzzle.evidenceType === 'sequence' ? (
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-dashed p-6 text-center"
                style={{ borderColor: cfg.color + '66' }}>
                <span className="text-2xl font-black tracking-wider" style={{ color: cfg.color }}>
                  {puzzle.evidence}
                </span>
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
                <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
                  {puzzle.evidence}
                </pre>
              </div>
            )}
          </div>

          {/* Hint */}
          {hintShown && (
            <div className="flex gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">{puzzle.hint}</p>
            </div>
          )}

          {/* Question */}
          <div>
            <p className="text-sm font-black text-slate-700 dark:text-slate-100 mb-3">
              {puzzle.question}
            </p>

            <div className="space-y-2">
              {puzzle.options.map((opt, i) => {
                const isSelected = selected === i;
                const isCorrect  = submitted && i === puzzle.answer;
                const isWrong    = submitted && isSelected && i !== puzzle.answer;

                let cls = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300';
                if (!submitted && isSelected) cls = 'border-2 text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-750';
                if (isCorrect)  cls = 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200';
                if (isWrong)    cls = 'border-rose-400 bg-rose-50 dark:bg-rose-900/30 text-rose-800 dark:text-rose-200';

                return (
                  <button
                    key={i}
                    disabled={submitted || solved}
                    onClick={() => setSelected(i)}
                    className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border-2 text-left text-sm font-medium transition-all duration-150 ${cls}
                      ${!submitted && !solved ? 'hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer' : 'cursor-default'}
                      ${!submitted && isSelected ? '' : ''}
                    `}
                    style={!submitted && isSelected ? { borderColor: cfg.color } : {}}
                  >
                    <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                      style={!submitted && isSelected
                        ? { background: cfg.color, color: '#fff' }
                        : { background: '#e2e8f0', color: '#64748b' }
                      }>
                      {optionLabels[i]}
                    </span>
                    <span className="flex-1 leading-snug">{opt}</span>
                    {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                    {isWrong   && <XCircle      className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explanation after submit */}
          {submitted && (
            <div className={`flex gap-3 p-4 rounded-xl border ${
              correct
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'
            }`}>
              {correct
                ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                : <XCircle      className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              }
              <div>
                <div className={`text-xs font-black mb-1 ${correct ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                  {correct ? 'Caso resolvido! +' + (puzzle.points - (initHintUsed ? 5 : 0)) + ' pts' : 'Investigação continua...'}
                </div>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {puzzle.explanation}
                </p>
              </div>
            </div>
          )}

          {/* Already solved message */}
          {solved && !submitted && (
            <div className="flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: cfg.color }} />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Você já resolveu este caso! Leia a explicação acima para revisar.
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-1">
            {!hintShown && !submitted && !solved && (
              <button
                onClick={handleHint}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black border-2 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                Pedir Dica <span className="opacity-60">(-5 pts)</span>
              </button>
            )}
            {!submitted && !solved && (
              <button
                onClick={handleSubmit}
                disabled={selected === null}
                className="flex-1 py-2.5 rounded-full text-sm font-black text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ background: selected !== null ? `linear-gradient(135deg, ${cfg.color}, ${cfg.color}cc)` : '#94a3b8' }}
              >
                Confirmar Resposta
              </button>
            )}
            {(submitted || solved) && (
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-full text-sm font-black text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}cc)` }}
              >
                Fechar Caso
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────────────────── */

interface DesafiosPageProps {
  onBackToHub: () => void;
}

export default function DesafiosPage({ onBackToHub }: DesafiosPageProps) {
  const { isDark } = useTheme();
  const { currentUser, users, leaderboard, registerUser, switchUser, useHint, recordAnswer } = useGameState();

  const [showRegister, setShowRegister]     = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [catFilter, setCatFilter]           = useState<CategoryFilter>('todos');
  const [activePuzzle, setActivePuzzle]     = useState<Puzzle | null>(null);
  const [streakMsg, setStreakMsg]           = useState('');

  const filtered = catFilter === 'todos'
    ? PUZZLES
    : PUZZLES.filter(p => p.category === catFilter);

  const isSolved = (puzzleId: string) =>
    currentUser?.solvedPuzzles.includes(puzzleId) ?? false;

  const isHintUsed = (puzzleId: string) =>
    currentUser?.hintsUsed.includes(puzzleId) ?? false;

  const handleRegister = (name: string, avatar: string) => {
    registerUser(name, avatar);
    setShowRegister(false);
  };

  const handleSolve = (puzzle: Puzzle, correct: boolean) => {
    const bonus = recordAnswer(puzzle.id, correct, puzzle.points);
    if (bonus > 0) {
      setStreakMsg(`Sequência! +${bonus} pts bônus!`);
      setTimeout(() => setStreakMsg(''), 3000);
    }
  };

  const handleUseHint = (puzzleId: string) => { useHint(puzzleId); };

  const rank = currentUser ? getRank(currentUser.points) : null;

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-[#070d1a]' : 'bg-[#f0ece3]'} transition-colors duration-300`}>
      <style>{`
        @keyframes float-search {
          0%, 100% { transform: translateY(0) rotate(-8deg); }
          50% { transform: translateY(-10px) rotate(-8deg); }
        }
        .search-float { animation: float-search 3s ease-in-out infinite; }

        @keyframes streak-in {
          0%   { opacity: 0; transform: translateY(20px) scale(0.8); }
          20%  { opacity: 1; transform: translateY(0) scale(1.05); }
          80%  { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-20px) scale(0.8); }
        }
        .streak-toast { animation: streak-in 3s ease forwards; }
      `}</style>

      {/* Streak toast */}
      {streakMsg && (
        <div className="streak-toast fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-amber-500 text-white font-black text-sm shadow-xl">
          <Zap className="w-4 h-4" /> {streakMsg}
        </div>
      )}

      {/* Back button */}
      <div className={`sticky top-0 z-40 ${isDark ? 'bg-[#070d1a]/90' : 'bg-[#f0ece3]/90'} backdrop-blur-md border-b ${isDark ? 'border-slate-800' : 'border-amber-200/60'}`}>
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <button
            onClick={onBackToHub}
            className={`flex items-center gap-2 text-sm font-bold transition-colors ${isDark ? 'text-slate-400 hover:text-amber-400' : 'text-slate-500 hover:text-amber-600'}`}
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Hub
          </button>

          {currentUser && (
            <button
              onClick={() => setShowRegister(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black border-2 border-amber-400/40 hover:border-amber-400 transition-colors"
              style={{ color: rank?.color }}
            >
              <span>{currentUser.avatar}</span>
              <span>{currentUser.name}</span>
              <span className="text-slate-400">·</span>
              <span>{currentUser.points} pts</span>
              <RefreshCw className="w-3 h-3 opacity-60" />
            </button>
          )}
        </div>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className={`relative overflow-hidden py-12 px-4 ${isDark ? 'bg-gradient-to-br from-[#0a0f1e] via-[#0f172a] to-[#1a1a2e]' : 'bg-gradient-to-br from-amber-900 via-amber-800 to-orange-900'}`}>
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #fbbf24, transparent)' }} />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="search-float inline-block text-6xl mb-4">🔍</div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            Detetive de Código
          </h1>
          <p className="text-amber-200 text-sm max-w-md mx-auto mb-6">
            Resolva casos de lógica, programação e matemática. Cada caso resolvido te aproxima do título de Mestre Detetive!
          </p>

          {/* User / CTA */}
          {currentUser ? (
            <div className="inline-flex flex-col items-center gap-3">
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/10 backdrop-blur border border-white/20">
                <span className="text-3xl">{currentUser.avatar}</span>
                <div className="text-left">
                  <div className="text-white font-black">{currentUser.name}</div>
                  <div className="text-xs" style={{ color: rank?.color }}>{rank?.emoji} {rank?.title}</div>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div className="text-left">
                  <div className="text-white font-black text-lg">{currentUser.points}</div>
                  <div className="text-amber-200 text-xs">pontos</div>
                </div>
                {currentUser.streak > 0 && (
                  <>
                    <div className="h-8 w-px bg-white/20" />
                    <div className="text-left">
                      <div className="flex items-center gap-1 text-orange-300 font-black">
                        <Zap className="w-3.5 h-3.5" />
                        {currentUser.streak}
                      </div>
                      <div className="text-amber-200 text-xs">sequência</div>
                    </div>
                  </>
                )}
              </div>
              {rank?.next && (
                <div className="text-xs text-amber-300">
                  {rank.next - currentUser.points} pts para {
                    getRank(rank.next).title
                  }
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowRegister(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-amber-900 font-black text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-500/30"
            >
              <User className="w-4 h-4" />
              Criar Perfil de Detetive
            </button>
          )}

          {/* Stats row */}
          <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
            {[
              { label: 'Casos', value: PUZZLES.length },
              { label: 'Resolvidos', value: currentUser?.solvedPuzzles.length ?? 0 },
              { label: 'Detetives', value: users.length },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-xl font-black text-white">{s.value}</div>
                <div className="text-xs text-amber-300">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto w-full px-4 md:px-8 py-8 flex-1">

        {/* Leaderboard toggle */}
        {users.length > 0 && (
          <div className={`mb-6 rounded-2xl overflow-hidden border ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-amber-200 bg-white'}`}>
            <button
              onClick={() => setShowLeaderboard(v => !v)}
              className="w-full flex items-center justify-between px-5 py-4"
            >
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className={`font-black text-sm ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>
                  Placar Geral — {users.length} {users.length === 1 ? 'detetive' : 'detetives'}
                </span>
              </div>
              {showLeaderboard
                ? <ChevronUp className="w-4 h-4 text-slate-400" />
                : <ChevronDown className="w-4 h-4 text-slate-400" />
              }
            </button>

            {showLeaderboard && (
              <div className={`border-t ${isDark ? 'border-slate-700' : 'border-amber-100'} divide-y ${isDark ? 'divide-slate-700' : 'divide-amber-50'}`}>
                {leaderboard.slice(0, 10).map((u, idx) => {
                  const r = getRank(u.points);
                  const isMe = u.id === currentUser?.id;
                  return (
                    <div key={u.id} className={`flex items-center gap-3 px-5 py-3 ${isMe ? isDark ? 'bg-amber-900/20' : 'bg-amber-50' : ''}`}>
                      <span className={`w-6 text-xs font-black text-center ${idx < 3 ? 'text-amber-500' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </span>
                      <span className="text-xl">{u.avatar}</span>
                      <div className="flex-1">
                        <div className={`text-sm font-black ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>
                          {u.name} {isMe && <span className="text-xs font-normal text-amber-500">(você)</span>}
                        </div>
                        <div className="text-xs" style={{ color: r.color }}>{r.emoji} {r.title}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-sm" style={{ color: r.color }}>{u.points} pts</div>
                        <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {u.solvedPuzzles.length} casos
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {([
            { id: 'todos', label: 'Todos', icon: <Search className="w-3.5 h-3.5" /> },
            { id: 'bug',       label: CATEGORY_CONFIG.bug.label,       icon: CATEGORY_ICONS.bug       },
            { id: 'sequencia', label: CATEGORY_CONFIG.sequencia.label, icon: CATEGORY_ICONS.sequencia },
            { id: 'logica',    label: CATEGORY_CONFIG.logica.label,    icon: CATEGORY_ICONS.logica    },
            { id: 'algoritmo', label: CATEGORY_CONFIG.algoritmo.label, icon: CATEGORY_ICONS.algoritmo },
          ] as { id: CategoryFilter; label: string; icon: React.ReactNode }[]).map(cat => {
            const isActive = catFilter === cat.id;
            const color = cat.id === 'todos' ? '#f59e0b' : CATEGORY_CONFIG[cat.id as keyof typeof CATEGORY_CONFIG].color;
            return (
              <button
                key={cat.id}
                onClick={() => setCatFilter(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'text-white shadow-md -translate-y-0.5'
                    : isDark
                      ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-500'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-amber-300'
                }`}
                style={isActive ? { background: `linear-gradient(135deg, ${color}, ${color}cc)` } : {}}
              >
                {cat.icon}
                {cat.label}
                <span className={`text-xs ${isActive ? 'opacity-70' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {cat.id === 'todos' ? PUZZLES.length : PUZZLES.filter(p => p.category === cat.id).length}
                </span>
              </button>
            );
          })}
        </div>

        {/* No user warning */}
        {!currentUser && (
          <div className={`flex items-center gap-3 mb-6 p-4 rounded-2xl border ${isDark ? 'bg-amber-900/20 border-amber-800 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="text-sm">
              Crie um perfil para salvar sua pontuação e aparecer no placar!{' '}
              <button onClick={() => setShowRegister(true)} className="underline font-bold">
                Criar agora
              </button>
            </p>
          </div>
        )}

        {/* Puzzle grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map(puzzle => (
            <PuzzleCard
              key={puzzle.id}
              puzzle={puzzle}
              solved={isSolved(puzzle.id)}
              onClick={() => setActivePuzzle(puzzle)}
            />
          ))}
        </div>

        {/* Rank legend */}
        <div className={`mt-10 p-5 rounded-2xl border ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Medal className="w-4 h-4 text-amber-500" />
            <span className={`font-black text-sm ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>Títulos de Detetive</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { pts: 0,    ...getRank(0)    },
              { pts: 75,   ...getRank(75)   },
              { pts: 200,  ...getRank(200)  },
              { pts: 500,  ...getRank(500)  },
              { pts: 1000, ...getRank(1000) },
            ].map(r => (
              <div key={r.title} className="text-center">
                <div className="text-2xl mb-1">{r.emoji}</div>
                <div className="text-xs font-black" style={{ color: r.color }}>{r.title}</div>
                <div className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {r.pts === 0 ? '0 pts' : `${r.pts}+ pts`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={`py-6 text-center text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
        Desenvolvido por{' '}
        <a href="https://doneres.dev" target="_blank" rel="noopener noreferrer"
          className="font-bold hover:underline text-amber-500">
          doneres.dev
        </a>{' '}
        para Ctrl+Play
      </footer>

      {/* Modals */}
      {showRegister && (
        <RegisterModal
          onRegister={handleRegister}
          existingUsers={users}
          onSwitch={id => { switchUser(id); setShowRegister(false); }}
          onClose={() => setShowRegister(false)}
        />
      )}

      {activePuzzle && (
        <PuzzleModal
          puzzle={activePuzzle}
          onClose={() => setActivePuzzle(null)}
          onSolve={correct => handleSolve(activePuzzle, correct)}
          solved={isSolved(activePuzzle.id)}
          hintUsed={isHintUsed(activePuzzle.id)}
          onUseHint={() => handleUseHint(activePuzzle.id)}
        />
      )}
    </div>
  );
}
