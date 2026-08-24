// ============================================================
// 语灵文明 · 战斗题库与数值调优常量
// 数值 rationale 见 docs/battle-tuning.md，改动前先读文档。
// 所有未经 playtest 的数值均为 [PLACEHOLDER · 附假设与验证路径]。
// ============================================================

export type QuestionType = 'root' | 'meaning' | 'context';

export type WordQuestion = {
  id: string;
  type: QuestionType;
  word: string;
  prompt: string;
  choices: string[];
  answer: string;
  /** 难度 1=基础 2=进阶 3=高难，参与伤害公式 */
  difficulty: 1 | 2 | 3;
};

// ------------------------------------------------------------
// 数值调优常量（唯一事实来源，页面不许写魔法数字）
// ------------------------------------------------------------
export const TUNING = {
  /** 双方满血。100 便于玩家心算血条百分比 */
  HP_MAX: 100,
  /** 伤害公式基数。×各题型系数后得到 d1 难度的基准伤害 */
  BASE_DAMAGE: 40,
  /**
   * 题型系数 = 该题型「认知检索难度 × 教学价值」的乘积：
   * - meaning 1.05：纯词义回忆，无任何线索支持，最难 → 伤害最高（烬尾爆发位）
   * - root 0.70：前缀/词根是有限封闭集合，有脚手架 → 伤害最低但带护盾（芽语稳健位）
   * - context 0.75：句子语境提供提取线索，略易 → 伤害中低但带治疗（澜歌续航位）
   */
  TYPE_COEFF: { root: 0.7, meaning: 1.05, context: 0.75 } as const,
  /** 每提升 1 级难度，伤害 +10%：让高难题「值得冒险」 */
  DIFFICULTY_STEP: 0.1,
  /** 芽语答对词根题的护盾回复 */
  SHIELD_HEAL: 6,
  /** 澜歌答对语境题的治疗回复 */
  CONTEXT_HEAL: 14,
  /** 敌方基础伤害。敌方不用答题，故数值必须低于玩家期望 DPS */
  ENEMY_HIT_BASE: 12,
  /** 敌方每回合伤害递增：制造回合压力，逼玩家在治疗与爆发间做决策 */
  ENEMY_HIT_RAMP: 2,
  /**
   * 错词回炉：抽题时若错词本中有同题型词，按此概率优先重现。
   * 0.45 的意图：错词出现频率约两倍于普通题，但不淹没新词——
   * 复习与新学大致 1:1.2，符合「学习循环里复习占一半」的预期。
   */
  WRONG_REDRAW_CHANCE: 0.45,
  /** 连续答对 N 次即「毕业」移出错词本（轻量间隔重复的掌握判据） */
  MASTERY_STREAK: 2,
} as const;

export type WrongWordEntry = {
  word: string;
  prompt: string;
  answer: string;
  type: QuestionType;
};

export type BattleReport = {
  /** 可分享的短 ID，小程序分享卡片直接复用 */
  id: string;
  timestamp: number;
  mode: 'stage' | 'arena';
  opponent: string;
  result: 'win' | 'lose';
  /** 战斗结束时的回合数 */
  rounds: number;
  answers: { total: number; correct: number };
  /** 百分比整数，0-100 */
  accuracy: number;
  allyHp: number;
  enemyHp: number;
  skillsUsed: { root: number; meaning: number; context: number };
  /** 本场答错的词（去重），结算时生成复习卡 */
  wrongWords: WrongWordEntry[];
};

// ------------------------------------------------------------
// 错词本（SRS-lite）：localStorage 持久化，跨战斗记忆
// 答错 → 入本；连续答对 MASTERY_STREAK 次 → 毕业（移出）
// ------------------------------------------------------------
const BOOK_KEY = 'word-spirit-wrong-book-v1';

type WrongRecord = { streak: number; wrongCount: number };

function loadBook(): Record<string, WrongRecord> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(BOOK_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveBook(book: Record<string, WrongRecord>) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(BOOK_KEY, JSON.stringify(book));
  } catch {
    /* 存储满或被禁用时静默降级：本局内仍生效（内存态） */
  }
}

/** 该题是否在错词本中（用于 UI 显示「错词回响」标记） */
export function isInWrongBook(id: string): boolean {
  return Boolean(loadBook()[id]);
}

/** 结算一次答题：答错入本并清空连对，答对连对+1，达 MASTERY_STREAK 毕业 */
export function recordAnswer(q: WordQuestion, correct: boolean): void {
  const book = loadBook();
  const rec = book[q.id];
  if (!correct) {
    book[q.id] = { streak: 0, wrongCount: (rec?.wrongCount ?? 0) + 1 };
  } else if (rec) {
    rec.streak += 1;
    if (rec.streak >= TUNING.MASTERY_STREAK) delete book[q.id];
    else book[q.id] = rec;
  }
  saveBook(book);
}

// ------------------------------------------------------------
// 题库：三类题型 × 24 题，考研核心词汇
// root = 词根/前缀辨析（芽语）
// meaning = 词义选择（烬尾）
// context = 语境填空·形近词（澜歌）
// ------------------------------------------------------------
export const WORD_BANK: WordQuestion[] = [
  // ---------- 词根辨析（芽语 · 词根护盾） ----------
  { id: 'root-re', type: 'root', word: 'reconstruct', prompt: '前缀 re- 在 reconstruct 中表示？', choices: ['再次', '否定', '向下'], answer: '再次', difficulty: 1 },
  { id: 'root-un', type: 'root', word: 'unfair', prompt: '前缀 un- 在 unfair 中表示？', choices: ['否定', '加强', '重复'], answer: '否定', difficulty: 1 },
  { id: 'root-dis', type: 'root', word: 'disappear', prompt: '前缀 dis- 在 disappear 中表示？', choices: ['分离/否定', '向内', '提前'], answer: '分离/否定', difficulty: 1 },
  { id: 'root-pre', type: 'root', word: 'preview', prompt: '前缀 pre- 在 preview 中表示？', choices: ['预先', '之后', '共同'], answer: '预先', difficulty: 1 },
  { id: 'root-mis', type: 'root', word: 'misunderstand', prompt: '前缀 mis- 在 misunderstand 中表示？', choices: ['错误', '正确', '过度'], answer: '错误', difficulty: 1 },
  { id: 'root-ex', type: 'root', word: 'export', prompt: '前缀 ex- 在 export 中表示？', choices: ['向外', '向内', '向上'], answer: '向外', difficulty: 1 },
  { id: 'root-in', type: 'root', word: 'import', prompt: '前缀 im- 在 import 中表示？', choices: ['向内', '周围', '相反'], answer: '向内', difficulty: 1 },
  { id: 'root-inter', type: 'root', word: 'international', prompt: '前缀 inter- 在 international 中表示？', choices: ['之间/相互', '之上', '之下'], answer: '之间/相互', difficulty: 2 },
  { id: 'root-sub', type: 'root', word: 'subway', prompt: '前缀 sub- 在 subway 中表示？', choices: ['在下面', '在旁边', '超越'], answer: '在下面', difficulty: 2 },
  { id: 'root-trans', type: 'root', word: 'transport', prompt: '前缀 trans- 在 transport 中表示？', choices: ['横越/转移', '固定', '加强'], answer: '横越/转移', difficulty: 2 },
  { id: 'root-bio', type: 'root', word: 'biology', prompt: '词根 bio- 在 biology 中表示？', choices: ['生命', '地球', '数字'], answer: '生命', difficulty: 2 },
  { id: 'root-ology', type: 'root', word: 'sociology', prompt: '后缀 -ology 在 sociology 中表示？', choices: ['学科/研究', '状态', '场所'], answer: '学科/研究', difficulty: 2 },
  { id: 'root-port', type: 'root', word: 'portable', prompt: '词根 port 在 portable 中表示？', choices: ['搬运', '站立', '观看'], answer: '搬运', difficulty: 2 },
  { id: 'root-dict', type: 'root', word: 'predict', prompt: '词根 dict 在 predict 中表示？', choices: ['说', '做', '想'], answer: '说', difficulty: 2 },
  { id: 'root-form', type: 'root', word: 'reform', prompt: '词根 form 在 reform 中表示？', choices: ['形状/形式', '力量', '声音'], answer: '形状/形式', difficulty: 2 },
  { id: 'root-spect', type: 'root', word: 'inspect', prompt: '词根 spect 在 inspect 中表示？', choices: ['看', '抓', '走'], answer: '看', difficulty: 3 },
  { id: 'root-struct', type: 'root', word: 'construct', prompt: '词根 struct 在 construct 中表示？', choices: ['建造', '打破', '书写'], answer: '建造', difficulty: 3 },
  { id: 'root-vert', type: 'root', word: 'convert', prompt: '词根 vert 在 convert 中表示？', choices: ['转', '停', '量'], answer: '转', difficulty: 3 },
  { id: 'root-tract', type: 'root', word: 'attract', prompt: '词根 tract 在 attract 中表示？', choices: ['拉', '推', '切'], answer: '拉', difficulty: 3 },
  { id: 'root-mit', type: 'root', word: 'transmit', prompt: '词根 mit/miss 在 transmit 中表示？', choices: ['送', '留', '变'], answer: '送', difficulty: 3 },
  { id: 'root-cred', type: 'root', word: 'incredible', prompt: '词根 cred 在 incredible 中表示？', choices: ['相信', '创造', '计数'], answer: '相信', difficulty: 3 },
  { id: 'root-rupt', type: 'root', word: 'interrupt', prompt: '词根 rupt 在 interrupt 中表示？', choices: ['破裂', '连接', '旋转'], answer: '破裂', difficulty: 3 },
  { id: 'root-ject', type: 'root', word: 'reject', prompt: '词根 ject 在 reject 中表示？', choices: ['投掷', '接受', '保护'], answer: '投掷', difficulty: 3 },
  { id: 'root-vis', type: 'root', word: 'visible', prompt: '词根 vis/vid 在 visible 中表示？', choices: ['看见', '隐藏', '触碰'], answer: '看见', difficulty: 3 },

  // ---------- 词义选择（烬尾 · 极速释义） ----------
  { id: 'mean-revive', type: 'meaning', word: 'revive', prompt: 'revive 的正确含义是？', choices: ['使复苏', '使分裂', '使拒绝'], answer: '使复苏', difficulty: 1 },
  { id: 'mean-inherit', type: 'meaning', word: 'inherit', prompt: 'inherit 的正确含义是？', choices: ['观察', '继承', '抵抗'], answer: '继承', difficulty: 1 },
  { id: 'mean-fragment', type: 'meaning', word: 'fragment', prompt: 'fragment 的正确含义是？', choices: ['遗迹', '边界', '碎片'], answer: '碎片', difficulty: 1 },
  { id: 'mean-enhance', type: 'meaning', word: 'enhance', prompt: 'enhance 的正确含义是？', choices: ['增强', '减少', '忽略'], answer: '增强', difficulty: 1 },
  { id: 'mean-suppress', type: 'meaning', word: 'suppress', prompt: 'suppress 的正确含义是？', choices: ['抑制', '支持', '加速'], answer: '抑制', difficulty: 2 },
  { id: 'mean-advocate', type: 'meaning', word: 'advocate', prompt: 'advocate 的正确含义是？', choices: ['提倡', '反对', '放弃'], answer: '提倡', difficulty: 2 },
  { id: 'mean-rigorous', type: 'meaning', word: 'rigorous', prompt: 'rigorous 的正确含义是？', choices: ['严格的', '宽松的', '随机的'], answer: '严格的', difficulty: 2 },
  { id: 'mean-feasible', type: 'meaning', word: 'feasible', prompt: 'feasible 的正确含义是？', choices: ['可行的', '昂贵的', '过时的'], answer: '可行的', difficulty: 2 },
  { id: 'mean-inevitable', type: 'meaning', word: 'inevitable', prompt: 'inevitable 的正确含义是？', choices: ['不可避免的', '可选的', '暂时的'], answer: '不可避免的', difficulty: 2 },
  { id: 'mean-substantial', type: 'meaning', word: 'substantial', prompt: 'substantial 的正确含义是？', choices: ['大量的', '微小的', '虚拟的'], answer: '大量的', difficulty: 2 },
  { id: 'mean-profound', type: 'meaning', word: 'profound', prompt: 'profound 的正确含义是？', choices: ['深刻的', '表面的', '简单的'], answer: '深刻的', difficulty: 2 },
  { id: 'mean-acute', type: 'meaning', word: 'acute', prompt: 'acute 的正确含义是？', choices: ['严重的', '慢性的', '迟钝的'], answer: '严重的', difficulty: 2 },
  { id: 'mean-undermine', type: 'meaning', word: 'undermine', prompt: 'undermine 的正确含义是？', choices: ['削弱', '加固', '美化'], answer: '削弱', difficulty: 2 },
  { id: 'mean-prevail', type: 'meaning', word: 'prevail', prompt: 'prevail 的正确含义是？', choices: ['盛行', '失败', '消失'], answer: '盛行', difficulty: 3 },
  { id: 'mean-ambiguous', type: 'meaning', word: 'ambiguous', prompt: 'ambiguous 的正确含义是？', choices: ['模糊不清的', '明确的', '详细的'], answer: '模糊不清的', difficulty: 2 },
  { id: 'mean-prudent', type: 'meaning', word: 'prudent', prompt: 'prudent 的正确含义是？', choices: ['谨慎的', '鲁莽的', '慷慨的'], answer: '谨慎的', difficulty: 3 },
  { id: 'mean-skeptical', type: 'meaning', word: 'skeptical', prompt: 'skeptical 的正确含义是？', choices: ['怀疑的', '深信的', '好奇的'], answer: '怀疑的', difficulty: 3 },
  { id: 'mean-trivial', type: 'meaning', word: 'trivial', prompt: 'trivial 的正确含义是？', choices: ['琐碎的', '关键的', '复杂的'], answer: '琐碎的', difficulty: 3 },
  { id: 'mean-versatile', type: 'meaning', word: 'versatile', prompt: 'versatile 的正确含义是？', choices: ['多才多艺的', '单一的', '固执的'], answer: '多才多艺的', difficulty: 3 },
  { id: 'mean-vulnerable', type: 'meaning', word: 'vulnerable', prompt: 'vulnerable 的正确含义是？', choices: ['脆弱的', '坚固的', '隐蔽的'], answer: '脆弱的', difficulty: 3 },
  { id: 'mean-coherent', type: 'meaning', word: 'coherent', prompt: 'coherent 的正确含义是？', choices: ['连贯的', '断裂的', '冗长的'], answer: '连贯的', difficulty: 3 },
  { id: 'mean-compatible', type: 'meaning', word: 'compatible', prompt: 'compatible 的正确含义是？', choices: ['兼容的', '冲突的', '过期的'], answer: '兼容的', difficulty: 3 },
  { id: 'mean-radical', type: 'meaning', word: 'radical', prompt: 'radical 的正确含义是？', choices: ['根本的', '次要的', '保守的'], answer: '根本的', difficulty: 3 },
  { id: 'mean-dilemma', type: 'meaning', word: 'dilemma', prompt: 'dilemma 的正确含义是？', choices: ['困境', '机遇', '方案'], answer: '困境', difficulty: 3 },

  // ---------- 语境填空 · 形近词（澜歌 · 语境回响） ----------
  { id: 'ctx-revive', type: 'context', word: 'revive', prompt: 'The city began to ___ after the silence.', choices: ['revive', 'divide', 'refuse'], answer: 'revive', difficulty: 1 },
  { id: 'ctx-attribute', type: 'context', word: 'attribute', prompt: 'She ___ her success to her mentors.', choices: ['attributed', 'contributed', 'distributed'], answer: 'attributed', difficulty: 2 },
  { id: 'ctx-arise', type: 'context', word: 'arise', prompt: 'New problems ___ as the project went deeper.', choices: ['arose', 'rose', 'raised'], answer: 'arose', difficulty: 2 },
  { id: 'ctx-affect', type: 'context', word: 'affect', prompt: 'The new policy will ___ millions of students.', choices: ['affect', 'effect', 'effort'], answer: 'affect', difficulty: 2 },
  { id: 'ctx-adapt', type: 'context', word: 'adapt', prompt: 'The team had to ___ to the new rules quickly.', choices: ['adapt', 'adopt', 'adept'], answer: 'adapt', difficulty: 2 },
  { id: 'ctx-considerable', type: 'context', word: 'considerable', prompt: 'He made a ___ donation to the school.', choices: ['considerable', 'considerate', 'considered'], answer: 'considerable', difficulty: 2 },
  { id: 'ctx-respective', type: 'context', word: 'respective', prompt: 'The two scholars hold ___ views on the issue.', choices: ['respective', 'respectful', 'respectable'], answer: 'respective', difficulty: 3 },
  { id: 'ctx-principal', type: 'context', word: 'principal', prompt: 'The ___ reason for the delay was the storm.', choices: ['principal', 'principle', 'principally'], answer: 'principal', difficulty: 3 },
  { id: 'ctx-complement', type: 'context', word: 'complement', prompt: 'The wine perfectly ___ the dish.', choices: ['complements', 'compliments', 'completes'], answer: 'complements', difficulty: 3 },
  { id: 'ctx-stationary', type: 'context', word: 'stationary', prompt: 'The car remained ___ at the crossing.', choices: ['stationary', 'stationery', 'stationed'], answer: 'stationary', difficulty: 2 },
  { id: 'ctx-ensure', type: 'context', word: 'ensure', prompt: 'Please ___ that all doors are locked.', choices: ['ensure', 'assure', 'insure'], answer: 'ensure', difficulty: 2 },
  { id: 'ctx-economical', type: 'context', word: 'economical', prompt: 'The new engine is quite ___ on fuel.', choices: ['economical', 'economic', 'economics'], answer: 'economical', difficulty: 3 },
  { id: 'ctx-historic', type: 'context', word: 'historic', prompt: 'The two nations signed a ___ treaty last month.', choices: ['historic', 'historical', 'historied'], answer: 'historic', difficulty: 3 },
  { id: 'ctx-sensitive', type: 'context', word: 'sensitive', prompt: 'She is very ___ to criticism.', choices: ['sensitive', 'sensible', 'sentimental'], answer: 'sensitive', difficulty: 3 },
  { id: 'ctx-lose', type: 'context', word: 'lose', prompt: 'Be careful not to ___ your key.', choices: ['lose', 'loose', 'loss'], answer: 'lose', difficulty: 1 },
  { id: 'ctx-personnel', type: 'context', word: 'personnel', prompt: 'The ___ department handles all hiring.', choices: ['personnel', 'personal', 'personable'], answer: 'personnel', difficulty: 2 },
  { id: 'ctx-illusion', type: 'context', word: 'illusion', prompt: 'The painter created an ___ of depth.', choices: ['illusion', 'allusion', 'elusion'], answer: 'illusion', difficulty: 3 },
  { id: 'ctx-devise', type: 'context', word: 'devise', prompt: 'Engineers ___ a new cooling system.', choices: ['devised', 'decided', 'divided'], answer: 'devised', difficulty: 3 },
  { id: 'ctx-precede', type: 'context', word: 'precede', prompt: 'A short speech will ___ the ceremony.', choices: ['precede', 'proceed', 'exceed'], answer: 'precede', difficulty: 3 },
  { id: 'ctx-conform', type: 'context', word: 'conform', prompt: 'Students must ___ to the new rules.', choices: ['conform', 'confirm', 'confront'], answer: 'conform', difficulty: 2 },
  { id: 'ctx-intensive', type: 'context', word: 'intensive', prompt: 'The company offers ___ training for new hires.', choices: ['intensive', 'intense', 'intent'], answer: 'intensive', difficulty: 3 },
  { id: 'ctx-imaginative', type: 'context', word: 'imaginative', prompt: 'The novelist has a highly ___ mind.', choices: ['imaginative', 'imaginary', 'imagined'], answer: 'imaginative', difficulty: 2 },
  { id: 'ctx-objective', type: 'context', word: 'objective', prompt: 'The report gives an ___ analysis of the policy.', choices: ['objective', 'objection', 'objectionable'], answer: 'objective', difficulty: 2 },
  { id: 'ctx-transform', type: 'context', word: 'transform', prompt: 'The internet has ___ the way we learn.', choices: ['transformed', 'transferred', 'transmitted'], answer: 'transformed', difficulty: 2 },
];

// ------------------------------------------------------------
// 抽题与伤害计算
// ------------------------------------------------------------
const lastDrawn: Record<QuestionType, string | null> = { root: null, meaning: null, context: null };

/**
 * 从指定题型池抽题：
 * 1) 若错词本中有同题型词，按 WRONG_REDRAW_CHANCE 概率优先重现（复习优先）
 * 2) 否则普通抽题
 * 3) 无论走哪条路，都避免与上一题重复
 */
export function drawQuestion(type: QuestionType): WordQuestion {
  const pool = WORD_BANK.filter(q => q.type === type);
  const book = loadBook();
  const wrongPool = pool.filter(q => book[q.id]);
  let pick: WordQuestion;
  if (wrongPool.length > 0 && Math.random() < TUNING.WRONG_REDRAW_CHANCE) {
    pick = wrongPool[Math.floor(Math.random() * wrongPool.length)];
  } else {
    pick = pool[Math.floor(Math.random() * pool.length)];
  }
  if (pool.length > 1 && lastDrawn[type] === pick.id) {
    const others = pool.filter(q => q.id !== pick.id);
    pick = others[Math.floor(Math.random() * others.length)];
  }
  lastDrawn[type] = pick.id;
  return pick;
}

/** 伤害 = BASE × 题型系数 × (1 + 0.1 × (难度-1))，四舍五入 */
export function computeDamage(q: WordQuestion): number {
  const raw = TUNING.BASE_DAMAGE * TUNING.TYPE_COEFF[q.type] * (1 + TUNING.DIFFICULTY_STEP * (q.difficulty - 1));
  return Math.round(raw);
}

/** 某题型在当前题库下的伤害区间（用于技能栏展示） */
export function damageRange(type: QuestionType): { min: number; max: number } {
  const pool = WORD_BANK.filter(q => q.type === type);
  const damages = pool.map(computeDamage);
  return { min: Math.min(...damages), max: Math.max(...damages) };
}

/** 生成可分享的战报 ID（小程序分享卡片直接复用此 payload） */
export function buildReportPayload(
  mode: 'stage' | 'arena',
  opponent: string,
  result: 'win' | 'lose',
  rounds: number,
  answers: { total: number; correct: number },
  allyHp: number,
  enemyHp: number,
  skillsUsed: { root: number; meaning: number; context: number },
  wrongWords: WrongWordEntry[] = [],
): BattleReport {
  const report: BattleReport = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    mode,
    opponent,
    result,
    rounds,
    answers,
    accuracy: answers.total ? Math.round((answers.correct / answers.total) * 100) : 0,
    allyHp,
    enemyHp,
    skillsUsed,
    wrongWords,
  };
  // 调试通道：分享卡片联调时直接观察序列化 payload
  console.log('[BattleReport]', JSON.stringify(report));
  return report;
}
