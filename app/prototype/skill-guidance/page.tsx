'use client';
/* eslint-disable react-hooks/purity -- response timing is sampled only for answer events */

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { getDueQuestion, loadLearningStore, recordLearningAnswer } from '../../learning-engine';
import { BRIDGE_V1_RULES } from '../../game/bridge-config';
import { getSignatureGuidance, recordSkillRelationshipCall, recordSkillWeakness, recoverSkillWeakness, resolveBudGuardPrototype } from '../../game/skill-guidance';

type PrototypeStage = 'first_battle' | 'report' | 'targeted' | 'trained' | 'retry_battle' | 'result';

const MAINTAIN_WORD_ID = 'w2341';
const PROTECT_WORD_ID = 'w1233';

export default function SkillGuidancePrototypePage() {
  const maintainQuestion = useMemo(() => getDueQuestion(MAINTAIN_WORD_ID), []);
  const protectRelation = getSignatureGuidance(PROTECT_WORD_ID, '芽语', 'yayu_bud_guard');
  const [stage, setStage] = useState<PrototypeStage>('first_battle');
  const [feedback, setFeedback] = useState('');
  const [firstOutcome, setFirstOutcome] = useState<ReturnType<typeof resolveBudGuardPrototype> | null>(null);
  const [retryOutcome, setRetryOutcome] = useState<ReturnType<typeof resolveBudGuardPrototype> | null>(null);
  const started = useRef(Date.now());

  function recordAnswer(correct: boolean, latencyMs: number) {
    const seen = Boolean(loadLearningStore().progress[maintainQuestion.wordId]);
    recordLearningAnswer(maintainQuestion, correct, latencyMs);
    return seen;
  }

  function resolveBattle(choice: string, retry: boolean) {
    if (feedback) return;
    const correct = choice === maintainQuestion.answer;
    const latencyMs = Date.now() - started.current;
    recordAnswer(correct, latencyMs);
    const outcome = resolveBudGuardPrototype(correct);
    recordSkillRelationshipCall({ skillId: 'yayu_bud_guard', wordId: MAINTAIN_WORD_ID, quality: outcome.quality });
    if (outcome.quality !== 'stable') {
      recordSkillWeakness({ wordId: MAINTAIN_WORD_ID, word: 'maintain', spiritId: '芽语', skillId: 'yayu_bud_guard', skillName: '护芽', quality: outcome.quality, effectPercent: outcome.effectPercent });
    }
    setFeedback(correct ? `护芽完整形成：${outcome.shield}点护盾` : `护芽未完整发动：只有${outcome.shield}点护盾`);
    window.setTimeout(() => {
      setFeedback('');
      if (retry) { setRetryOutcome(outcome); setStage('result'); }
      else { setFirstOutcome(outcome); setStage('report'); }
    }, 650);
  }

  function resolveTargeted(choice: string) {
    if (feedback) return;
    const correct = choice === maintainQuestion.answer;
    const latencyMs = Date.now() - started.current;
    recordAnswer(correct, latencyMs);
    if (!correct) {
      setFeedback(`正确义项：${maintainQuestion.answer}`);
      window.setTimeout(() => { setFeedback(''); started.current = Date.now(); }, 900);
      return;
    }
    recordSkillRelationshipCall({ skillId: 'yayu_bud_guard', wordId: MAINTAIN_WORD_ID, quality: 'stable' });
    recoverSkillWeakness(MAINTAIN_WORD_ID, 'yayu_bud_guard');
    setFeedback('maintain 已重新确认');
    window.setTimeout(() => { setFeedback(''); setStage('trained'); }, 650);
  }

  function restart() {
    setStage('first_battle');
    setFirstOutcome(null);
    setRetryOutcome(null);
    setFeedback('');
    started.current = Date.now();
  }

  const inQuestion = stage === 'first_battle' || stage === 'retry_battle';
  return <main className="skill-prototype-shell">
    <header className="skill-prototype-header"><div><span>Skill × Guidance Prototype V1</span><h1>技能配合记忆验证</h1><p>只验证词与技能的额外记忆关联；不修改EP01，也不把单词锁给技能。</p></div><Link href="/">返回试玩主页</Link></header>

    <section className="prototype-training-entrances" aria-label="三种训练入口状态">
      <article><span>引导</span><h2>熟悉新的技能配合</h2><p><code>{protectRelation?.word ?? 'protect'}</code> 与「护芽」契合</p></article>
      <article><span>维护</span><h2>重新确认已经练过的配合</h2><p>芽语 · 护芽<br />1项常用引导需要重新确认</p></article>
      <article className={stage === 'report' || stage === 'targeted' ? 'active' : ''}><span>针对训练</span><h2>来自刚刚的真实战斗</h2><p>{firstOutcome ? <>护芽 ×1 未完整发动<br /><code>maintain</code> 未稳定</> : '战斗后才会生成'}</p></article>
    </section>

    <section className="prototype-loop-card">
      <div className="prototype-step-line"><b className={stage === 'first_battle' ? 'active' : ''}>1 战斗</b><b className={stage === 'report' || stage === 'targeted' ? 'active' : ''}>2 战报与训练</b><b className={stage === 'trained' || stage === 'retry_battle' ? 'active' : ''}>3 再战</b><b className={stage === 'result' ? 'active' : ''}>4 对比</b></div>

      {inQuestion && <div className="prototype-battle-panel"><div className="prototype-battle-heading"><div><span>芽语 · 守护</span><h2>护芽</h2><p>{stage === 'retry_battle' ? '针对训练结果已保留。再次用 maintain 引导护芽。' : '第一次请故意选择错误义项，观察护盾折损。'}</p></div><div className="prototype-hp"><b>伙伴 HP {BRIDGE_V1_RULES.prototypeAcceptance.playerHp}</b><b>来袭伤害 {BRIDGE_V1_RULES.prototypeAcceptance.enemyAttack}</b></div></div><em className="guidance-relation"><code>maintain</code> 与「护芽」契合</em><h3>{maintainQuestion.word}</h3><small>{maintainQuestion.phonetic}</small><div className="prototype-choices">{maintainQuestion.choices.map(choice => <button key={choice} disabled={!!feedback} onClick={() => resolveBattle(choice, stage === 'retry_battle')}>{choice}</button>)}</div>{feedback && <strong className="prototype-feedback">{feedback}</strong>}</div>}

      {stage === 'report' && firstOutcome && <div className="prototype-report"><span>战斗失败</span><h2>护芽未完整发动</h2><div className="prototype-effect-compare"><p><b>{firstOutcome.shield}</b>实际护盾<small>完整值 {BRIDGE_V1_RULES.skillEffects.yayu_bud_guard.shield}</small></p><p><b>{firstOutcome.damageTaken}</b>受到伤害<small>剩余 HP {firstOutcome.remainingHp}</small></p></div><div className="prototype-weakness"><b>护芽 ×1 未完整发动</b><p><code>maintain</code> 未稳定 · 技能只发挥 {firstOutcome.effectPercent}%</p></div><button className="prototype-primary" onClick={() => { setStage('targeted'); started.current = Date.now(); }}>针对训练 · 约{BRIDGE_V1_RULES.prototypeAcceptance.targetedTrainingSeconds}秒</button></div>}

      {stage === 'targeted' && <div className="prototype-targeted"><span>针对训练 · 1/1</span><h2>{maintainQuestion.word}</h2><p>只处理刚才让「护芽」折损的问题。</p><div className="prototype-choices">{maintainQuestion.choices.map(choice => <button key={choice} disabled={!!feedback} onClick={() => resolveTargeted(choice)}>{choice}</button>)}</div>{feedback && <strong className="prototype-feedback">{feedback}</strong>}</div>}

      {stage === 'trained' && <div className="prototype-trained"><span>针对训练完成</span><h2>maintain 已重新确认</h2><p>现在回到同一场战斗，直接比较护芽的实际效果。</p><button className="prototype-primary" onClick={() => { setStage('retry_battle'); started.current = Date.now(); }}>再次挑战</button></div>}

      {stage === 'result' && firstOutcome && retryOutcome && <div className="prototype-result"><span>训练前后对比</span><h2>护芽已完整形成</h2><div className="prototype-effect-compare"><p><b>{firstOutcome.shield}</b>训练前护盾<small>{firstOutcome.effectPercent}%效果 · 战败</small></p><p className="improved"><b>{retryOutcome.shield}</b>训练后护盾<small>{retryOutcome.effectPercent}%效果 · 剩余HP {retryOutcome.remainingHp}</small></p></div><p>玩家的 maintain 作答始终更新同一份词汇学习记录；芽语只记录技能配合，不另建一份单词进度。</p><button className="prototype-primary" onClick={restart}>重新验证闭环</button></div>}
    </section>
  </main>;
}
