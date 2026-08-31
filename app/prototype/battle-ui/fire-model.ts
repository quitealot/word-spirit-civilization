import { DEMO_RULES, getEnemySkill, type Phase } from './demo-model.ts';

// Existing V2 values are a UI fixture, not a newly approved pure-game balance.
export const FIRE_SKILLS = [
  { id: 'spark', name: '火星', role: '稳定输出', damage: 24, description: '造成24点伤害；蓄火后38点。' },
  { id: 'tail', name: '焰尾', role: '爆发 · 冷却', damage: 40, description: '造成40点伤害；蓄火后64点。使用后下一回合不能再次使用。' },
  { id: 'charge', name: '蓄火', role: '准备下一击', damage: 0, description: '本回合不造成伤害，下一次攻击提高60%；攻击后消耗，不叠加。' },
] as const;
export type FireId = typeof FIRE_SKILLS[number]['id'];
export const FIRE_BONUS = .6;
export const FIRE_MOTION = { spark: { durationMs: 2200, impactMs: 880 }, tail: { durationMs: 2600, impactMs: 1040 }, charge: { durationMs: 2200, impactMs: 880 } } as const;
export type FireState = { turn: number; phase: Phase; selected: FireId | null; playerHp: number; enemyHp: number; previousPlayerHp: number; previousEnemyHp: number; damage: number; incoming: number; charged: boolean; boosted: boolean; tailReadyTurn: number };
export type FireEvent = { type: 'select'; id: FireId } | { type: 'cast' } | { type: 'advance' } | { type: 'reset' };
export function initialFire(): FireState { return { turn: 1, phase: 'choose', selected: null, playerHp: DEMO_RULES.playerMaxHp, enemyHp: DEMO_RULES.enemyMaxHp, previousPlayerHp: DEMO_RULES.playerMaxHp, previousEnemyHp: DEMO_RULES.enemyMaxHp, damage: 0, incoming: 0, charged: false, boosted: false, tailReadyTurn: 1 }; }
export function fireSkill(id: FireId | null) { return FIRE_SKILLS.find(s => s.id === id); }
export function fireBlocked(state: FireState, id: FireId) { return id === 'tail' && state.turn < state.tailReadyTurn ? '冷却中 · 下一回合可用' : id === 'charge' && state.charged ? '已蓄火 · 请施放攻击' : ''; }
export function fireDamage(state: FireState, id: FireId) { return Math.round((fireSkill(id)?.damage ?? 0) * (1 + (state.charged ? FIRE_BONUS : 0))); }
export function fireEnemy(state: FireState) { return getEnemySkill({ profile: 'gatekeeper-v2', turn: state.turn }); }
export function fireReducer(state: FireState, event: FireEvent): FireState {
  if (event.type === 'reset') return initialFire();
  if (event.type === 'select') return state.phase === 'choose' && fireSkill(event.id) && !fireBlocked(state, event.id) ? { ...state, selected: event.id } : state;
  if (event.type === 'cast') {
    const skill = fireSkill(state.selected);
    if (state.phase !== 'choose' || !skill || fireBlocked(state, skill.id)) return state;
    const damage = Math.min(state.enemyHp, fireDamage(state, skill.id));
    return { ...state, phase: 'player', previousPlayerHp: state.playerHp, previousEnemyHp: state.enemyHp, enemyHp: state.enemyHp - damage, damage, incoming: 0,
      charged: skill.id === 'charge', boosted: state.charged && skill.damage > 0, tailReadyTurn: skill.id === 'tail' ? state.turn + 2 : state.tailReadyTurn };
  }
  if (state.phase === 'player') return { ...state, phase: state.enemyHp === 0 ? 'won' : 'enemyReady' };
  if (state.phase === 'enemyReady') {
    const incoming = Math.min(state.playerHp, fireEnemy(state).damage);
    return { ...state, phase: 'enemy', previousPlayerHp: state.playerHp, playerHp: state.playerHp - incoming, incoming };
  }
  if (state.phase === 'enemy') return { ...state, phase: state.playerHp === 0 ? 'lost' : 'choose', turn: state.turn + (state.playerHp === 0 ? 0 : 1), selected: null, previousPlayerHp: state.playerHp, previousEnemyHp: state.enemyHp };
  return state;
}
