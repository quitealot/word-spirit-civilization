import type { NarrativeBeat, NarrativeScene } from './types.ts';
import {
  POST_STORIES,
  STORIES,
  TEMPORARY_CONTENT_STATUS,
} from './temporary-content.ts';
import type { Episode, TemporaryLine } from './types.ts';

/**
 * Temporary scene registry for the current playable build.
 *
 * The text is deliberately sourced from the existing legacy arrays. K3 may
 * replace this registry with the approved narrative pack without changing
 * gameplay configuration or the validator contract.
 */
function linesToBeats(sceneId: string, lines: readonly TemporaryLine[]): readonly NarrativeBeat[] {
  return lines.flatMap(([speaker, text], index) => {
    // The legacy EP01 opening used an empty line as a runtime spirit-name
    // injection point. It is not a deliverable dialogue beat, so omit it from
    // the temporary scene rather than exposing an invalid empty dialogue.
    if (!text.trim()) return [];
    return [{
      id: `${sceneId}.beat.${String(index + 1).padStart(2, '0')}`,
      type: 'dialogue',
      speaker,
      text,
    }];
  });
}

function scene(sceneId: string, lines: readonly TemporaryLine[]): NarrativeScene {
  return { sceneId, beats: linesToBeats(sceneId, lines) };
}

/**
 * Scene IDs currently referenced by episode-config.ts. This is temporary
 * content, not the final K3 script.
 */
export const TEMPORARY_NARRATIVE_SCENES: readonly NarrativeScene[] = [
  scene('ep01.opening_after_selection', STORIES[1]),
  scene('ep02.old_road', STORIES[2]),
  scene('ep03.awakening_gate', STORIES[3]),
  scene('ep04.first_sighting', STORIES[4]),
  scene('ep05.silent_square', STORIES[5]),
  scene('ep06.companion_approach', STORIES[6]),
  scene('ep06.resonance', POST_STORIES[5] ?? STORIES[6]),
  scene('ep07.first_team_battle', STORIES[7]),
  scene('ep08.unnamed_monument', STORIES[8]),
  scene('ep09.rare_tracking', STORIES[9]),
  scene('ep09.sky_silhouette', POST_STORIES[9] ?? STORIES[9]),
  scene('ep10.gatekeeper', STORIES[10]),
];

export const TEMPORARY_NARRATIVE_PACK = {
  status: TEMPORARY_CONTENT_STATUS,
  scenes: TEMPORARY_NARRATIVE_SCENES,
} as const;

export type TemporaryNarrativeSceneId = (typeof TEMPORARY_NARRATIVE_SCENES)[number]['sceneId'];

export function temporarySceneForEpisode(episode: Episode): readonly NarrativeScene[] {
  const prefix = `ep${String(episode).padStart(2, '0')}.`;
  return TEMPORARY_NARRATIVE_SCENES.filter((item) => item.sceneId.startsWith(prefix));
}
