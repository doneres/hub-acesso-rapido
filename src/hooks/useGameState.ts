import { useState, useCallback } from 'react';

export interface GameUser {
  id: string;
  name: string;
  avatar: string;
  points: number;
  solvedPuzzles: string[];
  hintsUsed: string[];
  streak: number;
}

interface GameState {
  users: GameUser[];
  currentUserId: string | null;
}

const STORAGE_KEY = 'ctrlplay_desafios_v1';

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as GameState;
  } catch { /* ignore */ }
  return { users: [], currentUserId: null };
}

function saveState(state: GameState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

export function useGameState() {
  const [state, setState] = useState<GameState>(loadState);

  const currentUser = state.users.find(u => u.id === state.currentUserId) ?? null;

  const persist = useCallback((next: GameState) => {
    setState(next);
    saveState(next);
  }, []);

  const registerUser = useCallback((name: string, avatar: string): string => {
    const id = `user_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const newUser: GameUser = { id, name, avatar, points: 0, solvedPuzzles: [], hintsUsed: [], streak: 0 };
    const next: GameState = { users: [...state.users, newUser], currentUserId: id };
    persist(next);
    return id;
  }, [state, persist]);

  const switchUser = useCallback((userId: string) => {
    persist({ ...state, currentUserId: userId });
  }, [state, persist]);

  /** Deducts 5 pts for hint (only once per puzzle). Returns false if no user. */
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

  /**
   * Records a puzzle answer. Returns streak bonus earned (0 or 10).
   * puzzlePoints: base points for the puzzle (needed to calculate award).
   */
  const recordAnswer = useCallback((puzzleId: string, correct: boolean, puzzlePoints: number): number => {
    if (!currentUser) return 0;

    if (!correct) {
      const updated: GameUser = { ...currentUser, streak: 0 };
      persist({ ...state, users: state.users.map(u => u.id === currentUser.id ? updated : u) });
      return 0;
    }

    const alreadySolved = currentUser.solvedPuzzles.includes(puzzleId);
    if (alreadySolved) return 0;

    const hintPenalty = currentUser.hintsUsed.includes(puzzleId) ? 5 : 0;
    const earned = Math.max(1, puzzlePoints - hintPenalty);
    const newStreak = currentUser.streak + 1;
    const streakBonus = newStreak % 5 === 0 ? 10 : 0;

    const updated: GameUser = {
      ...currentUser,
      points: currentUser.points + earned + streakBonus,
      solvedPuzzles: [...currentUser.solvedPuzzles, puzzleId],
      streak: newStreak,
    };
    persist({ ...state, users: state.users.map(u => u.id === currentUser.id ? updated : u) });
    return streakBonus;
  }, [currentUser, state, persist]);

  const leaderboard = [...state.users].sort((a, b) => b.points - a.points);

  return { currentUser, users: state.users, leaderboard, registerUser, switchUser, useHint, recordAnswer };
}
