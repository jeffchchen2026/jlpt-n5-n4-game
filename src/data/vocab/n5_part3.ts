import { VocabEntry } from '../types';

/**
 * 擴充示範批次（N5 單元 3）：涵蓋代名詞、接續詞、數量詞、寒暄語與常用表現
 * 後續可依相同格式新增 n5_part4.ts、n5_part5.ts 並註冊於 src/data/vocab/index.ts
 */
export const N5_PART_3: VocabEntry[] = [
  {
    id: 'n5-053',
    level: 'N5',
    kanji: 'この',
    kana: 'この',
    meaning: '這個（後接名詞）',
    pos: '連體・代名詞',
    usageNote: '指示離說話者較近的事物，後面必須直接加名詞（如「この本」）；若單獨使用不加名詞則用「これ」。',
    examples: [
      {
        japanese: 'この本はとても面白いです。',
        kana: 'このほんはとてもおもしろいです。',
        translation: '這本書非常有趣。',
        cloze: {
          before: '',
          blankWord: 'この',
          after: '本はとても面白いです。',
          kanaBefore: '',
          kanaAfter: 'ほんはとてもおもしろいです。',
          distractors: ['これ', 'ここ', 'どれ'],
        },
        scramble: {
          chunks: ['この', '本は', 'とても', '面白いです', '。'],
          grammarTip: '「この＋名詞」用來限定特定事物，不可像「これ」一樣直接接助詞「は」。',
        },
      },
    ],
    dialogue: {
      situation: '購物',
      sceneDescription: '你在書店挑中一本書，想向店員詢問這本書的價格。',
      promptJa: 'どれをお探しですか。',
      promptKana: 'どれをおさがしですか。',
      promptZh: '您在找哪一本呢？',
      correctOption: {
        ja: 'この本はいくらですか。',
        kana: 'このほんはいくらですか。',
        zh: '請問這本書多少錢？',
      },
      wrongOption: {
        ja: 'これ本はいくらですか。',
        kana: 'これほんはいくらですか。',
        zh: '（文法錯誤，これ後面不能直接接名詞）',
      },
      politenessNote: '購物指著商品詢問時，「この＋名詞」是最標準自然的禮貌表達。',
    },
  },
  {
    id: 'n5-054',
    level: 'N5',
    kanji: 'それから',
    kana: 'それから',
    meaning: '然後、接著；還有',
    pos: '接續詞',
    usageNote: '放在第二句開頭，用來連接先後順序的動作，或補充列舉其他項目。',
    examples: [
      {
        japanese: '朝ごはんを食べます。それから学校へ行きます。',
        kana: 'あさごはんをたべます。それからがっこうへいきます。',
        translation: '吃早餐。然後去學校。',
        cloze: {
          before: '朝ごはんを食べます。',
          blankWord: 'それから',
          after: '学校へ行きます。',
          kanaBefore: 'あさごはんをたべます。',
          kanaAfter: 'がっこうへいきます。',
          distractors: ['しかし', 'でも', 'だから'],
        },
        scramble: {
          chunks: ['朝ごはんを', '食べます。', 'それから', '学校へ', '行きます。'],
          grammarTip: '「A。それから B。」清楚表示完成 A 之後接著做 B。',
        },
      },
    ],
    dialogue: {
      situation: '日常寒暄',
      sceneDescription: '朋友問你今天下課後有什麼安排。',
      promptJa: '今日、授業のあとは何をしますか。',
      promptKana: 'きょう、じゅぎょうのあとはなにをしますか。',
      promptZh: '今天下課後要做什麼呢？',
      correctOption: {
        ja: '図書館へ行きます。それから買い物します。',
        kana: 'としょかんへいきます。それからかいものします。',
        zh: '先去圖書館。然後去買東西。',
      },
      wrongOption: {
        ja: '図書館へ行きます。でも買い物します。',
        kana: 'としょかんへいきます。でもかいものします。',
        zh: '去圖書館。但是買東西。（語意轉折不自然）',
      },
      politenessNote: '用「それから」串接兩個行程，在日常對話中簡潔又自然。',
    },
  },
  {
    id: 'n5-055',
    level: 'N5',
    kanji: 'いくつ',
    kana: 'いくつ',
    meaning: '幾個；幾歲',
    pos: '數量・時間',
    usageNote: '詢問小物品數量（對應一つ、二つ…），或禮貌地詢問年齡（通常會加お變成「おいくつ」）。',
    examples: [
      {
        japanese: 'りんごをいくつ買いましたか。',
        kana: 'りんごをいくつかいましたか。',
        translation: '你買了幾個蘋果？',
        cloze: {
          before: 'りんごを',
          blankWord: 'いくつ',
          after: '買いましたか。',
          kanaBefore: 'りんごを',
          kanaAfter: 'かいましたか。',
          distractors: ['いくら', 'いつ', 'どこ'],
        },
        scramble: {
          chunks: ['りんごを', 'いくつ', '買いましたか', '。'],
          grammarTip: '「名詞＋を＋數量疑問詞＋動詞」用來詢問購買或持有的數量，疑問詞前不加助詞。',
        },
      },
    ],
    dialogue: {
      situation: '餐廳',
      sceneDescription: '你在麵包店選購可頌麵包，店員詢問你要買幾個。',
      promptJa: 'パンはいくついりますか。',
      promptKana: 'パンはいくついりますか。',
      promptZh: '請問麵包需要幾個呢？',
      correctOption: {
        ja: '二つください。',
        kana: 'ふたつください。',
        zh: '請給我兩個。',
      },
      wrongOption: {
        ja: '二時間ください。',
        kana: 'にじかんください。',
        zh: '請給我兩小時。（單位錯誤）',
      },
      politenessNote: '被問到「いくつ」時，使用和語數量詞「一つ、二つ、三つ…」回答最道地。',
    },
  },
  {
    id: 'n5-056',
    level: 'N5',
    kanji: 'すみません',
    kana: 'すみません',
    meaning: '不好意思、對不起、請問',
    pos: '寒暄・感嘆',
    usageNote: '萬用禮貌語：向陌生人搭話問路、在餐廳呼叫店員、輕微道歉或表達感謝時皆可使用。',
    examples: [
      {
        japanese: 'すみません、駅はどこですか。',
        kana: 'すみません、えきはどこですか。',
        translation: '不好意思，請問車站在哪裡？',
        cloze: {
          before: '',
          blankWord: 'すみません',
          after: '、駅はどこですか。',
          kanaBefore: '',
          kanaAfter: '、えきはどこですか。',
          distractors: ['おはよう', 'さようなら', 'おめでとう'],
        },
        scramble: {
          chunks: ['すみません、', '駅は', 'どこ', 'ですか', '。'],
          grammarTip: '問路開頭先說「すみません，」能禮貌吸引對方注意。',
        },
      },
    ],
    dialogue: {
      situation: '問路',
      sceneDescription: '你在街上想向路人詢問最近的洗手間在哪裡。',
      promptJa: '（你想叫住前面的路人問路）',
      promptKana: '（きょりをちぢめてきく）',
      promptZh: '（準備禮貌地向路人開口詢問）',
      correctOption: {
        ja: 'すみません、トイレはどこですか。',
        kana: 'すみません、トイレはどこですか。',
        zh: '不好意思，請問洗手間在哪裡？',
      },
      wrongOption: {
        ja: 'さようなら、トイレはどこですか。',
        kana: 'さようなら、トイレはどこですか。',
        zh: '再見，洗手間在哪裡？（問候語誤用）',
      },
      politenessNote: '向不認識的人開口時先說「すみません」，是日本日常生活中最基本也最得體的禮儀。',
    },
  },
  {
    id: 'n5-057',
    level: 'N5',
    kanji: 'お願いします',
    kana: 'おねがいします',
    meaning: '拜託您了、麻煩您',
    pos: '表現',
    usageNote: '在餐廳點餐、請別人幫忙或遞交文件時使用的禮貌請求語，比「ください」多一分客氣。',
    examples: [
      {
        japanese: 'お水を一つお願いします。',
        kana: 'おみずをひとつおねがいします。',
        translation: '麻煩請給我一杯水。',
        cloze: {
          before: 'お水を一つ',
          blankWord: 'お願いします',
          after: '。',
          kanaBefore: 'おみずをひとつ',
          kanaAfter: '。',
          distractors: ['いただきます', 'ごちそうさま', 'はじめまして'],
        },
        scramble: {
          chunks: ['お水を', '一つ', 'お願いします', '。'],
          grammarTip: '「名詞＋を＋お願いします」是點餐或拜託服務人員時最實用的固定句型。',
        },
      },
    ],
    dialogue: {
      situation: '餐廳',
      sceneDescription: '進入餐廳就坐後，店員拿著菜單過來幫你點餐。',
      promptJa: 'ご注文はお決まりですか。',
      promptKana: 'ごちゅうもんはおきまりですか。',
      promptZh: '請問決定好要點什麼了嗎？',
      correctOption: {
        ja: 'はい、コーヒーをお願いします。',
        kana: 'はい、コーヒーをおねがいします。',
        zh: '好的，麻煩一杯咖啡。',
      },
      wrongOption: {
        ja: 'はい、コーヒーをごちそうさま。',
        kana: 'はい、コーヒーをごちそうさま。',
        zh: '好的，咖啡謝謝款待。（餐後才說的語句）',
      },
      politenessNote: '點餐結尾加上「お願いします」語氣柔和禮貌，適用於各種店家與服務場合。',
    },
  },
];
