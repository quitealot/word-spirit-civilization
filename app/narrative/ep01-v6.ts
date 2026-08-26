import type { NarrativeBeat, NarrativeScene, Starter } from './types.ts';

/** Sol final PASS. This text is permanently frozen and must not be polished in code. */
export const EP01_V6_STATUS = 'FROZEN_APPROVED' as const;

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
  { id: 'ep01.north_view.b07', type: 'dialogue', speaker: '玩家', text: '先和乔姨说一声吧。' },
  { id: 'ep01.north_view.b08', type: 'dialogue', speaker: '阿洛', text: '……也行。她应该在站里。' },
] };

const qiaoyi: NarrativeScene = { sceneId: 'ep01.qiaoyi', beats: [
  { id: 'ep01.qiaoyi.b01', type: 'narration', text: '乔姨站在语灵站门口。她没看你们。她看着北边。' },
  { id: 'ep01.qiaoyi.b02', type: 'dialogue', speaker: '阿洛', text: '乔姨，你看到了吧？北边的雾退了。' },
  { id: 'ep01.qiaoyi.b03', type: 'dialogue', speaker: '乔姨', text: '看见了。我还看见你拽着人往坡上跑。' },
  { id: 'ep01.qiaoyi.b04', type: 'action', actor: '阿洛', text: '阿洛笑了一下，没反驳。', presentation: 'portrait' },
  { id: 'ep01.qiaoyi.b05', type: 'dialogue', speaker: '阿洛', text: '就到旧路看看，不往深处走。' },
  { id: 'ep01.qiaoyi.b06', type: 'narration', text: '乔姨又看了一眼北边。雾还在慢慢往深处退，像水面在落。' },
  { id: 'ep01.qiaoyi.b07', type: 'dialogue', speaker: '乔姨', text: '那片地方，好几十年没什么人往里走了。雾退是退了，路好不好走，谁也说不准。' },
  { id: 'ep01.qiaoyi.b08', type: 'dialogue', speaker: '乔姨', text: '真要去，带一个。' },
  { id: 'ep01.qiaoyi.b09', type: 'dialogue', speaker: '阿洛', text: '我也是这么想的。' },
  { id: 'ep01.qiaoyi.b10', type: 'dialogue', speaker: '乔姨', text: '我没问你。' },
  { id: 'ep01.qiaoyi.b11', type: 'narration', text: '阿洛闭嘴了。你差点笑出来。' },
] };

const linkTestPre: NarrativeScene = { sceneId: 'ep01.link_test_pre', beats: [
  { id: 'ep01.link_test_pre.b01', type: 'narration', text: '语灵站里和往常一样。炉子烧着，水壶在墙边。你平时没少来这里帮乔姨搭手，芽语、烬尾和澜歌都认得你。' },
  { id: 'ep01.link_test_pre.b02', type: 'narration', text: '芽语在窗边。你走进去时，它正用叶尖接住一滴从屋檐落下的水。水珠停了一瞬，被它轻轻甩掉。它看见你，把身子转正了一点。' },
  { id: 'ep01.link_test_pre.b03', type: 'narration', text: '烬尾在炉边。它没抬头，只把尾巴从左边换到右边。炉火暗了一下，它不满地“咕”了一声，又往炉壁挤了挤，才拿眼睛瞥你。' },
  { id: 'ep01.link_test_pre.b04', type: 'narration', text: '澜歌在水池里。水面静得能照见屋顶。你走到池边，它才从水底浮上来一些。灰蓝色的眼睛从水面下看你，然后它把嘴尖探出来，吐了一个很小的泡。' },
  { id: 'ep01.link_test_pre.b05', type: 'dialogue', speaker: '阿洛', text: '那我呢？' },
  { id: 'ep01.link_test_pre.b06', type: 'dialogue', speaker: '乔姨', text: '这三个平时是谁帮我照看的？' },
  { id: 'ep01.link_test_pre.b07', type: 'dialogue', speaker: '阿洛', text: '……他。' },
  { id: 'ep01.link_test_pre.b08', type: 'dialogue', speaker: '乔姨', text: '那你坐着。' },
  { id: 'ep01.link_test_pre.b09', type: 'narration', text: '阿洛走到一边坐下，不再插话。' },
  { id: 'ep01.link_test_pre.b10', type: 'dialogue', speaker: '乔姨', text: '你跟它们都熟。但带出去不是在站里玩。三个都试试，看谁跟你的节奏最合。' },
  { id: 'ep01.link_test_pre.b11', type: 'narration', text: '【系统接管：4个行动倾向情境 → 三只语灵各一次技能体验，共调用9个正式L1。】' },
] };

const linkTestResult: NarrativeScene = { sceneId: 'ep01.link_test_result', beats: [
  { id: 'ep01.link_test_result.b01', type: 'narration', text: '测试结束。乔姨看看三只语灵，又看看你。' },
  { id: 'ep01.link_test_result.b02', type: 'narration', text: '【UI 显示：与你最契合 —— 由系统高亮推荐语灵名。】' },
  { id: 'ep01.link_test_result.b03', type: 'dialogue', speaker: '乔姨', text: '看着是{recommendedSpirit}跟你最顺。' },
  { id: 'ep01.link_test_result.b04', type: 'dialogue', speaker: '乔姨', text: '不过一起走的是你们。最后带谁，你自己定。' },
] };

const spiritChoice: NarrativeScene = { sceneId: 'ep01.spirit_choice', beats: [
  { id: 'ep01.spirit_choice.b01', type: 'narration', text: '三只语灵都在原来的地方。乔姨没有催你。' },
  { id: 'ep01.spirit_choice.b02', type: 'choice', choices: [
    { id: 'ep01.spirit_choice.c01', text: '带芽语' },
    { id: 'ep01.spirit_choice.c02', text: '带烬尾' },
    { id: 'ep01.spirit_choice.c03', text: '带澜歌' },
  ] },
] };

const spiritReselect: NarrativeScene = { sceneId: 'ep01.spirit_reselect', beats: [
  { id: 'ep01.spirit_reselect.b01', type: 'narration', text: '你没带测试推荐的那只。' },
  { id: 'ep01.spirit_reselect.b02', type: 'dialogue', speaker: '乔姨', text: '行。测试只看现在合不合拍，真想带谁，你自己定。' },
  { id: 'ep01.spirit_reselect.b03', type: 'narration', text: '她没再说什么。' },
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
  { id: 'ep01.first_guide.b01', type: 'narration', text: '你们正准备出门。乔姨从桌边站起来。' },
  { id: 'ep01.first_guide.b02', type: 'dialogue', speaker: '乔姨', text: '先别急。平时在站里熟是一回事，真带出去又是另一回事。' },
  { id: 'ep01.first_guide.b03', type: 'dialogue', speaker: '乔姨', text: '你跟它试两下，看看彼此跟不跟得上。' },
  { id: 'ep01.first_guide.b04', type: 'narration', text: '【第一次引导训练，系统接管，时长约60–90秒，可跳过。】' },
  { id: 'ep01.first_guide.b05', type: 'narration', text: '训练结束。你的同行语灵站在你身边，比刚才更注意你。' },
  { id: 'ep01.first_guide.b06', type: 'action', actor: '同行语灵', text: '它动了动，没有出声，只是朝门口的方向转过去。', presentation: 'portrait' },
  { id: 'ep01.first_guide.b05_alt', type: 'narration', text: '你没有多练。乔姨没说什么。' },
  { id: 'ep01.first_guide.b06_alt', type: 'dialogue', speaker: '乔姨', text: '行，路上慢点。' },
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

export const EP01_PRE_LINK_SCENES = [morning, northView, qiaoyi, linkTestPre] as const;
export const EP01_PRE_LINK_BEATS = EP01_PRE_LINK_SCENES.flatMap(scene => scene.beats.map(beat => ({ sceneId: scene.sceneId, beat })));
export const EP01_LINK_TEST_RESULT_SCENE = linkTestResult;
export const EP01_SPIRIT_CHOICE_SCENE = spiritChoice;
export const EP01_SPIRIT_RESELECT_SCENE = spiritReselect;
export const EP01_PARTNER_SCENES = partnerScenes;
export const EP01_FIRST_GUIDE_SCENE = firstGuide;
export const EP01_DEPARTURE_SCENE = departure;
export const EP01_V6_SCENES: readonly NarrativeScene[] = [morning, northView, qiaoyi, linkTestPre, linkTestResult, spiritChoice, spiritReselect, ...Object.values(partnerScenes), firstGuide, departure];

export function ep01PartnerScene(starter: Starter): NarrativeScene { return partnerScenes[starter]; }
export function ep01GuideBeats(outcome: 'trained' | 'skipped'): readonly NarrativeBeat[] {
  const ids = outcome === 'trained'
    ? ['ep01.first_guide.b05', 'ep01.first_guide.b06', 'ep01.first_guide.b07', 'ep01.first_guide.b08']
    : ['ep01.first_guide.b05_alt', 'ep01.first_guide.b06_alt', 'ep01.first_guide.b07', 'ep01.first_guide.b08'];
  return ids.map(id => firstGuide.beats.find(beat => beat.id === id)!);
}
