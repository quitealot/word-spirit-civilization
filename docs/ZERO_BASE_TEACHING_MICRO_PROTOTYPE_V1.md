# Zero-base Teaching Micro Prototype V1

Status: IMPLEMENTED FOR SOL PLAYTEST

Independent route: `/prototype/zero-base`

This prototype does not change EP01–EP03, growth tuning, FSRS scheduling, or the formal narrative layer. It only tests whether a zero-base learner can complete a small world event through five formally sourced words.

## Formal source lock

| wordId | word | displayed sense | formal source row |
| --- | --- | --- | ---: |
| w1156 | people | 人；人们 | 1157 |
| w1718 | water | 水 | 1719 |
| w1042 | need | 需要 | 1043 |
| w265 | choose | 选择 | 266 |
| w729 | help | 帮助 | 730 |

The runtime also retains each exact full `中文义项` string for traceability. No field in the source workbook was changed.

## Frozen loop

World need → name the new English → use it immediately → reuse old words for a new meaning → withdraw support → let English drive action.

The help ladder is: world replay → word gloss → segmented bilingual support → full sentence translation. If full translation is used, Chinese is hidden and the player must perform the action again.

After the first `help` action, the prototype creates a four-second no-English rest beat before the three final actions.

## Evidence model

Every word records timestamped evidence through `Introduced → Guided → Retrieved → Used`. `Maintained` is defined for the future but is not awarded inside this short session. State is stored under a prototype-only localStorage key and can be fully reset from the top bar.

## Sol playtest questions

1. Did this feel like doing a small thing in the world rather than completing five vocabulary cards?
2. Can a zero-base learner independently understand `People need water.`, `choose water`, and `help people` after playing?
