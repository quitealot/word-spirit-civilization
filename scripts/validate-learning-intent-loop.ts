import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';
import { createActor } from 'xstate';
import {
  INTENT_COMBAT_SKILLS,
  INTENT_COMBAT_WORDS,
  createIntentCombatState,
  resolveIntentCombatCall,
  type IntentBattleSkill,
  type IntentBattleWord,
} from '../app/game/intent-combat-v1.ts';
import {
  createLearningIntentRepairQueue,
  getLearningIntentEligibleWords,
  learningIntentMachine,
} from '../app/game/learning-intent-machine.ts';
import {
  ZERO_BASE_WORDS,
  createZeroBaseProgress,
  recordTeachingEvidence,
} from '../app/game/zero-base-teaching.ts';

const [waterTone, returningTide, stillWave] = INTENT_COMBAT_SKILLS;

let completeProgress = createZeroBaseProgress();
completeProgress = recordTeachingEvidence(completeProgress, 'water', 'used', 'loop_water_used', 0);
completeProgress = recordTeachingEvidence(completeProgress, 'help', 'used', 'loop_help_used', 0);
const eligibleWords = getLearningIntentEligibleWords(completeProgress);

function actor(words: readonly IntentBattleWord[] = eligibleWords) {
  const service = createActor(learningIntentMachine).start();
  service.send({ type: 'CHECK_EVIDENCE', eligibleWords: words });
  return service;
}

function selected(service: ReturnType<typeof actor>) {
  const call = service.getSnapshot().context.selectedCall;
  assert.ok(call);
  return call;
}

function answerCorrect(service: ReturnType<typeof actor>) {
  const call = selected(service);
  service.send({ type: 'ANSWER', choice: call.word.targetGloss });
}

function advanceActiveTurn(service: ReturnType<typeof actor>) {
  assert.equal(service.getSnapshot().value, 'player_result');
  service.send({ type: 'CONTINUE' });
  assert.equal(service.getSnapshot().value, 'enemy_result');
  service.send({ type: 'CONTINUE' });
  assert.equal(service.getSnapshot().value, 'skill_select');
}

function playSkill(service: ReturnType<typeof actor>, skill: IntentBattleSkill, correct = true) {
  service.send({ type: 'SELECT_SKILL', skillId: skill.skillId });
  const call = selected(service);
  service.send({ type: 'ANSWER', choice: correct ? call.word.targetGloss : `不是${call.word.targetGloss}` });
  return service.getSnapshot();
}

function playFailedWave(service: ReturnType<typeof actor>) {
  const snapshot = playSkill(service, stillWave, false);
  assert.equal(snapshot.value, 'player_result');
  if (snapshot.context.outcome?.state.result === 'won') return;
  service.send({ type: 'CONTINUE' });
  assert.equal(service.getSnapshot().value, 'enemy_result');
  service.send({ type: 'CONTINUE' });
}

// 1. The home page exposes one explicit independent loop entry without changing the main route.
const homeSource = readFileSync(resolvePath(process.cwd(), 'app/page.tsx'), 'utf8');
assert.ok(homeSource.includes('新战斗闭环测试'));
assert.ok(homeSource.includes('/prototype/zero-base?flow=intent-loop&restart=1'));

// 2–3. The teaching flow recognizes the new mode and has exactly one direct continuation target.
const teachingSource = readFileSync(resolvePath(process.cwd(), 'app/prototype/zero-base/page.tsx'), 'utf8');
assert.ok(teachingSource.includes("flow === 'intent-loop'"));
assert.ok(teachingSource.includes("params.get('restart') === '1'"));
assert.ok(teachingSource.includes('resetZeroBaseProgress()'));
assert.ok(teachingSource.includes('createZeroBaseProgress()'));
assert.ok(teachingSource.includes("params.delete('restart')"));
assert.ok(teachingSource.includes('window.history.replaceState'));
assert.match(teachingSource, /restartIntentLoop\s*\?\s*'arrival'/);
assert.ok(teachingSource.includes('/prototype/learning-intent'));
assert.ok(teachingSource.includes("!phaseB && !intentLoop"));

// 4. The continuous machine has an explicit evidence gate and all required phases.
assert.deepEqual(
  Object.keys(learningIntentMachine.states).sort(),
  ['battle_lost', 'battle_won', 'checking_evidence', 'complete', 'enemy_result', 'evidence_missing', 'player_result', 'rematch', 'repair_meaning', 'repair_retrieve', 'repair_review', 'skill_select', 'word_call'],
);
const missing = actor([]);
assert.equal(missing.getSnapshot().value, 'evidence_missing');
assert.equal(missing.getSnapshot().context.eligibleWords.length, 0);

// 5–6. Only Used-or-Maintained + battleEligible words enter the pool, and target glosses remain source-derived.
assert.deepEqual(eligibleWords.map(word => word.wordId), ['w1718', 'w729']);
assert.deepEqual(eligibleWords.map(word => word.targetGloss), ['水', '帮助']);
let partialProgress = createZeroBaseProgress();
partialProgress = recordTeachingEvidence(partialProgress, 'water', 'used', 'partial_water_used', 0);
partialProgress = recordTeachingEvidence(partialProgress, 'help', 'retrieved', 'partial_help_retrieved', 0);
assert.deepEqual(getLearningIntentEligibleWords(partialProgress).map(word => word.wordId), ['w1718']);
assert.deepEqual(INTENT_COMBAT_WORDS.map(word => ZERO_BASE_WORDS.find(source => source.wordId === word.wordId)?.targetGloss), ['水', '帮助']);

// 7–9. Skill selection is independent from the shared two-word rotation, and the first hint is one-shot.
const rotation = actor();
rotation.send({ type: 'SELECT_SKILL', skillId: waterTone.skillId });
assert.equal(selected(rotation).word.wordId, 'w1718');
assert.equal(rotation.getSnapshot().context.justUsedVisible, true);
answerCorrect(rotation);
assert.equal(rotation.getSnapshot().context.justUsedVisible, false);
advanceActiveTurn(rotation);
rotation.send({ type: 'SELECT_SKILL', skillId: returningTide.skillId });
assert.equal(selected(rotation).word.wordId, 'w729');
answerCorrect(rotation);
advanceActiveTurn(rotation);
rotation.send({ type: 'SELECT_SKILL', skillId: stillWave.skillId });
assert.equal(selected(rotation).word.wordId, 'w1718');

// 10–12. Independent, supported and failed outcomes are exactly the existing Intent Combat domain outputs.
const independent = actor();
independent.send({ type: 'SELECT_SKILL', skillId: waterTone.skillId });
const independentCall = selected(independent);
const independentExpected = resolveIntentCombatCall(createIntentCombatState(), independentCall, 'independent');
independent.send({ type: 'ANSWER', choice: independentCall.word.targetGloss });
assert.deepEqual(independent.getSnapshot().context.outcome, independentExpected);

const supported = actor();
supported.send({ type: 'SELECT_SKILL', skillId: returningTide.skillId });
const supportedCall = selected(supported);
supported.send({ type: 'USE_SUPPORT' });
const supportedExpected = resolveIntentCombatCall(createIntentCombatState(), supportedCall, 'supported');
supported.send({ type: 'ANSWER', choice: supportedCall.word.targetGloss });
assert.deepEqual(supported.getSnapshot().context.outcome, supportedExpected);

const failed = actor();
failed.send({ type: 'SELECT_SKILL', skillId: waterTone.skillId });
const failedCall = selected(failed);
const failedExpected = resolveIntentCombatCall(createIntentCombatState(), failedCall, 'failed');
failed.send({ type: 'ANSWER', choice: `不是${failedCall.word.targetGloss}` });
assert.deepEqual(failed.getSnapshot().context.outcome, failedExpected);
assert.deepEqual(failed.getSnapshot().context.outcome?.state.weaknesses.map(item => item.wordId), ['w1718']);

// 13–15. Supported calls do not enter repair; failed calls produce only real, deduplicated weaknesses.
assert.equal(supported.getSnapshot().context.outcome?.state.weaknesses.length, 0);
assert.deepEqual(
  createLearningIntentRepairQueue([
    { wordId: 'w1718', word: 'water', skillName: '水音', quality: 'failed', turn: 1 },
    { wordId: 'w729', word: 'help', skillName: '静波', quality: 'failed', turn: 2 },
    { wordId: 'w1718', word: 'water', skillName: '回潮', quality: 'failed', turn: 3 },
  ]).map(item => item.wordId),
  ['w1718', 'w729'],
);

// 16–18. A battle result is shown before repair, then meaning → retrieve; a retrieve error returns to the same word.
const defeat = actor();
let defeatTurns = 0;
while (defeat.getSnapshot().value === 'skill_select' && defeatTurns < 10) {
  playFailedWave(defeat);
  defeatTurns += 1;
}
assert.equal(defeat.getSnapshot().value, 'battle_lost');
assert.equal(defeat.getSnapshot().context.battle.result, 'lost');
assert.deepEqual(defeat.getSnapshot().context.repairQueue.map(item => item.wordId), ['w729', 'w1718']);
defeat.send({ type: 'CONTINUE' });
assert.equal(defeat.getSnapshot().value, 'repair_review');
defeat.send({ type: 'START_REPAIR' });
assert.equal(defeat.getSnapshot().value, 'repair_meaning');
assert.equal(defeat.getSnapshot().context.repairIndex, 0);
defeat.send({ type: 'REPAIR_MEANING_CONTINUE' });
assert.equal(defeat.getSnapshot().value, 'repair_retrieve');
defeat.send({ type: 'REPAIR_ANSWER', choice: '水' });
assert.equal(defeat.getSnapshot().value, 'repair_meaning');
assert.equal(defeat.getSnapshot().context.repairIndex, 0);

// 19–21. Multiple weaknesses advance in queue order; the final correct answer auto-resets a new battle.
defeat.send({ type: 'REPAIR_MEANING_CONTINUE' });
defeat.send({ type: 'REPAIR_ANSWER', choice: '帮助' });
assert.equal(defeat.getSnapshot().value, 'repair_meaning');
assert.equal(defeat.getSnapshot().context.repairIndex, 1);
defeat.send({ type: 'REPAIR_MEANING_CONTINUE' });
defeat.send({ type: 'REPAIR_ANSWER', choice: '水' });
assert.equal(defeat.getSnapshot().value, 'skill_select');
assert.deepEqual(
  [defeat.getSnapshot().context.battle.playerHp, defeat.getSnapshot().context.battle.enemyHp, defeat.getSnapshot().context.battle.turn, defeat.getSnapshot().context.battle.result],
  [48, 66, 1, 'active'],
);
assert.equal(defeat.getSnapshot().context.battleNumber, 2);
assert.deepEqual(defeat.getSnapshot().context.rematchWordIds, ['w729', 'w1718']);

// 22. Repaired words are prioritized within the first two rematch calls, regardless of selected skill.
defeat.send({ type: 'SELECT_SKILL', skillId: stillWave.skillId });
assert.equal(selected(defeat).word.wordId, 'w729');
answerCorrect(defeat);
advanceActiveTurn(defeat);
defeat.send({ type: 'SELECT_SKILL', skillId: waterTone.skillId });
assert.equal(selected(defeat).word.wordId, 'w1718');

// 23. A clean kill skips enemy_result and reaches complete without fake repair.
const clean = actor();
for (const skill of [waterTone, returningTide, waterTone, returningTide, waterTone, returningTide]) {
  playSkill(clean, skill, true);
  advanceActiveTurn(clean);
}
clean.send({ type: 'SELECT_SKILL', skillId: waterTone.skillId });
answerCorrect(clean);
assert.equal(clean.getSnapshot().value, 'player_result');
assert.equal(clean.getSnapshot().context.outcome?.state.result, 'won');
assert.equal(clean.getSnapshot().context.outcome?.enemyActed, false);
clean.send({ type: 'CONTINUE' });
assert.equal(clean.getSnapshot().value, 'battle_won');
assert.equal(clean.getSnapshot().context.repairQueue.length, 0);
clean.send({ type: 'CONTINUE' });
assert.equal(clean.getSnapshot().value, 'complete');

// 24. Events sent during the wrong phase do not mutate the actor.
const illegal = actor();
const beforeIllegal = JSON.stringify({ value: illegal.getSnapshot().value, context: illegal.getSnapshot().context });
illegal.send({ type: 'ANSWER', choice: '水' });
illegal.send({ type: 'USE_SUPPORT' });
illegal.send({ type: 'CONTINUE' });
assert.equal(JSON.stringify({ value: illegal.getSnapshot().value, context: illegal.getSnapshot().context }), beforeIllegal);
illegal.send({ type: 'SELECT_SKILL', skillId: waterTone.skillId });
const beforeWordIllegal = JSON.stringify({ value: illegal.getSnapshot().value, context: illegal.getSnapshot().context });
illegal.send({ type: 'CONTINUE' });
assert.equal(JSON.stringify({ value: illegal.getSnapshot().value, context: illegal.getSnapshot().context }), beforeWordIllegal);

// 25. Restart clears battle, call, repair and counters while preserving the verified eligible pool.
illegal.send({ type: 'RESTART' });
assert.equal(illegal.getSnapshot().value, 'skill_select');
assert.deepEqual(
  [illegal.getSnapshot().context.battle.playerHp, illegal.getSnapshot().context.battle.enemyHp, illegal.getSnapshot().context.battle.turn, illegal.getSnapshot().context.battle.result, illegal.getSnapshot().context.callNumber, illegal.getSnapshot().context.repairQueue.length],
  [48, 66, 1, 'active', 0, 0],
);
assert.deepEqual(illegal.getSnapshot().context.eligibleWords.map(word => word.wordId), ['w1718', 'w729']);

// 26–28. The new page is a machine-driven continuous surface and contains no old debug menu hop.
const loopPageSource = readFileSync(resolvePath(process.cwd(), 'app/prototype/learning-intent/page.tsx'), 'utf8');
assert.ok(loopPageSource.includes("import { useMachine } from '@xstate/react'"));
assert.ok(loopPageSource.includes('learningIntentMachine'));
assert.ok(!loopPageSource.includes('useState'));
for (const text of ['刚才用过', '战斗失利', '收起答案，独立确认', 'PENDING_K3: intent-loop evidence missing', '进入下一回合']) assert.ok(loopPageSource.includes(text));
assert.ok(loopPageSource.includes('context.battleNumber > 1'));
assert.ok(loopPageSource.includes('刚才的世界行动与战斗已经完成。'));
assert.ok(loopPageSource.includes('刚才的行动、战斗、针对训练和再战都已完成。'));
assert.ok(!teachingSource.includes('/prototype/fusion-slice?flow=intent-loop'));

console.log('Learning Intent repair loop validation passed (28/28; home entry, evidence gate, shared word pool, domain parity, real weakness repair, auto-rematch priority, clean completion, illegal events, reset, and React surface).');
