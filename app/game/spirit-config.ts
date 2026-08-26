import type { Starter } from '../narrative/types';
import type { SkillExecutionKind } from './bridge-config.ts';

export type SpiritConfig = {
  name: Starter;
  roleKey: 'guard' | 'assault' | 'recovery';
  roleLabel: string;
  roleDescription: string;
  tone: string;
  image: string;
  skills: readonly { name: string; effect: string; executionKind: SkillExecutionKind; unlockLevel: number }[];
};

/** Machine/UI configuration only. Narrative reactions live in narrative content. */
export const SPIRITS: readonly SpiritConfig[] = [
  { name: '芽语', roleKey: 'guard', roleLabel: '守护', roleDescription: '稳住队伍，擅长护盾与减伤', tone: 'emerald', image: '/spirit-yayu-card.png', skills: [{ name: '叶拍', effect: '造成稳定伤害', executionKind: 'stable_attack', unlockLevel: 1 }, { name: '护芽', effect: '攻击并获得护盾', executionKind: 'shield', unlockLevel: 1 }, { name: '扎根', effect: '降低下一次伤害', executionKind: 'mitigation', unlockLevel: 3 }] },
  { name: '烬尾', roleKey: 'assault', roleLabel: '强攻', roleDescription: '高爆发，擅长快速解决敌人', tone: 'amber', image: '/spirit-jinwei-card.png', skills: [{ name: '火星', effect: '造成稳定伤害', executionKind: 'stable_attack', unlockLevel: 1 }, { name: '焰尾', effect: '造成高额伤害', executionKind: 'burst', unlockLevel: 1 }, { name: '蓄火', effect: '强化下一次攻击', executionKind: 'charge', unlockLevel: 3 }] },
  { name: '澜歌', roleKey: 'recovery', roleLabel: '支援', roleDescription: '治疗与减伤，擅长持续作战', tone: 'blue', image: '/spirit-lange-card.png', skills: [{ name: '水音', effect: '造成稳定伤害', executionKind: 'stable_attack', unlockLevel: 1 }, { name: '回潮', effect: '攻击并恢复生命', executionKind: 'recovery', unlockLevel: 1 }, { name: '静波', effect: '降低下一次伤害', executionKind: 'control', unlockLevel: 3 }] },
];

export function getUnlockedSkills(spirit: SpiritConfig, level: number): SpiritConfig['skills'] {
  return spirit.skills.filter(skill => skill.unlockLevel <= level);
}

export function getNextLockedSkill(spirit: SpiritConfig, level: number): SpiritConfig['skills'][number] | null {
  return spirit.skills.find(skill => skill.unlockLevel > level) ?? null;
}

export function getSpirit(name: Starter): SpiritConfig {
  const spirit = SPIRITS.find(item => item.name === name);
  if (!spirit) throw new Error(`Unknown starter: ${name}`);
  return spirit;
}
