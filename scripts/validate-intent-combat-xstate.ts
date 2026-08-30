import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';
import { createActor } from 'xstate';
import {
  INTENT_COMBAT_RULES,
  INTENT_COMBAT_SKILLS,
  resolveIntentCombatBattleOnly,
  resolveIntentCombatCall,
  selectIntentCombatCall,
} from '../app/game/intent-combat-v1.ts';
import { intentCombatMachine } from '../app/game/intent-combat-machine.ts';

const [waterTone, returningTide, stillWave] = INTENT_COMBAT_SKILLS;

function actor() {
  return createActor(intentCombatMachine).start();
}

function selectAndAnswer(
  service: ReturnType<typeof actor>,
  choice?: string,
) {
  service.send({ type: 'SELECT_SKILL', skillId: waterTone.skillId });
  const selected = service.getSnapshot().context.selectedCall;
  assert.ok(selected);
  service.send({ type: 'ANSWER', choice: choice ?? selected.word.targetGloss });
  return service.getSnapshot();
}

function advanceActiveTurn(service: ReturnType<typeof actor>) {
  assert.equal(service.getSnapshot().value, 'player_result');
  service.send({ type: 'CONTINUE' });
  assert.equal(service.getSnapshot().value, 'enemy_result');
  service.send({ type: 'CONTINUE' });
  assert.equal(service.getSnapshot().value, 'skill_select');
}

// 1–2. The machine has the required explicit phases and keeps only one battle's transient context.
assert.deepEqual(Object.keys(intentCombatMachine.states).sort(), ['enemy_result', 'lost', 'player_result', 'skill_select', 'won', 'word_call']);
const initial = actor();
assert.equal(initial.getSnapshot().value, 'skill_select');
assert.deepEqual(Object.keys(initial.getSnapshot().context).sort(), ['battle', 'counts', 'mode', 'outcome', 'selectedCall', 'supportUsed']);
assert.deepEqual(initial.getSnapshot().context.battle, {
  playerHp: INTENT_COMBAT_RULES.playerMaxHp,
  enemyHp: INTENT_COMBAT_RULES.enemyMaxHp,
  playerShield: 0,
  pendingEnemyAttackReduction: 0,
  turn: 1,
  result: 'active',
  weaknesses: [],
});

// 3–5. English mode selects a skill first, then preserves the domain result for both feedback phases.
const independent = actor();
const independentPlayerResult = selectAndAnswer(independent);
assert.equal(independentPlayerResult.value, 'player_result');
assert.equal(independentPlayerResult.context.outcome?.quality, 'independent');
assert.deepEqual(
  [independentPlayerResult.context.outcome?.damage, independentPlayerResult.context.outcome?.reward, independentPlayerResult.context.outcome?.stateAfterSkill.pendingEnemyAttackReduction],
  [12, 6, 6],
);
assert.equal(independentPlayerResult.context.battle.turn, 1);
independent.send({ type: 'CONTINUE' });
assert.equal(independent.getSnapshot().value, 'enemy_result');
assert.deepEqual(
  [independent.getSnapshot().context.outcome?.enemyDamage, independent.getSnapshot().context.outcome?.state.pendingEnemyAttackReduction],
  [6, 0],
);
independent.send({ type: 'CONTINUE' });
assert.equal(independent.getSnapshot().value, 'skill_select');
assert.deepEqual(
  [independent.getSnapshot().context.battle.turn, independent.getSnapshot().context.battle.enemyHp, independent.getSnapshot().context.battle.playerHp],
  [2, 54, 42],
);

const supported = actor();
supported.send({ type: 'SELECT_SKILL', skillId: returningTide.skillId });
supported.send({ type: 'USE_SUPPORT' });
supported.send({ type: 'ANSWER', choice: supported.getSnapshot().context.selectedCall!.word.targetGloss });
assert.equal(supported.getSnapshot().value, 'player_result');
assert.equal(supported.getSnapshot().context.outcome?.quality, 'supported');
assert.deepEqual(
  [supported.getSnapshot().context.outcome?.damage, supported.getSnapshot().context.outcome?.healing, supported.getSnapshot().context.outcome?.reward],
  [6, 9, 5],
);

const failed = actor();
const failedResult = selectAndAnswer(failed, '__not_a_target_gloss__');
assert.equal(failedResult.context.outcome?.quality, 'failed');
assert.deepEqual(
  [failedResult.context.outcome?.damage, failedResult.context.outcome?.reward, failedResult.context.outcome?.state.weaknesses],
  [12, 0, [{ wordId: 'w1718', word: 'water', skillName: '水音', quality: 'failed', turn: 1 }]],
);

// 6. Battle-only mode enters player_result directly and calls only the domain battle-only resolver.
const battleOnly = actor();
battleOnly.send({ type: 'SELECT_MODE', mode: 'battle_only' });
assert.equal(battleOnly.getSnapshot().value, 'skill_select');
battleOnly.send({ type: 'SELECT_SKILL', skillId: waterTone.skillId });
const battleOnlyResult = battleOnly.getSnapshot();
assert.deepEqual(
  [battleOnlyResult.value, battleOnlyResult.context.outcome?.quality, battleOnlyResult.context.outcome?.calledWord, battleOnlyResult.context.outcome?.reward, battleOnlyResult.context.outcome?.state.weaknesses],
  ['player_result', null, null, 0, []],
);
assert.deepEqual(
  battleOnlyResult.context.outcome,
  resolveIntentCombatBattleOnly({
    playerHp: 48,
    enemyHp: 66,
    playerShield: 0,
    pendingEnemyAttackReduction: 0,
    turn: 1,
    result: 'active',
    weaknesses: [],
  }, waterTone),
);

// 7. Events from the wrong phase are ignored without mutating machine state.
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

// 8–10. The delayed water suppression survives charge, is consumed by the next attack, and does not change domain output.
const suppression = actor();
for (let round = 1; round <= 3; round += 1) {
  const snapshot = selectAndAnswer(suppression);
  const expected = resolveIntentCombatCall(
    round === 1
      ? {
          playerHp: 48,
          enemyHp: 66,
          playerShield: 0,
          pendingEnemyAttackReduction: 0,
          turn: 1,
          result: 'active',
          weaknesses: [],
        }
      : suppression.getSnapshot().context.battle,
    { skill: waterTone, word: snapshot.context.outcome?.calledWord ?? selectIntentCombatCall(waterTone, round).word },
    'independent',
  );
  assert.deepEqual(snapshot.context.outcome, expected);
  advanceActiveTurn(suppression);
}
assert.equal(suppression.getSnapshot().context.battle.turn, 4);
assert.equal(suppression.getSnapshot().context.battle.pendingEnemyAttackReduction, 6);

suppression.send({ type: 'SELECT_SKILL', skillId: stillWave.skillId });
suppression.send({ type: 'ANSWER', choice: suppression.getSnapshot().context.selectedCall!.word.targetGloss });
const suppressionAttack = suppression.getSnapshot().context.outcome!;
assert.deepEqual(
  [suppressionAttack.intent.kind, suppressionAttack.enemyRawDamage, suppressionAttack.enemyDamage, suppressionAttack.stateAfterSkill.pendingEnemyAttackReduction, suppressionAttack.state.pendingEnemyAttackReduction],
  ['attack', 24, 18, 6, 0],
);
assert.deepEqual(
  suppressionAttack,
  resolveIntentCombatCall(
    suppression.getSnapshot().context.battle,
    { skill: stillWave, word: suppression.getSnapshot().context.selectedCall?.word ?? selectIntentCombatCall(stillWave, 4).word },
    'independent',
  ),
);

// 11. A kill goes directly from player_result to won; it never creates an enemy_result phase.
const killer = actor();
for (let round = 1; round <= 5; round += 1) {
  selectAndAnswer(killer);
  advanceActiveTurn(killer);
}
const killResult = selectAndAnswer(killer);
assert.deepEqual([killResult.value, killResult.context.outcome?.state.result, killResult.context.outcome?.enemyActed], ['player_result', 'won', false]);
killer.send({ type: 'CONTINUE' });
assert.equal(killer.getSnapshot().value, 'won');
killer.send({ type: 'CONTINUE' });
assert.equal(killer.getSnapshot().value, 'won');

// 12–13. Restart clears every transient value; machine has no learning/repair persistence.
const restart = actor();
restart.send({ type: 'SELECT_SKILL', skillId: returningTide.skillId });
restart.send({ type: 'USE_SUPPORT' });
restart.send({ type: 'RESTART' });
assert.equal(restart.getSnapshot().value, 'skill_select');
assert.deepEqual(restart.getSnapshot().context, {
  battle: {
    playerHp: 48,
    enemyHp: 66,
    playerShield: 0,
    pendingEnemyAttackReduction: 0,
    turn: 1,
    result: 'active',
    weaknesses: [],
  },
  mode: 'with_calls',
  selectedCall: null,
  supportUsed: false,
  outcome: null,
  counts: { independent: 0, supported: 0, failed: 0 },
});

// 14–16. Package versions, actor-only validation, and the React boundary are explicit.
const packageJson = JSON.parse(readFileSync(resolvePath(process.cwd(), 'package.json'), 'utf8')) as {
  dependencies?: Record<string, string>;
  scripts?: Record<string, string>;
};
const packageLock = JSON.parse(readFileSync(resolvePath(process.cwd(), 'package-lock.json'), 'utf8')) as {
  packages?: { '': { dependencies?: Record<string, string> } };
};
assert.equal(packageJson.dependencies?.xstate, '5.32.6');
assert.equal(packageJson.dependencies?.['@xstate/react'], '6.1.0');
assert.equal(packageLock.packages?.['']?.dependencies?.xstate, '5.32.6');
assert.equal(packageLock.packages?.['']?.dependencies?.['@xstate/react'], '6.1.0');
assert.equal(packageJson.scripts?.['validate:intent-combat-xstate'], 'node --experimental-strip-types scripts/validate-intent-combat-xstate.ts');
const pageSource = readFileSync(resolvePath(process.cwd(), 'app/prototype/intent-combat/page.tsx'), 'utf8');
assert.ok(pageSource.includes("import { useMachine } from '@xstate/react'"));
assert.ok(pageSource.includes('intentCombatMachine'));
assert.ok(!pageSource.includes('useState'));
assert.ok(!pageSource.includes('useMemo'));
assert.ok(!pageSource.includes('setTimeout'));

// 17–18. Existing product semantics and two-phase copy stay visible in the migrated page.
assert.ok(pageSource.includes("snapshot.matches('skill_select')"));
assert.ok(pageSource.includes("snapshot.matches('word_call')"));
assert.ok(pageSource.includes("snapshot.matches('player_result')"));
assert.ok(pageSource.includes("snapshot.matches('enemy_result')"));
assert.ok(pageSource.includes("snapshot.matches('won')"));
assert.ok(pageSource.includes("snapshot.matches('lost')"));
assert.ok(pageSource.includes('进入下一回合'));
assert.ok(pageSource.includes('下一次真正攻击'));
assert.ok(pageSource.includes('只测战斗选择'));
assert.ok(pageSource.includes('战斗失利'));

console.log('Intent combat XState foundation validation passed (18/18; actor phases, illegal events, domain parity, delayed suppression, terminal kill, restart, package lock, and React boundary).');
