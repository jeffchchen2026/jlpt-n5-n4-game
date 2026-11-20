import { CheckCircle2, Flame, Sparkles, Volume2, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { ClozeGame } from './components/ClozeGame';
import { DailyGoalBar, ScoreFeedbackToast } from './components/DailyGoalBar';
import { DialogueGame } from './components/DialogueGame';
import { HeaderBar } from './components/HeaderBar';
import { MistakeNotebook } from './components/MistakeNotebook';
import { ScoreDashboard } from './components/ScoreDashboard';
import { ScrambleGame } from './components/ScrambleGame';
import { SpeakButton } from './components/SpeakButton';
import { StudyControls } from './components/StudyControls';
import {
  AppTab,
  GameMode,
  LevelFilter,
  MistakeItem,
  ScoreState,
  UserPreferences,
  VocabEntry,
} from './data/types';
import { getFilteredVocab, getVocabCounts, VOCAB_BY_ID } from './data/vocab';
import {
  getAvailableJapaneseVoices,
  JapaneseVoiceOption,
  setPreferredSpeechVoiceURI,
  stopJapaneseSpeech,
  subscribeVoicesChanged,
} from './utils/speech';
import {
  applyCorrectAnswerScore,
  applyWrongAnswerReset,
  getTodayRecord,
  loadMistakes,
  loadPreferences,
  loadScoreState,
  recordMistakeItem,
  removeMistakeItem,
  saveMistakes,
  savePreferences,
  updateDailyGoalTarget,
} from './utils/storage';

const RATE_OPTIONS: { label: string; val: number }[] = [
  { label: '慢速', val: 0.72 },
  { label: '標準', val: 0.92 },
  { label: '較快', val: 1.08 },
];

function shuffleIds(entries: VocabEntry[]): string[] {
  const ids = entries.map((e) => e.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('play');
  const [gameMode, setGameMode] = useState<GameMode>('cloze');
  const [prefs, setPrefs] = useState<UserPreferences>(() => loadPreferences());
  const [mistakes, setMistakes] = useState<MistakeItem[]>(() => loadMistakes());
  const [scoreState, setScoreState] = useState<ScoreState>(() => loadScoreState());

  const [deckIds, setDeckIds] = useState<string[]>(() =>
    shuffleIds(getFilteredVocab(loadPreferences().levelFilter))
  );
  const [deckCursor, setDeckCursor] = useState<number>(0);

  const [reviewQueue, setReviewQueue] = useState<string[]>([]);
  const [reviewCompletedCount, setReviewCompletedCount] = useState<number>(0);

  const [lastFeedback, setLastFeedback] = useState<ScoreFeedbackToast | null>(null);
  const [goalBannerVisible, setGoalBannerVisible] = useState<boolean>(false);
  const [quickGoalModalOpen, setQuickGoalModalOpen] = useState<boolean>(false);
  const [quickGoalValue, setQuickGoalValue] = useState<string>(() =>
    String(loadScoreState().dailyGoal)
  );
  const [speechModalOpen, setSpeechModalOpen] = useState<boolean>(false);
  const [availableVoices, setAvailableVoices] = useState<JapaneseVoiceOption[]>(() =>
    getAvailableJapaneseVoices()
  );

  const vocabCounts = useMemo(() => getVocabCounts(), []);
  const todayRecord = getTodayRecord(scoreState);

  useEffect(() => {
    savePreferences(prefs);
    setPreferredSpeechVoiceURI(prefs.speechVoiceURI || 'auto');
  }, [prefs]);

  useEffect(() => {
    const refreshVoices = () => setAvailableVoices(getAvailableJapaneseVoices());
    refreshVoices();
    return subscribeVoicesChanged(refreshVoices);
  }, []);

  useEffect(() => {
    return () => stopJapaneseSpeech();
  }, [activeTab, gameMode]);

  const rebuildDeck = useCallback((filter: LevelFilter) => {
    const pool = getFilteredVocab(filter);
    setDeckIds(shuffleIds(pool));
    setDeckCursor(0);
  }, []);

  const handleSelectLevel = (level: LevelFilter) => {
    setPrefs((prev) => ({ ...prev, levelFilter: level }));
    rebuildDeck(level);
  };

  const handleSelectMode = (mode: GameMode) => {
    stopJapaneseSpeech();
    setGameMode(mode);
  };

  const handleSelectTab = (tab: AppTab) => {
    stopJapaneseSpeech();
    setActiveTab(tab);
  };

  const isReviewingMistakes = reviewQueue.length > 0;

  const currentEntry: VocabEntry | null = useMemo(() => {
    if (isReviewingMistakes) {
      return VOCAB_BY_ID[reviewQueue[0]] ?? null;
    }
    const id = deckIds[deckCursor];
    return id ? VOCAB_BY_ID[id] ?? null : null;
  }, [isReviewingMistakes, reviewQueue, deckIds, deckCursor]);

  const handleCorrectAnswer = (modeSource: GameMode) => {
    const source = isReviewingMistakes ? 'mistakeReview' : modeSource;
    const outcome = applyCorrectAnswerScore(scoreState, source);
    setScoreState(outcome.nextState);
    setLastFeedback({
      id: Date.now(),
      type: 'correct',
      earnedPoints: outcome.earnedPoints,
      basePoints: outcome.basePoints,
      multiplier: outcome.multiplier,
      combo: outcome.newCombo,
      goalJustReached: outcome.goalJustReached,
    });
    if (outcome.goalJustReached) {
      setGoalBannerVisible(true);
    }
  };

  const handleWrongAnswer = (vocabId: string, exampleIndex: number, mode: GameMode) => {
    const nextScore = applyWrongAnswerReset(scoreState);
    setScoreState(nextScore);
    const nextMistakes = recordMistakeItem(mistakes, vocabId, exampleIndex, mode);
    setMistakes(nextMistakes);
    setLastFeedback({
      id: Date.now(),
      type: 'wrong',
      earnedPoints: 0,
      basePoints: 0,
      multiplier: 1,
      combo: 0,
      goalJustReached: false,
    });
  };

  const handleNextCard = () => {
    stopJapaneseSpeech();
    if (isReviewingMistakes) {
      setReviewCompletedCount((c) => c + 1);
      setReviewQueue((prev) => prev.slice(1));
      return;
    }

    if (deckCursor + 1 >= deckIds.length) {
      const pool = getFilteredVocab(prefs.levelFilter);
      setDeckIds(shuffleIds(pool));
      setDeckCursor(0);
    } else {
      setDeckCursor((c) => c + 1);
    }
  };

  const handleStartMistakeReview = () => {
    const ids = mistakes
      .map((m) => m.vocabId)
      .filter((id) => Boolean(VOCAB_BY_ID[id]));
    if (ids.length === 0) return;
    setReviewQueue(ids);
    setReviewCompletedCount(0);
    setGameMode('cloze');
    setActiveTab('play');
  };

  const handleExitMistakeReview = () => {
    setReviewQueue([]);
    setReviewCompletedCount(0);
  };

  const handleRemoveMistake = (vocabId: string) => {
    setMistakes((prev) => removeMistakeItem(prev, vocabId));
    setReviewQueue((prev) => prev.filter((id) => id !== vocabId));
  };

  const handleClearAllMistakes = () => {
    saveMistakes([]);
    setMistakes([]);
    setReviewQueue([]);
  };

  const handleUpdateDailyGoal = (goal: number) => {
    const next = updateDailyGoalTarget(scoreState, goal);
    setScoreState(next);
    setQuickGoalValue(String(next.dailyGoal));
  };

  const handleSaveQuickGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(quickGoalValue);
    if (!Number.isFinite(num) || num < 10) return;
    handleUpdateDailyGoal(num);
    setQuickGoalModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <HeaderBar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        mistakeCount={mistakes.length}
        todayScore={todayRecord.totalScore}
        dailyGoal={scoreState.dailyGoal}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-4 pb-24 md:pb-10">
        {goalBannerVisible && (
          <div className="mb-4 bg-emerald-50 border border-emerald-300 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-sm font-semibold text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                恭喜達成今日目標積分（{scoreState.dailyGoal} 分）！繼續保持連擊吧。
              </span>
            </div>
            <button
              type="button"
              onClick={() => setGoalBannerVisible(false)}
              aria-label="關閉達標提示"
              className="p-1.5 text-emerald-700 hover:text-emerald-950 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {activeTab === 'play' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-8 space-y-4">
              {/* Mobile Daily Progress Bar */}
              <div className="lg:hidden">
                <DailyGoalBar
                  todayScore={todayRecord.totalScore}
                  dailyGoal={scoreState.dailyGoal}
                  currentCombo={scoreState.currentCombo}
                  lastFeedback={lastFeedback}
                  onOpenGoalSettings={() => {
                    setQuickGoalValue(String(scoreState.dailyGoal));
                    setQuickGoalModalOpen(true);
                  }}
                />
              </div>

              <StudyControls
                gameMode={gameMode}
                onSelectMode={handleSelectMode}
                levelFilter={prefs.levelFilter}
                onSelectLevel={handleSelectLevel}
                showKana={prefs.showKana}
                onToggleKana={() =>
                  setPrefs((p) => ({ ...p, showKana: !p.showKana }))
                }
                showTranslation={prefs.showTranslation}
                onToggleTranslation={() =>
                  setPrefs((p) => ({ ...p, showTranslation: !p.showTranslation }))
                }
                isReviewingMistakes={isReviewingMistakes}
                reviewRemainingCount={reviewQueue.length}
                onExitMistakeReview={handleExitMistakeReview}
                onOpenSpeechSettings={() => setSpeechModalOpen(true)}
              />

              {currentEntry ? (
                <>
                  {(gameMode === 'cloze' || isReviewingMistakes) && (
                    <ClozeGame
                      entry={currentEntry}
                      exampleIndex={0}
                      showKana={prefs.showKana}
                      showTranslation={prefs.showTranslation}
                      speechRate={prefs.speechRate}
                      isReviewMode={isReviewingMistakes}
                      onCorrect={() => handleCorrectAnswer('cloze')}
                      onWrong={() =>
                        handleWrongAnswer(currentEntry.id, 0, 'cloze')
                      }
                      onNext={handleNextCard}
                    />
                  )}

                  {gameMode === 'scramble' && !isReviewingMistakes && (
                    <ScrambleGame
                      entry={currentEntry}
                      exampleIndex={0}
                      showKana={prefs.showKana}
                      showTranslation={prefs.showTranslation}
                      speechRate={prefs.speechRate}
                      onCorrect={() => handleCorrectAnswer('scramble')}
                      onWrong={() =>
                        handleWrongAnswer(currentEntry.id, 0, 'scramble')
                      }
                      onNext={handleNextCard}
                    />
                  )}

                  {gameMode === 'dialogue' && !isReviewingMistakes && (
                    <DialogueGame
                      entry={currentEntry}
                      showKana={prefs.showKana}
                      showTranslation={prefs.showTranslation}
                      speechRate={prefs.speechRate}
                      onCorrect={() => handleCorrectAnswer('dialogue')}
                      onWrong={() =>
                        handleWrongAnswer(currentEntry.id, 0, 'dialogue')
                      }
                      onNext={handleNextCard}
                    />
                  )}
                </>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3">
                  <Sparkles className="w-8 h-8 text-blue-600 mx-auto" />
                  <h2 className="text-lg font-bold text-slate-900">
                    本輪練習已完成（{reviewCompletedCount} 題）
                  </h2>
                  <button
                    type="button"
                    onClick={() => rebuildDeck(prefs.levelFilter)}
                    className="min-h-[46px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm cursor-pointer"
                  >
                    重新抽題練習
                  </button>
                </div>
              )}
            </div>

            {/* Desktop Side Column */}
            <aside className="hidden lg:block lg:col-span-4 space-y-4">
              <DailyGoalBar
                todayScore={todayRecord.totalScore}
                dailyGoal={scoreState.dailyGoal}
                currentCombo={scoreState.currentCombo}
                lastFeedback={lastFeedback}
                onOpenGoalSettings={() => {
                  setQuickGoalValue(String(scoreState.dailyGoal));
                  setQuickGoalModalOpen(true);
                }}
              />

              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Flame className="w-4 h-4 text-amber-600" />
                  <span>連續答對加乘規則</span>
                </div>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span>1～2 連對</span>
                    <span className="font-mono-num font-semibold text-slate-900">1.0x</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span>3～4 連對</span>
                    <span className="font-mono-num font-semibold text-blue-700">1.2x</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span>5～7 連對</span>
                    <span className="font-mono-num font-semibold text-blue-700">1.5x</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span>8 連對以上</span>
                    <span className="font-mono-num font-semibold text-emerald-700">2.0x</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <Volume2 className="w-4 h-4 text-blue-600" />
                    <span>裝置日文語音與語速</span>
                  </div>
                  <span className="font-mono-num text-xs text-slate-500">
                    {prefs.speechRate.toFixed(2)}x
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="desktop-voice-select" className="block text-xs text-slate-500">
                    優先聲線（預設自動選用 Natural / Neural / Google 日本語）
                  </label>
                  <select
                    id="desktop-voice-select"
                    value={prefs.speechVoiceURI || 'auto'}
                    onChange={(e) =>
                      setPrefs((p) => ({ ...p, speechVoiceURI: e.target.value }))
                    }
                    className="w-full min-h-[40px] px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="auto">
                      {availableVoices[0]
                        ? `自動最佳：${availableVoices[0].name}`
                        : '自動最佳（系統日文聲線）'}
                    </option>
                    {availableVoices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.isNeuralOrNatural ? `★ ${v.name}` : v.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs text-slate-500">朗讀語速</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {RATE_OPTIONS.map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setPrefs((p) => ({ ...p, speechRate: opt.val }))}
                        className={`min-h-[38px] rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                          Math.abs(prefs.speechRate - opt.val) < 0.05
                            ? 'bg-slate-900 border-slate-900 text-white'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-1 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-500">
                    N5 {vocabCounts.n5} 字 · N4 {vocabCounts.n4} 字
                  </span>
                  <SpeakButton
                    text="こんにちは。今日も楽しく勉強しましょう。"
                    label="試聽音色"
                    rate={prefs.speechRate}
                    voiceURI={prefs.speechVoiceURI}
                    size="sm"
                  />
                </div>
              </div>
            </aside>
          </div>
        )}

        {activeTab === 'mistakes' && (
          <MistakeNotebook
            mistakes={mistakes}
            showKana={prefs.showKana}
            showTranslation={prefs.showTranslation}
            speechRate={prefs.speechRate}
            onStartReview={handleStartMistakeReview}
            onRemoveMistake={handleRemoveMistake}
            onClearAll={handleClearAllMistakes}
            onGoPlay={() => setActiveTab('play')}
          />
        )}

        {activeTab === 'dashboard' && (
          <ScoreDashboard
            scoreState={scoreState}
            onUpdateDailyGoal={handleUpdateDailyGoal}
          />
        )}
      </main>

      <BottomNav
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        mistakeCount={mistakes.length}
      />

      {/* Quick Daily Goal Adjustment Modal */}
      {quickGoalModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-goal-title"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 id="quick-goal-title" className="text-base font-bold text-slate-900">
                設定每日目標積分
              </h2>
              <button
                type="button"
                onClick={() => setQuickGoalModalOpen(false)}
                aria-label="關閉設定"
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[50, 100, 200].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    handleUpdateDailyGoal(preset);
                    setQuickGoalModalOpen(false);
                  }}
                  className={`min-h-[46px] rounded-xl border font-mono-num text-sm font-semibold transition-colors cursor-pointer ${
                    scoreState.dailyGoal === preset
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {preset} 分
                </button>
              ))}
            </div>

            <form onSubmit={handleSaveQuickGoal} className="space-y-3">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="modal-goal-input"
                  className="text-sm text-slate-600 whitespace-nowrap"
                >
                  自訂分數
                </label>
                <input
                  id="modal-goal-input"
                  type="number"
                  min={10}
                  max={2000}
                  step={5}
                  value={quickGoalValue}
                  onChange={(e) => setQuickGoalValue(e.target.value)}
                  className="flex-1 min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 font-mono-num text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full min-h-[48px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base cursor-pointer"
              >
                儲存目標
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Speech Voice & Rate Settings Modal */}
      {speechModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="speech-modal-title"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 id="speech-modal-title" className="text-base font-bold text-slate-900">
                裝置日文語音與語速設定
              </h2>
              <button
                type="button"
                onClick={() => setSpeechModalOpen(false)}
                aria-label="關閉語音設定"
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label htmlFor="mobile-voice-select" className="block text-xs font-medium text-slate-500">
                選擇裝置日文聲線（預設自動選用 Natural / Neural / Google 日本語）
              </label>
              <select
                id="mobile-voice-select"
                value={prefs.speechVoiceURI || 'auto'}
                onChange={(e) =>
                  setPrefs((p) => ({ ...p, speechVoiceURI: e.target.value }))
                }
                className="w-full min-h-[46px] px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="auto">
                  {availableVoices[0]
                    ? `自動最佳：${availableVoices[0].name}`
                    : '自動最佳（系統日文聲線）'}
                </option>
                {availableVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.isNeuralOrNatural ? `★ ${v.name}` : v.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>朗讀語速</span>
                <span className="font-mono-num">{prefs.speechRate.toFixed(2)}x</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {RATE_OPTIONS.map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setPrefs((p) => ({ ...p, speechRate: opt.val }))}
                    className={`min-h-[44px] rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                      Math.abs(prefs.speechRate - opt.val) < 0.05
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <SpeakButton
                text="こんにちは。今日も楽しく勉強しましょう。"
                label="試聽目前音色"
                rate={prefs.speechRate}
                voiceURI={prefs.speechVoiceURI}
                size="md"
              />
              <button
                type="button"
                onClick={() => setSpeechModalOpen(false)}
                className="flex-1 min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm cursor-pointer"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
