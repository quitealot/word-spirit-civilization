'use client';

import { useEffect } from 'react';
import { useMachine } from '@xstate/react';
import {
  INTENT_COMBAT_RULES,
  INTENT_COMBAT_SKILLS,
  getIntentCombatChoiceSet,
  getIntentCombatWord,
  getIntentDescription,
  getIntentForTurn,
  type IntentBattleSkill,
  type IntentBattleState,
  type IntentTurnOutcome,
} from '../../game/intent-combat-v1';
import {
  getLearningIntentEligibleWords,
  learningIntentMachine,
  type LearningIntentCall,
  type LearningIntentContext,
} from '../../game/learning-intent-machine';
import { loadZeroBaseProgress } from '../../game/zero-base-teaching';

type FeedbackStep = 'player_result' | 'enemy_result';

export default function LearningIntentPrototypePage() {
  const [snapshot, send] = useMachine(learningIntentMachine);

  useEffect(() => {
    const progress = loadZeroBaseProgress();
    send({ type: 'CHECK_EVIDENCE', eligibleWords: getLearningIntentEligibleWords(progress) });
  }, [send]);

  const context = snapshot.context;
  const { battle, selectedCall, supportUsed, outcome, justUsedVisible } = context;
  const battleStage = snapshot.matches('skill_select') || snapshot.matches('word_call') || snapshot.matches('player_result') || snapshot.matches('enemy_result');
  const visibleState = snapshot.matches('player_result') && outcome
    ? outcome.stateAfterSkill
    : snapshot.matches('enemy_result') && outcome
      ? outcome.state
      : battle;
  const intent = getIntentForTurn(battle.turn);

  if (snapshot.matches('checking_evidence')) {
    return <main className="intent-shell learning-intent-shell"><section className="intent-result learning-intent-card"><span>战斗闭环测试</span><h2>正在准备刚才学过的词</h2><p>确认完成后，马上进入行动。</p></section></main>;
  }

  if (snapshot.matches('evidence_missing')) {
    return <main className="intent-shell learning-intent-shell"><section className="intent-result learning-intent-card learning-intent-missing"><span>战斗闭环测试</span><h2>PENDING_K3: intent-loop evidence missing</h2><p>还没有可以进入战斗的已学词。请先完成语灵站日常。</p><a className="intent-restart" href="/prototype/zero-base?flow=intent-loop">回到语灵站日常</a></section></main>;
  }

  if (snapshot.matches('repair_review')) {
    return <RepairReview context={context} onStart={() => send({ type: 'START_REPAIR' })} />;
  }

  if (snapshot.matches('repair_meaning') || snapshot.matches('repair_retrieve')) {
    return <RepairPanel context={context} retrieve={snapshot.matches('repair_retrieve')} onMeaningContinue={() => send({ type: 'REPAIR_MEANING_CONTINUE' })} onAnswer={choice => send({ type: 'REPAIR_ANSWER', choice })} />;
  }

  if (snapshot.matches('complete')) {
    const repaired = context.battleNumber > 1;
    return <main className="intent-shell learning-intent-shell"><section className="intent-result learning-intent-card"><span>战斗闭环测试</span><h2>本次闭环完成</h2><p>{repaired ? '刚才的行动、战斗、针对训练和再战都已完成。' : '刚才的世界行动与战斗已经完成。'}</p><button className="intent-restart" onClick={() => send({ type: 'RESTART' })}>重新验证</button></section></main>;
  }

  return <main className="intent-shell learning-intent-shell">
    <header className="intent-header learning-intent-header">
      <div><span>战斗闭环测试</span><h1>让刚才学会的词继续行动</h1><p>先决定技能，再回应敌人；词会在行动里再次出现。</p></div>
    </header>

    {battleStage && <section className="intent-battle-card">
      <div className="intent-hp-row">
        <HpPanel label="澜歌" hp={visibleState.playerHp} maxHp={INTENT_COMBAT_RULES.playerMaxHp} shield={visibleState.playerShield} kind="player" />
        <HpPanel label="测试敌人" hp={visibleState.enemyHp} maxHp={INTENT_COMBAT_RULES.enemyMaxHp} kind="enemy" />
      </div>

      <div className="intent-turn-head">
        <span>第 {battle.turn} 回合 · 敌方下一步</span>
        <strong>{intent.label}</strong>
        <p>{getIntentDescription(intent)}</p>
        <small className="intent-pending">{pendingAttackSummary(visibleState)}</small>
      </div>

      {snapshot.matches('skill_select') && <div className="learning-intent-skill-select">
        <p className="learning-intent-prompt">先选一个要做的动作。</p>
        <div className="intent-skills">{INTENT_COMBAT_SKILLS.map(skill => <SkillCard key={skill.skillId} skill={skill} onChoose={skillToChoose => send({ type: 'SELECT_SKILL', skillId: skillToChoose.skillId })} />)}</div>
      </div>}

      {snapshot.matches('word_call') && selectedCall && <CallCard selected={selectedCall} supportUsed={supportUsed} showJustUsed={justUsedVisible} onSupport={() => send({ type: 'USE_SUPPORT' })} onAnswer={choice => send({ type: 'ANSWER', choice })} />}

      {(snapshot.matches('player_result') || snapshot.matches('enemy_result')) && outcome && <FeedbackPanel outcome={outcome} step={snapshot.matches('player_result') ? 'player_result' : 'enemy_result'} onContinue={() => send({ type: 'CONTINUE' })} />}
    </section>}

    {snapshot.matches('battle_won') && <BattleResultPanel result="won" battle={battle} onContinue={() => send({ type: 'CONTINUE' })} />}
    {snapshot.matches('battle_lost') && <BattleResultPanel result="lost" battle={battle} onContinue={() => send({ type: 'CONTINUE' })} />}
  </main>;
}

function HpPanel({ label, hp, maxHp, shield = 0, kind }: { label: string; hp: number; maxHp: number; shield?: number; kind: 'player' | 'enemy' }) {
  return <div className={`intent-hp-panel intent-hp-${kind}`}>
    <div><span>{label}</span><b>{hp}/{maxHp}</b></div>
    <i><em style={{ width: `${Math.max(0, Math.min(100, hp / maxHp * 100))}%` }} /></i>
    {kind === 'player' && <small>护盾 {shield}</small>}
  </div>;
}

function SkillCard({ skill, onChoose }: { skill: IntentBattleSkill; onChoose: (skill: IntentBattleSkill) => void }) {
  return <button className="intent-skill-card" onClick={() => onChoose(skill)}>
    <strong>{skill.skillName}</strong>
    <span>{baseSummary(skill)}</span>
    <small>{rewardSummary(skill, 'supported')}</small>
    <small>{rewardSummary(skill, 'independent')}</small>
  </button>;
}

function CallCard({ selected, supportUsed, showJustUsed, onSupport, onAnswer }: { selected: LearningIntentCall; supportUsed: boolean; showJustUsed: boolean; onSupport: () => void; onAnswer: (choice: string) => void }) {
  const choices = getIntentCombatChoiceSet(selected.word.wordId);
  return <div className="intent-call-card">
    <span>{selected.skill.skillName} · 当前行动调用</span>
    {showJustUsed && <b className="learning-intent-just-used">刚才用过</b>}
    <h2>{selected.word.word}</h2>
    <p>{supportUsed ? '已回想世界动作，再确认这个词的意思。' : '从词义中选出与它对应的一项。'}</p>
    <div className="intent-choices">{choices.map(choice => <button key={choice} onClick={() => onAnswer(choice)}>{choice}</button>)}</div>
    {!supportUsed && <button className="intent-support" onClick={onSupport}>回想世界动作</button>}
    {supportUsed && <small className="intent-support-note">支架已启用</small>}
  </div>;
}

function FeedbackPanel({ outcome, step, onContinue }: { outcome: IntentTurnOutcome; step: FeedbackStep; onContinue: () => void }) {
  const qualityLabel = outcome.quality === 'independent' ? '独立完成' : outcome.quality === 'supported' ? '回想后完成' : '基础执行';
  const nextIntent = getIntentForTurn(outcome.state.turn);
  return <div className={`intent-feedback intent-feedback-${step === 'player_result' ? 'player' : 'enemy'}`}>
    {step === 'player_result' && <>
      <span>Step 1 · 我的技能结果</span>
      <h2>{outcome.skill.skillName}</h2>
      <p>{baseOutcomeSummary(outcome)}</p>
      {outcome.quality && <small>{qualityLabel} · 基础结果已执行</small>}
      {outcome.reward > 0 && <p className="intent-feedback-reward-line">掌握奖励：{rewardOutcomeSummary(outcome)}</p>}
      {outcome.reward === 0 && outcome.quality && <small>本次没有额外掌握奖励。</small>}
      <p className="intent-feedback-state-line">技能后状态：敌人 {outcome.stateAfterSkill.enemyHp}/{INTENT_COMBAT_RULES.enemyMaxHp} · 澜歌 {outcome.stateAfterSkill.playerHp}/{INTENT_COMBAT_RULES.playerMaxHp} · 护盾 {outcome.stateAfterSkill.playerShield} · {pendingAttackSummary(outcome.stateAfterSkill)}</p>
      {outcome.state.result === 'won' && <p className="intent-feedback-state-line">敌人 HP 已归零，敌人未行动。</p>}
    </>}
    {step === 'enemy_result' && <>
      <span>Step 2 · 敌方结果</span>
      <h2>{outcome.enemyActed ? outcome.intent.label : '本回合不攻击'}</h2>
      <p>{enemyOutcomeSummary(outcome)}</p>
      <p className="intent-feedback-state-line">结算后状态：敌人 {outcome.state.enemyHp}/{INTENT_COMBAT_RULES.enemyMaxHp} · 澜歌 {outcome.state.playerHp}/{INTENT_COMBAT_RULES.playerMaxHp} · 护盾 {outcome.state.playerShield} · {pendingAttackSummary(outcome.state)}</p>
      {outcome.state.result === 'active' && <p className="intent-feedback-next-line">下一回合预告：{getIntentDescription(nextIntent)}</p>}
    </>}
    <button className="intent-continue" onClick={onContinue}>{step === 'player_result' && outcome.state.result === 'won' ? '进入胜利结果' : step === 'enemy_result' ? '进入下一回合' : '继续'}</button>
  </div>;
}

function BattleResultPanel({ result, battle, onContinue }: { result: 'won' | 'lost'; battle: IntentBattleState; onContinue: () => void }) {
  return <section className={`intent-result learning-intent-card intent-result-${result}`}>
    <span>战斗结果</span>
    <h2>{result === 'won' ? '战斗胜利' : '战斗失利'}</h2>
    <p>澜歌 {battle.playerHp}/{INTENT_COMBAT_RULES.playerMaxHp} · 测试敌人 {battle.enemyHp}/{INTENT_COMBAT_RULES.enemyMaxHp}</p>
    {battle.weaknesses.length > 0 && <div className="intent-weaknesses"><strong>本场真实薄弱词</strong>{battle.weaknesses.map(item => <p key={`${item.wordId}-${item.turn}`}><span>{item.word}</span><small>{item.skillName} · 第{item.turn}回合</small></p>)}</div>}
    <button className="intent-continue" onClick={onContinue}>继续</button>
  </section>;
}

function RepairReview({ context, onStart }: { context: LearningIntentContext; onStart: () => void }) {
  return <main className="intent-shell learning-intent-shell"><section className="intent-result learning-intent-card">
    <span>战斗后的针对训练</span>
    <h2>只处理刚才卡住的词</h2>
    <div className="intent-weaknesses">{context.repairQueue.map(item => <p key={item.wordId}><span>{item.word}</span><small>{item.skillName} · 本次未完整发挥</small></p>)}</div>
    <p>重新建立意义，再独立确认一次。</p>
    <button className="intent-continue" onClick={onStart}>开始针对训练</button>
  </section></main>;
}

function RepairPanel({ context, retrieve, onMeaningContinue, onAnswer }: { context: LearningIntentContext; retrieve: boolean; onMeaningContinue: () => void; onAnswer: (choice: string) => void }) {
  const target = context.repairQueue[context.repairIndex];
  if (!target) return null;
  const word = getIntentCombatWord(target.wordId);
  return <main className="intent-shell learning-intent-shell"><section className="intent-result learning-intent-card learning-intent-repair">
    <span>针对训练 · {context.repairIndex + 1}/{context.repairQueue.length}</span>
    {!retrieve ? <>
      <h2>{word.word} → {word.targetGloss}</h2>
      <p>重新看一遍这个词的意思。</p>
      <button className="intent-continue" onClick={onMeaningContinue}>收起答案，独立确认</button>
    </> : <>
      <h2>{word.word}</h2>
      <p>现在自己选出它的意思。</p>
      <div className="intent-choices learning-intent-retrieve-choices">{getIntentCombatChoiceSet(word.wordId).map(choice => <button key={choice} onClick={() => onAnswer(choice)}>{choice}</button>)}</div>
      <small>选错会回到刚才的意义。</small>
    </>}
  </section></main>;
}

function baseSummary(skill: IntentBattleSkill): string {
  const parts: string[] = [];
  if (skill.baseDamage > 0) parts.push(`${skill.baseDamage}伤害`);
  if (skill.baseHealing > 0) parts.push(`回复${skill.baseHealing}`);
  if (skill.baseShield > 0) parts.push(`护盾${skill.baseShield}`);
  return `基础：${parts.join(' + ')}`;
}

function rewardSummary(skill: IntentBattleSkill, quality: 'supported' | 'independent'): string {
  const amount = quality === 'supported' ? skill.supportedReward : skill.independentReward;
  const label = quality === 'supported' ? '回想后' : '独立';
  if (skill.rewardKind === 'enemy_damage_reduction') return `${label}奖励：下一次攻击 -${amount}`;
  if (skill.rewardKind === 'healing') return `${label}奖励：额外回复${amount}`;
  return `${label}奖励：额外护盾${amount}`;
}

function baseOutcomeSummary(outcome: IntentTurnOutcome): string {
  const parts: string[] = [];
  if (outcome.baseDamage > 0) parts.push(`造成${outcome.baseDamage}伤害`);
  if (outcome.baseHealing > 0) parts.push(`回复${outcome.baseHealing}`);
  if (outcome.baseShield > 0) parts.push(`获得护盾${outcome.baseShield}`);
  return parts.length > 0 ? `基础结果：${parts.join(' · ')}` : '基础结果：本回合不造成伤害';
}

function rewardOutcomeSummary(outcome: IntentTurnOutcome): string {
  if (outcome.rewardKind === 'enemy_damage_reduction') return `下一次真正攻击额外降低${outcome.enemyDamageReduction}点。`;
  if (outcome.rewardKind === 'healing') return `额外回复${outcome.bonusHealing}，本次共回复${outcome.healing}。`;
  return `额外获得护盾${outcome.bonusShield}，本次共获得护盾${outcome.shield}。`;
}

function enemyOutcomeSummary(outcome: IntentTurnOutcome): string {
  if (!outcome.enemyActed) return outcome.intent.kind === 'charge'
    ? `本回合不攻击；下一回合将造成${outcome.intent.nextDamage}伤害。`
    : '敌人HP已归零，敌方未再行动。';
  const reduction = outcome.enemyRawDamage - outcome.enemyDamage;
  const suppressed = reduction > 0 ? `，压制${reduction}` : '';
  const shield = outcome.shieldAbsorbed > 0 ? `，护盾吸收${outcome.shieldAbsorbed}` : '';
  return `预告${outcome.enemyRawDamage}${suppressed} · 实际承受${outcome.playerDamage}${shield}。`;
}

function pendingAttackSummary(state: IntentBattleState): string {
  return state.pendingEnemyAttackReduction > 0
    ? `待生效压制：下一次攻击 -${state.pendingEnemyAttackReduction}`
    : '待生效压制：无';
}
