import {
  beginAdventurePreparation,
  createEmptyAdventureLearning,
  isAdventureReady,
  migrateAdventureLearning,
  recordAdventureCall,
  recordPreparedWord,
} from '../app/game/learning-adventure.ts';
import { migrateSave } from '../app/game/save.ts';

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
learning = recordAdventureCall(learning, 3, 'outside-pool', true);
assert(learning[3].calledWordIds.length === 2, 'Only prepared exploration words may become calls');
assert(learning[3].successfulWordIds.length === 1, 'Only correct calls may become successful calls');

const migratedLearning = migrateAdventureLearning(JSON.parse(JSON.stringify(learning)));
assert(isAdventureReady(migratedLearning, 3), 'Ready preparation must survive JSON round trip');
assert(migratedLearning[3].successfulWordIds[0] === 'w-new-1', 'Call evidence must survive migration');

const migratedSave = migrateSave({ saveVersion: 4, starter: '芽语', completed: [1, 2] });
assert(migratedSave.saveVersion === 5, 'Legacy saves must migrate to save schema v5');
assert(migratedSave.adventureLearning[3].status === 'not_started', 'Legacy saves must receive safe empty preparation state');

console.log('Learning × Adventure bridge validator: PASS');
