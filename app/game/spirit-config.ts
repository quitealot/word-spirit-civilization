import type { Starter } from '../narrative/types';
import type { SkillExecutionKind } from './bridge-config.ts';
import type { StarterSkillId } from './skill-guidance.ts';

export type SpiritSkillConfig = {
  id: StarterSkillId;
  name: string;
  effect: string;
  executionKind: SkillExecutionKind;
};

export type SpiritConfig = {
  name: Starter;
  roleKey: 'guard' | 'assault' | 'recovery';
  roleLabel: string;
  tone: string;
  image: string;
  skills: readonly SpiritSkillConfig[];
};

/** Machine/UI configuration only. Narrative reactions live in narrative content. */
export const SPIRITS: readonly SpiritConfig[] = [
  { name: '芽语', roleKey: 'guard', roleLabel: '守护', tone: 'emerald', image: '/spirit-yayu-card.png', skills: [{ id: 'yayu_leaf_pat', name: '叶拍', effect: '稳定单体攻击', executionKind: 'stable_attack' }, { id: 'yayu_bud_guard', name: '护芽', effect: '为伙伴形成护盾', executionKind: 'shield' }, { id: 'yayu_root', name: '扎根', effect: '降低下一轮受到的伤害', executionKind: 'mitigation' }] },
  { name: '烬尾', roleKey: 'assault', roleLabel: '强攻', tone: 'amber', image: '/spirit-jinwei-card.png', skills: [{ id: 'jinwei_spark', name: '火星', effect: '稳定单体攻击', executionKind: 'stable_attack' }, { id: 'jinwei_flame_tail', name: '焰尾', effect: '高伤害，但失败折损更大', executionKind: 'burst' }, { id: 'jinwei_charge', name: '蓄火', effect: '蓄力并强化下一次攻击', executionKind: 'charge' }] },
  { name: '澜歌', roleKey: 'recovery', roleLabel: '恢复／控场', tone: 'blue', image: '/spirit-lange-card.png', skills: [{ id: 'lange_water_tone', name: '水音', effect: '基础攻击并轻度削弱敌方', executionKind: 'stable_attack' }, { id: 'lange_returning_tide', name: '回潮', effect: '治疗单个伙伴', executionKind: 'recovery' }, { id: 'lange_still_wave', name: '静波', effect: '降低全队下一轮受到的伤害', executionKind: 'control' }] },
];

export function getSpirit(name: Starter): SpiritConfig {
  const spirit = SPIRITS.find(item => item.name === name);
  if (!spirit) throw new Error(`Unknown starter: ${name}`);
  return spirit;
}
