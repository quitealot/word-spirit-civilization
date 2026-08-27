import { ZERO_BASE_WORDS, type ZeroBaseProgress } from './zero-base-teaching.ts';

export type FusionCallQuality = 'independent' | 'supported' | 'failed';
export type FusionBattleResult = 'active' | 'won' | 'lost';
export type FusionActionTag = 'station_support';

export type FusionBattleSkill = {
  skillId: 'lange_water_tone' | 'lange_returning_tide';
  skillName: '水音' | '回潮';
  actionTags: readonly FusionActionTag[];
  baseDamage: number;
};

export type FusionBattleWordCandidate = {
  wordId: 'w1718' | 'w729';
  word: 'water' | 'help';
  actionTags: readonly FusionActionTag[];
};

export type FusionBattleCall = {
  skill: FusionBattleSkill;
  word: FusionBattleWordCandidate;
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
  turn: number;
  result: FusionBattleResult;
  weaknesses: FusionWeakness[];
};

export const FUSION_BATTLE_SKILLS: readonly FusionBattleSkill[] = [
  {
    skillId: 'lange_water_tone',
    skillName: '水音',
    actionTags: ['station_support'],
    baseDamage: 24,
  },
  {
    skillId: 'lange_returning_tide',
    skillName: '回潮',
    actionTags: ['station_support'],
    baseDamage: 24,
  },
] as const;

export const FUSION_BATTLE_WORD_CANDIDATES: readonly FusionBattleWordCandidate[] = [
  { wordId: 'w1718', word: 'water', actionTags: ['station_support'] },
  { wordId: 'w729', word: 'help', actionTags: ['station_support'] },
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
  for (const candidate of FUSION_BATTLE_WORD_CANDIDATES) {
    const source = ZERO_BASE_WORDS.find(word => word.wordId === candidate.wordId);
    if (!source || source.word !== candidate.word) {
      throw new Error(`Fusion candidate source mismatch: ${candidate.wordId}/${candidate.word}`);
    }
  }
}

export function getFusionBattleEligibleWords(progress: ZeroBaseProgress): FusionBattleWordCandidate[] {
  return FUSION_BATTLE_WORD_CANDIDATES.filter(candidate => {
    const stage = progress.stages[candidate.wordId];
    return stage === 'used' || stage === 'maintained';
  });
}

export function getFusionCallCandidates(
  skill: FusionBattleSkill,
  eligibleWords: readonly FusionBattleWordCandidate[],
): FusionBattleWordCandidate[] {
  return eligibleWords.filter(candidate => candidate.actionTags.some(tag => skill.actionTags.includes(tag)));
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
  call: FusionBattleCall,
  quality: FusionCallQuality,
): { state: FusionBattleState; damage: number; effectPercent: number } {
  if (state.result !== 'active') return { state, damage: 0, effectPercent: 0 };
  const multiplier = FUSION_SLICE_RULES.effectMultipliers[quality];
  const damage = Math.round(call.skill.baseDamage * multiplier);
  const enemyHp = Math.max(0, state.enemyHp - damage);
  const won = enemyHp === 0;
  const playerHp = won ? state.playerHp : Math.max(0, state.playerHp - FUSION_SLICE_RULES.enemyDamage);
  const result: FusionBattleResult = won ? 'won' : playerHp === 0 ? 'lost' : 'active';
  const effectPercent = Math.round(multiplier * 100);
  const weaknesses = quality === 'independent'
    ? state.weaknesses
    : [
        { wordId: call.word.wordId, word: call.word.word, skillName: call.skill.skillName, effectPercent },
        ...state.weaknesses.filter(item => item.wordId !== call.word.wordId),
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
