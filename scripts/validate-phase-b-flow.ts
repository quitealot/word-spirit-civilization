import assert from 'node:assert/strict';
import {
  FUSION_BATTLE_SKILLS,
  FUSION_SKILL_EFFECT_CONFIG,
  FUSION_SLICE_RULES,
  createFusionBattleState,
  getFusionBattleEligibleWords,
  resolveFusionBattleCall,
  resolveFusionNoCallTurn,
  selectFusionBattleCall,
  type FusionWeakness,
} from '../app/game/fusion-slice.ts';
import {
  beginPhaseBRepair,
  createPhaseBRepairQueue,
  getPhaseBEntry,
  getPhaseBPostBattleStage,
  getPhaseBRepairDestination,
  isPhaseBFlow,
  resolvePhaseBRetrieve,
  shouldShowPhaseBJustUsed,
  showPhaseBRetrieve,
} from '../app/game/phase-b-flow.ts';
import { createZeroBaseProgress, recordTeachingEvidence } from '../app/game/zero-base-teaching.ts';

const waterTone = FUSION_BATTLE_SKILLS[0];
const returningTide = FUSION_BATTLE_SKILLS[1];

// 1. Phase B is query-scoped and leaves default debug routes unchanged.
assert.equal(isPhaseBFlow('?flow=phase-b'), true);
assert.equal(isPhaseBFlow(''), false);
assert.equal(isPhaseBFlow('?flow=debug'), false);

// 2. The existing teaching evidence functions retain formal Used evidence.
let taught = createZeroBaseProgress();
taught = recordTeachingEvidence(taught, 'water', 'used', 'phase-b-water', 0);
taught = recordTeachingEvidence(taught, 'help', 'used', 'phase-b-help', 0);
assert.equal(taught.stages.w1718, 'used');
assert.equal(taught.stages.w729, 'used');

// 3. Entry uses the existing Used-or-Maintained + battleEligible pool.
const entry = getPhaseBEntry(taught);
assert.equal(entry.destination, 'battle');
assert.deepEqual(entry.eligibleWords.map(word => word.wordId), ['w1718', 'w729']);
const maintained = createZeroBaseProgress();
maintained.stages.w1718 = 'maintained';
maintained.evidence.push({ wordId: 'w1718', stage: 'used', eventId: 'prior-used', at: 1, supportLevel: 0 });
assert.deepEqual(getPhaseBEntry(maintained).eligibleWords.map(word => word.wordId), ['w1718']);

// 4. Missing Phase B evidence is an explicit break, never no-call fallback.
assert.equal(getPhaseBEntry(createZeroBaseProgress()).destination, 'evidence_missing');

// 5. The independent Phase A debug path still supports real no-call skills.
const debugNoCall = resolveFusionNoCallTurn(createFusionBattleState(), returningTide);
assert.equal(debugNoCall.calledWord, null);
assert.equal(debugNoCall.effectPercent, 40);
assert.equal(debugNoCall.damage, 4);

// 6. “刚才用过” is limited to the first call of the first battle.
assert.equal(shouldShowPhaseBJustUsed(1, 1), true);
assert.equal(shouldShowPhaseBJustUsed(1, 2), false);
assert.equal(shouldShowPhaseBJustUsed(2, 1), false);

const eligible = getFusionBattleEligibleWords(taught);
const waterCall = selectFusionBattleCall(waterTone, eligible, 1)!;

// 7. Failed calls record only the actual called formal wordId.
const failed = resolveFusionBattleCall(createFusionBattleState(), waterCall, 'failed');
assert.deepEqual(failed.state.weaknesses.map(item => item.wordId), [waterCall.word.wordId]);

// 8. Repeating the same word in one battle keeps one weakness.
const oneWordPool = [eligible[0]];
const repeatedCall = selectFusionBattleCall(waterTone, oneWordPool, failed.state.turn)!;
const repeated = resolveFusionBattleCall(failed.state, repeatedCall, 'failed');
assert.equal(repeated.state.weaknesses.filter(item => item.wordId === waterCall.word.wordId).length, 1);

// 9. A full independent battle produces no fake targeted repair.
let independentState = createFusionBattleState();
while (independentState.result === 'active') {
  const call = selectFusionBattleCall(waterTone, eligible, independentState.turn)!;
  independentState = resolveFusionBattleCall(independentState, call, 'independent').state;
}
assert.equal(independentState.weaknesses.length, 0);
assert.equal(getPhaseBPostBattleStage(independentState.weaknesses), 'end');

// 10. Repair queue is deduplicated and sourced only from approved weaknesses.
const duplicateWeaknesses: FusionWeakness[] = [failed.state.weaknesses[0], failed.state.weaknesses[0]];
assert.deepEqual(createPhaseBRepairQueue(duplicateWeaknesses).map(item => item.wordId), [waterCall.word.wordId]);
const invented = { wordId: 'not-approved', word: 'invented', skillName: '水音', effectPercent: 40 } as unknown as FusionWeakness;
assert.equal(createPhaseBRepairQueue([invented]).length, 0);

// 11. Repair is strictly meaning → retrieve.
const repairStart = beginPhaseBRepair();
assert.equal(repairStart.step, 'meaning');
const retrieve = showPhaseBRetrieve(repairStart);
assert.equal(retrieve.step, 'retrieve');

// 12. A failed retrieve returns to meaning for the same queue index.
const retry = resolvePhaseBRetrieve(retrieve, false, 2);
assert.equal(retry.step, 'meaning');
assert.equal(retry.index, 0);

// 13. Repair transitions do not read or mutate long-term learning stages.
const stagesBeforeRepair = JSON.stringify(taught.stages);
resolvePhaseBRetrieve(showPhaseBRetrieve(beginPhaseBRepair()), true, 1);
assert.equal(JSON.stringify(taught.stages), stagesBeforeRepair);

// 14. Final repair completion points directly to a new battle.
const repairComplete = resolvePhaseBRetrieve(retrieve, true, 1);
assert.equal(repairComplete.complete, true);
assert.equal(getPhaseBRepairDestination(repairComplete), 'battle');

// 15. Either approved repaired word reappears within the first two rematch calls.
const rematchWords = [1, 2].map(turn => selectFusionBattleCall(waterTone, eligible, turn)!.word.wordId);
assert.ok(rematchWords.indexOf('w1718') >= 0 && rematchWords.indexOf('w1718') < 2);
assert.ok(rematchWords.indexOf('w729') >= 0 && rematchWords.indexOf('w729') < 2);

// 16. Phase B preserves all V2 multipliers, no-call config, skills, and response-time independence.
assert.deepEqual(FUSION_SLICE_RULES.effectMultipliers, { independent: 1, supported: 0.7, failed: 0.4 });
assert.equal(FUSION_SLICE_RULES.noCallMultiplier, 0.4);
assert.deepEqual(FUSION_SKILL_EFFECT_CONFIG, {
  lange_water_tone: { damage: 18, enemyNextDamageWeaken: 0.2 },
  lange_returning_tide: { damage: 10, healing: 22 },
});
assert.equal(resolveFusionBattleCall.length, 3, 'Response time must not enter battle resolution');

console.log('Phase B flow validator: PASS (16/16)');
