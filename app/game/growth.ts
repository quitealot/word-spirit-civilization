import type { GameSave } from './save.ts';

export type GrowthSource = 'first_correct' | 'review_correct' | 'battle_skill' | 'weakness_recovered' | 'battle_clear' | 'resonance_milestone';

export type SpiritGrowth = {
  level: number;
  xp: number;
  resonance: number;
};

export type GrowthState = {
  spirits: Record<string, SpiritGrowth>;
  claimedEvidenceIds: string[];
  claimedMilestoneIds: string[];
};

export type GrowthAward = {
  save: GameSave;
  spiritId: string;
  xp: number;
  resonance: number;
  fromLevel: number;
  toLevel: number;
  duplicate: boolean;
};

export const GROWTH_RULES = {
  firstCorrectXp: 8,
  reviewCorrectXp: 10,
  battleClearXp: 20,
  stableBattleSkillXp: 4,
  weaknessRecoveredXp: 8,
  levelThresholds: [0, 40, 95, 165, 250, 350, 465, 595],
} as const;

export function emptyGrowthState(): GrowthState {
  return { spirits: {}, claimedEvidenceIds: [], claimedMilestoneIds: [] };
}

export function defaultSpiritGrowth(): SpiritGrowth {
  return { level: 1, xp: 0, resonance: 0 };
}

export function levelForXp(xp: number): number {
  let level = 1;
  for (let index = 1; index < GROWTH_RULES.levelThresholds.length; index += 1) {
    if (xp < GROWTH_RULES.levelThresholds[index]) break;
    level = index + 1;
  }
  return level;
}

export function getSpiritGrowth(save: GameSave, spiritId: string): SpiritGrowth {
  return save.growth.spirits[spiritId] ?? defaultSpiritGrowth();
}

export function grantLearningGrowth(
  save: GameSave,
  spiritId: string,
  evidenceId: string,
  seenBefore: boolean,
): GrowthAward {
  return grantEvidenceGrowth(
    save,
    spiritId,
    evidenceId,
    seenBefore ? GROWTH_RULES.reviewCorrectXp : GROWTH_RULES.firstCorrectXp,
    seenBefore ? 2 : 1,
  );
}

export function grantBattleGrowth(
  save: GameSave,
  spiritId: string,
  battleInstanceId: string,
): GrowthAward {
  return grantEvidenceGrowth(save, spiritId, `battle:${battleInstanceId}`, GROWTH_RULES.battleClearXp, 2);
}

export function grantStableBattleSkillGrowth(
  save: GameSave,
  spiritId: string,
  episode: number,
  wordId: string,
): GrowthAward {
  return grantEvidenceGrowth(save, spiritId, `battle-skill:ep${episode}:${wordId}`, GROWTH_RULES.stableBattleSkillXp, 1);
}

export function grantWeaknessRecoveryGrowth(
  save: GameSave,
  spiritId: string,
  episode: number,
  wordId: string,
): GrowthAward {
  return grantEvidenceGrowth(save, spiritId, `weakness-recovered:ep${episode}:${wordId}`, GROWTH_RULES.weaknessRecoveredXp, 2);
}

function grantEvidenceGrowth(
  save: GameSave,
  spiritId: string,
  evidenceId: string,
  xp: number,
  resonance: number,
): GrowthAward {
  const current = getSpiritGrowth(save, spiritId);
  if (save.growth.claimedEvidenceIds.includes(evidenceId)) {
    return { save, spiritId, xp: 0, resonance: 0, fromLevel: current.level, toLevel: current.level, duplicate: true };
  }
  const nextXp = current.xp + xp;
  const nextGrowth = { level: levelForXp(nextXp), xp: nextXp, resonance: current.resonance + resonance };
  const nextSave: GameSave = {
    ...save,
    growth: {
      ...save.growth,
      spirits: { ...save.growth.spirits, [spiritId]: nextGrowth },
      claimedEvidenceIds: [...save.growth.claimedEvidenceIds, evidenceId],
    },
  };
  return { save: nextSave, spiritId, xp, resonance, fromLevel: current.level, toLevel: nextGrowth.level, duplicate: false };
}

export function grantResonanceMilestone(
  save: GameSave,
  milestoneId: string,
  spiritIds: readonly string[],
  resonance: number,
): GameSave {
  if (save.growth.claimedMilestoneIds.includes(milestoneId)) return save;
  const spirits = { ...save.growth.spirits };
  for (const spiritId of new Set(spiritIds)) {
    const current = spirits[spiritId] ?? defaultSpiritGrowth();
    spirits[spiritId] = { ...current, resonance: current.resonance + resonance };
  }
  return {
    ...save,
    growth: {
      ...save.growth,
      spirits,
      claimedMilestoneIds: [...save.growth.claimedMilestoneIds, milestoneId],
    },
  };
}
