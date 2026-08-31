import type { DemoState, SkillId } from './demo-model';
import { activeMotion } from './battle-motion.ts';

// Presentation only. Historical V3 timing and all combat values remain unchanged.
export const WATER_ULTIMATE_MOTION = { durationMs: 3800, impactMs: 2200 } as const;
export const WATER_ULTIMATE_ASSET = '/battle-ui/lange-ultimate-poses-v1.png';
export function captureWaterUltimate(skill: SkillId, enabled: boolean, ready: boolean, reduced: boolean) {
  return skill === 'water' && enabled && ready && !reduced;
}
export function presentationMotion(state: DemoState, cinematic: boolean) {
  return cinematic && state.phase === 'player' && state.selected === 'water'
    ? WATER_ULTIMATE_MOTION : activeMotion(state);
}
