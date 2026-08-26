import type { Starter } from '../narrative/types';
import type { SkillExecutionKind } from './bridge-config.ts';

export type SpiritConfig = {
  name: Starter;
  roleKey: 'guard' | 'assault' | 'recovery';
  roleLabel: string;
  tone: string;
  image: string;
  skills: readonly { name: string; effect: string; executionKind: SkillExecutionKind }[];
};

/** Machine/UI configuration only. Narrative reactions live in narrative content. */
export const SPIRITS: readonly SpiritConfig[] = [
  { name: '芽语', roleKey: 'guard', roleLabel: '守护', tone: 'emerald', image: '/spirit-yayu-card.png', skills: [{ name: '叶拍', effect: '造成伤害', executionKind: 'stable_attack' }, { name: '护芽', effect: '攻击并获得护盾', executionKind: 'shield' }, { name: '扎根', effect: '降低下一次伤害', executionKind: 'mitigation' }] },
  { name: '烬尾', roleKey: 'assault', roleLabel: '强攻', tone: 'amber', image: '/spirit-jinwei-card.png', skills: [{ name: '火星', effect: '稳定攻击', executionKind: 'stable_attack' }, { name: '焰尾', effect: '高额伤害', executionKind: 'burst' }, { name: '蓄火', effect: '强化下一次攻击', executionKind: 'charge' }] },
  { name: '澜歌', roleKey: 'recovery', roleLabel: '恢复', tone: 'blue', image: '/spirit-lange-card.png', skills: [{ name: '水音', effect: '造成伤害', executionKind: 'stable_attack' }, { name: '回潮', effect: '攻击并恢复生命', executionKind: 'recovery' }, { name: '静波', effect: '降低下一次伤害', executionKind: 'control' }] },
];

export function getSpirit(name: Starter): SpiritConfig {
  const spirit = SPIRITS.find(item => item.name === name);
  if (!spirit) throw new Error(`Unknown starter: ${name}`);
  return spirit;
}
