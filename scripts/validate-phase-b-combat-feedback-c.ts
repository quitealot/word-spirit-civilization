import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';
import {
  FUSION_BATTLE_SKILLS,
  FUSION_BATTLE_WORD_CANDIDATES,
  FUSION_SKILL_EFFECT_CONFIG,
  FUSION_SLICE_RULES,
  createFusionBattleState,
  getFusionBattleEligibleWords,
  getFusionCallCandidates,
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
  PHASE_B_COMBAT_CANDIDATE_C,
  PHASE_B_COMBAT_FEEDBACK_SEQUENCE,
  PHASE_B_COMBAT_FEEDBACK_TIMING,
  getPhaseBEntry,
} from '../app/game/phase-b-flow.ts';
import { createZeroBaseProgress, recordTeachingEvidence } from '../app/game/zero-base-teaching.ts';

const [waterTone, returningTide] = FUSION_BATTLE_SKILLS;
const candidateWord = FUSION_BATTLE_WORD_CANDIDATES[0];
const taught = ['water', 'help'].reduce(
  (progress, word, index) => recordTeachingEvidence(progress, word, 'used', `candidate-c-${word}`, index),
  createZeroBaseProgress(),
);
const eligible = getFusionBattleEligibleWords(taught);

type CombatProfile = {
  readonly playerMaxHp: number;
  readonly enemyMaxHp: number;
  readonly enemyDamage: number;
};

function createCandidateState(profile: CombatProfile): FusionBattleState {
  return createFusionBattleState({
    playerHp: profile.playerMaxHp,
    enemyHp: profile.enemyMaxHp,
  });
}

function resolveCandidateTurn(
  profile: CombatProfile,
  state: FusionBattleState,
  skill: FusionBattleSkill,
  quality: FusionCallQuality,
): FusionTurnOutcome {
  return resolveFusionBattleCall(
    state,
    { skill, word: candidateWord },
    quality,
    {
      enemyDamage: profile.enemyDamage,
      qualityMultiplier: profile === PHASE_B_COMBAT_CANDIDATE_C && quality === 'failed'
        ? PHASE_B_COMBAT_CANDIDATE_C.failedMultiplier
        : undefined,
    },
  );
}

function runCandidateSequence(
  profile: CombatProfile,
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

// 1–4. Candidate C is isolated, while A/B and the default Phase A profile remain intact.
assert.deepEqual(PHASE_B_COMBAT_CANDIDATE_A, { playerMaxHp: 48, enemyMaxHp: 80, enemyDamage: 12 });
assert.deepEqual(PHASE_B_COMBAT_CANDIDATE_B, { playerMaxHp: 48, enemyMaxHp: 80, enemyDamage: 14 });
assert.deepEqual(PHASE_B_COMBAT_CANDIDATE_C, {
  playerMaxHp: 48,
  enemyMaxHp: 80,
  enemyDamage: 14,
  failedMultiplier: 0.25,
  noCallMultiplier: 0.25,
});
assert.deepEqual(
  [FUSION_SLICE_RULES.playerMaxHp, FUSION_SLICE_RULES.enemyMaxHp, FUSION_SLICE_RULES.enemyDamage],
  [48, 60, 8],
);
assert.deepEqual(FUSION_SLICE_RULES.effectMultipliers, { independent: 1, supported: 0.7, failed: 0.4 });
assert.equal(FUSION_SLICE_RULES.noCallMultiplier, 0.4);

// 5–7. Candidate C changes only failed/no-call through explicit encounter options.
assert.equal(resolveFusionBattleCall.length, 3);
assert.deepEqual(FUSION_SKILL_EFFECT_CONFIG, {
  lange_water_tone: { damage: 18, enemyNextDamageWeaken: 0.2 },
  lange_returning_tide: { damage: 10, healing: 22 },
});
assert.deepEqual(getFusionCallCandidates(waterTone, eligible).map(word => word.wordId), ['w1718', 'w729']);
const cWaterFailed = resolveCandidateTurn(PHASE_B_COMBAT_CANDIDATE_C, createCandidateState(PHASE_B_COMBAT_CANDIDATE_C), waterTone, 'failed');
assert.deepEqual(
  [cWaterFailed.damage, cWaterFailed.effectPercent, cWaterFailed.enemyNextDamageWeaken, cWaterFailed.enemyDamage],
  [5, 25, 0.05, 13],
);
const cTideFailed = resolveCandidateTurn(
  PHASE_B_COMBAT_CANDIDATE_C,
  createFusionBattleState({ playerHp: 30, enemyHp: PHASE_B_COMBAT_CANDIDATE_C.enemyMaxHp }),
  returningTide,
  'failed',
);
assert.deepEqual([cTideFailed.damage, cTideFailed.actualHealing, cTideFailed.healing], [3, 6, 6]);
const defaultFailed = resolveFusionBattleCall(createFusionBattleState(), { skill: returningTide, word: candidateWord }, 'failed');
assert.deepEqual([defaultFailed.damage, defaultFailed.healing, defaultFailed.effectPercent], [4, 9, 40]);

// 8–10. The Candidate C pressure curve preserves recovery after one miss, but two misses lose the representative line.
const independentRun = runCandidateSequence(PHASE_B_COMBAT_CANDIDATE_C, [
  [waterTone, 'independent'],
  [waterTone, 'independent'],
  [returningTide, 'independent'],
  [waterTone, 'independent'],
  [waterTone, 'independent'],
]);
assert.deepEqual([independentRun.actions, independentRun.state.result, independentRun.state.playerHp], [5, 'won', 23]);
const oneFailedRun = runCandidateSequence(PHASE_B_COMBAT_CANDIDATE_C, [
  [waterTone, 'failed'],
  [waterTone, 'independent'],
  [returningTide, 'independent'],
  [waterTone, 'independent'],
  [waterTone, 'independent'],
  [waterTone, 'independent'],
]);
assert.deepEqual([oneFailedRun.actions, oneFailedRun.state.result, oneFailedRun.state.playerHp], [6, 'won', 10]);
const twoFailedRun = runCandidateSequence(PHASE_B_COMBAT_CANDIDATE_C, [
  [waterTone, 'failed'],
  [waterTone, 'failed'],
  [waterTone, 'independent'],
  [returningTide, 'independent'],
  [waterTone, 'independent'],
  [waterTone, 'independent'],
  [waterTone, 'independent'],
]);
assert.deepEqual([twoFailedRun.actions, twoFailedRun.state.result, twoFailedRun.state.enemyHp], [6, 'lost', 6]);
assert.equal(independentRun.actions < oneFailedRun.actions, true);
assert.equal(independentRun.state.playerHp > oneFailedRun.state.playerHp, true);

// 11–13. Every all-failed C strategy loses, no-call is independently configured, and evidence gaps stay explicit.
let exploredFailedStates = 0;
const failedMemo = new Map<string, boolean>();
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
  const remembered = failedMemo.get(key);
  if (remembered !== undefined) return remembered;
  exploredFailedStates += 1;
  const wins = FUSION_BATTLE_SKILLS.some(skill =>
    canAllFailedWin(resolveCandidateTurn(PHASE_B_COMBAT_CANDIDATE_C, state, skill, 'failed').state),
  );
  failedMemo.set(key, wins);
  return wins;
}
assert.equal(canAllFailedWin(createCandidateState(PHASE_B_COMBAT_CANDIDATE_C)), false);
assert.ok(exploredFailedStates > 0);
const cNoCall = resolveFusionNoCallTurn(
  createFusionBattleState({ playerHp: 30, enemyHp: PHASE_B_COMBAT_CANDIDATE_C.enemyMaxHp }),
  returningTide,
  {
    noCallMultiplier: PHASE_B_COMBAT_CANDIDATE_C.noCallMultiplier,
    enemyDamage: PHASE_B_COMBAT_CANDIDATE_C.enemyDamage,
  },
);
assert.deepEqual([cNoCall.calledWord, cNoCall.damage, cNoCall.healing, cNoCall.actualHealing, cNoCall.effectPercent], [null, 3, 6, 6, 25]);
const defaultNoCall = resolveFusionNoCallTurn(createFusionBattleState(), returningTide);
assert.deepEqual([defaultNoCall.damage, defaultNoCall.healing, defaultNoCall.enemyDamage, defaultNoCall.effectPercent], [4, 9, 8, 40]);
assert.equal(getPhaseBEntry(createZeroBaseProgress()).destination, 'evidence_missing');

// 14–17. The locked feedback constants encode the mature sequential turn and kill shortcut.
assert.deepEqual(PHASE_B_COMBAT_FEEDBACK_TIMING, {
  skillResultHoldMs: 1200,
  enemyPrepareMs: 400,
  enemyDamageHoldMs: 1200,
});
assert.deepEqual(PHASE_B_COMBAT_FEEDBACK_SEQUENCE, ['skill_result', 'enemy_prepare', 'enemy_damage', 'next_turn']);
const kill = resolveFusionBattleCall(
  createFusionBattleState({ playerHp: 48, enemyHp: 5 }),
  { skill: waterTone, word: candidateWord },
  'independent',
  { enemyDamage: PHASE_B_COMBAT_CANDIDATE_C.enemyDamage },
);
assert.deepEqual([kill.state.result, kill.enemyDamage], ['won', 0]);

// 18–20. Source-level checks ensure the UI uses C, locks the transient phases, and exposes explicit defeat.
const pageSource = readFileSync(resolvePath(process.cwd(), 'app/prototype/fusion-slice/page.tsx'), 'utf8');
assert.ok(pageSource.includes('PHASE_B_COMBAT_CANDIDATE_C'));
assert.ok(pageSource.includes('PHASE_B_COMBAT_FEEDBACK_TIMING.skillResultHoldMs'));
assert.ok(pageSource.includes("setFeedback('敌方行动')"));
assert.ok(pageSource.includes("setFeedback(`-${outcome.enemyDamage} HP`)"));
assert.ok(pageSource.includes("stage === 'battle_lost'"));
assert.ok(pageSource.includes('战斗失利'));

console.log(
  `Phase B combat feedback Candidate C validation passed (20/20; all-failed states ${exploredFailedStates}; sequence ${PHASE_B_COMBAT_FEEDBACK_SEQUENCE.join(' → ')}).`,
);
