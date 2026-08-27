import { ZERO_BASE_WORDS, type ZeroBaseProgress } from './zero-base-teaching.ts';

export type FusionCallQuality = 'independent' | 'supported' | 'failed';
export type FusionBattleResult = 'active' | 'won' | 'lost';
export type FusionSkillId = 'lange_water_tone' | 'lange_returning_tide';

export type FusionSkillEffectConfig = {
  damage: number;
  healing?: number;
  enemyNextDamageWeaken?: number;
};

export type FusionBattleSkill = {
  skillId: FusionSkillId;
  skillName: '水音' | '回潮';
  /** Compatibility view only; the source of truth is FUSION_SKILL_EFFECT_CONFIG. */
  baseDamage: number;
};

export type FusionBattleWordCandidate = {
  wordId: 'w1718' | 'w729';
  word: 'water' | 'help';
  battleEligible: true;
};

export type FusionBattleCall = {
  skill: FusionBattleSkill;
  word: FusionBattleWordCandidate;
};

export type FusionBattleResolveOptions = {
  enemyDamage?: number;
};

export type FusionWeakness = {
  wordId: FusionBattleWordCandidate['wordId'];
  word: FusionBattleWordCandidate['word'];
  skillName: FusionBattleSkill['skillName'];
  effectPercent: number;
};

export type FusionBattleState = {
  enemyHp: number;
  playerHp: number;
  playerShield: number;
  enemyNextDamageWeaken: number;
  playerNextDamageMitigation: number;
  turn: number;
  result: FusionBattleResult;
  weaknesses: FusionWeakness[];
};

export type FusionResolvedComponents = {
  damage: number;
  healing: number;
  enemyNextDamageWeaken: number;
};

export type FusionTurnOutcome = FusionResolvedComponents & {
  stateAfterSkill: FusionBattleState;
  state: FusionBattleState;
  effectPercent: number;
  actualHealing: number;
  enemyDamage: number;
  shieldAbsorbed: number;
  calledWord: FusionBattleWordCandidate | null;
};

export const FUSION_SKILL_EFFECT_CONFIG: Readonly<Record<FusionSkillId, FusionSkillEffectConfig>> = {
  lange_water_tone: {
    damage: 18,
    enemyNextDamageWeaken: 0.2,
  },
  lange_returning_tide: {
    damage: 10,
    healing: 22,
  },
} as const;

export const FUSION_BATTLE_SKILLS: readonly FusionBattleSkill[] = [
  {
    skillId: 'lange_water_tone',
    skillName: '水音',
    baseDamage: FUSION_SKILL_EFFECT_CONFIG.lange_water_tone.damage,
  },
  {
    skillId: 'lange_returning_tide',
    skillName: '回潮',
    baseDamage: FUSION_SKILL_EFFECT_CONFIG.lange_returning_tide.damage,
  },
] as const;

export const FUSION_BATTLE_WORD_CANDIDATES: readonly FusionBattleWordCandidate[] = [
  { wordId: 'w1718', word: 'water', battleEligible: true },
  { wordId: 'w729', word: 'help', battleEligible: true },
] as const;

export const FUSION_SLICE_RULES = {
  id: 'station-daily-to-hp-battle-v2-phase-a',
  enemyMaxHp: 60,
  playerMaxHp: 48,
  enemyDamage: 8,
  effectMultipliers: {
    independent: 1,
    supported: 0.7,
    failed: 0.4,
  } satisfies Record<FusionCallQuality, number>,
  noCallMultiplier: 0.4,
} as const;

export function assertFusionSliceSourceIntegrity(): void {
  for (const candidate of FUSION_BATTLE_WORD_CANDIDATES) {
    const source = ZERO_BASE_WORDS.find(word => word.wordId === candidate.wordId);
    if (!source || source.word !== candidate.word) {
      throw new Error(`Fusion candidate source mismatch: ${candidate.wordId}/${candidate.word}`);
    }
  }
}

function hasUsedEvidence(progress: ZeroBaseProgress, wordId: string): boolean {
  return progress.evidence.some(evidence => evidence.wordId === wordId && evidence.stage === 'used');
}

export function getFusionBattleEligibleWords(progress: ZeroBaseProgress): FusionBattleWordCandidate[] {
  return FUSION_BATTLE_WORD_CANDIDATES.filter(candidate => {
    if (!candidate.battleEligible) return false;
    const stage = progress.stages[candidate.wordId];
    if (stage === 'used') return true;
    return stage === 'maintained' && hasUsedEvidence(progress, candidate.wordId);
  });
}

/** Skill is intentionally ignored: V2 uses one shared eligible word pool. */
export function getFusionCallCandidates(
  _skill: FusionBattleSkill,
  eligibleWords: readonly FusionBattleWordCandidate[],
): FusionBattleWordCandidate[] {
  return [...eligibleWords];
}

export function selectFusionBattleCall(
  skill: FusionBattleSkill,
  eligibleWords: readonly FusionBattleWordCandidate[],
  turn: number,
): FusionBattleCall | null {
  const candidates = getFusionCallCandidates(skill, eligibleWords);
  if (candidates.length === 0) return null;
  return { skill, word: candidates[(turn - 1) % candidates.length] };
}

export function createFusionBattleState(overrides: Partial<FusionBattleState> = {}): FusionBattleState {
  return {
    enemyHp: FUSION_SLICE_RULES.enemyMaxHp,
    playerHp: FUSION_SLICE_RULES.playerMaxHp,
    playerShield: 0,
    enemyNextDamageWeaken: 0,
    playerNextDamageMitigation: 0,
    turn: 1,
    result: 'active',
    weaknesses: [],
    ...overrides,
  };
}

export function resolveFusionSkillComponents(
  skillId: FusionSkillId,
  multiplier: number,
): FusionResolvedComponents {
  const config = FUSION_SKILL_EFFECT_CONFIG[skillId];
  return {
    damage: Math.round(config.damage * multiplier),
    healing: Math.round((config.healing ?? 0) * multiplier),
    enemyNextDamageWeaken: (config.enemyNextDamageWeaken ?? 0) * multiplier,
  };
}

export function resolveFusionEnemyDamage(
  rawDamage: number,
  enemyWeaken: number,
  playerMitigation: number,
): number {
  return Math.round(rawDamage * (1 - enemyWeaken) * (1 - playerMitigation));
}

function resolveFusionSkillTurn(options: {
  state: FusionBattleState;
  skill: FusionBattleSkill;
  multiplier: number;
  effectPercent: number;
  calledWord: FusionBattleWordCandidate | null;
  weaknessQuality?: FusionCallQuality;
  enemyDamage?: number;
}): FusionTurnOutcome {
  const { state, skill, multiplier, effectPercent, calledWord, weaknessQuality, enemyDamage } = options;
  if (state.result !== 'active') {
    return {
      stateAfterSkill: state,
      state,
      damage: 0,
      healing: 0,
      actualHealing: 0,
      enemyNextDamageWeaken: 0,
      enemyDamage: 0,
      shieldAbsorbed: 0,
      effectPercent: 0,
      calledWord,
    };
  }

  const components = resolveFusionSkillComponents(skill.skillId, multiplier);
  const enemyHp = Math.max(0, state.enemyHp - components.damage);
  const actualHealing = Math.min(components.healing, FUSION_SLICE_RULES.playerMaxHp - state.playerHp);
  const healedPlayerHp = state.playerHp + actualHealing;
  const won = enemyHp === 0;

  if (state.enemyNextDamageWeaken > 0 && components.enemyNextDamageWeaken > 0) {
    throw new Error('PENDING_K3: same-type enemy weaken stacking is outside V2 Phase A');
  }
  const appliedEnemyWeaken = components.enemyNextDamageWeaken || state.enemyNextDamageWeaken;
  const enemyDamageBeforeShield = won
    ? 0
    : resolveFusionEnemyDamage(
        enemyDamage ?? FUSION_SLICE_RULES.enemyDamage,
        appliedEnemyWeaken,
        state.playerNextDamageMitigation,
      );
  const shieldAbsorbed = Math.min(state.playerShield, enemyDamageBeforeShield);
  const remainingDamage = enemyDamageBeforeShield - shieldAbsorbed;
  const playerHp = won ? healedPlayerHp : Math.max(0, healedPlayerHp - remainingDamage);
  const result: FusionBattleResult = won ? 'won' : playerHp === 0 ? 'lost' : 'active';
  const shouldRecordWeakness = calledWord && weaknessQuality && weaknessQuality !== 'independent';
  const weaknesses = shouldRecordWeakness
    ? [
        { wordId: calledWord.wordId, word: calledWord.word, skillName: skill.skillName, effectPercent },
        ...state.weaknesses.filter(item => item.wordId !== calledWord.wordId),
      ]
    : state.weaknesses;

  const stateAfterSkill: FusionBattleState = {
    enemyHp,
    playerHp: healedPlayerHp,
    playerShield: state.playerShield,
    enemyNextDamageWeaken: appliedEnemyWeaken,
    playerNextDamageMitigation: state.playerNextDamageMitigation,
    result: won ? 'won' : 'active',
    weaknesses,
    turn: state.turn,
  };

  return {
    stateAfterSkill,
    state: {
      enemyHp,
      playerHp,
      playerShield: won ? state.playerShield : Math.max(0, state.playerShield - shieldAbsorbed),
      enemyNextDamageWeaken: 0,
      playerNextDamageMitigation: 0,
      result,
      weaknesses,
      turn: state.turn + (won ? 0 : 1),
    },
    ...components,
    actualHealing,
    enemyDamage: enemyDamageBeforeShield,
    shieldAbsorbed,
    effectPercent,
    calledWord,
  };
}

export function resolveFusionBattleCall(
  state: FusionBattleState,
  call: FusionBattleCall,
  quality: FusionCallQuality,
  options: FusionBattleResolveOptions = {},
): FusionTurnOutcome {
  const multiplier = FUSION_SLICE_RULES.effectMultipliers[quality];
  return resolveFusionSkillTurn({
    state,
    skill: call.skill,
    multiplier,
    effectPercent: Math.round(multiplier * 100),
    calledWord: call.word,
    weaknessQuality: quality,
    enemyDamage: options.enemyDamage,
  });
}

export function resolveFusionNoCallTurn(
  state: FusionBattleState,
  skill: FusionBattleSkill,
): FusionTurnOutcome {
  return resolveFusionSkillTurn({
    state,
    skill,
    multiplier: FUSION_SLICE_RULES.noCallMultiplier,
    effectPercent: Math.round(FUSION_SLICE_RULES.noCallMultiplier * 100),
    calledWord: null,
  });
}

/** Legacy export retained for the V1 validator; it now uses the real 回潮 skill at no-call 40%. */
export function resolveDirectChallengeTurn(
  state: FusionBattleState,
  skill: FusionBattleSkill = FUSION_BATTLE_SKILLS[1],
): FusionBattleState {
  return resolveFusionNoCallTurn(state, skill).state;
}
