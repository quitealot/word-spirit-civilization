import type { NarrativeBeat, NarrativeScene, Starter } from './types.ts';

/** Sol final PASS. Formal EP03 prose is frozen and must not be rewritten. */
export const EP03_V1_1_STATUS = 'FROZEN_APPROVED' as const;

const overTheRise: NarrativeScene = { sceneId: 'ep03.over_the_rise', beats: [
  { id: 'ep03.over_the_rise.b01', type: 'narration', text: '坡没有多高。你和阿洛踩上去的时候，脚下的土还是实的。旧路爬过坡顶，从另一侧慢慢低下去，伸进一片更厚的雾里。' },
  { id: 'ep03.over_the_rise.b02', type: 'narration', text: '先前那些脚印，到这儿已经完全看不见了。路面比来时要窄一点，两边的草都朝路中间斜着，像很久没被人往外拨过。' },
  { id: 'ep03.over_the_rise.b03', type: 'dialogue', speaker: '阿洛', text: '这下面和刚才不一样。' },
  { id: 'ep03.over_the_rise.b04', type: 'dialogue', speaker: '玩家', text: '哪里？' },
  { id: 'ep03.over_the_rise.b05', type: 'dialogue', speaker: '阿洛', text: '说不上来。就是听不见什么了。' },
  { id: 'ep03.over_the_rise.b06', type: 'narration', text: '你听了一下。确实没有风，也没有鸟。连草叶互相擦到的声音都没有。' },
  { id: 'ep03.over_the_rise.b07', type: 'narration', text: '旧路伸进雾里一段，就看不清了。' },
] };

const spiritAlert: NarrativeScene = { sceneId: 'ep03.spirit_alert', beats: [
  { id: 'ep03.spirit_alert.b01', type: 'narration', text: '你的同行语灵突然不走了。' },
  { id: 'ep03.spirit_alert.yayu', type: 'action', actor: '芽语', text: '芽语的两片叶子慢慢张开。它没有看你，只把脸转向雾里，身体低得很低。', presentation: 'portrait' },
  { id: 'ep03.spirit_alert.jinwei', type: 'action', actor: '烬尾', text: '烬尾的尾巴不再甩。它前腿绷直，耳朵几乎竖成一条线，喉咙里滚出一声极低的响。', presentation: 'portrait' },
  { id: 'ep03.spirit_alert.lange', type: 'action', actor: '澜歌', text: '澜歌完全静止了。它没有出声，只把身体压得很低，眼睛一眨不眨地看向雾里。', presentation: 'portrait' },
  { id: 'ep03.spirit_alert.b02', type: 'dialogue', speaker: '玩家', text: '怎么停下了？' },
  { id: 'ep03.spirit_alert.b03', type: 'action', actor: '阿洛', text: '阿洛轻轻碰了碰你的手臂。', presentation: 'portrait' },
  { id: 'ep03.spirit_alert.b04', type: 'dialogue', speaker: '阿洛', text: '别出声。' },
  { id: 'ep03.spirit_alert.b05', type: 'narration', text: '雾里很静。你什么也没看见。' },
] };

const soundInFog: NarrativeScene = { sceneId: 'ep03.sound_in_fog', beats: [
  { id: 'ep03.sound_in_fog.b01', type: 'narration', text: '那种静没持续多久。' },
  { id: 'ep03.sound_in_fog.b02', type: 'narration', text: '雾里响了一下。很轻，像什么很重的东西从石头上擦过去。只一次。然后又是一片静。' },
  { id: 'ep03.sound_in_fog.b03', type: 'action', actor: '阿洛', text: '阿洛慢慢把身子转过去一点，面朝雾里。', presentation: 'portrait' },
  { id: 'ep03.sound_in_fog.b04', type: 'dialogue', speaker: '阿洛', text: '……看到了吗？' },
  { id: 'ep03.sound_in_fog.b05', type: 'dialogue', speaker: '玩家', text: '还没有。' },
  { id: 'ep03.sound_in_fog.b06', type: 'narration', text: '同行语灵还保持着那个姿势。它的眼睛没有从雾里挪开过。' },
  { id: 'ep03.sound_in_fog.b07', type: 'narration', text: '然后雾动了。不是被风吹的。是雾里有什么东西，从深处慢慢走了出来。' },
] };

const encounter: NarrativeScene = { sceneId: 'ep03.encounter', beats: [
  { id: 'ep03.encounter.b01', type: 'narration', text: '它从雾里出来，停在旧路上。比你的语灵大得多。身体的边像化开一样，和雾气混在一起。你看不清它的脸，也找不到它的眼睛。它只是站在那里，面朝你们。' },
  { id: 'ep03.encounter.b02', type: 'narration', text: '【UI：？？？】' },
  { id: 'ep03.encounter.b03', type: 'dialogue', speaker: '阿洛', text: '慢点。往回走。' },
  { id: 'ep03.encounter.b04', type: 'action', actor: '玩家', text: '你跟着阿洛慢慢往后退了一步。', presentation: 'portrait' },
  { id: 'ep03.encounter.b05', type: 'narration', text: '那个东西没有扑过来。它只是往前走了一点。' },
  { id: 'ep03.encounter.b06', type: 'narration', text: '你们又退。它又近一点。动作不快，可距离没有拉开。' },
  { id: 'ep03.encounter.b07', type: 'dialogue', speaker: '阿洛', text: '这样退不开。' },
  { id: 'ep03.encounter.b08', type: 'narration', text: '你不知道它是不是这个意思。你只知道，现在这个距离，如果转身跑，后背一定会先露给它。' },
  { id: 'ep03.encounter.b09', type: 'narration', text: '你的脚跟踩到一块滑石子。身体晃了一下。' },
  { id: 'ep03.encounter.b10', type: 'narration', text: '就这一下，雾里的东西突然拉近了。你甚至能听见它身上那种很轻、很碎的摩擦声，像雾里掺了砂。' },
  { id: 'ep03.encounter.b11', type: 'action', actor: '同行语灵', text: '你的同行语灵没有再退。它跨到你前面。', presentation: 'portrait' },
  { id: 'ep03.encounter.b12', type: 'narration', text: '它没有回头，也没有发出声音。你看见它的背绷得很紧。' },
] };

const firstStand: NarrativeScene = { sceneId: 'ep03.first_stand', beats: [
  { id: 'ep03.first_stand.b01', type: 'action', actor: '阿洛', text: '阿洛退到一旁，眼睛仍盯着雾里。', presentation: 'portrait' },
  { id: 'ep03.first_stand.b02', type: 'narration', text: '你的语灵站在你和那个东西之间。它没有喊，没有后退，也没有回头。' },
] };

export const EP03_FIRST_STAND_SYSTEM_NOTE = '显示当前真实已解锁技能，玩家自主选择。' as const;

export const EP03_FIRST_ENEMY_ACTION_EVENT = {
  eventId: 'ep03.first_enemy_action_glance',
  trigger: 'first_enemy_action_completed',
  oncePerEpisodeEncounter: true,
  action: '你的语灵稳住身形。重新面对前方之前，它忽然回头看了你一眼。只一下。',
} as const;

export const EP03_VICTORY_SCENE: NarrativeScene = { sceneId: 'ep03.victory', beats: [
  { id: 'ep03.victory.b01', type: 'narration', text: '雾里的东西往后退了几步。它没有再逼近，只是退回雾里，慢慢看不见了。' },
  { id: 'ep03.victory.b02', type: 'narration', text: '你和阿洛还站在原地。周围重新安静下来。' },
  { id: 'ep03.victory.b03', type: 'narration', text: '你的语灵站在前面，好一会儿没有动。然后它转过身，朝你走过来。' },
  { id: 'ep03.victory.b04', type: 'action', actor: '同行语灵', text: '它没有等你叫。自己走到你面前，停住。', presentation: 'portrait' },
  { id: 'ep03.victory.b05', type: 'narration', text: '它看着你。呼吸还有点重。' },
  { id: 'ep03.victory.b06', type: 'narration', text: '画面安静了一小会儿。' },
  { id: 'ep03.victory.b07', type: 'narration', text: '【UI轻量更新：初伴】' },
  { id: 'ep03.victory.b08', type: 'narration', text: '你没有说话。它也没有。阿洛从旁边慢慢走过来。' },
] };

export const EP03_RETREAT_SCENE: NarrativeScene = { sceneId: 'ep03.retreat', beats: [
  { id: 'ep03.retreat.b01', type: 'narration', text: '你的语灵撑不住了。它没有倒下，但身体已经在晃。' },
  { id: 'ep03.retreat.b02', type: 'narration', text: '它勉强把距离拉开一点，边挡边退。阿洛拉着你一起往坡下撤。' },
  { id: 'ep03.retreat.b03', type: 'narration', text: '你们退回坡下。那个东西跟到坡口附近，停住了。' },
  { id: 'ep03.retreat.b04', type: 'narration', text: '它没有再下来。' },
  { id: 'ep03.retreat.b05', type: 'dialogue', speaker: '阿洛', text: '先缓一下。' },
  { id: 'ep03.retreat.b06', type: 'narration', text: '你的语灵伏在坡下喘息。过了一会儿，呼吸才慢下来。' },
] };

export const EP03_STONE_GATE_SCENE: NarrativeScene = { sceneId: 'ep03.stone_gate', beats: [
  { id: 'ep03.stone_gate.b01', type: 'narration', text: '周围重新安静下来。等呼吸慢下来，你才抬头往前看。' },
  { id: 'ep03.stone_gate.b02', type: 'narration', text: '就在刚才那个东西出现的方向，旧路前方立着一道石门。' },
  { id: 'ep03.stone_gate.b03', type: 'narration', text: '脚下的路一直通到门下。门后还能看见一小截石路，再远，就隐进雾里了。' },
  { id: 'ep03.stone_gate.b04', type: 'dialogue', speaker: '阿洛', text: '先别往前。回吧。' },
  { id: 'ep03.stone_gate.b05', type: 'narration', text: '你点了点头。你的初伴站在你身边，也看着那个方向。它没有要过去。' },
] };

export const EP03_INTRO_SCENES = [overTheRise, spiritAlert, soundInFog, encounter, firstStand] as const;
export const EP03_V1_1_SCENES = [...EP03_INTRO_SCENES, EP03_VICTORY_SCENE, EP03_RETREAT_SCENE, EP03_STONE_GATE_SCENE] as const;

export function ep03IntroRuntimeBeats(starter: Starter): readonly { sceneId: string; beat: NarrativeBeat }[] {
  const branchId = starter === '芽语' ? 'ep03.spirit_alert.yayu' : starter === '烬尾' ? 'ep03.spirit_alert.jinwei' : 'ep03.spirit_alert.lange';
  return EP03_INTRO_SCENES.flatMap(scene => scene.beats
    .filter(beat => !beat.id.startsWith('ep03.spirit_alert.') || !['ep03.spirit_alert.yayu', 'ep03.spirit_alert.jinwei', 'ep03.spirit_alert.lange'].includes(beat.id) || beat.id === branchId)
    .map(beat => ({ sceneId: scene.sceneId, beat })));
}
