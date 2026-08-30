import { assign, createMachine } from 'xstate';
import {
  INTENT_COMBAT_SKILLS,
  createIntentCombatState,
  resolveIntentCombatBattleOnly,
  resolveIntentCombatCall,
  selectIntentCombatCall,
  type IntentBattleMode,
  type IntentBattleSkill,
  type IntentBattleState,
  type IntentCallQuality,
  type IntentSkillId,
  type IntentTurnOutcome,
} from './intent-combat-v1.ts';

export type IntentCombatCall = ReturnType<typeof selectIntentCombatCall>;

export type IntentCombatCounts = Record<IntentCallQuality, number>;

export type IntentCombatContext = {
  battle: IntentBattleState;
  mode: IntentBattleMode;
  selectedCall: IntentCombatCall | null;
  supportUsed: boolean;
  outcome: IntentTurnOutcome | null;
  counts: IntentCombatCounts;
};

export type IntentCombatEvent =
  | { type: 'SELECT_MODE'; mode: IntentBattleMode }
  | { type: 'SELECT_SKILL'; skillId: IntentSkillId }
  | { type: 'USE_SUPPORT' }
  | { type: 'ANSWER'; choice: string }
  | { type: 'CONTINUE' }
  | { type: 'RESTART' };

const INITIAL_COUNTS: IntentCombatCounts = {
  independent: 0,
  supported: 0,
  failed: 0,
};

function createInitialContext(mode: IntentBattleMode = 'with_calls'): IntentCombatContext {
  return {
    battle: createIntentCombatState(),
    mode,
    selectedCall: null,
    supportUsed: false,
    outcome: null,
    counts: { ...INITIAL_COUNTS },
  };
}

function findSkill(skillId: IntentSkillId): IntentBattleSkill {
  const skill = INTENT_COMBAT_SKILLS.find(item => item.skillId === skillId);
  if (!skill) throw new Error(`Unknown intent combat skill: ${skillId}`);
  return skill;
}

function resolveSelectedCall(
  context: IntentCombatContext,
  choice: string,
): { outcome: IntentTurnOutcome; quality: IntentCallQuality } {
  if (!context.selectedCall) throw new Error('Intent combat answer received without a selected call');
  const quality: IntentCallQuality = choice === context.selectedCall.word.targetGloss
    ? context.supportUsed ? 'supported' : 'independent'
    : 'failed';
  return {
    outcome: resolveIntentCombatCall(context.battle, context.selectedCall, quality),
    quality,
  };
}

function applyOutcome(
  context: IntentCombatContext,
  outcome: IntentTurnOutcome,
  quality: IntentCallQuality | null,
): IntentCombatContext {
  return {
    ...context,
    selectedCall: null,
    supportUsed: false,
    outcome,
    counts: quality
      ? { ...context.counts, [quality]: context.counts[quality] + 1 }
      : context.counts,
  };
}

function commitOutcome(context: IntentCombatContext): IntentCombatContext {
  if (!context.outcome) throw new Error('Intent combat cannot commit an empty outcome');
  return {
    ...context,
    battle: context.outcome.state,
    selectedCall: null,
    supportUsed: false,
    outcome: null,
  };
}

export const intentCombatMachine = createMachine({
  id: 'intentCombatV1',
  types: {} as {
    context: IntentCombatContext;
    events: IntentCombatEvent;
  },
  context: createInitialContext(),
  initial: 'skill_select',
  states: {
    skill_select: {
      on: {
        SELECT_SKILL: [
          {
            guard: ({ context }) => context.mode === 'battle_only',
            target: 'player_result',
            actions: assign(({ context, event }) => {
              if (event.type !== 'SELECT_SKILL') return context;
              const outcome = resolveIntentCombatBattleOnly(context.battle, findSkill(event.skillId));
              return applyOutcome(context, outcome, null);
            }),
          },
          {
            target: 'word_call',
            actions: assign(({ context, event }) => {
              if (event.type !== 'SELECT_SKILL') return context;
              return {
                ...context,
                selectedCall: selectIntentCombatCall(findSkill(event.skillId), context.battle.turn),
                supportUsed: false,
              };
            }),
          },
        ],
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
            if (event.type !== 'ANSWER') return context;
            const { outcome, quality } = resolveSelectedCall(context, event.choice);
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
            target: 'won',
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
            target: 'lost',
            actions: assign(({ context }) => commitOutcome(context)),
          },
          {
            target: 'skill_select',
            actions: assign(({ context }) => commitOutcome(context)),
          },
        ],
      },
    },
    won: {},
    lost: {},
  },
  on: {
    RESTART: {
      target: '#intentCombatV1.skill_select',
      actions: assign(({ context }) => createInitialContext(context.mode)),
    },
    SELECT_MODE: {
      target: '#intentCombatV1.skill_select',
      actions: assign(({ event }) => {
        if (event.type !== 'SELECT_MODE') return createInitialContext();
        return createInitialContext(event.mode);
      }),
    },
  },
});

