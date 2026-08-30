import { ZERO_BASE_WORDS } from './zero-base-teaching.ts';

export type IntentCallQuality = 'independent' | 'supported' | 'failed';
export type IntentBattleResult = 'active' | 'won' | 'lost';
export type IntentBattleMode = 'with_calls' | 'battle_only';

export type IntentSkillId = 'lange_water_tone' | 'lange_returning_tide' | 'lange_still_wave';

export type IntentBattleWordId = 'w1718' | 'w729';
export type IntentBattleWord = {
  wordId: IntentBattleWordId;
  word: 'water' | 'help';
  targetGloss: string;
  battleEligible: true;
};

export type IntentEnemyAttack = {
  kind: 'attack';
  label: '攻击';
  damage: 12 | 18 | 24;
};

export type IntentEnemyCharge = {
  kind: 'charge';
  label: '蓄力';
  damage: 0;
  nextDamage: 24;
};

export type IntentEnemyIntent = IntentEnemyAttack | IntentEnemyCharge;

export type IntentSkillConfig = {
  skillId: IntentSkillId;
  skillName: '水音' | '回潮' | '静波';
  baseDamage: number;
  baseHealing: number;
  baseShield: number;
  supportedReward: number;
  independentReward: number;
  rewardKind: 'enemy_damage_reduction' | 'healing' | 'shield';
};

export type IntentBattleSkill = IntentSkillConfig;

export type IntentWeakness = {
  wordId: IntentBattleWordId;
  word: IntentBattleWord['word'];
  skillName: IntentBattleSkill['skillName'];
  quality: 'failed';
  turn: number;
};

export type IntentBattleState = {
  playerHp: number;
  enemyHp: number;
  playerShield: number;
  /** Flat reduction granted by 水音 and held until the next real attack. */
  pendingEnemyAttackReduction: number;
  turn: number;
  result: IntentBattleResult;
  weaknesses: IntentWeakness[];
};

export type IntentSkillComponents = {
  baseDamage: number;
  bonusDamage: number;
  damage: number;
  baseHealing: number;
  bonusHealing: number;
  healing: number;
  actualHealing: number;
  baseShield: number;
  bonusShield: number;
  shield: number;
  enemyDamageReduction: number;
};

export type IntentTurnOutcome = IntentSkillComponents & {
  skill: IntentBattleSkill;
  quality: IntentCallQuality | null;
  calledWord: IntentBattleWord | null;
  intent: IntentEnemyIntent;
  stateAfterSkill: IntentBattleState;
  state: IntentBattleState;
  enemyActed: boolean;
  enemyRawDamage: number;
  enemyDamage: number;
  shieldAbsorbed: number;
  playerDamage: number;
  reward: number;
  rewardKind: IntentSkillConfig['rewardKind'] | null;
};

export const INTENT_COMBAT_RULES = {
  id: 'intent-combat-v1-independent-prototype',
  playerMaxHp: 48,
  enemyMaxHp: 66,
  intentLoop: [
    { kind: 'attack', label: '攻击', damage: 8 },
    { kind: 'attack', label: '攻击', damage: 12 },
    { kind: 'charge', label: '蓄力', damage: 0, nextDamage: 18 },
    { kind: 'attack', label: '攻击', damage: 18 },
    { kind: 'attack', label: '攻击', damage: 8 },
    { kind: 'charge', label: '蓄力', damage: 0, nextDamage: 18 },
    { kind: 'attack', label: '攻击', damage: 18 },
  ] as const satisfies readonly IntentEnemyIntent[],
} as const;

export const INTENT_COMBAT_SKILLS: readonly IntentBattleSkill[] = [
  {
    skillId: 'lange_water_tone',
    skillName: '水音',
    baseDamage: 12,
    baseHealing: 0,
    baseShield: 0,
    supportedReward: 3,
    independentReward: 6,
    rewardKind: 'enemy_damage_reduction',
  },
  {
    skillId: 'lange_returning_tide',
    skillName: '回潮',
    baseDamage: 6,
    baseHealing: 4,
    baseShield: 0,
    supportedReward: 5,
    independentReward: 10,
    rewardKind: 'healing',
  },
  {
    skillId: 'lange_still_wave',
    skillName: '静波',
    baseDamage: 0,
    baseHealing: 0,
    baseShield: 8,
    supportedReward: 5,
    independentReward: 10,
    rewardKind: 'shield',
  },
] as const;

function getSourceWord(wordId: IntentBattleWordId) {
  return ZERO_BASE_WORDS.find(word => word.wordId === wordId);
}

function createIntentCombatWord(wordId: IntentBattleWordId): IntentBattleWord {
  const source = getSourceWord(wordId);
  if (!source || (source.word !== 'water' && source.word !== 'help')) {
    throw new Error(`Intent combat source word unavailable: ${wordId}`);
  }
  return {
    wordId,
    word: source.word,
    targetGloss: source.targetGloss,
    battleEligible: true,
  };
}

export const INTENT_COMBAT_WORDS: readonly [IntentBattleWord, IntentBattleWord] = [
  createIntentCombatWord('w1718'),
  createIntentCombatWord('w729'),
];

export function assertIntentCombatSourceIntegrity(): void {
  for (const candidate of INTENT_COMBAT_WORDS) {
    const source = getSourceWord(candidate.wordId);
    if (!source || source.word !== candidate.word || source.targetGloss !== candidate.targetGloss) {
      throw new Error(`Intent combat source mismatch: ${candidate.wordId}/${candidate.word}`);
    }
  }
}

export function getIntentCombatWord(wordId: IntentBattleWordId): IntentBattleWord {
  const word = INTENT_COMBAT_WORDS.find(candidate => candidate.wordId === wordId);
  if (!word) throw new Error(`Unknown intent combat word: ${wordId}`);
  return word;
}

export function getIntentCombatChoiceSet(wordId: IntentBattleWordId): string[] {
  const source = getSourceWord(wordId);
  if (!source) throw new Error(`Unknown intent combat source word: ${wordId}`);
  const otherGlosses = ZERO_BASE_WORDS
    .filter(word => word.wordId !== wordId)
    .map(word => word.targetGloss);
  return [source.targetGloss, ...otherGlosses].slice(0, 4);
}

export function getIntentForTurn(turn: number): IntentEnemyIntent {
  if (!Number.isInteger(turn) || turn < 1) throw new Error(`Invalid intent combat turn: ${turn}`);
  return INTENT_COMBAT_RULES.intentLoop[(turn - 1) % INTENT_COMBAT_RULES.intentLoop.length];
}

export function getIntentDescription(intent: IntentEnemyIntent): string {
  return intent.kind === 'attack'
    ? `攻击：预计造成${intent.damage}伤害`
    : `蓄力：本回合不攻击；下一回合将造成${intent.nextDamage}伤害`;
}

export function createIntentCombatState(overrides: Partial<IntentBattleState> = {}): IntentBattleState {
  return {
    playerHp: INTENT_COMBAT_RULES.playerMaxHp,
    enemyHp: INTENT_COMBAT_RULES.enemyMaxHp,
    playerShield: 0,
    pendingEnemyAttackReduction: 0,
    turn: 1,
    result: 'active',
    weaknesses: [],
    ...overrides,
  };
}

export function selectIntentCombatCall(
  skill: IntentBattleSkill,
  turn: number,
): { skill: IntentBattleSkill; word: IntentBattleWord } {
  return {
    skill,
    word: INTENT_COMBAT_WORDS[(turn - 1) % INTENT_COMBAT_WORDS.length],
  };
}

function getReward(skill: IntentBattleSkill, quality: IntentCallQuality | null): number {
  if (quality === 'independent') return skill.independentReward;
  if (quality === 'supported') return skill.supportedReward;
  return 0;
}

function getComponents(skill: IntentBattleSkill, quality: IntentCallQuality | null): IntentSkillComponents {
  const reward = getReward(skill, quality);
  const bonusDamage = 0;
  const bonusHealing = skill.rewardKind === 'healing' ? reward : 0;
  const bonusShield = skill.rewardKind === 'shield' ? reward : 0;
  const enemyDamageReduction = skill.rewardKind === 'enemy_damage_reduction' ? reward : 0;
  return {
    baseDamage: skill.baseDamage,
    bonusDamage,
    damage: skill.baseDamage + bonusDamage,
    baseHealing: skill.baseHealing,
    bonusHealing,
    healing: skill.baseHealing + bonusHealing,
    actualHealing: 0,
    baseShield: skill.baseShield,
    bonusShield,
    shield: skill.baseShield + bonusShield,
    enemyDamageReduction,
  };
}

export function resolveIntentCombatTurn(
  state: IntentBattleState,
  skill: IntentBattleSkill,
  quality: IntentCallQuality | null = null,
  calledWord: IntentBattleWord | null = null,
): IntentTurnOutcome {
  if (state.result !== 'active') {
    const zero = getComponents(skill, null);
    return {
      ...zero,
      skill,
      quality: null,
      calledWord: null,
      intent: getIntentForTurn(state.turn),
      stateAfterSkill: state,
      state,
      enemyActed: false,
      enemyRawDamage: 0,
      enemyDamage: 0,
      shieldAbsorbed: 0,
      playerDamage: 0,
      reward: 0,
      rewardKind: null,
    };
  }
  if (quality === null && calledWord !== null) throw new Error('Intent combat call quality is required when a word is called');
  if (quality !== null && calledWord === null) throw new Error('Intent combat called word is required when quality is provided');

  const intent = getIntentForTurn(state.turn);
  const components = getComponents(skill, quality);
  const enemyHp = Math.max(0, state.enemyHp - components.damage);
  const actualHealing = Math.min(components.healing, INTENT_COMBAT_RULES.playerMaxHp - state.playerHp);
  const playerHpAfterSkill = state.playerHp + actualHealing;
  const shieldAfterSkill = state.playerShield + components.shield;
  const won = enemyHp === 0;
  // A water-tone reward is a pending effect, not damage reduction for this turn.
  // A no-reward action leaves an existing pending effect untouched until an actual attack.
  const pendingEnemyAttackReduction = components.enemyDamageReduction > 0
    ? components.enemyDamageReduction
    : state.pendingEnemyAttackReduction;
  const enemyActed = !won && intent.kind === 'attack';
  const enemyRawDamage = enemyActed ? intent.damage : 0;
  const enemyDamage = enemyActed
    ? Math.max(0, enemyRawDamage - pendingEnemyAttackReduction)
    : 0;
  const shieldAbsorbed = Math.min(shieldAfterSkill, enemyDamage);
  const playerDamage = enemyDamage - shieldAbsorbed;
  const playerHp = Math.max(0, playerHpAfterSkill - playerDamage);
  const result: IntentBattleResult = won ? 'won' : playerHp === 0 ? 'lost' : 'active';
  const weakness = quality === 'failed' && calledWord
    ? [{
        wordId: calledWord.wordId,
        word: calledWord.word,
        skillName: skill.skillName,
        quality: 'failed' as const,
        turn: state.turn,
      }]
    : [];
  const weaknesses = weakness.length > 0
    ? [...state.weaknesses.filter(item => item.wordId !== weakness[0].wordId), ...weakness]
    : state.weaknesses;
  const stateAfterSkill: IntentBattleState = {
    playerHp: playerHpAfterSkill,
    enemyHp,
    playerShield: shieldAfterSkill,
    pendingEnemyAttackReduction,
    turn: state.turn,
    result: won ? 'won' : 'active',
    weaknesses,
  };
  const stateAfterEnemy: IntentBattleState = {
    playerHp,
    enemyHp,
    playerShield: 0,
    pendingEnemyAttackReduction: enemyActed ? 0 : pendingEnemyAttackReduction,
    turn: state.turn + (result === 'active' ? 1 : 0),
    result,
    weaknesses,
  };
  return {
    ...components,
    actualHealing,
    skill,
    quality,
    calledWord,
    intent,
    stateAfterSkill,
    // A terminal battle has no future attack to await, so transient suppression is cleared
    // in the final state even though it remains visible in stateAfterSkill before that phase.
    state: won ? { ...stateAfterSkill, pendingEnemyAttackReduction: 0, result: 'won' } : stateAfterEnemy,
    enemyActed,
    enemyRawDamage,
    enemyDamage,
    shieldAbsorbed,
    playerDamage,
    reward: getReward(skill, quality),
    rewardKind: quality && quality !== 'failed' ? skill.rewardKind : null,
  };
}

export function resolveIntentCombatCall(
  state: IntentBattleState,
  call: { skill: IntentBattleSkill; word: IntentBattleWord },
  quality: IntentCallQuality,
): IntentTurnOutcome {
  return resolveIntentCombatTurn(state, call.skill, quality, call.word);
}

export function resolveIntentCombatBattleOnly(
  state: IntentBattleState,
  skill: IntentBattleSkill,
): IntentTurnOutcome {
  return resolveIntentCombatTurn(state, skill);
}
