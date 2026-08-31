'use client';
import { useEffect, useId, useReducer, useRef, useState, type CSSProperties } from 'react';
import { BossCaster, BossEffect, BossIcon } from './boss-caster';
import { BOSS_MOTION } from './battle-motion';
import { LEAF_MOTION, LEAF_SKILLS, initialLeaf, leafEnemy, leafReducer, leafSkill, type LeafId } from './leaf-model';
import './leaf-battle.css';

export const LEAF_POSES='/battle-ui/yayu-battle-poses-v1.png';
function Pose({index,className=''}:{index:number;className?:string}){
  const id=useId().replaceAll(':','');
  return <svg className={className} viewBox="0 0 1024 1024" overflow="hidden" aria-hidden="true"><defs><clipPath id={id}><rect width="1024" height="1024"/></clipPath></defs><g clipPath={`url(#${id})`}><image href={LEAF_POSES} width="2048" height="2048" x={-(index%2)*1024} y={-Math.floor(index/2)*1024}/></g></svg>;
}
function LeafIcon({id}:{id:LeafId}){
  return <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{id==='slap'?<><path d="M12 48C6 22 31 11 53 10c0 27-16 48-41 38Z"/><path d="m13 49 28-28M25 36l-1-12m10 4 10 1"/></>:id==='ward'?<><path d="m32 7 22 9v17c0 13-12 22-22 26C21 55 10 46 10 33V16Z"/><path d="M32 46V27m0 11C18 39 17 27 19 23c10 0 13 5 13 12m0 2c0-12 9-17 16-16 1 10-5 16-16 16"/></>:<><path d="M32 8v29m-12-19 12 7 12-7M12 40h40M32 38l-13 9-9 9m22-18 13 9 9 9M32 38v18m-13-9-7-1m33-1 7 1"/></>}</svg>;
}
function Hp({hp,previous,enemy=false}:{hp:number;previous:number;enemy?:boolean}){
  const max=enemy?60:48,name=enemy?'守门人':'芽语';
  return <div className={`bu-hp ${enemy?'bu-hp-enemy':'bu-hp-player'}`}><div className="bu-hp-main"><div className="bu-hp-caption"><strong>{name}</strong><span>HP</span><b>{hp}<small> / {max}</small></b></div><div className="bu-hp-track" role="progressbar" aria-label={`${name}生命`} aria-valuemin={0} aria-valuemax={max} aria-valuenow={hp}><div key={`${hp}-trail`} className="bu-hp-trail" style={{width:`${Math.max(hp,previous)/max*100}%`,'--bu-final':`${hp/max*100}%`,...(hp<previous?{animationName:'bu-trail'}:{})} as CSSProperties}/><div className="bu-hp-fill" style={{width:`${hp/max*100}%`}}/><div className="bu-hp-ticks"/></div></div></div>;
}
export function LeafBattle(){
  const [s,dispatch]=useReducer(leafReducer,undefined,initialLeaf);
  const [paused,setPaused]=useState(false),[reduced,setReduced]=useState(false),[shown,setShown]=useState(''),[ready,setReady]=useState(false),[failed,setFailed]=useState(false);
  const arena=useRef<HTMLDivElement>(null),castRef=useRef<HTMLButtonElement>(null);
  const key=`${s.turn}-${s.phase}-${s.selected}`,skill=leafSkill(s.selected),enemy=leafEnemy(s),choosing=s.phase==='choose',finished=s.phase==='won'||s.phase==='lost';
  const motion=s.phase==='player'&&s.selected?LEAF_MOTION[s.selected]:s.phase==='enemy'?BOSS_MOTION:null;
  const pending=!!motion&&!reduced&&shown!==key;
  const hp=pending&&s.phase==='enemy'?s.previousPlayerHp:s.playerHp;
  const enemyHp=pending&&s.phase==='player'?s.previousEnemyHp:s.enemyHp;
  const shield=pending?s.previousShield:s.shield;
  useEffect(()=>{let cancelled=false;const image=new Image();image.src=LEAF_POSES;image.decode().then(()=>{if(!cancelled)setReady(true);}).catch(()=>{if(!cancelled)setFailed(true);});return()=>{cancelled=true;};},[]);
  useEffect(()=>{const q=window.matchMedia('(prefers-reduced-motion: reduce)');const sync=()=>setReduced(q.matches);sync();q.addEventListener('change',sync);return()=>q.removeEventListener('change',sync);},[]);
  useEffect(()=>{if(!pending||!motion)return;const timer=setTimeout(()=>setShown(key),motion.impactMs);return()=>clearTimeout(timer);},[pending,key,motion]);
  useEffect(()=>{if(paused||choosing||finished)return;const timer=setTimeout(()=>dispatch({type:'advance'}),motion?.durationMs??1000);return()=>clearTimeout(timer);},[key,paused,choosing,finished,motion]);
  useEffect(()=>{if(choosing&&s.selected)castRef.current?.focus({preventScroll:true});},[choosing,s.selected]);
  const label={choose:'你的回合',player:'语灵行动',enemyReady:'敌方准备',enemy:'敌方行动',won:'战斗胜利',lost:'战斗失利'}[s.phase];
  const feedback=s.phase==='player'?pending?`${skill?.name} · ${s.selected==='root'?'落杖扎根':'抬杖施放'}`:`${skill?.name} · ${s.damage?`${s.damage}伤害 · `:''}${s.selected==='ward'?'护盾 +24':s.selected==='root'?'下一次承伤降低40%':'命中'}`:s.phase==='enemy'?pending?`${enemy.name} · 蓄势出手`:`减伤抵消 ${s.prevented} · 护盾吸收 ${s.absorbed} · HP −${s.incoming}`:s.phase==='enemyReady'?`守门人准备${enemy.name} · ${enemy.damage}伤害`:finished?`${label} · ${s.phase==='won'?'敌方':'芽语'}HP归零`:skill?.description??'先选择技能查看效果，再确认施放。';
  function reset(){setShown('');dispatch({type:'reset'});}
  function cast(){const rect=arena.current?.getBoundingClientRect();if(rect&&(rect.top<0||rect.bottom>window.innerHeight))arena.current?.scrollIntoView({behavior:'instant',block:'start'});dispatch({type:'cast'});}
  return <main className="bu-shell yl-shell" style={{'--yl-duration':`${motion?.durationMs??2600}ms`,'--bu-boss-duration':'2400ms','--bu-boss-impact':'960ms'} as CSSProperties}>
    <header className="bu-header"><div><div className="bu-eyebrow">芽语 · 单语灵试用 · 第{s.turn}回合</div><h1>雾港守门人</h1></div><span className={`bu-phase bu-phase-${s.phase}`}>{label}</span></header>
    <div className="bu-arena" ref={arena}><Hp enemy hp={enemyHp} previous={s.previousEnemyHp}/><section className="bu-field yl-field" data-phase={s.phase} data-skill={s.selected??''} data-impact={pending?'pending':'shown'} data-reduced={reduced} aria-label="芽语单语灵战场">
      <div className="bu-stage" key={key}><div className="bu-scene"/><div className="bu-combatant bu-ally"><div className="bu-sprite yl-sprite" role="img" aria-label="芽语战斗站姿">{ready?<><Pose index={0} className="yl-idle"/>{s.phase==='player'&&!reduced&&<><Pose index={1} className="yl-windup"/><Pose index={s.selected==='slap'?2:3} className="yl-release"/></>}</>:<img src="/spirit-yayu.png" alt="芽语原立绘 · 动作素材准备中"/>}</div><div className="bu-nameplate"><span>芽语</span><small>出战中</small></div></div>
      <div className="bu-combatant bu-enemy"><div className="bu-sprite"><BossCaster active={s.phase==='enemy'} skill={enemy.id}/></div><div className="bu-nameplate"><span>守门人</span><small>BOSS</small></div></div>
      {s.phase==='player'&&!reduced&&<div className={`yl-fx yl-fx-${s.selected}`} aria-hidden="true"><span className="yl-charge"/><span className="yl-ring"/>{s.selected!=='root'&&[0,1,2,3,4].map(i=><svg key={i} className="yl-leaf" style={{'--i':i} as CSSProperties} viewBox="470 5 100 160"><image href="/battle-ui/yayu-original-cutout-v1.png" width="1254" height="1254"/></svg>)}{s.selected==='root'&&<svg className="yl-roots" viewBox="460 0 370 300"><image href="/battle-ui/yayu-original-cutout-v1.png" width="1254" height="1254"/></svg>}</div>}
      {s.phase==='enemy'&&<BossEffect skill={enemy.id}/>}
      {shield>0&&<div className="yl-shield-aura" aria-hidden="true"/>}
      {s.phase==='player'&&!pending&&s.damage>0&&<div className="bu-float bu-damage bu-float-enemy">−{s.damage}<small>伤害</small></div>}
      {s.phase==='player'&&!pending&&s.selected!=='slap'&&<div className="bu-float bu-float-player yl-positive">{s.selected==='ward'?'+24':'−40%'}<small>{s.selected==='ward'?'护盾':'下次承伤'}</small></div>}
      {s.phase==='enemy'&&!pending&&<div className="bu-float bu-damage bu-float-player">−{s.incoming}<small>HP · 护盾吸收{s.absorbed}</small></div>}
      </div><span className="bu-field-tag">单语灵出战</span><span className={`bu-enemy-intent bu-intent-${enemy.id}`}><BossIcon id={enemy.id}/><span>{enemy.name} · <b>{enemy.damage}</b>伤害</span></span>
      {finished&&<div className="bu-end"><span>{s.phase==='won'?'胜':'败'}</span><strong>{label}</strong><button onClick={reset}>重新试用芽语</button></div>}
    </section><Hp hp={hp} previous={s.previousPlayerHp}/></div>
    <div className="yl-status"><span>护盾 <b>{shield}</b> · 优先承伤</span><span>{s.mitigation>0&&!(s.phase==='player'&&pending)?'已扎根 · 下次减伤40%':'叶拍 · 护芽 · 扎根'}</span></div>
    <div className="bu-feedback" role="status" aria-live="polite"><span className="bu-feedback-step">{label}</span><p>{feedback}</p></div>
    <section className="bu-commands" aria-label="芽语技能"><div className="bu-command-heading"><span><b>芽语</b> 的技能</span><small>攻击 · 护盾 · 减伤</small></div><div className="bu-skills">{LEAF_SKILLS.map(item=><button key={item.id} className="bu-skill" disabled={!choosing} aria-pressed={s.selected===item.id} aria-controls="yl-detail" onClick={()=>dispatch({type:'select',id:item.id})}><span className="bu-skill-icon"><LeafIcon id={item.id}/></span><span className="bu-skill-copy"><strong>{item.name}</strong><small>{item.role}</small><span>{item.id==='root'?'下次减伤40%':`${item.damage}伤害${item.shield?' / 24护盾':''}`}</span></span><span className="bu-selection">{s.selected===item.id?'◆':'◇'}</span></button>)}</div>
    {skill?<div id="yl-detail" className="bu-detail"><div><span className="bu-detail-eyebrow">技能详情</span><h2>{skill.name}</h2><p>{skill.description}</p></div><button ref={castRef} className="bu-cast" disabled={!choosing||!ready} onClick={cast}>施放「{skill.name}」 →</button></div>:<p className="bu-select-hint">选技能看介绍，再确认施放。</p>}
    {!ready&&<p role="status">{failed?'动作素材载入失败，请刷新后重试。':'动作素材准备中…'}</p>}</section>
    <footer className="bu-footer"><span>独立试用 · 不写入存档</span><div><button aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused?'恢复自动':'暂停自动'}</button>{paused&&!choosing&&!finished&&<button onClick={()=>pending?setShown(key):dispatch({type:'advance'})}>下一步</button>}<button disabled={!choosing&&!finished} onClick={reset}>重开</button></div></footer>
    <details className="bu-scope"><summary>预览范围</summary><p>沿用叶拍24、护芽8+24、扎根40%作为演示配置，不是正式平衡。独立姿势切换与施法特效，不是完整骨骼动画；未接成长、主线或微信运行时。</p></details>
  </main>;
}
