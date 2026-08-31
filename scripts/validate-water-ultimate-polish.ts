import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { WATER_ULTIMATE_MOTION } from '../app/prototype/battle-ui/water-ultimate-motion.ts';
const read=(path:string)=>readFileSync(new URL(`../app/prototype/battle-ui/${path}`,import.meta.url),'utf8');
const css=read('water-ultimate.css'), view=read('water-ultimate.tsx'), page=read('page.tsx');
let n=0;
function check(label:string,test:()=>void){test(); console.log(`PASS ${++n}. ${label}`);}
check('Total3800 and hit2200 unchanged; result readout remains1600ms',()=>{
  assert.deepEqual(WATER_ULTIMATE_MOTION,{durationMs:3800,impactMs:2200});
});
check('Pose and hand FX share actor coordinates on all sizes',()=>{
  const actor=view.indexOf('className="bu-ultimate-actor"');
  for(const cls of ['bu-ultimate-charge bu-ultimate-pose','bu-ultimate-release bu-ultimate-pose','bu-ultimate-chant','bu-ultimate-streams'])assert.ok(view.indexOf(cls)>actor);
  assert.match(css,/\.bu-ultimate-pose \{ position:absolute; inset:0/);
  assert.match(css,/\.bu-ultimate-chant \{ position:absolute; left:70%; top:40%/);
  assert.match(css,/\.bu-ultimate-actor \{ left:-16%; height:108%/);
});
check('Visible chant has gathering current, two contracting rings and six motes',()=>{
  assert.match(view,/bu-ultimate-gather-stream/);assert.match(view,/bu-ultimate-ring-inner/);
  assert.equal((view.match(/<i\/>/g)??[]).length,6);
  assert.match(css,/translate\(var\(--charge-x\),var\(--charge-y\)\)/);
  assert.match(css,/33% \{ opacity:.95; transform:translate\(0,0\) scale\(.45\)/);
});
check('Gather holds visibly before forward release, no extra waiting added',()=>{
  assert.match(css,/30%,37% \{ opacity:1; transform:translate\(-1%,-2%\)/);
  assert.match(css,/18%,37% \{ opacity:1; \} 41%,100% \{ opacity:0/);
  assert.match(css,/0%,38% \{ opacity:0; transform:scale\(.12,.3\)/);
});
check('Release has three distinct layers sharing the existing water texture',()=>{
  for(const cls of ['bu-ultimate-undertow','bu-ultimate-current','bu-ultimate-crest'])assert.ok(view.includes(cls));
  assert.match(css,/bu-ultimate-undertow \{ animation:bu-ultimate-undertow/);
  assert.match(css,/bu-ultimate-crest \{ animation:bu-ultimate-crest/);
  assert.match(css,/\.bu-ultimate-streams \{[^}]*left:83%[^}]*mix-blend-mode:screen/);
  const sources=[...`${view}${css}`.matchAll(/\/battle-ui\/([^'"\s)]+)/g)].map(m=>m[1]);
  assert.deepEqual([...new Set(sources)].sort(),['lange-ultimate-poses-v1.png','water-surge.png']);
});
check('Larger impact and wake scoped ONLY to active water cinematic',()=>{
  assert.match(css,/\[data-ultimate="true"\] \.bu-impact-water \{ --bu-hit-size:clamp\(190px,34vw,360px\)/);
  assert.match(css,/\[data-ultimate="true"\] \.bu-impact-water::after/);
  assert.match(css,/bu-ultimate-wake 1100ms ease-out both/);
  assert.ok(1100<WATER_ULTIMATE_MOTION.durationMs-WATER_ULTIMATE_MOTION.impactMs);
  assert.match(page,/motion && !awaitingImpact && !reducedMotion && <ImpactFrames/);
});
check('No new requests, sound, spell text, combat event, or repeated hits',()=>{
  assert.doesNotMatch(view,/dispatch|onAnimationEnd|setTimeout|useEffect|fetch\(|Audio|audio|COMBO|连击|暴击/);
  assert.equal((view.match(/<img/g)??[]).length,1); assert.match(view,/<small>澜歌<\/small><strong>水音<\/strong>/);
  assert.doesNotMatch(css,/infinite|filter:blur|backdrop-filter|position:fixed/);
});
check('Phone density bounded; reduced-motion/manual reveal still remove cinematic',()=>{
  assert.match(css,/\.bu-ultimate-chant \{ scale:.8/);
  assert.match(css,/--bu-hit-size:clamp\(190px,62vw,250px\)/);
  assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);assert.match(css,/\.bu-ultimate \{ display:none/);
  assert.match(css,/\[data-impact="shown"\] \.bu-ultimate \{ visibility:hidden/);
});
console.log(`${n}/${n} water polish checks PASS (not dynamic playtest)`);
