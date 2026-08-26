import type { NarrativeBeat, NarrativeScene, Starter } from './types.ts';

/** Sol-approved EP01 v3. Text is frozen; gameplay must not infer rules from it. */
export const EP01_V3_STATUS = 'APPROVED_FOR_INTEGRATION' as const;

const morning: NarrativeScene = { sceneId: 'ep01.morning', beats: [
  { id: 'ep01.morning.b01', type: 'narration', text: '雾港的雾，早晨最重。这天不是。你推开窗，看见对面屋顶的瓦片，一片一片都能数清。雾没有散，只是比平时薄了很多。' },
  { id: 'ep01.morning.b02', type: 'narration', text: '巷子那头有人跑过来。脚步声很急，在湿石板上响得特别清楚。' },
  { id: 'ep01.morning.b03', type: 'dialogue', speaker: '阿洛', text: '你看见没有？北边，北边今天能看见东西！' },
  { id: 'ep01.morning.b04', type: 'dialogue', speaker: '玩家', text: '我还没出门。' },
  { id: 'ep01.morning.b05', type: 'dialogue', speaker: '阿洛', text: '你直接到坡上来。我不是说雾港里面，是港北边，那一片老雾，今天退得能看见山坡了！' },
  { id: 'ep01.morning.b06', type: 'narration', text: '他的声音有点抖。不像害怕，像是一路跑过来没匀过气。' },
] };

const northView: NarrativeScene = { sceneId: 'ep01.north_view', beats: [
  { id: 'ep01.north_view.b01', type: 'narration', text: '你跟着阿洛上到坡边。这里平时只看得见一片灰白，天和地像在那里连成一块。今天不同。' },
  { id: 'ep01.north_view.b02', type: 'narration', text: '雾退开了。不是散，是往深处缩回去。远处露出几道山脊，灰青灰青的。山脚下有一条旧路，断断续续往北边伸。' },
  { id: 'ep01.north_view.b03', type: 'dialogue', speaker: '玩家', text: '以前这条路，能看见吗？' },
  { id: 'ep01.north_view.b04', type: 'dialogue', speaker: '阿洛', text: '看不见。连山坡都看不见。今天第一次这么清楚。' },
  { id: 'ep01.north_view.b05', type: 'narration', text: '坡下很静。草叶上的水一滴一滴往下落。' },
  { id: 'ep01.north_view.b06', type: 'dialogue', speaker: '阿洛', text: '我想去看看。就到旧路看看，不往深处走。' },
  { id: 'ep01.north_view.b07', type: 'dialogue', speaker: '玩家', text: '先和岑姨说一声吧。' },
  { id: 'ep01.north_view.b08', type: 'dialogue', speaker: '阿洛', text: '……也行。她应该也在看。' },
] };

const cenpo: NarrativeScene = { sceneId: 'ep01.cenpo', beats: [
  { id: 'ep01.cenpo.b01', type: 'narration', text: '岑姨站在自家门口。她没看你们。她看着北边。' },
  { id: 'ep01.cenpo.b02', type: 'dialogue', speaker: '阿洛', text: '岑姨，你看到了吧？北边的雾退了。' },
  { id: 'ep01.cenpo.b03', type: 'dialogue', speaker: '岑姨', text: '看见了。我还看见你拽着人往坡上跑。' },
  { id: 'ep01.cenpo.b04', type: 'action', actor: '阿洛', text: '阿洛笑了一下，没反驳。', presentation: 'portrait' },
  { id: 'ep01.cenpo.b05', type: 'dialogue', speaker: '阿洛', text: '就到旧路看看，不往深处走。' },
  { id: 'ep01.cenpo.b06', type: 'narration', text: '岑姨又看了一眼北边。雾还在慢慢往深处退，像水面在落。' },
  { id: 'ep01.cenpo.b07', type: 'dialogue', speaker: '岑姨', text: '那片地方，好几十年没什么人往里走了。雾退是退了，路好不好走，谁也说不准。' },
  { id: 'ep01.cenpo.b08', type: 'dialogue', speaker: '岑姨', text: '真要去，带一个。' },
  { id: 'ep01.cenpo.b09', type: 'dialogue', speaker: '阿洛', text: '我也是这么想的。' },
  { id: 'ep01.cenpo.b10', type: 'dialogue', speaker: '岑姨', text: '我没问你。' },
  { id: 'ep01.cenpo.b11', type: 'narration', text: '阿洛闭上嘴，朝你使了个眼色，像在说：这关过了。' },
  { id: 'ep01.cenpo.b12', type: 'dialogue', speaker: '岑姨', text: '走吧，先去站里。我拿点东西。' },
  { id: 'ep01.cenpo.b13', type: 'narration', text: '岑姨多看了你一眼。没再说别的。' },
] };

const spirits: NarrativeScene = { sceneId: 'ep01.spirits', beats: [
  { id: 'ep01.spirits.b01', type: 'narration', text: '阿洛带你往语灵站走。路上他几次回头，还想看北边。' },
  { id: 'ep01.spirits.b02', type: 'narration', text: '语灵站里和往常一样。炉子烧着，水壶在墙边。岑姨把两个小布袋放到桌上。' },
  { id: 'ep01.spirits.b03', type: 'dialogue', speaker: '阿洛', text: '你带哪个？' },
  { id: 'ep01.spirits.b04', type: 'narration', text: '三只语灵都在原来的地方。' },
  { id: 'ep01.spirits.b05', type: 'narration', text: '芽语在窗边。你走进去时，它正用叶尖接住一滴从屋檐落下的水。水珠停了一瞬，被它轻轻甩掉。它看见你，把身子转正了一点。' },
  { id: 'ep01.spirits.b06', type: 'narration', text: '烬尾在炉边。它没抬头，只把尾巴从左边换到右边。炉火暗了一下，它不满地“咕”了一声，又往炉壁挤了挤，才拿眼睛瞥你。' },
  { id: 'ep01.spirits.b07', type: 'narration', text: '澜歌在水池里。水面静得能照见屋顶。你走到池边，它才从水底浮上来一些。灰蓝色的眼睛从水面下看你，然后它把嘴尖探出来，吐了一个很小的泡。' },
  { id: 'ep01.spirits.b08', type: 'choice', choices: [
    { id: 'ep01.spirits.c01', text: '带芽语' },
    { id: 'ep01.spirits.c02', text: '带烬尾' },
    { id: 'ep01.spirits.c03', text: '带澜歌' },
  ] },
] };

const partnerScenes: Record<Starter, NarrativeScene> = {
  芽语: { sceneId: 'ep01.partner.yayu', beats: [
    { id: 'ep01.partner.yayu.b01', type: 'narration', text: '你朝窗边走过去。芽语从窗台下来，两片叶子轻轻一拢，跟在你身边。它没回头，也没去看另外两只。' },
    { id: 'ep01.partner.yayu.b02', type: 'action', actor: '芽语', text: '它挨了挨你的裤脚，凉凉的，像刚淋过一点雨。', presentation: 'portrait' },
    { id: 'ep01.partner.yayu.b03', type: 'narration', text: '芽语跟在你右边，脚步很轻，像怕踩坏什么。' },
  ] },
  烬尾: { sceneId: 'ep01.partner.jinwei', beats: [
    { id: 'ep01.partner.jinwei.b01', type: 'narration', text: '你朝炉边走过去。烬尾没动，等你在它面前站好，才慢吞吞地站起来，尾巴甩了一下，从喉咙里滚出一声很低的“咕”。' },
    { id: 'ep01.partner.jinwei.b02', type: 'action', actor: '烬尾', text: '它绕到你另一边，尾巴扫过你的脚踝。没看你，只朝门口抬了抬下巴。', presentation: 'portrait' },
    { id: 'ep01.partner.jinwei.b03', type: 'narration', text: '烬尾站在最前面一点，像在等着开路。' },
  ] },
  澜歌: { sceneId: 'ep01.partner.lange', beats: [
    { id: 'ep01.partner.lange.b01', type: 'narration', text: '你走到水池边，蹲下来。澜歌没有躲。它游到池边，把额头往你手边靠了靠。' },
    { id: 'ep01.partner.lange.b02', type: 'narration', text: '然后它从水里出来，跟在你身后。水顺着它滑回池子里，地上没留下什么水迹。' },
    { id: 'ep01.partner.lange.b03', type: 'action', actor: '澜歌', text: '它走在你左边。几乎没有声音。', presentation: 'portrait' },
    { id: 'ep01.partner.lange.b04', type: 'narration', text: '它跟得很慢，但一直没落下。' },
  ] },
};

const firstGuide: NarrativeScene = { sceneId: 'ep01.first_guide', beats: [
  { id: 'ep01.first_guide.b01', type: 'narration', text: '你们正准备出门。岑姨从桌边站起来。' },
  { id: 'ep01.first_guide.b02', type: 'dialogue', speaker: '岑姨', text: '先别急。平时在站里熟是一回事，真带出去又是另一回事。' },
  { id: 'ep01.first_guide.b03', type: 'dialogue', speaker: '岑姨', text: '你跟它试两下，看看彼此跟不跟得上。' },
  { id: 'ep01.first_guide.b04', type: 'narration', text: '【第一次引导训练，系统接管，时长约60–90秒，可跳过。】' },
  { id: 'ep01.first_guide.b05', type: 'narration', text: '训练结束。你的同行语灵站在你身边，比刚才更注意你。' },
  { id: 'ep01.first_guide.b06', type: 'action', actor: '同行语灵', text: '它动了动，没有出声，只是朝门口的方向转过去。', presentation: 'portrait' },
  { id: 'ep01.first_guide.b05_alt', type: 'narration', text: '你决定先上路，训练留到之后。' },
  { id: 'ep01.first_guide.b06_alt', type: 'dialogue', speaker: '岑姨', text: '行，路上慢点。' },
  { id: 'ep01.first_guide.b07', type: 'dialogue', speaker: '阿洛', text: '走。它已经想去了。' },
  { id: 'ep01.first_guide.b08', type: 'narration', text: '旧路就在前面。雾退开的地方，能看清地上铺着很老的石板。' },
] };

const departure: NarrativeScene = { sceneId: 'ep01.departure', beats: [
  { id: 'ep01.departure.b01', type: 'narration', text: '你们离开语灵站，穿过雾港最后几间屋子。北边的雾没有再围上来，像让开了一条窄路。你的同行语灵跟得很近。' },
  { id: 'ep01.departure.b02', type: 'dialogue', speaker: '阿洛', text: '说真的，我以前做梦都想过北边是什么样。' },
  { id: 'ep01.departure.b03', type: 'dialogue', speaker: '玩家', text: '现在就在你面前。' },
  { id: 'ep01.departure.b04', type: 'dialogue', speaker: '阿洛', text: '对。所以更得看看。' },
  { id: 'ep01.departure.b05', type: 'narration', text: '旧路从雾里露出来，一直向北。' },
  { id: 'ep01.departure.b06', type: 'narration', text: '港外旧路，节点亮起。' },
] };

export const EP01_PRE_SELECTION_SCENES = [morning, northView, cenpo, spirits] as const;
export const EP01_PRE_SELECTION_BEATS = EP01_PRE_SELECTION_SCENES.flatMap(scene => scene.beats.map(beat => ({ sceneId: scene.sceneId, beat })));
export const EP01_PARTNER_SCENES = partnerScenes;
export const EP01_FIRST_GUIDE_SCENE = firstGuide;
export const EP01_DEPARTURE_SCENE = departure;
export const EP01_V3_SCENES: readonly NarrativeScene[] = [morning, northView, cenpo, spirits, ...Object.values(partnerScenes), firstGuide, departure];

export function ep01PartnerScene(starter: Starter): NarrativeScene { return partnerScenes[starter]; }
export function ep01GuideBeats(outcome: 'trained' | 'skipped'): readonly NarrativeBeat[] {
  const ids = outcome === 'trained'
    ? ['ep01.first_guide.b05', 'ep01.first_guide.b06', 'ep01.first_guide.b07', 'ep01.first_guide.b08']
    : ['ep01.first_guide.b05_alt', 'ep01.first_guide.b06_alt', 'ep01.first_guide.b07', 'ep01.first_guide.b08'];
  return ids.map(id => firstGuide.beats.find(beat => beat.id === id)!);
}
