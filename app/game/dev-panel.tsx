'use client';

import { useState } from 'react';
import {
  DEV_PRESET_TARGETS,
  createDevCleanSave,
  createDevEntryPreset,
  createDevPreset,
  patchDevSave,
  type DevEntryKind,
  type DevPresetResult,
  type DevPresetTarget,
} from './dev-presets';
import type { GameSave } from './save';
import { clearBattleLogs, getBattleLogs, type BattleLogEvent } from './battle-log';

type Props = {
  save: GameSave;
  onApply: (result: DevPresetResult) => void;
  onReplaceSave: (save: GameSave) => void;
  onClear: () => void;
};

export function DevPanel({ save, onApply, onReplaceSave, onClear }: Props) {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<DevPresetTarget>(7);
  const [exploration, setExploration] = useState(save.exploration);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState<BattleLogEvent[]>([]);
  if (process.env.NODE_ENV !== 'development') return null;

  function run(action: () => void) {
    try { action(); setError(''); } catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)); }
  }

  function enter(kind: DevEntryKind) {
    run(() => { onApply(createDevEntryPreset(target, kind)); setOpen(false); });
  }

  return <>
    <button className="dev-panel-toggle" onClick={() => setOpen(value => !value)}>DEV</button>
    {open && <aside className="dev-panel">
      <header><b>开发测试面板</b><button onClick={() => setOpen(false)}>×</button></header>
      <small>仅development；操作不写analytics。</small>
      <div className="dev-preset-grid">{DEV_PRESET_TARGETS.map(ep => <button className={target === ep ? 'active' : ''} key={ep} onClick={() => setTarget(ep)}>EP{String(ep).padStart(2, '0')}</button>)}</div>
      <div className="dev-actions">
        <button onClick={() => run(() => onReplaceSave(createDevCleanSave()))}>新建纯净存档</button>
        <button onClick={() => run(() => onApply(createDevPreset(target)))}>生成合法前置</button>
        <button onClick={() => enter('episode')}>进入本集</button>
        <button onClick={() => enter('node')}>进入节点</button>
        <button disabled={target === 6 || target === 8} onClick={() => enter('battle')}>进入战斗</button>
      </div>
      <label>探索力 <input type="number" min="0" value={exploration} onChange={event => setExploration(Number(event.target.value))} /><button onClick={() => run(() => onReplaceSave(patchDevSave(save, { exploration })))}>应用</button></label>
      <div className="dev-actions">
        <button onClick={() => run(() => onReplaceSave(patchDevSave(save, { sightings: 3 })))}>目击=3</button>
        <button onClick={() => run(() => onReplaceSave(patchDevSave(save, { companion: true })))}>获得绒岚</button>
        <button onClick={() => run(() => onReplaceSave(patchDevSave(save, { companion: false })))}>未获得绒岚</button>
        <button onClick={() => run(() => onReplaceSave(patchDevSave(save, { monumentFace: 'both', recordMonumentClues: true })))}>碑双面+线索</button>
        <button onClick={() => run(() => onReplaceSave(patchDevSave(save, { trackingCompleted: ['tracking_01'] })))}>追踪1/3</button>
        <button onClick={() => run(() => onReplaceSave(patchDevSave(save, { trackingCompleted: ['tracking_01', 'tracking_02', 'tracking_03'] })))}>追踪3/3</button>
        {[1, 2, 3].map(phase => <button key={phase} onClick={() => run(() => onReplaceSave(patchDevSave(save, { bossPhase: phase as 1 | 2 | 3 })))}>Boss P{phase}</button>)}
      </div>
      <button className="dev-clear" onClick={onClear}>清空测试存档</button>
      <div className="dev-log-tools"><button onClick={() => setLogs(getBattleLogs().slice(-12).reverse())}>刷新战斗日志</button><button onClick={() => { clearBattleLogs(); setLogs([]); }}>清空日志</button></div>
      {logs.length > 0 && <div className="dev-battle-log">{logs.map(item => <small key={item.id}>T{item.turn ?? '-'} · {item.activeSpirit ?? '-'} · {item.enemyAttackKind ?? '-'} · {item.swap ? `换位→${item.swap.to}` : item.questionResult ?? '-'} · 造成{item.damageDealt ?? 0}/承受{item.damageTaken ?? 0} · {item.battleResult ?? '-'}</small>)}</div>}
      {error && <p>{error}</p>}
    </aside>}
  </>;
}
