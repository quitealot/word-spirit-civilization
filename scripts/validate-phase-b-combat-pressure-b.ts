import assert from 'node:assert/strict';
import {
  FUSION_BATTLE_SKILLS,
  FUSION_BATTLE_WORD_CANDIDATES,
  FUSION_SKILL_EFFECT_CONFIG,
  FUSION_SLICE_RULES,
  createFusionBattleState,
  resolveFusionBattleCall,
  resolveFusionNoCallTurn,
  type FusionBattleSkill,
  type FusionBattleState,
  type FusionCallQuality,
  type FusionTurnOutcome,
} from '../app/game/fusion-slice.ts';
import {
  PHASE_B_COMBAT_CANDIDATE_A,
  PHASE_B_COMBAT_CANDIDATE_B,
} from '../app/game/phase-b-flow.ts';

const [waterTone, returningTide] = FUSION_BATTLE_SKILLS;
const candidateWord = FUSION_BATTLE_WORD_CANDIDATES[0];
type CombatPressureProfile = {
  readonly playerMaxHp: number;
  readonly enemyMaxHp: number;
  readonly enemyDamage: number;
};

function createCandidateState(profile: CombatPressureProfile): FusionBattleState {
  return createFusionBattleState({
    playerHp: profile.playerMaxHp,
    enemyHp: profile.enemyMaxHp,
  });
}

function resolveCandidateTurn(
  profile: CombatPressureProfile,
  state: FusionBattleState,
  skill: FusionBattleSkill,
  quality: FusionCallQuality,
) {
  return resolveFusionBattleCall(
    state,
    { skill, word: candidateWord },
    quality,
    { enemyDamage: profile.enemyDamage },
  );
}

function runCandidateSequence(
  profile: CombatPressureProfile,
  sequence: readonly [FusionBattleSkill, FusionCallQuality][],
) {
  let state = createCandidateState(profile);
  const outcomes: FusionTurnOutcome[] = [];
  for (const [skill, quality] of sequence) {
    if (state.result !== 'active') break;
    const outcome = resolveCandidateTurn(profile, state, skill, quality);
    outcomes.push(outcome);
    state = outcome.state;
  }
  return { state, actions: outcomes.length, outcomes };
}

// 1–3. Candidate profiles and the default Phase A debug profile are all preserved.
assert.deepEqual(PHASE_B_COMBAT_CANDIDATE_A, {
  playerMaxHp: 48,
  enemyMaxHp: 80,
  enemyDamage: 12,
});
assert.deepEqual(PHASE_B_COMBAT_CANDIDATE_B, {
  playerMaxHp: 48,
  enemyMaxHp: 80,
  enemyDamage: 14,
});
assert.deepEqual(
  [FUSION_SLICE_RULES.playerMaxHp, FUSION_SLICE_RULES.enemyMaxHp, FUSION_SLICE_RULES.enemyDamage],
  [48, 60, 8],
);

// 4–6. Candidate B uses the existing resolver interface and the locked damage curve.
assert.equal(resolveFusionBattleCall.length, 3);
const bInitial = createCandidateState(PHASE_B_COMBAT_CANDIDATE_B);
const bWaterIndependent = resolveCandidateTurn(PHASE_B_COMBAT_CANDIDATE_B, bInitial, waterTone, 'independent');
assert.equal(bWaterIndependent.enemyDamage, 11, '14 × (1 - 20%) = 11.2 → 11');
const bWaterFailed = resolveCandidateTurn(PHASE_B_COMBAT_CANDIDATE_B, bInitial, waterTone, 'failed');
assert.equal(bWaterFailed.enemyDamage, 13, '14 × (1 - 8%) = 12.88 → 13');

// 7. Full independent: 水音 → 水音 → 回潮 → 水音 → 水音.
const independentRun = runCandidateSequence(PHASE_B_COMBAT_CANDIDATE_B, [
  [waterTone, 'independent'],
  [waterTone, 'independent'],
  [returningTide, 'independent'],
  [waterTone, 'independent'],
  [waterTone, 'independent'],
]);
assert.equal(independentRun.actions, 5);
assert.equal(independentRun.state.result, 'won');
assert.equal(independentRun.state.enemyHp, 0);
assert.equal(independentRun.state.playerHp, 23);

// 8. One failed call remains recoverable, but leaves a materially tighter line.
const oneFailedRun = runCandidateSequence(PHASE_B_COMBAT_CANDIDATE_B, [
  [waterTone, 'failed'],
  [waterTone, 'independent'],
  [returningTide, 'independent'],
  [waterTone, 'independent'],
  [waterTone, 'independent'],
  [waterTone, 'independent'],
]);
assert.equal(oneFailedRun.actions, 6);
assert.equal(oneFailedRun.state.result, 'won');
assert.equal(oneFailedRun.state.playerHp, 10);

// 9. Two consecutive failed calls now put the representative recovery line into lost.
const twoFailedRun = runCandidateSequence(PHASE_B_COMBAT_CANDIDATE_B, [
  [waterTone, 'failed'],
  [waterTone, 'failed'],
  [waterTone, 'independent'],
  [returningTide, 'independent'],
  [waterTone, 'independent'],
  [waterTone, 'independent'],
  [waterTone, 'independent'],
]);
assert.equal(twoFailedRun.actions, 6);
assert.equal(twoFailedRun.state.result, 'lost');
assert.equal(twoFailedRun.state.enemyHp, 2);

// 10. Exhaustively check that no all-failed Candidate B strategy can win.
let exploredFailedStates = 0;
const failedStateMemo = new Map<string, boolean>();
function canAllFailedWin(state: FusionBattleState): boolean {
  if (state.result === 'won') return true;
  if (state.result === 'lost') return false;
  const key = JSON.stringify({
    enemyHp: state.enemyHp,
    playerHp: state.playerHp,
    playerShield: state.playerShield,
    enemyNextDamageWeaken: state.enemyNextDamageWeaken,
    playerNextDamageMitigation: state.playerNextDamageMitigation,
  });
  const remembered = failedStateMemo.get(key);
  if (remembered !== undefined) return remembered;
  exploredFailedStates += 1;
  const wins = FUSION_BATTLE_SKILLS.some(skill =>
    canAllFailedWin(resolveCandidateTurn(PHASE_B_COMBAT_CANDIDATE_B, state, skill, 'failed').state),
  );
  failedStateMemo.set(key, wins);
  return wins;
}
assert.equal(canAllFailedWin(createCandidateState(PHASE_B_COMBAT_CANDIDATE_B)), false);
assert.ok(exploredFailedStates > 0);

// 11. Candidate B creates earlier all-failed pressure than the retained A profile.
function maxAllFailedActions(profile: CombatPressureProfile): number {
  const memo = new Map<string, number>();
  function walk(state: FusionBattleState): number {
    if (state.result !== 'active') return 0;
    const key = JSON.stringify({
      enemyHp: state.enemyHp,
      playerHp: state.playerHp,
      playerShield: state.playerShield,
      enemyNextDamageWeaken: state.enemyNextDamageWeaken,
      playerNextDamageMitigation: state.playerNextDamageMitigation,
    });
    const remembered = memo.get(key);
    if (remembered !== undefined) return remembered;
    const maxActions = Math.max(...FUSION_BATTLE_SKILLS.map(skill =>
      1 + walk(resolveCandidateTurn(profile, state, skill, 'failed').state),
    ));
    memo.set(key, maxActions);
    return maxActions;
  }
  return walk(createCandidateState(profile));
}
const candidateAMaxFailedActions = maxAllFailedActions(PHASE_B_COMBAT_CANDIDATE_A);
const candidateBMaxFailedActions = maxAllFailedActions(PHASE_B_COMBAT_CANDIDATE_B);
assert.equal(candidateAMaxFailedActions, 14);
assert.equal(candidateBMaxFailedActions, 8);
assert.ok(candidateBMaxFailedActions < candidateAMaxFailedActions);

// 12. Repair from 40% to 100% improves real battle outcomes, including the recovery skill.
assert.equal(oneFailedRun.actions, independentRun.actions + 1);
assert.equal(independentRun.state.playerHp - oneFailedRun.state.playerHp, 13);
assert.equal(independentRun.state.playerHp > oneFailedRun.state.playerHp, true);
assert.equal(oneFailedRun.outcomes[2].actualHealing, 22);

// 13–15. Multipliers, no-call, and the two skill identities remain frozen.
assert.deepEqual(FUSION_SLICE_RULES.effectMultipliers, {
  independent: 1,
  supported: 0.7,
  failed: 0.4,
});
assert.equal(FUSION_SLICE_RULES.noCallMultiplier, 0.4);
assert.deepEqual(FUSION_SKILL_EFFECT_CONFIG, {
  lange_water_tone: { damage: 18, enemyNextDamageWeaken: 0.2 },
  lange_returning_tide: { damage: 10, healing: 22 },
});
const defaultNoCall = resolveFusionNoCallTurn(createFusionBattleState(), returningTide);
assert.equal(defaultNoCall.calledWord, null);
assert.equal(defaultNoCall.damage, 4);
assert.equal(defaultNoCall.healing, 9);
assert.equal(defaultNoCall.enemyDamage, 8);
assert.equal(defaultNoCall.state.enemyHp, 56);
assert.equal(defaultNoCall.state.playerHp, 40);

// 16. The full independent line is visibly better than the repaired-from-failure line.
assert.equal(independentRun.actions < oneFailedRun.actions, true);
assert.equal(independentRun.state.playerHp - oneFailedRun.state.playerHp, 13);

console.log(
  `Phase B combat pressure Candidate B validation passed (16/16; all-failed states ${exploredFailedStates}; max actions A=${candidateAMaxFailedActions}, B=${candidateBMaxFailedActions}).`,
);
