import { EP01_V3_SCENES } from './ep01-v3.ts';
import { TEMPORARY_NARRATIVE_SCENES } from './temporary-scenes.ts';

export const ACTIVE_NARRATIVE_SCENES = [
  ...EP01_V3_SCENES,
  ...TEMPORARY_NARRATIVE_SCENES,
] as const;

export const ACTIVE_NARRATIVE_PACK = {
  status: 'MIXED_APPROVED_AND_TEMPORARY',
  scenes: ACTIVE_NARRATIVE_SCENES,
} as const;
