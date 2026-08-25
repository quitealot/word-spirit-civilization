/**
 * EP07's minimal two-spirit tactical loop.
 *
 * This module deliberately knows nothing about questions, FSRS, narrative,
 * or presentation. A player action can be a skill or a swap; the caller
 * decides when to request the next learning question. That keeps the tactical
 * choice independent from the current mastery layer.
 */

export type TeamSpiritId = string;
export type SpiritTacticalTag = 'guard' | 'recovery' | 'assault';
export type EnemyAttackKind = 'normal' | 'heavy';
export type TeamBattleResult = 'active' | 'won' | 'lost';
export type TeamSpiritStatus = 'active' | 'reserve' | 'down';

export type TeamSpiritSeed = {
  id: TeamSpiritId;
  maxHp: number;
  tacticalTags?: readonly SpiritTacticalTag[];
};

export type TeamSpiritState = TeamSpiritSeed & {
  hp: number;
  shield: number;
  status: TeamSpiritStatus;
};

export type EnemyAttack = {
  kind: EnemyAttackKind;
  damage: number;
};

export type TeamEnemyState = {
  id: string;
  maxHp: number;
  hp: number;
  nextAttack: EnemyAttack;
  incomingDamageReduction: number;
  incomingDamageReductionTurns: number;
};

export type TeamBattleState = {
  battleId: string;
  turn: number;
  activeSpiritId: TeamSpiritId;
  spirits: Record<TeamSpiritId, TeamSpiritState>;
  enemy: TeamEnemyState;
  swapCooldownRemaining: number;
  swapCount: number;
  result: TeamBattleResult;
};

export type TeamTactic =
  | { kind: 'damage'; amount: number }
  | { kind: 'shield'; amount: number }
  | { kind: 'recover'; amount: number; target?: 'active' | TeamSpiritId }
  | { kind: 'weaken'; reduction: number; turns?: number };

export type SwapBlockReason =
  | 'battle_over'
  | 'same_spirit'
  | 'target_missing'
  | 'target_down'
  | 'cooldown';

export type SwapAvailability =
  | { allowed: true; targetId: TeamSpiritId }
  | { allowed: false; reason: SwapBlockReason; targetId: TeamSpiritId };

export type SwapCueReason =
  | 'current_down'
  | 'current_low_hp'
  | 'target_guards_heavy_attack';

export type SwapCue = {
  targetId: TeamSpiritId;
  reason: SwapCueReason;
  activeHp: number;
  activeMaxHp: number;
  targetHp: number;
  targetMaxHp: number;
  incomingAttack: EnemyAttackKind;
};

export const TEAM_BATTLE_DEFAULTS = {
  maxSpirits: 2,
  spiritMaxHp: 100,
  swapCooldownTurns: 1,
  lowHpRatio: 0.35,
  defaultEnemyAttack: { kind: 'normal' as EnemyAttackKind, damage: 16 },
} as const;

/** Tactical-only candidates for 绒岚; none of these references a question layer. */
export const MIST_PORT_TACTICS = {
  cover: { kind: 'shield', amount: 18 } satisfies TeamTactic,
  soften: { kind: 'weaken', reduction: 0.25, turns: 1 } satisfies TeamTactic,
} as const;

function positiveNumber(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function boundedNumber(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, Number.isFinite(value) ? value : minimum));
}

function livingSpirits(state: TeamBattleState): TeamSpiritState[] {
  return Object.values(state.spirits).filter(spirit => spirit.hp > 0 && spirit.status !== 'down');
}

function copyState(state: TeamBattleState): TeamBattleState {
  return {
    ...state,
    spirits: Object.fromEntries(
      Object.entries(state.spirits).map(([id, spirit]) => [id, { ...spirit, tacticalTags: [...(spirit.tacticalTags ?? [])] }]),
    ),
    enemy: { ...state.enemy, nextAttack: { ...state.enemy.nextAttack } },
  };
}

/** Create an EP07 state with exactly two usable team members. */
export function createTeamBattleState(options: {
  battleId: string;
  spirits: readonly TeamSpiritSeed[];
  enemy: { id: string; maxHp: number; nextAttack?: EnemyAttack };
  swapCooldownTurns?: number;
}): TeamBattleState {
  if (options.spirits.length !== TEAM_BATTLE_DEFAULTS.maxSpirits) {
    throw new Error('EP07 team battle requires exactly two spirits');
  }

  const uniqueIds = new Set(options.spirits.map(spirit => spirit.id));
  if (uniqueIds.size !== options.spirits.length || options.spirits.some(spirit => !spirit.id)) {
    throw new Error('Team spirit ids must be non-empty and unique');
  }

  const spirits = Object.fromEntries(options.spirits.map((seed, index) => {
    const maxHp = positiveNumber(seed.maxHp, TEAM_BATTLE_DEFAULTS.spiritMaxHp);
    return [seed.id, {
      ...seed,
      maxHp,
      hp: maxHp,
      shield: 0,
      status: index === 0 ? 'active' : 'reserve',
      tacticalTags: [...(seed.tacticalTags ?? [])],
    } satisfies TeamSpiritState];
  }));
  const enemyMaxHp = positiveNumber(options.enemy.maxHp, 100);

  return {
    battleId: options.battleId,
    turn: 1,
    activeSpiritId: options.spirits[0].id,
    spirits,
    enemy: {
      id: options.enemy.id,
      maxHp: enemyMaxHp,
      hp: enemyMaxHp,
      nextAttack: options.enemy.nextAttack ?? TEAM_BATTLE_DEFAULTS.defaultEnemyAttack,
      incomingDamageReduction: 0,
      incomingDamageReductionTurns: 0,
    },
    swapCooldownRemaining: 0,
    swapCount: 0,
    result: 'active',
  };
}

export function getActiveSpirit(state: TeamBattleState): TeamSpiritState {
  return state.spirits[state.activeSpiritId];
}

export function getReserveSpirits(state: TeamBattleState): TeamSpiritState[] {
  return Object.values(state.spirits).filter(spirit => spirit.id !== state.activeSpiritId);
}

export function getSwapAvailability(state: TeamBattleState, targetId: TeamSpiritId): SwapAvailability {
  if (state.result !== 'active') return { allowed: false, reason: 'battle_over', targetId };
  if (targetId === state.activeSpiritId) return { allowed: false, reason: 'same_spirit', targetId };
  const target = state.spirits[targetId];
  if (!target) return { allowed: false, reason: 'target_missing', targetId };
  if (target.hp <= 0 || target.status === 'down') return { allowed: false, reason: 'target_down', targetId };

  // A downed active member must be replaced immediately; the cooldown never
  // creates a dead-end after a forced knockout.
  if (getActiveSpirit(state).status !== 'down' && state.swapCooldownRemaining > 0) {
    return { allowed: false, reason: 'cooldown', targetId };
  }
  return { allowed: true, targetId };
}

/** Swapping consumes no English question and does not advance the turn. */
export function swapActiveSpirit(
  state: TeamBattleState,
  targetId: TeamSpiritId,
  cooldownTurns = TEAM_BATTLE_DEFAULTS.swapCooldownTurns,
): TeamBattleState {
  const availability = getSwapAvailability(state, targetId);
  if (!availability.allowed) return state;

  const next = copyState(state);
  next.spirits[next.activeSpiritId].status = 'reserve';
  next.spirits[targetId].status = 'active';
  next.activeSpiritId = targetId;
  next.swapCooldownRemaining = Math.max(0, Math.floor(cooldownTurns));
  next.swapCount += 1;
  return next;
}

/**
 * Returns a structured, presentation-free reason to consider swapping.
 * The UI can phrase this without the battle layer inventing narrative.
 */
export function getSwapCue(
  state: TeamBattleState,
  targetId = getReserveSpirits(state).find(spirit => spirit.hp > 0)?.id,
): SwapCue | null {
  if (!targetId) return null;
  const active = getActiveSpirit(state);
  const target = state.spirits[targetId];
  if (!target || target.hp <= 0 || target.status === 'down') return null;

  if (active.status === 'down' || active.hp <= 0) {
    return {
      targetId,
      reason: 'current_down',
      activeHp: 0,
      activeMaxHp: active.maxHp,
      targetHp: target.hp,
      targetMaxHp: target.maxHp,
      incomingAttack: state.enemy.nextAttack.kind,
    };
  }

  if (active.hp / active.maxHp <= TEAM_BATTLE_DEFAULTS.lowHpRatio) {
    return {
      targetId,
      reason: 'current_low_hp',
      activeHp: active.hp,
      activeMaxHp: active.maxHp,
      targetHp: target.hp,
      targetMaxHp: target.maxHp,
      incomingAttack: state.enemy.nextAttack.kind,
    };
  }

  if (state.enemy.nextAttack.kind === 'heavy' && target.tacticalTags?.includes('guard')) {
    return {
      targetId,
      reason: 'target_guards_heavy_attack',
      activeHp: active.hp,
      activeMaxHp: active.maxHp,
      targetHp: target.hp,
      targetMaxHp: target.maxHp,
      incomingAttack: state.enemy.nextAttack.kind,
    };
  }

  return null;
}

/** Apply a tactical skill effect. No question type or mastery layer is read. */
export function applyTeamTactic(state: TeamBattleState, tactic: TeamTactic): TeamBattleState {
  if (state.result !== 'active') return state;
  const next = copyState(state);

  if (tactic.kind === 'damage') {
    next.enemy.hp = Math.max(0, next.enemy.hp - Math.max(0, tactic.amount));
    if (next.enemy.hp === 0) next.result = 'won';
    return next;
  }

  if (tactic.kind === 'shield') {
    const active = next.spirits[next.activeSpiritId];
    active.shield += Math.max(0, tactic.amount);
    return next;
  }

  if (tactic.kind === 'recover') {
    const targetId = tactic.target === 'active' || !tactic.target ? next.activeSpiritId : tactic.target;
    const target = next.spirits[targetId];
    if (!target || target.status === 'down') return state;
    target.hp = Math.min(target.maxHp, target.hp + Math.max(0, tactic.amount));
    return next;
  }

  next.enemy.incomingDamageReduction = boundedNumber(tactic.reduction, 0, 0.9);
  next.enemy.incomingDamageReductionTurns = Math.max(0, Math.floor(tactic.turns ?? 1));
  return next;
}

/** Apply the enemy's main attack to the currently active spirit only. */
export function applyEnemyAttack(state: TeamBattleState, attack = state.enemy.nextAttack): TeamBattleState {
  if (state.result !== 'active') return state;
  const next = copyState(state);
  const active = next.spirits[next.activeSpiritId];
  const reduction = next.enemy.incomingDamageReductionTurns > 0
    ? next.enemy.incomingDamageReduction
    : 0;
  const incomingDamage = Math.max(0, Math.round(Math.max(0, attack.damage) * (1 - reduction)));
  const shieldDamage = Math.min(active.shield, incomingDamage);
  active.shield -= shieldDamage;
  active.hp = Math.max(0, active.hp - (incomingDamage - shieldDamage));
  if (active.hp === 0) active.status = 'down';

  next.enemy.nextAttack = { ...attack };
  if (next.enemy.incomingDamageReductionTurns > 0) {
    next.enemy.incomingDamageReductionTurns -= 1;
    if (next.enemy.incomingDamageReductionTurns === 0) next.enemy.incomingDamageReduction = 0;
  }
  if (livingSpirits(next).length === 0) next.result = 'lost';
  return next;
}

/** Advance one enemy turn; the swap cooldown is reduced once per turn. */
export function advanceTeamBattleTurn(state: TeamBattleState): TeamBattleState {
  if (state.result !== 'active') return state;
  return {
    ...state,
    turn: state.turn + 1,
    swapCooldownRemaining: Math.max(0, state.swapCooldownRemaining - 1),
  };
}

export function resolveEnemyTurn(state: TeamBattleState, attack = state.enemy.nextAttack): TeamBattleState {
  const attacked = applyEnemyAttack(state, attack);
  return attacked.result === 'active' ? advanceTeamBattleTurn(attacked) : attacked;
}

export function setNextEnemyAttack(state: TeamBattleState, attack: EnemyAttack): TeamBattleState {
  if (state.result !== 'active') return state;
  return { ...state, enemy: { ...state.enemy, nextAttack: { ...attack } } };
}
