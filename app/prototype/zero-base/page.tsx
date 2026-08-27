'use client';
/* eslint-disable react-hooks/set-state-in-effect -- restore the prototype-only local save after client hydration */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  createZeroBaseProgress,
  loadZeroBaseProgress,
  recordTeachingEvidence,
  resetZeroBaseProgress,
  saveZeroBaseProgress,
  type ZeroBaseProgress,
  ZERO_BASE_RULES,
  ZERO_BASE_WORDS,
} from '../../game/zero-base-teaching';

type Step =
  | 'arrival' | 'people_hotspot' | 'people_label' | 'water_hotspot' | 'water_label'
  | 'need_event' | 'need_label' | 'need_build' | 'need_action'
  | 'choose_label' | 'choose_guided' | 'choose_retrieved'
  | 'help_label' | 'help_action' | 'rest'
  | 'final_need' | 'final_choose' | 'final_help' | 'complete';

const STEP_ORDER: readonly Step[] = [
  'arrival', 'people_hotspot', 'people_label', 'water_hotspot', 'water_label',
  'need_event', 'need_label', 'need_build', 'need_action',
  'choose_label', 'choose_guided', 'choose_retrieved',
  'help_label', 'help_action', 'rest', 'final_need', 'final_choose', 'final_help', 'complete',
];

const WORDS = Object.fromEntries(ZERO_BASE_WORDS.map(item => [item.word, item])) as Record<(typeof ZERO_BASE_WORDS)[number]['word'], (typeof ZERO_BASE_WORDS)[number]>;

function speak(word: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'en-US';
  utterance.rate = 0.82;
  window.speechSynthesis.speak(utterance);
}

function WordLabel({ word }: { word: keyof typeof WORDS }) {
  const item = WORDS[word];
  return <div className="zb-word-label" role="status">
    <button aria-label={`播放 ${item.word}`} onClick={() => speak(item.word)}>🔊</button>
    <strong>{item.word}</strong>
    <span>{item.targetGloss}</span>
  </div>;
}

function PeopleGroup({ pulse = false }: { pulse?: boolean }) {
  return <div className={`zb-people ${pulse ? 'pulse' : ''}`} aria-label="等水的人们">
    <i /><i /><i />
  </div>;
}

function Bucket({ full = false, pulse = false, onClick }: { full?: boolean; pulse?: boolean; onClick?: () => void }) {
  const Tag = onClick ? 'button' : 'div';
  return <Tag className={`zb-bucket ${full ? 'full' : ''} ${pulse ? 'pulse' : ''}`} onClick={onClick} aria-label={full ? '装有水的水桶' : '空水桶'}>
    <i /><span>{full ? '水' : ''}</span>
  </Tag>;
}

function ChoiceObjects({ onWater, wrong }: { onWater: () => void; wrong: () => void }) {
  return <div className="zb-objects">
    <button onClick={onWater} aria-label="选择水桶"><Bucket full /></button>
    <button onClick={wrong} aria-label="选择绳筐"><span className="zb-basket">绳</span></button>
  </div>;
}

export default function ZeroBaseTeachingPrototypePage() {
  const [progress, setProgress] = useState<ZeroBaseProgress>(() => createZeroBaseProgress());
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState<Step>('arrival');
  const [feedback, setFeedback] = useState('');
  const [helpLayer, setHelpLayer] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [worldPulse, setWorldPulse] = useState(false);
  const [mustRetry, setMustRetry] = useState(false);

  useEffect(() => {
    const stored = loadZeroBaseProgress();
    const storedStep = STEP_ORDER.includes(stored.currentStep as Step) ? stored.currentStep as Step : 'arrival';
    setProgress(stored);
    setStep(storedStep);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const next = { ...progress, currentStep: step };
    saveZeroBaseProgress(next);
  }, [ready, step, progress]);

  useEffect(() => {
    if (step !== 'rest') return;
    const timer = window.setTimeout(() => setStep('final_need'), ZERO_BASE_RULES.restAfterHelpMs);
    return () => window.clearTimeout(timer);
  }, [step]);

  const completedCount = useMemo(() => Object.values(progress.stages).filter(value => value === 'used' || value === 'maintained').length, [progress.stages]);

  function advance(next: Step) {
    setFeedback('');
    setHelpLayer(0);
    setWorldPulse(false);
    setStep(next);
  }

  function evidence(word: keyof typeof WORDS, stage: 'introduced' | 'guided' | 'retrieved' | 'used', eventId: string, support: 0 | 1 | 2 | 3 | 4) {
    setProgress(current => recordTeachingEvidence(current, word, stage, eventId, support));
  }

  function introduce(word: keyof typeof WORDS, next: Step) {
    evidence(word, 'introduced', `introduce_${word}`, 2);
    speak(word);
    advance(next);
  }

  function wrongChoice() {
    setFeedback('它不是现在需要的。再看看场景。');
    setWorldPulse(true);
    window.setTimeout(() => setWorldPulse(false), 900);
  }

  function resolveNeed() {
    const support = helpLayer;
    if (mustRetry || support === 0) {
      evidence('people', 'retrieved', 'final_need_retrieval', 0);
      evidence('need', 'retrieved', 'final_need_retrieval', 0);
      evidence('water', 'used', 'final_need_water_action', 0);
    } else {
      evidence('need', 'guided', 'final_need_supported', support);
      evidence('water', 'guided', 'final_need_supported', support);
    }
    setMustRetry(false);
    advance('final_choose');
  }

  function requestHelp() {
    if (helpLayer === 0) {
      setWorldPulse(true);
      setFeedback('看看：人们在等，桶是空的。');
      window.setTimeout(() => setWorldPulse(false), 1100);
      setHelpLayer(1);
      return;
    }
    setHelpLayer(current => Math.min(4, current + 1) as 1 | 2 | 3 | 4);
    setFeedback('');
  }

  function reset() {
    resetZeroBaseProgress();
    setProgress(createZeroBaseProgress());
    setStep('arrival');
    setHelpLayer(0);
    setFeedback('');
    setMustRetry(false);
  }

  if (!ready) return <main className="zb-shell"><div className="zb-loading">正在准备场景…</div></main>;

  return <main className="zb-shell">
    <header className="zb-topbar">
      <div><span>独立教学母版 · V1</span><b>水桶边的小事</b></div>
      <div className="zb-tools"><small>{completedCount}/5 已用于行动</small><button onClick={reset}>重新开始</button></div>
    </header>

    <section className="zb-stage" aria-live="polite">
      <div className="zb-scene">
        <div className="zb-harbor-bg"><i /><i /><i /></div>
        <PeopleGroup pulse={worldPulse || step === 'people_hotspot'} />
        <Bucket pulse={worldPulse || step === 'water_hotspot'} full={step === 'help_action' || step === 'rest' || step === 'final_choose' || step === 'final_help' || step === 'complete'} />
        <div className={`zb-spirit ${step === 'help_action' || step === 'rest' || step === 'complete' ? 'move' : ''}`} aria-hidden="true">灵</div>
        {step === 'people_hotspot' && <button className="zb-hotspot people" onClick={() => introduce('people', 'people_label')}>看看那边</button>}
        {step === 'water_hotspot' && <button className="zb-hotspot water" onClick={() => introduce('water', 'water_label')}>看看水桶</button>}
      </div>

      <div className="zb-story-card">
        {step === 'arrival' && <><span className="zb-kicker">港边 · 上午</span><h1>一件很小的事</h1><p>几个人在棚边等着。乔姨正清点刚送来的东西。</p><button className="zb-primary" onClick={() => advance('people_hotspot')}>走近看看</button></>}

        {step === 'people_hotspot' && <><h2>棚边有人在等。</h2><p>点一下场景里的提示。</p></>}
        {step === 'people_label' && <><WordLabel word="people" /><p>眼前这些人，英语可以叫 <b>people</b>。</p><button className="zb-primary" onClick={() => advance('water_hotspot')}>继续</button></>}
        {step === 'water_hotspot' && <><h2>墙边放着一个水桶。</h2><p>桶口晃了一下微光。</p></>}
        {step === 'water_label' && <><WordLabel word="water" /><p>桶里装的是 <b>water</b>。</p><button className="zb-primary" onClick={() => advance('need_event')}>继续</button></>}

        {step === 'need_event' && <><span className="zb-speaker">乔姨</span><h2>“那边还缺水。”</h2><p>有人看向空容器，又看了看水桶。</p><button className="zb-primary" onClick={() => introduce('need', 'need_label')}>看看发生了什么</button></>}
        {step === 'need_label' && <><WordLabel word="need" /><p>缺少、想要得到，可以说 <b>need</b>。</p><button className="zb-primary" onClick={() => advance('need_build')}>把它们放在一起</button></>}
        {step === 'need_build' && <><div className="zb-word-build"><b>people</b><i>+</i><strong>need</strong><i>+</i><b>water</b></div><h2 className="zb-sentence">People need water.</h2><div className="zb-segment-cn"><span>人们</span><span>需要</span><span>水</span></div><button className="zb-primary" onClick={() => advance('need_action')}>我来拿给他们</button></>}
        {step === 'need_action' && <><h2>他们需要什么？</h2><p>不要翻译整句，看看场景，点你要拿的东西。</p><ChoiceObjects onWater={() => { evidence('people', 'guided', 'need_action', 3); evidence('need', 'guided', 'need_action', 3); evidence('water', 'guided', 'need_action', 3); advance('choose_label'); }} wrong={wrongChoice} />{feedback && <em className="zb-feedback">{feedback}</em>}</>}

        {step === 'choose_label' && <><span className="zb-speaker">乔姨</span><h2>“拿哪个？”</h2><WordLabel word="choose" /><button className="zb-primary" onClick={() => advance('choose_guided')}>试着选一次</button></>}
        {step === 'choose_guided' && <><h2 className="zb-action-word">choose water</h2><ChoiceObjects onWater={() => { evidence('choose', 'guided', 'choose_water_guided', 2); evidence('water', 'retrieved', 'choose_water_guided', 0); advance('choose_retrieved'); }} wrong={wrongChoice} />{feedback && <em className="zb-feedback">{feedback}</em>}</>}
        {step === 'choose_retrieved' && <><p>乔姨又把两样东西放回原处。</p><h2 className="zb-action-word">choose</h2><ChoiceObjects onWater={() => { evidence('choose', 'retrieved', 'choose_independent', 0); evidence('choose', 'used', 'choose_independent_action', 0); advance('help_label'); }} wrong={wrongChoice} />{feedback && <em className="zb-feedback">{feedback}</em>}</>}

        {step === 'help_label' && <><span className="zb-speaker">乔姨</span><h2>“搭把手？”</h2><WordLabel word="help" /><button className="zb-primary" onClick={() => advance('help_action')}>继续</button></>}
        {step === 'help_action' && <><h2 className="zb-action-word">help</h2><p>让同行语灵把水送过去。</p><button className="zb-primary action" onClick={() => { evidence('help', 'guided', 'help_guided_action', 2); evidence('water', 'used', 'deliver_water', 0); advance('rest'); }}>help</button></>}
        {step === 'rest' && <div className="zb-rest"><span>乔姨接过水桶。</span><h2>“谢谢。”</h2><p>同行语灵轻轻退回你身边。</p></div>}

        {step === 'final_need' && <><span className="zb-kicker">过了一会儿</span><h2 className="zb-sentence clickable"><button onClick={() => { setHelpLayer(Math.max(1, helpLayer) as 1 | 2 | 3 | 4); speak('people'); }}>People</button> <button onClick={() => { setHelpLayer(Math.max(1, helpLayer) as 1 | 2 | 3 | 4); speak('need'); }}>need</button> <button onClick={() => { setHelpLayer(Math.max(1, helpLayer) as 1 | 2 | 3 | 4); speak('water'); }}>water.</button></h2>
          {helpLayer === 1 && <div className="zb-help-box"><b>点词求助</b><p>people → 人们　 need → 需要　 water → 水</p></div>}
          {helpLayer === 2 && <div className="zb-help-box"><b>拆开看看</b><p>People / need / water</p><p>人们 / 需要 / 水</p></div>}
          {helpLayer === 3 && <div className="zb-help-box full"><b>整句意思</b><p>People need water.</p><strong>人们需要水。</strong><button onClick={() => { setHelpLayer(0); setMustRetry(true); setFeedback('中文已收起。现在再亲手做一次。'); }}>收起中文，再做一次</button></div>}
          {helpLayer === 4 && null}
          <div className="zb-final-actions"><button disabled={helpLayer === 3} onClick={resolveNeed}><Bucket full /><span>拿水过去</span></button><button disabled={helpLayer === 3} onClick={wrongChoice}><span className="zb-basket">绳</span><span>拿绳筐过去</span></button></div>
          {helpLayer < 3 && <button className="zb-help" onClick={requestHelp}>{helpLayer === 0 ? '我还不确定' : helpLayer === 1 ? '再拆开一点' : '告诉我整句意思'}</button>}
          {feedback && <em className="zb-feedback">{feedback}</em>}
        </>}
        {step === 'final_choose' && <><h2 className="zb-action-word">choose water</h2><p className="zb-world-only">场景会提醒你，但不自动翻译。</p><ChoiceObjects onWater={() => { evidence('choose', 'used', 'final_choose', 0); evidence('water', 'used', 'final_choose', 0); advance('final_help'); }} wrong={wrongChoice} />{feedback && <em className="zb-feedback">{feedback}</em>}<button className="zb-help" onClick={() => { setWorldPulse(true); setFeedback('水桶轻轻晃了一下。'); window.setTimeout(() => setWorldPulse(false), 1000); }}>看看场景</button></>}
        {step === 'final_help' && <><PeopleGroup /><h2 className="zb-action-word">help people</h2><button className="zb-primary action" onClick={() => { evidence('help', 'retrieved', 'final_help', 0); evidence('people', 'used', 'final_help', 0); evidence('help', 'used', 'final_help', 0); setProgress(current => ({ ...current, completedAt: Date.now() })); advance('complete'); }}>help people</button></>}

        {step === 'complete' && <><span className="zb-kicker">事情做完了</span><h1>你刚刚读懂了三句英语。</h1><div className="zb-complete-lines"><b>People need water.</b><b>choose water</b><b>help people</b></div><p>没有单词卡结算。你看懂它们，然后让场景继续了。</p><div className="zb-complete-actions"><Link className="zb-primary" href="/prototype/fusion-slice">带着已学词进入测试战斗</Link><button className="zb-help" onClick={reset}>从头再玩一次</button></div></>}
      </div>
    </section>

    <footer className="zb-dev-progress">
      <span>本地过程记录</span>
      {ZERO_BASE_WORDS.map(word => <b key={word.wordId}>{word.word}<em>{progress.stages[word.wordId]}</em></b>)}
    </footer>
  </main>;
}
