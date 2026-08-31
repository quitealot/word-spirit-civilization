'use client';

import { useEffect, useReducer, useRef, useState, type CSSProperties } from 'react';
import { DEMO_RULES, DEMO_SKILLS, PHASE_DURATION, demoReducer, getSkill, initialDemo, skillDescription, type SkillId } from './demo-model';
import { WATER_MOTION, waterIsCasting, presentedEnemyHp } from './water-motion';
import { WaterCaster, WaterSurge } from './water-caster';
import './battle-ui.css';

function SkillIcon({ id }: { id: SkillId }) {
  return <svg viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    {id === 'water' && <><path d="M32 7C27 19 14 29 14 40a18 18 0 0 0 36 0C50 29 37 19 32 7Z" fill="currentColor" fillOpacity=".18"/><path d="M23 37c-3 7 0 12 6 14M8 49l-4 5M54 22l5-5M51 54l5 3"/></>}
    {id === 'tide' && <><path d="M10 34c0-16 23-28 36-12l7 8M53 18v12H41M54 39c-2 15-23 23-36 9l-7-8M11 52V40h12"/><path d="M32 25v15M25 32h14" strokeWidth="4"/></>}
    {id === 'wave' && <><path d="M32 7 52 15v17c0 13-11 22-20 26-9-4-20-13-20-26V15Z" fill="currentColor" fillOpacity=".15"/><path d="M21 29q6-6 11 0t11 0M21 38q6-6 11 0t11 0"/></>}
  </svg>;
}

function HpBar({ enemy = false, hp, previous, max }: { enemy?: boolean; hp: number; previous: number; max: number }) {
  return <div className={`bu-hp ${enemy ? 'bu-hp-enemy' : 'bu-hp-player'} ${hp <= max * .25 ? 'bu-hp-low' : ''}`}>
    <div className="bu-avatar" aria-hidden="true"><img src={enemy ? '/battle-ui/gatekeeper.png' : '/battle-ui/lange-cutout.png'} alt="" /></div>
    <div className="bu-hp-main">
      <div className="bu-hp-caption"><strong>{enemy ? '守门人' : '澜歌'}</strong><span>{enemy ? '敌方目标' : '当前出战'} · HP</span><b>{hp}<small> / {max}</small></b></div>
      <div className="bu-hp-track" role="progressbar" aria-label={enemy ? '守门人生命' : '澜歌生命'} aria-valuemin={0} aria-valuemax={max} aria-valuenow={hp}>
        {/* HP identity must survive phase changes: remounting would replay the same hit. */}
        <div key={`${hp}-trail`} className="bu-hp-trail" style={{ width: `${Math.max(previous, hp) / max * 100}%`, '--bu-final': `${hp / max * 100}%`, ...(hp < previous ? { animationName: 'bu-trail' } : {}) } as CSSProperties} />
        <div className="bu-hp-fill" style={{ width: `${hp / max * 100}%` }} />
        <div className="bu-hp-ticks" />
      </div>
    </div>
  </div>;
}

export default function BattleUiPage() {
  const [state, dispatch] = useReducer(demoReducer, undefined, initialDemo);
  const [paused, setPaused] = useState(false);
  const [roster, setRoster] = useState(false);
  const [impactPending, setImpactPending] = useState(false);
  const waterCasting = waterIsCasting(state);
  const awaitingImpact = waterCasting && impactPending;
  const skill = getSkill(state.selected);
  const choosing = state.phase === 'choose';
  const finished = state.phase === 'won' || state.phase === 'lost';
  const castRef = useRef<HTMLButtonElement>(null);
  const resetRef = useRef<HTMLButtonElement>(null);
  const arenaRef = useRef<HTMLDivElement>(null);
  const phaseLabel = { choose: '你的回合', player: '语灵行动', enemyReady: '敌方行动', enemy: '敌方结果', won: '战斗胜利', lost: '战斗失利' }[state.phase];

  useEffect(() => {
    const duration = waterCasting ? WATER_MOTION.durationMs : PHASE_DURATION[state.phase];
    if (paused || !duration) return;
    const timer = window.setTimeout(() => dispatch({ type: 'advance' }), duration);
    return () => window.clearTimeout(timer);
  }, [state.phase, paused, waterCasting]);
  useEffect(() => {
    if (!waterCasting || !impactPending) return;
    const timer = window.setTimeout(() => setImpactPending(false), WATER_MOTION.impactMs);
    return () => window.clearTimeout(timer);
  }, [waterCasting, impactPending]);
  useEffect(() => { if (finished) resetRef.current?.focus(); }, [finished]);

  function confirmCast() {
    if (!choosing || !skill) return;
    // On phones the detail button may be below the arena. Show the result before it plays.
    const arena = arenaRef.current;
    const bounds = arena?.getBoundingClientRect();
    if (bounds && (bounds.top < 0 || bounds.bottom > window.innerHeight)) {
      arena?.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
    setImpactPending(skill.id === 'water' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    dispatch({ type: 'cast' });
  }

  const resultText = awaitingImpact ? '水音 · 聚水施法'
    : state.phase === 'player'
    ? `${skill?.name} · ${state.damage ? `造成 ${state.damage} 伤害` : '防护生效'}${skill?.healing ? ` · 实际回复 ${state.healing} HP${state.healing === 0 ? '（生命已满）' : ''}` : ''}${state.weaken ? ` · 敌方下一击削弱${Math.round(state.weaken * 100)}%` : ''}${state.mitigation ? ` · 下一击减伤${Math.round(state.mitigation * 100)}%` : ''}`
    : state.phase === 'enemyReady' ? '守门人准备攻击 · 即将显示敌方结果'
    : state.phase === 'enemy' ? `守门人攻击 · 澜歌受到 ${state.incoming} 点伤害`
    : state.phase === 'won' ? '敌方 HP 归零 · 战斗胜利'
    : state.phase === 'lost' ? '澜歌 HP 归零 · 战斗失利'
    : skill ? skillDescription(skill) : '选择一个技能，查看效果后确认施放。';

  return <main className="bu-shell" style={{ '--bu-water-duration': `${WATER_MOTION.durationMs}ms`, '--bu-water-impact': `${WATER_MOTION.impactMs}ms` } as CSSProperties}>
    <link rel="preload" as="image" href="/battle-ui/water-surge.png"/>
    <header className="bu-header"><div><div className="bu-eyebrow">语灵 · 雾港遗迹 <i /> 第 {state.turn} 回合</div><h1>雾港守门人</h1></div><span className={`bu-phase bu-phase-${state.phase}`}><i />{phaseLabel}</span></header>
    <div ref={arenaRef} className="bu-arena">
    <HpBar enemy hp={presentedEnemyHp(state, impactPending)} previous={state.previousEnemyHp} max={DEMO_RULES.enemyMaxHp}/>

    <section className="bu-field" aria-label="单语灵战场" data-phase={state.phase} data-skill={state.selected ?? ''}>
      <div className="bu-scene" />
      <span className="bu-field-tag">单语灵出战</span>
      <span className="bu-enemy-intent">敌方下一击 <b>{DEMO_RULES.enemyDamage}</b> 伤害</span>
      <div className="bu-combatant bu-ally" data-testid="active-spirit"><div className="bu-sprite"><WaterCaster active={waterCasting}/></div><div className="bu-nameplate"><span>澜歌</span><small>出战中</small></div></div>
      <div className="bu-combatant bu-enemy" data-testid="enemy-target"><div className="bu-sprite"><img src="/battle-ui/gatekeeper.png" alt="敌方：雾港守门人" draggable={false}/></div><div className="bu-nameplate"><span>守门人</span><small>BOSS</small></div></div>
      {state.phase === 'player' && <div key={`${state.turn}-cast`} className={`bu-vfx bu-vfx-${state.selected}`} aria-hidden="true"><i className="bu-cast-ring"/>{state.damage > 0 && <><i className="bu-projectile"/><i className="bu-impact"/></>}{skill?.healing !== 0 && <i className="bu-recovery"/>}{state.mitigation > 0 && <i className="bu-guard"/>}</div>}
      {waterCasting && <WaterSurge key={`${state.turn}-surge`}/>}
      {state.phase === 'enemy' && <div key={`${state.turn}-strike`} className="bu-vfx bu-vfx-strike" aria-hidden="true"><i className="bu-strike"/><i className="bu-impact"/></div>}
      {state.phase === 'player' && !awaitingImpact && state.damage > 0 && <div key={`${state.turn}-damage`} className="bu-float bu-damage bu-float-enemy">−{state.damage}<small>伤害</small></div>}
      {state.phase === 'player' && skill?.healing !== 0 && <div key={`${state.turn}-heal`} className="bu-float bu-healing bu-float-player">+{state.healing}<small>{state.healing ? 'HP' : '已满血'}</small></div>}
      {state.phase === 'enemy' && <div key={`${state.turn}-enemy`} className="bu-float bu-damage bu-float-player">−{state.incoming}<small>HP</small></div>}
      {state.phase === 'player' && !awaitingImpact && (state.weaken > 0 || state.mitigation > 0) && <div className="bu-effect-label">{state.weaken ? `下一击削弱 ${Math.round(state.weaken * 100)}%` : `下一击减伤 ${Math.round(state.mitigation * 100)}%`}</div>}
      {finished && <div className="bu-end"><span>{state.phase === 'won' ? '胜' : '败'}</span><strong>{phaseLabel}</strong><button ref={resetRef} onClick={() => { dispatch({ type: 'reset' }); setRoster(false); }}>重新演示</button></div>}
    </section>

    <HpBar hp={state.playerHp} previous={state.previousPlayerHp} max={DEMO_RULES.playerMaxHp}/>
    </div>
    <div className="bu-feedback" role="status" aria-live="polite"><span className="bu-feedback-step">{phaseLabel}</span><p>{resultText}</p></div>

    <section className="bu-commands" aria-label="技能操作">
      <div className="bu-command-heading"><span><b>澜歌</b> 的技能</span><button className="bu-subtle" disabled={!choosing} aria-expanded={roster} aria-controls="bu-roster" onClick={() => setRoster(!roster)}>换灵 <span aria-hidden="true">⇄</span></button></div>
      {roster && <div id="bu-roster" className="bu-roster"><strong>当前样机仅开放澜歌出战</strong><p>芽语、烬尾为后备展示；暂不接入换灵规则与其他技能。</p><button onClick={() => setRoster(false)}>返回技能</button></div>}
      <div className="bu-skills" role="group" aria-label="选择技能">
        {DEMO_SKILLS.map(item => <button key={item.id} className={`bu-skill bu-skill-${item.id}`} aria-pressed={state.selected === item.id} aria-controls="bu-detail" disabled={!choosing} onClick={() => { dispatch({ type: 'select', id: item.id }); setRoster(false); }}>
          <span className="bu-skill-icon"><SkillIcon id={item.id}/></span><span className="bu-skill-copy"><strong>{item.name}</strong><small>{item.role}</small><span>{item.damage > 0 ? `${item.damage} 伤害` : `${item.healing} 回复`}{item.id === 'tide' ? ` / ${item.healing} 回复` : item.weaken ? ` / ${Math.round(item.weaken * 100)}% 削弱` : ` / ${Math.round(item.mitigation * 100)}% 减伤`}</span></span><span className="bu-selection" aria-hidden="true">{state.selected === item.id ? '◆' : '◇'}</span>
        </button>)}
      </div>
      <div className="t-acc" data-open={Boolean(skill)}>
        <div className="t-acc-panel"><div className="t-acc-panel-inner">
          <div id="bu-detail" className="bu-detail" hidden={!skill}><div><span className="bu-detail-eyebrow">技能详情</span><h2>{skill?.name}<small>{skill?.role}</small></h2><p>{skill ? skillDescription(skill) : ''}</p></div><button ref={castRef} className="bu-cast" disabled={!choosing || !skill} onClick={confirmCast}>{choosing ? `施放「${skill?.name ?? ''}」` : '行动进行中'}<span aria-hidden="true"> →</span></button></div>
        </div></div>
      </div>
      {!skill && <p className="bu-select-hint">点选技能看介绍，再确认施放 · 不会误触直接攻击</p>}
    </section>

    <footer className="bu-footer"><span>独立界面样机 · 原技能数值演示 · 不写入存档</span><div><button onClick={() => setPaused(!paused)} aria-pressed={paused}>{paused ? '恢复自动' : '暂停自动'}</button>{paused && !choosing && !finished && <button onClick={() => dispatch({ type: 'advance' })}>下一步</button>}<button disabled={!choosing && !finished} onClick={() => { dispatch({ type: 'reset' }); setRoster(false); }}>重开</button></div></footer>
    <details className="bu-scope"><summary>样机范围与素材说明</summary><p>这里用于体验单语灵、血条、技能详情和回合反馈，不是微信小游戏正式版。技能演示沿用 V2 的澜歌三技能；生命和敌伤沿用 Phase A 的 48 / 60 / 8，仅作为界面验证数据，不代表正式平衡。守门人为本样机新制立绘，正式设定仍为 PENDING_K3。背景与澜歌原文件保留；水音使用原画手臂分层、局部肩部补图及水流特效，非全身骨骼绑定。另两招保留轻量演出。</p></details>
  </main>;
}
