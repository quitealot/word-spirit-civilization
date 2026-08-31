import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TIDE_RECOVERY_MS, tideRecoveryPending } from '../app/prototype/battle-ui/support-motion.ts';
import { displayedHp, motionKey, PLAYER_MOTION } from '../app/prototype/battle-ui/battle-motion.ts';
import { demoReducer, initialDemo, type DemoState, type SkillId } from '../app/prototype/battle-ui/demo-model.ts';
const read=(f:string)=>readFileSync(new URL(`../app/prototype/battle-ui/${f}`,import.meta.url),'utf8');
const page=read('page.tsx'),css=read('support-skills.css'),art=read('water-caster.tsx');
let n=0;
const check=(label:string,test:()=>void)=>{test();console.log(`PASS ${++n}. ${label}`);};
const cast=(s:DemoState,id:SkillId)=>demoReducer(demoReducer(s,{type:'select',id}),{type:'cast'});
check('Tide contact960, recovery1200, total2400 leaves1200ms reading',()=>{
  assert.deepEqual(PLAYER_MOTION.tide,{durationMs:2400,impactMs:960});assert.equal(TIDE_RECOVERY_MS,1200);
  assert.equal(PLAYER_MOTION.tide.durationMs-TIDE_RECOVERY_MS,1200);
});
check('Only active tide defers recovery; reduced motion and completed key bypass it',()=>{
  for(const selected of ['water','tide','wave'] as SkillId[]) for(const phase of ['choose','player','enemyReady','enemy','won','lost'] as DemoState['phase'][]) for(const reduced of [true,false]){
    const s={...initialDemo(),selected,phase};const key=motionKey(s);
    assert.equal(tideRecoveryPending(s,reduced,null,key),phase==='player'&&selected==='tide'&&!reduced);
    assert.equal(tideRecoveryPending(s,reduced,key,key),false);
  }
});
check('Stale key cannot complete the next tide',()=>{
  const s=cast({...initialDemo(),turn:2},'tide');assert.ok(tideRecoveryPending(s,false,'1-player-tide',motionKey(s)));
});
check('Tide still atomically deals10/heals22 once, including lethal casts',()=>{
  for(const enemyHp of [60,8]) {const s=cast({...initialDemo('gatekeeper-v2'),playerHp:20,enemyHp},'tide');assert.equal(s.playerHp,42);assert.equal(s.enemyHp,Math.max(0,enemyHp-10));assert.deepEqual(demoReducer(s,{type:'cast'}),s);}
});
check('At contact enemy loss visible but recovery withheld; at return both actual',()=>{
  const s=cast({...initialDemo(),playerHp:20},'tide');const hit=displayedHp(s,false);
  if(tideRecoveryPending(s,false,null,motionKey(s)))hit.player=s.previousPlayerHp;
  assert.deepEqual(hit,{player:20,enemy:50});assert.deepEqual(displayedHp(s,false),{player:42,enemy:50});
  assert.match(page,/if \(awaitingRecovery\) visibleHp.player = state.previousPlayerHp/);
});
check('Heal cap and already-full feedback remain actual, never fake22',()=>{
  assert.equal(cast({...initialDemo(),playerHp:40},'tide').healing,8);
  assert.equal(cast(initialDemo(),'tide').healing,0);assert.match(page,/state.healing \? 'HP' : '已满血'/);
});
check('Recovery timer is separate presentation with cleanup and reset',()=>{
  assert.match(page,/setShownRecovery\(currentMotionKey\), TIDE_RECOVERY_MS/);
  assert.match(page,/clearTimeout\(recoveryTimer\)/);assert.match(page,/setShownRecovery\(null\)/);
  assert.match(page,/!awaitingImpact && !awaitingRecovery && skill\?\.healing !== 0/);
});
check('Manual stepping reveals damage then recovery, then advances',()=>{
  assert.match(page,/if \(awaitingImpact\) setShownImpact\(currentMotionKey\);\s*else if \(awaitingRecovery\) setShownRecovery\(currentMotionKey\);\s*else dispatch/);
  assert.match(css,/\[data-recovery="shown"\] \.bu-tide-show \.bu-tide-halo/);
});
check('Tide has outbound, return, coiling pickup; no duplicated skill damage',()=>{
  for(const cls of ['bu-tide-out','bu-tide-return','bu-tide-coil','bu-tide-echo'])assert.ok(art.includes(cls));
  assert.match(css,/40% \{ opacity:.95; transform:scale\(1,1\)/);
  assert.match(css,/50% \{ opacity:.9; transform:translateX\(-15%\)/);
});
check('Wave stays0damage10healing30% mitigation; cannot become a shield pool',()=>{
  const s=cast({...initialDemo('gatekeeper-v2'),turn:2,playerHp:30},'wave');
  assert.equal(s.damage,0);assert.equal(s.healing,10);assert.equal(s.mitigation,.3);
  const hit=demoReducer(demoReducer(s,{type:'advance'}),{type:'advance'});assert.equal(hit.incoming,20);assert.equal(hit.playerHp,20);
});
check('Wave flattens ripples rather than firing another projectile',()=>{
  assert.match(css,/scale\(1,.55\)/);assert.match(css,/bu-support-press/);assert.match(css,/bu-support-curtain/);
  assert.match(css,/\.bu-wave-show \.bu-wave-seal \{ display:none/);
});
check('Ward responds only to visible enemy hit after wave',()=>{
  assert.match(page,/state.selected === 'wave' && state.phase === 'enemy' && !awaitingImpact && !reducedMotion && <WardReaction/);
  assert.match(css,/bu-support-deflect 700ms/);assert.match(css,/animation-delay:180ms/);
});
check('Ward consumes no input, animates no combat event and fades once',()=>{
  const ward=art.slice(art.indexOf('export function WardReaction'),art.indexOf('export function WaterSurge'));
  assert.match(ward,/aria-hidden="true"/);assert.doesNotMatch(ward,/dispatch|setTimeout|onAnimationEnd|onClick/);
  assert.match(css,/\.bu-ward-reaction \{[^}]*pointer-events:none/);assert.doesNotMatch(css,/infinite/);
});
check('Mobile and reduced motion protections cover new layers',()=>{
  assert.match(css,/@media \(max-width:680px\)/);assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);
  assert.match(css,/\.bu-ward-reaction, \.bu-tide-show, \.bu-wave-show \{ display:none/);
});
check('Water ultimate, BOSS, HP/controls have no new animation override',()=>{
  assert.doesNotMatch(css,/data-motion="water"|bu-ultimate|bu-boss|\.bu-hp|\.bu-commands|position:fixed/);
});
console.log(`${n}/${n} support skill checks PASS (engineering, not phone playtest)`);
