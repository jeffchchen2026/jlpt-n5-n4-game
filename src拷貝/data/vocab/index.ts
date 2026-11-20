import { LevelFilter, VocabEntry } from '../types';
import { N4_PART_1 } from './n4_part1';
import { N4_PART_2 } from './n4_part2';
import { N5_PART_1 } from './n5_part1';
import { N5_PART_2 } from './n5_part2';

/**
 * 模組化單字批次註冊表：
 * 未來欲擴充更多 N5 / N4 單字時，只需新增批次檔案（如 n5_part3.ts）
 * 並匯入加入此陣列即可自動納入題庫、發音、錯題本與統計系統。
 */
export const VOCAB_BATCHES: Record<string, VocabEntry[]> = {
  n5_part1: N5_PART_1,
  n5_part2: N5_PART_2,
  n4_part1: N4_PART_1,
  n4_part2: N4_PART_2,
};

export const ALL_VOCAB: VocabEntry[] = Object.values(VOCAB_BATCHES).flat();

export const VOCAB_BY_ID: Record<string, VocabEntry> = Object.fromEntries(
  ALL_VOCAB.map((item) => [item.id, item])
);

export function getFilteredVocab(filter: LevelFilter): VocabEntry[] {
  if (filter === 'ALL') return ALL_VOCAB;
  return ALL_VOCAB.filter((entry) => entry.level === filter);
}

export function getVocabCounts() {
  const n5 = ALL_VOCAB.filter((v) => v.level === 'N5').length;
  const n4 = ALL_VOCAB.filter((v) => v.level === 'N4').length;
  return { n5, n4, total: ALL_VOCAB.length };
}
