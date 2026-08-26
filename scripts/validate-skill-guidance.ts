import { BRIDGE_V1_RULES, resolveSkillMultiplier } from '../app/game/bridge-config.ts';
import { SIGNATURE_GUIDANCE_RELATIONS, assertSignatureGuidanceIntegrity, getSignatureGuidance, resolveBudGuardPrototype } from '../app/game/skill-guidance.ts';
import { SPIRITS } from '../app/game/spirit-config.ts';
import { VOCABULARY_BY_ID } from '../app/vocabulary.ts';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

assertSignatureGuidanceIntegrity();
assert(SIGNATURE_GUIDANCE_RELATIONS.length === 18, 'Prototype must expose exactly 18 signature guidance relations');
assert(new Set(SIGNATURE_GUIDANCE_RELATIONS.map(item => item.wordId)).size === 18, 'Signature wordIds must be unique in V1');
for (const relation of SIGNATURE_GUIDANCE_RELATIONS) {
  assert(VOCABULARY_BY_ID.get(relation.wordId)?.word === relation.word, `${relation.word} must reference authoritative vocabulary data`);
}

const skills = SPIRITS.flatMap(spirit => spirit.skills);
assert(skills.length === 9, 'Three starters must each expose three skills');
assert(new Set(skills.map(skill => skill.id)).size === 9, 'Every starter skill needs a stable unique id');
assert(getSignatureGuidance('w1233', '芽语', 'yayu_bud_guard')?.word === 'protect', 'protect must be associated with 芽语·护芽');
assert(getSignatureGuidance('w2341', '芽语', 'yayu_bud_guard')?.word === 'maintain', 'maintain must be associated with 芽语·护芽');

assert(resolveSkillMultiplier('stable_attack', false, 1000) > resolveSkillMultiplier('burst', false, 1000), 'High-risk burst failure must lose more effect than stable attack');
assert(resolveSkillMultiplier('shield', false, 1000) > resolveSkillMultiplier('mitigation', false, 1000), 'Shield failure must weaken while mitigation may fail');
assert(resolveSkillMultiplier('recovery', false, 1000) > 0, 'Recovery failure must retain partial healing');
assert(resolveSkillMultiplier('control', false, 1000) === 0, 'Control failure may fully fail');
assert(resolveSkillMultiplier('shield', true, BRIDGE_V1_RULES.response.stableMs + 100) === BRIDGE_V1_RULES.response.hesitantMultiplier, 'Slow correct answers must use the configured hesitant multiplier');

const failedGuard = resolveBudGuardPrototype(false, 1000);
const stableGuard = resolveBudGuardPrototype(true, 1000);
assert(failedGuard.shield > 0 && failedGuard.shield < stableGuard.shield, 'Wrong maintain must create a partial rather than full shield');
assert(failedGuard.defeated, 'Acceptance battle must fail after the partial shield');
assert(!stableGuard.defeated, 'Acceptance retry must survive after the full shield');
assert(stableGuard.shield === BRIDGE_V1_RULES.skillEffects.yayu_bud_guard.shield, 'Stable retry must form the configured full shield');

console.log('Skill × Guidance Prototype V1 validator: PASS');
console.log(`maintain wrong -> shield ${failedGuard.shield}/${stableGuard.shield}, HP ${failedGuard.remainingHp}, defeated=${failedGuard.defeated}`);
console.log(`maintain correct -> shield ${stableGuard.shield}/${stableGuard.shield}, HP ${stableGuard.remainingHp}, defeated=${stableGuard.defeated}`);
