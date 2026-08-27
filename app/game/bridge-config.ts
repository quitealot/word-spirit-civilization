export type SkillExecutionKind = 'stable_attack' | 'burst' | 'shield' | 'mitigation' | 'recovery' | 'control' | 'charge';
export type SkillCallSupport = 'none' | 'light' | 'full';
export type ExecutionQuality = 'stable' | 'supported' | 'failed' | 'hesitant';

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
    fsrsHardMs: 8000,
    independentMultiplier: 1,
    lightSupportMultiplier: 0.7,
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
  skillEffects: {
    yayu_leaf_pat: { damage: 20 },
    yayu_bud_guard: { shield: 24 },
    yayu_root: { mitigation: 0.35, turns: 1 },
    jinwei_spark: { damage: 20 },
    jinwei_flame_tail: { damage: 42 },
    jinwei_charge: { nextAttackMultiplier: 1.5 },
    lange_water_tone: { damage: 16, weaken: 0.15, turns: 1 },
    lange_returning_tide: { recovery: 24 },
    lange_still_wave: { mitigation: 0.3, turns: 1 },
  },
  prototypeAcceptance: {
    playerHp: 32,
    enemyAttack: 40,
    targetedTrainingSeconds: 40,
  },
} as const;

export function resolveExecutionQuality(correct: boolean, support: SkillCallSupport = 'none'): ExecutionQuality {
  if (!correct) return 'failed';
  return support === 'none' ? 'stable' : 'supported';
}

export function resolveSkillMultiplier(kind: SkillExecutionKind, correct: boolean, support: SkillCallSupport = 'none'): number {
  if (!correct) return BRIDGE_V1_RULES.skillFailureMultipliers[kind];
  return support === 'none'
    ? BRIDGE_V1_RULES.response.independentMultiplier
    : BRIDGE_V1_RULES.response.lightSupportMultiplier;
}

export function estimatedTrainingSeconds(wordCount: number): number {
  return Math.max(0, wordCount) * BRIDGE_V1_RULES.training.estimatedSecondsPerWord;
}
