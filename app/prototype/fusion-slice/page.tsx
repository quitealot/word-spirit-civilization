'use client';
/* eslint-disable react-hooks/set-state-in-effect -- client storage is read after hydration */

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import {
  FUSION_SLICE_RULES,
  FUSION_BATTLE_SKILLS,
  FUSION_SKILL_EFFECT_CONFIG,
  createFusionBattleState,
  getFusionBattleEligibleWords,
  resolveFusionBattleCall,
  resolveFusionNoCallTurn,
  selectFusionBattleCall,
  type FusionBattleCall,
  type FusionBattleSkill,
  type FusionBattleState,
  type FusionBattleWordCandidate,
  type FusionTurnOutcome,
  type FusionWeakness,
} from '../../game/fusion-slice';
import { ZERO_BASE_WORDS, createZeroBaseProgress, loadZeroBaseProgress, type ZeroBaseProgress } from '../../game/zero-base-teaching';
import {
  beginPhaseBRepair,
  createPhaseBRepairQueue,
  getPhaseBEntry,
  getPhaseBPostBattleStage,
  isPhaseBFlow,
  resolvePhaseBRetrieve,
  shouldShowPhaseBJustUsed,
  showPhaseBRetrieve,
  PHASE_B_COMBAT_CANDIDATE_A,
  type PhaseBRepairState,
} from '../../game/phase-b-flow';

type SliceStage = 'menu' | 'battle' | 'review' | 'targeted' | 'trained' | 'result' | 'end' | 'evidence_missing';
type BattleMode = 'with_calls' | 'no_call';

const CHOICE_SETS: Record<FusionBattleWordCandidate['wordId'], readonly string[]> = {
  w1718: ['水', '人；人们', '需要', '帮助'],
  w729: ['帮助', '选择', '需要', '水'],
};

export default function FusionSlicePrototypePage() {
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState<ZeroBaseProgress>(createZeroBaseProgress);
  const [stage, setStage] = useState<SliceStage>('menu');
  const [mode, setMode] = useState<BattleMode>('with_calls');
  const [battle, setBattle] = useState<FusionBattleState>(createFusionBattleState);
  const [selected, setSelected] = useState<FusionBattleCall | null>(null);
  const [supportUsed, setSupportUsed] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [weaknessesBeforeTraining, setWeaknessesBeforeTraining] = useState<FusionWeakness[]>([]);
  const [targetIndex, setTargetIndex] = useState(0);
  const [phaseB, setPhaseB] = useState(false);
  const [battleNumber, setBattleNumber] = useState(1);
  const [callNumber, setCallNumber] = useState(0);
  const [showJustUsed, setShowJustUsed] = useState(false);
  const [repair, setRepair] = useState<PhaseBRepairState>(beginPhaseBRepair);

  useEffect(() => {
    const stored = loadZeroBaseProgress();
    const continuous = isPhaseBFlow(window.location.search);
    setPhaseB(continuous);
    setProgress(stored);
    if (continuous) {
      const entry = getPhaseBEntry(stored);
      setMode('with_calls');
      if (entry.destination === 'battle') {
        setBattle(createFusionBattleState({
          enemyHp: PHASE_B_COMBAT_CANDIDATE_A.enemyMaxHp,
          playerHp: PHASE_B_COMBAT_CANDIDATE_A.playerMaxHp,
        }));
      }
      setStage(entry.destination);
    }
    setReady(true);
  }, []);

  const eligible = useMemo(() => getFusionBattleEligibleWords(progress), [progress]);
  const target = weaknessesBeforeTraining[targetIndex];
  const targetWord = target ? ZERO_BASE_WORDS.find(word => word.wordId === target.wordId) : undefined;

  function startBattle(rematch = false) {
    if (phaseB && eligible.length === 0) {
      setStage('evidence_missing');
      return;
    }
    setMode(eligible.length > 0 ? 'with_calls' : 'no_call');
    setBattle(createFusionBattleState(phaseB ? {
      enemyHp: PHASE_B_COMBAT_CANDIDATE_A.enemyMaxHp,
      playerHp: PHASE_B_COMBAT_CANDIDATE_A.playerMaxHp,
    } : undefined));
    setSelected(null);
    setSupportUsed(false);
    setFeedback('');
    setShowJustUsed(false);
    setCallNumber(0);
    if (rematch) setBattleNumber(current => current + 1);
    setStage('battle');
  }

  function completeTurn(next: FusionBattleState) {
    setFeedback('');
    setSelected(null);
    setSupportUsed(false);
    setShowJustUsed(false);
    if (next.result === 'active') return;
    const repairQueue = phaseB ? createPhaseBRepairQueue(next.weaknesses) : next.weaknesses;
    setWeaknessesBeforeTraining(repairQueue);
    setTargetIndex(0);
    setRepair(beginPhaseBRepair());
    setStage(phaseB ? getPhaseBPostBattleStage(repairQueue) : 'review');
  }

  function playTurn(skill: FusionBattleSkill, outcome: FusionTurnOutcome, suffix = '') {
    setBattle(outcome.stateAfterSkill);
    setFeedback(`${formatSkillOutcome(skill, outcome)}${suffix}`);

    if (outcome.state.result === 'won') {
      window.setTimeout(() => {
        setBattle(outcome.state);
        completeTurn(outcome.state);
      }, 700);
      return;
    }

    window.setTimeout(() => {
      setBattle(outcome.state);
      setFeedback(`敌方行动 · 承受${outcome.enemyDamage}伤害`);
      window.setTimeout(() => completeTurn(outcome.state), 700);
    }, 700);
  }

  function answer(choice: string) {
    if (!selected || feedback) return;
    const source = ZERO_BASE_WORDS.find(word => word.wordId === selected.word.wordId);
    if (!source) return;
    const correct = choice === source.targetGloss;
    const quality = correct ? (supportUsed ? 'supported' : 'independent') : 'failed';
    const outcome = phaseB
      ? resolveFusionBattleCall(battle, selected, quality, { enemyDamage: PHASE_B_COMBAT_CANDIDATE_A.enemyDamage })
      : resolveFusionBattleCall(battle, selected, quality);
    playTurn(selected.skill, outcome);
  }

  function chooseSkill(skill: FusionBattleSkill) {
    if (feedback) return;
    if (eligible.length > 0) {
      const nextCallNumber = callNumber + 1;
      setSelected(selectFusionBattleCall(skill, eligible, battle.turn));
      setShowJustUsed(phaseB && shouldShowPhaseBJustUsed(battleNumber, nextCallNumber));
      setCallNumber(nextCallNumber);
      return;
    }
    const outcome = resolveFusionNoCallTurn(battle, skill);
    playTurn(skill, outcome, ' · 未调用陌生英语');
  }

  function resolveTargeted(choice: string) {
    if (phaseB) {
      if (!targetWord || feedback || repair.step !== 'retrieve') return;
      const correct = choice === targetWord.targetGloss;
      const next = resolvePhaseBRetrieve(repair, correct, weaknessesBeforeTraining.length);
      setFeedback(correct ? '重新确认了' : '再看一次');
      window.setTimeout(() => {
        setFeedback('');
        if (next.complete) {
          startBattle(true);
          return;
        }
        setRepair(next);
        setTargetIndex(next.index);
      }, 450);
      return;
    }
    if (!targetWord || feedback) return;
    if (choice !== targetWord.targetGloss) {
      setFeedback(`再看一次：${targetWord.word} → ${targetWord.targetGloss}`);
      window.setTimeout(() => setFeedback(''), 900);
      return;
    }
    setFeedback(`${targetWord.word} 已重新建立意义`);
    window.setTimeout(() => {
      setFeedback('');
      if (targetIndex < weaknessesBeforeTraining.length - 1) setTargetIndex(index => index + 1);
      else setStage('trained');
    }, 650);
  }

  if (!ready) return <main className="fusion-shell"><div className="zb-loading">正在读取学习证据…</div></main>;

  const battleRules = phaseB ? PHASE_B_COMBAT_CANDIDATE_A : FUSION_SLICE_RULES;

  return <main className="fusion-shell">
    {!phaseB && <header className="fusion-header">
      <div><span>Learning × Adventure · V2 Phase A</span><h1>语灵站日常 → HP测试战斗</h1><p>只调用 Used / Maintained 且 battleEligible 的正式词；技能决定效果，英语决定发挥。</p></div>
      <Link href="/">返回试玩主页</Link>
    </header>}

    {stage === 'evidence_missing' && <section className="fusion-card"><h2>PENDING_K3: phase-b evidence missing</h2></section>}

    {stage === 'menu' && <section className="fusion-menu">
      <article>
        <span>世界教学证据</span><h2>{eligible.length}/2 个测试词可进入战斗</h2>
        <div className="fusion-eligibility">{['w1718', 'w729'].map(wordId => { const word = ZERO_BASE_WORDS.find(item => item.wordId === wordId)!; const relation = eligible.find(item => item.wordId === wordId); return <p className={relation ? 'ready' : ''} key={wordId}><b>{word.word}</b><small>{progress.stages[wordId]} · {relation ? 'battleEligible' : '不进入战斗池'}</small></p>; })}</div>
        {eligible.length > 0 ? <button className="fusion-primary" onClick={() => startBattle()}>用已学词进入测试战斗</button> : <Link className="fusion-primary" href="/prototype/zero-base">先完成语灵站日常</Link>}
      </article>
      <article>
        <span>直接挑战规则</span><h2>训练不是战斗硬门票</h2><p>{eligible.length > 0 ? '可跳过额外训练直接挑战；已有合格词仍会正常进入英语调用。' : '当前没有合格词，仍可使用真实技能挑战；不会临时塞入陌生英语。'}</p><button className="fusion-secondary" onClick={() => startBattle()}>直接挑战</button>
      </article>
    </section>}

    {stage === 'battle' && <section className="fusion-battle">
      <div className="fusion-bars">
        <div><span>澜歌 HP</span><b>{battle.playerHp}/{battleRules.playerMaxHp}</b><i><em style={{ width: `${battle.playerHp / battleRules.playerMaxHp * 100}%` }} /></i></div>
        <div className="enemy"><span>测试敌人 HP</span><b>{battle.enemyHp}/{battleRules.enemyMaxHp}</b><i><em style={{ width: `${battle.enemyHp / battleRules.enemyMaxHp * 100}%` }} /></i></div>
      </div>
      <div className="fusion-arena"><Image src="/spirit-lange.png" alt="澜歌" width={180} height={180} priority /><strong>VS</strong><div className="fusion-enemy">蚀</div></div>
      {selected ? <div className="fusion-inline-call">
        <span>{selected.skill.skillName} · 当前行动调用</span><small>本次调用词</small><h2>{selected.word.word}</h2><p>{supportUsed ? '已使用世界动作重演；本次最高发挥70%。' : '直接完成可让技能完整发动。思考时间不限。'}</p>
        {showJustUsed && <b className="fusion-just-used">刚才用过</b>}
        <div>{CHOICE_SETS[selected.word.wordId].map(choice => <button key={choice} disabled={!!feedback} onClick={() => answer(choice)}>{choice}</button>)}</div>
        {!supportUsed && !feedback && <button className="fusion-support" onClick={() => setSupportUsed(true)}>回想刚才的世界动作</button>}
        {supportUsed && <div className="fusion-world-replay">{selected.word.word === 'water' ? '水桶与水面再次亮起。' : '同行语灵再次走向需要帮助的人。'}</div>}
      </div> : <div className="fusion-skills">{FUSION_BATTLE_SKILLS.map(skill => <button key={skill.skillId} disabled={!!feedback} onClick={() => chooseSkill(skill)}><b>{skill.skillName}</b><small>{skillEffectSummary(skill)}{mode === 'no_call' ? ' · 本次40%发挥' : ''}</small></button>)}</div>}
      {feedback && <strong className="fusion-feedback">{feedback}</strong>}
      <small className="fusion-rule">敌方 HP 归零即胜利。错误仍造成伤害；时间只记录，不削弱技能。</small>
    </section>}

    {stage === 'review' && <section className="fusion-card">
      {phaseB ? <><h2>再确认一下</h2><div className="fusion-weak-list">{weaknessesBeforeTraining.map(item => <b key={item.wordId}>{item.word}<small>{item.skillName} · {item.effectPercent}%</small></b>)}</div><button className="fusion-primary" onClick={() => { setRepair(beginPhaseBRepair()); setTargetIndex(0); setStage('targeted'); }}>处理刚才的问题</button></> : <><span>{battle.result === 'won' ? '战斗胜利' : '战斗结束'}</span><h2>敌方 HP {battle.enemyHp}</h2>{mode === 'no_call' ? <><p>本场没有合格词，因此没有调用陌生英语，也没有生成薄弱词；胜利由真实技能完成。</p><button className="fusion-primary" onClick={() => setStage('menu')}>返回切片入口</button></> : weaknessesBeforeTraining.length > 0 ? <><p>战斗暴露了 {weaknessesBeforeTraining.length} 个真实薄弱调用。解释与修复放在战后，不打断技能节奏。</p><div className="fusion-weak-list">{weaknessesBeforeTraining.map(item => <b key={item.wordId}>{item.word}<small>{item.skillName} · {item.effectPercent}%</small></b>)}</div><button className="fusion-primary" onClick={() => setStage('targeted')}>只修复刚才的薄弱词</button></> : <><p>本场英语调用均独立完成，技能完整发动。</p><button className="fusion-primary" onClick={() => setStage('result')}>查看结果</button></>}</>}
    </section>}

    {stage === 'targeted' && targetWord && <section className="fusion-card targeted">
      {phaseB ? <>{repair.step === 'meaning' ? <><h2>{targetWord.word} → {targetWord.targetGloss}</h2><button className="fusion-primary" onClick={() => setRepair(showPhaseBRetrieve(repair))}>再试一次</button></> : <><h2>{targetWord.word}</h2><div className="fusion-target-choices">{CHOICE_SETS[target!.wordId].map(choice => <button key={choice} disabled={!!feedback} onClick={() => resolveTargeted(choice)}>{choice}</button>)}</div></>}{feedback && <em>{feedback}</em>}</> : <><span>针对训练 {targetIndex + 1}/{weaknessesBeforeTraining.length}</span><h2>{targetWord.word}</h2><p>重新建立刚才技能所调用的意义：</p><strong>{targetWord.word} → {targetWord.targetGloss}</strong><div className="fusion-target-choices">{CHOICE_SETS[target!.wordId].map(choice => <button key={choice} disabled={!!feedback} onClick={() => resolveTargeted(choice)}>{choice}</button>)}</div>{feedback && <em>{feedback}</em>}</>}
    </section>}

    {stage === 'trained' && <section className="fusion-card"><span>针对训练完成</span><h2>立即回到同一场战斗</h2><p>再次调用相同的已学词，直接比较敌方 HP 下降速度。</p><button className="fusion-primary" onClick={() => startBattle()}>立即再挑战</button></section>}

    {stage === 'result' && <section className="fusion-card"><span>最小闭环完成</span><h2>世界行动与战斗调用使用同一份证据</h2><p>这个切片没有修改 EP01–EP03，也没有新增正式剧情或对白。</p><button className="fusion-primary" onClick={() => setStage('menu')}>重新验证</button></section>}
    {stage === 'end' && <section className="fusion-card"><h2>战斗结束</h2></section>}
  </main>;
}

function skillEffectSummary(skill: FusionBattleSkill): string {
  const config = FUSION_SKILL_EFFECT_CONFIG[skill.skillId];
  if (config.healing) return `${config.damage}伤害 · 恢复${config.healing}生命`;
  return `${config.damage}伤害 · 下一击削弱${Math.round((config.enemyNextDamageWeaken ?? 0) * 100)}%`;
}

function formatSkillOutcome(skill: FusionBattleSkill, outcome: FusionTurnOutcome): string {
  const components = [`${skill.skillName} · ${outcome.effectPercent}%发挥`, `${outcome.damage}伤害`];
  if (outcome.healing > 0) components.push(`实际恢复${outcome.actualHealing}生命`);
  if (outcome.enemyNextDamageWeaken > 0) components.push(`敌方本次伤害降低${Math.round(outcome.enemyNextDamageWeaken * 100)}%`);
  if (outcome.state.result === 'won') components.push('敌人未行动');
  return components.join(' · ');
}
