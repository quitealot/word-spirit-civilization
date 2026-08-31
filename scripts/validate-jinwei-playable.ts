import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { FIRE_SKILLS, FIRE_MOTION, initialFire, fireReducer as reduce, fireDamage, fireBlocked, type FireState, type FireId } from '../app/prototype/battle-ui/fire-model.ts';
let checks = 0;
function test(name: string, run: () => void) { run(); console.log(`PASS ${++checks}: ${name}`); }
function cast(s: FireState, id: FireId) { return reduce(reduce(s, { type: 'select', id }), { type: 'cast' }); }
function finish(s: FireState) { for(let n=0;n<3 && !['choose','won','lost'].includes(s.phase);n++) s=reduce(s,{type:'advance'}); return s; }
test('initial baseline unchanged',()=>{ const s=initialFire(); assert.equal(s.playerHp,48); assert.equal(s.enemyHp,60); assert.equal(s.charged,false); });
test('three existing named skills only',()=>assert.deepEqual(FIRE_SKILLS.map(s=>[s.name,s.damage]),[['火星',24],['焰尾',40],['蓄火',0]]));
test('select has no effect',()=>{const s=reduce(initialFire(),{type:'select',id:'tail'});assert.equal(s.enemyHp,60);assert.equal(s.phase,'choose');});
test('spark deals24',()=>assert.equal(cast(initialFire(),'spark').damage,24));
test('tail deals40 and blocks next turn',()=>{const s=finish(cast(initialFire(),'tail'));assert.equal(s.turn,2);assert.equal(s.tailReadyTurn,3);assert.ok(fireBlocked(s,'tail'));assert.equal(reduce(s,{type:'select',id:'tail'}),s);});
test('cooldown usable turn3',()=>{let s={...initialFire(),enemyHp:500,previousEnemyHp:500,playerHp:500,previousPlayerHp:500};s=finish(cast(s,'tail'));s=finish(cast(s,'spark'));assert.equal(s.turn,3);assert.equal(fireBlocked(s,'tail'),'');});
test('charge no damage then persists across enemy',()=>{const s=finish(cast(initialFire(),'charge'));assert.equal(s.enemyHp,60);assert.equal(s.playerHp,34);assert.ok(s.charged);});
test('charge does not stack',()=>{const s=finish(cast(initialFire(),'charge'));assert.ok(fireBlocked(s,'charge'));assert.equal(reduce(s,{type:'select',id:'charge'}),s);});
test('charge spark rounds once38',()=>{const s=finish(cast(initialFire(),'charge'));assert.equal(fireDamage(s,'spark'),38);const hit=cast(s,'spark');assert.equal(hit.damage,38);assert.equal(hit.charged,false);assert.ok(hit.boosted);});
test('charge tail nominal64 capped60',()=>{const s=finish(cast(initialFire(),'charge'));assert.equal(fireDamage(s,'tail'),64);const hit=cast(s,'tail');assert.equal(hit.damage,60);assert.equal(hit.enemyHp,0);});
test('kill never counterattacks',()=>{const s=finish(cast(finish(cast(initialFire(),'charge')),'tail'));assert.equal(s.phase,'won');assert.equal(s.playerHp,34);assert.equal(reduce(s,{type:'advance'}),s);});
test('direct tail spark second winning route',()=>{const s=finish(cast(finish(cast(initialFire(),'tail')),'spark'));assert.equal(s.phase,'won');assert.equal(s.playerHp,34);assert.equal(s.turn,2);});
test('repeat cast cannot settle twice',()=>{const s=cast(initialFire(),'tail');assert.equal(reduce(s,{type:'cast'}),s);assert.equal(reduce(s,{type:'select',id:'spark'}),s);});
test('zeroHP loss and no overdamage',()=>{const s=finish(cast({...initialFire(),playerHp:5,previousPlayerHp:5},'charge'));assert.equal(s.phase,'lost');assert.equal(s.playerHp,0);assert.equal(s.incoming,5);});
test('reset clears charge cooldown all progress',()=>{const s=cast(finish(cast(initialFire(),'charge')),'tail');assert.deepEqual(reduce(s,{type:'reset'}),initialFire());});
test('all motions reserve >=1200ms result',()=>{for(const m of Object.values(FIRE_MOTION))assert.ok(m.durationMs-m.impactMs>=1200);});
const page=readFileSync('app/prototype/battle-ui/page.tsx','utf8');
const fire=readFileSync('app/prototype/battle-ui/fire-battle.tsx','utf8');
const css=readFileSync('app/prototype/battle-ui/fire-battle.css','utf8');
test('same route defaults preserved water and explicit fresh battle',()=>{assert.match(page,/useState<'lange' \| 'jinwei'>\('lange'\)/);assert.ok(page.includes('切换将新开一场'));assert.ok(page.includes('<LangeBattle/> : <FireBattle/>'));});
test('no saves or learning dependency',()=>{assert.doesNotMatch(fire,/localStorage|sessionStorage|fsrs|battleEligible/);assert.doesNotMatch(readFileSync('app/prototype/battle-ui/fire-model.ts','utf8'),/app\/game|zero-base|qualityMultiplier/);});
test('timers clean up; manual first reveals impact',()=>{assert.match(fire,/clearTimeout\(timer\)/);assert.ok(fire.includes("pending ? setShown(key) : dispatch({ type: 'advance' })"));assert.ok(fire.includes("pending && state.phase === 'player' ? state.previousEnemyHp"));});
test('original asset scoped fire animation mobile reduced',()=>{assert.ok(fire.includes('jinwei-cutout-v1.png'));assert.ok(css.includes('prefers-reduced-motion:reduce'));assert.ok(css.includes('max-width:680px'));assert.ok(css.includes('.jf-shell .bu-field[data-phase=player]'));});
// Explore enough depth to catch invalid cooldown, repeated charge and terminal transitions.
test('bounded exhaustive legal sequences stay valid',()=>{let queue=[initialFire()];let terminals=0;for(let depth=0;depth<8;depth++){const next:FireState[]=[];for(const s of queue){for(const skill of FIRE_SKILLS){if(fireBlocked(s,skill.id))continue;const n=finish(cast(s,skill.id));assert.ok(n.playerHp>=0&&n.playerHp<=48&&n.enemyHp>=0&&n.enemyHp<=60);if(n.phase==='won'||n.phase==='lost')terminals++;else next.push(n);}}queue=next;}assert.ok(terminals>5);});
console.log(`Jinwei: ${checks}/${checks} PASS`);
