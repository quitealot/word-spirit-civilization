import type { Starter } from '../narrative/types';

export type SpiritConfig = {
  name: Starter;
  roleKey: 'guard' | 'assault' | 'recovery';
  roleLabel: string;
  tone: string;
  image: string;
  skills: readonly { name: string; effect: string }[];
};

/** Machine/UI configuration only. Narrative reactions live in narrative content. */
export const SPIRITS: readonly SpiritConfig[] = [
  { name: '芽语', roleKey: 'guard', roleLabel: '守护', tone: 'emerald', image: '/spirit-yayu-card.png', skills: [{ name: '叶拍', effect: '造成伤害' }, { name: '护芽', effect: '攻击并获得护盾' }, { name: '扎根', effect: '降低下一次伤害' }] },
  { name: '烬尾', roleKey: 'assault', roleLabel: '强攻', tone: 'amber', image: '/spirit-jinwei-card.png', skills: [{ name: '火星', effect: '稳定攻击' }, { name: '焰尾', effect: '高额伤害' }, { name: '蓄火', effect: '强化下一次攻击' }] },
  { name: '澜歌', roleKey: 'recovery', roleLabel: '恢复', tone: 'blue', image: '/spirit-lange-card.png', skills: [{ name: '水音', effect: '造成伤害' }, { name: '回潮', effect: '攻击并恢复生命' }, { name: '静波', effect: '降低下一次伤害' }] },
];

export function getSpirit(name: Starter): SpiritConfig {
  const spirit = SPIRITS.find(item => item.name === name);
  if (!spirit) throw new Error(`Unknown starter: ${name}`);
  return spirit;
}
