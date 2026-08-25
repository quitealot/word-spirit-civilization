'use client';

import { createEmptyCard, fsrs, Rating, type Card, type CardInput } from 'ts-fsrs';
import { FIRST_LEARNING_PACK, VOCABULARY, VOCABULARY_BY_ID, type MasteryLayer, type VocabularyEntry } from './vocabulary';

export type LearningQuestion = {
  id: string;
  wordId: string;
  word: string;
  phonetic: string;
  layer: MasteryLayer;
  prompt: string;
  choices: string[];
  answer: string;
};

export type StoredCard = Omit<CardInput, 'due' | 'last_review'> & { due: string; last_review?: string | null };
export type WordProgress = {
  card: StoredCard;
  attempts: number;
  correct: number;
  lastLayer: MasteryLayer;
  lastLatencyMs: number;
};

export type LearningStore = { progress: Record<string, WordProgress> };

const STORE_KEY = 'word-spirit-learning-v2';
const scheduler = fsrs({
  request_retention: 0.9,
  maximum_interval: 36500,
  enable_fuzz: true,
  enable_short_term: true,
  learning_steps: ['1m', '10m'],
  relearning_steps: ['10m'],
});

function serializeCard(card: Card): StoredCard {
  return { ...card, due: card.due.toISOString(), last_review: card.last_review?.toISOString() ?? null };
}

function hydrateCard(card: StoredCard): CardInput {
  return { ...card, due: new Date(card.due), last_review: card.last_review ? new Date(card.last_review) : undefined };
}

export function loadLearningStore(): LearningStore {
  if (typeof window === 'undefined') return { progress: {} };
  try { return JSON.parse(window.localStorage.getItem(STORE_KEY) || '{"progress":{}}') as LearningStore; }
  catch { return { progress: {} }; }
}

function saveLearningStore(store: LearningStore) {
  window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

export function resetLearningStore(): void {
  window.localStorage.removeItem(STORE_KEY);
}

function seededChoices(entry: VocabularyEntry): string[] {
  const index = VOCABULARY.findIndex(item => item.wordId === entry.wordId);
  const distractors = [7, 19, 37]
    .map(offset => VOCABULARY[(index + offset) % VOCABULARY.length])
    .filter(item => item.wordId !== entry.wordId)
    .map(item => item.meaning);
  const choices = [entry.meaning, ...distractors.slice(0, 3)];
  return choices.sort((a, b) => ((a.length + entry.wordId.length) % 7) - ((b.length + entry.wordId.length) % 7));
}

export function buildL1Question(entry: VocabularyEntry): LearningQuestion {
  return {
    id: `L1-${entry.wordId}`,
    wordId: entry.wordId,
    word: entry.word,
    phonetic: entry.phonetic,
    layer: 'L1',
    prompt: `${entry.word} 的正确含义是？`,
    choices: seededChoices(entry),
    answer: entry.meaning,
  };
}

export function getFirstPackQuestions(): LearningQuestion[] {
  return FIRST_LEARNING_PACK.map(buildL1Question);
}

export function getLearningPackQuestions(packId: string): LearningQuestion[] {
  return VOCABULARY.filter(entry => entry.learningPack === packId).map(buildL1Question);
}

export function getCurrentLearningPack(): { id: string; questions: LearningQuestion[]; learned: number } {
  const store = loadLearningStore();
  for (let pack = 1; pack <= 10; pack += 1) {
    const id = `LP${String(pack).padStart(2, '0')}`;
    const questions = getLearningPackQuestions(id);
    const learned = questions.filter(question => (store.progress[question.wordId]?.attempts ?? 0) > 0).length;
    if (learned < questions.length) return { id, questions, learned };
  }
  const questions = getLearningPackQuestions('LP10');
  return { id: 'LP10', questions, learned: questions.length };
}

export function getDueQuestion(preferredWordId?: string): LearningQuestion {
  const store = loadLearningStore();
  const now = Date.now();
  if (preferredWordId) {
    const preferred = VOCABULARY_BY_ID.get(preferredWordId);
    if (preferred) return buildL1Question(preferred);
  }
  const dueIds = Object.entries(store.progress)
    .filter(([, value]) => new Date(value.card.due).getTime() <= now)
    .sort((a, b) => new Date(a[1].card.due).getTime() - new Date(b[1].card.due).getTime())
    .map(([wordId]) => wordId);
  const fallbackIds = FIRST_LEARNING_PACK.map(item => item.wordId);
  const wordId = dueIds[0] ?? fallbackIds[Math.floor(Math.random() * fallbackIds.length)] ?? FIRST_LEARNING_PACK[0].wordId;
  const entry = VOCABULARY_BY_ID.get(wordId);
  if (!entry) throw new Error(`Unknown vocabulary wordId: ${wordId}`);
  return buildL1Question(entry);
}

export function recordLearningAnswer(question: LearningQuestion, correct: boolean, latencyMs: number): WordProgress {
  const store = loadLearningStore();
  const previous = store.progress[question.wordId];
  const card = previous ? hydrateCard(previous.card) : createEmptyCard();
  const rating = correct ? (latencyMs <= 8000 ? Rating.Good : Rating.Hard) : Rating.Again;
  const result = scheduler.next(card, new Date(), rating);
  const next: WordProgress = {
    card: serializeCard(result.card),
    attempts: (previous?.attempts ?? 0) + 1,
    correct: (previous?.correct ?? 0) + (correct ? 1 : 0),
    lastLayer: question.layer,
    lastLatencyMs: latencyMs,
  };
  store.progress[question.wordId] = next;
  saveLearningStore(store);
  return next;
}

export function learnedFirstPackCount(): number {
  const store = loadLearningStore();
  return FIRST_LEARNING_PACK.filter(entry => (store.progress[entry.wordId]?.attempts ?? 0) > 0).length;
}

export function learnedWordCount(): number {
  const store = loadLearningStore();
  return VOCABULARY.filter(entry => (store.progress[entry.wordId]?.attempts ?? 0) > 0).length;
}

export function dueCount(): number {
  const store = loadLearningStore();
  const now = Date.now();
  return Object.values(store.progress).filter(value => new Date(value.card.due).getTime() <= now).length;
}

export const CONTENT_REVIEW_GATES = { L1: 80, L2: 36, L3: 24 } as const;
