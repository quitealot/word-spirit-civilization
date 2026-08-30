import { assign, createMachine } from 'xstate';
import {
  INTENT_COMBAT_SKILLS,
  INTENT_COMBAT_WORDS,
  createIntentCombatState,
  resolveIntentCombatCall,
  type IntentBattleSkill,
  type IntentBattleState,
  type IntentBattleWord,
  type IntentCallQuality,
  type IntentSkillId,
  type IntentTurnOutcome,
  type IntentWeakness,
} from './intent-combat-v1.ts';
import { getFusionBattleEligibleWords } from './fusion-slice.ts';
import type { ZeroBaseProgress } from './zero-base-teaching.ts';

export type LearningIntentCall = {
  skill: IntentBattleSkill;
  word: IntentBattleWord;
};

export type LearningIntentContext = {
  eligibleWords: IntentBattleWord[];
  battle: IntentBattleState;
  selectedCall: LearningIntentCall | null;
  supportUsed: boolean;
  outcome: IntentTurnOutcome | null;
  counts: Record<IntentCallQuality, number>;
  battleNumber: number;
  callNumber: number;
  justUsedVisible: boolean;
  repairQueue: IntentWeakness[];
  repairIndex: number;
  rematchWordIds: IntentWeakness['wordId'][];
};

export type LearningIntentEvent =
  | { type: 'CHECK_EVIDENCE'; eligibleWords: readonly IntentBattleWord[] }
  | { type: 'SELECT_SKILL'; skillId: IntentSkillId }
  | { type: 'USE_SUPPORT' }
  | { type: 'ANSWER'; choice: string }
  | { type: 'CONTINUE' }
  | { type: 'START_REPAIR' }
  | { type: 'REPAIR_MEANING_CONTINUE' }
  | { type: 'REPAIR_ANSWER'; choice: string }
  | { type: 'RESTART' };

const INITIAL_COUNTS: Record<IntentCallQuality, number> = {
  independent: 0,
  supported: 0,
  failed: 0,
};

function createInitialContext(eligibleWords: readonly IntentBattleWord[] = []): LearningIntentContext {
  return {
    eligibleWords: [...eligibleWords],
    battle: createIntentCombatState(),
    selectedCall: null,
    supportUsed: false,
    outcome: null,
    counts: { ...INITIAL_COUNTS },
    battleNumber: 1,
    callNumber: 0,
    justUsedVisible: false,
    repairQueue: [],
    repairIndex: 0,
    rematchWordIds: [],
  };
}

function findSkill(skillId: IntentSkillId): IntentBattleSkill {
  const skill = INTENT_COMBAT_SKILLS.find(item => item.skillId === skillId);
  if (!skill) throw new Error(`Unknown intent combat skill: ${skillId}`);
  return skill;
}

/** The continuous loop derives the eligible pool from the existing teaching evidence. */
export function getLearningIntentEligibleWords(progress: ZeroBaseProgress): IntentBattleWord[] {
  const eligibleIds = new Set(getFusionBattleEligibleWords(progress).map(item => item.wordId));
  return INTENT_COMBAT_WORDS.filter(word => eligibleIds.has(word.wordId));
}

export function createLearningIntentRepairQueue(weaknesses: readonly IntentWeakness[]): IntentWeakness[] {
  const seen = new Set<IntentWeakness['wordId']>();
  return weaknesses.filter(item => {
    if (seen.has(item.wordId)) return false;
    seen.add(item.wordId);
    return true;
  });
}

function selectLearningIntentCall(context: LearningIntentContext, skill: IntentBattleSkill): LearningIntentCall {
  if (context.eligibleWords.length === 0) throw new Error('PENDING_K3: intent-loop evidence missing');
  const forcedWordId = context.rematchWordIds[context.callNumber];
  const forcedWord = forcedWordId ? context.eligibleWords.find(word => word.wordId === forcedWordId) : undefined;
  const word = forcedWord ?? context.eligibleWords[(context.battle.turn - 1) % context.eligibleWords.length];
  return { skill, word };
}

function applyOutcome(
  context: LearningIntentContext,
  outcome: IntentTurnOutcome,
  quality: IntentCallQuality,
): LearningIntentContext {
  return {
    ...context,
    selectedCall: null,
    supportUsed: false,
    justUsedVisible: false,
    outcome,
    counts: { ...context.counts, [quality]: context.counts[quality] + 1 },
  };
}

function commitOutcome(context: LearningIntentContext): LearningIntentContext {
  if (!context.outcome) throw new Error('Intent loop cannot commit an empty outcome');
  const battle = context.outcome.state;
  const terminal = battle.result !== 'active';
  return {
    ...context,
    battle,
    selectedCall: null,
    supportUsed: false,
    justUsedVisible: false,
    outcome: null,
    repairQueue: terminal ? createLearningIntentRepairQueue(battle.weaknesses) : context.repairQueue,
    repairIndex: terminal ? 0 : context.repairIndex,
  };
}

function prepareRematch(context: LearningIntentContext): LearningIntentContext {
  return {
    ...context,
    battle: createIntentCombatState(),
    selectedCall: null,
    supportUsed: false,
    outcome: null,
    battleNumber: context.battleNumber + 1,
    callNumber: 0,
    justUsedVisible: false,
    rematchWordIds: context.repairQueue.map(item => item.wordId),
    repairQueue: [],
    repairIndex: 0,
  };
}

function restartBattle(context: LearningIntentContext): LearningIntentContext {
  return {
    ...createInitialContext(context.eligibleWords),
    battleNumber: 1,
  };
}

function setEvidence(context: LearningIntentContext, eligibleWords: readonly IntentBattleWord[]): LearningIntentContext {
  return createInitialContext(eligibleWords);
}

function answerQuality(context: LearningIntentContext, choice: string): IntentCallQuality {
  if (!context.selectedCall) throw new Error('Intent loop answer received without a selected call');
  if (choice !== context.selectedCall.word.targetGloss) return 'failed';
  return context.supportUsed ? 'supported' : 'independent';
}

function repairTarget(context: LearningIntentContext): IntentWeakness | undefined {
  return context.repairQueue[context.repairIndex];
}

function repairTargetGloss(context: LearningIntentContext): string | undefined {
  const target = repairTarget(context);
  return target ? INTENT_COMBAT_WORDS.find(word => word.wordId === target.wordId)?.targetGloss : undefined;
}

export const learningIntentMachine = createMachine({
  id: 'learningIntentV1',
  types: {} as {
    context: LearningIntentContext;
    events: LearningIntentEvent;
  },
  context: createInitialContext(),
  initial: 'checking_evidence',
  states: {
    checking_evidence: {
      on: {
        CHECK_EVIDENCE: [
          {
            guard: ({ event }) => event.type === 'CHECK_EVIDENCE' && event.eligibleWords.length > 0,
            target: 'skill_select',
            actions: assign(({ context, event }) => event.type === 'CHECK_EVIDENCE'
              ? setEvidence(context, event.eligibleWords)
              : context),
          },
          {
            target: 'evidence_missing',
            actions: assign(({ context, event }) => event.type === 'CHECK_EVIDENCE'
              ? setEvidence(context, event.eligibleWords)
              : context),
          },
        ],
      },
    },
    evidence_missing: {
      on: {
        CHECK_EVIDENCE: [
          {
            guard: ({ event }) => event.type === 'CHECK_EVIDENCE' && event.eligibleWords.length > 0,
            target: 'skill_select',
            actions: assign(({ context, event }) => event.type === 'CHECK_EVIDENCE'
              ? setEvidence(context, event.eligibleWords)
              : context),
          },
          {
            target: 'evidence_missing',
            actions: assign(({ context, event }) => event.type === 'CHECK_EVIDENCE'
              ? setEvidence(context, event.eligibleWords)
              : context),
          },
        ],
      },
    },
    skill_select: {
      on: {
        SELECT_SKILL: {
          guard: ({ context }) => context.battle.result === 'active' && context.eligibleWords.length > 0,
          target: 'word_call',
          actions: assign(({ context, event }) => {
            if (event.type !== 'SELECT_SKILL') return context;
            return {
              ...context,
              selectedCall: selectLearningIntentCall(context, findSkill(event.skillId)),
              supportUsed: false,
              justUsedVisible: context.battleNumber === 1 && context.callNumber === 0,
              callNumber: context.callNumber + 1,
            };
          }),
        },
      },
    },
    word_call: {
      on: {
        USE_SUPPORT: {
          actions: assign({ supportUsed: true }),
        },
        ANSWER: {
          target: 'player_result',
          actions: assign(({ context, event }) => {
            if (event.type !== 'ANSWER' || !context.selectedCall) return context;
            const quality = answerQuality(context, event.choice);
            const outcome = resolveIntentCombatCall(context.battle, context.selectedCall, quality);
            return applyOutcome(context, outcome, quality);
          }),
        },
      },
    },
    player_result: {
      on: {
        CONTINUE: [
          {
            guard: ({ context }) => context.outcome?.state.result === 'won',
            target: 'battle_won',
            actions: assign(({ context }) => commitOutcome(context)),
          },
          {
            target: 'enemy_result',
          },
        ],
      },
    },
    enemy_result: {
      on: {
        CONTINUE: [
          {
            guard: ({ context }) => context.outcome?.state.result === 'lost',
            target: 'battle_lost',
            actions: assign(({ context }) => commitOutcome(context)),
          },
          {
            target: 'skill_select',
            actions: assign(({ context }) => commitOutcome(context)),
          },
        ],
      },
    },
    battle_won: {
      on: {
        CONTINUE: [
          {
            guard: ({ context }) => context.repairQueue.length > 0,
            target: 'repair_review',
          },
          {
            target: 'complete',
          },
        ],
      },
    },
    battle_lost: {
      on: {
        CONTINUE: [
          {
            guard: ({ context }) => context.repairQueue.length > 0,
            target: 'repair_review',
          },
          {
            target: 'complete',
          },
        ],
      },
    },
    repair_review: {
      on: {
        START_REPAIR: {
          guard: ({ context }) => context.repairQueue.length > 0,
          target: 'repair_meaning',
        },
      },
    },
    repair_meaning: {
      on: {
        REPAIR_MEANING_CONTINUE: {
          guard: ({ context }) => Boolean(repairTarget(context)),
          target: 'repair_retrieve',
        },
      },
    },
    repair_retrieve: {
      on: {
        REPAIR_ANSWER: [
          {
            guard: ({ context, event }) => event.type === 'REPAIR_ANSWER'
              && Boolean(repairTarget(context))
              && event.choice === repairTargetGloss(context)
              && context.repairIndex + 1 >= context.repairQueue.length,
            target: 'rematch',
            actions: assign(({ context }) => prepareRematch(context)),
          },
          {
            guard: ({ context, event }) => event.type === 'REPAIR_ANSWER'
              && Boolean(repairTarget(context))
              && event.choice === repairTargetGloss(context)
              && context.repairIndex + 1 < context.repairQueue.length,
            target: 'repair_meaning',
            actions: assign(({ context }) => ({ ...context, repairIndex: context.repairIndex + 1 })),
          },
          {
            target: 'repair_meaning',
          },
        ],
      },
    },
    rematch: {
      always: {
        target: 'skill_select',
      },
    },
    complete: {
      on: {
        RESTART: {
          target: 'skill_select',
          actions: assign(({ context }) => restartBattle(context)),
        },
      },
    },
  },
  on: {
    RESTART: {
      guard: ({ context }) => context.eligibleWords.length > 0,
      target: '#learningIntentV1.skill_select',
      actions: assign(({ context }) => restartBattle(context)),
    },
  },
});

export type LearningIntentMachineState = typeof learningIntentMachine;
