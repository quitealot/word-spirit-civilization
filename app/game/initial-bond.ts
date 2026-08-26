import type { StarterId } from './save.ts';
import type { StarterSkillId } from './skill-guidance.ts';

export type BondTendency = 'guard' | 'assault' | 'support';

export type BondSituation = {
  id: string;
  prompt: string;
  options: readonly { id: string; text: string; tendency: BondTendency }[];
};

export type BondSkillTrial = {
  spiritId: StarterId;
  skillId: StarterSkillId;
  skillName: string;
  roleLabel: string;
  instruction: string;
  wordIds: readonly string[];
  fullEffect: string;
};

/** System-layer prototype content. It is not formal narrative dialogue. */
export const BOND_SITUATIONS: readonly BondSituation[] = [
  { id: 'bond.situation.01', prompt: '队伍经过一段不稳的旧路，你更习惯先做什么？', options: [
    { id: 'guard', text: '先确认大家都站稳', tendency: 'guard' },
    { id: 'assault', text: '尽快清掉前面的障碍', tendency: 'assault' },
    { id: 'support', text: '留意每个人的状态再走', tendency: 'support' },
  ] },
  { id: 'bond.situation.02', prompt: '前方突然出现威胁，你第一反应更接近？', options: [
    { id: 'assault', text: '抢先出手，不给它靠近的机会', tendency: 'assault' },
    { id: 'support', text: '观察变化，随时补上缺口', tendency: 'support' },
    { id: 'guard', text: '挡在最容易受伤的位置', tendency: 'guard' },
  ] },
  { id: 'bond.situation.03', prompt: '一次配合没有成功，你更想怎样调整？', options: [
    { id: 'support', text: '先让节奏恢复稳定', tendency: 'support' },
    { id: 'guard', text: '找出风险，避免再次失误', tendency: 'guard' },
    { id: 'assault', text: '换个更直接的办法再试', tendency: 'assault' },
  ] },
  { id: 'bond.situation.04', prompt: '如果只能给伙伴一个明确指令，你会选？', options: [
    { id: 'guard', text: '稳住，我们一起扛过去', tendency: 'guard' },
    { id: 'assault', text: '抓住机会，现在就上', tendency: 'assault' },
    { id: 'support', text: '别急，我会跟上你的状态', tendency: 'support' },
  ] },
] as const;

export const BOND_SKILL_TRIALS: readonly BondSkillTrial[] = [
  { spiritId: '芽语', skillId: 'yayu_bud_guard', skillName: '护芽', roleLabel: '守护', instruction: '稳定三个引导词，观察护盾怎样成形。', wordIds: ['w1233', 'w2670', 'w2341'], fullEffect: '形成完整护盾，吸收下一次伤害' },
  { spiritId: '烬尾', skillId: 'jinwei_flame_tail', skillName: '焰尾', roleLabel: '强攻', instruction: '稳定三个引导词，观察爆发伤害。', wordIds: ['w17', 'w13', 'w2102'], fullEffect: '焰尾完整发动，造成高额伤害' },
  { spiritId: '澜歌', skillId: 'lange_returning_tide', skillName: '回潮', roleLabel: '支援', instruction: '稳定三个引导词，观察恢复效果。', wordIds: ['w1235', 'w1917', 'w1934'], fullEffect: '回潮完整发动，恢复伙伴状态' },
] as const;

const STARTER_BY_TENDENCY: Record<BondTendency, StarterId> = { guard: '芽语', assault: '烬尾', support: '澜歌' };

export function recommendBondStarter(tendencies: readonly BondTendency[]): StarterId {
  const counts: Record<BondTendency, number> = { guard: 0, assault: 0, support: 0 };
  tendencies.forEach(tendency => { counts[tendency] += 1; });
  const order: BondTendency[] = ['guard', 'assault', 'support'];
  const winner = order.reduce((best, candidate) => counts[candidate] > counts[best] ? candidate : best, order[0]);
  return STARTER_BY_TENDENCY[winner];
}

export function trialEffectPercent(correctCount: number, total = 3): number {
  if (total <= 0) return 0;
  return Math.max(30, Math.round((correctCount / total) * 100));
}
