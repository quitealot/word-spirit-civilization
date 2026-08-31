import type { DemoState } from './demo-model';

/** Presentation only. Never used to calculate damage or advance the battle reducer. */
export const WATER_MOTION = { durationMs: 2200, impactMs: 880 } as const;

export function waterIsCasting(state: DemoState): boolean {
  return state.phase === 'player' && state.selected === 'water';
}

export function presentedEnemyHp(state: DemoState, pendingImpact: boolean): number {
  return waterIsCasting(state) && pendingImpact ? state.previousEnemyHp : state.enemyHp;
}
