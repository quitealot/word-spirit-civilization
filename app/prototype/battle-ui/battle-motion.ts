import type { DemoState, SkillId } from './demo-model';
import { WATER_MOTION } from './water-motion.ts';

export const PLAYER_MOTION: Record<SkillId, { durationMs: number; impactMs: number }> = {
  water: WATER_MOTION,
  tide: { durationMs: 2400, impactMs: 960 },
  wave: { durationMs: 2200, impactMs: 880 },
};
export const BOSS_MOTION = { durationMs: 2400, impactMs: 960 } as const;
export function activeMotion(state: DemoState) {
  if (state.phase === 'player' && state.selected) return PLAYER_MOTION[state.selected];
  if (state.phase === 'enemy') return BOSS_MOTION;
  return null;
}
export function motionKey(state: DemoState) { return `${state.turn}-${state.phase}-${state.selected ?? ''}`; }
// Presentation is a projection. It never writes HP or dispatches a combat result.
export function displayedHp(state: DemoState, pending: boolean) {
  return {
    player: pending && (state.phase === 'player' || state.phase === 'enemy') ? state.previousPlayerHp : state.playerHp,
    enemy: pending && state.phase === 'player' ? state.previousEnemyHp : state.enemyHp,
  };
}
