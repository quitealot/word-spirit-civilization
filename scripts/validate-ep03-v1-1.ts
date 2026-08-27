import { completeEpisode, confirmEp03Bond, migrateSave, recordEp03FirstEnemyAction, recordEp03Retreat, setEp03Progress, SAVE_VERSION } from '../app/game/save.ts';
import { getUnlockedSkills, getSpirit } from '../app/game/spirit-config.ts';
import { EP03_FIRST_ENEMY_ACTION_EVENT, EP03_STONE_GATE_SCENE, EP03_V1_1_STATUS } from '../app/narrative/ep03-v1-1.ts';

function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }

assert(EP03_V1_1_STATUS === 'FROZEN_APPROVED', 'EP03 v1.1 must remain frozen and approved');
assert(EP03_FIRST_ENEMY_ACTION_EVENT.oncePerEpisodeEncounter, 'The first enemy action glance must be once per encounter');
assert(EP03_STONE_GATE_SCENE.beats.at(-1)?.type === 'narration', 'The stone-gate scene must stop after the frozen final narration');

const base = migrateSave({ saveVersion: 10, starter: '芽语', completed: [1, 2], exploration: 9 });
assert(base.completed.join(',') === '1,2' && base.episodeState.ep03.phase === 'intro', 'EP01/EP02 progress must survive EP03 migration');
const midIntro = migrateSave(setEp03Progress(base, 'intro', 11));
assert(midIntro.episodeState.ep03.narrativeIndex === 11, 'EP03 narrative position must survive refresh');

const firstAction = recordEp03FirstEnemyAction(setEp03Progress(base, 'battle'));
const duplicateAction = recordEp03FirstEnemyAction(firstAction);
assert(firstAction.episodeState.ep03.firstEnemyActionGlanceSeen && duplicateAction === firstAction, 'First enemy action must be idempotent across retry/refresh');

const retreatWithWeakness = recordEp03Retreat(firstAction, ['w001', 'w001', 'w002']);
assert(retreatWithWeakness.episodeState.ep03.phase === 'retreat' && retreatWithWeakness.episodeState.ep03.retreatWeakWordIds.join(',') === 'w001,w002', 'A real weak-word retreat must expose targeted training exactly once per word');
const directRetry = setEp03Progress(retreatWithWeakness, 'battle', 0);
assert(directRetry.episodeState.ep03.firstEnemyActionGlanceSeen && directRetry.episodeState.ep03.retreatWeakWordIds.length === 2, 'Direct retry must preserve the battle event and learning evidence');
const retreatWithoutWeakness = recordEp03Retreat(firstAction, []);
assert(retreatWithoutWeakness.episodeState.ep03.retreatWeakWordIds.length === 0, 'No weakness means no targeted-training option');

const bonded = confirmEp03Bond(setEp03Progress(base, 'victory', 6));
assert(bonded.episodeState.ep03.bonded && !bonded.completed.includes(3), 'Initial companion status must update before EP03 completion');
const completed = completeEpisode(setEp03Progress(bonded, 'stone_gate', 4), 3);
assert(completed.completed.includes(3) && completed.episodeState.ep03.phase === 'complete' && completed.episodeState.ep03.bonded, 'Stone-gate finish must complete EP03 without opening EP04 content');

const oldCompleted = migrateSave({ saveVersion: 10, starter: '澜歌', completed: [1, 2, 3], exploration: 12 });
assert(oldCompleted.episodeState.ep03.phase === 'complete' && oldCompleted.episodeState.ep03.bonded && oldCompleted.episodeState.ep03.firstEnemyActionGlanceSeen, 'Previously completed EP03 saves must not replay the encounter');

const yayu = getSpirit('芽语');
assert(getUnlockedSkills(yayu, 1).length === 2 && getUnlockedSkills(yayu, 3).length === 3, 'EP03 battle must read actual unlocked skills without granting one');
assert(SAVE_VERSION === 11, 'EP03 persistent flow requires save schema v11');

console.log('EP03 v1.1 validator: PASS (frozen content, success/retreat/targeted/direct retry, refresh, migration, real skills)');
