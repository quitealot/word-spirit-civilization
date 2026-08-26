import { EP01_V6_SCENES } from './ep01-v6.ts';
import { EP02_V1_1_SCENES } from './ep02-v1-1.ts';
import { TEMPORARY_NARRATIVE_SCENES } from './temporary-scenes.ts';

export const ACTIVE_NARRATIVE_SCENES = [
  ...EP01_V6_SCENES,
  ...EP02_V1_1_SCENES,
  ...TEMPORARY_NARRATIVE_SCENES,
] as const;

export const ACTIVE_NARRATIVE_PACK = {
  status: 'MIXED_APPROVED_AND_TEMPORARY',
  scenes: ACTIVE_NARRATIVE_SCENES,
} as const;
