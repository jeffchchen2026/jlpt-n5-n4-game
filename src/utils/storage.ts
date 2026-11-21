import {
  DailyRecord,
  GameMode,
  MistakeItem,
  ModeScoreBreakdown,
  ScoreState,
  UserPreferences,
  VocabEntry,
  WordProgress,
} from '../data/types';

const KEYS = {
  PREFS: 'jlpt_memo_prefs_v1',
  MISTAKES: 'jlpt_memo_mistakes_v1',
  SCORES: 'jlpt_memo_scores_v1',
  PROGRESS: 'jlpt_memo_progress_v1',
};

export const BASE_POINTS: Record<GameMode | 'mistakeReview', number> = {
  cloze: 10,
  scramble: 15,
  dialogue: 10,
  mistakeReview: 5,
};

export function getComboMultiplier(comboAfterSuccess: number): number {
  if (comboAfterSuccess >= 8) return 2.0;
  if (comboAfterSuccess >= 5) return 1.5;
  if (comboAfterSuccess >= 3) return 1.2;
  return 1.0;
}

export function getTodayDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatShortMonthDay(dateKey: string): string {
  const parts = dateKey.split('-');
  if (parts.length !== 3) return dateKey;
  return `${Number(parts[1])}/${Number(parts[2])}`;
}

export function formatFullDateLabel(dateKey: string): string {
  const parts = dateKey.split('-');
  if (parts.length !== 3) return dateKey;
  return `${parts[0]}年${Number(parts[1])}月${Number(parts[2])}日`;
}

export function createEmptyDailyRecord(dateKey: string, goalTarget: number): DailyRecord {
  return {
    date: dateKey,
    totalScore: 0,
    goalTarget,
    goalReached: false,
    correctCount: 0,
    wrongCount: 0,
    bestCombo: 0,
    breakdown: {
      cloze: 0,
      scramble: 0,
      dialogue: 0,
      mistakeReview: 0,
    },
  };
}

const DEFAULT_PREFS: UserPreferences = {
  levelFilter: 'ALL',
  unitFilter: 'ALL',
  posFilter: 'ALL',
  onlyUnmastered: false,
  showKana: true,
  showTranslation: true,
  speechRate: 0.92,
  speechVoiceURI: 'auto',
};

const DEFAULT_SCORES: ScoreState = {
  currentCombo: 0,
  bestComboEver: 0,
  dailyGoal: 100,
  dailyRecords: {},
};

export function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(KEYS.PREFS);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(KEYS.PREFS, JSON.stringify(prefs));
  } catch {
    // Ignore quota errors
  }
}

export function loadMistakes(): MistakeItem[] {
  try {
    const raw = localStorage.getItem(KEYS.MISTAKES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveMistakes(items: MistakeItem[]): void {
  try {
    localStorage.setItem(KEYS.MISTAKES, JSON.stringify(items));
  } catch {
    // Ignore quota errors
  }
}

export function recordMistakeItem(
  current: MistakeItem[],
  vocabId: string,
  exampleIndex: number,
  mode: GameMode
): MistakeItem[] {
  const existingIdx = current.findIndex((item) => item.vocabId === vocabId);
  const now = new Date().toISOString();
  let next: MistakeItem[];

  if (existingIdx >= 0) {
    const existing = current[existingIdx];
    const updated: MistakeItem = {
      ...existing,
      exampleIndex,
      lastWrongMode: mode,
      wrongCount: existing.wrongCount + 1,
      updatedAt: now,
    };
    next = [updated, ...current.filter((_, idx) => idx !== existingIdx)];
  } else {
    next = [
      {
        vocabId,
        exampleIndex,
        lastWrongMode: mode,
        wrongCount: 1,
        updatedAt: now,
      },
      ...current,
    ];
  }

  saveMistakes(next);
  return next;
}

export function removeMistakeItem(current: MistakeItem[], vocabId: string): MistakeItem[] {
  const next = current.filter((item) => item.vocabId !== vocabId);
  saveMistakes(next);
  return next;
}

export function loadScoreState(): ScoreState {
  try {
    const raw = localStorage.getItem(KEYS.SCORES);
    if (!raw) return DEFAULT_SCORES;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SCORES,
      ...parsed,
      dailyRecords: parsed?.dailyRecords ?? {},
    };
  } catch {
    return DEFAULT_SCORES;
  }
}

export function saveScoreState(state: ScoreState): void {
  try {
    localStorage.setItem(KEYS.SCORES, JSON.stringify(state));
  } catch {
    // Ignore quota errors
  }
}

export interface AnswerScoreOutcome {
  nextState: ScoreState;
  earnedPoints: number;
  basePoints: number;
  multiplier: number;
  newCombo: number;
  goalJustReached: boolean;
}

export function applyCorrectAnswerScore(
  state: ScoreState,
  source: keyof ModeScoreBreakdown
): AnswerScoreOutcome {
  const today = getTodayDateKey();
  const prevToday =
    state.dailyRecords[today] ?? createEmptyDailyRecord(today, state.dailyGoal);

  const newCombo = state.currentCombo + 1;
  const multiplier = getComboMultiplier(newCombo);
  const basePoints = BASE_POINTS[source];
  const earnedPoints = Math.round(basePoints * multiplier);

  const newTotalScore = prevToday.totalScore + earnedPoints;
  const wasGoalReached = prevToday.goalReached;
  const goalReached = newTotalScore >= state.dailyGoal;

  const updatedToday: DailyRecord = {
    ...prevToday,
    totalScore: newTotalScore,
    goalTarget: state.dailyGoal,
    goalReached,
    correctCount: prevToday.correctCount + 1,
    bestCombo: Math.max(prevToday.bestCombo, newCombo),
    breakdown: {
      ...prevToday.breakdown,
      [source]: (prevToday.breakdown[source] || 0) + earnedPoints,
    },
  };

  const nextState: ScoreState = {
    ...state,
    currentCombo: newCombo,
    bestComboEver: Math.max(state.bestComboEver, newCombo),
    dailyRecords: {
      ...state.dailyRecords,
      [today]: updatedToday,
    },
  };

  saveScoreState(nextState);

  return {
    nextState,
    earnedPoints,
    basePoints,
    multiplier,
    newCombo,
    goalJustReached: !wasGoalReached && goalReached,
  };
}

export function applyWrongAnswerReset(state: ScoreState): ScoreState {
  const today = getTodayDateKey();
  const prevToday =
    state.dailyRecords[today] ?? createEmptyDailyRecord(today, state.dailyGoal);

  const updatedToday: DailyRecord = {
    ...prevToday,
    goalTarget: state.dailyGoal,
    wrongCount: prevToday.wrongCount + 1,
  };

  const nextState: ScoreState = {
    ...state,
    currentCombo: 0,
    dailyRecords: {
      ...state.dailyRecords,
      [today]: updatedToday,
    },
  };

  saveScoreState(nextState);
  return nextState;
}

export function updateDailyGoalTarget(state: ScoreState, newGoal: number): ScoreState {
  const clamped = Math.max(10, Math.min(2000, Math.round(newGoal)));
  const today = getTodayDateKey();
  const prevToday =
    state.dailyRecords[today] ?? createEmptyDailyRecord(today, clamped);

  const updatedToday: DailyRecord = {
    ...prevToday,
    goalTarget: clamped,
    goalReached: prevToday.totalScore >= clamped,
  };

  const nextState: ScoreState = {
    ...state,
    dailyGoal: clamped,
    dailyRecords: {
      ...state.dailyRecords,
      [today]: updatedToday,
    },
  };

  saveScoreState(nextState);
  return nextState;
}

export function getTodayRecord(state: ScoreState): DailyRecord {
  const today = getTodayDateKey();
  return state.dailyRecords[today] ?? createEmptyDailyRecord(today, state.dailyGoal);
}

export function calculateConsecutiveGoalStreak(state: ScoreState): number {
  let streak = 0;
  const cursor = new Date();
  const todayKey = getTodayDateKey(cursor);
  const todayRec = state.dailyRecords[todayKey];

  // If today already reached the goal, include today and walk backward.
  // If today hasn't reached the goal yet, check starting from yesterday so active streak isn't lost mid-day.
  if (todayRec?.goalReached) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  } else {
    cursor.setDate(cursor.getDate() - 1);
  }

  for (let i = 0; i < 365; i++) {
    const key = getTodayDateKey(cursor);
    const rec = state.dailyRecords[key];
    if (rec && rec.goalReached) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function getRecentDailySeries(state: ScoreState, days: 7 | 14): DailyRecord[] {
  const list: DailyRecord[] = [];
  const base = new Date();
  for (let offset = days - 1; offset >= 0; offset--) {
    const d = new Date(base);
    d.setDate(base.getDate() - offset);
    const key = getTodayDateKey(d);
    const existing = state.dailyRecords[key];
    list.push(existing ?? createEmptyDailyRecord(key, state.dailyGoal));
  }
  return list;
}

export function getRecordedDaysHistory(state: ScoreState): DailyRecord[] {
  const today = getTodayDateKey();
  const records = { ...state.dailyRecords };
  if (!records[today]) {
    records[today] = createEmptyDailyRecord(today, state.dailyGoal);
  }
  return Object.values(records).sort((a, b) => b.date.localeCompare(a.date));
}

export function loadWordProgress(): Record<string, WordProgress> {
  try {
    const raw = localStorage.getItem(KEYS.PROGRESS);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function saveWordProgress(progress: Record<string, WordProgress>): void {
  try {
    localStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress));
  } catch {
    // Ignore quota errors
  }
}

export function recordWordProgressAttempt(
  current: Record<string, WordProgress>,
  vocabId: string,
  isCorrect: boolean
): Record<string, WordProgress> {
  const prev = current[vocabId];
  const nextStreak = isCorrect ? (prev?.streak ?? 0) + 1 : 0;
  const updated: WordProgress = {
    vocabId,
    seenCount: (prev?.seenCount ?? 0) + 1,
    correctCount: (prev?.correctCount ?? 0) + (isCorrect ? 1 : 0),
    wrongCount: (prev?.wrongCount ?? 0) + (isCorrect ? 0 : 1),
    streak: nextStreak,
    mastered: isCorrect ? prev?.mastered || nextStreak >= 2 : false,
    lastPracticedAt: new Date().toISOString(),
  };

  const next = {
    ...current,
    [vocabId]: updated,
  };
  saveWordProgress(next);
  return next;
}

export function resetProgressForIds(
  current: Record<string, WordProgress>,
  vocabIds: string[]
): Record<string, WordProgress> {
  const idSet = new Set(vocabIds);
  const next: Record<string, WordProgress> = {};
  for (const [key, val] of Object.entries(current)) {
    if (!idSet.has(key)) {
      next[key] = val;
    }
  }
  saveWordProgress(next);
  return next;
}

export interface UnitMasterySummary {
  total: number;
  practiced: number;
  mastered: number;
  percent: number;
}

export function getUnitMasterySummary(
  entries: VocabEntry[],
  progress: Record<string, WordProgress>
): UnitMasterySummary {
  const total = entries.length;
  let practiced = 0;
  let mastered = 0;
  for (const entry of entries) {
    const p = progress[entry.id];
    if (p && p.seenCount > 0) practiced += 1;
    if (p && p.mastered) mastered += 1;
  }
  const percent = total > 0 ? Math.round((mastered / total) * 100) : 0;
  return { total, practiced, mastered, percent };
}

function shuffleStrings(list: string[]): string[] {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function buildPrioritizedDeckIds(
  entries: VocabEntry[],
  progress: Record<string, WordProgress>,
  onlyUnmastered: boolean
): string[] {
  const unseenOrReset: string[] = [];
  const inProgress: string[] = [];
  const mastered: string[] = [];

  for (const entry of entries) {
    const p = progress[entry.id];
    if (!p || p.streak === 0) {
      unseenOrReset.push(entry.id);
    } else if (!p.mastered) {
      inProgress.push(entry.id);
    } else {
      mastered.push(entry.id);
    }
  }

  if (onlyUnmastered) {
    return [...shuffleStrings(unseenOrReset), ...shuffleStrings(inProgress)];
  }
  return [
    ...shuffleStrings(unseenOrReset),
    ...shuffleStrings(inProgress),
    ...shuffleStrings(mastered),
  ];
}
