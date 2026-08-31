import { FIRE_MOTION, type FireState } from './fire-model.ts';
import { BOSS_MOTION } from './battle-motion.ts';

export const TAIL_POSE_ASSET = '/battle-ui/jinwei-melee-poses-v1.png';
// Presentation only: 40% contact, 86% home and settled, then enemy may prepare.
export const TAIL_MELEE_MOTION = { durationMs: 3200, impactMs: 1280, landedMs: 2752 } as const;
export function firePresentationMotion(state: Pick<FireState, 'phase' | 'selected'>) {
  if (state.phase === 'player' && state.selected) return state.selected === 'tail' ? TAIL_MELEE_MOTION : FIRE_MOTION[state.selected];
  return state.phase === 'enemy' ? BOSS_MOTION : null;
}
export function tailReturnPending(state: Pick<FireState, 'phase' | 'selected'>, reduced: boolean, returned: string, key: string) {
  return state.phase === 'player' && state.selected === 'tail' && !reduced && returned !== key;
}
