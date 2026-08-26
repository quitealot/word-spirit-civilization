'use client';
/* eslint-disable react-hooks/purity -- response timing is sampled only for answer events */
/* eslint-disable @next/next/no-img-element -- local transparent character PNGs */
import { useEffect, useMemo, useRef, useState } from 'react';
import { assertVocabularyIntegrity } from './vocabulary';
import { buildAdventurePreparationPlan, dueCount, getAdventureQuestion, getBattleGuideQuestion, getCurrentLearningPack, getDueQuestion, getDueWordIds, learnedWordCount, loadLearningStore, recordLearningAnswer, resetLearningStore, type LearningQuestion } from './learning-engine';
import { bootstrapAnalytics, track } from './analytics';
import { SPIRITS, getSpirit, type SpiritConfig } from './game/spirit-config';
import { assertSignatureGuidanceIntegrity, getSignatureGuidance, getSignatureGuidanceForSkill, loadSkillRelationshipStore, recordSkillRelationshipCall, recordSkillWeakness, recoverSkillWeakness, resetSkillRelationshipStore, type SkillWeaknessEvidence, type StarterSkillId } from './game/skill-guidance';
import { EPISODE_CONFIG, type EpisodeId, type MasteryLayer } from './game/episode-config';
import { bossQuestionLayer, phaseCapForBoss, resolveBossQuestionLayer } from './game/progression';
import { getSpiritGrowth, grantBattleGrowth, grantLearningGrowth, grantResonanceMilestone, grantStableBattleSkillGrowth, grantWeaknessRecoveryGrowth } from './game/growth';
import { applyTeamTactic, createTeamBattleState, getActiveSpirit, getReserveSpirits, getSwapAvailability, getSwapCue, resolveEnemyTurn, setNextEnemyAttack, swapActiveSpirit, type TeamBattleState } from './game/team-battle';
import { DevPanel } from './game/dev-panel';
import type { DevPresetResult } from './game/dev-presets';
import { appendBattleLog, type BattleLogEventInput } from './game/battle-log';
import { beginAdventurePreparation, collectWeakWordIds, recordAdventureCall, recordPreparedWord, recordWeaknessRecovered, type AdventureLearningState } from './game/learning-adventure';
import { BRIDGE_V1_RULES, estimatedTrainingSeconds, resolveExecutionQuality, resolveSkillMultiplier, type ExecutionQuality } from './game/bridge-config';
import { clearGameSave, completeEp08ArenaSnapshot, completeEpisode, confirmEp06Companion, createEmptySave, getEpisodeExplorationGap, isEpisodeCompleted, isEpisodeUnlocked, loadGameSave, markEp10BossDefeated, recordEp07Swap, recordEp08Clue, recordEp09SkySilhouette, recordEp09TrackingAction, saveGameSave, setEp05Sightings, setEp06ApproachStage, setEp08MonumentFace, setEp09RareClueCount, setEp10BossPhase, type ApproachStage, type Ep1GuideOutcome, type GameSave, type StarterId, type TrackingSlotId } from './game/save';
import { POST_STORIES, STORIES, TEMPORARY_EPISODE_LABELS } from './narrative/temporary-content';
import { EP01_DEPARTURE_SCENE, EP01_FIRST_GUIDE_SCENE, EP01_PRE_SELECTION_BEATS, ep01GuideBeats, ep01PartnerScene } from './narrative/ep01-v3';
import type { NarrativeBeat } from './narrative/types';

type Starter = StarterId;
type Episode = EpisodeId;

function spiritFor(name: Starter): SpiritConfig { return getSpirit(name); }
function titleFor(ep: Episode): string { return TEMPORARY_EPISODE_LABELS[ep].title; }
function placeFor(ep: Episode): string { return TEMPORARY_EPISODE_LABELS[ep].place; }
function resonanceStage(value: number): string { if (value >= 12) return '征兆'; if (value >= 7) return '并肩'; if (value >= 3) return '熟悉'; return '初识'; }
function resonanceHint(value: number): string { return value >= 12 ? '出现新的变化征兆' : value >= 7 ? '并肩感正在增强' : value >= 3 ? '共鸣纹理已经改变' : '共鸣正在形成'; }

export default function Home() {
  const [ready, setReady] = useState(false), [save, setSave] = useState<GameSave>(createEmptySave());
  const [story, setStory] = useState<Episode | null>(null), [postStory, setPostStory] = useState<Episode | null>(null), [trainingHub, setTrainingHub] = useState(false), [quickTraining, setQuickTraining] = useState<{ source: 'maintenance' | 'targeted'; wordIds: string[] } | null>(null), [learning, setLearning] = useState(false), [battle, setBattle] = useState<Episode | null>(null), [arena, setArena] = useState(false), [codex, setCodex] = useState(false), [approach, setApproach] = useState(false), [monument, setMonument] = useState(false), [tracking, setTracking] = useState(false), [sky, setSky] = useState(false), [toast, setToast] = useState('');
  const [briefEpisode, setBriefEpisode] = useState<Episode | null>(null), [preparation, setPreparation] = useState<Episode | null>(null), [preparationComplete, setPreparationComplete] = useState<Episode | null>(null), [recallEpisode, setRecallEpisode] = useState<Episode | null>(null), [resultEpisode, setResultEpisode] = useState<Episode | null>(null);
  const [, refresh] = useState(0);
  useEffect(() => { assertVocabularyIntegrity(); assertSignatureGuidanceIntegrity(); const timer = window.setTimeout(() => { bootstrapAnalytics(); setSave(loadGameSave()); setReady(true); }, 0); return () => window.clearTimeout(timer); }, []);
  useEffect(() => { if (ready) saveGameSave(save); }, [ready, save]);
  const spirit = useMemo(() => save.starter ? spiritFor(save.starter) : null, [save.starter]);
  const starterGrowth = save.starter ? getSpiritGrowth(save, save.starter) : null;
  const companionGrowth = getSpiritGrowth(save, 'MIST_PORT_SPIRIT_01');
  const learned = ready ? learnedWordCount() : 0, due = ready ? dueCount() : 0, pack = ready ? getCurrentLearningPack() : null;
  const weakWordIds = collectWeakWordIds(save.adventureLearning);
  const recentSkillWeaknesses = ready ? loadSkillRelationshipStore().recentWeaknesses : [];
  const currentNewRelation = pack?.questions.slice(pack.learned).map(question => getSignatureGuidance(question.wordId, save.starter ?? undefined)).find(Boolean);
  const currentMaintenanceRelation = getDueWordIds(5).map(wordId => getSignatureGuidance(wordId, save.starter ?? undefined)).find(Boolean);
  const update = (fn: (current: GameSave) => GameSave) => setSave(current => fn(current));
  const notify = (text: string) => { setToast(text); window.setTimeout(() => setToast(''), 2600); };
  function advanceOpening(index: number) { update(s => ({ ...s, openingCheckpoint: 'harbor', openingIndex: index, openingInteraction: null })); }
  function choose(starter: Starter) { track('starter_selected', { starter }); update(s => ({ ...s, starter, checkpoint: 'ep1_intro', ep1TutorialIndex: 0, ep1GuideOutcome: null, openingCheckpoint: null, openingInteraction: null })); }
  function chooseEp1Guide(outcome: Exclude<Ep1GuideOutcome, null>) {
    if (outcome === 'trained') { update(s => ({ ...s, checkpoint: 'ep1_lesson', ep1TutorialIndex: 0, ep1GuideOutcome: 'trained' })); setLearning(true); }
    else update(s => ({ ...s, checkpoint: 'ep1_outro', ep1TutorialIndex: 0, ep1GuideOutcome: 'skipped' }));
  }
  function finishEp1Departure() { update(s => ({ ...completeEpisode(s, 1), checkpoint: null, ep1TutorialIndex: 0 })); track('episode_completed', { episode: 1 }); showResult(1); }
  function complete(ep: Episode) { update(s => completeEpisode(s, ep)); }
  function recordBattleClear(ep: Episode) { update(s => { let next = s; if (ep === 5) next = { ...next, episodeState: { ...next.episodeState, ep05: { ...next.episodeState.ep05, battleCompleted: true } } }; if (ep === 7) next = { ...next, episodeState: { ...next.episodeState, ep07: { ...next.episodeState.ep07, battleCompleted: true } } }; if (ep === 10) next = markEp10BossDefeated(next); if (next.starter) next = grantBattleGrowth(next, next.starter, `ep${String(ep).padStart(2, '0')}`).save; if (ep === 7 && next.starter) next = grantResonanceMilestone(next, 'ep07.teamwork', [next.starter, 'MIST_PORT_SPIRIT_01'], 3); if (ep === 10 && next.starter) next = grantResonanceMilestone(next, 'ep10.chapter_clear', [next.starter, 'MIST_PORT_SPIRIT_01'], 5); return next; }); }
  function learningResult(correct: boolean, seen: boolean, question?: LearningQuestion, activeSpiritId?: string) { if (correct) { const spiritId = activeSpiritId ?? save.starter; const attempts = question ? (loadLearningStore().progress[question.wordId]?.attempts ?? 0) : 0; const evidenceId = question ? `learning:${question.wordId}:${attempts}` : null; if (spiritId && evidenceId) { const preview = grantLearningGrowth(save, spiritId, evidenceId, seen); if (!preview.duplicate) notify(preview.toLevel > preview.fromLevel ? `${spiritId}升到 Lv.${preview.toLevel}` : `${spiritId} +${preview.xp}经验 · 共鸣+${preview.resonance}`); } update(s => { const explored = { ...s, exploration: s.exploration + (seen ? BRIDGE_V1_RULES.exploration.correctReview : BRIDGE_V1_RULES.exploration.correctNew) }; return spiritId && evidenceId ? grantLearningGrowth(explored, spiritId, evidenceId, seen).save : explored; }); } refresh(v => v + 1); }
  function launchEpisode(ep: Episode) { track('episode_started', { episode: ep }); if (ep === 1) update(s => ({ ...s, checkpoint: 'ep1_intro', ep1TutorialIndex: 0, ep1GuideOutcome: null, openingCheckpoint: null })); else setStory(ep); }
  function startEpisode(ep: Episode) { setBriefEpisode(ep); }
  function startPreparation(ep: Episode) {
    const plan = buildAdventurePreparationPlan(ep, weakWordIds);
    update(s => ({ ...s, adventureLearning: beginAdventurePreparation(s.adventureLearning, ep, plan.newWordIds, plan.reviewWordIds, plan.targetedWordIds) }));
    setBriefEpisode(null);
    setPreparation(ep);
  }
  function recordPrepared(ep: Episode, question: LearningQuestion) { update(s => ({ ...s, adventureLearning: recordPreparedWord(s.adventureLearning, ep, question.wordId) })); }
  function recordCall(ep: Episode, question: LearningQuestion, correct: boolean, weak = !correct) { update(s => ({ ...s, adventureLearning: recordAdventureCall(s.adventureLearning, ep, question.wordId, correct, weak) })); }
  function recordStableSkill(ep: Episode, wordId: string, spiritId: string) { update(s => { const explored = { ...s, exploration: s.exploration + BRIDGE_V1_RULES.exploration.stableBattleSkill }; return grantStableBattleSkillGrowth(explored, spiritId, ep, wordId).save; }); }
  function recoverWeakness(ep: Episode, wordId: string, spiritId: string) { update(s => { const learning = recordWeaknessRecovered(s.adventureLearning, ep, wordId); const explored = { ...s, adventureLearning: learning, exploration: s.exploration + BRIDGE_V1_RULES.exploration.weaknessRecovered }; return grantWeaknessRecoveryGrowth(explored, spiritId, ep, wordId).save; }); }
  function weaknessEpisode(wordId: string): Episode { return episodeIds.find(ep => save.adventureLearning[ep].weakWordIds.includes(wordId)) ?? 1; }
  function finishPreparation(ep: Episode) { setPreparation(null); setPreparationComplete(ep); }
  function showResult(ep: Episode) { setResultEpisode(ep); }
  function finishStory(ep: Episode) { track('episode_dialogue_completed', { episode: ep }); setStory(null); if (ep === 6) { setApproach(true); return; } if (ep === 8) { setMonument(true); return; } if (ep === 9) { setTracking(true); return; } if (EPISODE_CONFIG[ep].hasBattle) { setBattle(ep); return; } setRecallEpisode(ep); }
  function finishRecall(ep: Episode) {
    setRecallEpisode(null);
    if (ep === 1) { update(s => ({ ...s, checkpoint: 'ep1_outro', ep1TutorialIndex: 3 })); return; }
    if (ep === 6) { update(s => { const acquired = completeEpisode(confirmEp06Companion(s), 6); return acquired.starter ? grantResonanceMilestone(acquired, 'ep06.companion_join', [acquired.starter, 'MIST_PORT_SPIRIT_01'], 3) : acquired; }); notify('共鸣发生了明显变化'); }
    else update(s => completeEpisode(s, ep));
    track('episode_completed', { episode: ep });
    showResult(ep);
  }
  function winBattle(ep: Episode) { track(ep === 10 ? 'boss_completed' : 'battle_completed', { episode: ep }); setBattle(null); recordBattleClear(ep); if (POST_STORIES[ep]) setPostStory(ep); else { complete(ep); track('episode_completed', { episode: ep }); showResult(ep); } }
  function finishPost(ep: Episode) { setPostStory(null); if (ep === 9) { update(s => setEp09RareClueCount(s, 1)); setSky(true); return; } update(s => { const completed = completeEpisode(s, ep); return ep === 5 ? setEp05Sightings(completed, 3) : completed; }); track('episode_completed', { episode: ep }); showResult(ep); }
  function reset() { resetLearningStore(); resetSkillRelationshipStore(); clearGameSave(); setSave(createEmptySave()); setStory(null); setPostStory(null); setTrainingHub(false); setQuickTraining(null); setLearning(false); setBattle(null); setApproach(false); setMonument(false); setTracking(false); setSky(false); setBriefEpisode(null); setPreparation(null); setPreparationComplete(null); setRecallEpisode(null); setResultEpisode(null); refresh(v => v + 1); }
  function applyDevPreset(result: DevPresetResult) { setSave(result.save); setStory(null); setPostStory(null); setBattle(null); setApproach(false); setMonument(false); setTracking(false); setSky(false); setBriefEpisode(null); setPreparation(null); setPreparationComplete(null); setRecallEpisode(null); setResultEpisode(null); if (result.entry.kind === 'battle') setBattle(result.target); else if (result.entry.kind === 'node' && result.target === 6) setApproach(true); else if (result.entry.kind === 'node' && result.target === 8) setMonument(true); else if (result.entry.kind === 'node' && result.target === 9) setTracking(true); else setStory(result.target); }
  if (!ready) return <main />;
  if (!spirit) return <><Ep01OpeningModal index={save.openingIndex} onProgress={advanceOpening} onChoose={choose} />{process.env.NODE_ENV === 'development' && <DevPanel save={save} onApply={applyDevPreset} onReplaceSave={setSave} onClear={() => { clearGameSave(); setSave(createEmptySave()); }} />}</>;
  const episodeIds = Object.keys(EPISODE_CONFIG).map(Number) as Episode[];
  return <main className="p0-shell"><header className="p0-header"><div><span>《词灵》十关试玩</span><h1>雾中的回声</h1></div><div className="p0-header-actions"><div className="p0-stats"><b>{save.exploration}</b><span>探索力</span><b>{due}</b><span>到期复习</span></div><button onClick={reset}>重新开始</button></div></header>
    <section className="partner-panel"><div className={`partner-art ${spirit.tone}`}><img src={spirit.image} alt={spirit.name} /></div><div><span>{isEpisodeCompleted(save, 3) ? '我的初伴' : '临时同行'} · {spirit.roleLabel}</span><h2>{spirit.name}</h2><p>Lv.{starterGrowth?.level ?? 1} · 经验 {starterGrowth?.xp ?? 0} · 共鸣阶段 {resonanceStage(starterGrowth?.resonance ?? 0)}</p><div className="evolution-hint">下一形态　<strong>？？？</strong><small>{resonanceHint(starterGrowth?.resonance ?? 0)}</small></div>{save.companion && <div className="team-strip"><div className="unknown-mini">?</div><span><b>绒岚 · Lv.{companionGrowth.level}</b><small>共鸣阶段 {resonanceStage(companionGrowth.resonance)} · 下一形态？？？</small></span></div>}</div></section>
    <nav className="home-tabs"><button onClick={() => setTrainingHub(true)}>训练</button><button onClick={() => setCodex(true)}>图鉴</button><button disabled={!save.episodeState.ep08.arenaUnlocked} onClick={() => setArena(true)}>竞技场</button></nav>
    {isEpisodeCompleted(save, 10) && <ChapterMap save={save} />}
    <section className="p0-grid"><article className="p0-card learning-card"><span>训练</span><h2>为了下一次行动变强</h2><div className="training-sources"><p><b>今日引导</b><strong>{Math.max(0, (pack?.questions.length ?? 0) - (pack?.learned ?? 0))}</strong></p><p><b>共鸣维护</b><strong>{due}</strong></p><p><b>针对训练</b><strong>{weakWordIds.length}</strong></p></div><small>已接触 {learned}/80 词。FSRS只负责长期复习时间。</small><button onClick={() => setTrainingHub(true)}>选择训练来源</button></article><article className="p0-card map-card"><span>当前目标</span><h2>雾港旧路</h2><div className="episode-list long-map">{episodeIds.map(ep => <EpisodeButton key={ep} episode={ep} open={isEpisodeUnlocked(save, ep)} done={isEpisodeCompleted(save, ep)} preparationStatus={save.adventureLearning[ep].status} onClick={() => startEpisode(ep)} />)}</div><small>训练是建议，不是门票；任何已到达的主线节点都允许直接出发。</small></article></section>
    {trainingHub && <TrainingHubModal newCount={Math.max(0, (pack?.questions.length ?? 0) - (pack?.learned ?? 0))} dueCount={due} weakCount={recentSkillWeaknesses.length || weakWordIds.length} newRelation={currentNewRelation} maintenanceRelation={currentMaintenanceRelation} recentWeaknesses={recentSkillWeaknesses} onClose={() => setTrainingHub(false)} onNew={() => { setTrainingHub(false); setLearning(true); }} onMaintenance={() => { setTrainingHub(false); setQuickTraining({ source: 'maintenance', wordIds: getDueWordIds(5) }); }} onTargeted={() => { const battleWordIds = recentSkillWeaknesses.map(item => item.wordId); setTrainingHub(false); setQuickTraining({ source: 'targeted', wordIds: (battleWordIds.length ? battleWordIds : weakWordIds).slice(0, BRIDGE_V1_RULES.training.targetedWordLimit) }); }} />}
    {quickTraining && <QuickTrainingModal source={quickTraining.source} wordIds={quickTraining.wordIds} spiritId={save.starter} onClose={() => setQuickTraining(null)} onAnswer={learningResult} onRecovered={wordId => { if (save.starter) recoverWeakness(weaknessEpisode(wordId), wordId, save.starter); recoverSkillWeakness(wordId); refresh(v => v + 1); }} />}
    {briefEpisode && <ChallengeBriefModal episode={briefEpisode} save={save} weakWordIds={weakWordIds} onClose={() => setBriefEpisode(null)} onTrain={() => startPreparation(briefEpisode)} onChallenge={() => { setBriefEpisode(null); launchEpisode(briefEpisode); }} />}
    {save.checkpoint === 'ep1_intro' && <Ep01AfterSelectionModal spirit={spirit} index={save.ep1TutorialIndex} onProgress={index => update(s => ({ ...s, ep1TutorialIndex: index }))} onGuide={chooseEp1Guide} />}
    {save.checkpoint === 'ep1_outro' && save.ep1GuideOutcome && <Ep01DepartureModal spirit={spirit} outcome={save.ep1GuideOutcome} index={save.ep1TutorialIndex} onProgress={index => update(s => ({ ...s, ep1TutorialIndex: index }))} onFinish={finishEp1Departure} />}
    {preparation && <AdventurePreparationModal episode={preparation} state={save.adventureLearning[preparation]} onClose={() => setPreparation(null)} onAnswer={learningResult} onPrepared={question => recordPrepared(preparation, question)} onFinish={() => finishPreparation(preparation)} />}
    {preparationComplete && <PreparationCompleteModal episode={preparationComplete} state={save.adventureLearning[preparationComplete]} onClose={() => setPreparationComplete(null)} />}
    {recallEpisode && <AdventureRecallModal episode={recallEpisode} state={save.adventureLearning[recallEpisode]} onAnswer={learningResult} onAdventureCall={(question, correct) => recordCall(recallEpisode, question, correct)} onFinish={() => finishRecall(recallEpisode)} />}
    {resultEpisode && <AdventureResultModal episode={resultEpisode} state={save.adventureLearning[resultEpisode]} save={save} onClose={() => setResultEpisode(null)} />}
    {story && <StoryModal episode={story} spirit={spirit} onClose={() => setStory(null)} onFinish={() => finishStory(story)} />}{postStory && <PostStoryModal episode={postStory} spirit={spirit} onFinish={() => finishPost(postStory)} />}{(learning || save.checkpoint === 'ep1_lesson') && pack && <LearningModal pack={pack} spiritId={save.starter} onCancel={() => { setLearning(false); if (save.checkpoint === 'ep1_lesson') update(s => ({ ...s, checkpoint: 'ep1_outro', ep1TutorialIndex: 0, ep1GuideOutcome: 'skipped' })); }} onClose={() => { setLearning(false); if (save.checkpoint === 'ep1_lesson') update(s => ({ ...s, checkpoint: 'ep1_outro', ep1TutorialIndex: 0, ep1GuideOutcome: 'trained' })); }} onAnswer={learningResult} />}{battle && <BattleModal episode={battle} spirit={spirit} save={save} onClose={() => setBattle(null)} onAnswer={learningResult} onAdventureCall={(question, correct, weak) => recordCall(battle, question, correct, weak)} onStableSkill={(wordId, spiritId) => recordStableSkill(battle, wordId, spiritId)} onWeaknessRecovered={(wordId, spiritId) => recoverWeakness(battle, wordId, spiritId)} onSwap={() => update(s => recordEp07Swap(s))} onBossPhase={phase => update(s => setEp10BossPhase(s, phase))} onWin={() => winBattle(battle)} />}
    {approach && <CompanionApproachModal stage={save.episodeState.ep06.approachStage} onStage={stage => update(s => setEp06ApproachStage(s, stage))} onConfirm={() => { setApproach(false); setRecallEpisode(6); }} />}{monument && <MonumentModal state={save} onFace={face => update(s => setEp08MonumentFace(s, face))} onClue={clue => update(s => recordEp08Clue(s, clue))} onComplete={() => { setMonument(false); update(s => recordEp08Clue(recordEp08Clue(s, 'residue'), 'position')); setRecallEpisode(8); }} onArena={() => setArena(true)} />}{tracking && <TrackingModal state={save} episodeLearning={save.adventureLearning[9]} onAction={slot => update(s => recordEp09TrackingAction(s, slot))} onAnswer={learningResult} onAdventureCall={(question, correct) => recordCall(9, question, correct)} onComplete={() => { setTracking(false); setBattle(9); }} />}{sky && <SkySilhouetteModal onComplete={() => { setSky(false); update(s => completeEpisode(recordEp09SkySilhouette(setEp09RareClueCount(s, 1)), 9)); track('episode_completed', { episode: 9 }); showResult(9); }} />}
    {arena && <ArenaModal onClose={() => setArena(false)} onComplete={() => { update(s => s.episodeState.ep08.arenaSnapshotCompleted ? s : completeEp08ArenaSnapshot({ ...s, exploration: s.exploration + 4 })); setArena(false); notify('竞技快照已记录'); }} />}{codex && <CodexModal save={save} spirit={spirit} onClose={() => setCodex(false)} />}{toast && <div className="toast">{toast}</div>}{process.env.NODE_ENV === 'development' && <DevPanel save={save} onApply={applyDevPreset} onReplaceSave={setSave} onClear={() => { clearGameSave(); setSave(createEmptySave()); }} />}</main>;
}

function beatSpeaker(beat: NarrativeBeat): string { if (beat.type === 'dialogue') return beat.speaker; if (beat.type === 'action') return beat.actor ?? ''; return ''; }
function beatText(beat: NarrativeBeat): string { return beat.type === 'choice' ? '' : beat.type === 'interaction' ? beat.resultText : beat.text; }
function NarrativeBeatView({ beat, visual }: { beat: NarrativeBeat; visual: React.ReactNode }) { return <div className="story-stage">{visual}<div>{beatSpeaker(beat) && <b>{beatSpeaker(beat)}</b>}<p>{beatText(beat)}</p></div></div>; }

function Ep01OpeningModal({ index, onProgress, onChoose }: { index: number; onProgress: (index: number) => void; onChoose: (starter: Starter) => void }) {
  const beats = EP01_PRE_SELECTION_BEATS.filter(item => item.beat.type !== 'choice');
  const safe = Math.min(index, beats.length);
  useEffect(() => { track('ep01_v3_started'); }, []);
  if (safe >= beats.length) return <StarterGate onChoose={onChoose} />;
  const item = beats[safe];
  const place = item.sceneId === 'ep01.morning' ? '窗边' : item.sceneId === 'ep01.north_view' ? '北坡' : item.sceneId === 'ep01.cenpo' ? '岑婆门前' : '语灵站';
  const symbol = item.sceneId === 'ep01.morning' ? '雾' : item.sceneId === 'ep01.north_view' ? '旧路' : item.sceneId === 'ep01.cenpo' ? '门前' : '站';
  return <main className="starter-screen opening-screen"><section className="story-modal opening-modal"><span>EP01 · 雾退了　{place}</span><NarrativeBeatView beat={item.beat} visual={<div className="scene-symbol opening-scene">{symbol}</div>} /><button className="story-next" onClick={() => onProgress(safe + 1)}>继续</button></section></main>;
}

function StarterGate({ onChoose }: { onChoose: (starter: Starter) => void }) { return <main className="starter-screen"><section className="starter-dialogue"><span>EP01 · ep01.spirits</span><h1>你带哪个？</h1></section><section className="starter-grid">{SPIRITS.map(spirit => <article className={`starter-card ${spirit.tone}`} key={spirit.name}><div className="starter-art"><img className="spirit-art" src={spirit.image} alt={spirit.name} /></div><h2>{spirit.name}</h2><button onClick={() => onChoose(spirit.name)}>带{spirit.name}</button></article>)}</section></main>; }

function Ep01AfterSelectionModal({ spirit, index, onProgress, onGuide }: { spirit: SpiritConfig; index: number; onProgress: (index: number) => void; onGuide: (outcome: Exclude<Ep1GuideOutcome, null>) => void }) {
  const beats = [...ep01PartnerScene(spirit.name).beats, ...EP01_FIRST_GUIDE_SCENE.beats.slice(0, 3)];
  const safe = Math.min(index, beats.length);
  if (safe >= beats.length) return <div className="modal-backdrop intro-backdrop"><section className="story-modal ep01-guide-choice"><span>EP01 · 第一次引导</span><div className="story-stage"><img src={spirit.image} alt={spirit.name} /><div><p>第一次引导训练，时长约60–90秒，可跳过。</p></div></div><div className="bridge-actions"><button onClick={() => onGuide('trained')}>开始第一次引导</button><button className="direct-challenge" onClick={() => onGuide('skipped')}>直接出发</button></div></section></div>;
  return <div className="modal-backdrop intro-backdrop"><section className="story-modal"><span>EP01 · {safe < ep01PartnerScene(spirit.name).beats.length ? ep01PartnerScene(spirit.name).sceneId : EP01_FIRST_GUIDE_SCENE.sceneId}</span><NarrativeBeatView beat={beats[safe]} visual={<img src={spirit.image} alt={spirit.name} />} /><button className="story-next" onClick={() => onProgress(safe + 1)}>继续</button></section></div>;
}

function Ep01DepartureModal({ spirit, outcome, index, onProgress, onFinish }: { spirit: SpiritConfig; outcome: Exclude<Ep1GuideOutcome, null>; index: number; onProgress: (index: number) => void; onFinish: () => void }) {
  const guideBeats = ep01GuideBeats(outcome), beats = [...guideBeats, ...EP01_DEPARTURE_SCENE.beats];
  const safe = Math.min(index, beats.length - 1), beat = beats[safe];
  return <div className="modal-backdrop intro-backdrop"><section className="story-modal"><span>EP01 · {safe < guideBeats.length ? EP01_FIRST_GUIDE_SCENE.sceneId : EP01_DEPARTURE_SCENE.sceneId}</span><NarrativeBeatView beat={beat} visual={<img src={spirit.image} alt={spirit.name} />} /><button className="story-next" onClick={() => safe < beats.length - 1 ? onProgress(safe + 1) : onFinish()}>{safe < beats.length - 1 ? '继续' : '前往港外旧路'}</button></section></div>;
}
function EpisodeButton({ episode, open, done, preparationStatus, onClick }: { episode: Episode; open: boolean; done: boolean; preparationStatus: AdventureLearningState['status']; onClick: () => void }) { const action = preparationStatus === 'ready' ? '准备充分' : preparationStatus === 'preparing' ? '可继续训练' : '查看目标'; return <button className={done ? 'done' : preparationStatus === 'ready' ? 'adventure-ready' : ''} disabled={!open || done} onClick={onClick}><i>{done ? '✓' : episode}</i><span>EP{String(episode).padStart(2, '0')} · {placeFor(episode)}<b>{titleFor(episode)}</b></span><em>{done ? '已完成' : open ? action : '未解锁'}</em></button>; }
function TrainingHubModal({ newCount, dueCount: maintenanceCount, weakCount, newRelation, maintenanceRelation, recentWeaknesses, onClose, onNew, onMaintenance, onTargeted }: { newCount: number; dueCount: number; weakCount: number; newRelation?: ReturnType<typeof getSignatureGuidance>; maintenanceRelation?: ReturnType<typeof getSignatureGuidance>; recentWeaknesses: SkillWeaknessEvidence[]; onClose: () => void; onNew: () => void; onMaintenance: () => void; onTargeted: () => void }) {
  const latestWeakness = recentWeaknesses[0];
  return <div className="modal-backdrop"><section className="adventure-bridge training-hub"><button className="close" onClick={onClose}>×</button><span>训练</span><h2>选择这次训练</h2><div className="training-source-actions"><button disabled={newCount === 0} onClick={onNew}><b>引导</b><strong>{newCount}</strong><small>熟悉新的技能配合</small>{newRelation && <em><code>{newRelation.word}</code> 与「{newRelation.skillName}」契合</em>}</button><button disabled={maintenanceCount === 0} onClick={onMaintenance}><b>维护</b><strong>{maintenanceCount}</strong><small>重新确认已经练过的配合</small>{maintenanceRelation && <em>{maintenanceRelation.spiritId} · {maintenanceRelation.skillName}<br />1项常用引导需要重新确认</em>}</button><button disabled={weakCount === 0} onClick={onTargeted}><b>针对训练</b><strong>{weakCount}</strong><small>只处理刚刚实战暴露的问题</small>{latestWeakness && <em>{latestWeakness.skillName}未完整发动<br /><code>{latestWeakness.word}</code>{latestWeakness.quality === 'hesitant' ? '迟疑' : '未稳定'}</em>}</button></div></section></div>;
}
function QuickTrainingModal({ source, wordIds, spiritId, onClose, onAnswer, onRecovered }: { source: 'maintenance' | 'targeted'; wordIds: string[]; spiritId: StarterId | null; onClose: () => void; onAnswer: (correct: boolean, seen: boolean, question: LearningQuestion) => void; onRecovered: (wordId: string) => void }) {
  const [index, setIndex] = useState(0), [feedback, setFeedback] = useState('');
  const started = useRef(Date.now());
  if (wordIds.length === 0) return <div className="modal-backdrop"><section className="adventure-bridge"><span>{source === 'targeted' ? '针对训练' : '共鸣维护'}</span><h2>当前没有需要处理的词</h2><button className="story-next" onClick={onClose}>返回</button></section></div>;
  const question = getDueQuestion(wordIds[Math.min(index, wordIds.length - 1)]);
  const relation = getSignatureGuidance(question.wordId, spiritId ?? undefined);
  const weakness = loadSkillRelationshipStore().recentWeaknesses.find(item => item.wordId === question.wordId);
  function answer(choice: string) { if (feedback) return; const correct = choice === question.answer; const seen = Boolean(loadLearningStore().progress[question.wordId]); recordLearningAnswer(question, correct, Date.now() - started.current); onAnswer(correct, seen, question); if (correct && source === 'targeted') onRecovered(question.wordId); setFeedback(correct ? `${question.word} 已重新稳定` : `正确义项：${question.answer}`); window.setTimeout(() => { setFeedback(''); if (index < wordIds.length - 1) { setIndex(index + 1); started.current = Date.now(); } else onClose(); }, 650); }
  return <div className="modal-backdrop"><section className="learn-sheet quick-training"><button className="close" onClick={onClose}>×</button><span>{source === 'targeted' ? '针对训练' : '维护'}　{index + 1}/{wordIds.length}</span>{source === 'targeted' && weakness && <em className="guidance-relation">刚才使「{weakness.skillName}」只发挥了 {weakness.effectPercent}%</em>}{source === 'maintenance' && relation && <em className="guidance-relation">{relation.spiritId} · {relation.skillName}　需要重新确认</em>}<h2>{question.word}</h2><i>{question.phonetic}</i><p>{question.prompt}</p><div>{question.choices.map(choice => <button key={choice} disabled={!!feedback} onClick={() => answer(choice)}>{choice}</button>)}</div>{feedback && <strong>{feedback}</strong>}</section></div>;
}
function ChallengeBriefModal({ episode, save, weakWordIds, onClose, onTrain, onChallenge }: { episode: Episode; save: GameSave; weakWordIds: string[]; onClose: () => void; onTrain: () => void; onChallenge: () => void }) {
  const existing = save.adventureLearning[episode];
  const plan = existing.wordIds.length > 0 ? existing : buildAdventurePreparationPlan(episode, weakWordIds);
  const newCount = 'newWordIds' in plan ? plan.newWordIds.length : 0;
  const reviewCount = 'reviewWordIds' in plan ? plan.reviewWordIds.length : 0;
  const targetedCount = 'targetedWordIds' in plan ? plan.targetedWordIds.length : 0;
  const total = newCount + reviewCount + targetedCount;
  const explorationGap = getEpisodeExplorationGap(save, episode);
  const readiness = targetedCount > 0 || explorationGap > 0 ? '一般' : existing.status === 'ready' ? '充分' : '良好';
  return <div className="modal-backdrop"><section className="adventure-bridge challenge-brief"><button className="close" onClick={onClose}>×</button><span>EP{String(episode).padStart(2, '0')} · 当前目标</span><h2>{titleFor(episode)}</h2><p>{placeFor(episode)}已经可以前往。训练会提高技能完整发动的稳定性，但不会阻止你直接出发。</p><div className="readiness-line"><b>准备状态</b><strong>{readiness}</strong></div><div className="training-sources"><p><b>今日引导</b><strong>{newCount}</strong></p><p><b>共鸣维护</b><strong>{reviewCount}</strong></p><p><b>针对训练</b><strong>{targetedCount}</strong></p></div><small>推荐训练约 {Math.max(1, Math.ceil(estimatedTrainingSeconds(total) / 60))} 分钟{explorationGap > 0 ? ` · 探索力距建议值 ${explorationGap}` : ''}</small><div className="bridge-actions"><button onClick={onTrain}>{existing.status === 'preparing' ? '继续训练' : existing.status === 'ready' ? '查看已完成训练' : '开始训练'}</button><button className="direct-challenge" onClick={onChallenge}>直接出发</button></div></section></div>;
}
function AdventurePreparationModal({ episode, state, onClose, onAnswer, onPrepared, onFinish }: { episode: Episode; state: AdventureLearningState; onClose: () => void; onAnswer: (correct: boolean, seen: boolean, question: LearningQuestion) => void; onPrepared: (question: LearningQuestion) => void; onFinish: () => void }) {
  const questions = state.wordIds.map(wordId => getDueQuestion(wordId));
  const startIndex = Math.min(state.preparedWordIds.length, Math.max(0, questions.length - 1));
  const [started, setStarted] = useState(state.preparedWordIds.length > 0), [index, setIndex] = useState(startIndex), [feedback, setFeedback] = useState('');
  const timer = useRef(Date.now());
  const question = questions[index];
  if (state.status === 'ready' || questions.length === 0) return <PreparationCompleteModal episode={episode} state={state} onClose={onFinish} />;
  function answer(choice: string) {
    if (!question || feedback) return;
    const progress = loadLearningStore().progress[question.wordId];
    const seen = Boolean(progress);
    const correct = choice === question.answer;
    recordLearningAnswer(question, correct, Date.now() - timer.current);
    onAnswer(correct, seen, question);
    onPrepared(question);
    setFeedback(correct ? '准备记录完成' : `正确义项：${question.answer}`);
    window.setTimeout(() => {
      setFeedback('');
      if (index < questions.length - 1) { setIndex(index + 1); timer.current = Date.now(); }
      else onFinish();
    }, 650);
  }
  if (!started) return <div className="modal-backdrop"><section className="adventure-bridge"><button className="close" onClick={onClose}>×</button><span>EP{String(episode).padStart(2, '0')} · 行动训练</span><h2>{placeFor(episode)}</h2><p>本次训练内容会优先成为战斗引导词，但不构成出发门票。</p><div className="preparation-counts"><b><strong>{state.newWordIds.length}</strong>今日引导</b><b><strong>{state.reviewWordIds.length}</strong>共鸣维护</b><b><strong>{state.targetedWordIds.length}</strong>针对训练</b></div><button className="story-next" onClick={() => { setStarted(true); timer.current = Date.now(); }}>开始训练</button></section></div>;
  const sourceLabel = state.targetedWordIds.includes(question.wordId) ? '针对训练' : state.reviewWordIds.includes(question.wordId) ? '共鸣维护' : '今日引导';
  return <div className="modal-backdrop"><section className="learn-sheet adventure-preparing"><button className="close" onClick={onClose}>×</button><span>EP{String(episode).padStart(2, '0')} · 行动训练　{index + 1}/{questions.length}</span><em>{sourceLabel}</em><h2>{question.word}</h2><i>{question.phonetic}</i><p>{question.prompt}</p><div>{question.choices.map(choice => <button key={choice} disabled={!!feedback} onClick={() => answer(choice)}>{choice}</button>)}</div>{feedback && <strong>{feedback}</strong>}</section></div>;
}
function PreparationCompleteModal({ episode, state, onClose }: { episode: Episode; state: AdventureLearningState; onClose: () => void }) { return <div className="modal-backdrop"><section className="adventure-bridge preparation-complete"><span>训练完成</span><h2>{placeFor(episode)}准备状态已改善</h2><div className="preparation-counts"><b><strong>{state.newWordIds.length}</strong>今日引导</b><b><strong>{state.reviewWordIds.length}</strong>共鸣维护</b><b><strong>{state.targetedWordIds.length}</strong>针对训练</b></div><p>这些词会优先参与本次实战。即时训练不会替代FSRS的长期复习。</p><button className="story-next" onClick={onClose}>返回目标</button></section></div>; }
function AdventureRecallModal({ episode, state, onAnswer, onAdventureCall, onFinish }: { episode: Episode; state: AdventureLearningState; onAnswer: (correct: boolean, seen: boolean, question: LearningQuestion) => void; onAdventureCall: (question: LearningQuestion, correct: boolean) => void; onFinish: () => void }) {
  const [question] = useState(() => getAdventureQuestion(state.wordIds, state.calledWordIds));
  const [feedback, setFeedback] = useState('');
  const started = useRef(Date.now());
  function answer(choice: string) {
    if (feedback) return;
    const correct = choice === question.answer;
    const seen = Boolean(loadLearningStore().progress[question.wordId]);
    recordLearningAnswer(question, correct, Date.now() - started.current);
    onAnswer(correct, seen, question);
    onAdventureCall(question, correct);
    setFeedback(correct ? '本次准备成功调用' : `正确义项：${question.answer}`);
    window.setTimeout(onFinish, 700);
  }
  return <div className="modal-backdrop"><section className="skeleton-modal adventure-recall"><span>EP{String(episode).padStart(2, '0')} · 必要英语行动</span><em className="prepared-word-badge">本次准备词</em><h2>{question.word}</h2><p>{question.prompt}</p><div className="tracking-question">{question.choices.map(choice => <button key={choice} disabled={!!feedback} onClick={() => answer(choice)}>{choice}</button>)}</div>{feedback && <strong>{feedback}</strong>}<small>这是本次探索中的即时调用，不替代FSRS长期复习。</small></section></div>;
}
function AdventureResultModal({ episode, state, save, onClose }: { episode: Episode; state: AdventureLearningState; save: GameSave; onClose: () => void }) { const growth = save.starter ? getSpiritGrowth(save, save.starter) : null; return <div className="modal-backdrop"><section className="adventure-bridge adventure-result"><span>EP{String(episode).padStart(2, '0')} · 本次探索</span><h2>训练与实战已共同记录</h2><div className="result-lines"><p><b>本次引导词</b><strong>{state.wordIds.length}</strong></p><p><b>实战稳定调用</b><strong>{state.successfulWordIds.length}</strong></p><p><b>战斗薄弱词</b><strong>{state.weakWordIds.length}</strong></p><p><b>{save.starter ?? '初伴'}成长</b><strong>Lv.{growth?.level ?? 1} · 经验 {growth?.xp ?? 0}</strong></p><p><b>探索推进</b><strong>{placeFor(episode)} → {episode < 10 ? placeFor((episode + 1) as Episode) : '章末地图'}</strong></p></div>{state.weakWordIds.length > 0 && <div className="result-weakness"><b>已加入“针对训练”</b>{state.weakWordIds.slice(0, 3).map(wordId => <span key={wordId}>{getDueQuestion(wordId).word}</span>)}</div>}<small>实战调用不替代FSRS；薄弱词会进入下一次短训练。</small><button className="story-next" onClick={onClose}>查看地图</button></section></div>; }
function StoryModal({ episode, spirit, onClose, onFinish }: { episode: Episode; spirit: SpiritConfig; onClose: () => void; onFinish: () => void }) { const lines = STORIES[episode] ?? ([['[PENDING_K3]', '[PENDING_K3]']] as const); const [index, setIndex] = useState(0), line = lines[Math.min(index, lines.length - 1)], visual = episode === 4 ? '尾' : episode === 8 ? '碑' : episode === 9 ? '稀' : episode === 10 ? '守' : null; return <div className="modal-backdrop"><section className="story-modal"><button className="close" onClick={onClose}>×</button><span>EP{String(episode).padStart(2, '0')} · {placeFor(episode)}</span><div className="story-stage">{visual ? <div className={`scene-symbol scene-${episode}`}>{visual}</div> : <img src={spirit.image} alt={spirit.name} />}<div><b>{line[0]}</b><p>{line[1]}</p></div></div><button className="story-next" onClick={() => index < lines.length - 1 ? setIndex(index + 1) : onFinish()}>{index < lines.length - 1 ? '继续' : EPISODE_CONFIG[episode].hasBattle ? '进入战斗' : '继续'}</button></section></div>; }
function LearningModal({ pack, spiritId, onClose, onCancel = onClose, onAnswer }: { pack: ReturnType<typeof getCurrentLearningPack>; spiritId: StarterId | null; onClose: () => void; onCancel?: () => void; onAnswer: (correct: boolean, seen: boolean, question: LearningQuestion) => void }) {
  const [index, setIndex] = useState(Math.min(pack.learned, pack.questions.length - 1)); const [feedback, setFeedback] = useState(''); const started = useRef(0); const question = pack.questions[index];
  useEffect(() => { track('lesson_started', { packId: pack.id }); started.current = Date.now(); }, [pack.id]);
  function answer(choice: string) { const seen = index < pack.learned; const correct = choice === question.answer; recordLearningAnswer(question, correct, Date.now() - started.current); track('question_answered', { wordId: question.wordId, layer: question.layer, correct, source: 'lesson' }); onAnswer(correct, seen, question); setFeedback(correct ? '记住了。探索力正在汇聚。' : `正确义项：${question.answer}`); window.setTimeout(() => { setFeedback(''); if (index < pack.questions.length - 1) { setIndex(index + 1); started.current = Date.now(); } else { onClose(); } }, 650); }
  const relation = getSignatureGuidance(question.wordId, spiritId ?? undefined);
  return <div className="modal-backdrop"><section className="learn-sheet"><button className="close" onClick={onCancel}>×</button><span>{pack.id} · L1　{index + 1}/{pack.questions.length}</span>{relation && <em className="guidance-relation"><code>{relation.word}</code> 与「{relation.skillName}」契合</em>}<h2>{question.word}</h2><i>{question.phonetic}</i><p>{question.prompt}</p><div>{question.choices.map(choice => <button key={choice} disabled={!!feedback} onClick={() => answer(choice)}>{choice}</button>)}</div>{feedback && <strong>{feedback}</strong>}</section></div>;
}

type BattleEvidence = { wordId: string; word: string; quality: ExecutionQuality; skillId: StarterSkillId | 'companion_cover' | 'companion_soften'; skillName: string; effectPercent: number; spiritId: string };
type BattleProps = { episode: Episode; spirit: SpiritConfig; save: GameSave; onClose: () => void; onAnswer: (correct: boolean, seen: boolean, question: LearningQuestion, activeSpiritId?: string) => void; onAdventureCall: (question: LearningQuestion, correct: boolean, weak: boolean) => void; onStableSkill: (wordId: string, spiritId: string) => void; onWeaknessRecovered: (wordId: string, spiritId: string) => void; onSwap: () => void; onBossPhase: (phase: 1 | 2 | 3) => void; onWin: () => void };
function BattleModal({ episode, spirit, save, onClose, onAnswer, onAdventureCall, onStableSkill, onWeaknessRecovered, onSwap, onBossPhase, onWin }: BattleProps) {
  const boss = episode === 10, requiresSwap = episode === 7, initialEnemy = boss ? 72 : episode === 9 ? 120 : requiresSwap ? 96 : 100;
  const battleId = `battle.ep${String(episode).padStart(2, '0')}`;
  const makeTeam = () => createTeamBattleState({ battleId: 'battle.ep07.team_test', spirits: [{ id: spirit.name, maxHp: 100, tacticalTags: ['assault'] }, { id: 'MIST_PORT_SPIRIT_01', maxHp: 112, tacticalTags: ['guard'] }], enemy: { id: 'EP07_TARGET', maxHp: 96, nextAttack: { kind: 'heavy', damage: 34 } } });
  const [enemy, setEnemy] = useState(initialEnemy), [ally, setAlly] = useState(100), [defenseBuffer, setDefenseBuffer] = useState(0), [chargePower, setChargePower] = useState(1), [teamBattle, setTeamBattle] = useState<TeamBattleState>(makeTeam), [phase, setPhase] = useState<1 | 2 | 3>(1), [question, setQuestion] = useState<LearningQuestion | null>(null), [skill, setSkill] = useState(spirit.skills[0]), [teamTactic, setTeamTactic] = useState<'cover' | 'soften' | null>(null), [message, setMessage] = useState('选择一个技能，随后用英语引导它发动。'), [wrongId, setWrongId] = useState<string>(), [defeated, setDefeated] = useState(false), [battleEvidence, setBattleEvidence] = useState<BattleEvidence[]>([]), [targetTraining, setTargetTraining] = useState(false), [targetTrainingDone, setTargetTrainingDone] = useState(false);
  const outcome = useRef<'active' | 'won' | 'defeated'>('active'); const started = useRef(0); const timer = useRef<number | null>(null);
  function battleLog(input: Omit<BattleLogEventInput, 'battleId'>) { if (process.env.NODE_ENV === 'development') appendBattleLog({ battleId, ...input }); }
  useEffect(() => { if (process.env.NODE_ENV === 'development') appendBattleLog({ battleId, turn: 1, activeSpirit: spirit.name, enemyAttackKind: requiresSwap ? 'heavy' : 'normal', battleResult: 'start' }); return () => { if (timer.current) window.clearTimeout(timer.current); if (outcome.current === 'active' && process.env.NODE_ENV === 'development') appendBattleLog({ battleId, battleResult: 'aborted' }); }; }, [battleId, requiresSwap, spirit.name]);
  const playerCeiling: MasteryLayer = 'L1', approved: MasteryLayer = 'L1'; const displayedLayer = boss ? resolveBossQuestionLayer(phaseCapForBoss(phase), playerCeiling, approved) : 'L1'; const teamSize = save.episodeState.ep06.teamSpiritIds.length || (save.companion ? 2 : 1);
  const activeTeamSpirit = getActiveSpirit(teamBattle), reserveTeamSpirit = getReserveSpirits(teamBattle)[0], swapCue = requiresSwap ? getSwapCue(teamBattle, reserveTeamSpirit?.id) : null;
  const adventureLearning = save.adventureLearning[episode];
  const battleWeakWordIds = Array.from(new Set([...adventureLearning.weakWordIds, ...battleEvidence.filter(item => item.quality !== 'stable').map(item => item.wordId)]));
  function nextAdventureQuestion(preferredWordId?: string) { return getBattleGuideQuestion({ weakWordIds: battleWeakWordIds, preparedWordIds: adventureLearning.wordIds, calledWordIds: adventureLearning.calledWordIds, preferredWordId }); }
  function chooseSkill(nextSkill: typeof skill) {
    if (outcome.current !== 'active') return;
    if (requiresSwap && activeTeamSpirit.status === 'down') { setMessage('当前伙伴无法继续行动，请换位'); return; }
    const signatureWordIds = getSignatureGuidanceForSkill(nextSkill.id).map(item => item.wordId);
    const dueWordIds = getDueWordIds();
    const preferred = wrongId && signatureWordIds.includes(wrongId)
      ? wrongId
      : signatureWordIds.find(wordId => battleWeakWordIds.includes(wordId))
        ?? signatureWordIds.find(wordId => adventureLearning.wordIds.includes(wordId))
        ?? signatureWordIds.find(wordId => dueWordIds.includes(wordId));
    setSkill(nextSkill);
    setQuestion(nextAdventureQuestion(preferred ?? wrongId));
    started.current = Date.now();
  }
  function swap() { if (!requiresSwap || !reserveTeamSpirit || !getSwapAvailability(teamBattle, reserveTeamSpirit.id).allowed) return; const from = activeTeamSpirit.id, to = reserveTeamSpirit.id; setTeamBattle(current => swapActiveSpirit(current, to)); onSwap(); battleLog({ turn: teamBattle.turn, activeSpirit: to, enemyAttackKind: teamBattle.enemy.nextAttack.kind, swap: { from, to, reason: swapCue?.reason }, battleResult: 'turn' }); setMessage(to === 'MIST_PORT_SPIRIT_01' ? '绒岚成为当前承伤伙伴 · 本回合不出题' : `${to}回到场上 · 攻击伤害30（绒岚24）`); }
  function retry() { setEnemy(initialEnemy); setAlly(100); setDefenseBuffer(0); setChargePower(1); setTeamBattle(makeTeam()); setPhase(1); setQuestion(null); setSkill(spirit.skills[0]); setTeamTactic(null); setWrongId(undefined); setDefeated(false); setBattleEvidence([]); setTargetTraining(false); setTargetTrainingDone(false); setMessage('训练结果已保留。再次选择技能，比较发动效果。'); outcome.current = 'active'; battleLog({ turn: 1, activeSpirit: spirit.name, enemyAttackKind: requiresSwap ? 'heavy' : 'normal', battleResult: 'start' }); }
  function resolveTeamDefense(current: TeamBattleState) { const attack = current.enemy.nextAttack.kind === 'heavy' ? { kind: 'normal' as const, damage: 18 } : { kind: 'heavy' as const, damage: 34 }; return setNextEnemyAttack(resolveEnemyTurn(current), attack); }
  function answer(choice: string) {
    if (!question || outcome.current !== 'active') return;
    const correct = choice === question.answer;
    const latencyMs = Date.now() - started.current;
    const executionKind = teamTactic ? (teamTactic === 'cover' ? 'shield' : 'mitigation') : skill.executionKind;
    const quality = resolveExecutionQuality(correct, latencyMs);
    const multiplier = resolveSkillMultiplier(executionKind, correct, latencyMs);
    const effectPercent = Math.round(multiplier * 100);
    const store = loadLearningStore();
    const seen = (store.progress[question.wordId]?.attempts ?? 0) > 0;
    const activeSpiritId = requiresSwap ? activeTeamSpirit.id : spirit.name;
    recordLearningAnswer(question, correct, latencyMs);
    track('question_answered', { wordId: question.wordId, layer: question.layer, correct, source: `battle_ep${episode}` });
    onAnswer(correct, seen, question, activeSpiritId);
    onAdventureCall(question, correct, quality !== 'stable');
    if (quality === 'stable') onStableSkill(question.wordId, activeSpiritId);
    const skillId = teamTactic ? (teamTactic === 'cover' ? 'companion_cover' : 'companion_soften') : skill.id;
    const skillName = teamTactic ? (teamTactic === 'cover' ? '覆护' : '缓冲') : skill.name;
    const evidence = { wordId: question.wordId, word: question.word, quality, skillId, skillName, effectPercent, spiritId: activeSpiritId } satisfies BattleEvidence;
    setBattleEvidence(current => [...current, evidence]);
    if (!teamTactic) recordSkillRelationshipCall({ skillId: skill.id, wordId: question.wordId, quality });
    if (quality !== 'stable') recordSkillWeakness({ ...evidence, quality });
    setQuestion(null);
    if (requiresSwap) {
      const before = teamBattle;
      const beforeActive = getActiveSpirit(before);
      const attack = before.enemy.nextAttack;
      let nextTeam = before;
      if (teamTactic === 'cover') nextTeam = applyTeamTactic(nextTeam, { kind: 'shield', amount: Math.round(BRIDGE_V1_RULES.baseEffects.shield * multiplier) });
      else if (teamTactic === 'soften') nextTeam = applyTeamTactic(nextTeam, { kind: 'weaken', reduction: BRIDGE_V1_RULES.baseEffects.mitigation * multiplier, turns: 1 });
      else nextTeam = applyTeamTactic(nextTeam, { kind: 'damage', amount: Math.round((beforeActive.id === 'MIST_PORT_SPIRIT_01' ? 24 : 30) * multiplier) });
      nextTeam = resolveTeamDefense(nextTeam);
      const afterActive = nextTeam.spirits[beforeActive.id];
      const damageTaken = Math.max(0, beforeActive.hp - afterActive.hp);
      const damageDealt = Math.max(0, before.enemy.hp - nextTeam.enemy.hp);
      const shieldAbsorbed = Math.max(0, beforeActive.shield - afterActive.shield);
      const reduced = before.enemy.incomingDamageReductionTurns > 0 ? Math.max(0, attack.damage - damageTaken - shieldAbsorbed) : 0;
      setTeamBattle(nextTeam);
      setEnemy(nextTeam.enemy.hp);
      setTeamTactic(null);
      battleLog({ turn: before.turn, activeSpirit: beforeActive.id, enemyAttackKind: attack.kind, shield: shieldAbsorbed, reduction: reduced, questionResult: correct ? 'correct' : 'incorrect', wordId: question.wordId, damageTaken, damageDealt, battleResult: nextTeam.result === 'won' ? 'victory' : nextTeam.result === 'lost' ? 'defeat' : 'turn' });
      const readableName = beforeActive.id === 'MIST_PORT_SPIRIT_01' ? '绒岚' : beforeActive.id;
      const defenseFeedback = shieldAbsorbed > 0 ? `护盾吸收${shieldAbsorbed}，HP仅-${damageTaken}` : reduced > 0 ? `削弱减伤${reduced}，HP-${damageTaken}` : `承受${damageTaken}伤害`;
      const executionFeedback = quality === 'stable' ? '完整发动' : quality === 'hesitant' ? `迟疑发动 · ${effectPercent}%` : `未完全发动 · ${effectPercent}%`;
      if (nextTeam.result === 'won') { outcome.current = 'won'; setMessage(`${readableName}技能${executionFeedback} · 造成${damageDealt}伤害 · 战斗结束`); timer.current = window.setTimeout(onWin, 350); }
      else if (nextTeam.result === 'lost') { outcome.current = 'defeated'; setDefeated(true); setMessage(`${readableName}${defenseFeedback} · 队伍无法继续`); }
      else setMessage(`${readableName}技能${executionFeedback} · ${defenseFeedback} · 造成${damageDealt}伤害`);
      return;
    }
    const configuredEffect = BRIDGE_V1_RULES.skillEffects[skill.id];
    const baseDamage = 'damage' in configuredEffect ? configuredEffect.damage : 0;
    const damage = Math.round(baseDamage * multiplier * chargePower);
    const next = Math.max(0, enemy - damage);
    const generatedDefense = 'shield' in configuredEffect
      ? Math.round(configuredEffect.shield * multiplier)
      : 'mitigation' in configuredEffect
        ? Math.round(BRIDGE_V1_RULES.baseEffects.counterDamage * configuredEffect.mitigation * multiplier)
        : 'weaken' in configuredEffect
          ? Math.round(BRIDGE_V1_RULES.baseEffects.counterDamage * configuredEffect.weaken * multiplier)
          : 0;
    const recovery = 'recovery' in configuredEffect ? Math.round(configuredEffect.recovery * multiplier) : 0;
    if ('nextAttackMultiplier' in configuredEffect) setChargePower(1 + (configuredEffect.nextAttackMultiplier - 1) * multiplier);
    else if (damage > 0 && chargePower > 1) setChargePower(1);
    const availableDefense = defenseBuffer + generatedDefense;
    const rawCounter = correct ? 0 : boss ? BRIDGE_V1_RULES.baseEffects.bossCounterDamage : BRIDGE_V1_RULES.baseEffects.counterDamage;
    const damageTaken = Math.max(0, rawCounter - availableDefense);
    const remainingDefense = Math.max(0, availableDefense - rawCounter);
    const nextAlly = Math.min(100, Math.max(0, ally + recovery - damageTaken));
    setDefenseBuffer(remainingDefense);
    setAlly(nextAlly);
    setEnemy(next);
    if (correct) setWrongId(undefined);
    else setWrongId(question.wordId);
    const executionFeedback = quality === 'stable' ? '完整发动' : quality === 'hesitant' ? `迟疑发动 · ${effectPercent}%` : `未完全发动 · ${effectPercent}%`;
    if (next > 0) {
      battleLog({ activeSpirit: spirit.name, enemyAttackKind: correct ? 'none' : 'normal', questionResult: correct ? 'correct' : 'incorrect', wordId: question.wordId, damageTaken, damageDealt: damage, battleResult: nextAlly === 0 ? 'defeat' : 'turn' });
      setMessage(`${skill.name}${executionFeedback}${damage ? ` · 造成${damage}伤害` : ''}${generatedDefense ? ` · 防护${generatedDefense}` : ''}${recovery ? ` · 恢复${recovery}` : ''}${'nextAttackMultiplier' in configuredEffect ? ` · 下次攻击强化至${Math.round((1 + (configuredEffect.nextAttackMultiplier - 1) * multiplier) * 100)}%` : ''}${damageTaken ? ` · 受到反击${damageTaken}` : ''}`);
      if (nextAlly === 0) { outcome.current = 'defeated'; setDefeated(true); }
      return;
    }
    if (boss && phase < 3) { const nextPhase = (phase + 1) as 1 | 2 | 3; setPhase(nextPhase); setEnemy(initialEnemy); onBossPhase(nextPhase); battleLog({ activeSpirit: spirit.name, enemyAttackKind: correct ? 'none' : 'normal', questionResult: correct ? 'correct' : 'incorrect', wordId: question.wordId, damageTaken, damageDealt: damage, battleResult: 'turn' }); setMessage(`${skill.name}${executionFeedback} · Phase ${nextPhase} · ${bossQuestionLayer(save, 'L1', 'L1')}`); return; }
    outcome.current = 'won';
    battleLog({ activeSpirit: spirit.name, enemyAttackKind: correct ? 'none' : 'normal', questionResult: correct ? 'correct' : 'incorrect', wordId: question.wordId, damageTaken, damageDealt: damage, battleResult: 'victory' });
    timer.current = window.setTimeout(onWin, 350);
  }
  function companionTactic(kind: 'cover' | 'soften') { if (!requiresSwap || activeTeamSpirit.id !== 'MIST_PORT_SPIRIT_01' || question) return; setTeamTactic(kind); setMessage(kind === 'cover' ? '绒岚准备护盾' : '绒岚准备削弱下一次攻击'); setQuestion(nextAdventureQuestion(wrongId)); started.current = Date.now(); }
  const teamStatus = requiresSwap ? <div className="team-battle-status">{Object.values(teamBattle.spirits).map(member => { const active = member.id === teamBattle.activeSpiritId; return <div className={active ? 'active' : ''} key={member.id}><b>{member.id === 'MIST_PORT_SPIRIT_01' ? '绒岚' : member.id}<em>{active ? '当前承伤' : '后备'}</em></b><small>HP {member.hp}/{member.maxHp} · 护盾 {member.shield}</small></div>; })}<small className={teamBattle.enemy.nextAttack.kind === 'heavy' ? 'heavy-warning' : ''}>敌方下一击：{teamBattle.enemy.nextAttack.kind === 'heavy' ? '重击' : '普通攻击'} · 换位冷却 {teamBattle.swapCooldownRemaining}</small>{swapCue && <strong>换位提示：{swapCue.reason === 'target_guards_heavy_attack' ? '绒岚更适合承受下一次重击' : '当前伙伴血量过低'}</strong>}</div> : null;
  const weakEvidence = battleEvidence.filter(item => item.quality !== 'stable').filter((item, index, all) => all.findIndex(candidate => candidate.wordId === item.wordId && candidate.skillId === item.skillId) === index);
  const incompleteBySkill = weakEvidence.reduce<Record<string, number>>((counts, item) => ({ ...counts, [item.skillName]: (counts[item.skillName] ?? 0) + 1 }), {});
  const activeRelation = question ? getSignatureGuidance(question.wordId, spirit.name, skill.id) : undefined;
  const body = targetTraining ? <BattleTargetTraining evidence={weakEvidence} onAnswer={onAnswer} onRecovered={(item) => { onWeaknessRecovered(item.wordId, item.spiritId); recoverSkillWeakness(item.wordId, item.skillId); }} onComplete={() => { setTargetTraining(false); setTargetTrainingDone(true); }} /> : defeated ? <div className="battle-review"><h3>{targetTrainingDone ? '针对训练完成' : '本场技能记录'}</h3>{!targetTrainingDone && Object.entries(incompleteBySkill).map(([name, count]) => <p className="skill-failure-summary" key={name}>{name} ×{count} 未完整发动</p>)}{weakEvidence.length > 0 && <div className="weak-word-list">{weakEvidence.map(item => <p key={`${item.skillId}:${item.wordId}`}><b>{item.word}</b><span>{item.quality === 'hesitant' ? '迟疑' : '未稳定'} · {item.skillName} {item.effectPercent}%</span></p>)}</div>}<div className="battle-skills battle-defeat">{!targetTrainingDone && weakEvidence.length > 0 && <button onClick={() => setTargetTraining(true)}><b>针对训练</b><small>约{Math.max(1, estimatedTrainingSeconds(weakEvidence.length))}秒</small></button>}<button onClick={retry}><b>{targetTrainingDone ? '再次挑战' : '重新挑战'}</b><small>保留已记录的学习结果</small></button><button onClick={onClose}><b>暂时退出</b><small>薄弱词保留到训练入口</small></button></div></div> : question ? <div className="battle-question">{(adventureLearning.wordIds.includes(question.wordId) || battleWeakWordIds.includes(question.wordId)) && <em className="prepared-word-badge">{battleWeakWordIds.includes(question.wordId) ? '战斗薄弱词' : '当前引导词'}</em>}{activeRelation && <em className="guidance-relation"><code>{question.word}</code> 与「{skill.name}」契合</em>}<h3>{question.word}</h3><small>{question.phonetic} · {displayedLayer}</small>{question.choices.map(choice => <button key={choice} onClick={() => answer(choice)}>{choice}</button>)}</div> : <div className="battle-skills">{spirit.skills.map(item => <button key={item.name} onClick={() => chooseSkill(item)}><b>{item.name}</b><small>{item.effect}</small></button>)}{requiresSwap && activeTeamSpirit.id === 'MIST_PORT_SPIRIT_01' && <><button onClick={() => companionTactic('cover')}><b>覆护</b><small>获得18点护盾 · 不绑定题层</small></button><button onClick={() => companionTactic('soften')}><b>缓冲</b><small>降低下一次伤害 · 不绑定题层</small></button></>}{requiresSwap && teamSize >= 2 && reserveTeamSpirit && <button className={swapCue ? 'swap-cue' : ''} onClick={swap} disabled={!getSwapAvailability(teamBattle, reserveTeamSpirit.id).allowed}><b>换位至 {reserveTeamSpirit.id === 'MIST_PORT_SPIRIT_01' ? '绒岚' : reserveTeamSpirit.id}</b><small>{reserveTeamSpirit.id === 'MIST_PORT_SPIRIT_01' ? '承受重击更稳' : '攻击30，高于绒岚的24'} · 冷却 {teamBattle.swapCooldownRemaining}</small></button>}</div>;
  return <div className="modal-backdrop"><section className="p0-battle"><button className="close" onClick={onClose}>×</button><span>EP{String(episode).padStart(2, '0')} · {boss ? `Boss · Phase ${phase}` : episode === 9 ? '稀有试探战' : episode === 7 ? '双伙伴战斗' : '探索战斗'}</span><h2>{boss ? 'EP10 · [PENDING_K3]' : titleFor(episode)}</h2>{teamStatus}<div className="battle-health"><b>{requiresSwap ? `${activeTeamSpirit.id === 'MIST_PORT_SPIRIT_01' ? '绒岚' : activeTeamSpirit.id} ${activeTeamSpirit.hp}` : `${spirit.name} ${ally}`}</b><b>目标 {enemy}</b></div><div className="battle-figures"><div className="battle-team-visual"><img src={spirit.image} alt={spirit.name} />{teamSize >= 2 && <div className="unknown-fighter">绒</div>}</div><strong>VS</strong><div className={`shadow-foe ${boss ? 'gatekeeper' : ''}`}>{boss ? '守' : episode === 9 ? '稀' : '蚀'}</div></div><p>{message}</p>{body}<small className="battle-rule">题层：{displayedLayer} · FSRS只负责调度；战术与题层解绑。</small></section></div>;
}
function BattleTargetTraining({ evidence, onAnswer, onRecovered, onComplete }: { evidence: BattleEvidence[]; onAnswer: (correct: boolean, seen: boolean, question: LearningQuestion, activeSpiritId?: string) => void; onRecovered: (item: BattleEvidence) => void; onComplete: () => void }) {
  const [index, setIndex] = useState(0), [feedback, setFeedback] = useState('');
  const started = useRef(Date.now());
  const item = evidence[Math.min(index, evidence.length - 1)];
  const question = getDueQuestion(item.wordId);
  function answer(choice: string) {
    if (feedback) return;
    const correct = choice === question.answer;
    const seen = Boolean(loadLearningStore().progress[question.wordId]);
    recordLearningAnswer(question, correct, Date.now() - started.current);
    track('question_answered', { wordId: question.wordId, layer: 'L1', correct, source: 'battle_targeted_training' });
    onAnswer(correct, seen, question, item.spiritId);
    if (correct) onRecovered(item);
    setFeedback(correct ? `${question.word} 已重新确认` : `正确义项：${question.answer}`);
    window.setTimeout(() => { setFeedback(''); if (index < evidence.length - 1) { setIndex(index + 1); started.current = Date.now(); } else onComplete(); }, 650);
  }
  return <div className="battle-target-training"><span>针对训练　{index + 1}/{evidence.length}</span><h3>{question.word}</h3><small>刚才使「{item.skillName}」只发挥了 {item.effectPercent}%</small><div>{question.choices.map(choice => <button key={choice} disabled={!!feedback} onClick={() => answer(choice)}>{choice}</button>)}</div>{feedback && <strong>{feedback}</strong>}</div>;
}
function CompanionApproachModal({ stage, onStage, onConfirm }: { stage: ApproachStage; onStage: (stage: ApproachStage) => void; onConfirm: () => void }) { const complete = stage >= 3, next = Math.min(3, stage + 1) as ApproachStage; return <div className="modal-backdrop"><section className="skeleton-modal"><span>EP06 · interaction {stage}/3</span><h2>绒岚 · [PENDING_K3]</h2><p>[PENDING_K3]</p><div className="skeleton-steps">{[1, 2, 3].map(step => <i className={stage >= step ? 'active' : ''} key={step}>interaction_{step}</i>)}</div>{complete ? <button className="story-next" onClick={onConfirm}>确认获得 MIST_PORT_SPIRIT_01</button> : <button className="story-next" onClick={() => onStage(next)}>完成 interaction {next}</button>}</section></div>; }
function MonumentModal({ state, onFace, onClue, onComplete, onArena }: { state: GameSave; onFace: (face: 'front' | 'back') => void; onClue: (clue: 'residue' | 'position') => void; onComplete: () => void; onArena: () => void }) { const monument = state.episodeState.ep08, ready = monument.residueRecorded && monument.positionRecorded; return <div className="modal-backdrop"><section className="skeleton-modal"><span>EP08 · unnamed monument</span><h2>无名碑 · [PENDING_K3]</h2><div className="skeleton-actions"><button className={monument.monumentFace === 'front' ? 'active' : ''} onClick={() => onFace('front')}>查看正面</button><button className={monument.monumentFace === 'back' ? 'active' : ''} onClick={() => onFace('back')}>查看背面</button><button disabled={monument.residueRecorded} onClick={() => onClue('residue')}>记录残字</button><button disabled={monument.positionRecorded} onClick={() => onClue('position')}>记录位置</button></div><p>[PENDING_K3]</p><div className="skeleton-status">残字 {monument.residueRecorded ? '✓' : '—'}　位置 {monument.positionRecorded ? '✓' : '—'}</div>{monument.arenaUnlocked && <button className="skeleton-subaction" onClick={onArena}>竞技快照（可选）</button>}<button className="story-next" disabled={!ready} onClick={onComplete}>完成记录并继续</button></section></div>; }
function TrackingModal({ state, episodeLearning, onAction, onAnswer, onAdventureCall, onComplete }: { state: GameSave; episodeLearning: AdventureLearningState; onAction: (slot: TrackingSlotId) => void; onAnswer: (correct: boolean, seen: boolean, question: LearningQuestion) => void; onAdventureCall: (question: LearningQuestion, correct: boolean) => void; onComplete: () => void }) {
  const slots: TrackingSlotId[] = ['tracking_01', 'tracking_02', 'tracking_03'];
  const complete = slots.every(slot => state.episodeState.ep09.tracking[slot].completed);
  const [activeSlot, setActiveSlot] = useState<TrackingSlotId | null>(null);
  const [question, setQuestion] = useState<LearningQuestion | null>(null);
  const started = useRef(0);
  function start(slot: TrackingSlotId) { setActiveSlot(slot); setQuestion(getAdventureQuestion(episodeLearning.wordIds, episodeLearning.calledWordIds)); started.current = Date.now(); }
  function answer(choice: string) { if (!question || !activeSlot) return; const store = loadLearningStore(), correct = choice === question.answer, seen = (store.progress[question.wordId]?.attempts ?? 0) > 0; recordLearningAnswer(question, correct, Date.now() - started.current); track('question_answered', { wordId: question.wordId, layer: 'L1', correct, source: `ep09_${activeSlot}` }); onAnswer(correct, seen, question); onAdventureCall(question, correct); onAction(activeSlot); setActiveSlot(null); setQuestion(null); }
  if (question && activeSlot) return <div className="modal-backdrop"><section className="skeleton-modal"><span>EP09 · {activeSlot} · L1</span>{episodeLearning.wordIds.includes(question.wordId) && <em className="prepared-word-badge">本次准备词</em>}<h2>{question.word}</h2><p>{question.prompt}</p><div className="tracking-question">{question.choices.map(choice => <button key={choice} onClick={() => answer(choice)}>{choice}</button>)}</div></section></div>;
  return <div className="modal-backdrop"><section className="skeleton-modal"><span>EP09 · tracking slots</span><h2>雾坡 · [PENDING_K3]</h2><p>每处只进行一次必要英语行动。</p><div className="tracking-grid">{slots.map(slot => { const item = state.episodeState.ep09.tracking[slot]; return <button key={slot} disabled={item.completed} onClick={() => start(slot)}><b>{slot}</b><small>{item.completed ? 'L1 action ✓' : '执行1次L1 action'}</small></button>; })}</div><button className="story-next" disabled={!complete} onClick={onComplete}>进入稀有试探战</button></section></div>;
}
function SkySilhouetteModal({ onComplete }: { onComplete: () => void }) { return <div className="modal-backdrop"><section className="skeleton-modal"><span>EP09 · sky silhouette</span><h2>SKY_LEGEND_01</h2><p>[PENDING_K3]</p><div className="sky-placeholder">翼</div><button className="story-next" onClick={onComplete}>记录天空剪影</button></section></div>; }
function PostStoryModal({ episode, spirit, onFinish }: { episode: Episode; spirit: SpiritConfig; onFinish: () => void }) { const lines = POST_STORIES[episode] ?? ([['[PENDING_K3]', '[PENDING_K3]']] as const), [index, setIndex] = useState(0), line = lines[Math.min(index, lines.length - 1)]; return <div className="modal-backdrop"><section className="story-modal"><span>EP{String(episode).padStart(2, '0')} · 战后</span><div className="story-stage">{episode === 10 ? <div className="scene-symbol scene-10">守</div> : <img src={spirit.image} alt={spirit.name} />}<div><b>{line[0]}</b><p>{line[1]}</p></div></div><button className="story-next" onClick={() => index < lines.length - 1 ? setIndex(index + 1) : onFinish()}>{index < lines.length - 1 ? '继续' : '完成剧情'}</button></section></div>; }
function ArenaModal({ onClose, onComplete }: { onClose: () => void; onComplete: () => void }) { const [round, setRound] = useState(0); return <div className="modal-backdrop"><section className="story-modal arena-modal"><button className="close" onClick={onClose}>×</button><span>旧擂台 · 测试快照</span><h2>[PENDING_K3]</h2><p>当前仅为本地测试快照，不是真实异步竞技。</p><div className="arena-snapshot"><b>攻击</b><span>当前作答结果</span><b>防守/反击</b><span>历史掌握快照</span></div><button className="story-next" onClick={() => round < 2 ? setRound(round + 1) : onComplete()}>{round < 2 ? `完成模拟回合 ${round + 1}/3` : '结束首场竞技'}</button></section></div>; }
function ChapterMap({ save }: { save: GameSave }) { const hooks = save.episodeState.ep10.hookFlags; return <section className="chapter-map"><span>章末地图 · 数据状态</span><h2>[PENDING_K3]</h2><div><i>map.harbor</i><i>map.unnamed_outline</i><i>map.next_outline</i></div><ul><li>starter_evolution: {hooks.starterEvolution ? 'ready' : 'pending'}</li><li>MIST_PORT_RARE_01 · {save.episodeState.ep09.rareClueCount}/3</li><li>SKY_LEGEND_01 · {hooks.skyLegend ? 'recorded' : 'pending'}</li></ul></section>; }
function CodexModal({ save, spirit, onClose }: { save: GameSave; spirit: SpiritConfig; onClose: () => void }) { return <div className="modal-backdrop"><section className="story-modal codex-modal"><button className="close" onClick={onClose}>×</button><span>雾港图鉴</span><h2>见过的语灵</h2><div className="codex-list"><article><img src={spirit.image} alt={spirit.name} /><b>{spirit.name}</b><small>初伴 · 已共鸣 · 下一形态？？？</small></article><article><div className="unknown-mini">?</div><b>{save.sightings > 0 ? '绒岚' : '？？？'}</b><small>{save.sightings > 0 ? `MIST_PORT_SPIRIT_01 · ${save.companion ? '已共鸣' : `未共鸣 · 目击 ${save.sightings}/3`}` : '尚未见过'}</small></article><article><div className="rare-mini">稀</div><b>{save.rareSeen ? '未记录稀客' : '？？？'}</b><small>{save.rareSeen ? `未共鸣 · 线索${save.episodeState.ep09.rareClueCount}/3` : '尚未见过'}</small></article><article><div className="sky-mini">翼</div><b>天空剪影</b><small>{save.episodeState.ep09.skySilhouetteSeen ? 'SKY_LEGEND_01 · 已记录' : '尚未记录'}</small></article></div></section></div>; }
