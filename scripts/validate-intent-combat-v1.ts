import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';
import {
  INTENT_COMBAT_RULES,
  INTENT_COMBAT_SKILLS,
  INTENT_COMBAT_WORDS,
  assertIntentCombatSourceIntegrity,
  createIntentCombatState,
  getIntentCombatChoiceSet,
  getIntentForTurn,
  resolveIntentCombatBattleOnly,
  resolveIntentCombatCall,
  selectIntentCombatCall,
  type IntentBattleSkill,
  type IntentBattleState,
  type IntentCallQuality,
} from '../app/game/intent-combat-v1.ts';

const [waterTone, returningTide, stillWave] = INTENT_COMBAT_SKILLS;
const [water, help] = INTENT_COMBAT_WORDS;

function state(overrides: Partial<IntentBattleState> = {}): IntentBattleState {
  return createIntentCombatState(overrides);
}

function callTurn(
  current: IntentBattleState,
  skill: IntentBattleSkill,
  quality: IntentCallQuality,
  word = selectIntentCombatCall(skill, current.turn).word,
) {
  return resolveIntentCombatCall(current, { skill, word }, quality);
}

// 1. The fixture starts with the paper prototype's visible HP.
assert.deepEqual(
  [INTENT_COMBAT_RULES.playerMaxHp, INTENT_COMBAT_RULES.enemyMaxHp, state()],
  [48, 66, { playerHp: 48, enemyHp: 66, playerShield: 0, pendingEnemyAttackReduction: 0, turn: 1, result: 'active', weaknesses: [] }],
);

// 2–3. The published intent loop is exact and repeats from attack 12 after turn seven.
const intentLabels = Array.from({ length: 9 }, (_, index) => {
  const intent = getIntentForTurn(index + 1);
  return intent.kind === 'attack' ? `${intent.label}${intent.damage}` : `${intent.label}${intent.nextDamage}`;
});
assert.deepEqual(intentLabels, ['攻击12', '攻击18', '蓄力24', '攻击24', '攻击12', '蓄力24', '攻击24', '攻击12', '攻击18']);
assert.equal(getIntentForTurn(3).kind, 'charge');
assert.equal(getIntentForTurn(3).damage, 0);
assert.equal(getIntentForTurn(3).nextDamage, 24);

// 4–6. All three skills expose the locked base results and only three discrete qualities.
assert.deepEqual(
  INTENT_COMBAT_SKILLS.map(skill => [skill.skillName, skill.baseDamage, skill.baseHealing, skill.baseShield, skill.supportedReward, skill.independentReward, skill.rewardKind]),
  [
    ['水音', 12, 0, 0, 3, 6, 'enemy_damage_reduction'],
    ['回潮', 6, 4, 0, 5, 10, 'healing'],
    ['静波', 0, 0, 8, 5, 10, 'shield'],
  ],
);
assert.deepEqual(getIntentCombatChoiceSet(water.wordId)[0], water.targetGloss);
assert.deepEqual(getIntentCombatChoiceSet(help.wordId)[0], help.targetGloss);
assertIntentCombatSourceIntegrity();
assert.deepEqual(selectIntentCombatCall(waterTone, 1).word, water);
assert.deepEqual(selectIntentCombatCall(waterTone, 2).word, help);
assert.deepEqual(selectIntentCombatCall(waterTone, 3).word, water);

// 7–9. A failed call executes the skill's base result, while supported/independent calls add only that skill's reward.
const failedWater = callTurn(state(), waterTone, 'failed');
assert.deepEqual(
  [failedWater.damage, failedWater.enemyDamageReduction, failedWater.enemyDamage, failedWater.stateAfterSkill.pendingEnemyAttackReduction, failedWater.state.pendingEnemyAttackReduction, failedWater.reward, failedWater.state.weaknesses],
  [12, 0, 12, 0, 0, 0, [{ wordId: 'w1718', word: 'water', skillName: '水音', quality: 'failed', turn: 1 }]],
);
const supportedWater = callTurn(state(), waterTone, 'supported');
const independentWater = callTurn(state(), waterTone, 'independent');
assert.deepEqual([supportedWater.damage, supportedWater.enemyDamageReduction, supportedWater.enemyDamage, supportedWater.stateAfterSkill.pendingEnemyAttackReduction, supportedWater.state.pendingEnemyAttackReduction], [12, 3, 9, 3, 0]);
assert.deepEqual([independentWater.damage, independentWater.enemyDamageReduction, independentWater.enemyDamage, independentWater.stateAfterSkill.pendingEnemyAttackReduction, independentWater.state.pendingEnemyAttackReduction], [12, 6, 6, 6, 0]);
const supportedTide = callTurn(state({ playerHp: 30 }), returningTide, 'supported');
const independentTide = callTurn(state({ playerHp: 30 }), returningTide, 'independent');
assert.deepEqual([supportedTide.damage, supportedTide.healing, supportedTide.actualHealing], [6, 9, 9]);
assert.deepEqual([independentTide.damage, independentTide.healing, independentTide.actualHealing], [6, 14, 14]);
const supportedWave = callTurn(state(), stillWave, 'supported');
const independentWave = callTurn(state(), stillWave, 'independent');
assert.deepEqual([supportedWave.damage, supportedWave.shield, supportedWave.reward], [0, 13, 5]);
assert.deepEqual([independentWave.damage, independentWave.shield, independentWave.reward], [0, 18, 10]);

// 10–12. Water's reward waits for the next real attack, survives charge, and is consumed after that attack.
assert.deepEqual(callTurn(state(), waterTone, 'independent').enemyDamage, 6);
assert.deepEqual(callTurn(state({ turn: 2 }), waterTone, 'independent').enemyDamage, 12);
const chargedWater = callTurn(state({ turn: 3 }), waterTone, 'independent');
assert.deepEqual([chargedWater.enemyDamage, chargedWater.stateAfterSkill.pendingEnemyAttackReduction, chargedWater.state.pendingEnemyAttackReduction, chargedWater.state.turn], [0, 6, 6, 4]);
const followingAttack = resolveIntentCombatBattleOnly(chargedWater.state, stillWave);
assert.deepEqual([followingAttack.enemyRawDamage, followingAttack.enemyDamage, followingAttack.stateAfterSkill.pendingEnemyAttackReduction, followingAttack.state.pendingEnemyAttackReduction], [24, 18, 6, 0]);
const kill = callTurn(state({ enemyHp: 12 }), waterTone, 'independent');
assert.deepEqual([kill.stateAfterSkill.pendingEnemyAttackReduction, kill.state.result, kill.enemyActed, kill.enemyDamage, kill.state.pendingEnemyAttackReduction, kill.state.turn], [6, 'won', false, 0, 0, 1]);

// 13–14. Healing caps at max HP; a shield absorbs first and is then cleared after the enemy phase.
const cappedHealing = callTurn(state({ playerHp: 47 }), returningTide, 'independent');
assert.deepEqual([cappedHealing.healing, cappedHealing.actualHealing, cappedHealing.stateAfterSkill.playerHp], [14, 1, 48]);
const shielded = callTurn(state({ playerHp: 30 }), stillWave, 'independent');
assert.deepEqual([shielded.shield, shielded.enemyDamage, shielded.shieldAbsorbed, shielded.playerDamage, shielded.state.playerHp, shielded.state.playerShield], [18, 12, 12, 0, 30, 0]);

// 15–16. Only failed calls produce the real word weakness; battle-only mode never creates English evidence or reward.
assert.equal(independentWater.state.weaknesses.length, 0);
assert.equal(supportedWater.state.weaknesses.length, 0);
const battleOnly = resolveIntentCombatBattleOnly(state(), returningTide);
assert.deepEqual([battleOnly.quality, battleOnly.calledWord, battleOnly.reward, battleOnly.healing, battleOnly.state.weaknesses], [null, null, 0, 4, []]);
const repeatFailure = callTurn(failedWater.state, waterTone, 'failed', water);
assert.deepEqual(repeatFailure.state.weaknesses, [{ wordId: 'w1718', word: 'water', skillName: '水音', quality: 'failed', turn: 2 }]);

// 17. Time is not a resolver input and the prototype does not surface unified percentage feedback.
assert.equal(resolveIntentCombatCall.length, 3);
const pageSource = readFileSync(resolvePath(process.cwd(), 'app/prototype/intent-combat/page.tsx'), 'utf8');
assert.ok(pageSource.includes('英语调用开启'));
assert.ok(pageSource.includes('只测战斗选择'));
assert.ok(pageSource.includes('重新挑战'));
assert.ok(pageSource.includes("showRewards={mode === 'with_calls'}"));
assert.ok(pageSource.includes('showRewards && <>'));
assert.ok(/showRewards\s*&&[\s\S]*rewardSummary/.test(pageSource));
assert.ok(pageSource.includes('resolveIntentCombatBattleOnly'));
assert.ok(pageSource.includes("type FeedbackStep = 'player_result' | 'enemy_result'"));
assert.ok(pageSource.includes("step === 'player_result'"));
assert.ok(pageSource.includes("step === 'enemy_result'"));
assert.ok(pageSource.includes('进入下一回合'));
assert.ok(pageSource.includes('敌人未行动'));
assert.ok(!pageSource.includes("step === 'reward'"));
assert.ok(!pageSource.includes("step === 'state'"));
assert.ok(!pageSource.includes("step === 'enemy'"));
assert.ok(!pageSource.includes("step === 'next'"));
assert.ok(pageSource.includes('下一次攻击'));
assert.ok(pageSource.includes('待生效压制'));
assert.ok(pageSource.includes('pendingEnemyAttackReduction'));
assert.ok(!pageSource.includes('25%'));
assert.ok(!pageSource.includes('40%'));
assert.ok(!pageSource.includes('70%'));
assert.ok(!pageSource.includes('100%'));
assert.ok(!pageSource.includes('setTimeout'));

// 18. The pure battle-only path reaches an explicit loss, and only the loss result renders weaknesses.
let defeated = state();
let defeatTurns = 0;
while (defeated.result === 'active' && defeatTurns < 10) {
  defeated = resolveIntentCombatBattleOnly(defeated, stillWave).state;
  defeatTurns += 1;
}
assert.equal(defeated.result, 'lost');
assert.equal(defeated.playerHp, 0);
assert.deepEqual(defeated.weaknesses, []);
assert.ok(pageSource.includes("stage === 'lost'"));
assert.ok(pageSource.includes('战斗失利'));
assert.ok(pageSource.includes('battle.weaknesses.length > 0'));
assert.ok(pageSource.includes('battle.weaknesses.map'));
assert.equal((pageSource.match(/battle\.weaknesses/g) ?? []).length, 2);

// 19. A fresh state is a complete reset, with no carry-over from the previous battle.
assert.deepEqual(state(), {
  playerHp: 48,
  enemyHp: 66,
  playerShield: 0,
  pendingEnemyAttackReduction: 0,
  turn: 1,
  result: 'active',
  weaknesses: [],
});

console.log('Intent combat V1 validation passed (19/19; intent loop, discrete rewards, source integrity, battle-only mode, explicit defeat evidence, and reset).');
