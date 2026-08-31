import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { activeMotion, displayedHp, PLAYER_MOTION } from '../app/prototype/battle-ui/battle-motion.ts';
import { captureWaterUltimate, presentationMotion, WATER_ULTIMATE_ASSET, WATER_ULTIMATE_MOTION } from '../app/prototype/battle-ui/water-ultimate-motion.ts';
import { BOSS_SKILLS_V2, DEMO_SKILLS, demoReducer, initialDemo, type DemoState, type SkillId } from '../app/prototype/battle-ui/demo-model.ts';
const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const page = read('app/prototype/battle-ui/page.tsx');
const css = read('app/prototype/battle-ui/water-ultimate.css');
const component = read('app/prototype/battle-ui/water-ultimate.tsx');
const cast = (state: DemoState, id: SkillId) => demoReducer(demoReducer(state, { type:'select', id }), { type:'cast' });
let n = 0;
function check(label: string, fn: () => void) { fn(); console.log(`PASS ${++n}. ${label}`); }

check('Only water opts in; all eligibility combinations tested', () => {
  for (const id of ['water','tide','wave'] as SkillId[]) for (const enabled of [true,false]) for (const ready of [true,false]) for (const reduced of [true,false]) {
    assert.equal(captureWaterUltimate(id,enabled,ready,reduced), id==='water' && enabled && ready && !reduced);
  }
});
check('Cinematic 3800ms, impact2200ms,1600ms result; short2200/880 preserved', () => {
  assert.deepEqual(WATER_ULTIMATE_MOTION,{durationMs:3800,impactMs:2200});
  assert.equal(WATER_ULTIMATE_MOTION.durationMs-WATER_ULTIMATE_MOTION.impactMs,1600);
  assert.deepEqual(PLAYER_MOTION.water,{durationMs:2200,impactMs:880});
});
check('Other skills and non-player phases keep exact historical timing objects', () => {
  for (const id of ['water','tide','wave'] as SkillId[]) for (const phase of ['choose','player','enemyReady','enemy','won','lost'] as DemoState['phase'][]) {
    const state = {...initialDemo('gatekeeper-v2'),selected:id,phase};
    assert.equal(presentationMotion(state,false),activeMotion(state));
    assert.equal(presentationMotion(state,true), id==='water' && phase==='player' ? WATER_ULTIMATE_MOTION : activeMotion(state));
  }
});
check('Only presentation delays enemy loss; model settles18 exactly once', () => {
  const state = cast(initialDemo('gatekeeper-v2'),'water');
  assert.equal(state.enemyHp,42); assert.equal(displayedHp(state,true).enemy,60);
  assert.equal(displayedHp(state,false).enemy,42);
  assert.deepEqual(demoReducer(state,{type:'cast'}),state);
  const before=JSON.stringify(state); presentationMotion(state,true); displayedHp(state,true); assert.equal(JSON.stringify(state),before);
});
check('Lethal cinematic skips enemy; terminal/reset still work', () => {
  const state = cast({...initialDemo('gatekeeper-v2'),enemyHp:10},'water');
  assert.equal(displayedHp(state,true).enemy,10); assert.equal(displayedHp(state,false).enemy,0);
  const win=demoReducer(state,{type:'advance'}); assert.equal(win.phase,'won'); assert.equal(win.playerHp,48);
  assert.deepEqual(demoReducer(win,{type:'reset'}),initialDemo('gatekeeper-v2'));
});
check('Representative water/water/tide/water remains4turns23HP', () => {
  let state=initialDemo('gatekeeper-v2');
  for (const id of ['water','water','tide','water'] as SkillId[]) {
    state=cast(state,id); const before=JSON.stringify(state);
    presentationMotion(state,true); assert.equal(JSON.stringify(state),before);
    while(state.phase!=='choose' && state.phase!=='won' && state.phase!=='lost') state=demoReducer(state,{type:'advance'});
  }
  assert.equal(state.phase,'won'); assert.equal(state.playerHp,23); assert.equal(state.turn,4);
});
check('Boss14/28 and every player effect unchanged', () => {
  assert.deepEqual(BOSS_SKILLS_V2.map(s=>s.damage),[14,28]);
  assert.deepEqual(DEMO_SKILLS.map(s=>[s.damage,s.healing,s.weaken,s.mitigation]),[[18,0,.2,0],[10,22,0,0],[0,10,0,.3]]);
});
check('Readiness is decoded once with failure fallback and unmount guard', () => {
  assert.match(page,/image.decode\(\)/); assert.match(page,/Promise.all\(images\)/);
  assert.match(page,/if \(!cancelled\) setUltimateReady\(true\)/); assert.match(page,/if \(!cancelled\) setUltimateFailed\(true\)/);
  assert.match(page,/cancelled = true/); assert.match(page,/素材未载入，使用短演出/);
});
check('Readiness/toggle captured at confirm, never re-evaluated mid-cast', () => {
  assert.match(page,/setUltimateThisCast\(captureWaterUltimate\(skill.id, ultimateEnabled, ultimateReady, reducedMotion\)\)/);
  assert.match(page,/const ultimateActive = ultimateThisCast && state.phase === 'player' && state.selected === 'water' && !reducedMotion/);
  assert.match(page,/motion = presentationMotion\(state, ultimateActive\)/);
  assert.match(page,/checked=\{ultimateEnabled\} disabled=\{!choosing\}/);
});
check('Phase and HP timers still share resolver and cancel on state change', () => {
  assert.match(page,/motion\?\.durationMs \?\? PHASE_DURATION\[state.phase\]/);
  assert.match(page,/setShownImpact\(currentMotionKey\), motion.impactMs/);
  assert.equal((page.match(/clearTimeout\(timer\)/g)??[]).length,2);
  assert.match(page,/--bu-player-duration': `\$\{playerMotion.durationMs\}ms`/);
});
check('Old cut-in, arm and projectile disabled only for cinematic water', () => {
  assert.match(page,/motion && !ultimateActive && <CastCinematic/);
  assert.match(page,/WaterCaster active=\{state.phase === 'player' && !ultimateActive\}/);
  assert.match(page,/waterCasting && !ultimateActive && <WaterSurge/);
  assert.match(page,/ultimateActive && <WaterUltimate key=\{`\$\{state.turn\}-ultimate`\}/);
});
check('Manual next reveals before advancing; cutaway immediately hides', () => {
  assert.match(page,/if \(awaitingImpact\) setShownImpact\(currentMotionKey\);\s*else if \(awaitingRecovery\) setShownRecovery\(currentMotionKey\);\s*else dispatch/);
  assert.match(css,/\[data-impact="shown"\] \.bu-ultimate \{ visibility:hidden/);
  assert.match(page,/setUltimateThisCast\(false\)/);
});
check('Cinematic finishes before impact with two distinct poses, no infinite loops', () => {
  assert.ok(.578*WATER_ULTIMATE_MOTION.durationMs<WATER_ULTIMATE_MOTION.impactMs);
  assert.match(css,/57.8%,100% \{ opacity:0; visibility:hidden/);
  assert.match(css,/bu-ultimate-release \{ background-position:100% 0/);
  assert.match(component,/bu-ultimate-charge bu-ultimate-pose/);
  assert.match(component,/bu-ultimate-release bu-ultimate-pose/);
  assert.doesNotMatch(css,/infinite/);
});
check('One contact camera and one enemy recoil start on actual visible hit', () => {
  assert.match(css,/\[data-impact="shown"\] \.bu-stage \{ animation:bu-ultimate-contact 800ms/);
  assert.match(css,/\[data-phase="player"\]\[data-ultimate="true"\] \.bu-enemy \{ animation:none/);
  assert.match(css,/\[data-impact="shown"\] \.bu-enemy \{ animation:bu-v3-hit-right 720ms/);
  assert.doesNotMatch(css,/\.bu-enemy \.bu-sprite \{ animation:bu-v3-hit/);
});
check('Reduced motion bypasses cinematic and CSS suppresses animation', () => {
  assert.match(page,/!reducedMotion && shownImpact !== currentMotionKey/);
  assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);
  assert.match(css,/\.bu-ultimate \{ display:none/);
  assert.match(css,/animation:none !important/);
});
check('Arena-only overlay is decorative/noninteractive, no combat/save APIs', () => {
  assert.match(component,/className="bu-ultimate" aria-hidden="true"/);
  assert.match(css,/pointer-events:none/);
  assert.doesNotMatch(component,/dispatch|demoReducer|setTimeout|localStorage|fetch\(|onAnimationEnd|onClick/);
  const start=page.indexOf('<section className="bu-field"'); const end=page.indexOf('</section>',start);
  assert.ok(page.slice(start,end).includes('<WaterUltimate')); assert.doesNotMatch(page.slice(start,end),/<HpBar/);
  assert.doesNotMatch(css,/position:fixed/);
});
check('Phone composition explicitly bounded; unchanged full illustration fallback', () => {
  assert.match(css,/@media \(max-width:680px\)/); assert.match(css,/overflow:hidden/);
  assert.match(css,/height:108%/); assert.match(css,/mask-image:radial-gradient/);
  assert.match(page,/data-testid="active-spirit"/);
});
check('Pose asset2:1 opaque PNG intentionally used unchanged, not claimed alpha', () => {
  const png=readFileSync(new URL(`../public${WATER_ULTIMATE_ASSET}`,import.meta.url));
  assert.equal(png.subarray(1,4).toString(),'PNG');assert.equal(png.readUInt32BE(16),1774);assert.equal(png.readUInt32BE(20),887);
  assert.equal(png[25],2);assert.ok(png.length<3_500_000);assert.match(css,/lange-ultimate-poses-v1.png/);
  assert.match(page,/<link rel="preload" as="image" href=\{WATER_ULTIMATE_ASSET\}/);
});
console.log(`${n}/${n} water ultimate checks PASS (code/asset contracts, not dynamic browser acceptance)`);
