/**
 * Small, local-only battle event log for manual gameplay review.
 *
 * This module deliberately has no dependency on React, the narrative layer,
 * analytics, or the battle reducer. Callers can append one structured event
 * after each meaningful battle transition and inspect the result later from
 * the development panel. It is safe to import during SSR: server calls are
 * treated as no-ops and never attempt to touch localStorage.
 */

export type BattleLogQuestionResult = 'correct' | 'incorrect' | 'skipped' | 'unanswered';
export type BattleLogBattleResult = 'start' | 'turn' | 'victory' | 'defeat' | 'aborted';
export type BattleLogEnemyAttackKind = 'normal' | 'heavy' | 'none';

export type BattleLogSwap = {
  from: string;
  to: string;
  reason?: string;
};

export type BattleLogEvent = {
  id: string;
  battleId: string;
  recordedAt: number;
  turn?: number;
  activeSpirit?: string;
  enemyAttackKind?: BattleLogEnemyAttackKind;
  swap?: BattleLogSwap;
  shield?: number;
  reduction?: number;
  questionResult?: BattleLogQuestionResult;
  wordId?: string;
  damageTaken?: number;
  damageDealt?: number;
  battleResult?: BattleLogBattleResult;
};

export type BattleLogEventInput = Omit<BattleLogEvent, 'id' | 'recordedAt'> & {
  /** Optional timestamp is useful for deterministic local testing. */
  recordedAt?: number;
};

export const BATTLE_LOG_STORAGE_KEY = 'word-spirit-battle-log-v1';
export const BATTLE_LOG_MAX_ENTRIES = 300;

function hasStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function makeId(timestamp: number): string {
  // Date plus a counter is enough for a local review log and also works in
  // browsers where crypto.randomUUID is unavailable.
  const suffix = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Math.random().toString(36).slice(2)}-${timestamp}`;
  return `battle-${timestamp}-${suffix}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function finiteOrUndefined(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function normalizeEvent(value: unknown): BattleLogEvent | null {
  if (!isRecord(value) || typeof value.battleId !== 'string' || value.battleId.length === 0) {
    return null;
  }

  const recordedAt = finiteOrUndefined(value.recordedAt) ?? Date.now();
  const event: BattleLogEvent = {
    id: typeof value.id === 'string' && value.id.length > 0 ? value.id : makeId(recordedAt),
    battleId: value.battleId,
    recordedAt,
  };

  const turn = finiteOrUndefined(value.turn);
  if (turn !== undefined) event.turn = Math.max(0, Math.floor(turn));
  if (typeof value.activeSpirit === 'string') event.activeSpirit = value.activeSpirit;
  if (value.enemyAttackKind === 'normal' || value.enemyAttackKind === 'heavy' || value.enemyAttackKind === 'none') {
    event.enemyAttackKind = value.enemyAttackKind;
  }

  if (isRecord(value.swap) && typeof value.swap.from === 'string' && typeof value.swap.to === 'string') {
    event.swap = {
      from: value.swap.from,
      to: value.swap.to,
      ...(typeof value.swap.reason === 'string' ? { reason: value.swap.reason } : {}),
    };
  }

  const shield = finiteOrUndefined(value.shield);
  if (shield !== undefined) event.shield = Math.max(0, shield);
  const reduction = finiteOrUndefined(value.reduction);
  if (reduction !== undefined) event.reduction = Math.max(0, reduction);
  const damageTaken = finiteOrUndefined(value.damageTaken);
  if (damageTaken !== undefined) event.damageTaken = Math.max(0, damageTaken);
  const damageDealt = finiteOrUndefined(value.damageDealt);
  if (damageDealt !== undefined) event.damageDealt = Math.max(0, damageDealt);

  if (
    value.questionResult === 'correct'
    || value.questionResult === 'incorrect'
    || value.questionResult === 'skipped'
    || value.questionResult === 'unanswered'
  ) {
    event.questionResult = value.questionResult;
  }
  if (typeof value.wordId === 'string') event.wordId = value.wordId;
  if (
    value.battleResult === 'start'
    || value.battleResult === 'turn'
    || value.battleResult === 'victory'
    || value.battleResult === 'defeat'
    || value.battleResult === 'aborted'
  ) {
    event.battleResult = value.battleResult;
  }

  return event;
}

function readAll(): BattleLogEvent[] {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(BATTLE_LOG_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeEvent).filter((event): event is BattleLogEvent => event !== null).slice(-BATTLE_LOG_MAX_ENTRIES);
  } catch {
    // A malformed or unavailable local log must never block the game.
    return [];
  }
}

function writeAll(events: readonly BattleLogEvent[]): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(BATTLE_LOG_STORAGE_KEY, JSON.stringify(events.slice(-BATTLE_LOG_MAX_ENTRIES)));
  } catch {
    // Quota/security errors are intentionally ignored: this is debug-only data.
  }
}

/** Append one event and return the normalized event that was stored. */
export function appendBattleLog(input: BattleLogEventInput): BattleLogEvent {
  const recordedAt = input.recordedAt ?? Date.now();
  const event = normalizeEvent({ ...input, recordedAt, id: makeId(recordedAt) });
  if (!event) throw new Error('Battle log events require a non-empty battleId');
  const events = readAll();
  events.push(event);
  writeAll(events);
  return event;
}

/** Read the newest local events, optionally limited to one battle. */
export function getBattleLogs(battleId?: string): BattleLogEvent[] {
  const events = readAll();
  return (battleId ? events.filter(event => event.battleId === battleId) : events).slice();
}

/** Remove all local battle-review events. Does not touch game saves or analytics. */
export function clearBattleLogs(): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.removeItem(BATTLE_LOG_STORAGE_KEY);
  } catch {
    // Ignore unavailable storage; clearing debug data is best effort.
  }
}

