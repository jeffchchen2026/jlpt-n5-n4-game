import {
  DailyRecord,
  GameMode,
  MistakeItem,
  ModeScoreBreakdown,
  ScoreState,
  UserPreferences,
} from '../data/types';

const KEYS = {
  PREFS: 'jlpt_memo_prefs_v1',
  MISTAKES: 'jlpt_memo_mistakes_v1',
  SCORES: 'jlpt_memo_scores_v1',
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
