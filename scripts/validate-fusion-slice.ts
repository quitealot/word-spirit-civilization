import assert from 'node:assert/strict';
import { createZeroBaseProgress } from '../app/game/zero-base-teaching.ts';
import {
  FUSION_BATTLE_SKILLS,
  FUSION_SLICE_RULES,
  assertFusionSliceSourceIntegrity,
  createFusionBattleState,
  getFusionBattleEligibleWords,
  getFusionCallCandidates,
  resolveDirectChallengeTurn,
  resolveFusionBattleCall,
  selectFusionBattleCall,
} from '../app/game/fusion-slice.ts';

assertFusionSliceSourceIntegrity();

const progress = createZeroBaseProgress();
assert.equal(getFusionBattleEligibleWords(progress).length, 0, 'Unseen words must not enter battle');
progress.stages.w1718 = 'used';
progress.stages.w729 = 'retrieved';
assert.deepEqual(getFusionBattleEligibleWords(progress).map(item => item.wordId), ['w1718'], 'Only Used words are battle eligible');
progress.stages.w729 = 'used';
const eligibleWords = getFusionBattleEligibleWords(progress);
assert.equal(eligibleWords.length, 2, 'Both formally sourced Used words should enter battle');

for (const skill of FUSION_BATTLE_SKILLS) {
  assert.deepEqual(
    getFusionCallCandidates(skill, eligibleWords).map(item => item.wordId),
    ['w1718', 'w729'],
    'Each skill must draw from the current semantic candidate pool rather than own one fixed word',
  );
}
assert.equal(selectFusionBattleCall(FUSION_BATTLE_SKILLS[0], eligibleWords, 1)?.word.wordId, 'w1718');
assert.equal(selectFusionBattleCall(FUSION_BATTLE_SKILLS[0], eligibleWords, 2)?.word.wordId, 'w729');
assert.equal(selectFusionBattleCall(FUSION_BATTLE_SKILLS[1], eligibleWords, 1)?.word.wordId, 'w1718');

const call = selectFusionBattleCall(FUSION_BATTLE_SKILLS[0], eligibleWords, 1)!;
const independent = resolveFusionBattleCall(createFusionBattleState(), call, 'independent');
const supported = resolveFusionBattleCall(createFusionBattleState(), call, 'supported');
const failed = resolveFusionBattleCall(createFusionBattleState(), call, 'failed');
assert.equal(independent.damage, call.skill.baseDamage);
assert.equal(supported.damage, Math.round(call.skill.baseDamage * FUSION_SLICE_RULES.effectMultipliers.supported));
assert.equal(failed.damage, Math.round(call.skill.baseDamage * FUSION_SLICE_RULES.effectMultipliers.failed));
assert.equal(failed.state.weaknesses.length, 1, 'Failed calls must create a targeted weakness');

let direct = createFusionBattleState();
while (direct.result === 'active') direct = resolveDirectChallengeTurn(direct);
assert.equal(direct.result, 'won', 'Direct challenge must remain possible without injecting unseen English');

console.log('Fusion slice validation passed.');
