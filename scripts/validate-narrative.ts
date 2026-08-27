import { EPISODE_CONFIG } from '../app/game/episode-config.ts';
import type { EpisodeConfig } from '../app/game/episode-config.ts';
import { ACTIVE_NARRATIVE_PACK } from '../app/narrative/active-scenes.ts';
import { EP01_V6_SCENES, EP01_V6_STATUS } from '../app/narrative/ep01-v6.ts';
import { EP02_V1_1_SCENES, EP02_V1_1_STATUS, ep02RuntimeBeats } from '../app/narrative/ep02-v1-1.ts';
import { EP03_FIRST_ENEMY_ACTION_EVENT, EP03_V1_1_SCENES, EP03_V1_1_STATUS, ep03IntroRuntimeBeats } from '../app/narrative/ep03-v1-1.ts';
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
  scenes: EP01_V6_SCENES,
  episodeConfig: { 1: EPISODE_CONFIG[1] },
  contentStatus: 'formal',
});
const ep01Text = JSON.stringify(EP01_V6_SCENES);
if (EP01_V6_STATUS !== 'FROZEN_APPROVED') throw new Error('EP01 v6 must remain FROZEN_APPROVED.');
if (!ep01Text.includes('我没问你。') || !ep01Text.includes('4个行动倾向情境 → 三只语灵各一次技能体验，共调用9个正式L1。') || !ep01Text.includes('乔姨没有催你。') || !ep01Text.includes('测试结束。乔姨看看三只语灵，又看看你。')) {
  throw new Error('EP01 v6 is missing one of the four frozen hotfixes.');
}
if (ep01Text.includes('ep01.cenpo') || ep01Text.includes('ep01.spirits') || ep01Text.includes('岑姨')) throw new Error('EP01 v6 contains a retired v3 scene or character name.');

const ep02Result = validateNarrativePack({
  scenes: EP02_V1_1_SCENES,
  episodeConfig: { 2: EPISODE_CONFIG[2] },
  contentStatus: 'formal',
});
const ep02Text = JSON.stringify(EP02_V1_1_SCENES);
const ep02Beat = (id: string) => EP02_V1_1_SCENES.flatMap(scene => scene.beats).find(beat => beat.id === id);
const ep02DialogueText = (id: string) => { const beat = ep02Beat(id); return beat?.type === 'dialogue' ? beat.text : null; };
if (EP02_V1_1_STATUS !== 'FROZEN_APPROVED') throw new Error('EP02 v1.1 must remain FROZEN_APPROVED.');
if (ep02DialogueText('ep02.footprints.b04') !== '这不是很久以前的。') throw new Error('EP02 final footprints.b04 hotfix is missing.');
if (ep02DialogueText('ep02.alo_reaction.b04') !== '嗯。') throw new Error('EP02 alo_reaction.b04 must retain the v1 line.');
if (ep02Text.includes('比我们早，不会太久。') || ep02Text.includes('ep02.over_the_rise.b06') || ep02Text.includes('ep02.over_the_rise.b07')) throw new Error('EP02 contains text or beats removed by the frozen v1.1 patch.');
for (const starter of ['芽语', '烬尾', '澜歌'] as const) {
  const branchBeats = ep02RuntimeBeats(starter);
  if (branchBeats.filter(item => item.beat.id.startsWith('ep02.spirit_pause.') && ['ep02.spirit_pause.yayu', 'ep02.spirit_pause.jinwei', 'ep02.spirit_pause.lange'].includes(item.beat.id)).length !== 1) throw new Error(`EP02 ${starter} runtime branch must contain exactly one spirit reaction.`);
}

const ep03Result = validateNarrativePack({
  scenes: EP03_V1_1_SCENES,
  episodeConfig: { 3: EPISODE_CONFIG[3] },
  contentStatus: 'formal',
});
const ep03Beats = EP03_V1_1_SCENES.flatMap(scene => scene.beats);
const ep03Beat = (id: string) => ep03Beats.find(beat => beat.id === id);
if (EP03_V1_1_STATUS !== 'FROZEN_APPROVED') throw new Error('EP03 v1.1 must remain FROZEN_APPROVED.');
if (ep03Beat('ep03.encounter.b13') || ep03Beat('ep03.stone_gate.b06')) throw new Error('EP03 contains a beat removed by the frozen v1.1 patch.');
if (ep03Beat(EP03_FIRST_ENEMY_ACTION_EVENT.eventId)) throw new Error('The first enemy action glance must be a battle event, not a NarrativeBeat.');
if (EP03_FIRST_ENEMY_ACTION_EVENT.action !== '你的语灵稳住身形。重新面对前方之前，它忽然回头看了你一眼。只一下。') throw new Error('EP03 first enemy action event text drifted.');
if (ep03Beat('ep03.stone_gate.b04')?.type !== 'dialogue' || ep03Beat('ep03.stone_gate.b04')?.text !== '先别往前。回吧。') throw new Error('EP03 must stop at the frozen stone-gate line.');
if (JSON.stringify(EP03_V1_1_SCENES).includes('PENDING_K3')) throw new Error('EP03 formal content may not contain PENDING_K3.');
for (const starter of ['芽语', '烬尾', '澜歌'] as const) {
  const runtime = ep03IntroRuntimeBeats(starter);
  if (runtime.filter(item => ['ep03.spirit_alert.yayu', 'ep03.spirit_alert.jinwei', 'ep03.spirit_alert.lange'].includes(item.beat.id)).length !== 1) throw new Error(`EP03 ${starter} runtime branch must contain exactly one spirit reaction.`);
}

if (result.errors.length > 0 || ep01Result.errors.length > 0 || ep02Result.errors.length > 0 || ep03Result.errors.length > 0) process.exitCode = 1;
