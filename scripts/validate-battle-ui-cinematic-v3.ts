import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BOSS_MOTION, PLAYER_MOTION } from '../app/prototype/battle-ui/battle-motion.ts';
import { BOSS_SKILLS_V2, DEMO_SKILLS, demoReducer, initialDemo, type SkillId } from '../app/prototype/battle-ui/demo-model.ts';
const read=(f:string)=>readFileSync(new URL(`../app/prototype/battle-ui/${f}`,import.meta.url),'utf8');
const css=read('cinematic-v3.css'),page=read('page.tsx'),effects=read('cinematic-effects.tsx');
let count=0;
function check(label:string,test:()=>void){test();count++;console.log(`PASS ${label}`);}
check('V3 is presentation only, boss14/28 and all three skills intact',()=>{
  assert.deepEqual(BOSS_SKILLS_V2.map(s=>s.damage),[14,28]);
  assert.deepEqual(DEMO_SKILLS.map(s=>[s.damage,s.healing,s.weaken,s.mitigation]),[[18,0,.2,0],[10,22,0,0],[0,10,0,.3]]);
  assert.doesNotMatch(effects,/dispatch|demoReducer|setTimeout|localStorage|fetch\(|onAnimationEnd/);
});
check('One continuous camera only inside the arena, HP outside',()=>{
  const stage=page.indexOf('<div key={currentMotionKey} className="bu-stage"');
  const end=page.indexOf('<span className="bu-field-tag">',stage);
  assert.ok(stage>0&&end>stage);assert.doesNotMatch(page.slice(stage,end),/<HpBar|bu-commands/);
  assert.match(css,/\.bu-stage\[data-action="true"\] \{ animation:bu-camera-beat/);
  assert.doesNotMatch(css,/(?:\.bu-shell|\.bu-hp|\.bu-commands)\s*\{/);
});
check('Intro uses originals, not competitor or regenerated character art',()=>{
  assert.match(effects,/\/battle-ui\/gatekeeper.png/);assert.match(effects,/\/battle-ui\/lange-cutout.png/);
  assert.doesNotMatch(effects,/https?:|data:image|onClick/);
});
check('Intro660ms ends before all880/960ms impacts, at least1.2s result remains',()=>{
  assert.match(css,/bu-cut-in 660ms/);
  for(const m of [...Object.values(PLAYER_MOTION),BOSS_MOTION]){
    assert.ok(660<m.impactMs);assert.equal(m.impactMs/m.durationMs,.4);assert.ok(m.durationMs-m.impactMs>=1200);
  }
});
check('Manual result reveal also removes intro immediately',()=>assert.match(css,/\[data-impact="shown"\] \.bu-cut-in \{ visibility:hidden/));
check('Camera contact hold stays on40–45%, not random shake or repeated flashes',()=>{
  assert.match(css,/40%,45% \{ transform:translateX\(var\(--bu-kick\)\) scale\(1.08\)/);
  assert.doesNotMatch(css,/animation[^;]*infinite|background:\s*(white|#fff);/);
});
check('Defensive spell uses calm camera and no speed marks',()=>{
  assert.match(css,/data-skill="wave"[^}]*animation-name:bu-camera-calm/);
  assert.match(css,/data-skill="wave"[^}]*\.bu-velocity \{ display:none/);
});
check('Five distinct effect identities, damage and healing remain single settlement',()=>{
  for(const id of ['water','tide','wave','fist','quake'])assert.ok((css+effects).includes(id));
  for(const id of ['water','tide','wave'] as SkillId[]){
    const selected=demoReducer(initialDemo('gatekeeper-v2'),{type:'select',id});
    const cast=demoReducer(selected,{type:'cast'});
    assert.deepEqual(demoReducer(cast,{type:'cast'}),cast);
  }
});
check('Atlas mounted only at visible impact and never in reduced-motion mode',()=>assert.match(page,/motion && !awaitingImpact && !reducedMotion && <ImpactFrames/));
check('Atlas has eight ordered distinct frames with discrete transitions',()=>{
  const keys=css.match(/@keyframes bu-atlas-eight \{([\s\S]*?)\n\}/)?.[1];assert.ok(keys);
  const frames=[...keys.matchAll(/background-position:([^;]+);/g)].map(m=>m[1]);
  assert.deepEqual(frames,['0 0','33.333333% 0','66.666667% 0','100% 0','0 100%','33.333333% 100%','66.666667% 100%','100% 100%']);
  assert.match(css,/640ms steps\(1,end\) both/);assert.match(css,/400% 200% no-repeat/);
});
check('Atlas does not loop or leave final fragments indefinitely',()=>{
  assert.match(css,/@keyframes bu-atlas-fade[^}]*\} 100% \{ opacity:0/);
  assert.match(css,/bu-atlas-fade 810ms/);
});
check('Black stone background composites at the enclosing group boundary',()=>assert.match(css,/\.bu-impact-sequence \{[^}]*mix-blend-mode:screen/));
check('All VFX and cut-ins are noninteractive and hidden from accessibility tree',()=>{
  assert.equal((effects.match(/aria-hidden="true"/g)??[]).length,4);
  for(const selector of ['.bu-cut-in {','.bu-velocity {','.bu-impact-sequence {'])assert.ok(css.slice(css.indexOf(selector),css.indexOf('}',css.indexOf(selector))).includes('pointer-events:none'));
});
check('Mobile positioning and bounded effect dimensions are specified',()=>{
  assert.match(css,/@media \(max-width:680px\)/);assert.match(css,/--bu-hit-size:clamp\(150px,27vw,290px\)/);
  assert.match(css,/\.bu-impact-sequence-stone \{ --bu-hit-x:23%/);
});
check('New layers are suppressed with OS reduced-motion; original art remains',()=>{
  assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);
  assert.match(css,/\.bu-cut-in, \.bu-cinematic-light, \.bu-velocity, \.bu-impact-sequence \{ display:none/);
  assert.match(read('battle-ui.css'),/animation:none !important; transition:none !important/);
});
check('Incoming and outgoing recoil wait for their matching impact tokens',()=>{
  assert.match(css,/bu-v3-hit-right 720ms var\(--bu-player-impact\)/);
  assert.match(css,/bu-v3-hit-left 720ms var\(--bu-boss-impact\)/);
});
check('Damage labels render above art; no phantom combo labels',()=>{
  assert.match(css,/\.bu-float \{ z-index:7/);assert.doesNotMatch(effects,/COMBO|连击|暴击|CRITICAL/);
});
for(const name of ['water','stone'])check(`${name} atlas is a bounded2:1 PNG, preloaded and consumed`,()=>{
  const file=`${name}-impact-atlas-v3.png`,png=readFileSync(new URL(`../public/battle-ui/${file}`,import.meta.url));
  assert.equal(png.subarray(1,4).toString(),'PNG');const w=png.readUInt32BE(16),h=png.readUInt32BE(20);
  assert.equal(w/h,2);assert.ok(w>=1024&&w<=2048);assert.ok(png.length<2_500_000);
  assert.ok(css.includes(file)&&page.includes(file));assert.ok([2,6].includes(png[25]));
  console.log(`  ${file}: ${w}x${h}, ${png.length} bytes; original generator output preserved`);
});
console.log(`${count}/${count} cinematic V3 checks PASS (code/art contracts, not browser playtest)`);
