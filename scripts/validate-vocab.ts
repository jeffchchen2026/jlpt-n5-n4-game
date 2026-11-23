import { getBlankWordKana, resolveClozeOptionInfo } from '../src/data/clozeGlossary';
import { ALL_PARTS_OF_SPEECH } from '../src/data/types';
import { ALL_VOCAB, VOCAB_BY_KANJI, VOCAB_UNITS } from '../src/data/vocab';

const ALLOWED_POS = new Set<string>(ALL_PARTS_OF_SPEECH);
const ALLOWED_SITUATIONS = new Set<string>(['購物', '餐廳', '問路', '日常寒暄', '學校・職場']);
const KANJI_REGEX = /[\u4E00-\u9FFF々]/;

const errors: string[] = [];
const seenIds = new Set<string>();
const posCounts: Record<string, number> = {};

function fail(context: string, message: string) {
  errors.push(`[${context}] ${message}`);
}

for (const unit of VOCAB_UNITS) {
  if (!unit.id.trim() || !unit.label.trim()) {
    fail(unit.id || 'UNKNOWN_UNIT', '單元 id 或 label 不可為空');
  }

  for (const entry of unit.entries) {
    const ctx = `${unit.id} / ${entry.id || 'NO_ID'} (${entry.kanji || '?'})`;

    if (!entry.id || !entry.id.trim()) {
      fail(ctx, '缺少單字 id');
    } else if (seenIds.has(entry.id)) {
      fail(ctx, `單字 id 重複：${entry.id}`);
    } else {
      seenIds.add(entry.id);
    }

    if (entry.level !== unit.level) {
      fail(ctx, `單字 level (${entry.level}) 與所屬單元 (${unit.level}) 不一致`);
    }

    if (!ALLOWED_POS.has(entry.pos)) {
      fail(ctx, `不支援的詞性 pos="${entry.pos}"`);
    } else {
      posCounts[entry.pos] = (posCounts[entry.pos] || 0) + 1;
    }

    if (!entry.kanji.trim() || !entry.kana.trim() || !entry.meaning.trim() || !entry.usageNote.trim()) {
      fail(ctx, 'kanji、kana、meaning 或 usageNote 不可為空');
    }

    if (!Array.isArray(entry.examples) || entry.examples.length === 0) {
      fail(ctx, '至少需包含 1 句例句');
    } else {
      entry.examples.forEach((ex, idx) => {
        const exCtx = `${ctx} 例句#${idx + 1}`;
        if (!ex.japanese.trim() || !ex.kana.trim() || !ex.translation.trim()) {
          fail(exCtx, '例句日文、假名或中文翻譯不可為空');
        }

        const { before, blankWord, after, kanaBefore, kanaAfter, distractors } = ex.cloze;
        if (`${before}${blankWord}${after}` !== ex.japanese) {
          fail(
            exCtx,
            `cloze 前後段與目標詞合併後與例句不一致：expected="${ex.japanese}", got="${before}${blankWord}${after}"`
          );
        }
        if (!blankWord.trim()) {
          fail(exCtx, 'cloze.blankWord 不可為空');
        }
        if (typeof kanaBefore !== 'string' || typeof kanaAfter !== 'string') {
          fail(exCtx, 'cloze.kanaBefore / kanaAfter 必須為字串');
        } else {
          if (!ex.kana.startsWith(kanaBefore)) {
            fail(exCtx, `example.kana 未以 kanaBefore 開頭："${kanaBefore}" vs "${ex.kana}"`);
          }
          if (!ex.kana.endsWith(kanaAfter)) {
            fail(exCtx, `example.kana 未以 kanaAfter 結尾："${kanaAfter}" vs "${ex.kana}"`);
          }
          if (kanaBefore.length + kanaAfter.length >= ex.kana.length) {
            fail(exCtx, `kanaBefore + kanaAfter 長度大於等於整句假名，目標字假名未留空`);
          }
        }

        if (!Array.isArray(distractors) || distractors.length !== 3) {
          fail(exCtx, 'cloze.distractors 必須剛好有 3 個干擾選項');
        } else {
          const optSet = new Set([blankWord, ...distractors]);
          if (optSet.size !== 4) {
            fail(exCtx, `cloze 選項重複（含正確答案應有 4 個相異選項）：[${[blankWord, ...distractors].join(', ')}]`);
          }
          const blankKana = getBlankWordKana(ex);
          const resolved = [
            { surface: blankWord, kana: blankKana, meaning: entry.meaning },
            ...distractors.map((d) => resolveClozeOptionInfo(d, VOCAB_BY_KANJI)),
          ];
          for (const opt of resolved) {
            if (KANJI_REGEX.test(opt.kana)) {
              fail(exCtx, `cloze 選項「${opt.surface}」未轉換為純假名（仍含漢字：${opt.kana}）`);
            }
            if (opt.meaning === '干擾選項') {
              fail(exCtx, `cloze 選項「${opt.surface}」缺少 clozeGlossary 簡短說明`);
            }
          }
          const kanaSet = new Set(resolved.map((r) => r.kana));
          if (kanaSet.size !== 4) {
            fail(exCtx, `cloze 選項轉為假名後出現同音重複：[${resolved.map((r) => r.kana).join(', ')}]`);
          }
        }

        const { chunks, grammarTip } = ex.scramble;
        if (!Array.isArray(chunks) || chunks.length < 2) {
          fail(exCtx, 'scramble.chunks 至少需有 2 個以上詞塊');
        } else {
          const joined = chunks.join('').replace(/\s+/g, '');
          const target = ex.japanese.replace(/\s+/g, '');
          if (joined !== target) {
            fail(exCtx, `scramble.chunks 合併後與例句不一致："${joined}" vs "${target}"`);
          }
        }
        if (!grammarTip.trim()) {
          fail(exCtx, 'scramble.grammarTip 不可為空');
        }
      });
    }

    const dlg = entry.dialogue;
    if (!dlg) {
      fail(ctx, '缺少 dialogue 情境二選一資料');
    } else {
      if (!ALLOWED_SITUATIONS.has(dlg.situation)) {
        fail(ctx, `不支援的對話情境 situation="${dlg.situation}"`);
      }
      if (!dlg.sceneDescription.trim() || !dlg.promptJa.trim() || !dlg.promptKana.trim() || !dlg.promptZh.trim() || !dlg.politenessNote.trim()) {
        fail(ctx, 'dialogue 情境描述、對方話語或禮貌說明不可為空');
      }
      if (!dlg.correctOption.ja.trim() || !dlg.correctOption.kana.trim() || !dlg.correctOption.zh.trim()) {
        fail(ctx, 'dialogue.correctOption 不可為空');
      }
      if (!dlg.wrongOption.ja.trim() || !dlg.wrongOption.kana.trim() || !dlg.wrongOption.zh.trim()) {
        fail(ctx, 'dialogue.wrongOption 不可為空');
      }
      if (dlg.correctOption.ja === dlg.wrongOption.ja) {
        fail(ctx, 'dialogue 正確與錯誤選項不可完全相同');
      }
    }
  }
}

console.log('=== JLPT N5/N4 單字題庫自動驗證報告 ===');
for (const unit of VOCAB_UNITS) {
  console.log(`- ${unit.id} (${unit.level}): ${unit.entries.length} 字｜${unit.label}`);
}
const n5Total = ALL_VOCAB.filter((v) => v.level === 'N5').length;
const n4Total = ALL_VOCAB.filter((v) => v.level === 'N4').length;
console.log(`\n總計：${ALL_VOCAB.length} 字（N5: ${n5Total} 字 / N4: ${n4Total} 字）`);
console.log('詞性分佈：', posCounts);

if (errors.length > 0) {
  console.error(`\n❌ 發現 ${errors.length} 個資料格式錯誤：`);
  for (const err of errors) {
    console.error(`  - ${err}`);
  }
  process.exit(1);
} else {
  console.log('\n✅ 全部單字、例句挖空、假名拆段、句子重組與對話資料驗證通過！');
}
