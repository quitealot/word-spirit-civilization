import { ZERO_BASE_WORDS, type ZeroBaseProgress } from './zero-base-teaching.ts';

export type FusionCallQuality = 'independent' | 'supported' | 'failed';
export type FusionBattleResult = 'active' | 'won' | 'lost';

export type FusionBattleRelation = {
  wordId: 'w1718' | 'w729';
  word: 'water' | 'help';
  skillId: 'lange_water_tone' | 'lange_returning_tide';
  skillName: '水音' | '回潮';
  baseDamage: number;
};

export type FusionWeakness = {
  wordId: FusionBattleRelation['wordId'];
  word: FusionBattleRelation['word'];
  skillName: FusionBattleRelation['skillName'];
  effectPercent: number;
};

export type FusionBattleState = {
  enemyHp: number;
  playerHp: number;
  turn: number;
  result: FusionBattleResult;
  weaknesses: FusionWeakness[];
};

export const FUSION_BATTLE_RELATIONS: readonly FusionBattleRelation[] = [
  { wordId: 'w1718', word: 'water', skillId: 'lange_water_tone', skillName: '水音', baseDamage: 24 },
  { wordId: 'w729', word: 'help', skillId: 'lange_returning_tide', skillName: '回潮', baseDamage: 24 },
] as const;

export const FUSION_SLICE_RULES = {
  id: 'station-daily-to-hp-battle-v1',
  enemyMaxHp: 60,
  playerMaxHp: 48,
  enemyDamage: 8,
  effectMultipliers: {
    independent: 1,
    supported: 0.7,
    failed: 0.4,
  } satisfies Record<FusionCallQuality, number>,
} as const;

export function assertFusionSliceSourceIntegrity(): void {
  for (const relation of FUSION_BATTLE_RELATIONS) {
    const source = ZERO_BASE_WORDS.find(word => word.wordId === relation.wordId);
    if (!source || source.word !== relation.word) {
      throw new Error(`Fusion relation source mismatch: ${relation.wordId}/${relation.word}`);
    }
  }
}

export function getFusionBattleEligibleRelations(progress: ZeroBaseProgress): FusionBattleRelation[] {
  return FUSION_BATTLE_RELATIONS.filter(relation => {
    const stage = progress.stages[relation.wordId];
    return stage === 'used' || stage === 'maintained';
  });
}

export function createFusionBattleState(): FusionBattleState {
  return {
    enemyHp: FUSION_SLICE_RULES.enemyMaxHp,
    playerHp: FUSION_SLICE_RULES.playerMaxHp,
    turn: 1,
    result: 'active',
    weaknesses: [],
  };
}

export function resolveFusionBattleCall(
  state: FusionBattleState,
  relation: FusionBattleRelation,
  quality: FusionCallQuality,
): { state: FusionBattleState; damage: number; effectPercent: number } {
  if (state.result !== 'active') return { state, damage: 0, effectPercent: 0 };
  const multiplier = FUSION_SLICE_RULES.effectMultipliers[quality];
  const damage = Math.round(relation.baseDamage * multiplier);
  const enemyHp = Math.max(0, state.enemyHp - damage);
  const won = enemyHp === 0;
  const playerHp = won ? state.playerHp : Math.max(0, state.playerHp - FUSION_SLICE_RULES.enemyDamage);
  const result: FusionBattleResult = won ? 'won' : playerHp === 0 ? 'lost' : 'active';
  const effectPercent = Math.round(multiplier * 100);
  const weaknesses = quality === 'independent'
    ? state.weaknesses
    : [
        { wordId: relation.wordId, word: relation.word, skillName: relation.skillName, effectPercent },
        ...state.weaknesses.filter(item => item.wordId !== relation.wordId),
      ];
  return {
    state: { enemyHp, playerHp, result, weaknesses, turn: state.turn + (won ? 0 : 1) },
    damage,
    effectPercent,
  };
}

export function resolveDirectChallengeTurn(state: FusionBattleState, baseDamage = 20): FusionBattleState {
  if (state.result !== 'active') return state;
  const enemyHp = Math.max(0, state.enemyHp - baseDamage);
  const won = enemyHp === 0;
  const playerHp = won ? state.playerHp : Math.max(0, state.playerHp - FUSION_SLICE_RULES.enemyDamage);
  return {
    ...state,
    enemyHp,
    playerHp,
    turn: state.turn + (won ? 0 : 1),
    result: won ? 'won' : playerHp === 0 ? 'lost' : 'active',
  };
}
