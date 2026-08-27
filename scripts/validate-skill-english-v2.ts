import assert from 'node:assert/strict';
import { createZeroBaseProgress, type TeachingStage } from '../app/game/zero-base-teaching.ts';
import {
  FUSION_BATTLE_SKILLS,
  FUSION_SKILL_EFFECT_CONFIG,
  FUSION_SLICE_RULES,
  createFusionBattleState,
  getFusionBattleEligibleWords,
  getFusionCallCandidates,
  resolveFusionBattleCall,
  resolveFusionNoCallTurn,
  resolveFusionSkillComponents,
  selectFusionBattleCall,
} from '../app/game/fusion-slice.ts';

const waterTone = FUSION_BATTLE_SKILLS.find(skill => skill.skillId === 'lange_water_tone')!;
const returningTide = FUSION_BATTLE_SKILLS.find(skill => skill.skillId === 'lange_returning_tide')!;

for (const stage of ['unseen', 'introduced', 'guided', 'retrieved'] satisfies TeachingStage[]) {
  const progress = createZeroBaseProgress();
  progress.stages.w1718 = stage;
  assert.equal(getFusionBattleEligibleWords(progress).length, 0, `${stage} must not enter the battle pool`);
}

const usedProgress = createZeroBaseProgress();
usedProgress.stages.w1718 = 'used';
assert.deepEqual(getFusionBattleEligibleWords(usedProgress).map(word => word.wordId), ['w1718']);

const invalidMaintained = createZeroBaseProgress();
invalidMaintained.stages.w1718 = 'maintained';
assert.equal(getFusionBattleEligibleWords(invalidMaintained).length, 0, 'Maintained cannot bypass prior Used evidence');

const maintainedProgress = createZeroBaseProgress();
maintainedProgress.stages.w1718 = 'used';
maintainedProgress.evidence.push({ wordId: 'w1718', stage: 'used', eventId: 'phase-a-used', at: 1, supportLevel: 0 });
maintainedProgress.stages.w1718 = 'maintained';
assert.deepEqual(getFusionBattleEligibleWords(maintainedProgress).map(word => word.wordId), ['w1718']);

const bothProgress = createZeroBaseProgress();
bothProgress.stages.w1718 = 'used';
bothProgress.stages.w729 = 'used';
const eligibleWords = getFusionBattleEligibleWords(bothProgress);
assert.deepEqual(getFusionCallCandidates(waterTone, eligibleWords), eligibleWords, 'Water Tone must use the shared pool');
assert.deepEqual(getFusionCallCandidates(returningTide, eligibleWords), eligibleWords, 'Returning Tide must use the shared pool');

const firstWaterToneCall = selectFusionBattleCall(waterTone, eligibleWords, 1)!;
assert.equal(firstWaterToneCall.word.word, 'water');
const firstWaterToneOutcome = resolveFusionBattleCall(createFusionBattleState(), firstWaterToneCall, 'independent');
const secondWaterToneCall = selectFusionBattleCall(waterTone, eligibleWords, firstWaterToneOutcome.state.turn)!;
assert.equal(secondWaterToneCall.word.word, 'help', 'Consecutive Water Tone turns must rotate water -> help');
assert.equal(selectFusionBattleCall(returningTide, eligibleWords, 1)?.word.word, 'water', 'A new Returning Tide battle must also start with water');

const qualities = ['independent', 'supported', 'failed'] as const;
const waterExpected = [
  { damage: 18, weaken: 0.2 },
  { damage: 13, weaken: 0.14 },
  { damage: 7, weaken: 0.08 },
] as const;
const tideExpected = [
  { damage: 10, healing: 22 },
  { damage: 7, healing: 15 },
  { damage: 4, healing: 9 },
] as const;

for (const [index, quality] of qualities.entries()) {
  const waterCall = selectFusionBattleCall(waterTone, eligibleWords, 1)!;
  const waterOutcome = resolveFusionBattleCall(createFusionBattleState({ playerHp: 20 }), waterCall, quality);
  assert.equal(waterOutcome.damage, waterExpected[index].damage);
  assert.ok(Math.abs(waterOutcome.enemyNextDamageWeaken - waterExpected[index].weaken) < 1e-12);

  const tideCall = selectFusionBattleCall(returningTide, eligibleWords, 1)!;
  const tideOutcome = resolveFusionBattleCall(createFusionBattleState({ playerHp: 10 }), tideCall, quality);
  assert.equal(tideOutcome.damage, tideExpected[index].damage);
  assert.equal(tideOutcome.healing, tideExpected[index].healing);
  assert.equal(tideOutcome.actualHealing, tideExpected[index].healing);
}

assert.equal(resolveFusionSkillComponents('lange_returning_tide', 0.7).healing, 15, '22 × 0.70 must round once to 15');
assert.equal(firstWaterToneOutcome.enemyDamage, 6, '8 damage weakened by 20% must round once to 6');

const killingCall = selectFusionBattleCall(returningTide, eligibleWords, 1)!;
const killingOutcome = resolveFusionBattleCall(createFusionBattleState({ enemyHp: 10, playerHp: 20 }), killingCall, 'independent');
assert.equal(killingOutcome.state.result, 'won');
assert.equal(killingOutcome.enemyDamage, 0, 'A defeated enemy must not act');
assert.equal(killingOutcome.state.playerHp, 42, 'Healing applies before the defeated enemy skips its action');

const noCallWater = resolveFusionNoCallTurn(createFusionBattleState(), waterTone);
assert.equal(noCallWater.calledWord, null);
assert.equal(noCallWater.state.weaknesses.length, 0);
assert.equal(noCallWater.damage, 7);
assert.ok(Math.abs(noCallWater.enemyNextDamageWeaken - 0.08) < 1e-12);

const noCallTide = resolveFusionNoCallTurn(createFusionBattleState({ playerHp: 20 }), returningTide);
assert.equal(noCallTide.calledWord, null);
assert.equal(noCallTide.state.weaknesses.length, 0);
assert.equal(noCallTide.damage, 4);
assert.equal(noCallTide.healing, 9);
assert.equal(noCallTide.actualHealing, 9);
assert.equal(noCallTide.stateAfterSkill.playerHp, 29, 'Recovery must be exposed before the enemy action');
assert.equal(noCallTide.state.playerHp, 21, 'Enemy damage must follow the visible recovery phase');
assert.deepEqual(FUSION_BATTLE_SKILLS.map(skill => skill.skillName), ['水音', '回潮'], 'No temporary basic skill may exist');

let direct = createFusionBattleState();
let directTurns = 0;
while (direct.result === 'active' && directTurns < 30) {
  direct = resolveFusionNoCallTurn(direct, returningTide).state;
  directTurns += 1;
}
assert.equal(direct.result, 'won', 'A real no-call skill strategy must be able to win');

assert.equal(FUSION_SLICE_RULES.effectMultipliers.independent, 1);
assert.equal(FUSION_SLICE_RULES.effectMultipliers.supported, 0.7);
assert.equal(FUSION_SLICE_RULES.effectMultipliers.failed, 0.4);
assert.equal(FUSION_SLICE_RULES.noCallMultiplier, 0.4);
assert.notEqual(
  Object.prototype.hasOwnProperty.call(FUSION_SLICE_RULES.effectMultipliers, 'noCall'),
  true,
  'noCall must remain a separate configuration key',
);
assert.equal(resolveFusionSkillComponents.length, 2, 'Immediate effects accept only skill config and quality multiplier, never response time');
assert.deepEqual(FUSION_SKILL_EFFECT_CONFIG, {
  lange_water_tone: { damage: 18, enemyNextDamageWeaken: 0.2 },
  lange_returning_tide: { damage: 10, healing: 22 },
});

console.log('Skill × English V2 Phase A validator: PASS');
