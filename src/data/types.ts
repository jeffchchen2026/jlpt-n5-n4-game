export type JlptLevel = 'N5' | 'N4';

export type PartOfSpeech =
  | '名詞'
  | '動詞'
  | 'い形容詞'
  | 'な形容詞'
  | '副詞'
  | '連體・代名詞'
  | '接續詞'
  | '數量・時間'
  | '寒暄・感嘆'
  | '表現';

export const ALL_PARTS_OF_SPEECH: PartOfSpeech[] = [
  '名詞',
  '動詞',
  'い形容詞',
  'な形容詞',
  '副詞',
  '連體・代名詞',
  '接續詞',
  '數量・時間',
  '寒暄・感嘆',
  '表現',
];

export type PosFilter = 'ALL' | PartOfSpeech;

export type DialogueSituation = '購物' | '餐廳' | '問路' | '日常寒暄' | '學校・職場';

export type GameMode = 'cloze' | 'scramble' | 'dialogue';

export type AppTab = 'play' | 'mistakes' | 'dashboard';

export type LevelFilter = 'ALL' | 'N5' | 'N4';

export interface ExampleSentence {
  /** 完整日文例句 */
  japanese: string;
  /** 完整假名讀音 */
  kana: string;
  /** 繁體中文翻譯 */
  translation: string;
  /** 情境填空資料：挖空前段、目標字、挖空後段與3個同程度干擾選項 */
  cloze: {
    before: string;
    blankWord: string;
    after: string;
    kanaBefore: string;
    kanaAfter: string;
    distractors: [string, string, string];
  };
  /** 句子重組資料：4～6 個打亂詞彙方塊（按正確順序排列，遊玩時隨機打亂）與句型重點 */
  scramble: {
    chunks: string[];
    grammarTip: string;
  };
}

export interface DialogueScenario {
  situation: DialogueSituation;
  sceneDescription: string;
  promptJa: string;
  promptKana: string;
  promptZh: string;
  correctOption: {
    ja: string;
    kana: string;
    zh: string;
  };
  wrongOption: {
    ja: string;
    kana: string;
    zh: string;
  };
  politenessNote: string;
}

export interface VocabEntry {
  id: string;
  level: JlptLevel;
  kanji: string;
  kana: string;
  meaning: string;
  pos: PartOfSpeech;
  /** 使用時機與語氣說明 */
  usageNote: string;
  /** 至少 1~2 句完整日文例句 */
  examples: ExampleSentence[];
  /** 生活對話二選一情境 */
  dialogue: DialogueScenario;
}

export interface VocabUnitMeta {
  id: string;
  label: string;
  level: JlptLevel;
  description: string;
  entries: VocabEntry[];
}

export interface WordProgress {
  vocabId: string;
  seenCount: number;
  correctCount: number;
  wrongCount: number;
  streak: number;
  mastered: boolean;
  lastPracticedAt: string;
}

export interface MistakeItem {
  vocabId: string;
  exampleIndex: number;
  lastWrongMode: GameMode;
  wrongCount: number;
  updatedAt: string;
}

export interface ModeScoreBreakdown {
  cloze: number;
  scramble: number;
  dialogue: number;
  mistakeReview: number;
}

export interface DailyRecord {
  /** YYYY-MM-DD */
  date: string;
  totalScore: number;
  goalTarget: number;
  goalReached: boolean;
  correctCount: number;
  wrongCount: number;
  bestCombo: number;
  breakdown: ModeScoreBreakdown;
}

export interface ScoreState {
  currentCombo: number;
  bestComboEver: number;
  dailyGoal: number;
  dailyRecords: Record<string, DailyRecord>;
}

export interface UserPreferences {
  levelFilter: LevelFilter;
  unitFilter: string;
  posFilter: PosFilter;
  onlyUnmastered: boolean;
  showKana: boolean;
  showTranslation: boolean;
  speechRate: number;
  speechVoiceURI: string;
}
