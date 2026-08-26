import { VOCABULARY_BY_ID } from '../app/vocabulary.ts';
import { BOND_SITUATIONS, BOND_SKILL_TRIALS, recommendBondStarter, trialEffectPercent } from '../app/game/initial-bond.ts';

function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }

assert(BOND_SITUATIONS.length === 4, 'Initial bond must contain four action-tendency situations');
assert(BOND_SKILL_TRIALS.length === 3, 'Initial bond must contain one skill trial for each starter');
assert(BOND_SKILL_TRIALS.flatMap(trial => trial.wordIds).length === 9, 'Initial bond must use exactly nine L1 judgements');
for (const trial of BOND_SKILL_TRIALS) {
  assert(trial.wordIds.length === 3, `${trial.spiritId} must use three L1 judgements`);
  trial.wordIds.forEach(wordId => assert(VOCABULARY_BY_ID.has(wordId), `Initial bond word must exist in the official vocabulary: ${wordId}`));
}
assert(recommendBondStarter(['guard', 'guard', 'assault', 'support']) === '芽语', 'Guard tendency must recommend 芽语');
assert(recommendBondStarter(['assault', 'assault', 'guard', 'support']) === '烬尾', 'Assault tendency must recommend 烬尾');
assert(recommendBondStarter(['support', 'support', 'guard', 'assault']) === '澜歌', 'Support tendency must recommend 澜歌');
assert(trialEffectPercent(0) === 30 && trialEffectPercent(3) === 100, 'Skill trial feedback must remain partial on failure and full on success');

console.log('Initial bond validator: PASS');
