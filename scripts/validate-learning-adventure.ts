import {
  beginAdventurePreparation,
  createEmptyAdventureLearning,
  isAdventureReady,
  migrateAdventureLearning,
  recordAdventureCall,
  recordPreparedWord,
  recordWeaknessRecovered,
} from '../app/game/learning-adventure.ts';
import { migrateSave, SAVE_VERSION } from '../app/game/save.ts';
import { resolveExecutionQuality, resolveSkillMultiplier } from '../app/game/bridge-config.ts';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

let learning = createEmptyAdventureLearning();
learning = beginAdventurePreparation(learning, 3, ['w-new-1', 'w-new-2', 'w-new-3'], ['w-review-1', 'w-new-1']);
assert(learning[3].wordIds.length === 4, 'Preparation pool must deduplicate new and review words');
assert(!isAdventureReady(learning, 3), 'A partially prepared episode must not be ready');

for (const wordId of learning[3].wordIds) learning = recordPreparedWord(learning, 3, wordId);
assert(isAdventureReady(learning, 3), 'Every planned word must be prepared before departure');

learning = recordAdventureCall(learning, 3, 'w-new-1', true);
learning = recordAdventureCall(learning, 3, 'w-new-2', false);
learning = recordAdventureCall(learning, 3, 'outside-pool', false);
assert(learning[3].calledWordIds.length === 3, 'Direct challenges must record guide words outside a prepared pool');
assert(learning[3].successfulWordIds.length === 1, 'Only correct calls may become successful calls');
assert(learning[3].weakWordIds.includes('outside-pool'), 'Direct challenge mistakes must enter targeted training');
learning = recordWeaknessRecovered(learning, 3, 'outside-pool');
assert(!learning[3].weakWordIds.includes('outside-pool'), 'Successful targeted training must clear the weakness');
assert(learning[3].stabilizedWordIds.includes('outside-pool'), 'Recovered weakness must remain as effective evidence');

assert(resolveExecutionQuality(true, 'none') === 'stable', 'Independent correct answers must be stable');
assert(resolveExecutionQuality(true, 'light') === 'supported', 'Correct answers after support must be marked supported');
assert(resolveSkillMultiplier('stable_attack', false, 'none') === 0.3, 'Wrong stable attacks must keep 30% effect');
assert(resolveSkillMultiplier('control', false, 'none') === 0, 'Wrong control skills must fail instead of sharing attack behavior');

const migratedLearning = migrateAdventureLearning(JSON.parse(JSON.stringify(learning)));
assert(isAdventureReady(migratedLearning, 3), 'Ready preparation must survive JSON round trip');
assert(migratedLearning[3].successfulWordIds[0] === 'w-new-1', 'Call evidence must survive migration');

const migratedSave = migrateSave({ saveVersion: 5, starter: '芽语', completed: [1, 2] });
assert(migratedSave.saveVersion === SAVE_VERSION, 'Legacy saves must migrate to the current save schema');
assert(migratedSave.adventureLearning[3].status === 'not_started', 'Legacy saves must receive safe empty preparation state');
const migratedIncompleteEp1 = migrateSave({ saveVersion: 6, starter: '澜歌', completed: [], checkpoint: 'ep1_outro', ep1TutorialIndex: 3 });
assert(migratedIncompleteEp1.checkpoint === 'ep1_intro' && migratedIncompleteEp1.ep1TutorialIndex === 0, 'Incomplete legacy EP01 saves must restart at the approved post-selection scene');

console.log('Learning × Adventure bridge validator: PASS');
