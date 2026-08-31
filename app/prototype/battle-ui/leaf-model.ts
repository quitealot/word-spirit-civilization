import { DEMO_RULES, getEnemySkill, type Phase } from './demo-model.ts';

// Existing V2 effects as an isolated UI fixture, not approved final pure-game balance.
export const LEAF_SKILLS = [
  { id:'slap', name:'叶拍', role:'稳定输出', damage:24, shield:0, mitigation:0, description:'造成24点伤害。' },
  { id:'ward', name:'护芽', role:'攻击 · 护盾', damage:8, shield:24, mitigation:0, description:'造成8点伤害，增加24点护盾；护盾优先承受伤害，剩余护盾保留。' },
  { id:'root', name:'扎根', role:'稳住防御', damage:0, shield:0, mitigation:.4, description:'下一次受到的伤害降低40%；先减伤，再由护盾吸收，不回复生命。' },
] as const;
export type LeafId = typeof LEAF_SKILLS[number]['id'];
export const LEAF_MOTION = { slap:{durationMs:2600,impactMs:1100}, ward:{durationMs:2800,impactMs:1200}, root:{durationMs:2600,impactMs:1100} } as const;
export type LeafState = {turn:number;phase:Phase;selected:LeafId|null;playerHp:number;enemyHp:number;previousPlayerHp:number;previousEnemyHp:number;shield:number;previousShield:number;mitigation:number;damage:number;incoming:number;absorbed:number;prevented:number};
export type LeafEvent={type:'select';id:LeafId}|{type:'cast'}|{type:'advance'}|{type:'reset'};
export function initialLeaf():LeafState{return {turn:1,phase:'choose',selected:null,playerHp:DEMO_RULES.playerMaxHp,enemyHp:DEMO_RULES.enemyMaxHp,previousPlayerHp:DEMO_RULES.playerMaxHp,previousEnemyHp:DEMO_RULES.enemyMaxHp,shield:0,previousShield:0,mitigation:0,damage:0,incoming:0,absorbed:0,prevented:0};}
export function leafSkill(id:LeafId|null){return LEAF_SKILLS.find(s=>s.id===id);}
export function leafEnemy(s:Pick<LeafState,'turn'>){return getEnemySkill({profile:'gatekeeper-v2',turn:s.turn});}
export function leafReducer(s:LeafState,e:LeafEvent):LeafState{
  if(e.type==='reset')return initialLeaf();
  if(e.type==='select')return s.phase==='choose'&&leafSkill(e.id)?{...s,selected:e.id}:s;
  if(e.type==='cast'){
    const skill=leafSkill(s.selected);if(s.phase!=='choose'||!skill)return s;
    const damage=Math.min(s.enemyHp,skill.damage);
    return {...s,phase:'player',previousPlayerHp:s.playerHp,previousEnemyHp:s.enemyHp,previousShield:s.shield,enemyHp:s.enemyHp-damage,shield:s.shield+skill.shield,mitigation:skill.mitigation,damage,incoming:0,absorbed:0,prevented:0};
  }
  if(s.phase==='player')return {...s,phase:s.enemyHp===0?'won':'enemyReady'};
  if(s.phase==='enemyReady'){
    const raw=leafEnemy(s).damage,hit=Math.round(raw*(1-s.mitigation)),absorbed=Math.min(s.shield,hit),incoming=Math.min(s.playerHp,hit-absorbed);
    return {...s,phase:'enemy',previousPlayerHp:s.playerHp,previousShield:s.shield,playerHp:s.playerHp-incoming,shield:s.shield-absorbed,mitigation:0,incoming,absorbed,prevented:raw-hit};
  }
  if(s.phase==='enemy')return {...s,phase:s.playerHp===0?'lost':'choose',turn:s.turn+(s.playerHp===0?0:1),selected:null,previousPlayerHp:s.playerHp,previousEnemyHp:s.enemyHp,previousShield:s.shield};
  return s;
}
