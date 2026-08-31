import type { DemoState } from './demo-model';

// Visual cue only: the reducer still settles the complete skill once on cast.
export const TIDE_RECOVERY_MS = 1200;
export function tideRecoveryPending(state: DemoState, reduced: boolean, shown: string | null, key: string) {
  return state.phase === 'player' && state.selected === 'tide' && !reduced && shown !== key;
}
