import { ep1CheckpointAfterStarterChoice, migrateEp1OpeningPosition, migrateSave, SAVE_VERSION } from '../app/game/save.ts';

function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }

const cenpoMid = migrateSave({ saveVersion: 8, openingSceneId: 'ep01.cenpo', openingBeatIndex: 5, completed: [] });
assert(cenpoMid.openingIndex === 19 && cenpoMid.starter === null && cenpoMid.checkpoint === null, 'ep01.cenpo must resume deterministically inside ep01.qiaoyi');

const spiritsChoice = migrateSave({ saveVersion: 8, openingSceneId: 'ep01.spirits', openingBeatIndex: 7, completed: [] });
assert(spiritsChoice.openingIndex === 36 && spiritsChoice.starter === null, 'ep01.spirits choice must resume at the link test, not restart EP01');

const selectedPartner = migrateSave({ saveVersion: 8, starter: '烬尾', completed: [], checkpoint: 'ep1_intro', ep1TutorialIndex: 2 });
assert(selectedPartner.checkpoint === 'ep1_intro' && selectedPartner.ep1TutorialIndex === 2, 'A selected partner must not be forced through the link test again');

const firstGuide = migrateSave({ saveVersion: 8, starter: '芽语', completed: [], checkpoint: 'ep1_lesson', ep1TutorialIndex: 0 });
assert(firstGuide.checkpoint === 'ep1_lesson', 'An active first guide must resume at first_guide');

const departure = migrateSave({ saveVersion: 8, starter: '澜歌', completed: [], checkpoint: 'ep1_outro', ep1TutorialIndex: 4, ep1GuideOutcome: 'skipped' });
assert(departure.checkpoint === 'ep1_outro' && departure.ep1GuideOutcome === 'skipped' && departure.ep1TutorialIndex === 4, 'Departure progress must be preserved');

const ep02Reached = migrateSave({ saveVersion: 8, starter: '芽语', completed: [1], checkpoint: 'ep1_intro', ep1TutorialIndex: 1 });
assert(ep02Reached.checkpoint === null && ep02Reached.completed.includes(1), 'A save that reached EP02 must never reopen EP01');

const v6Result = migrateSave({ saveVersion: 9, completed: [], checkpoint: 'ep1_link_test_result', ep1RecommendedStarter: '澜歌', ep1BondEvidence: [{ wordId: 'w1235', correct: true, seenBefore: false, latencyMs: 1200 }] });
assert(v6Result.checkpoint === 'ep1_link_test_result' && v6Result.ep1RecommendedStarter === '澜歌' && v6Result.ep1BondEvidence.length === 1, 'V6 link-test result must survive refresh before final choice');

assert(ep1CheckpointAfterStarterChoice('芽语', '芽语') === 'ep1_intro', 'Choosing the recommended spirit must skip spirit_reselect');
assert(ep1CheckpointAfterStarterChoice('芽语', '烬尾') === 'ep1_spirit_reselect', 'Choosing a non-recommended spirit must enter spirit_reselect');

assert(migrateEp1OpeningPosition({ saveVersion: 8, openingIndex: 34 }) === 36, 'The old flattened selection boundary must map to the V6 link-test boundary');
assert(SAVE_VERSION === 10, 'Current save schema must preserve the EP01 v6 migration');

console.log('EP01 v6 save migration validator: PASS (7 recovery paths)');
