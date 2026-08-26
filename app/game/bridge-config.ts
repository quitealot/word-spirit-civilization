export type SkillExecutionKind = 'stable_attack' | 'burst' | 'shield' | 'mitigation' | 'recovery' | 'control' | 'charge';
export type ExecutionQuality = 'stable' | 'hesitant' | 'failed';

export const BRIDGE_V1_RULES = {
  training: {
    newWordLimit: 3,
    dueReviewLimit: 2,
    targetedWordLimit: 3,
    estimatedSecondsPerWord: 14,
  },
  exploration: {
    correctNew: 3,
    correctReview: 2,
    stableBattleSkill: 1,
    weaknessRecovered: 2,
  },
  response: {
    stableMs: 3500,
    fsrsHardMs: 8000,
    stableMultiplier: 1,
    hesitantMultiplier: 0.85,
  },
  skillFailureMultipliers: {
    stable_attack: 0.3,
    burst: 0.2,
    shield: 0.35,
    mitigation: 0,
    recovery: 0.4,
    control: 0,
    charge: 0.25,
  } satisfies Record<SkillExecutionKind, number>,
  baseEffects: {
    stableAttackDamage: 20,
    burstDamage: 42,
    shield: 18,
    mitigation: 0.25,
    recovery: 18,
    counterDamage: 16,
    bossCounterDamage: 22,
  },
} as const;

export function resolveExecutionQuality(correct: boolean, latencyMs: number): ExecutionQuality {
  if (!correct) return 'failed';
  return latencyMs <= BRIDGE_V1_RULES.response.stableMs ? 'stable' : 'hesitant';
}

export function resolveSkillMultiplier(kind: SkillExecutionKind, correct: boolean, latencyMs: number): number {
  if (!correct) return BRIDGE_V1_RULES.skillFailureMultipliers[kind];
  return latencyMs <= BRIDGE_V1_RULES.response.stableMs
    ? BRIDGE_V1_RULES.response.stableMultiplier
    : BRIDGE_V1_RULES.response.hesitantMultiplier;
}

export function estimatedTrainingSeconds(wordCount: number): number {
  return Math.max(0, wordCount) * BRIDGE_V1_RULES.training.estimatedSecondsPerWord;
}
