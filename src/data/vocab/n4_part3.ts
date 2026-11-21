import { VocabEntry } from '../types';

/**
 * 擴充示範批次（N4 單元 3）：涵蓋代名詞、接續詞、數量時間、寒暄語與常用表現
 * 後續可依相同格式新增 n4_part4.ts、n4_part5.ts 並註冊於 src/data/vocab/index.ts
 */
export const N4_PART_3: VocabEntry[] = [
  {
    id: 'n4-053',
    level: 'N4',
    kanji: 'そんな',
    kana: 'そんな',
    meaning: '那樣的、那種',
    pos: '連體・代名詞',
    usageNote: '後接名詞，用來承接對方剛才提到的內容或眼前的狀況，常帶有「不需要做到那種程度」的語氣。',
    examples: [
      {
        japanese: 'そんなことは心配しなくてもいいです。',
        kana: 'そんなことはしんぱいしなくてもいいです。',
        translation: '那種事情不用擔心沒關係。',
        cloze: {
          before: '',
          blankWord: 'そんな',
          after: 'ことは心配しなくてもいいです。',
          kanaBefore: '',
          kanaAfter: 'ことはしんぱいしなくてもいいです。',
          distractors: ['どんな', 'そう', 'あんな'],
        },
        scramble: {
          chunks: ['そんな', 'ことは', '心配しなくても', 'いいです', '。'],
          grammarTip: '「そんな＋名詞」指代對方剛說過的事；「～なくてもいいです」表示「不需要…也沒關係」。',
        },
      },
    ],
    dialogue: {
      situation: '日常寒暄',
      sceneDescription: '朋友擔心日文考試太難而感到緊張，你安慰對方。',
      promptJa: 'テストに落ちたらどうしよう…。',
      promptKana: 'テストにおちたらどうしよう…。',
      promptZh: '考試沒過的話怎麼辦…。',
      correctOption: {
        ja: 'そんなこと、心配しなくても大丈夫ですよ。',
        kana: 'そんなこと、しんぱいしなくてもだいじょうぶですよ。',
        zh: '那種事不用擔心，沒問題的啦。',
      },
      wrongOption: {
        ja: 'どんなこと、心配しなくても大丈夫ですよ。',
        kana: 'どんなこと、しんぱいしなくてもだいじょうぶですよ。',
        zh: '什麼樣的事不用擔心，沒問題的啦。（疑問詞誤用）',
      },
      politenessNote: '承接對方的發言並加以安撫時，「そんなこと」比直接說「それ」更有共鳴感。',
    },
  },
  {
    id: 'n4-054',
    level: 'N4',
    kanji: 'それに',
    kana: 'それに',
    meaning: '而且、再加上',
    pos: '接續詞',
    usageNote: '在原本的理由或特徵上「再追加同一方向的優點或資訊」時使用。',
    examples: [
      {
        japanese: 'この店は安いです。それに美味しいです。',
        kana: 'このみせはやすいです。それにおいしいです。',
        translation: '這家店很便宜。而且很好吃。',
        cloze: {
          before: 'この店は安いです。',
          blankWord: 'それに',
          after: '美味しいです。',
          kanaBefore: 'このみせはやすいです。',
          kanaAfter: 'おいしいです。',
          distractors: ['けれど', 'それで', 'または'],
        },
        scramble: {
          chunks: ['この店は', '安いです。', 'それに', '美味しいです', '。'],
          grammarTip: '「A。それに B。」用來疊加同向評價（正面＋正面，或負面＋負面）。',
        },
      },
    ],
    dialogue: {
      situation: '餐廳',
      sceneDescription: '同事問你為什麼常來這間餐廳吃午餐。',
      promptJa: 'よくこのレストランに来ますね。',
      promptKana: 'よくこのレストランにきますね。',
      promptZh: '你很常來這家餐廳呢。',
      correctOption: {
        ja: 'ええ、ここは安いです。それに駅からも近いですから。',
        kana: 'ええ、ここはやすいです。それにえきからも近いですから。',
        zh: '是啊，這裡很便宜，而且離車站又近。',
      },
      wrongOption: {
        ja: 'ええ、ここは安いです。けれど駅からも近いですから。',
        kana: 'ええ、ここはやすいです。けれどえきからも近いですから。',
        zh: '是啊，這裡很便宜，但是離車站很近。（兩個優點不應用轉折詞けれど）',
      },
      politenessNote: '說明推薦理由時，用「それに」補充第二個優點，聽起來很有說服力。',
    },
  },
  {
    id: 'n4-055',
    level: 'N4',
    kanji: '一時間ぐらい',
    kana: 'いちじかんぐらい',
    meaning: '大約一小時',
    pos: '數量・時間',
    usageNote: '「時間・數量＋ぐらい／くらい」表示大約的長度或數量。用於大約時間長度時不說「一時ぐらい」（那是「大約一點鐘」）。',
    examples: [
      {
        japanese: '家から会社まで一時間ぐらいかかります。',
        kana: 'いえからかいしゃまでいちじかんぐらいかかります。',
        translation: '從家裡到公司大概要花一小時。',
        cloze: {
          before: '家から会社まで',
          blankWord: '一時間ぐらい',
          after: 'かかります。',
          kanaBefore: 'いえからかいしゃまで',
          kanaAfter: 'かかります。',
          distractors: ['一週間に', '何日も', '十分だけ'],
        },
        scramble: {
          chunks: ['家から', '会社まで', '一時間ぐらい', 'かかります', '。'],
          grammarTip: '「時間長度＋ぐらい＋かかります」表示大約花費多少時間。',
        },
      },
    ],
    dialogue: {
      situation: '問路',
      sceneDescription: '你在車站詢問站務人員搭電車到機場大概要花多久。',
      promptJa: '空港まではどのぐらいかかりますか。',
      promptKana: 'くうこうまではどのぐらいかかりますか。',
      promptZh: '到機場大概要花多久呢？',
      correctOption: {
        ja: '急行で一時間ぐらいかかります。',
        kana: 'きゅうこうでいちじかんぐらいかかります。',
        zh: '搭急行車大概要花一小時左右。',
      },
      wrongOption: {
        ja: '急行で一時ぐらいかかります。',
        kana: 'きゅうこうでいちじぐらいかかります。',
        zh: '搭急行車大概花一點鐘。（時間點與時間長度混淆）',
      },
      politenessNote: '區分「時間點（一時）」與「時間長度（一時間）」是 N5/N4 最重要的時間表達基礎。',
    },
  },
  {
    id: 'n4-056',
    level: 'N4',
    kanji: 'お先に失礼します',
    kana: 'おさきにしつれいします',
    meaning: '我先告辭了、我先走了',
    pos: '寒暄・感嘆',
    usageNote: '日本職場或學校社團下班／離開時，對還在場的同事與前輩說的禮貌寒暄語。',
    examples: [
      {
        japanese: '今日は仕事が終わったので、お先に失礼します。',
        kana: 'きょうはしごとがおわったので、おさきにしつれいします。',
        translation: '今天工作結束了，我先告辭了。',
        cloze: {
          before: '今日は仕事が終わったので、',
          blankWord: 'お先に失礼します',
          after: '。',
          kanaBefore: 'きょうはしごとがおわったので、',
          kanaAfter: '。',
          distractors: ['お帰りなさい', 'お邪魔します', 'いらっしゃいませ'],
        },
        scramble: {
          chunks: ['今日は', '仕事が', '終わったので、', 'お先に失礼します', '。'],
          grammarTip: '「～ので」表示客觀禮貌的原因說明，適合職場請假或下班告知。',
        },
      },
    ],
    dialogue: {
      situation: '學校・職場',
      sceneDescription: '你的工作已經完成，準備下班離開辦公室，同事還在座位上。',
      promptJa: 'あ、もう帰りますか。',
      promptKana: 'あ、もうかえりますか。',
      promptZh: '啊，要回去了嗎？',
      correctOption: {
        ja: 'はい、お先に失礼します。お疲れ様でした。',
        kana: 'はい、おさきにしつれいします。おつかれさまでした。',
        zh: '是的，我先告辭了，您辛苦了。',
      },
      wrongOption: {
        ja: 'はい、お邪魔します。お疲れ様でした。',
        kana: 'はい、おじゃまします。おつかれさまでした。',
        zh: '是的，打擾了，您辛苦了。（お邪魔します是進門拜訪時說的）',
      },
      politenessNote: '下班離開時搭配「お先に失礼します」與「お疲れ様でした」是日本職場的基本禮節。',
    },
  },
  {
    id: 'n4-057',
    level: 'N4',
    kanji: 'ちょうどいい',
    kana: 'ちょうどいい',
    meaning: '剛剛好、正合適',
    pos: '表現',
    usageNote: '形容衣服尺寸、溫度、時間或份量「不多不少正合適」，禮貌體為「ちょうどいいです」。',
    examples: [
      {
        japanese: 'この靴のサイズがちょうどいいです。',
        kana: 'このくつのサイズがちょうどいいです。',
        translation: '這雙鞋子的尺寸剛剛好。',
        cloze: {
          before: 'この靴のサイズが',
          blankWord: 'ちょうどいい',
          after: 'です。',
          kanaBefore: 'このくつのサイズが',
          kanaAfter: 'です。',
          distractors: ['もったいない', 'しかたがない', 'だいじょうぶ'],
        },
        scramble: {
          chunks: ['この靴の', 'サイズが', 'ちょうどいい', 'です', '。'],
          grammarTip: '「主語＋が＋ちょうどいいです」用來評價尺寸、溫度或時間正合適。',
        },
      },
    ],
    dialogue: {
      situation: '購物',
      sceneDescription: '你在服飾店試穿外套，店員問你尺寸合不合身。',
      promptJa: 'サイズはいかがですか。',
      promptKana: 'サイズはいかがですか。',
      promptZh: '請問尺寸如何呢？',
      correctOption: {
        ja: 'はい、ちょうどいいです。これを買います。',
        kana: 'はい、ちょうどいいです。これをかいます。',
        zh: '是的，剛剛好。我要買這件。',
      },
      wrongOption: {
        ja: 'はい、もったいないです。これを買います。',
        kana: 'はい、もったいないです。これをかいます。',
        zh: '是的，好浪費。我要買這件。（語意不合）',
      },
      politenessNote: '試穿或試用後表達「很合適」時，用「ちょうどいいです」比單說「いいです」更精準自然。',
    },
  },
];
