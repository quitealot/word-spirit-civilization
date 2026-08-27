export type TeachingStage = 'unseen' | 'introduced' | 'guided' | 'retrieved' | 'used' | 'maintained';

export type ZeroBaseWord = {
  wordId: string;
  word: 'people' | 'water' | 'need' | 'choose' | 'help';
  partOfSpeech: string;
  sourceMeaning: string;
  targetGloss: string;
  sourceRow: number;
};

export const ZERO_BASE_WORDS: readonly ZeroBaseWord[] = [
  { wordId: 'w1156', word: 'people', partOfSpeech: '名词', sourceMeaning: 'n.人们，人；[the-]人民；一国人民，民族', targetGloss: '人；人们', sourceRow: 1157 },
  { wordId: 'w1718', word: 'water', partOfSpeech: '名词', sourceMeaning: 'n.水 vt.浇灌；给…饮水 vi.流泪，加水', targetGloss: '水', sourceRow: 1719 },
  { wordId: 'w1042', word: 'need', partOfSpeech: '动词', sourceMeaning: 'aux.v./v.需要；必须 n.需要；贫困，困窘', targetGloss: '需要', sourceRow: 1043 },
  { wordId: 'w265', word: 'choose', partOfSpeech: '动词', sourceMeaning: 'v.选择,挑选;甘愿', targetGloss: '选择', sourceRow: 266 },
  { wordId: 'w729', word: 'help', partOfSpeech: '动词', sourceMeaning: 'v.帮(援)助；有助于；[呼救]救命n.帮助(手)', targetGloss: '帮助', sourceRow: 730 },
] as const;

export const ZERO_BASE_RULES = {
  id: 'zero-base-teaching-micro-v1',
  displayKinds: ['world_label', 'action_word'] as const,
  wordOrder: ['people', 'water', 'need', 'choose', 'help'] as const,
  helpLayers: ['world_replay', 'word_gloss', 'segmented_support', 'full_translation'] as const,
  restAfterHelpMs: 4000,
  finalActions: ['People need water.', 'choose water', 'help people'] as const,
} as const;

export type TeachingEvidence = {
  wordId: string;
  stage: TeachingStage;
  eventId: string;
  at: number;
  supportLevel: 0 | 1 | 2 | 3 | 4;
};

export type ZeroBaseProgress = {
  version: 1;
  currentStep: string;
  stages: Record<string, TeachingStage>;
  evidence: TeachingEvidence[];
  completedAt?: number;
};

export const ZERO_BASE_STORE_KEY = 'word-spirit-zero-base-teaching-v1';

const STAGE_RANK: Record<TeachingStage, number> = {
  unseen: 0,
  introduced: 1,
  guided: 2,
  retrieved: 3,
  used: 4,
  maintained: 5,
};

export function createZeroBaseProgress(): ZeroBaseProgress {
  return {
    version: 1,
    currentStep: 'arrival',
    stages: Object.fromEntries(ZERO_BASE_WORDS.map(word => [word.wordId, 'unseen'])),
    evidence: [],
  };
}

export function loadZeroBaseProgress(): ZeroBaseProgress {
  if (typeof window === 'undefined') return createZeroBaseProgress();
  try {
    const parsed = JSON.parse(window.localStorage.getItem(ZERO_BASE_STORE_KEY) || 'null') as ZeroBaseProgress | null;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.evidence)) return createZeroBaseProgress();
    return { ...createZeroBaseProgress(), ...parsed, stages: { ...createZeroBaseProgress().stages, ...parsed.stages } };
  } catch {
    return createZeroBaseProgress();
  }
}

export function saveZeroBaseProgress(progress: ZeroBaseProgress): void {
  if (typeof window !== 'undefined') window.localStorage.setItem(ZERO_BASE_STORE_KEY, JSON.stringify(progress));
}

export function recordTeachingEvidence(
  progress: ZeroBaseProgress,
  word: ZeroBaseWord['word'],
  stage: Exclude<TeachingStage, 'unseen' | 'maintained'>,
  eventId: string,
  supportLevel: 0 | 1 | 2 | 3 | 4,
): ZeroBaseProgress {
  const entry = ZERO_BASE_WORDS.find(item => item.word === word);
  if (!entry) return progress;
  const current = progress.stages[entry.wordId] ?? 'unseen';
  const nextStage = STAGE_RANK[stage] > STAGE_RANK[current] ? stage : current;
  return {
    ...progress,
    stages: { ...progress.stages, [entry.wordId]: nextStage },
    evidence: [...progress.evidence, { wordId: entry.wordId, stage, eventId, at: Date.now(), supportLevel }],
  };
}

export function resetZeroBaseProgress(): void {
  if (typeof window !== 'undefined') window.localStorage.removeItem(ZERO_BASE_STORE_KEY);
}

