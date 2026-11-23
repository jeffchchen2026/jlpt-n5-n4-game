import { LevelFilter, PosFilter, VocabEntry, VocabUnitMeta } from '../types';
import { N4_PART_1 } from './n4_part1';
import { N4_PART_2 } from './n4_part2';
import { N4_PART_3 } from './n4_part3';
import { N4_PART_4 } from './n4_part4';
import { N4_PART_5 } from './n4_part5';
import { N5_PART_1 } from './n5_part1';
import { N5_PART_2 } from './n5_part2';
import { N5_PART_3 } from './n5_part3';
import { N5_PART_4 } from './n5_part4';
import { N5_PART_5 } from './n5_part5';

/**
 * 模組化單字單元註冊表：
 * 未來擴充更多 N5 / N4 單字時，只需新增批次檔案（如 n5_part6.ts）
 * 並匯入加入此陣列即可自動納入題庫、發音、單元篩選、進度記錄與自動驗證腳本。
 */
export const VOCAB_UNITS: VocabUnitMeta[] = [
  {
    id: 'n5_part1',
    label: 'N5 單元 1・日常基礎動詞與名詞',
    level: 'N5',
    description: '高頻生活飲食、移動、購物基礎單字',
    entries: N5_PART_1,
  },
  {
    id: 'n5_part2',
    label: 'N5 單元 2・形容詞與時間場所',
    level: 'N5',
    description: '常用い形容詞、な形容詞、副詞與空間名詞',
    entries: N5_PART_2,
  },
  {
    id: 'n5_part3',
    label: 'N5 單元 3・代名詞・接續詞與寒暄',
    level: 'N5',
    description: '指示詞、數量疑問、常用禮貌表現',
    entries: N5_PART_3,
  },
  {
    id: 'n5_part4',
    label: 'N5 單元 4・家庭人物與日常名詞',
    level: 'N5',
    description: '擴充批次 1：家人稱謂、公共場所與日常用品',
    entries: N5_PART_4,
  },
  {
    id: 'n5_part5',
    label: 'N5 單元 5・基礎動作與生活動詞',
    level: 'N5',
    description: '擴充批次 1：開關、移動、借還與生活核心動詞',
    entries: N5_PART_5,
  },
  {
    id: 'n4_part1',
    label: 'N4 單元 1・進階生活動詞與交流',
    level: 'N4',
    description: '職場、學校、溝通與日常動作進階詞彙',
    entries: N4_PART_1,
  },
  {
    id: 'n4_part2',
    label: 'N4 單元 2・感受狀態與副詞表現',
    level: 'N4',
    description: '心情描述、程度副詞與生活情境名詞',
    entries: N4_PART_2,
  },
  {
    id: 'n4_part3',
    label: 'N4 單元 3・接續・職場寒暄與表現',
    level: 'N4',
    description: '連體詞、時間長度與道地對話表現',
    entries: N4_PART_3,
  },
  {
    id: 'n4_part4',
    label: 'N4 單元 4・日常事務與思考動詞',
    level: 'N4',
    description: '擴充批次 1：溝通確認、自他動詞與人際互動動詞',
    entries: N4_PART_4,
  },
  {
    id: 'n4_part5',
    label: 'N4 單元 5・生活環境與狀態形容',
    level: 'N4',
    description: '擴充批次 1：社會場所名詞與情緒狀態形容詞',
    entries: N4_PART_5,
  },
];

export const VOCAB_BATCHES: Record<string, VocabEntry[]> = Object.fromEntries(
  VOCAB_UNITS.map((unit) => [unit.id, unit.entries])
);

export const VOCAB_UNIT_BY_ID: Record<string, VocabUnitMeta> = Object.fromEntries(
  VOCAB_UNITS.map((unit) => [unit.id, unit])
);

export const ALL_VOCAB: VocabEntry[] = VOCAB_UNITS.flatMap((unit) => unit.entries);

export const VOCAB_BY_ID: Record<string, VocabEntry> = Object.fromEntries(
  ALL_VOCAB.map((item) => [item.id, item])
);

export const VOCAB_BY_KANJI: Record<string, VocabEntry> = Object.fromEntries(
  ALL_VOCAB.map((item) => [item.kanji, item])
);

export function getUnitsForLevel(levelFilter: LevelFilter): VocabUnitMeta[] {
  if (levelFilter === 'ALL') return VOCAB_UNITS;
  return VOCAB_UNITS.filter((unit) => unit.level === levelFilter);
}

export function getFilteredVocab(
  levelFilter: LevelFilter,
  unitFilter: string = 'ALL',
  posFilter: PosFilter = 'ALL'
): VocabEntry[] {
  let pool: VocabEntry[];
  if (unitFilter !== 'ALL' && VOCAB_UNIT_BY_ID[unitFilter]) {
    const unit = VOCAB_UNIT_BY_ID[unitFilter];
    pool = levelFilter === 'ALL' || unit.level === levelFilter ? unit.entries : [];
  } else {
    pool = levelFilter === 'ALL' ? ALL_VOCAB : ALL_VOCAB.filter((entry) => entry.level === levelFilter);
  }

  if (posFilter !== 'ALL') {
    pool = pool.filter((entry) => entry.pos === posFilter);
  }
  return pool;
}

export function getVocabCounts() {
  const n5 = ALL_VOCAB.filter((v) => v.level === 'N5').length;
  const n4 = ALL_VOCAB.filter((v) => v.level === 'N4').length;
  return { n5, n4, total: ALL_VOCAB.length };
}
