import { useState, useCallback } from 'react';

export interface Powerups {
  shield: number;    // "Escudo de Streak" — próximo erro não zera streak
  eliminate: number; // "Eliminar Errada" — risca 1 opção incorreta na questão
}

export interface GameUser {
  id: string;
  name: string;
  avatar: string;
  passwordHash: string;
  points: number;
  solvedPuzzles: string[];
  hintsUsed: string[];
  streak: number;
  wrongAttempts: Record<string, number>; // puzzleId → nº de erros
  powerups: Powerups;
  purchasedCosmetics: string[];
}

interface GameState {
  users: GameUser[];
  currentUserId: string | null;
}

const STORAGE_KEY = 'ctrlplay_desafios_v2';

/** FNV-1a 32-bit hash */
function hashPassword(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

/** Garante que usuários antigos (sem os novos campos) tenham defaults */
function migrateUser(u: Partial<GameUser> & Pick<GameUser, 'id' | 'name'>): GameUser {
  return {
    id: u.id,
    name: u.name,
    avatar: u.avatar ?? '🕵',
    passwordHash: u.passwordHash ?? '',
    points: u.points ?? 0,
    solvedPuzzles: u.solvedPuzzles ?? [],
    hintsUsed: u.hintsUsed ?? [],
    streak: u.streak ?? 0,
    wrongAttempts: (u as any).wrongAttempts ?? {},
    powerups: (u as any).powerups ?? { shield: 0, eliminate: 0 },
    purchasedCosmetics: (u as any).purchasedCosmetics ?? [],
  };
}

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as GameState;
      return { ...parsed, users: parsed.users.map(migrateUser) };
    }
    const v1 = localStorage.getItem('ctrlplay_desafios_v1');
    if (v1) {
      const old = JSON.parse(v1) as { users: any[]; currentUserId: string | null };
      return {
        users: old.users.map(u => migrateUser({ ...u, passwordHash: '' })),
        currentUserId: old.currentUserId,
      };
    }
  } catch { /* ignore */ }
  return { users: [], currentUserId: null };
}

function saveState(state: GameState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

export type LoginResult = 'ok' | 'wrong-password' | 'not-found';

/**
 * Calcula os pontos que serão ganhos ao acertar agora.
 * Exportado para que o PuzzleModal possa exibir o preview.
 */
export function computeEarned(
  basePoints: number,
  hintUsed: boolean,
  wrongCount: number,
): number {
  const hintPenalty = hintUsed ? 5 : 0;
  const base = Math.max(0, basePoints - hintPenalty);
  if (wrongCount === 0) return Math.max(1, base);
  if (wrongCount === 1) return Math.max(1, Math.floor(base * 0.5));
  return 1; // 3ª+ tentativa: mínimo simbólico
}

export function useGameState() {
  const [state, setState] = useState<GameState>(loadState);

  const currentUser = state.users.find(u => u.id === state.currentUserId) ?? null;

  const persist = useCallback((next: GameState) => {
    setState(next);
    saveState(next);
  }, []);

  const update = useCallback((updated: GameUser) => {
    persist({ ...state, users: state.users.map(u => u.id === updated.id ? updated : u) });
  }, [state, persist]);

  /* ── Auth ──────────────────────────────────────────────────────── */

  const registerUser = useCallback((name: string, avatar: string, password: string): string => {
    const id = `u_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const newUser: GameUser = {
      id, name, avatar, passwordHash: hashPassword(password),
      points: 0, solvedPuzzles: [], hintsUsed: [],
      streak: 0, wrongAttempts: {}, powerups: { shield: 0, eliminate: 0 },
    };
    persist({ users: [...state.users, newUser], currentUserId: id });
    return id;
  }, [state, persist]);

  const login = useCallback((name: string, password: string): LoginResult => {
    const user = state.users.find(u => u.name.toLowerCase() === name.toLowerCase());
    if (!user) return 'not-found';
    if (user.passwordHash && user.passwordHash !== hashPassword(password)) return 'wrong-password';
    if (!user.passwordHash) {
      update(migrateUser({ ...user, passwordHash: hashPassword(password) }));
      persist({ users: state.users.map(u => u.id === user.id ? migrateUser({ ...u, passwordHash: hashPassword(password) }) : u), currentUserId: user.id });
    } else {
      persist({ ...state, currentUserId: user.id });
    }
    return 'ok';
  }, [state, persist, update]);

  const logout = useCallback(() => {
    persist({ ...state, currentUserId: null });
  }, [state, persist]);

  /* ── Dica ───────────────────────────────────────────────────────── */

  /**
   * FIX Bug 1: useHint apenas REGISTRA o uso da dica.
   * O desconto de -5 pts acontece UMA ÚNICA vez em recordAnswer.
   * Antes estava descontando em ambos (dupla penalidade).
   */
  const useHint = useCallback((puzzleId: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.hintsUsed.includes(puzzleId)) return true;
    update({ ...currentUser, hintsUsed: [...currentUser.hintsUsed, puzzleId] });
    return true;
  }, [currentUser, update]);

  /* ── Resposta ───────────────────────────────────────────────────── */

  /**
   * FIX Bug 2: penalidade progressiva por tentativas + integração com Escudo.
   * Retorna { bonus, shieldUsed } para o caller poder mostrar feedback.
   *
   * Pontuação:
   *   1ª tentativa certa:  base completo  (- 5 se usou dica)
   *   2ª tentativa certa:  50% do base
   *   3ª+ tentativa certa: 1 pt mínimo
   */
  const recordAnswer = useCallback((
    puzzleId: string,
    correct: boolean,
    puzzlePoints: number,
  ): { bonus: number; shieldUsed: boolean } => {
    if (!currentUser) return { bonus: 0, shieldUsed: false };

    const wrongCount = currentUser.wrongAttempts[puzzleId] ?? 0;

    if (!correct) {
      const hasShield = currentUser.powerups.shield > 0;
      update({
        ...currentUser,
        streak: hasShield ? currentUser.streak : 0,
        wrongAttempts: { ...currentUser.wrongAttempts, [puzzleId]: wrongCount + 1 },
        powerups: hasShield
          ? { ...currentUser.powerups, shield: currentUser.powerups.shield - 1 }
          : currentUser.powerups,
      });
      return { bonus: 0, shieldUsed: hasShield };
    }

    if (currentUser.solvedPuzzles.includes(puzzleId)) return { bonus: 0, shieldUsed: false };

    const hintUsed = currentUser.hintsUsed.includes(puzzleId);
    const earned = computeEarned(puzzlePoints, hintUsed, wrongCount);
    const newStreak = currentUser.streak + 1;
    const bonus = newStreak % 5 === 0 ? 10 : 0;

    update({
      ...currentUser,
      points: currentUser.points + earned + bonus,
      solvedPuzzles: [...currentUser.solvedPuzzles, puzzleId],
      streak: newStreak,
    });
    return { bonus, shieldUsed: false };
  }, [currentUser, update]);

  /* ── Power-up: Loja ────────────────────────────────────────────── */

  const buyPowerup = useCallback((key: keyof Powerups, cost: number): boolean => {
    if (!currentUser || currentUser.points < cost) return false;
    update({
      ...currentUser,
      points: currentUser.points - cost,
      powerups: { ...currentUser.powerups, [key]: currentUser.powerups[key] + 1 },
    });
    return true;
  }, [currentUser, update]);

  /* ── Cosméticos ────────────────────────────────────────────────── */

  const buyCosmetic = useCallback((cosmeticId: string, cost: number): boolean => {
    if (!currentUser || currentUser.points < cost) return false;
    if (currentUser.purchasedCosmetics.includes(cosmeticId)) return false;
    update({
      ...currentUser,
      points: currentUser.points - cost,
      purchasedCosmetics: [...currentUser.purchasedCosmetics, cosmeticId],
    });
    return true;
  }, [currentUser, update]);

  /* ── Power-up: Usar Eliminar Errada (consome 1 unidade) ─────────── */

  const useEliminate = useCallback((): boolean => {
    if (!currentUser || currentUser.powerups.eliminate <= 0) return false;
    update({
      ...currentUser,
      powerups: { ...currentUser.powerups, eliminate: currentUser.powerups.eliminate - 1 },
    });
    return true;
  }, [currentUser, update]);

  const leaderboard = [...state.users].sort((a, b) => b.points - a.points);

  return {
    currentUser, users: state.users, leaderboard,
    registerUser, login, logout,
    useHint, recordAnswer, buyPowerup, useEliminate, buyCosmetic,
  };
}
