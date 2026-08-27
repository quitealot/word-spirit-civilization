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
} from '../app/game/fusion-slice.ts';
import { PHASE_B_COMBAT_CANDIDATE_A } from '../app/game/phase-b-flow.ts';

const [waterTone, returningTide] = FUSION_BATTLE_SKILLS;
const candidateWord = FUSION_BATTLE_WORD_CANDIDATES[0];

function createCandidateState(): FusionBattleState {
  return createFusionBattleState({
    playerHp: PHASE_B_COMBAT_CANDIDATE_A.playerMaxHp,
    enemyHp: PHASE_B_COMBAT_CANDIDATE_A.enemyMaxHp,
  });
}

function resolveCandidateTurn(
  state: FusionBattleState,
  skill: FusionBattleSkill,
  quality: FusionCallQuality,
) {
  return resolveFusionBattleCall(
    state,
    { skill, word: candidateWord },
    quality,
    { enemyDamage: PHASE_B_COMBAT_CANDIDATE_A.enemyDamage },
  );
}

function runCandidateSequence(
  sequence: readonly [FusionBattleSkill, FusionCallQuality][],
): { state: FusionBattleState; actions: number } {
  let state = createCandidateState();
  let actions = 0;
  for (const [skill, quality] of sequence) {
    assert.equal(state.result, 'active', `sequence ended before action ${actions + 1}`);
    state = resolveCandidateTurn(state, skill, quality).state;
    actions += 1;
  }
  return { state, actions };
}

// 1. Candidate A is a Phase B-only profile; the Phase A debug profile is unchanged.
assert.deepEqual(PHASE_B_COMBAT_CANDIDATE_A, {
  playerMaxHp: 48,
  enemyMaxHp: 80,
  enemyDamage: 12,
});
assert.equal(FUSION_SLICE_RULES.playerMaxHp, 48);
assert.equal(FUSION_SLICE_RULES.enemyMaxHp, 60);
assert.equal(FUSION_SLICE_RULES.enemyDamage, 8);

// 2. The resolver's optional fourth argument preserves the public arity and default damage.
assert.equal(resolveFusionBattleCall.length, 3);
const defaultDebugState = createFusionBattleState();
assert.deepEqual(
  [defaultDebugState.playerHp, defaultDebugState.enemyHp],
  [48, 60],
);
const defaultDebugCall = resolveFusionBattleCall(
  defaultDebugState,
  { skill: returningTide, word: candidateWord },
  'independent',
);
assert.equal(defaultDebugCall.enemyDamage, 8);
const candidateDamageCall = resolveCandidateTurn(createCandidateState(), waterTone, 'independent');
assert.equal(candidateDamageCall.enemyDamage, 10, '12 × (1 - 20%) = 9.6 → 10');

// 3. Full independent: 水音 → 水音 → 回潮 → 水音 → 水音.
const independentRun = runCandidateSequence([
  [waterTone, 'independent'],
  [waterTone, 'independent'],
  [returningTide, 'independent'],
  [waterTone, 'independent'],
  [waterTone, 'independent'],
]);
assert.equal(independentRun.actions, 5);
assert.equal(independentRun.state.result, 'won');
assert.equal(independentRun.state.enemyHp, 0);
assert.equal(independentRun.state.playerHp, 26);

// 4. One failed call costs an additional enemy-action cycle but remains recoverable.
const oneFailedRun = runCandidateSequence([
  [waterTone, 'failed'],
  [waterTone, 'independent'],
  [returningTide, 'independent'],
  [waterTone, 'independent'],
  [waterTone, 'independent'],
  [waterTone, 'independent'],
]);
assert.equal(oneFailedRun.actions, 6);
assert.equal(oneFailedRun.state.result, 'won');
assert.equal(oneFailedRun.state.playerHp, 16);

// 5. Two consecutive failed calls reach a dangerous but still recoverable line.
const twoFailedRun = runCandidateSequence([
  [waterTone, 'failed'],
  [waterTone, 'failed'],
  [waterTone, 'independent'],
  [returningTide, 'independent'],
  [waterTone, 'independent'],
  [waterTone, 'independent'],
  [waterTone, 'independent'],
]);
assert.equal(twoFailedRun.actions, 7);
assert.equal(twoFailedRun.state.result, 'won');
assert.equal(twoFailedRun.state.playerHp, 6);

// 6. Exhaustively check all-failed choices of the two real skills.
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
  const wins = [waterTone, returningTide].some(skill => {
    const next = resolveCandidateTurn(state, skill, 'failed').state;
    return canAllFailedWin(next);
  });
  failedStateMemo.set(key, wins);
  return wins;
}
assert.equal(canAllFailedWin(createCandidateState()), false);
assert.ok(exploredFailedStates > 0);

// 7. Repair from 40% to 100% improves real battle outcomes, not only the label.
assert.equal(independentRun.actions + 1, oneFailedRun.actions);
assert.equal(independentRun.state.playerHp - oneFailedRun.state.playerHp, 10);
assert.equal(independentRun.state.playerHp > oneFailedRun.state.playerHp, true);

// 8. V2 multipliers, no-call, and both skill effect configurations remain frozen.
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

console.log(`Phase B combat pressure Candidate A validation passed (15/15; explored ${exploredFailedStates} all-failed states).`);
