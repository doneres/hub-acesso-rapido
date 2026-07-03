import { useState, useCallback, useEffect } from 'react';
import { ref, set, get, onValue } from 'firebase/database';
import { db } from '../lib/firebase';
import { setActiveCosmeticId } from '../data/cosmetics';
import { PUZZLES } from '../data/puzzles';

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
  coins: number;             // moeda separada — ganha junto com pts, gasta na loja
  solvedPuzzles: string[];
  hintsUsed: string[];
  streak: number;
  wrongAttempts: Record<string, number>;
  powerups: Powerups;
  purchasedCosmetics: string[];
  activeCosmeticId: string | null;
}

interface GameState {
  users: GameUser[];
  currentUserId: string | null;
}

const STORAGE_KEY = 'ctrlplay_desafios_v2';
const ADMIN_ID    = 'u_admin';
const FB_USERS    = 'desafios_users';

// Pontuação máxima possível: soma de todos os puzzles + bônus de streak máximo
// Recalculado dinamicamente para se manter correto mesmo se novos puzzles forem adicionados
const MAX_PUZZLE_POINTS = PUZZLES.reduce((acc, p) => acc + p.points, 0);
// Bônus de streak: 1 bônus a cada 5 acertos, +10 pts cada. Com ~60 puzzles → ~12 bônus × 10 = 120 extra
const MAX_SCORE = MAX_PUZZLE_POINTS + Math.floor(PUZZLES.length / 5) * 10 + 200; // margem de 200 para segurança

const VALID_PUZZLE_IDS = new Set(PUZZLES.map(p => p.id));
// Mapa id → pontos canônicos para evitar que o caller passe pontos adulterados
const PUZZLE_POINTS_MAP = new Map(PUZZLES.map(p => [p.id, p.points]));

// Limite por operação única de addCoins (ex: CSS Battle)
const MAX_COINS_PER_OPERATION = 500;
// Limite por operação única de addPoints (mini-games)
const MAX_POINTS_PER_OPERATION = 60;
// Orçamento de pontos de mini-games: permite acumular pontos mesmo sem puzzles do quiz resolvidos
const MINI_GAME_BUDGET = 500;

function fbKey(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

/** FNV-1a 32-bit hash */
function hashPassword(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

/** Garante que usuários antigos (sem os novos campos) tenham defaults + caps de segurança */
function migrateUser(u: Partial<GameUser> & Pick<GameUser, 'id' | 'name'>): GameUser {
  // Admin é gerenciado pelo sistema — não aplica caps de pontuação
  if (u.id === ADMIN_ID) {
    return {
      id: u.id, name: u.name,
      avatar: u.avatar ?? '👑',
      passwordHash: u.passwordHash ?? '',
      points: (u as any).points ?? ADMIN_MIN_POINTS,
      coins: (u as any).coins ?? ADMIN_MIN_POINTS,
      solvedPuzzles: [], hintsUsed: [], streak: 0,
      wrongAttempts: {},
      powerups: (u as any).powerups ?? { shield: 5, eliminate: 5 },
      purchasedCosmetics: (u as any).purchasedCosmetics ?? [],
      activeCosmeticId: (u as any).activeCosmeticId ?? null,
    };
  }
  const rawPts = (u as any).points ?? 0;
  const rawCoins = (u as any).coins ?? rawPts;
  // Filtra solvedPuzzles para aceitar apenas IDs conhecidos — evita que
  // um aluno injete IDs falsos para inflar o progresso
  const rawSolved: string[] = u.solvedPuzzles ?? [];
  const safeSolved = rawSolved.filter(id => VALID_PUZZLE_IDS.has(id));
  // Pontos máximos possíveis com os puzzles que o usuário diz ter resolvido.
  // Margem de 200 só se aplica quando há puzzles resolvidos — evita que usuário
  // com 0 puzzles tenha 200 pts "de graça" por conta do offset incondicional.
  const solvedBase = safeSolved.reduce((acc, id) => acc + (PUZZLE_POINTS_MAP.get(id) ?? 0), 0);
  // MINI_GAME_BUDGET garante que pontos de mini-games (CSS Battle, FlexRocket, etc.)
  // não sejam zerados pelo anti-cheat mesmo sem puzzles do quiz resolvidos
  const solvedMax  = solvedBase + Math.floor(safeSolved.length / 5) * 10 + MINI_GAME_BUDGET;
  // Se os pontos excederem o máximo possível, é sinal de adulteração
  const safePoints = Math.min(rawPts, MAX_SCORE, solvedMax);
  const safeCoins  = Math.min(rawCoins, MAX_SCORE * 2); // coins podem ser maiores (CSS Battle)
  return {
    id:                 u.id,
    name:               u.name,
    avatar:             u.avatar             ?? '🕵',
    passwordHash:       u.passwordHash       ?? '',
    points:             Math.max(0, safePoints),
    coins:              Math.max(0, safeCoins),
    solvedPuzzles:      safeSolved,
    hintsUsed:          (u.hintsUsed ?? []).filter((id: string) => VALID_PUZZLE_IDS.has(id)),
    streak:             Math.min((u.streak ?? 0), PUZZLES.length),
    wrongAttempts:      (u as any).wrongAttempts      ?? {},
    powerups:           (u as any).powerups           ?? { shield: 0, eliminate: 0 },
    purchasedCosmetics: (u as any).purchasedCosmetics ?? [],
    activeCosmeticId:   (u as any).activeCosmeticId   ?? null,
  };
}

const ADMIN_MIN_POINTS = 9999;

function ensureAdmin(state: GameState): GameState {
  const exists = state.users.find(u => u.id === ADMIN_ID);
  if (exists) {
    if (exists.points < ADMIN_MIN_POINTS) {
      return {
        ...state,
        users: state.users.map(u =>
          u.id === ADMIN_ID ? { ...u, points: ADMIN_MIN_POINTS, coins: ADMIN_MIN_POINTS } : u
        ),
      };
    }
    return state;
  }
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD as string | undefined;
  // Se a env var não estiver definida, usa sentinela impossível de produzir via hashPassword()
  // para impedir login admin com senha vazia previsível
  const adminHash = adminPassword
    ? hashPassword(adminPassword)
    : 'ADMIN_DISABLED_DEFINA_VITE_ADMIN_PASSWORD';
  const admin: GameUser = {
    id: ADMIN_ID, name: 'admin', avatar: '👑',
    passwordHash: adminHash,
    points: ADMIN_MIN_POINTS, coins: ADMIN_MIN_POINTS,
    solvedPuzzles: [], hintsUsed: [],
    streak: 0, wrongAttempts: {}, powerups: { shield: 5, eliminate: 5 },
    purchasedCosmetics: [], activeCosmeticId: null,
  };
  return { ...state, users: [...state.users, admin] };
}

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as GameState;
      return ensureAdmin({ ...parsed, users: parsed.users.map(migrateUser) });
    }
    const v1 = localStorage.getItem('ctrlplay_desafios_v1');
    if (v1) {
      const old = JSON.parse(v1) as { users: any[]; currentUserId: string | null };
      return ensureAdmin({
        users: old.users.map(u => migrateUser({ ...u, passwordHash: '' })),
        currentUserId: old.currentUserId,
      });
    }
  } catch { /* ignore */ }
  return ensureAdmin({ users: [], currentUserId: null });
}

function saveState(state: GameState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

/* ── Firebase helpers ──────────────────────────────────────────────── */

async function fbSaveUser(user: GameUser): Promise<void> {
  try {
    await set(ref(db, `${FB_USERS}/${fbKey(user.name)}`), user);
  } catch { /* ignore — offline ou rules negaram */ }
}

async function fbLoadUser(name: string): Promise<GameUser | null> {
  try {
    const snap = await get(ref(db, `${FB_USERS}/${fbKey(name)}`));
    return snap.exists() ? migrateUser(snap.val() as GameUser) : null;
  } catch { return null; }
}

/* ── Tipos exportados ──────────────────────────────────────────────── */

export type LoginResult = 'ok' | 'wrong-password' | 'not-found';

export function computeEarned(
  basePoints: number,
  hintUsed: boolean,
  wrongCount: number,
): number {
  const hintPenalty = hintUsed ? 5 : 0;
  const base = Math.max(0, basePoints - hintPenalty);
  if (wrongCount === 0) return Math.max(1, base);
  if (wrongCount === 1) return Math.max(1, Math.floor(base * 0.5));
  return 1;
}

/* ── Hook principal ────────────────────────────────────────────────── */

export function useGameState() {
  const [state, setState] = useState<GameState>(loadState);
  const [fbLeaderboard, setFbLeaderboard] = useState<GameUser[]>([]);

  const currentUser = state.users.find(u => u.id === state.currentUserId) ?? null;

  /* Leaderboard em tempo real via Firebase */
  useEffect(() => {
    const unsub = onValue(ref(db, FB_USERS), snap => {
      const data = snap.val();
      if (!data) return;
      const ranked = (Object.values(data) as GameUser[])
        .map(u => migrateUser(u))
        .filter(u => u.id !== ADMIN_ID)
        .sort((a, b) => b.points - a.points);
      setFbLeaderboard(ranked);
    }, () => { /* offline — ignora */ });
    return () => unsub();
  }, []);

  const persist = useCallback((next: GameState) => {
    setState(next);
    saveState(next);
  }, []);

  // Recebe uma função (usuário atual -> usuário atualizado) e aplica via setState
  // funcional, lendo sempre o estado mais recente. Isso evita que duas chamadas
  // síncronas (ex: addCoins seguido de addPoints no mesmo handler) se pisem —
  // se `update` recebesse o objeto já pronto (calculado a partir de um `currentUser`
  // fechado antes da primeira chamada aplicar), a segunda chamada sobrescreveria
  // o resultado da primeira com um valor desatualizado do campo que ela não mexeu.
  const update = useCallback((updater: GameUser | ((u: GameUser) => GameUser)) => {
    setState(prev => {
      const cur = prev.users.find(u => u.id === prev.currentUserId);
      if (!cur) return prev;
      const updated = typeof updater === 'function' ? updater(cur) : updater;
      const next = { ...prev, users: prev.users.map(u => u.id === updated.id ? updated : u) };
      saveState(next);
      fbSaveUser(updated); // fire-and-forget
      return next;
    });
  }, []);

  /* ── Auth ──────────────────────────────────────────────────────── */

  const registerUser = useCallback(async (name: string, avatar: string, password: string): Promise<string> => {
    const id = `u_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const newUser: GameUser = {
      id, name, avatar, passwordHash: hashPassword(password),
      points: 0, coins: 0,
      solvedPuzzles: [], hintsUsed: [],
      streak: 0, wrongAttempts: {}, powerups: { shield: 0, eliminate: 0 },
      purchasedCosmetics: [], activeCosmeticId: null,
    };
    persist({ users: [...state.users, newUser], currentUserId: id });
    setActiveCosmeticId(null);
    await fbSaveUser(newUser);
    return id;
  }, [state, persist]);

  const login = useCallback(async (name: string, password: string): Promise<LoginResult> => {
    // Tenta Firebase primeiro (suporte cross-device)
    const fbUser = await fbLoadUser(name);
    if (fbUser) {
      if (fbUser.passwordHash !== hashPassword(password)) return 'wrong-password';
      // Sincroniza dados do Firebase no estado local
      const nextUsers = state.users.some(u => u.name.toLowerCase() === name.toLowerCase())
        ? state.users.map(u => u.name.toLowerCase() === name.toLowerCase() ? fbUser : u)
        : [...state.users, fbUser];
      persist({ users: nextUsers, currentUserId: fbUser.id });
      setActiveCosmeticId(fbUser.activeCosmeticId);
      return 'ok';
    }

    // Fallback: dados locais (offline ou usuário ainda não migrado)
    const user = state.users.find(u => u.name.toLowerCase() === name.toLowerCase());
    if (!user) return 'not-found';
    if (user.passwordHash && user.passwordHash !== hashPassword(password)) return 'wrong-password';

    const finalUser = !user.passwordHash
      ? migrateUser({ ...user, passwordHash: hashPassword(password) })
      : user;
    const nextUsers = state.users.map(u => u.id === user.id ? finalUser : u);
    persist({ users: nextUsers, currentUserId: finalUser.id });
    setActiveCosmeticId(finalUser.activeCosmeticId);
    fbSaveUser(finalUser); // migra para Firebase
    return 'ok';
  }, [state, persist]);

  const logout = useCallback(() => {
    persist({ ...state, currentUserId: null });
    setActiveCosmeticId(null);
  }, [state, persist]);

  /* ── Dica ───────────────────────────────────────────────────────── */

  const useHint = useCallback((puzzleId: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.hintsUsed.includes(puzzleId)) return true;
    update(u => ({ ...u, hintsUsed: [...u.hintsUsed, puzzleId] }));
    return true;
  }, [currentUser, update]);

  /* ── Resposta ───────────────────────────────────────────────────── */

  const recordAnswer = useCallback((
    puzzleId: string,
    correct: boolean,
    _callerPoints: number, // ignorado — sempre usamos os pontos canônicos do PUZZLES
  ): { bonus: number; shieldUsed: boolean } => {
    if (!currentUser) return { bonus: 0, shieldUsed: false };

    // Rejeita puzzles desconhecidos — impede injeção de IDs fictícios
    const puzzlePoints = PUZZLE_POINTS_MAP.get(puzzleId);
    if (puzzlePoints === undefined) return { bonus: 0, shieldUsed: false };

    const wrongCount = currentUser.wrongAttempts[puzzleId] ?? 0;

    if (!correct) {
      const hasShield = currentUser.powerups.shield > 0;
      update(u => ({
        ...u,
        streak: hasShield ? u.streak : 0,
        wrongAttempts: { ...u.wrongAttempts, [puzzleId]: wrongCount + 1 },
        powerups: hasShield
          ? { ...u.powerups, shield: u.powerups.shield - 1 }
          : u.powerups,
      }));
      return { bonus: 0, shieldUsed: hasShield };
    }

    if (currentUser.solvedPuzzles.includes(puzzleId)) return { bonus: 0, shieldUsed: false };

    const hintUsed  = currentUser.hintsUsed.includes(puzzleId);
    const earned    = computeEarned(puzzlePoints, hintUsed, wrongCount);
    const newStreak = currentUser.streak + 1;
    const bonus     = newStreak % 5 === 0 ? 10 : 0;
    const total     = earned + bonus;

    update(u => ({
      ...u,
      points: u.points + total,
      coins:  u.coins  + total,  // moedas ganhas na mesma proporção que pontos
      solvedPuzzles: [...u.solvedPuzzles, puzzleId],
      streak: newStreak,
    }));
    return { bonus, shieldUsed: false };
  }, [currentUser, update]);

  /* ── Power-up: Loja (usa moedas, não pontos) ───────────────────── */

  const buyPowerup = useCallback((key: keyof Powerups, cost: number): boolean => {
    if (!currentUser || currentUser.coins < cost) return false;
    update(u => ({
      ...u,
      coins: u.coins - cost,
      powerups: { ...u.powerups, [key]: u.powerups[key] + 1 },
    }));
    return true;
  }, [currentUser, update]);

  /* ── Cosméticos (usa moedas, não pontos) ───────────────────────── */

  const buyCosmetic = useCallback((cosmeticId: string, cost: number): boolean => {
    if (!currentUser || currentUser.coins < cost) return false;
    if (currentUser.purchasedCosmetics.includes(cosmeticId)) return false;
    update(u => ({
      ...u,
      coins: u.coins - cost,
      purchasedCosmetics: [...u.purchasedCosmetics, cosmeticId],
      activeCosmeticId: cosmeticId,
    }));
    setActiveCosmeticId(cosmeticId);
    return true;
  }, [currentUser, update]);

  const equipCosmetic = useCallback((cosmeticId: string | null): void => {
    if (!currentUser) return;
    update(u => ({ ...u, activeCosmeticId: cosmeticId }));
    setActiveCosmeticId(cosmeticId);
  }, [currentUser, update]);

  /* ── Power-up: Usar Eliminar Errada ─────────────────────────────── */

  const useEliminate = useCallback((): boolean => {
    if (!currentUser || currentUser.powerups.eliminate <= 0) return false;
    update(u => ({
      ...u,
      powerups: { ...u.powerups, eliminate: u.powerups.eliminate - 1 },
    }));
    return true;
  }, [currentUser, update]);

  const spendCoins = useCallback((amount: number): boolean => {
    if (!currentUser || currentUser.coins < amount) return false;
    update(u => ({ ...u, coins: u.coins - amount }));
    return true;
  }, [currentUser, update]);

  const addCoins = useCallback((amount: number): void => {
    if (!currentUser || amount <= 0) return;
    // Cap por operação — impede que uma única chamada inflacione moedas sem limite
    const safeAmount = Math.min(amount, MAX_COINS_PER_OPERATION);
    update(u => ({ ...u, coins: u.coins + safeAmount }));
  }, [currentUser, update]);

  const addPoints = useCallback((amount: number): void => {
    if (!currentUser || amount <= 0) return;
    const safeAmount = Math.min(amount, MAX_POINTS_PER_OPERATION);
    update(u => ({ ...u, points: u.points + safeAmount }));
  }, [currentUser, update]);

  // Firebase tem prioridade no leaderboard (tempo real); fallback local
  const leaderboard = fbLeaderboard.length > 0
    ? fbLeaderboard
    : state.users.filter(u => u.id !== ADMIN_ID).sort((a, b) => b.points - a.points);

  return {
    currentUser, users: state.users, leaderboard,
    registerUser, login, logout,
    useHint, recordAnswer, buyPowerup, useEliminate,
    buyCosmetic, equipCosmetic, spendCoins, addCoins, addPoints,
  };
}
