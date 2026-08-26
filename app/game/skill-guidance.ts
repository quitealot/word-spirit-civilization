import { VOCABULARY_BY_ID } from '../vocabulary.ts';
import type { StarterId } from './save.ts';
import { BRIDGE_V1_RULES, resolveExecutionQuality, resolveSkillMultiplier } from './bridge-config.ts';

export type StarterSkillId =
  | 'yayu_leaf_pat'
  | 'yayu_bud_guard'
  | 'yayu_root'
  | 'jinwei_spark'
  | 'jinwei_flame_tail'
  | 'jinwei_charge'
  | 'lange_water_tone'
  | 'lange_returning_tide'
  | 'lange_still_wave';

export type SignatureGuidanceRelation = {
  wordId: string;
  word: string;
  spiritId: StarterId;
  skillId: StarterSkillId;
  skillName: string;
};

/**
 * Extra memory associations only. They never decide which word is allowed to
 * drive a skill; the battle question selector remains global and FSRS-led.
 */
export const SIGNATURE_GUIDANCE_RELATIONS: readonly SignatureGuidanceRelation[] = [
  { wordId: 'w1', word: 'grow', spiritId: '芽语', skillId: 'yayu_leaf_pat', skillName: '叶拍' },
  { wordId: 'w11', word: 'increase', spiritId: '芽语', skillId: 'yayu_leaf_pat', skillName: '叶拍' },
  { wordId: 'w12', word: 'remain', spiritId: '芽语', skillId: 'yayu_root', skillName: '扎根' },
  { wordId: 'w1233', word: 'protect', spiritId: '芽语', skillId: 'yayu_bud_guard', skillName: '护芽' },
  { wordId: 'w2670', word: 'support', spiritId: '芽语', skillId: 'yayu_bud_guard', skillName: '护芽' },
  { wordId: 'w2341', word: 'maintain', spiritId: '芽语', skillId: 'yayu_bud_guard', skillName: '护芽' },
  { wordId: 'w2479', word: 'preserve', spiritId: '芽语', skillId: 'yayu_root', skillName: '扎根' },

  { wordId: 'w20', word: 'focus', spiritId: '烬尾', skillId: 'jinwei_charge', skillName: '蓄火' },
  { wordId: 'w17', word: 'target', spiritId: '烬尾', skillId: 'jinwei_flame_tail', skillName: '焰尾' },
  { wordId: 'w13', word: 'achieve', spiritId: '烬尾', skillId: 'jinwei_flame_tail', skillName: '焰尾' },
  { wordId: 'w1842', word: 'affect', spiritId: '烬尾', skillId: 'jinwei_spark', skillName: '火星' },
  { wordId: 'w2102', word: 'determine', spiritId: '烬尾', skillId: 'jinwei_flame_tail', skillName: '焰尾' },
  { wordId: 'w1214', word: 'prepare', spiritId: '烬尾', skillId: 'jinwei_charge', skillName: '蓄火' },

  { wordId: 'w1934', word: 'calm', spiritId: '澜歌', skillId: 'lange_still_wave', skillName: '静波' },
  { wordId: 'w1235', word: 'provide', spiritId: '澜歌', skillId: 'lange_returning_tide', skillName: '回潮' },
  { wordId: 'w1917', word: 'benefit', spiritId: '澜歌', skillId: 'lange_returning_tide', skillName: '回潮' },
  { wordId: 'w1283', word: 'reduce', spiritId: '澜歌', skillId: 'lange_water_tone', skillName: '水音' },
  { wordId: 'w1219', word: 'prevent', spiritId: '澜歌', skillId: 'lange_still_wave', skillName: '静波' },
] as const;

export type SkillRelationshipProgress = {
  proficiency: number;
  resonance: number;
  signatureWordIdsSeen: string[];
  successfulCalls: number;
  hesitantCalls: number;
  failedCalls: number;
};

export type SpiritSkillRelationshipStore = {
  skills: Partial<Record<StarterSkillId, SkillRelationshipProgress>>;
  recentWeaknesses: SkillWeaknessEvidence[];
};

export type SkillWeaknessEvidence = {
  wordId: string;
  word: string;
  spiritId: string;
  skillId: StarterSkillId | 'companion_cover' | 'companion_soften';
  skillName: string;
  quality: 'hesitant' | 'failed';
  effectPercent: number;
};

const RELATIONSHIP_STORE_KEY = 'word-spirit-skill-guidance-v1';

export function assertSignatureGuidanceIntegrity(): void {
  if (SIGNATURE_GUIDANCE_RELATIONS.length !== 18) throw new Error('Signature guidance must contain exactly 18 relations');
  const wordIds = new Set<string>();
  for (const relation of SIGNATURE_GUIDANCE_RELATIONS) {
    const entry = VOCABULARY_BY_ID.get(relation.wordId);
    if (!entry || entry.word !== relation.word) throw new Error(`Signature relation source mismatch: ${relation.wordId}/${relation.word}`);
    if (wordIds.has(relation.wordId)) throw new Error(`Duplicate signature wordId: ${relation.wordId}`);
    wordIds.add(relation.wordId);
  }
}

export function getSignatureGuidance(wordId: string, spiritId?: string, skillId?: string): SignatureGuidanceRelation | undefined {
  return SIGNATURE_GUIDANCE_RELATIONS.find(relation => relation.wordId === wordId
    && (!spiritId || relation.spiritId === spiritId)
    && (!skillId || relation.skillId === skillId));
}

export function getSignatureGuidanceForSkill(skillId: StarterSkillId): readonly SignatureGuidanceRelation[] {
  return SIGNATURE_GUIDANCE_RELATIONS.filter(relation => relation.skillId === skillId);
}

export function loadSkillRelationshipStore(): SpiritSkillRelationshipStore {
  if (typeof window === 'undefined') return { skills: {}, recentWeaknesses: [] };
  try {
    const parsed = JSON.parse(window.localStorage.getItem(RELATIONSHIP_STORE_KEY) || '{"skills":{},"recentWeaknesses":[]}') as Partial<SpiritSkillRelationshipStore>;
    return parsed && typeof parsed === 'object' && parsed.skills
      ? { skills: parsed.skills, recentWeaknesses: Array.isArray(parsed.recentWeaknesses) ? parsed.recentWeaknesses : [] }
      : { skills: {}, recentWeaknesses: [] };
  } catch {
    return { skills: {}, recentWeaknesses: [] };
  }
}

export function recordSkillRelationshipCall(options: {
  skillId: StarterSkillId;
  wordId: string;
  quality: 'stable' | 'hesitant' | 'failed';
}): SkillRelationshipProgress {
  const store = loadSkillRelationshipStore();
  const current = store.skills[options.skillId] ?? {
    proficiency: 0,
    resonance: 0,
    signatureWordIdsSeen: [],
    successfulCalls: 0,
    hesitantCalls: 0,
    failedCalls: 0,
  };
  const signature = Boolean(getSignatureGuidance(options.wordId, undefined, options.skillId));
  const next: SkillRelationshipProgress = {
    proficiency: current.proficiency + (options.quality === 'stable' ? 2 : options.quality === 'hesitant' ? 1 : 0),
    resonance: current.resonance + (signature && options.quality !== 'failed' ? 1 : 0),
    signatureWordIdsSeen: signature
      ? Array.from(new Set([...current.signatureWordIdsSeen, options.wordId]))
      : current.signatureWordIdsSeen,
    successfulCalls: current.successfulCalls + (options.quality === 'stable' ? 1 : 0),
    hesitantCalls: current.hesitantCalls + (options.quality === 'hesitant' ? 1 : 0),
    failedCalls: current.failedCalls + (options.quality === 'failed' ? 1 : 0),
  };
  store.skills[options.skillId] = next;
  if (typeof window !== 'undefined') window.localStorage.setItem(RELATIONSHIP_STORE_KEY, JSON.stringify(store));
  return next;
}

export function recordSkillWeakness(evidence: SkillWeaknessEvidence): void {
  const store = loadSkillRelationshipStore();
  const withoutSameCall = store.recentWeaknesses.filter(item => !(item.wordId === evidence.wordId && item.skillId === evidence.skillId));
  store.recentWeaknesses = [evidence, ...withoutSameCall].slice(0, 12);
  if (typeof window !== 'undefined') window.localStorage.setItem(RELATIONSHIP_STORE_KEY, JSON.stringify(store));
}

export function recoverSkillWeakness(wordId: string, skillId?: string): void {
  const store = loadSkillRelationshipStore();
  store.recentWeaknesses = store.recentWeaknesses.filter(item => item.wordId !== wordId || (skillId && item.skillId !== skillId));
  if (typeof window !== 'undefined') window.localStorage.setItem(RELATIONSHIP_STORE_KEY, JSON.stringify(store));
}

export function resetSkillRelationshipStore(): void {
  if (typeof window !== 'undefined') window.localStorage.removeItem(RELATIONSHIP_STORE_KEY);
}

export function resolveBudGuardPrototype(correct: boolean, latencyMs: number) {
  const quality = resolveExecutionQuality(correct, latencyMs);
  const multiplier = resolveSkillMultiplier('shield', correct, latencyMs);
  const fullShield = BRIDGE_V1_RULES.skillEffects.yayu_bud_guard.shield;
  const shield = Math.round(fullShield * multiplier);
  const damageTaken = Math.max(0, BRIDGE_V1_RULES.prototypeAcceptance.enemyAttack - shield);
  const remainingHp = Math.max(0, BRIDGE_V1_RULES.prototypeAcceptance.playerHp - damageTaken);
  return {
    quality,
    multiplier,
    effectPercent: Math.round(multiplier * 100),
    shield,
    damageTaken,
    remainingHp,
    defeated: remainingHp === 0,
  };
}
