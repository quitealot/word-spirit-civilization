import { resolveBossQuestionLayer } from '../app/game/progression.ts';
import { grantLearningGrowth, grantResonanceMilestone, grantStableBattleSkillGrowth, grantWeaknessRecoveryGrowth, getSpiritGrowth } from '../app/game/growth.ts';
import { createEmptySave, completeEpisode, confirmEp06Companion, isEpisodeUnlocked, migrateSave, recordEp09TrackingAction, setEp05Sightings } from '../app/game/save.ts';
import { createTeamBattleState, getActiveSpirit, getSwapAvailability, getSwapCue, resolveEnemyTurn, swapActiveSpirit } from '../app/game/team-battle.ts';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

let save = createEmptySave();
save.starter = '芽语';
save.completed = [1, 2, 3, 4];
save.exploration = 0;
save.sightings = 2;
assert(isEpisodeUnlocked(save, 5), 'EP05 should allow direct challenge after EP04 without a training-volume gate');
assert(!isEpisodeUnlocked(save, 6), 'EP06 must stay locked before third sighting');

save = completeEpisode(setEp05Sightings(save, 3), 5);
assert(isEpisodeUnlocked(save, 6), 'EP06 should unlock after EP05 and third sighting');
save = completeEpisode(confirmEp06Companion(save), 6);
assert(save.episodeState.ep06.teamSpiritIds.length === 2, 'EP06 must create a two-spirit team');
const acquiredTwice = confirmEp06Companion(save);
assert(acquiredTwice.episodeState.ep06.teamSpiritIds.length === 2, 'Companion acquisition must be idempotent');

save.exploration = 34;
assert(isEpisodeUnlocked(save, 7), 'EP07 should unlock for the frozen two-spirit team');
save = completeEpisode(save, 7);
save.exploration = 45;
assert(isEpisodeUnlocked(save, 8), 'EP08 should unlock after EP07');
save = completeEpisode(save, 8);
save.exploration = 58;
assert(isEpisodeUnlocked(save, 9), 'EP09 must not require optional arena completion');

for (const slot of ['tracking_01', 'tracking_02', 'tracking_03'] as const) {
  save = recordEp09TrackingAction(save, slot);
  save = recordEp09TrackingAction(save, slot);
  assert(save.episodeState.ep09.tracking[slot].englishActionCount === 1, `${slot} must cap at one English action`);
}
save = completeEpisode(save, 9);
save.exploration = 72;
assert(isEpisodeUnlocked(save, 10), 'EP10 should unlock after EP09 with L1-earned exploration');

const team = createTeamBattleState({
  battleId: 'regression.ep07',
  spirits: [{ id: '芽语', maxHp: 100 }, { id: 'MIST_PORT_SPIRIT_01', maxHp: 112, tacticalTags: ['guard'] }],
  enemy: { id: 'target', maxHp: 96, nextAttack: { kind: 'heavy', damage: 34 } },
});
assert(getSwapCue(team, 'MIST_PORT_SPIRIT_01')?.reason === 'target_guards_heavy_attack', 'Heavy attack should create a clear swap reason');
const swapped = swapActiveSpirit(team, 'MIST_PORT_SPIRIT_01');
assert(getActiveSpirit(swapped).id === 'MIST_PORT_SPIRIT_01', 'Swap must change the active spirit without a question');
assert(!getSwapAvailability(swapped, '芽语').allowed, 'Immediate repeat swap must be blocked by cooldown');
const afterAttack = resolveEnemyTurn(swapped);
assert(afterAttack.spirits['芽语'].hp === 100, 'Reserve spirit must not take the main attack');
assert(afterAttack.spirits.MIST_PORT_SPIRIT_01.hp < 112, 'Active spirit must take the main attack');
assert(getSwapAvailability(afterAttack, '芽语').allowed, 'Swap should return after one enemy turn');

let growthSave = migrateSave({ starter: '芽语' });
const first = grantLearningGrowth(growthSave, '芽语', 'learning:1:1', false);
growthSave = first.save;
const duplicateOnOtherSpirit = grantLearningGrowth(growthSave, 'MIST_PORT_SPIRIT_01', 'learning:1:1', true);
assert(duplicateOnOtherSpirit.duplicate, 'One learning evidence must not be claimable by another spirit');
const review = grantLearningGrowth(growthSave, '芽语', 'learning:1:2', true);
assert(review.xp >= first.xp, 'Review growth must not be worth less than first correct');
const stableSkill = grantStableBattleSkillGrowth(review.save, '芽语', 5, '101');
assert(!stableSkill.duplicate, 'A stable battle skill should create growth evidence');
const duplicateStableSkill = grantStableBattleSkillGrowth(stableSkill.save, '芽语', 5, '101');
assert(duplicateStableSkill.duplicate, 'The same episode/word battle evidence must not be farmable');
const recovered = grantWeaknessRecoveryGrowth(stableSkill.save, '芽语', 5, '101');
assert(!recovered.duplicate && recovered.resonance >= stableSkill.resonance, 'Weakness recovery should feed visible growth');
const milestone = grantResonanceMilestone(review.save, 'ep07.teamwork', ['芽语', 'MIST_PORT_SPIRIT_01'], 3);
const repeatedMilestone = grantResonanceMilestone(milestone, 'ep07.teamwork', ['芽语', 'MIST_PORT_SPIRIT_01'], 3);
assert(getSpiritGrowth(milestone, '芽语').resonance === getSpiritGrowth(repeatedMilestone, '芽语').resonance, 'Milestones must not repeat');

assert(resolveBossQuestionLayer('L3', 'L1', 'L3') === 'L1', 'Boss must downgrade to the player mastery ceiling');
assert(resolveBossQuestionLayer('L3', 'L3', 'L1') === 'L1', 'Boss must downgrade to the approved content ceiling');

console.log('Gameplay regression validator: PASS');
