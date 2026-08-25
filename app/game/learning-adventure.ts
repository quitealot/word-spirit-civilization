import type { EpisodeId } from './episode-config.ts';

export type AdventurePreparationStatus = 'not_started' | 'preparing' | 'ready';

export type AdventureLearningState = {
  status: AdventurePreparationStatus;
  wordIds: string[];
  newWordIds: string[];
  reviewWordIds: string[];
  preparedWordIds: string[];
  calledWordIds: string[];
  successfulWordIds: string[];
};

export type AdventureLearningByEpisode = Record<EpisodeId, AdventureLearningState>;

export function createEmptyAdventureLearningState(): AdventureLearningState {
  return {
    status: 'not_started',
    wordIds: [],
    newWordIds: [],
    reviewWordIds: [],
    preparedWordIds: [],
    calledWordIds: [],
    successfulWordIds: [],
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
    const preparedWordIds = uniqueStrings(input.preparedWordIds).filter(wordId => wordIds.includes(wordId));
    const calledWordIds = uniqueStrings(input.calledWordIds).filter(wordId => wordIds.includes(wordId));
    const successfulWordIds = uniqueStrings(input.successfulWordIds).filter(wordId => calledWordIds.includes(wordId));
    const status = input.status === 'ready' && preparedWordIds.length === wordIds.length
      ? 'ready'
      : input.status === 'preparing' && wordIds.length > 0
        ? 'preparing'
        : 'not_started';
    result[id] = { status, wordIds, newWordIds, reviewWordIds, preparedWordIds, calledWordIds, successfulWordIds };
  }
  return result;
}

export function beginAdventurePreparation(
  learning: AdventureLearningByEpisode,
  episode: EpisodeId,
  newWordIds: string[],
  reviewWordIds: string[],
): AdventureLearningByEpisode {
  const current = learning[episode];
  if (current.status === 'ready' || current.status === 'preparing') return learning;
  const newIds = uniqueStrings(newWordIds);
  const reviewIds = uniqueStrings(reviewWordIds).filter(wordId => !newIds.includes(wordId));
  return {
    ...learning,
    [episode]: {
      status: newIds.length + reviewIds.length === 0 ? 'ready' : 'preparing',
      wordIds: [...newIds, ...reviewIds],
      newWordIds: newIds,
      reviewWordIds: reviewIds,
      preparedWordIds: [],
      calledWordIds: [],
      successfulWordIds: [],
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
): AdventureLearningByEpisode {
  const current = learning[episode];
  if (!current.wordIds.includes(wordId)) return learning;
  return {
    ...learning,
    [episode]: {
      ...current,
      calledWordIds: Array.from(new Set([...current.calledWordIds, wordId])),
      successfulWordIds: correct
        ? Array.from(new Set([...current.successfulWordIds, wordId]))
        : current.successfulWordIds,
    },
  };
}

export function isAdventureReady(learning: AdventureLearningByEpisode, episode: EpisodeId): boolean {
  return learning[episode].status === 'ready';
}
