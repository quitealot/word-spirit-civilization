import {
  FUSION_BATTLE_WORD_CANDIDATES,
  getFusionBattleEligibleWords,
  type FusionBattleWordCandidate,
  type FusionWeakness,
} from './fusion-slice.ts';
import type { ZeroBaseProgress } from './zero-base-teaching.ts';

export const PHASE_B_COMBAT_CANDIDATE_A = {
  playerMaxHp: 48,
  enemyMaxHp: 80,
  enemyDamage: 12,
} as const;

export const PHASE_B_COMBAT_CANDIDATE_B = {
  playerMaxHp: 48,
  enemyMaxHp: 80,
  enemyDamage: 14,
} as const;

export const PHASE_B_COMBAT_CANDIDATE_C = {
  playerMaxHp: 48,
  enemyMaxHp: 80,
  enemyDamage: 14,
  failedMultiplier: 0.25,
  noCallMultiplier: 0.25,
} as const;

export const PHASE_B_COMBAT_FEEDBACK_TIMING = {
  skillResultHoldMs: 1200,
  enemyPrepareMs: 400,
  enemyDamageHoldMs: 1200,
} as const;

export const PHASE_B_COMBAT_FEEDBACK_SEQUENCE = [
  'skill_result',
  'enemy_prepare',
  'enemy_damage',
  'next_turn',
] as const;

export type PhaseBRepairStep = 'meaning' | 'retrieve';
export type PhaseBRepairState = {
  index: number;
  step: PhaseBRepairStep;
  complete: boolean;
};

export function isPhaseBFlow(search: string): boolean {
  return new URLSearchParams(search).get('flow') === 'phase-b';
}

export function getPhaseBEntry(progress: ZeroBaseProgress): {
  destination: 'battle' | 'evidence_missing';
  eligibleWords: FusionBattleWordCandidate[];
} {
  const eligibleWords = getFusionBattleEligibleWords(progress);
  return {
    destination: eligibleWords.length > 0 ? 'battle' : 'evidence_missing',
    eligibleWords,
  };
}

export function shouldShowPhaseBJustUsed(battleNumber: number, callNumber: number): boolean {
  return battleNumber === 1 && callNumber === 1;
}

export function createPhaseBRepairQueue(weaknesses: readonly FusionWeakness[]): FusionWeakness[] {
  const approvedIds = new Set(FUSION_BATTLE_WORD_CANDIDATES.map(word => word.wordId));
  const seen = new Set<string>();
  return weaknesses.filter(item => {
    if (!approvedIds.has(item.wordId) || seen.has(item.wordId)) return false;
    seen.add(item.wordId);
    return true;
  });
}

export function beginPhaseBRepair(): PhaseBRepairState {
  return { index: 0, step: 'meaning', complete: false };
}

export function showPhaseBRetrieve(state: PhaseBRepairState): PhaseBRepairState {
  return { ...state, step: 'retrieve' };
}

export function resolvePhaseBRetrieve(
  state: PhaseBRepairState,
  correct: boolean,
  queueLength: number,
): PhaseBRepairState {
  if (!correct) return { ...state, step: 'meaning' };
  if (state.index + 1 >= queueLength) return { ...state, complete: true };
  return { index: state.index + 1, step: 'meaning', complete: false };
}

export function getPhaseBPostBattleStage(weaknesses: readonly FusionWeakness[]): 'review' | 'end' {
  return createPhaseBRepairQueue(weaknesses).length > 0 ? 'review' : 'end';
}

export function getPhaseBRepairDestination(state: PhaseBRepairState): 'battle' | 'targeted' {
  return state.complete ? 'battle' : 'targeted';
}
