'use client';

import { useMemo, useState } from 'react';
import {
  INTENT_COMBAT_RULES,
  INTENT_COMBAT_SKILLS,
  createIntentCombatState,
  getIntentCombatChoiceSet,
  getIntentDescription,
  getIntentForTurn,
  resolveIntentCombatBattleOnly,
  resolveIntentCombatCall,
  selectIntentCombatCall,
  type IntentBattleMode,
  type IntentBattleSkill,
  type IntentBattleState,
  type IntentCallQuality,
  type IntentTurnOutcome,
} from '../../game/intent-combat-v1';

type IntentStage = 'battle' | 'feedback' | 'won' | 'lost';
type FeedbackStep = 'player_result' | 'enemy_result';

type CallCounts = Record<IntentCallQuality, number>;

const EMPTY_COUNTS: CallCounts = { independent: 0, supported: 0, failed: 0 };

export default function IntentCombatPrototypePage() {
  const [battle, setBattle] = useState<IntentBattleState>(createIntentCombatState);
  const [displayState, setDisplayState] = useState<IntentBattleState>(createIntentCombatState);
  const [mode, setMode] = useState<IntentBattleMode>('with_calls');
  const [stage, setStage] = useState<IntentStage>('battle');
  const [selected, setSelected] = useState<ReturnType<typeof selectIntentCombatCall> | null>(null);
  const [supportUsed, setSupportUsed] = useState(false);
  const [outcome, setOutcome] = useState<IntentTurnOutcome | null>(null);
  const [feedbackStep, setFeedbackStep] = useState<FeedbackStep>('player_result');
  const [counts, setCounts] = useState<CallCounts>(EMPTY_COUNTS);

  const intent = useMemo(() => getIntentForTurn(battle.turn), [battle.turn]);

  function resetBattle(nextMode: IntentBattleMode = mode) {
    const next = createIntentCombatState();
    setMode(nextMode);
    setBattle(next);
    setDisplayState(next);
    setStage('battle');
    setSelected(null);
    setSupportUsed(false);
    setOutcome(null);
    setFeedbackStep('player_result');
    setCounts(EMPTY_COUNTS);
  }

  function beginOutcome(nextOutcome: IntentTurnOutcome) {
    setOutcome(nextOutcome);
    setDisplayState(nextOutcome.stateAfterSkill);
    setSelected(null);
    setSupportUsed(false);
    setFeedbackStep('player_result');
    setStage('feedback');
    if (nextOutcome.quality) {
      setCounts(current => ({ ...current, [nextOutcome.quality as IntentCallQuality]: current[nextOutcome.quality as IntentCallQuality] + 1 }));
    }
  }

  function chooseSkill(skill: IntentBattleSkill) {
    if (stage !== 'battle' || battle.result !== 'active') return;
    if (mode === 'battle_only') {
      beginOutcome(resolveIntentCombatBattleOnly(battle, skill));
      return;
    }
    setSelected(selectIntentCombatCall(skill, battle.turn));
    setSupportUsed(false);
  }

  function answer(choice: string) {
    if (!selected || stage !== 'battle') return;
    const quality: IntentCallQuality = choice === selected.word.targetGloss
      ? supportUsed ? 'supported' : 'independent'
      : 'failed';
    beginOutcome(resolveIntentCombatCall(battle, selected, quality));
  }

  function continueFeedback() {
    if (!outcome) return;
    if (feedbackStep === 'player_result') {
      if (outcome.state.result === 'won') {
        setBattle(outcome.state);
        setDisplayState(outcome.state);
        setStage('won');
        return;
      }
      setDisplayState(outcome.state);
      setFeedbackStep('enemy_result');
      return;
    }
    if (feedbackStep === 'enemy_result') {
      setBattle(outcome.state);
      setDisplayState(outcome.state);
      if (outcome.state.result === 'lost') {
        setStage('lost');
        return;
      }
      setOutcome(null);
      setFeedbackStep('player_result');
      setStage('battle');
    }
  }

  const visibleState = stage === 'feedback' ? displayState : battle;

  return (
    <main className="intent-shell">
      <header className="intent-header">
        <div>
          <span>回合制战斗独立样机 V1</span>
          <h1>先看意图，再决定回应</h1>
          <p>技能先决定行动；英语调用只提供对应的掌握奖励。</p>
        </div>
        <div className="intent-mode" role="group" aria-label="战斗模式">
          <button className={mode === 'with_calls' ? 'active' : ''} onClick={() => resetBattle('with_calls')}>英语调用开启</button>
          <button className={mode === 'battle_only' ? 'active' : ''} onClick={() => resetBattle('battle_only')}>只测战斗选择</button>
        </div>
      </header>

      {(stage === 'battle' || stage === 'feedback') && (
        <section className="intent-battle-card">
          <div className="intent-hp-row">
            <HpPanel label="澜歌" hp={visibleState.playerHp} maxHp={INTENT_COMBAT_RULES.playerMaxHp} shield={visibleState.playerShield} kind="player" />
            <HpPanel label="测试敌人A" hp={visibleState.enemyHp} maxHp={INTENT_COMBAT_RULES.enemyMaxHp} kind="enemy" />
          </div>

          <div className="intent-turn-head">
            <span>第 {battle.turn} 回合 · 敌方下一步</span>
            <strong>{intent.label}</strong>
            <p>{getIntentDescription(intent)}</p>
            <small className="intent-pending">{pendingAttackSummary(visibleState)}</small>
          </div>

          {stage === 'battle' && !selected && (
            <>
              <div className="intent-battle-only-note">
                {mode === 'battle_only' ? '英语调用关闭：本次只执行技能基础结果。' : '先选技能，再在技能卡内完成词义调用。'}
              </div>
              <div className="intent-skills">
                {INTENT_COMBAT_SKILLS.map(skill => <SkillCard key={skill.skillId} skill={skill} onChoose={chooseSkill} showRewards={mode === 'with_calls'} />)}
              </div>
            </>
          )}

          {stage === 'battle' && selected && (
            <CallCard selected={selected} supportUsed={supportUsed} onSupport={() => setSupportUsed(true)} onAnswer={answer} />
          )}

          {stage === 'feedback' && outcome && <FeedbackPanel outcome={outcome} step={feedbackStep} nextIntent={feedbackStep === 'enemy_result' ? getIntentForTurn(outcome.state.turn) : null} onContinue={continueFeedback} />}
        </section>
      )}

      {(stage === 'won' || stage === 'lost') && (
        <ResultPanel result={stage} battle={battle} counts={counts} onReset={() => resetBattle()} />
      )}
    </main>
  );
}

function HpPanel({
  label,
  hp,
  maxHp,
  shield = 0,
  kind,
}: {
  label: string;
  hp: number;
  maxHp: number;
  shield?: number;
  kind: 'player' | 'enemy';
}) {
  return (
    <div className={`intent-hp-panel intent-hp-${kind}`}>
      <div><span>{label}</span><b>{hp}/{maxHp}</b></div>
      <i><em style={{ width: `${Math.max(0, Math.min(100, hp / maxHp * 100))}%` }} /></i>
      {kind === 'player' && <small>护盾 {shield}</small>}
    </div>
  );
}

function SkillCard({ skill, onChoose, showRewards }: { skill: IntentBattleSkill; onChoose: (skill: IntentBattleSkill) => void; showRewards: boolean }) {
  return (
    <button className="intent-skill-card" onClick={() => onChoose(skill)}>
      <strong>{skill.skillName}</strong>
      <span>{baseSummary(skill)}</span>
      {showRewards && <>
        <small>{rewardSummary(skill, 'supported')}</small>
        <small>{rewardSummary(skill, 'independent')}</small>
      </>}
    </button>
  );
}

function CallCard({
  selected,
  supportUsed,
  onSupport,
  onAnswer,
}: {
  selected: ReturnType<typeof selectIntentCombatCall>;
  supportUsed: boolean;
  onSupport: () => void;
  onAnswer: (choice: string) => void;
}) {
  const choices = getIntentCombatChoiceSet(selected.word.wordId);
  return (
    <div className="intent-call-card">
      <span>{selected.skill.skillName} · 当前行动调用</span>
      <h2>{selected.word.word}</h2>
      <p>{supportUsed ? '已回想世界动作，再确认这个词的意思。' : '从词义中选出与它对应的一项。'}</p>
      <div className="intent-choices">
        {choices.map(choice => <button key={choice} onClick={() => onAnswer(choice)}>{choice}</button>)}
      </div>
      {!supportUsed && <button className="intent-support" onClick={onSupport}>回想世界动作</button>}
      {supportUsed && <small className="intent-support-note">支架已启用</small>}
    </div>
  );
}

function FeedbackPanel({
  outcome,
  step,
  nextIntent,
  onContinue,
}: {
  outcome: IntentTurnOutcome;
  step: FeedbackStep;
  nextIntent: ReturnType<typeof getIntentForTurn> | null;
  onContinue: () => void;
}) {
  const qualityLabel = outcome.quality === 'independent' ? '独立完成' : outcome.quality === 'supported' ? '回想后完成' : '基础执行';
  return (
    <div className={`intent-feedback intent-feedback-${step === 'player_result' ? 'player' : 'enemy'}`}>
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
        {outcome.state.result === 'active' && nextIntent && <p className="intent-feedback-next-line">下一回合预告：{getIntentDescription(nextIntent)}</p>}
      </>}
      <button className="intent-continue" onClick={onContinue}>{step === 'player_result' && outcome.state.result === 'won' ? '进入胜利结果' : step === 'enemy_result' ? '进入下一回合' : '继续'}</button>
    </div>
  );
}

function ResultPanel({
  result,
  battle,
  counts,
  onReset,
}: {
  result: 'won' | 'lost';
  battle: IntentBattleState;
  counts: CallCounts;
  onReset: () => void;
}) {
  return (
    <section className={`intent-result intent-result-${result}`}>
      <span>战斗结果</span>
      <h2>{result === 'won' ? '战斗胜利' : '战斗失利'}</h2>
      <p>澜歌 {battle.playerHp}/{INTENT_COMBAT_RULES.playerMaxHp} · 测试敌人A {battle.enemyHp}/{INTENT_COMBAT_RULES.enemyMaxHp}</p>
      <div className="intent-counts">
        <b>独立完成 <em>{counts.independent}</em></b>
        <b>回想后完成 <em>{counts.supported}</em></b>
        <b>基础执行 <em>{counts.failed}</em></b>
      </div>
      {result === 'lost' && (
        <div className="intent-weaknesses">
          <strong>本场真实薄弱词</strong>
          {battle.weaknesses.length > 0 ? battle.weaknesses.map(item => <p key={item.wordId}>{item.word}<small>{item.skillName} · 第{item.turn}回合</small></p>) : <p>本场没有英语调用记录。</p>}
        </div>
      )}
      {modeDescription(counts) && <small className="intent-result-note">{modeDescription(counts)}</small>}
      <button className="intent-restart" onClick={onReset}>重新挑战</button>
    </section>
  );
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

function modeDescription(counts: CallCounts): string {
  return counts.independent + counts.supported + counts.failed === 0
    ? '只测战斗选择：没有英语题、掌握奖励或薄弱词记录。'
    : '';
}
