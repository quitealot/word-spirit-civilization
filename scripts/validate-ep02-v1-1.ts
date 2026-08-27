import { EPISODE_CONFIG } from '../app/game/episode-config.ts';
import { migrateSave, SAVE_VERSION } from '../app/game/save.ts';
import { EP02_V1_1_SCENES, EP02_V1_1_STATUS, ep02RuntimeBeats } from '../app/narrative/ep02-v1-1.ts';

function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }

const beats = EP02_V1_1_SCENES.flatMap(scene => scene.beats);
const dialogue = (id: string) => { const beat = beats.find(item => item.id === id); return beat?.type === 'dialogue' ? beat.text : null; };

assert(EP02_V1_1_STATUS === 'FROZEN_APPROVED', 'EP02 v1.1 must remain frozen and approved');
assert(dialogue('ep02.footprints.b04') === '这不是很久以前的。', 'footprints.b04 must contain the final downgraded inference');
assert(dialogue('ep02.alo_reaction.b04') === '嗯。', 'alo_reaction.b04 must retain its original response');
assert(!beats.some(beat => beat.id === 'ep02.over_the_rise.b06' || beat.id === 'ep02.over_the_rise.b07'), 'The frozen ending must stop at over_the_rise.b05');
assert(EPISODE_CONFIG[2].hasBattle === false && EPISODE_CONFIG[2].interactionIds.length === 3, 'EP02 must remain a three-interaction, no-battle observation episode');

for (const starter of ['芽语', '烬尾', '澜歌'] as const) {
  const runtime = ep02RuntimeBeats(starter);
  assert(runtime.filter(item => ['ep02.spirit_pause.yayu', 'ep02.spirit_pause.jinwei', 'ep02.spirit_pause.lange'].includes(item.beat.id)).length === 1, `${starter} must receive exactly one matching reaction`);
  assert(runtime.at(-1)?.beat.id === 'ep02.over_the_rise.b05', `${starter} path must end at 到坡上看看？`);
}

const oldSave = migrateSave({ saveVersion: 9, starter: '芽语', completed: [1], exploration: 9 });
assert(oldSave.ep2NarrativeIndex === 0 && oldSave.completed.includes(1), 'Pre-EP02 saves must migrate without losing EP01');
const resumed = migrateSave({ saveVersion: 10, starter: '烬尾', completed: [1], exploration: 9, ep2NarrativeIndex: 17 });
assert(resumed.ep2NarrativeIndex === 17, 'EP02 narrative position must survive refresh');
assert(SAVE_VERSION >= 10, 'EP02 narrative persistence requires save schema v10 or later');

console.log('EP02 v1.1 validator: PASS (frozen beats, 3 starter paths, save migration)');
