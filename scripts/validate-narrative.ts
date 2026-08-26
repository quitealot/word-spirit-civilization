import { EPISODE_CONFIG } from '../app/game/episode-config.ts';
import type { EpisodeConfig } from '../app/game/episode-config.ts';
import { ACTIVE_NARRATIVE_PACK } from '../app/narrative/active-scenes.ts';
import { EP01_V3_SCENES } from '../app/narrative/ep01-v3.ts';
import type {
  NarrativeBeat,
  NarrativePresentation,
  NarrativeScene,
} from '../app/narrative/types.ts';

export type NarrativeIssueSeverity = 'error' | 'warning';

export type NarrativeIssue = {
  severity: NarrativeIssueSeverity;
  code: string;
  message: string;
  sceneId?: string;
  beatId?: string;
  episodeId?: number;
};

export type NarrativeValidationInput = {
  scenes: readonly NarrativeScene[];
  episodeConfig: Readonly<Record<number, EpisodeConfig>>;
  /** Use `formal` for K3-approved content, `temporary` for the test pack. */
  contentStatus: 'formal' | 'temporary';
};

export type NarrativeValidationResult = {
  issues: readonly NarrativeIssue[];
  errors: readonly NarrativeIssue[];
  warnings: readonly NarrativeIssue[];
};

const SUPPORTED_PRESENTATIONS = new Set<NarrativePresentation>([
  'portrait',
  'sfx',
  'light_fx',
  'scene',
]);

function addIssue(
  issues: NarrativeIssue[],
  issue: Omit<NarrativeIssue, 'severity'> & { severity?: NarrativeIssueSeverity },
) {
  issues.push({ severity: issue.severity ?? 'error', ...issue });
}

function beatPath(sceneId: string, beatIndex: number) {
  return `${sceneId} beat #${beatIndex + 1}`;
}

/**
 * Validates a narrative pack against the stable K3 handoff contract and the
 * machine-facing episode configuration. This function is intentionally pure
 * so future content import tooling can reuse it without a CMS.
 */
export function validateNarrativePack(input: NarrativeValidationInput): NarrativeValidationResult {
  const issues: NarrativeIssue[] = [];
  const sceneIds = new Set<string>();
  const beatIds = new Set<string>();
  const referencedSceneIds = new Set<string>();

  for (const scene of input.scenes) {
    if (!scene.sceneId.trim()) {
      addIssue(issues, {
        code: 'SCENE_ID_MISSING',
        message: 'sceneId is required.',
      });
    } else if (sceneIds.has(scene.sceneId)) {
      addIssue(issues, {
        code: 'SCENE_ID_DUPLICATE',
        message: `Duplicate sceneId "${scene.sceneId}".`,
        sceneId: scene.sceneId,
      });
    } else {
      sceneIds.add(scene.sceneId);
    }

    for (const [beatIndex, rawBeat] of scene.beats.entries()) {
      const beat = rawBeat as NarrativeBeat & Record<string, unknown>;
      const path = beatPath(scene.sceneId, beatIndex);

      if (!beat.id || typeof beat.id !== 'string' || !beat.id.trim()) {
        addIssue(issues, {
          code: 'BEAT_ID_MISSING',
          message: `${path}: beat id is required.`,
          sceneId: scene.sceneId,
        });
      } else if (beatIds.has(beat.id)) {
        addIssue(issues, {
          code: 'BEAT_ID_DUPLICATE',
          message: `${path}: duplicate beat id "${beat.id}".`,
          sceneId: scene.sceneId,
          beatId: beat.id,
        });
      } else {
        beatIds.add(beat.id);
      }

      switch (beat.type) {
        case 'dialogue':
          if (typeof beat.speaker !== 'string' || !beat.speaker.trim()) {
            addIssue(issues, {
              code: 'DIALOGUE_SPEAKER_MISSING',
              message: `${path}: dialogue speaker is required.`,
              sceneId: scene.sceneId,
              beatId: typeof beat.id === 'string' ? beat.id : undefined,
            });
          }
          if (typeof beat.text !== 'string' || !beat.text.trim()) {
            addIssue(issues, {
              code: 'DIALOGUE_TEXT_MISSING',
              message: `${path}: dialogue text is required.`,
              sceneId: scene.sceneId,
              beatId: typeof beat.id === 'string' ? beat.id : undefined,
            });
          }
          break;
        case 'narration':
          if (typeof beat.text !== 'string' || !beat.text.trim()) {
            addIssue(issues, {
              code: 'NARRATION_TEXT_MISSING',
              message: `${path}: narration text is required.`,
              sceneId: scene.sceneId,
              beatId: typeof beat.id === 'string' ? beat.id : undefined,
            });
          }
          break;
        case 'action':
          if (typeof beat.text !== 'string' || !beat.text.trim()) {
            addIssue(issues, {
              code: 'ACTION_TEXT_MISSING',
              message: `${path}: action text is required.`,
              sceneId: scene.sceneId,
              beatId: typeof beat.id === 'string' ? beat.id : undefined,
            });
          }
          if (beat.presentation !== undefined && !SUPPORTED_PRESENTATIONS.has(beat.presentation as NarrativePresentation)) {
            addIssue(issues, {
              code: 'UNSUPPORTED_PRESENTATION',
              message: `${path}: unsupported presentation "${String(beat.presentation)}".`,
              sceneId: scene.sceneId,
              beatId: typeof beat.id === 'string' ? beat.id : undefined,
            });
          }
          break;
        case 'choice':
          if (!Array.isArray(beat.choices) || beat.choices.length < 2) {
            addIssue(issues, {
              code: 'CHOICE_TOO_SHORT',
              message: `${path}: choice must contain at least two choices.`,
              sceneId: scene.sceneId,
              beatId: typeof beat.id === 'string' ? beat.id : undefined,
            });
          }
          break;
        case 'interaction':
          if (typeof beat.interactionId !== 'string' || !beat.interactionId.trim()) {
            addIssue(issues, {
              code: 'INTERACTION_ID_MISSING',
              message: `${path}: interactionId is required.`,
              sceneId: scene.sceneId,
              beatId: typeof beat.id === 'string' ? beat.id : undefined,
            });
          }
          if (typeof beat.prompt !== 'string' || !beat.prompt.trim()) {
            addIssue(issues, {
              code: 'INTERACTION_PROMPT_MISSING',
              message: `${path}: interaction prompt is required.`,
              sceneId: scene.sceneId,
              beatId: typeof beat.id === 'string' ? beat.id : undefined,
            });
          }
          if (typeof beat.resultText !== 'string' || !beat.resultText.trim()) {
            addIssue(issues, {
              code: 'INTERACTION_RESULT_MISSING',
              message: `${path}: interaction resultText is required.`,
              sceneId: scene.sceneId,
              beatId: typeof beat.id === 'string' ? beat.id : undefined,
            });
          }
          break;
        default:
          const unsupportedBeat = beat as Record<string, unknown>;
          addIssue(issues, {
            code: 'BEAT_TYPE_UNSUPPORTED',
            message: `${path}: unsupported beat type "${String(unsupportedBeat.type)}".`,
            sceneId: scene.sceneId,
            beatId: typeof unsupportedBeat.id === 'string' ? unsupportedBeat.id : undefined,
          });
      }

      if (input.contentStatus === 'formal' && JSON.stringify(beat).includes('PENDING_K3')) {
        addIssue(issues, {
          severity: 'warning',
          code: 'FORMAL_PENDING_K3',
          message: `${path}: formal content still contains PENDING_K3.`,
          sceneId: scene.sceneId,
          beatId: typeof beat.id === 'string' ? beat.id : undefined,
        });
      }
    }
  }

  for (const episode of Object.values(input.episodeConfig)) {
    for (const sceneId of episode.narrativeSceneIds) {
      referencedSceneIds.add(sceneId);
      if (!sceneIds.has(sceneId)) {
        addIssue(issues, {
          code: 'SCENE_REFERENCE_MISSING',
          message: `EP${String(episode.id).padStart(2, '0')} references missing sceneId "${sceneId}".`,
          episodeId: episode.id,
          sceneId,
        });
      }
    }
  }

  // A scene not referenced by gameplay is allowed during authoring, but is
  // useful context when reading validator output, so do not fail on it.
  void referencedSceneIds;

  const errors = issues.filter((issue) => issue.severity === 'error');
  const warnings = issues.filter((issue) => issue.severity === 'warning');
  return { issues, errors, warnings };
}

function printResult(result: NarrativeValidationResult) {
  if (result.issues.length === 0) {
    console.log('Narrative validator: PASS (0 errors, 0 warnings)');
    return;
  }

  for (const issue of result.issues) {
    const location = [
      issue.sceneId,
      issue.beatId,
      issue.episodeId === undefined ? undefined : `EP${String(issue.episodeId).padStart(2, '0')}`,
    ].filter(Boolean).join(' · ');
    console.log(`${issue.severity.toUpperCase()} ${issue.code}${location ? ` [${location}]` : ''}: ${issue.message}`);
  }
  console.log(`Narrative validator: ${result.errors.length > 0 ? 'FAIL' : 'PASS WITH WARNINGS'} (${result.errors.length} errors, ${result.warnings.length} warnings)`);
}

const result = validateNarrativePack({
  scenes: ACTIVE_NARRATIVE_PACK.scenes,
  episodeConfig: EPISODE_CONFIG,
  contentStatus: 'temporary',
});
printResult(result);

const ep01Result = validateNarrativePack({
  scenes: EP01_V3_SCENES,
  episodeConfig: { 1: EPISODE_CONFIG[1] },
  contentStatus: 'formal',
});
const ep01Text = JSON.stringify(EP01_V3_SCENES);
if (ep01Text.includes('你们先去站里。我带点东西，随后到。') || ep01Text.includes('岑婆已经先到了') || ep01Text.includes('你没有多练。岑婆没说什么。')) {
  throw new Error('EP01 v3 contains text rejected by the final Sol consistency fix.');
}
if (!ep01Text.includes('走吧，先去站里。我拿点东西。') || !ep01Text.includes('你决定先上路，训练留到之后。')) {
  throw new Error('EP01 v3 is missing a final Sol consistency fix.');
}

if (result.errors.length > 0 || ep01Result.errors.length > 0) process.exitCode = 1;
