/**
 * Development-only save presets for Sprint 04.
 *
 * This module is deliberately UI- and analytics-free. A development panel may
 * import it behind a production build guard, but production code should not
 * import or render that panel at all.
 */

import { EPISODE_CONFIG, type EpisodeId } from './episode-config.ts';
import {
  completeEpisode,
  confirmEp06Companion,
  createEmptySave,
  isEpisodeUnlocked,
  markEp10BossDefeated,
  migrateSave,
  recordEp08Clue,
  recordEp09SkySilhouette,
  recordEp09TrackingAction,
  setEp05Sightings,
  setEp08MonumentFace,
  setEp09RareClueCount,
  setEp10BossPhase,
  type BossPhase,
  type GameSave,
  type StarterId,
  type TrackingSlotId,
} from './save.ts';

export type DevPresetTarget = 5 | 6 | 7 | 8 | 9 | 10;
export type DevEntryKind = 'episode' | 'battle' | 'node';

export type DevPresetEntry = {
  kind: DevEntryKind;
  id: string;
};

export type DevPresetResult = {
  target: DevPresetTarget;
  save: GameSave;
  entry: DevPresetEntry;
  validation: DevPresetValidation;
};

export type DevPresetValidation = {
  valid: boolean;
  errors: string[];
};

export type DevSavePatch = {
  exploration?: number;
  sightings?: number;
  companion?: boolean;
  monumentFace?: 'front' | 'back' | 'both';
  recordMonumentClues?: boolean;
  trackingCompleted?: readonly TrackingSlotId[];
  rareClueCount?: 0 | 1 | 2 | 3;
  skySilhouetteSeen?: boolean;
  bossPhase?: BossPhase;
};

export type DevPresetOptions = {
  starter?: StarterId;
  exploration?: number;
  sightings?: number;
  companion?: boolean;
  monumentFace?: 'front' | 'back' | 'both';
  recordMonumentClues?: boolean;
  trackingCompleted?: readonly TrackingSlotId[];
  rareClueCount?: 0 | 1 | 2 | 3;
  skySilhouetteSeen?: boolean;
  bossPhase?: BossPhase;
};

export const DEV_PRESET_TARGETS: readonly DevPresetTarget[] = [5, 6, 7, 8, 9, 10];

/**
 * The minimum exploration used by the normal unlock rules for each direct
 * entry. It is intentionally not a balance setting; it only makes a test
 * save pass the same unlock checks as a real save.
 */
export const DEV_TARGET_EXPLORATION: Readonly<Record<DevPresetTarget, number>> = {
  5: 22,
  6: 22,
  7: 34,
  8: 45,
  9: 58,
  10: 72,
};

export const DEV_ENTRYPOINTS: Readonly<Record<DevPresetTarget, Readonly<Record<DevEntryKind, string | null>>>> = {
  5: { episode: 'episode.05', battle: 'battle.ep05.ink_shadow', node: 'ep05.silent_square' },
  6: { episode: 'episode.06', battle: null, node: 'ep06.companion_approach' },
  7: { episode: 'episode.07', battle: 'battle.ep07.team_test', node: 'ep07.first_team_battle' },
  8: { episode: 'episode.08', battle: null, node: 'ep08.unnamed_monument' },
  9: { episode: 'episode.09', battle: 'battle.ep09.rare_spirit_probe', node: 'ep09.rare_tracking' },
  10: { episode: 'episode.10', battle: 'battle.ep10.gatekeeper', node: 'ep10.gatekeeper' },
};

const TRACKING_SLOTS: readonly TrackingSlotId[] = ['tracking_01', 'tracking_02', 'tracking_03'];

function cloneSave(save: GameSave): GameSave {
  // Route every result through the same migration/normalization boundary used
  // by localStorage. This also prevents a preset from sharing nested objects.
  return migrateSave(JSON.parse(JSON.stringify(save)));
}

function minExplorationForCompleted(completed: readonly EpisodeId[]): number {
  let minimum = 0;
  for (const episode of completed) {
    const requirement = EPISODE_CONFIG[episode].unlock.explorationAtLeast ?? 0;
    minimum = Math.max(minimum, requirement);
  }
  return minimum;
}

function withExploration(save: GameSave, exploration: number): GameSave {
  const value = Number.isFinite(exploration) ? Math.max(0, Math.floor(exploration)) : save.exploration;
  return { ...save, exploration: Math.max(value, minExplorationForCompleted(save.completed)) };
}

function completeThrough(save: GameSave, lastEpisode: EpisodeId): GameSave {
  let next = save;
  for (let episode = 1 as EpisodeId; episode <= lastEpisode; episode = (episode + 1) as EpisodeId) {
    if (!next.completed.includes(episode)) next = completeEpisode(next, episode);
  }
  return next;
}

function seedForTarget(target: DevPresetTarget, starter: StarterId): GameSave {
  let save = createEmptySave();
  save = { ...save, starter, openingCheckpoint: null, checkpoint: null, openingInteraction: null };
  save = withExploration(save, DEV_TARGET_EXPLORATION[target]);

  if (target === 5) {
    save = completeThrough(save, 4);
    return setEp05Sightings(save, 2);
  }

  // EP05 completion is the first legal source of the third sighting.
  save = completeThrough(save, 5);
  if (target === 6) return save;

  // EP06 completion is the first legal source of the second party member.
  save = completeEpisode(confirmEp06Companion(save), 6);
  if (target === 7) return save;

  save = completeThrough(save, 7);
  if (target === 8) return save;

  // The EP08 monument is an optional-arena-independent mainline gate.
  save = setEp08MonumentFace(save, 'front');
  save = setEp08MonumentFace(save, 'back');
  save = recordEp08Clue(save, 'residue');
  save = recordEp08Clue(save, 'position');
  save = completeEpisode(save, 8);
  if (target === 9) return save;

  // EP09 requires three one-action tracking slots, but does not require the
  // optional arena snapshot.
  for (const slot of TRACKING_SLOTS) save = recordEp09TrackingAction(save, slot);
  save = setEp09RareClueCount(save, 1);
  save = recordEp09SkySilhouette(save);
  save = completeEpisode(save, 9);
  return save;
}

function applyPatchInternal(save: GameSave, patch: DevSavePatch): GameSave {
  let next = withExploration(save, patch.exploration ?? save.exploration);

  if (patch.sightings !== undefined) {
    const requested = Math.min(3, Math.max(0, Math.floor(patch.sightings)));
    next = setEp05Sightings(next, requested);
  }

  if (patch.companion === true) {
    next = confirmEp06Companion(next);
  } else if (patch.companion === false && next.episodeState.ep06.acquired) {
    if (next.completed.includes(6)) throw new Error('Cannot remove 绒岚 after EP06 completion in a safe debug save');
    next = {
      ...next,
      companion: false,
      episodeState: {
        ...next.episodeState,
        ep06: {
          ...next.episodeState.ep06,
          approachStage: 0,
          companionId: null,
          acquired: false,
          resonanceConfirmed: false,
          teamSpiritIds: next.starter ? [next.starter] : [],
        },
      },
    };
  }

  if (patch.monumentFace) {
    if (patch.monumentFace === 'both') {
      next = setEp08MonumentFace(next, 'front');
      next = setEp08MonumentFace(next, 'back');
    } else {
      next = setEp08MonumentFace(next, patch.monumentFace);
    }
  }

  if (patch.recordMonumentClues) {
    next = recordEp08Clue(next, 'residue');
    next = recordEp08Clue(next, 'position');
  }

  for (const slot of patch.trackingCompleted ?? []) next = recordEp09TrackingAction(next, slot);
  if (patch.rareClueCount !== undefined) next = setEp09RareClueCount(next, patch.rareClueCount);
  if (patch.skySilhouetteSeen) next = recordEp09SkySilhouette(next);
  if (patch.bossPhase !== undefined) next = setEp10BossPhase(next, patch.bossPhase);

  return cloneSave(next);
}

/** Make a truly clean save; pass a starter only for focused post-selection tests. */
export function createDevCleanSave(starter?: StarterId): GameSave {
  if (!starter) return cloneSave(createEmptySave());
  return cloneSave({ ...createEmptySave(), starter, openingCheckpoint: null, checkpoint: null });
}

/**
 * Apply only state changes that are reachable in a normal run. Requests that
 * would create an impossible combination are rejected instead of silently
 * manufacturing a save. The panel can show the error and offer a separate
 * explicitly-labelled unsafe tool if one is ever needed.
 */
export function patchDevSave(save: GameSave, patch: DevSavePatch): GameSave {
  const current = cloneSave(save);
  const next = applyPatchInternal(current, patch);
  const validation = validateDevSave(next);
  if (!validation.valid) throw new Error(`Invalid safe debug save: ${validation.errors.join('; ')}`);
  return next;
}

/** Create a legal pre-entry save for EP05–EP10. The target itself is open. */
export function createDevPreset(target: DevPresetTarget, options: DevPresetOptions = {}): DevPresetResult {
  const save = seedForTarget(target, options.starter ?? '芽语');
  const patched = applyPatchInternal(save, options);
  const validation = validateDevPreset(patched, target);
  if (!validation.valid) throw new Error(`Invalid debug preset EP${String(target).padStart(2, '0')}: ${validation.errors.join('; ')}`);
  const episodeEntry = DEV_ENTRYPOINTS[target].episode;
  if (!episodeEntry) throw new Error(`EP${String(target).padStart(2, '0')} has no episode entry`);
  return {
    target,
    save: patched,
    entry: { kind: 'episode', id: episodeEntry },
    validation,
  };
}

/** Create a legal preset plus an explicit episode, battle, or node entry. */
export function createDevEntryPreset(
  target: DevPresetTarget,
  kind: DevEntryKind,
  options: DevPresetOptions = {},
): DevPresetResult {
  const id = DEV_ENTRYPOINTS[target][kind];
  if (!id) throw new Error(`EP${String(target).padStart(2, '0')} has no ${kind} entry`);
  const result = createDevPreset(target, options);
  return { ...result, entry: { kind, id } };
}

/**
 * Validate a save independently of a target. This is useful for a panel that
 * exposes small controls after a preset has been created.
 */
export function validateDevSave(save: GameSave): DevPresetValidation {
  const errors: string[] = [];
  if (save.saveVersion !== 10) errors.push(`saveVersion must be 10, got ${save.saveVersion}`);
  if (!save.starter) errors.push('starter must be selected');
  // Bridge V1 keeps exploration as a readiness/tuning signal. A legal direct
  // challenge may therefore complete an episode below its recommended value.
  if (save.episodeState.ep05.sightings > 2 && !save.completed.includes(4) && !save.completed.includes(5)) {
    errors.push('the third sighting requires EP04 completion and EP05 progress');
  }
  if (save.episodeState.ep06.acquired && !save.completed.includes(5)) {
    errors.push('绒岚 cannot be acquired before EP05 completion');
  }
  if (save.completed.includes(6) && save.episodeState.ep05.sightings < 3) errors.push('EP06 completion requires 3 sightings');
  if (save.completed.includes(7) && !save.episodeState.ep06.acquired) errors.push('EP07 completion requires 绒岚');
  if (save.completed.includes(7) && save.episodeState.ep06.teamSpiritIds.length < 2) errors.push('EP07 completion requires a two-spirit team');
  if (save.completed.includes(8)) {
    const monument = save.episodeState.ep08;
    if (!monument.frontViewed || !monument.backViewed || !monument.residueRecorded || !monument.positionRecorded) {
      errors.push('EP08 completion requires both monument faces and both mainline clues');
    }
  } else if ((save.episodeState.ep08.frontViewed || save.episodeState.ep08.backViewed || save.episodeState.ep08.residueRecorded || save.episodeState.ep08.positionRecorded) && !save.completed.includes(7)) {
    errors.push('the EP08 monument cannot be touched before EP07 completion');
  }
  if (save.completed.includes(9)) {
    const trackingComplete = TRACKING_SLOTS.every((slot) => save.episodeState.ep09.tracking[slot].completed && save.episodeState.ep09.tracking[slot].englishActionCount === 1);
    if (!trackingComplete) errors.push('EP09 completion requires one action in each tracking slot');
  } else if (TRACKING_SLOTS.some((slot) => save.episodeState.ep09.tracking[slot].completed) && !save.completed.includes(8)) {
    errors.push('EP09 tracking cannot begin before EP08 completion');
  }
  if (save.episodeState.ep09.tracking && TRACKING_SLOTS.some((slot) => save.episodeState.ep09.tracking[slot].englishActionCount > 1)) {
    errors.push('EP09 tracking actions may not exceed one per slot');
  }
  if ((save.episodeState.ep09.rareClueCount > 0 || save.episodeState.ep09.rareSeen || save.episodeState.ep09.skySilhouetteSeen) && !save.completed.includes(8) && !save.completed.includes(9)) {
    errors.push('EP09 rare and sky states require EP08 completion and EP09 progress');
  }
  if (save.episodeState.ep10.bossPhase > 0 && !save.completed.includes(9) && !save.completed.includes(10)) {
    errors.push('the Boss phase cannot begin before EP09 completion');
  }
  return { valid: errors.length === 0, errors };
}

/** Validate that the requested target is unlocked and not already completed. */
export function validateDevPreset(save: GameSave, target: DevPresetTarget): DevPresetValidation {
  const base = validateDevSave(save);
  const errors = [...base.errors];
  if (save.completed.includes(target)) errors.push(`EP${String(target).padStart(2, '0')} must remain incomplete at its entry point`);
  if (save.completed.some((episode) => episode > target)) errors.push(`no episode after EP${String(target).padStart(2, '0')} may already be completed`);
  if (!isEpisodeUnlocked(save, target)) errors.push(`EP${String(target).padStart(2, '0')} is not unlocked by the normal progression rules`);
  const expectedPrevious = Array.from({ length: target - 1 }, (_, index) => index + 1) as EpisodeId[];
  for (const episode of expectedPrevious) {
    if (!save.completed.includes(episode)) errors.push(`EP${String(episode).padStart(2, '0')} must be completed before EP${String(target).padStart(2, '0')}`);
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Convenience helper for tests and panel assertions. It proves that JSON
 * round-tripping a preset still produces the same valid schema.
 */
export function assertDevPresetRoundTrip(target: DevPresetTarget, options: DevPresetOptions = {}): DevPresetValidation {
  const result = createDevPreset(target, options);
  const roundTripped = migrateSave(JSON.parse(JSON.stringify(result.save)));
  return validateDevPreset(roundTripped, target);
}

/** Mark the Boss as completed in a safe, already-unlocked EP10 test state. */
export function markDevBossDefeated(save: GameSave): GameSave {
  const next = cloneSave(save);
  if (!isEpisodeUnlocked(next, 10) || next.completed.includes(10)) throw new Error('EP10 must be unlocked and incomplete before marking the debug Boss defeated');
  return cloneSave(markEp10BossDefeated(next));
}
