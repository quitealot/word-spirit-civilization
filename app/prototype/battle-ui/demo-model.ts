/** UI-only fixture from SKILL_ENGLISH_SYSTEM_V2.md §5; NOT a new balance baseline. */
export const DEMO_RULES = { playerMaxHp: 48, enemyMaxHp: 60, enemyDamage: 8 } as const;
// Opt-in UI experiment, never imported by the historical game / learning prototypes.
export const BOSS_SKILLS = [
  { id: 'fist', name: '石拳', damage: 16, description: '抬臂向前出拳，造成16点伤害。' },
  { id: 'quake', name: '震击', damage: 36, description: '举臂蓄力后重击，造成36点伤害；可用削弱或减伤应对。' },
] as const;
export type BossSkillId = typeof BOSS_SKILLS[number]['id'];
export type DemoProfile = 'fixture' | 'gatekeeper-v1';
export const DEMO_SKILLS = [
  { id: 'water', name: '水音', role: '攻击 · 压制', damage: 18, healing: 0, weaken: 0.2, mitigation: 0 },
  { id: 'tide', name: '回潮', role: '攻击 · 回复', damage: 10, healing: 22, weaken: 0, mitigation: 0 },
  { id: 'wave', name: '静波', role: '回复 · 防护', damage: 0, healing: 10, weaken: 0, mitigation: 0.3 },
] as const;
export type SkillId = typeof DEMO_SKILLS[number]['id'];
export type DemoSkill = typeof DEMO_SKILLS[number];
export type Phase = 'choose' | 'player' | 'enemyReady' | 'enemy' | 'won' | 'lost';
export const PHASE_DURATION: Partial<Record<Phase, number>> = { player: 1400, enemyReady: 1000, enemy: 1400 };
export type DemoState = {
  profile: DemoProfile;
  playerHp: number; enemyHp: number; previousPlayerHp: number; previousEnemyHp: number;
  turn: number; phase: Phase; selected: SkillId | null;
  damage: number; healing: number; incoming: number; weaken: number; mitigation: number;
};
export type DemoEvent = { type: 'select'; id: SkillId } | { type: 'cast' } | { type: 'advance' } | { type: 'reset' };
export function initialDemo(profile: DemoProfile = 'fixture'): DemoState {
  return { profile, playerHp: DEMO_RULES.playerMaxHp, enemyHp: DEMO_RULES.enemyMaxHp, previousPlayerHp: DEMO_RULES.playerMaxHp,
    previousEnemyHp: DEMO_RULES.enemyMaxHp, turn: 1, phase: 'choose', selected: null, damage: 0, healing: 0, incoming: 0, weaken: 0, mitigation: 0 };
}
export function getSkill(id: SkillId | null) { return DEMO_SKILLS.find(skill => skill.id === id); }
export function getEnemySkill(state: Pick<DemoState, 'profile' | 'turn'>) {
  return state.profile === 'gatekeeper-v1' ? BOSS_SKILLS[(state.turn - 1) % BOSS_SKILLS.length]
    : { id: 'fist' as const, name: '攻击', damage: DEMO_RULES.enemyDamage, description: '历史界面夹具：8伤害。' };
}
export function previewIncoming(state: DemoState): number {
  const skill = getSkill(state.selected);
  return Math.round(getEnemySkill(state).damage * (1 - (skill?.weaken ?? 0)) * (1 - (skill?.mitigation ?? 0)));
}
export function skillDescription(skill: DemoSkill): string {
  const parts: string[] = [];
  if (skill.damage) parts.push(`造成 ${skill.damage} 点伤害`);
  if (skill.healing) parts.push(`回复自身 ${skill.healing} 点生命（不超过上限）`);
  if (skill.weaken) parts.push(`敌方下一次伤害降低 ${Math.round(skill.weaken * 100)}%`);
  if (skill.mitigation) parts.push(`自身下一次受到的伤害降低 ${Math.round(skill.mitigation * 100)}%`);
  return parts.join('；') + '。';
}
export function demoReducer(state: DemoState, event: DemoEvent): DemoState {
  if (event.type === 'reset') return initialDemo(state.profile);
  if (event.type === 'select') return state.phase === 'choose' && getSkill(event.id) ? { ...state, selected: event.id } : state;
  if (event.type === 'cast') {
    const skill = getSkill(state.selected);
    if (state.phase !== 'choose' || !skill) return state;
    const damage = Math.min(state.enemyHp, skill.damage);
    const healing = Math.min(DEMO_RULES.playerMaxHp - state.playerHp, skill.healing);
    return { ...state, phase: 'player', previousPlayerHp: state.playerHp, previousEnemyHp: state.enemyHp,
      playerHp: state.playerHp + healing, enemyHp: state.enemyHp - damage, damage, healing,
      weaken: skill.weaken, mitigation: skill.mitigation, incoming: 0 };
  }
  if (state.phase === 'player') return { ...state, phase: state.enemyHp === 0 ? 'won' : 'enemyReady' };
  if (state.phase === 'enemyReady') {
    const incoming = Math.min(state.playerHp, Math.round(getEnemySkill(state).damage * (1 - state.weaken) * (1 - state.mitigation)));
    return { ...state, phase: 'enemy', previousPlayerHp: state.playerHp, playerHp: state.playerHp - incoming, incoming, weaken: 0, mitigation: 0 };
  }
  if (state.phase === 'enemy') return { ...state, phase: state.playerHp === 0 ? 'lost' : 'choose',
    turn: state.turn + (state.playerHp === 0 ? 0 : 1), selected: null,
    previousPlayerHp: state.playerHp, previousEnemyHp: state.enemyHp };
  return state;
}
