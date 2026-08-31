'use client';

import { useEffect, useReducer, useRef, useState, type CSSProperties } from 'react';
import { BOSS_SKILLS_V2, DEMO_RULES, DEMO_SKILLS, PHASE_DURATION, demoReducer, getEnemySkill, getSkill, initialDemo, previewIncoming, skillDescription, type SkillId } from './demo-model';
import { WATER_MOTION, waterIsCasting } from './water-motion';
import { BOSS_MOTION, displayedHp, motionKey, PLAYER_MOTION } from './battle-motion';
import { StillWave, TideReturn, WaterCaster, WaterSurge, WardReaction } from './water-caster';
import { TIDE_RECOVERY_MS, tideRecoveryPending } from './support-motion';
import { BossCaster, BossEffect, BossIcon } from './boss-caster';
import { CastCinematic, ImpactFrames } from './cinematic-effects';
import { WaterUltimate } from './water-ultimate';
import { captureWaterUltimate, presentationMotion, WATER_ULTIMATE_ASSET } from './water-ultimate-motion';
import './battle-ui.css';
import './boss-motion.css';
import './cinematic-v3.css';
import './water-ultimate.css';
import './support-skills.css';

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
  const [state, dispatch] = useReducer(demoReducer, 'gatekeeper-v2', initialDemo);
  const [paused, setPaused] = useState(false);
  const [roster, setRoster] = useState(false);
  const [shownImpact, setShownImpact] = useState<string | null>(null);
  const [shownRecovery, setShownRecovery] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [ultimateEnabled, setUltimateEnabled] = useState(true);
  const [ultimateReady, setUltimateReady] = useState(false);
  const [ultimateFailed, setUltimateFailed] = useState(false);
  const [ultimateThisCast, setUltimateThisCast] = useState(false);
  const ultimateActive = ultimateThisCast && state.phase === 'player' && state.selected === 'water' && !reducedMotion;
  const motion = presentationMotion(state, ultimateActive);
  const currentMotionKey = motionKey(state);
  const waterCasting = waterIsCasting(state);
  const awaitingImpact = Boolean(motion) && !reducedMotion && shownImpact !== currentMotionKey;
  const awaitingRecovery = tideRecoveryPending(state, reducedMotion, shownRecovery, currentMotionKey);
  const visibleHp = displayedHp(state, awaitingImpact);
  // Delay only the presented recovery, never enemy HP or the actual settled state.
  if (awaitingRecovery) visibleHp.player = state.previousPlayerHp;
  const enemySkill = getEnemySkill(state);
  const skill = getSkill(state.selected);
  const choosing = state.phase === 'choose';
  const finished = state.phase === 'won' || state.phase === 'lost';
  const castRef = useRef<HTMLButtonElement>(null);
  const resetRef = useRef<HTMLButtonElement>(null);
  const arenaRef = useRef<HTMLDivElement>(null);
  const phaseLabel = { choose: '你的回合', player: '语灵行动', enemyReady: '敌方准备', enemy: '敌方行动', won: '战斗胜利', lost: '战斗失利' }[state.phase];

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(preference.matches);
    sync(); preference.addEventListener('change', sync);
    return () => preference.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Decode before opting into a cutaway. Slow/failed assets keep the working short version.
    const images = [WATER_ULTIMATE_ASSET, '/battle-ui/water-surge.png'].map(src => {
      const image = new Image(); image.src = src; return image.decode();
    });
    Promise.all(images).then(() => { if (!cancelled) setUltimateReady(true); })
      .catch(() => { if (!cancelled) setUltimateFailed(true); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const duration = motion?.durationMs ?? PHASE_DURATION[state.phase];
    if (paused || !duration) return;
    const timer = window.setTimeout(() => dispatch({ type: 'advance' }), duration);
    return () => window.clearTimeout(timer);
  }, [state.phase, paused, motion]);
  useEffect(() => {
    if (!motion || !awaitingImpact) return;
    const timer = window.setTimeout(() => setShownImpact(currentMotionKey), motion.impactMs);
    return () => window.clearTimeout(timer);
  }, [motion, awaitingImpact, currentMotionKey]);
  useEffect(() => { if (finished) resetRef.current?.focus(); }, [finished]);

  useEffect(() => {
    if (!awaitingRecovery) return;
    const recoveryTimer = window.setTimeout(() => setShownRecovery(currentMotionKey), TIDE_RECOVERY_MS);
    return () => window.clearTimeout(recoveryTimer);
  }, [state.phase, state.selected, currentMotionKey, reducedMotion, awaitingRecovery]);

  function confirmCast() {
    if (!choosing || !skill) return;
    // On phones the detail button may be below the arena. Show the result before it plays.
    const arena = arenaRef.current;
    const bounds = arena?.getBoundingClientRect();
    if (bounds && (bounds.top < 0 || bounds.bottom > window.innerHeight)) {
      arena?.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
    // Capture once: asset readiness must never change a running cast's timing.
    setUltimateThisCast(captureWaterUltimate(skill.id, ultimateEnabled, ultimateReady, reducedMotion));
    dispatch({ type: 'cast' });
  }

  function resetBattle() { setShownImpact(null); setShownRecovery(null); dispatch({ type: 'reset' }); setRoster(false); setUltimateThisCast(false); }
  function advanceManually() {
    // A manual step reveals the result first; it cannot silently skip an impact.
    if (awaitingImpact) setShownImpact(currentMotionKey);
    else if (awaitingRecovery) setShownRecovery(currentMotionKey);
    else dispatch({ type: 'advance' });
  }

  const resultText = awaitingImpact ? (state.phase === 'enemy' ? `守门人 · ${enemySkill.name} · 抬臂出手` : `${skill?.name} · ${state.selected === 'water' ? '聚水施法' : state.selected === 'tide' ? '引水回流' : '撑起防护'}`)
    : state.phase === 'player'
    ? `${skill?.name} · ${state.damage ? `造成 ${state.damage} 伤害` : '防护生效'}${skill?.healing ? awaitingRecovery ? ' · 引水回流' : ` · 实际回复 ${state.healing} HP${state.healing === 0 ? '（生命已满）' : ''}` : ''}${state.weaken ? ` · 敌方下一击削弱${Math.round(state.weaken * 100)}%` : ''}${state.mitigation ? ` · 下一击减伤${Math.round(state.mitigation * 100)}%` : ''}`
    : state.phase === 'enemyReady' ? `守门人准备「${enemySkill.name}」 · ${enemySkill.damage}点基础伤害`
    : state.phase === 'enemy' ? `守门人 · ${enemySkill.name} · 澜歌受到 ${state.incoming} 点伤害`
    : state.phase === 'won' ? '敌方 HP 归零 · 战斗胜利'
    : state.phase === 'lost' ? '澜歌 HP 归零 · 战斗失利'
    : skill ? skillDescription(skill) : '选择一个技能，查看效果后确认施放。';

  const playerMotion = state.phase === 'player' && motion ? motion : PLAYER_MOTION[state.selected ?? 'water'];
  return <main className="bu-shell" style={{ '--bu-water-duration': `${WATER_MOTION.durationMs}ms`, '--bu-water-impact': `${WATER_MOTION.impactMs}ms`, '--bu-player-duration': `${playerMotion.durationMs}ms`, '--bu-player-impact': `${playerMotion.impactMs}ms`, '--bu-boss-duration': `${BOSS_MOTION.durationMs}ms`, '--bu-boss-impact': `${BOSS_MOTION.impactMs}ms` } as CSSProperties}>
    <link rel="preload" as="image" href={WATER_ULTIMATE_ASSET}/>
    <link rel="preload" as="image" href="/battle-ui/water-surge.png"/>
    <link rel="preload" as="image" href="/battle-ui/guardian-impact.png"/>
    <link rel="preload" as="image" href="/battle-ui/water-impact-atlas-v3.png"/>
    <link rel="preload" as="image" href="/battle-ui/stone-impact-atlas-v3.png"/>
    <header className="bu-header"><div><div className="bu-eyebrow">语灵 · 雾港遗迹 <i /> 第 {state.turn} 回合</div><h1>雾港守门人</h1></div><span className={`bu-phase bu-phase-${state.phase}`}><i />{phaseLabel}</span></header>
    <div ref={arenaRef} className="bu-arena">
    <HpBar enemy hp={visibleHp.enemy} previous={state.previousEnemyHp} max={DEMO_RULES.enemyMaxHp}/>

    <section className="bu-field" aria-label="单语灵战场" data-phase={state.phase} data-skill={state.selected ?? ''} data-boss-skill={enemySkill.id} data-impact={awaitingImpact ? 'pending' : 'shown'} data-recovery={awaitingRecovery ? 'pending' : 'shown'} data-ultimate={ultimateActive}>
      <div key={currentMotionKey} className="bu-stage" data-action={Boolean(motion)}>
      <div className="bu-scene" />
      {motion && !ultimateActive && <CastCinematic enemy={state.phase === 'enemy'} name={state.phase === 'enemy' ? enemySkill.name : skill?.name ?? ''}/>}
      <div className="bu-combatant bu-ally" data-testid="active-spirit"><div className="bu-sprite"><WaterCaster active={state.phase === 'player' && !ultimateActive} skill={state.selected ?? 'water'}/></div><div className="bu-nameplate"><span>澜歌</span><small>出战中</small></div></div>
      <div className="bu-combatant bu-enemy" data-testid="enemy-target"><div className="bu-sprite"><BossCaster active={state.phase === 'enemy'} skill={enemySkill.id}/></div><div className="bu-nameplate"><span>守门人</span><small>BOSS</small></div></div>
      {waterCasting && !ultimateActive && <div key={`${state.turn}-cast`} className="bu-vfx bu-vfx-water" aria-hidden="true"><i className="bu-cast-ring"/></div>}
      {waterCasting && !ultimateActive && <WaterSurge key={`${state.turn}-surge`}/>}
      {state.phase === 'player' && state.selected === 'tide' && <TideReturn key={`${state.turn}-tide`}/>}
      {state.phase === 'player' && state.selected === 'wave' && <StillWave key={`${state.turn}-wave`}/>}
      {state.phase === 'enemy' && <BossEffect key={`${state.turn}-boss`} skill={enemySkill.id}/>}
      {motion && !awaitingImpact && !reducedMotion && <ImpactFrames enemy={state.phase === 'enemy'} skill={state.phase === 'enemy' ? enemySkill.id : state.selected ?? 'water'}/>}
      {state.selected === 'wave' && (state.phase === 'enemyReady' || (state.phase === 'enemy' && awaitingImpact)) && <span className="bu-held-ward" aria-hidden="true"/>}
      {state.selected === 'wave' && state.phase === 'enemy' && !awaitingImpact && !reducedMotion && <WardReaction/>}
      {state.phase === 'player' && !awaitingImpact && state.damage > 0 && <div key={`${state.turn}-damage`} className="bu-float bu-damage bu-float-enemy">−{state.damage}<small>伤害</small></div>}
      {state.phase === 'player' && !awaitingImpact && !awaitingRecovery && skill?.healing !== 0 && <div key={`${state.turn}-heal`} className="bu-float bu-healing bu-float-player">+{state.healing}<small>{state.healing ? 'HP' : '已满血'}</small></div>}
      {state.phase === 'enemy' && !awaitingImpact && <div key={`${state.turn}-enemy`} className="bu-float bu-damage bu-float-player">−{state.incoming}<small>HP</small></div>}
      {state.phase === 'player' && !awaitingImpact && (state.weaken > 0 || state.mitigation > 0) && <div className="bu-effect-label">{state.weaken ? `下一击削弱 ${Math.round(state.weaken * 100)}%` : `下一击减伤 ${Math.round(state.mitigation * 100)}%`}</div>}
      </div>
      {ultimateActive && <WaterUltimate key={`${state.turn}-ultimate`}/>}
      <span className="bu-field-tag">单语灵出战</span>
      <span className={`bu-enemy-intent bu-intent-${enemySkill.id}`}><BossIcon id={enemySkill.id}/><span>{finished ? '本场结束' : '本回合敌技'} · {enemySkill.name} <b>{enemySkill.damage}</b>伤害</span></span>
      {finished && <div className="bu-end"><span>{state.phase === 'won' ? '胜' : '败'}</span><strong>{phaseLabel}</strong><button ref={resetRef} onClick={resetBattle}>重新演示</button></div>}
    </section>

    <HpBar hp={visibleHp.player} previous={state.previousPlayerHp} max={DEMO_RULES.playerMaxHp}/>
    </div>
    <div className="bu-feedback" role="status" aria-live="polite"><span className="bu-feedback-step">{phaseLabel}</span><p>{resultText}</p></div>
    <details className="bu-boss-skills"><summary><BossIcon id={enemySkill.id}/><span>敌方技能 · {enemySkill.name}</span><b>{choosing && skill ? (skill.damage >= state.enemyHp ? '可击杀 · 不反击' : `本招后预计承伤 ${previewIncoming(state)}`) : '石拳 → 震击 · 交替出手'}</b></summary><div>{BOSS_SKILLS_V2.map(item => <p key={item.id}><BossIcon id={item.id}/><strong>{item.name}</strong><span>{item.description}</span></p>)}</div></details>

    <section className="bu-commands" aria-label="技能操作">
      <div className="bu-command-heading"><span><b>澜歌</b> 的技能</span><button className="bu-subtle" disabled={!choosing} aria-expanded={roster} aria-controls="bu-roster" onClick={() => setRoster(!roster)}>换灵 <span aria-hidden="true">⇄</span></button></div>
      <label className="bu-ultimate-control"><input type="checkbox" checked={ultimateEnabled} disabled={!choosing} onChange={event => setUltimateEnabled(event.target.checked)}/>水音 · 大招演出样板<small>{reducedMotion ? '系统已开启减少动态' : ultimateFailed ? '素材未载入，使用短演出' : !ultimateReady ? '素材准备中，仍可正常出招' : '仅演出变化 · 可关闭对比短版'}</small></label>
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

    <footer className="bu-footer"><span>独立界面样机 · 水音大招样板 · 不写入存档</span><div><button onClick={() => setPaused(!paused)} aria-pressed={paused}>{paused ? '恢复自动' : '暂停自动'}</button>{paused && !choosing && !finished && <button onClick={advanceManually}>下一步</button>}<button disabled={!choosing && !finished} onClick={resetBattle}>重开</button></div></footer>
    <details className="bu-scope"><summary>样机范围与素材说明</summary><p>不是微信小游戏正式版。澜歌三技能保持原演示数值；当前BOSS独立测试V2：48 / 60 HP，石拳14、震击28伤害，固定交替。名称仅为原型系统标签，正式设定仍为 PENDING_K3。旧48/60/8夹具、BOSS V1的16/36与其他原型均保留。沿用原立绘分层、局部接缝补图与独立冲击素材，不是全身骨骼。暂停自动只停止回合推进，不冻结当前动画。</p></details>
  </main>;
}
