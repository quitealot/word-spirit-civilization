'use client';
/* eslint-disable react-hooks/set-state-in-effect -- client storage is read after hydration */

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import {
  FUSION_SLICE_RULES,
  FUSION_BATTLE_SKILLS,
  createFusionBattleState,
  getFusionBattleEligibleWords,
  resolveDirectChallengeTurn,
  resolveFusionBattleCall,
  selectFusionBattleCall,
  type FusionBattleCall,
  type FusionBattleState,
  type FusionBattleWordCandidate,
  type FusionWeakness,
} from '../../game/fusion-slice';
import { ZERO_BASE_WORDS, createZeroBaseProgress, loadZeroBaseProgress, type ZeroBaseProgress } from '../../game/zero-base-teaching';

type SliceStage = 'menu' | 'battle' | 'review' | 'targeted' | 'trained' | 'result';
type BattleMode = 'eligible_words' | 'direct';

const CHOICE_SETS: Record<FusionBattleWordCandidate['wordId'], readonly string[]> = {
  w1718: ['水', '人；人们', '需要', '帮助'],
  w729: ['帮助', '选择', '需要', '水'],
};

export default function FusionSlicePrototypePage() {
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState<ZeroBaseProgress>(createZeroBaseProgress);
  const [stage, setStage] = useState<SliceStage>('menu');
  const [mode, setMode] = useState<BattleMode>('eligible_words');
  const [battle, setBattle] = useState<FusionBattleState>(createFusionBattleState);
  const [selected, setSelected] = useState<FusionBattleCall | null>(null);
  const [supportUsed, setSupportUsed] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [weaknessesBeforeTraining, setWeaknessesBeforeTraining] = useState<FusionWeakness[]>([]);
  const [targetIndex, setTargetIndex] = useState(0);

  useEffect(() => {
    setProgress(loadZeroBaseProgress());
    setReady(true);
  }, []);

  const eligible = useMemo(() => getFusionBattleEligibleWords(progress), [progress]);
  const target = weaknessesBeforeTraining[targetIndex];
  const targetWord = target ? ZERO_BASE_WORDS.find(word => word.wordId === target.wordId) : undefined;

  function startBattle(nextMode: BattleMode) {
    setMode(nextMode);
    setBattle(createFusionBattleState());
    setSelected(null);
    setSupportUsed(false);
    setFeedback('');
    setStage('battle');
  }

  function finishTurn(next: FusionBattleState) {
    setBattle(next);
    window.setTimeout(() => {
      setFeedback('');
      setSelected(null);
      setSupportUsed(false);
      if (next.result === 'active') return;
      setWeaknessesBeforeTraining(next.weaknesses);
      setTargetIndex(0);
      setStage('review');
    }, 700);
  }

  function answer(choice: string) {
    if (!selected || feedback) return;
    const source = ZERO_BASE_WORDS.find(word => word.wordId === selected.word.wordId);
    if (!source) return;
    const correct = choice === source.targetGloss;
    const quality = correct ? (supportUsed ? 'supported' : 'independent') : 'failed';
    const outcome = resolveFusionBattleCall(battle, selected, quality);
    setFeedback(`${selected.skill.skillName}${quality === 'independent' ? '完整发动' : quality === 'supported' ? '借助支架发动' : '没有完全发动'} · ${outcome.damage}伤害 · ${outcome.effectPercent}%`);
    finishTurn(outcome.state);
  }

  function directAttack() {
    if (feedback) return;
    const next = resolveDirectChallengeTurn(battle);
    setFeedback('基础技能发动 · 20伤害 · 未调用陌生英语');
    finishTurn(next);
  }

  function resolveTargeted(choice: string) {
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

  return <main className="fusion-shell">
    <header className="fusion-header">
      <div><span>Learning × Adventure · 最小融合切片</span><h1>语灵站日常 → HP测试战斗</h1><p>只调用已经达到 Used 的正式词；反应时间不影响技能效果。</p></div>
      <Link href="/">返回试玩主页</Link>
    </header>

    {stage === 'menu' && <section className="fusion-menu">
      <article>
        <span>世界教学证据</span><h2>{eligible.length}/2 个测试词可进入战斗</h2>
        <div className="fusion-eligibility">{['w1718', 'w729'].map(wordId => { const word = ZERO_BASE_WORDS.find(item => item.wordId === wordId)!; const relation = eligible.find(item => item.wordId === wordId); return <p className={relation ? 'ready' : ''} key={wordId}><b>{word.word}</b><small>{progress.stages[wordId]} · {relation ? 'battleEligible' : '不进入战斗池'}</small></p>; })}</div>
        {eligible.length > 0 ? <button className="fusion-primary" onClick={() => startBattle('eligible_words')}>用已学词进入测试战斗</button> : <Link className="fusion-primary" href="/prototype/zero-base">先完成语灵站日常</Link>}
      </article>
      <article>
        <span>直接挑战规则</span><h2>训练不是战斗硬门票</h2><p>即使当前没有合格词，也允许直接挑战；本场不会临时塞入未教过的新词。</p><button className="fusion-secondary" onClick={() => startBattle('direct')}>直接挑战 · 不调用陌生词</button>
      </article>
    </section>}

    {stage === 'battle' && <section className="fusion-battle">
      <div className="fusion-bars">
        <div><span>澜歌 HP</span><b>{battle.playerHp}/{FUSION_SLICE_RULES.playerMaxHp}</b><i><em style={{ width: `${battle.playerHp / FUSION_SLICE_RULES.playerMaxHp * 100}%` }} /></i></div>
        <div className="enemy"><span>测试敌人 HP</span><b>{battle.enemyHp}/{FUSION_SLICE_RULES.enemyMaxHp}</b><i><em style={{ width: `${battle.enemyHp / FUSION_SLICE_RULES.enemyMaxHp * 100}%` }} /></i></div>
      </div>
      <div className="fusion-arena"><Image src="/spirit-lange.png" alt="澜歌" width={180} height={180} priority /><strong>VS</strong><div className="fusion-enemy">蚀</div></div>
      {mode === 'direct' ? <div className="fusion-skills"><button onClick={directAttack} disabled={!!feedback}><b>基础技能</b><small>不调用英语 · 20伤害</small></button></div> : selected ? <div className="fusion-inline-call">
        <span>{selected.skill.skillName} · 当前行动调用</span><small>本次调用词</small><h2>{selected.word.word}</h2><p>{supportUsed ? '已使用世界动作重演；本次最高发挥70%。' : '直接完成可让技能完整发动。思考时间不限。'}</p>
        <div>{CHOICE_SETS[selected.word.wordId].map(choice => <button key={choice} disabled={!!feedback} onClick={() => answer(choice)}>{choice}</button>)}</div>
        {!supportUsed && !feedback && <button className="fusion-support" onClick={() => setSupportUsed(true)}>回想刚才的世界动作</button>}
        {supportUsed && <div className="fusion-world-replay">{selected.word.word === 'water' ? '水桶与水面再次亮起。' : '同行语灵再次走向需要帮助的人。'}</div>}
      </div> : <div className="fusion-skills">{FUSION_BATTLE_SKILLS.map(skill => <button key={skill.skillId} onClick={() => setSelected(selectFusionBattleCall(skill, eligible, battle.turn))}><b>{skill.skillName}</b><small>{skill.effectLabel}</small></button>)}</div>}
      {feedback && <strong className="fusion-feedback">{feedback}</strong>}
      <small className="fusion-rule">敌方 HP 归零即胜利。错误仍造成伤害；时间只记录，不削弱技能。</small>
    </section>}

    {stage === 'review' && <section className="fusion-card">
      <span>{battle.result === 'won' ? '战斗胜利' : '战斗结束'}</span><h2>敌方 HP {battle.enemyHp}</h2>
      {mode === 'direct' ? <><p>本场没有合格词，因此没有调用陌生英语。直接挑战规则验证完成。</p><button className="fusion-primary" onClick={() => setStage('menu')}>返回切片入口</button></> : weaknessesBeforeTraining.length > 0 ? <><p>战斗暴露了 {weaknessesBeforeTraining.length} 个真实薄弱调用。解释与修复放在战后，不打断技能节奏。</p><div className="fusion-weak-list">{weaknessesBeforeTraining.map(item => <b key={item.wordId}>{item.word}<small>{item.skillName} · {item.effectPercent}%</small></b>)}</div><button className="fusion-primary" onClick={() => setStage('targeted')}>只修复刚才的薄弱词</button></> : <><p>两次英语调用均独立完成，技能完整发动。</p><button className="fusion-primary" onClick={() => setStage('result')}>查看结果</button></>}
    </section>}

    {stage === 'targeted' && targetWord && <section className="fusion-card targeted">
      <span>针对训练 {targetIndex + 1}/{weaknessesBeforeTraining.length}</span><h2>{targetWord.word}</h2><p>重新建立刚才技能所调用的意义：</p><strong>{targetWord.word} → {targetWord.targetGloss}</strong><div className="fusion-target-choices">{CHOICE_SETS[target!.wordId].map(choice => <button key={choice} disabled={!!feedback} onClick={() => resolveTargeted(choice)}>{choice}</button>)}</div>{feedback && <em>{feedback}</em>}
    </section>}

    {stage === 'trained' && <section className="fusion-card"><span>针对训练完成</span><h2>立即回到同一场战斗</h2><p>再次调用相同的已学词，直接比较敌方 HP 下降速度。</p><button className="fusion-primary" onClick={() => startBattle('eligible_words')}>立即再挑战</button></section>}

    {stage === 'result' && <section className="fusion-card"><span>最小闭环完成</span><h2>世界行动与战斗调用使用同一份证据</h2><p>这个切片没有修改 EP01–EP03，也没有新增正式剧情或对白。</p><button className="fusion-primary" onClick={() => setStage('menu')}>重新验证</button></section>}
  </main>;
}
