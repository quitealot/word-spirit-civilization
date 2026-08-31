'use client';

import { useEffect, useReducer, useRef, useState, type CSSProperties } from 'react';
import { DEMO_RULES } from './demo-model';
import { BossCaster, BossEffect, BossIcon } from './boss-caster';
import { CastCinematic, ImpactFrames } from './cinematic-effects';
import { FIRE_SKILLS, initialFire, fireReducer, fireSkill, fireEnemy, fireBlocked, fireDamage, type FireId } from './fire-model';
import { TAIL_POSE_ASSET, TAIL_MELEE_MOTION, firePresentationMotion, tailReturnPending } from './tail-melee-motion';
import { TailMeleeActor } from './tail-melee';
import './tail-melee.css';

const ART = '/battle-ui/jinwei-cutout-v1.png';
function FireIcon({ id }: { id: FireId }) {
  return <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{id === 'spark' ? <><path d="m32 8 5 17 17 7-17 6-5 18-6-18-18-6 18-7Z"/><path d="m47 11 2 6 6 2M9 48l7-3"/></> : id === 'tail' ? <><path d="M12 49C51 57 60 13 32 8c13 12 8 28-5 25 5-10-4-16-9-19 5 14-10 18-6 35Z"/><path d="M18 45c10 1 21-6 26-17"/></> : <><path d="M20 12 9 22l11 5M44 12l11 10-11 5M19 51l13 6 13-6"/><path d="M32 14c0 13-13 16-13 26a13 13 0 0 0 26 0c0-6-5-10-7-15-1 6-4 7-6 8Z"/></>}</svg>;
}
function FireHp({ enemy, hp, previous }: { enemy?: boolean; hp: number; previous: number }) {
  const max = enemy ? DEMO_RULES.enemyMaxHp : DEMO_RULES.playerMaxHp;
  const name = enemy ? '守门人' : '烬尾';
  return <div className={`bu-hp ${enemy ? 'bu-hp-enemy' : 'bu-hp-player'} ${hp <= max * .25 ? 'bu-hp-low' : ''}`}><div className="bu-avatar" aria-hidden="true"><img src={enemy ? '/battle-ui/gatekeeper.png' : ART} alt=""/></div><div className="bu-hp-main"><div className="bu-hp-caption"><strong>{name}</strong><span>{enemy ? '敌方目标' : '当前出战'} · HP</span><b>{hp}<small> / {max}</small></b></div><div className="bu-hp-track" role="progressbar" aria-label={`${name}生命`} aria-valuemin={0} aria-valuemax={max} aria-valuenow={hp}><div key={`${hp}-trail`} className="bu-hp-trail" style={{ width: `${Math.max(previous, hp) / max * 100}%`, '--bu-final': `${hp / max * 100}%`, ...(hp < previous ? { animationName: 'bu-trail' } : {}) } as CSSProperties}/><div className="bu-hp-fill" style={{ width: `${hp / max * 100}%` }}/><div className="bu-hp-ticks"/></div></div></div>;
}
// Cropped pixels of the same illustration, not a new creature or recolored water spell.
function TailFragment({ className }: { className: string }) {
  return <svg className={className} viewBox="680 430 550 650" aria-hidden="true"><image href={ART} width="1254" height="1254"/></svg>;
}
export function FireBattle() {
  const [state, dispatch] = useReducer(fireReducer, undefined, initialFire);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [shown, setShown] = useState('');
  const [returned, setReturned] = useState('');
  const [posesReady, setPosesReady] = useState(false);
  const [posesFailed, setPosesFailed] = useState(false);
  const [posesThisCast, setPosesThisCast] = useState(false);
  const arena = useRef<HTMLDivElement>(null);
  const castButton = useRef<HTMLButtonElement>(null);
  const resetButton = useRef<HTMLButtonElement>(null);
  const skill = fireSkill(state.selected), enemy = fireEnemy(state);
  const choosing = state.phase === 'choose', finished = state.phase === 'won' || state.phase === 'lost';
  const key = `${state.turn}-${state.phase}-${state.selected}`;
  const motion = firePresentationMotion(state);
  const tailActive = state.phase === 'player' && state.selected === 'tail' && !reduced;
  const returning = tailReturnPending(state, reduced, returned, key);
  const pending = !!motion && !reduced && shown !== key;
  const hp = pending && state.phase === 'enemy' ? state.previousPlayerHp : state.playerHp;
  const enemyHp = pending && state.phase === 'player' ? state.previousEnemyHp : state.enemyHp;
  const label = { choose: '你的回合', player: '语灵行动', enemyReady: '敌方准备', enemy: '敌方行动', won: '战斗胜利', lost: '战斗失利' }[state.phase];
  useEffect(() => { const q = window.matchMedia('(prefers-reduced-motion: reduce)'); const sync = () => setReduced(q.matches); sync(); q.addEventListener('change', sync); return () => q.removeEventListener('change', sync); }, []);
  useEffect(() => { let cancelled = false; const image = new Image(); image.src = TAIL_POSE_ASSET; image.decode().then(() => { if (!cancelled) setPosesReady(true); }).catch(() => { if (!cancelled) setPosesFailed(true); }); return () => { cancelled = true; }; }, []);
  useEffect(() => { if (!returning) return; const timer = setTimeout(() => setReturned(key), TAIL_MELEE_MOTION.landedMs); return () => clearTimeout(timer); }, [key, returning]);
  useEffect(() => { if (!pending || !motion) return; const timer = setTimeout(() => setShown(key), motion.impactMs); return () => clearTimeout(timer); }, [key, pending, motion]);
  useEffect(() => { if (paused || choosing || finished) return; const timer = setTimeout(() => dispatch({ type: 'advance' }), motion?.durationMs ?? 1000); return () => clearTimeout(timer); }, [key, paused, choosing, finished, motion]);
  useEffect(() => { if (choosing && state.selected) castButton.current?.focus({ preventScroll: true }); if (finished) resetButton.current?.focus({ preventScroll: true }); }, [choosing, state.selected, finished]);
  function reset() { setShown(''); setReturned(''); setPosesThisCast(false); dispatch({ type: 'reset' }); }
  function cast() { const rect = arena.current?.getBoundingClientRect(); if (rect && (rect.top < 0 || rect.bottom > window.innerHeight)) arena.current?.scrollIntoView({ behavior: 'instant', block: 'start' }); setPosesThisCast(posesReady); dispatch({ type: 'cast' }); }
  const text = state.phase === 'player' ? pending ? `${skill?.name} · ${state.selected === 'charge' ? '汇聚火光' : '准备出击'}` : state.selected === 'charge' ? '蓄火完成 · 下一次攻击提高60%' : `${skill?.name} · ${state.boosted ? '蓄火强化 · ' : ''}造成 ${state.damage} 点伤害`
    : state.phase === 'enemyReady' ? `守门人准备「${enemy.name}」 · ${enemy.damage}点伤害`
    : state.phase === 'enemy' ? pending ? `守门人 · ${enemy.name} · 抬臂出手` : `烬尾受到 ${state.incoming} 点伤害`
    : finished ? `${state.phase === 'won' ? '敌方' : '烬尾'} HP归零 · ${label}` : skill?.description ?? '选择技能查看介绍，再确认施放。';
  return <main className="bu-shell jf-shell" style={{ '--bu-player-duration': `${motion?.durationMs ?? 2200}ms`, '--bu-player-impact': `${motion?.impactMs ?? 880}ms`, '--bu-boss-duration': '2400ms', '--bu-boss-impact': '960ms' } as CSSProperties}>
    <header className="bu-header"><div><div className="bu-eyebrow">烬尾 · 单语灵试用 <i/> 第 {state.turn} 回合</div><h1>雾港守门人</h1></div><span className={`bu-phase bu-phase-${state.phase}`}>{label}</span></header>
    <div ref={arena} className="bu-arena"><FireHp enemy hp={enemyHp} previous={state.previousEnemyHp}/>
      <section className="bu-field jf-field" aria-label="烬尾单语灵战场" data-phase={state.phase} data-skill={state.selected ?? ''} data-boss-skill={enemy.id} data-impact={pending ? 'pending' : 'shown'} data-reduced={reduced}>
        <div className="bu-stage" key={key} data-action={!!motion}><div className="bu-scene"/>
          <div className="bu-combatant bu-ally"><div className="bu-sprite jf-sprite">{tailActive ? <TailMeleeActor posesReady={posesThisCast}/> : <img src={ART} alt="出战语灵：烬尾" draggable={false}/>}</div><div className="bu-nameplate"><span>烬尾</span><small>出战中</small></div></div>
          <div className="bu-combatant bu-enemy"><div className="bu-sprite"><BossCaster active={state.phase === 'enemy'} skill={enemy.id}/></div><div className="bu-nameplate"><span>守门人</span><small>BOSS</small></div></div>
          {state.phase === 'player' && !reduced && <div className={`jf-fx jf-fx-${state.selected}`} aria-hidden="true">{state.selected !== 'tail' && <><span className="jf-focus"/>{state.selected === 'spark' && <TailFragment className="jf-fire-path"/>}<span className="jf-motes"><i/><i/><i/><i/><i/><i/></span></>}{!pending && state.selected !== 'charge' && <span className="jf-hit"/>}</div>}
          {state.phase === 'enemy' && <><CastCinematic enemy name={enemy.name}/><BossEffect skill={enemy.id}/>{!pending && !reduced && <ImpactFrames enemy skill={enemy.id}/>}</>}
          {state.phase === 'player' && !pending && state.damage > 0 && <div className="bu-float bu-damage bu-float-enemy">−{state.damage}<small>{state.boosted ? '蓄火强化' : '伤害'}</small></div>}
          {state.phase === 'enemy' && !pending && <div className="bu-float bu-damage bu-float-player">−{state.incoming}<small>HP</small></div>}
        </div>
        <span className="bu-field-tag">单语灵出战</span><span className={`bu-enemy-intent bu-intent-${enemy.id}`}><BossIcon id={enemy.id}/><span>{finished ? '本场结束' : '本回合敌技'} · {enemy.name} <b>{enemy.damage}</b>伤害</span></span>
        {finished && <div className="bu-end"><span>{state.phase === 'won' ? '胜' : '败'}</span><strong>{label}</strong><button ref={resetButton} onClick={reset}>重新试用烬尾</button></div>}
      </section><FireHp hp={hp} previous={state.previousPlayerHp}/></div>
    <div className="jf-state"><span>{state.charged && !(state.phase === 'player' && pending) ? '◆ 已蓄火 · 下一次攻击 +60%' : '◇ 尚未蓄火'}</span><span>{state.turn < state.tailReadyTurn ? `焰尾 · 第${state.tailReadyTurn}回合恢复` : '焰尾 · 可用'}</span></div>
    <div className="bu-feedback" role="status" aria-live="polite"><span className="bu-feedback-step">{label}</span><p>{text}</p></div>
    <section className="bu-commands" aria-label="烬尾技能"><div className="bu-command-heading"><span><b>烬尾</b> 的技能</span><small>火星 · 焰尾 · 蓄火</small></div><div className="bu-skills">{FIRE_SKILLS.map(item => <button key={item.id} className="bu-skill jf-skill" disabled={!choosing || !!fireBlocked(state, item.id)} aria-pressed={state.selected === item.id} aria-controls="jf-detail" onClick={() => dispatch({ type: 'select', id: item.id })}><span className="bu-skill-icon"><FireIcon id={item.id}/></span><span className="bu-skill-copy"><strong>{item.name}</strong><small>{item.role}</small><span>{fireBlocked(state, item.id) || (item.damage ? `${fireDamage(state, item.id)} 伤害` : '下一次攻击 +60%')}</span></span><span className="bu-selection" aria-hidden="true">{state.selected === item.id ? '◆' : '◇'}</span></button>)}</div>
      {skill ? <div id="jf-detail" className="bu-detail"><div><span className="bu-detail-eyebrow">技能详情</span><h2>{skill.name}<small>{skill.role}</small></h2><p>{skill.description}</p>{choosing && <p>{fireDamage(state, skill.id) >= state.enemyHp ? '本招可击杀 · 敌人不再行动' : `本招后敌方将施放${enemy.name} · 预计承伤${Math.min(state.playerHp, enemy.damage)}`}</p>}</div><button ref={castButton} className="bu-cast" disabled={!choosing || !!fireBlocked(state, skill.id)} onClick={cast}>施放「{skill.name}」 →</button></div> : <p className="bu-select-hint">先点技能看介绍 · 蓄火不造成伤害，但能强化下一击</p>}
    </section>
    {skill?.id === 'tail' && <p className="bu-select-hint">{reduced ? '已减少动态 · 直接显示结果' : posesReady ? '跑近 → 甩尾命中 → 跳回原位' : posesFailed ? '动作素材未载入 · 使用简化动作' : '动作素材准备中 · 使用简化动作'}</p>}
    <footer className="bu-footer"><span>独立可玩预览 · 不写入存档</span><div><button aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? '恢复自动' : '暂停自动'}</button>{paused && !choosing && !finished && <button disabled={returning} onClick={() => { if (returning) return; return pending ? setShown(key) : dispatch({ type: 'advance' }); }}>{returning ? '等待烬尾回位' : '下一步'}</button>}<button disabled={!choosing && !finished} onClick={reset}>重开</button></div></footer>
    <details className="bu-scope"><summary>预览范围</summary><p>火星24、焰尾40、蓄火60%为已有技能的演示夹具，不是正式平衡。BOSS及48/60HP不变；无战中换灵、成长或存档。角色使用原立绘去底派生，基础动作是整体姿态与尾部像素特效，不是完整骨骼动画。不是微信真机版。</p></details>
  </main>;
}
