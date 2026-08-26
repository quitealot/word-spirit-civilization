import type { EpisodeId } from './episode-config.ts';

export type AdventurePreparationStatus = 'not_started' | 'preparing' | 'ready';

export type AdventureLearningState = {
  status: AdventurePreparationStatus;
  wordIds: string[];
  newWordIds: string[];
  reviewWordIds: string[];
  targetedWordIds: string[];
  preparedWordIds: string[];
  calledWordIds: string[];
  successfulWordIds: string[];
  weakWordIds: string[];
  stabilizedWordIds: string[];
};

export type AdventureLearningByEpisode = Record<EpisodeId, AdventureLearningState>;

export function createEmptyAdventureLearningState(): AdventureLearningState {
  return {
    status: 'not_started',
    wordIds: [],
    newWordIds: [],
    reviewWordIds: [],
    targetedWordIds: [],
    preparedWordIds: [],
    calledWordIds: [],
    successfulWordIds: [],
    weakWordIds: [],
    stabilizedWordIds: [],
  };
}

export function createEmptyAdventureLearning(): AdventureLearningByEpisode {
  return Object.fromEntries(
    Array.from({ length: 10 }, (_, index) => [index + 1, createEmptyAdventureLearningState()]),
  ) as AdventureLearningByEpisode;
}

function uniqueStrings(value: unknown): string[] {
  return Array.isArray(value)
    ? Array.from(new Set(value.filter((item): item is string => typeof item === 'string' && item.length > 0)))
    : [];
}

export function migrateAdventureLearning(value: unknown): AdventureLearningByEpisode {
  const source = value && typeof value === 'object' ? value as Partial<Record<EpisodeId, Partial<AdventureLearningState>>> : {};
  const result = createEmptyAdventureLearning();
  for (let episode = 1; episode <= 10; episode += 1) {
    const id = episode as EpisodeId;
    const input = source[id] ?? {};
    const wordIds = uniqueStrings(input.wordIds);
    const newWordIds = uniqueStrings(input.newWordIds).filter(wordId => wordIds.includes(wordId));
    const reviewWordIds = uniqueStrings(input.reviewWordIds).filter(wordId => wordIds.includes(wordId));
    const targetedWordIds = uniqueStrings(input.targetedWordIds).filter(wordId => wordIds.includes(wordId));
    const preparedWordIds = uniqueStrings(input.preparedWordIds).filter(wordId => wordIds.includes(wordId));
    const calledWordIds = uniqueStrings(input.calledWordIds);
    const successfulWordIds = uniqueStrings(input.successfulWordIds).filter(wordId => calledWordIds.includes(wordId));
    const weakWordIds = uniqueStrings(input.weakWordIds);
    const stabilizedWordIds = uniqueStrings(input.stabilizedWordIds);
    const status = input.status === 'ready' && preparedWordIds.length === wordIds.length
      ? 'ready'
      : input.status === 'preparing' && wordIds.length > 0
        ? 'preparing'
        : 'not_started';
    result[id] = { status, wordIds, newWordIds, reviewWordIds, targetedWordIds, preparedWordIds, calledWordIds, successfulWordIds, weakWordIds, stabilizedWordIds };
  }
  return result;
}

export function beginAdventurePreparation(
  learning: AdventureLearningByEpisode,
  episode: EpisodeId,
  newWordIds: string[],
  reviewWordIds: string[],
  targetedWordIds: string[] = [],
): AdventureLearningByEpisode {
  const current = learning[episode];
  if (current.status === 'ready' || current.status === 'preparing') return learning;
  const newIds = uniqueStrings(newWordIds);
  const reviewIds = uniqueStrings(reviewWordIds).filter(wordId => !newIds.includes(wordId));
  const targetedIds = uniqueStrings(targetedWordIds).filter(wordId => !newIds.includes(wordId) && !reviewIds.includes(wordId));
  return {
    ...learning,
    [episode]: {
      status: newIds.length + reviewIds.length + targetedIds.length === 0 ? 'ready' : 'preparing',
      wordIds: [...targetedIds, ...reviewIds, ...newIds],
      newWordIds: newIds,
      reviewWordIds: reviewIds,
      targetedWordIds: targetedIds,
      preparedWordIds: [],
      calledWordIds: [],
      successfulWordIds: [],
      weakWordIds: current.weakWordIds,
      stabilizedWordIds: current.stabilizedWordIds,
    },
  };
}

export function recordPreparedWord(
  learning: AdventureLearningByEpisode,
  episode: EpisodeId,
  wordId: string,
): AdventureLearningByEpisode {
  const current = learning[episode];
  if (!current.wordIds.includes(wordId)) return learning;
  const preparedWordIds = Array.from(new Set([...current.preparedWordIds, wordId]));
  return {
    ...learning,
    [episode]: {
      ...current,
      preparedWordIds,
      status: preparedWordIds.length === current.wordIds.length ? 'ready' : 'preparing',
    },
  };
}

export function recordAdventureCall(
  learning: AdventureLearningByEpisode,
  episode: EpisodeId,
  wordId: string,
  correct: boolean,
  weak = !correct,
): AdventureLearningByEpisode {
  const current = learning[episode];
  return {
    ...learning,
    [episode]: {
      ...current,
      calledWordIds: Array.from(new Set([...current.calledWordIds, wordId])),
      successfulWordIds: correct && !weak
        ? Array.from(new Set([...current.successfulWordIds, wordId]))
        : current.successfulWordIds,
      weakWordIds: weak
        ? Array.from(new Set([...current.weakWordIds, wordId]))
        : current.weakWordIds,
      stabilizedWordIds: weak ? current.stabilizedWordIds.filter(id => id !== wordId) : current.stabilizedWordIds,
    },
  };
}

export function recordWeaknessRecovered(
  learning: AdventureLearningByEpisode,
  episode: EpisodeId,
  wordId: string,
): AdventureLearningByEpisode {
  const next = { ...learning };
  for (let id = 1; id <= 10; id += 1) {
    const key = id as EpisodeId;
    const current = learning[key];
    next[key] = {
      ...current,
      weakWordIds: current.weakWordIds.filter(item => item !== wordId),
      stabilizedWordIds: key === episode ? Array.from(new Set([...current.stabilizedWordIds, wordId])) : current.stabilizedWordIds,
    };
  }
  return next;
}

export function collectWeakWordIds(learning: AdventureLearningByEpisode): string[] {
  const weak: string[] = [];
  for (let episode = 1; episode <= 10; episode += 1) {
    const state = learning[episode as EpisodeId];
    for (const wordId of state.weakWordIds) if (!weak.includes(wordId)) weak.push(wordId);
  }
  return weak;
}

export function isAdventureReady(learning: AdventureLearningByEpisode, episode: EpisodeId): boolean {
  return learning[episode].status === 'ready';
}
