import type { NarrativeBeat, NarrativeScene, Starter } from './types.ts';

/** Sol final PASS after the beat-id hotfix. This text is frozen. */
export const EP02_V1_1_STATUS = 'FROZEN_APPROVED' as const;

const leavingHarbor: NarrativeScene = { sceneId: 'ep02.leaving_harbor', beats: [
  { id: 'ep02.leaving_harbor.b01', type: 'narration', text: '你们离开雾港最后几间屋子。脚下的石板路慢慢变窄，接着成了压实的泥土，中间夹着几块老石板。身后很远的地方，还能听见晾衣绳被风吹动的轻响。再走一段，就听不见了。' },
  { id: 'ep02.leaving_harbor.b02', type: 'action', actor: '阿洛', text: '阿洛在前面走，半侧着身，回头看了你一眼。', presentation: 'portrait' },
  { id: 'ep02.leaving_harbor.b03', type: 'dialogue', speaker: '阿洛', text: '这条路，以前我最多走到这儿。再往前，就是雾里了。' },
  { id: 'ep02.leaving_harbor.b04', type: 'narration', text: '你回头看了一眼。雾港的房顶还露着一片，再远一点已经看不清了。' },
  { id: 'ep02.leaving_harbor.b05', type: 'narration', text: '同行语灵走在你身边，没有往两边跑。' },
] };

const oldRoad: NarrativeScene = { sceneId: 'ep02.old_road', beats: [
  { id: 'ep02.old_road.b01', type: 'narration', text: '旧路没有断。有些石板裂了，被草顶得歪向一边；有些地方只剩泥，但路本身的走向很清楚。雾停在远处，没有围过来。' },
  { id: 'ep02.old_road.b02', type: 'dialogue', speaker: '阿洛', text: '比我想的好走。以前总觉得这条路早就该被雾埋了。' },
  { id: 'ep02.old_road.b03', type: 'narration', text: '他边说边往前走，步子比刚才慢了一点。不是怕，是在看路两边的地面。' },
  { id: 'ep02.old_road.b04', type: 'dialogue', speaker: '玩家', text: '你在找什么？' },
  { id: 'ep02.old_road.b05', type: 'dialogue', speaker: '阿洛', text: '没找什么。就是觉得这里清静得有点不习惯。' },
  { id: 'ep02.old_road.b06', type: 'narration', text: '你懂他的意思。这里太安静了。连鸟叫都没有，只有你们的脚步声。' },
  { id: 'ep02.old_road.b07', type: 'narration', text: '但天气很好。雾那么远，旧路清清楚楚。走起来并不叫人害怕。' },
] };

const oldPost: NarrativeScene = { sceneId: 'ep02.old_post', beats: [
  { id: 'ep02.old_post.b01', type: 'narration', text: '路边立着一根木桩。颜色发黑，下半截沾着干掉的泥。它离主路有几步距离，后面是一小片矮草。' },
  { id: 'ep02.old_post.b02', type: 'action', actor: '玩家', text: '你朝木桩走过去。', presentation: 'portrait' },
  { id: 'ep02.old_post.b03', type: 'interaction', interactionId: 'ep02.inspect_post', prompt: '过去看看', resultText: '你走近木桩。它比看起来更粗，木头表面有很深的凹槽，像被什么粗东西来回勒过。几道歪歪扭扭的浅刻痕横在中间，看不出刻的是什么。' },
  { id: 'ep02.old_post.b04', type: 'narration', text: '木桩周围长着一圈矮草，草叶已经盖到桩脚。' },
  { id: 'ep02.old_post.b05', type: 'action', actor: '同行语灵', text: '你的同行语灵没有跟过来，停在主路上看着你。', presentation: 'portrait' },
  { id: 'ep02.old_post.b06', type: 'dialogue', speaker: '阿洛', text: '这桩子以前用过。' },
  { id: 'ep02.old_post.b07', type: 'narration', text: '你没说话。木头上的刻痕很浅，已经快被磨平了。' },
] };

const spiritPause: NarrativeScene = { sceneId: 'ep02.spirit_pause', beats: [
  { id: 'ep02.spirit_pause.b01', type: 'narration', text: '你们回到主路上，继续往前走。同行语灵突然停了一下。' },
  { id: 'ep02.spirit_pause.yayu', type: 'action', actor: '芽语', text: '芽语的叶片轻轻一拢，头朝木桩旁边偏了偏。它没出声，只把身子放低了一点。', presentation: 'portrait' },
  { id: 'ep02.spirit_pause.jinwei', type: 'action', actor: '烬尾', text: '烬尾的尾巴尖轻轻抽了一下。它没回头，只斜过眼睛朝木桩那边看。', presentation: 'portrait' },
  { id: 'ep02.spirit_pause.lange', type: 'action', actor: '澜歌', text: '澜歌完全停了下来。它的视线慢慢移向木桩靠下的位置。', presentation: 'portrait' },
  { id: 'ep02.spirit_pause.b02', type: 'narration', text: '你顺着它的方向看过去。木桩下面，好像有截颜色不太对的东西。' },
  { id: 'ep02.spirit_pause.b03', type: 'dialogue', speaker: '阿洛', text: '它看什么？' },
  { id: 'ep02.spirit_pause.b04', type: 'dialogue', speaker: '玩家', text: '不知道。' },
] };

const newRope: NarrativeScene = { sceneId: 'ep02.new_rope', beats: [
  { id: 'ep02.new_rope.b01', type: 'interaction', interactionId: 'ep02.inspect_rope', prompt: '看看它在看什么', resultText: '你蹲下来。木桩上一道很深的旧凹槽里压着一截绳子。颜色比木桩本身浅得多。你伸手碰了一下，它还是软的。' },
  { id: 'ep02.new_rope.b02', type: 'action', actor: '玩家', text: '你的手停在绳子上。它不旧。', presentation: 'portrait' },
  { id: 'ep02.new_rope.b03', type: 'narration', text: '阿洛走过来，在你旁边蹲下。' },
  { id: 'ep02.new_rope.b04', type: 'dialogue', speaker: '阿洛', text: '……这东西，不是原来就在这儿的吧？' },
  { id: 'ep02.new_rope.b05', type: 'dialogue', speaker: '玩家', text: '不像。' },
  { id: 'ep02.new_rope.b06', type: 'narration', text: '一小截绳头从凹槽里露出来，另一端垂进桩边的草里。' },
] };

const footprints: NarrativeScene = { sceneId: 'ep02.footprints', beats: [
  { id: 'ep02.footprints.b01', type: 'interaction', interactionId: 'ep02.inspect_mud', prompt: '看看旁边的泥地', resultText: '你低头看了看自己和阿洛刚刚走过来留下的脚印。靠木桩的一枚新脚印，正好压住了另一枚已经在那里的印子一角。新脚印边缘清楚，下面那枚已经稍微塌了一些。' },
  { id: 'ep02.footprints.b02', type: 'narration', text: '那些脚印往前伸了几步，然后回到主路上，朝着北边去了。' },
  { id: 'ep02.footprints.b03', type: 'action', actor: '阿洛', text: '阿洛也看到了。他站起来，往北边看。', presentation: 'portrait' },
  { id: 'ep02.footprints.b04', type: 'dialogue', speaker: '阿洛', text: '这不是很久以前的。' },
  { id: 'ep02.footprints.b05', type: 'narration', text: '你没说话。那几个脚印现在就在你脚边。你刚刚踩出来的那枚，已经把它压住了一小半。' },
] };

const aloReaction: NarrativeScene = { sceneId: 'ep02.alo_reaction', beats: [
  { id: 'ep02.alo_reaction.b01', type: 'narration', text: '阿洛没再蹲下去。他就那么站着，看了一会儿地面，又看了一会儿北边的路。' },
  { id: 'ep02.alo_reaction.b02', type: 'dialogue', speaker: '阿洛', text: '我还以为雾一退，我们是头几个走到这儿的。' },
  { id: 'ep02.alo_reaction.b03', type: 'dialogue', speaker: '玩家', text: '显然不是。' },
  { id: 'ep02.alo_reaction.b04', type: 'dialogue', speaker: '阿洛', text: '嗯。' },
  { id: 'ep02.alo_reaction.b05', type: 'narration', text: '他应得很轻。风从北边吹过来一点，带着很淡的潮气。' },
] };

const overTheRise: NarrativeScene = { sceneId: 'ep02.over_the_rise', beats: [
  { id: 'ep02.over_the_rise.b01', type: 'narration', text: '旧路在前面开始上坡。那些先前留下的脚印，到了坡前就变淡了，再往前，地面变硬，什么也看不出来。' },
  { id: 'ep02.over_the_rise.b02', type: 'narration', text: '坡后的雾比这边厚一点。不是围过来的那种，是一直就停在那个位置，像路钻进去以后就消失了。' },
  { id: 'ep02.over_the_rise.b03', type: 'action', actor: '同行语灵', text: '同行语灵停在你脚边。它看着坡后，但没有往前走。', presentation: 'portrait' },
  { id: 'ep02.over_the_rise.b04', type: 'action', actor: '阿洛', text: '阿洛朝前走了两步，又停下。', presentation: 'portrait' },
  { id: 'ep02.over_the_rise.b05', type: 'dialogue', speaker: '阿洛', text: '到坡上看看？' },
] };

export const EP02_V1_1_SCENES = [leavingHarbor, oldRoad, oldPost, spiritPause, newRope, footprints, aloReaction, overTheRise] as const;

export function ep02RuntimeBeats(starter: Starter): readonly { sceneId: string; beat: NarrativeBeat }[] {
  const branchId = starter === '芽语' ? 'ep02.spirit_pause.yayu' : starter === '烬尾' ? 'ep02.spirit_pause.jinwei' : 'ep02.spirit_pause.lange';
  return EP02_V1_1_SCENES.flatMap(scene => scene.beats
    .filter(beat => !beat.id.startsWith('ep02.spirit_pause.') || !['ep02.spirit_pause.yayu', 'ep02.spirit_pause.jinwei', 'ep02.spirit_pause.lange'].includes(beat.id) || beat.id === branchId)
    .map(beat => ({ sceneId: scene.sceneId, beat })));
}
