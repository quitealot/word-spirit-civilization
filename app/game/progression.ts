import type { MasteryLayer } from './episode-config.ts';
import type { BossPhase, GameSave } from './save.ts';

const MASTERY_RANK: Record<MasteryLayer, number> = { L1: 1, L2: 2, L3: 3 };

/**
 * Boss content is bounded by all three ceilings. FSRS scheduling is not an
 * input here; callers pass the player's current mastery ceiling separately.
 */
export function resolveBossQuestionLayer(
  phaseCap: MasteryLayer,
  playerMasteryCeiling: MasteryLayer,
  approvedContentCeiling: MasteryLayer,
): MasteryLayer {
  return [phaseCap, playerMasteryCeiling, approvedContentCeiling]
    .sort((a, b) => MASTERY_RANK[a] - MASTERY_RANK[b])[0];
}

export function phaseCapForBoss(phase: BossPhase): MasteryLayer {
  if (phase <= 1) return 'L1';
  if (phase === 2) return 'L2';
  return 'L3';
}

export function bossQuestionLayer(
  save: GameSave,
  playerMasteryCeiling: MasteryLayer,
  approvedContentCeiling: MasteryLayer,
): MasteryLayer {
  return resolveBossQuestionLayer(
    phaseCapForBoss(save.episodeState.ep10.bossPhase),
    playerMasteryCeiling,
    approvedContentCeiling,
  );
}

export const EP09_TRACKING_ACTION_CAP = 1;

export function canUsePartnerSwap(save: GameSave): boolean {
  return save.companion && save.episodeState.ep07.swapCooldownRemaining === 0;
}
