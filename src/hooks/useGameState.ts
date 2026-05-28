import { useState, useCallback } from 'react';

export interface GameUser {
  id: string;
  name: string;
  avatar: string;
  passwordHash: string;
  points: number;
  solvedPuzzles: string[];
  hintsUsed: string[];
  streak: number;
}

interface GameState {
  users: GameUser[];
  currentUserId: string | null;
}

const STORAGE_KEY = 'ctrlplay_desafios_v2';

/** FNV-1a 32-bit hash — simple but consistent across sessions */
function hashPassword(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as GameState;
    // Migrate v1 data if present
    const v1 = localStorage.getItem('ctrlplay_desafios_v1');
    if (v1) {
      const old = JSON.parse(v1) as { users: Omit<GameUser, 'passwordHash'>[]; currentUserId: string | null };
      return {
        users: old.users.map(u => ({ ...u, passwordHash: '' })),
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

export function useGameState() {
  const [state, setState] = useState<GameState>(loadState);

  const currentUser = state.users.find(u => u.id === state.currentUserId) ?? null;

  const persist = useCallback((next: GameState) => {
    setState(next);
    saveState(next);
  }, []);

  const registerUser = useCallback((name: string, avatar: string, password: string): string => {
    const id = `u_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const newUser: GameUser = {
      id, name, avatar,
      passwordHash: hashPassword(password),
      points: 0, solvedPuzzles: [], hintsUsed: [], streak: 0,
    };
    persist({ users: [...state.users, newUser], currentUserId: id });
    return id;
  }, [state, persist]);

  const login = useCallback((name: string, password: string): LoginResult => {
    const user = state.users.find(u => u.name.toLowerCase() === name.toLowerCase());
    if (!user) return 'not-found';
    // Users migrated from v1 have no password — any password works on first login
    if (user.passwordHash && user.passwordHash !== hashPassword(password)) return 'wrong-password';
    // If migrated (empty hash), set the password now
    if (!user.passwordHash) {
      const updated = { ...user, passwordHash: hashPassword(password) };
      persist({ users: state.users.map(u => u.id === user.id ? updated : u), currentUserId: user.id });
    } else {
      persist({ ...state, currentUserId: user.id });
    }
    return 'ok';
  }, [state, persist]);

  const logout = useCallback(() => {
    persist({ ...state, currentUserId: null });
  }, [state, persist]);

  const useHint = useCallback((puzzleId: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.hintsUsed.includes(puzzleId)) return true;
    const updated: GameUser = {
      ...currentUser,
      points: Math.max(0, currentUser.points - 5),
      hintsUsed: [...currentUser.hintsUsed, puzzleId],
    };
    persist({ ...state, users: state.users.map(u => u.id === currentUser.id ? updated : u) });
    return true;
  }, [currentUser, state, persist]);

  const recordAnswer = useCallback((puzzleId: string, correct: boolean, puzzlePoints: number): number => {
    if (!currentUser) return 0;
    if (!correct) {
      const updated = { ...currentUser, streak: 0 };
      persist({ ...state, users: state.users.map(u => u.id === currentUser.id ? updated : u) });
      return 0;
    }
    if (currentUser.solvedPuzzles.includes(puzzleId)) return 0;
    const hintPenalty = currentUser.hintsUsed.includes(puzzleId) ? 5 : 0;
    const earned = Math.max(1, puzzlePoints - hintPenalty);
    const newStreak = currentUser.streak + 1;
    const bonus = newStreak % 5 === 0 ? 10 : 0;
    const updated: GameUser = {
      ...currentUser,
      points: currentUser.points + earned + bonus,
      solvedPuzzles: [...currentUser.solvedPuzzles, puzzleId],
      streak: newStreak,
    };
    persist({ ...state, users: state.users.map(u => u.id === currentUser.id ? updated : u) });
    return bonus;
  }, [currentUser, state, persist]);

  const leaderboard = [...state.users].sort((a, b) => b.points - a.points);

  return { currentUser, users: state.users, leaderboard, registerUser, login, logout, useHint, recordAnswer };
}
