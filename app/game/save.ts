import { EPISODE_CONFIG, type EpisodeId } from './episode-config';

export const SAVE_KEY = 'word-spirit-p1-save-v2';
export const LEGACY_SAVE_KEY = 'word-spirit-p0-save-v1';
export const STARTER_KEY = 'word-spirit-starter-v1';
export const SAVE_VERSION = 3;

export type StarterId = '芽语' | '烬尾' | '澜歌';
export type OpeningCheckpoint = 'harbor' | 'station' | null;
export type OpeningInteraction = 'luggage' | 'footprints' | null;
export type TutorialCheckpoint = 'ep1_intro' | 'ep1_lesson' | 'ep1_outro' | null;
export type MonumentFace = 'front' | 'back' | null;
export type TrackingSlotId = 'tracking_01' | 'tracking_02' | 'tracking_03';
export type ApproachStage = 0 | 1 | 2 | 3;
export type BossPhase = 0 | 1 | 2 | 3;

export type TrackingSlotState = {
  completed: boolean;
  englishActionCount: number;
};

export type EpisodePersistentState = {
  ep05: {
    sightings: number;
    battleCompleted: boolean;
  };
  ep06: {
    approachStage: ApproachStage;
    companionId: string | null;
    acquired: boolean;
    resonanceConfirmed: boolean;
    teamSpiritIds: string[];
  };
  ep07: {
    swapUsed: boolean;
    swapCooldownRemaining: number;
    battleCompleted: boolean;
  };
  ep08: {
    monumentFace: MonumentFace;
    residueRecorded: boolean;
    positionRecorded: boolean;
    arenaUnlocked: boolean;
    arenaSnapshotCompleted: boolean;
  };
  ep09: {
    tracking: Record<TrackingSlotId, TrackingSlotState>;
    rareClueCount: 0 | 1 | 2 | 3;
    rareSeen: boolean;
    skySilhouetteSeen: boolean;
  };
  ep10: {
    bossPhase: BossPhase;
    bossDefeated: boolean;
    hookFlags: {
      starterEvolution: boolean;
      rareSpirit: boolean;
      skyLegend: boolean;
    };
  };
};

/**
 * Versioned save shape. The first fields intentionally mirror the current
 * page-level save so existing v1/v2 data can be read without a reset.
 */
export type GameSave = {
  saveVersion: number;
  starter: StarterId | null;
  completed: EpisodeId[];
  exploration: number;
  sightings: number;
  companion: boolean;
  arenaDone: boolean;
  rareSeen: boolean;
  checkpoint: TutorialCheckpoint;
  ep1TutorialIndex: number;
  openingCheckpoint: OpeningCheckpoint;
  openingIndex: number;
  openingInteraction: OpeningInteraction;
  episodeState: EpisodePersistentState;
};

const EMPTY_TRACKING: Record<TrackingSlotId, TrackingSlotState> = {
  tracking_01: { completed: false, englishActionCount: 0 },
  tracking_02: { completed: false, englishActionCount: 0 },
  tracking_03: { completed: false, englishActionCount: 0 },
};

export function createEmptySave(): GameSave {
  return {
    saveVersion: SAVE_VERSION,
    starter: null,
    completed: [],
    exploration: 0,
    sightings: 0,
    companion: false,
    arenaDone: false,
    rareSeen: false,
    checkpoint: null,
    ep1TutorialIndex: 0,
    openingCheckpoint: 'harbor',
    openingIndex: 0,
    openingInteraction: null,
    episodeState: {
      ep05: { sightings: 0, battleCompleted: false },
      ep06: {
        approachStage: 0,
        companionId: null,
        acquired: false,
        resonanceConfirmed: false,
        teamSpiritIds: [],
      },
      ep07: { swapUsed: false, swapCooldownRemaining: 0, battleCompleted: false },
      ep08: {
        monumentFace: null,
        residueRecorded: false,
        positionRecorded: false,
        arenaUnlocked: false,
        arenaSnapshotCompleted: false,
      },
      ep09: {
        tracking: cloneTracking(),
        rareClueCount: 0,
        rareSeen: false,
        skySilhouetteSeen: false,
      },
      ep10: {
        bossPhase: 0,
        bossDefeated: false,
        hookFlags: { starterEvolution: false, rareSpirit: false, skyLegend: false },
      },
    },
  };
}

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function cloneTracking(): Record<TrackingSlotId, TrackingSlotState> {
  return {
    tracking_01: { ...EMPTY_TRACKING.tracking_01 },
    tracking_02: { ...EMPTY_TRACKING.tracking_02 },
    tracking_03: { ...EMPTY_TRACKING.tracking_03 },
  };
}

function storageOrNull(storage?: StorageLike): StorageLike | null {
  if (storage) return storage;
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

function isStarter(value: unknown): value is StarterId {
  return value === '芽语' || value === '烬尾' || value === '澜歌';
}

function isEpisodeId(value: unknown): value is EpisodeId {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 10;
}

function numberOr(value: unknown, fallback: number, minimum = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(minimum, value) : fallback;
}

function booleanOr(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function migrateTracking(value: unknown): Record<TrackingSlotId, TrackingSlotState> {
  const input = value && typeof value === 'object' ? value as Partial<Record<TrackingSlotId, Partial<TrackingSlotState>>> : {};
  const result = cloneTracking();
  (Object.keys(result) as TrackingSlotId[]).forEach((slotId) => {
    const slot = input[slotId];
    if (!slot) return;
    result[slotId] = {
      completed: booleanOr(slot.completed, false),
      // The runtime enforces one necessary English action per tracking point.
      englishActionCount: Math.min(1, Math.floor(numberOr(slot.englishActionCount, 0))),
    };
  });
  return result;
}

function migrateEpisodeState(value: unknown, legacy: Record<string, unknown>): EpisodePersistentState {
  const input = value && typeof value === 'object' ? value as Partial<EpisodePersistentState> : {};
  const ep05Input = input.ep05 ?? {};
  const ep06Input = input.ep06 ?? {};
  const ep07Input = input.ep07 ?? {};
  const ep08Input = input.ep08 ?? {};
  const ep09Input = input.ep09 ?? {};
  const ep10Input = input.ep10 ?? {};
  const legacyCompanion = booleanOr(legacy.companion, false);
  const legacySightings = Math.min(3, Math.floor(numberOr(legacy.sightings, 0)));
  const companionId = stringOrNull(ep06Input.companionId) ?? (legacyCompanion ? 'MIST_PORT_SPIRIT_01' : null);
  const acquired = booleanOr(ep06Input.acquired, legacyCompanion) || companionId !== null;
  const starter = isStarter(legacy.starter) ? legacy.starter : null;
  const legacyTeam = Array.isArray(ep06Input.teamSpiritIds)
    ? ep06Input.teamSpiritIds.filter((id): id is string => typeof id === 'string')
    : [];
  const teamSpiritIds = acquired
    ? Array.from(new Set([...(starter ? [starter] : []), ...legacyTeam, 'MIST_PORT_SPIRIT_01']))
    : legacyTeam;
  const rareSeen = booleanOr(ep09Input.rareSeen, booleanOr(legacy.rareSeen, false));

  return {
    ep05: {
      sightings: Math.max(legacySightings, Math.min(3, Math.floor(numberOr(ep05Input.sightings, 0)))),
      battleCompleted: booleanOr(ep05Input.battleCompleted, false),
    },
    ep06: {
      approachStage: Math.min(3, Math.max(0, Math.floor(numberOr(ep06Input.approachStage, acquired ? 3 : 0)))) as ApproachStage,
      companionId,
      acquired,
      resonanceConfirmed: booleanOr(ep06Input.resonanceConfirmed, acquired),
      teamSpiritIds,
    },
    ep07: {
      swapUsed: booleanOr(ep07Input.swapUsed, false),
      swapCooldownRemaining: Math.floor(numberOr(ep07Input.swapCooldownRemaining, 0)),
      battleCompleted: booleanOr(ep07Input.battleCompleted, false),
    },
    ep08: {
      monumentFace: ep08Input.monumentFace === 'front' || ep08Input.monumentFace === 'back' ? ep08Input.monumentFace : null,
      residueRecorded: booleanOr(ep08Input.residueRecorded, false),
      positionRecorded: booleanOr(ep08Input.positionRecorded, false),
      arenaUnlocked: booleanOr(ep08Input.arenaUnlocked, booleanOr(legacy.arenaDone, false)),
      arenaSnapshotCompleted: booleanOr(ep08Input.arenaSnapshotCompleted, booleanOr(legacy.arenaDone, false)),
    },
    ep09: {
      tracking: migrateTracking(ep09Input.tracking),
      rareClueCount: Math.min(3, Math.max(0, Math.floor(numberOr(ep09Input.rareClueCount, rareSeen ? 1 : 0)))) as 0 | 1 | 2 | 3,
      rareSeen,
      skySilhouetteSeen: booleanOr(ep09Input.skySilhouetteSeen, rareSeen),
    },
    ep10: {
      bossPhase: Math.min(3, Math.max(0, Math.floor(numberOr(ep10Input.bossPhase, 0)))) as BossPhase,
      bossDefeated: booleanOr(ep10Input.bossDefeated, false),
      hookFlags: {
        starterEvolution: booleanOr(ep10Input.hookFlags?.starterEvolution, false),
        rareSpirit: booleanOr(ep10Input.hookFlags?.rareSpirit, rareSeen),
        skyLegend: booleanOr(ep10Input.hookFlags?.skyLegend, rareSeen),
      },
    },
  };
}

/** Convert either the current save shape or the older v1/v2 shape. */
export function migrateSave(raw: unknown, starterFallback: StarterId | null = null): GameSave {
  const source = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  const completed = Array.isArray(source.completed)
    ? Array.from(new Set(source.completed.filter(isEpisodeId)))
    : [];
  const starter = isStarter(source.starter) ? source.starter : starterFallback;
  const empty = createEmptySave();
  const checkpoint = source.checkpoint === 'ep1_intro' || source.checkpoint === 'ep1_lesson' || source.checkpoint === 'ep1_outro'
    ? source.checkpoint
    : null;
  const openingCheckpoint = source.openingCheckpoint === 'station' || source.openingCheckpoint === 'harbor'
    ? source.openingCheckpoint
    : starter ? null : 'harbor';
  const openingInteraction = source.openingInteraction === 'luggage' || source.openingInteraction === 'footprints'
    ? source.openingInteraction
    : null;
  const base: GameSave = {
    ...empty,
    saveVersion: SAVE_VERSION,
    starter,
    completed,
    exploration: numberOr(source.exploration, 0),
    sightings: Math.min(3, Math.floor(numberOr(source.sightings, 0))),
    companion: booleanOr(source.companion, false),
    arenaDone: booleanOr(source.arenaDone, false),
    rareSeen: booleanOr(source.rareSeen, false),
    checkpoint,
    ep1TutorialIndex: Math.min(3, Math.floor(numberOr(source.ep1TutorialIndex, 0))),
    openingCheckpoint,
    openingIndex: Math.max(0, Math.floor(numberOr(source.openingIndex, 0))),
    openingInteraction,
    episodeState: migrateEpisodeState(source.episodeState, source),
  };
  base.sightings = Math.max(base.sightings, base.episodeState.ep05.sightings);
  base.companion = base.companion || base.episodeState.ep06.acquired;
  base.rareSeen = base.rareSeen || base.episodeState.ep09.rareSeen;
  base.arenaDone = base.arenaDone || base.episodeState.ep08.arenaSnapshotCompleted;
  return base;
}

export function loadGameSave(storage?: StorageLike): GameSave {
  const store = storageOrNull(storage);
  if (!store) return createEmptySave();
  try {
    const starter = store.getItem(STARTER_KEY);
    const starterFallback = isStarter(starter) ? starter : null;
    const raw = store.getItem(SAVE_KEY) ?? store.getItem(LEGACY_SAVE_KEY);
    return migrateSave(raw ? JSON.parse(raw) : null, starterFallback);
  } catch {
    return createEmptySave();
  }
}

export function saveGameSave(save: GameSave, storage?: StorageLike): void {
  const store = storageOrNull(storage);
  if (!store) return;
  store.setItem(SAVE_KEY, JSON.stringify({ ...save, saveVersion: SAVE_VERSION }));
  if (save.starter) store.setItem(STARTER_KEY, save.starter);
}

export function clearGameSave(storage?: StorageLike): void {
  const store = storageOrNull(storage);
  if (!store) return;
  store.removeItem(SAVE_KEY);
  store.removeItem(LEGACY_SAVE_KEY);
  store.removeItem(STARTER_KEY);
}

export function isEpisodeCompleted(save: GameSave, episode: EpisodeId): boolean {
  return save.completed.includes(episode);
}

export function isEpisodeUnlocked(save: GameSave, episode: EpisodeId): boolean {
  if (isEpisodeCompleted(save, episode)) return true;
  const condition = EPISODE_CONFIG[episode].unlock;
  if (condition.previousEpisode && !isEpisodeCompleted(save, condition.previousEpisode)) return false;
  if (condition.explorationAtLeast !== undefined && save.exploration < condition.explorationAtLeast) return false;
  if (condition.sightingsAtLeast !== undefined && save.sightings < condition.sightingsAtLeast) return false;
  if (condition.requiredCompanion && !save.episodeState.ep06.teamSpiritIds.includes(condition.requiredCompanion)) return false;
  return true;
}

export function completeEpisode(save: GameSave, episode: EpisodeId): GameSave {
  const next: GameSave = {
    ...save,
    completed: Array.from(new Set([...save.completed, episode])).sort((a, b) => a - b) as EpisodeId[],
    episodeState: {
      ...save.episodeState,
      ep05: { ...save.episodeState.ep05 },
      ep06: { ...save.episodeState.ep06, teamSpiritIds: [...save.episodeState.ep06.teamSpiritIds] },
      ep07: { ...save.episodeState.ep07 },
      ep08: { ...save.episodeState.ep08 },
      ep09: { ...save.episodeState.ep09, tracking: migrateTracking(save.episodeState.ep09.tracking) },
      ep10: { ...save.episodeState.ep10, hookFlags: { ...save.episodeState.ep10.hookFlags } },
    },
  };
  const effects = EPISODE_CONFIG[episode].completionEffects;
  if (episode === 1) {
    next.checkpoint = null;
    next.ep1TutorialIndex = 3;
  }
  if (effects.sightingsAtLeast !== undefined) {
    next.sightings = Math.max(next.sightings, effects.sightingsAtLeast);
    next.episodeState.ep05.sightings = Math.max(next.episodeState.ep05.sightings, effects.sightingsAtLeast);
  }
  if (effects.companionId) {
    next.companion = true;
    next.episodeState.ep06.companionId = effects.companionId;
    next.episodeState.ep06.acquired = true;
    next.episodeState.ep06.resonanceConfirmed = true;
    next.episodeState.ep06.approachStage = 3;
    next.episodeState.ep06.teamSpiritIds = Array.from(new Set([...(next.starter ? [next.starter] : []), ...next.episodeState.ep06.teamSpiritIds, effects.companionId]));
  }
  if (episode === 5) next.episodeState.ep05.battleCompleted = true;
  if (episode === 7) next.episodeState.ep07.battleCompleted = true;
  if (episode === 8) next.episodeState.ep08.arenaUnlocked = true;
  if (episode === 9) {
    next.rareSeen = true;
    next.episodeState.ep09.rareSeen = true;
    next.episodeState.ep09.rareClueCount = Math.max(next.episodeState.ep09.rareClueCount, 1) as 0 | 1 | 2 | 3;
  }
  return next;
}

export function setEp05Sightings(save: GameSave, sightings: number): GameSave {
  const value = Math.min(3, Math.max(0, Math.floor(sightings)));
  return { ...save, sightings: Math.max(save.sightings, value), episodeState: { ...save.episodeState, ep05: { ...save.episodeState.ep05, sightings: Math.max(save.episodeState.ep05.sightings, value) } } };
}

export function setEp06ApproachStage(save: GameSave, stage: ApproachStage): GameSave {
  return { ...save, episodeState: { ...save.episodeState, ep06: { ...save.episodeState.ep06, approachStage: Math.max(save.episodeState.ep06.approachStage, stage) as ApproachStage } } };
}

export function confirmEp06Companion(save: GameSave, companionId = 'MIST_PORT_SPIRIT_01'): GameSave {
  const teamSpiritIds = Array.from(new Set([...(save.starter ? [save.starter] : []), ...save.episodeState.ep06.teamSpiritIds, companionId]));
  return {
    ...save,
    companion: true,
    episodeState: {
      ...save.episodeState,
      ep06: { ...save.episodeState.ep06, approachStage: 3, companionId, acquired: true, resonanceConfirmed: true, teamSpiritIds },
    },
  };
}

export function recordEp07Swap(save: GameSave, cooldown = 1): GameSave {
  return { ...save, episodeState: { ...save.episodeState, ep07: { ...save.episodeState.ep07, swapUsed: true, swapCooldownRemaining: Math.max(0, Math.floor(cooldown)) } } };
}

export function tickEp07SwapCooldown(save: GameSave): GameSave {
  return { ...save, episodeState: { ...save.episodeState, ep07: { ...save.episodeState.ep07, swapCooldownRemaining: Math.max(0, save.episodeState.ep07.swapCooldownRemaining - 1) } } };
}

export function setEp08MonumentFace(save: GameSave, face: Exclude<MonumentFace, null>): GameSave {
  return { ...save, episodeState: { ...save.episodeState, ep08: { ...save.episodeState.ep08, monumentFace: face } } };
}

export function recordEp08Clue(save: GameSave, clue: 'residue' | 'position'): GameSave {
  return { ...save, episodeState: { ...save.episodeState, ep08: { ...save.episodeState.ep08, residueRecorded: clue === 'residue' ? true : save.episodeState.ep08.residueRecorded, positionRecorded: clue === 'position' ? true : save.episodeState.ep08.positionRecorded } } };
}

export function unlockEp08Arena(save: GameSave): GameSave {
  return { ...save, episodeState: { ...save.episodeState, ep08: { ...save.episodeState.ep08, arenaUnlocked: true } } };
}

export function completeEp08ArenaSnapshot(save: GameSave): GameSave {
  return { ...save, arenaDone: true, episodeState: { ...save.episodeState, ep08: { ...save.episodeState.ep08, arenaUnlocked: true, arenaSnapshotCompleted: true } } };
}

export function recordEp09TrackingAction(save: GameSave, slotId: TrackingSlotId): GameSave {
  const slot = save.episodeState.ep09.tracking[slotId];
  if (!slot || slot.englishActionCount >= 1) return save;
  const tracking = { ...save.episodeState.ep09.tracking, [slotId]: { completed: true, englishActionCount: 1 } };
  return { ...save, episodeState: { ...save.episodeState, ep09: { ...save.episodeState.ep09, tracking } } };
}

export function setEp09RareClueCount(save: GameSave, count: 0 | 1 | 2 | 3): GameSave {
  const rareClueCount = Math.max(save.episodeState.ep09.rareClueCount, count) as 0 | 1 | 2 | 3;
  return { ...save, episodeState: { ...save.episodeState, ep09: { ...save.episodeState.ep09, rareClueCount, rareSeen: rareClueCount > 0 || save.episodeState.ep09.rareSeen } }, rareSeen: save.rareSeen || rareClueCount > 0 };
}

export function recordEp09SkySilhouette(save: GameSave): GameSave {
  return { ...save, episodeState: { ...save.episodeState, ep09: { ...save.episodeState.ep09, skySilhouetteSeen: true } } };
}

export function setEp10BossPhase(save: GameSave, phase: BossPhase): GameSave {
  return { ...save, episodeState: { ...save.episodeState, ep10: { ...save.episodeState.ep10, bossPhase: Math.max(save.episodeState.ep10.bossPhase, phase) as BossPhase } } };
}

export function markEp10BossDefeated(save: GameSave): GameSave {
  return { ...save, episodeState: { ...save.episodeState, ep10: { ...save.episodeState.ep10, bossPhase: 3, bossDefeated: true, hookFlags: { starterEvolution: true, rareSpirit: true, skyLegend: true } } } };
}
