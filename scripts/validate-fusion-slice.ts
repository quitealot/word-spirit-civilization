import assert from 'node:assert/strict';
import { createZeroBaseProgress } from '../app/game/zero-base-teaching.ts';
import {
  FUSION_BATTLE_RELATIONS,
  FUSION_SLICE_RULES,
  assertFusionSliceSourceIntegrity,
  createFusionBattleState,
  getFusionBattleEligibleRelations,
  resolveDirectChallengeTurn,
  resolveFusionBattleCall,
} from '../app/game/fusion-slice.ts';

assertFusionSliceSourceIntegrity();

const progress = createZeroBaseProgress();
assert.equal(getFusionBattleEligibleRelations(progress).length, 0, 'Unseen words must not enter battle');
progress.stages.w1718 = 'used';
progress.stages.w729 = 'retrieved';
assert.deepEqual(getFusionBattleEligibleRelations(progress).map(item => item.wordId), ['w1718'], 'Only Used words are battle eligible');
progress.stages.w729 = 'used';
assert.equal(getFusionBattleEligibleRelations(progress).length, 2, 'Both formally sourced Used words should enter battle');

const relation = FUSION_BATTLE_RELATIONS[0];
const independent = resolveFusionBattleCall(createFusionBattleState(), relation, 'independent');
const supported = resolveFusionBattleCall(createFusionBattleState(), relation, 'supported');
const failed = resolveFusionBattleCall(createFusionBattleState(), relation, 'failed');
assert.equal(independent.damage, relation.baseDamage);
assert.equal(supported.damage, Math.round(relation.baseDamage * FUSION_SLICE_RULES.effectMultipliers.supported));
assert.equal(failed.damage, Math.round(relation.baseDamage * FUSION_SLICE_RULES.effectMultipliers.failed));
assert.equal(failed.state.weaknesses.length, 1, 'Failed calls must create a targeted weakness');

let direct = createFusionBattleState();
while (direct.result === 'active') direct = resolveDirectChallengeTurn(direct);
assert.equal(direct.result, 'won', 'Direct challenge must remain possible without injecting unseen English');

console.log('Fusion slice validation passed.');
