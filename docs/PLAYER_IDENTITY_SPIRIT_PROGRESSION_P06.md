# P0.6 Player Identity × Spirit Progression

Status: implementation candidate, pending Sol real-device review.

## Frozen scope

- EP02 remains paused. No new narrative, spirit, question layer, or worldbuilding was added.
- EP01 keeps the approved v3 structure. The only narrative text change is the explicitly approved identity rename `岑婆` → `岑姨`.
- The starter selection now intentionally exposes early combat roles. This P0.6 ruling supersedes the older “hide role labels during first choice” rule.

## Before → after audit

| Area | Before P0.6 | P0.6 implementation |
| --- | --- | --- |
| Player context | EP01 prose only | Opening system context identifies Fog Harbor as the player's long-term home |
| Character relationship | Names only | First-use identity strips: `阿洛｜你的老朋友`, `岑姨｜语灵站负责人` |
| Starter choice | Name, art, button | Role, playstyle sentence, two known skills, Lv.3 skill preview |
| Skills | All three always selectable | Two skills at Lv.1; third skill enters runtime selection at Lv.3 |
| Level | XP existed | XP sources remain effective learning, stable combat execution, weakness recovery, and battle clear; UI shows the consequence |
| Stars | Not represented | 1–5 star framework backed by mastery-quality evidence, independent of XP |
| Resonance | Routine answers also granted resonance | Routine XP/mastery no longer grants resonance; resonance is reserved for companion milestones (EP03/06/07/10) |
| Training meaning | Source counts only | Guide = XP/level/skills; maintenance = mastery/stars; targeted = repair/retry |
| Training result | Per-answer toast only | Growth settlement shows XP, level change, unlocked skill, stars, mastery and resonance role |

## Configured rules

- Level XP and thresholds: `app/game/growth.ts / GROWTH_RULES`.
- Star mastery evidence and thresholds: same configuration; a first exposure grants no long-term mastery quality.
- A retained review grants mastery evidence; fast responses and future approved L2/L3 depth can add quality bonuses.
- Skill availability and unlock levels: `app/game/spirit-config.ts`.
- Exploration, response-time and skill-effect values remain in `app/game/bridge-config.ts`.
- FSRS still decides when a word returns. P0.6 does not replace or bypass scheduling.

## Runtime acceptance evidence

- Save schema migrated to v8 with safe defaults for `stars` and `masteryQuality`.
- Gameplay validator checks: two initial skills, Lv.3 third-skill unlock, no routine resonance, first exposure not counted as mastery, fast retained review quality, anti-repeat evidence.
- Lint, production build, gameplay, learning-adventure, dev-preset and narrative validators pass.

## Sol review items

1. On a phone, can a new player say who they are, who A-Luo and Cen Yi are, and why they are together?
2. Does the starter card create a real “guard / burst / support” preference without becoming a spreadsheet?
3. After first guide training, is the XP/level/skill result visible enough to explain why training matters?
4. Is Lv.3 close enough for the early demo pacing? Thresholds remain configurable and are not frozen by this sprint.
5. Does the star explanation communicate long-term mastery without promising an immediate star-up in the first session?

## Deliberately not implemented

- No formal evolution, evolution countdown, formal star-up effects, L2/L3 runtime, EP02 content, or new spirit.
- Star weighting is an initial configurable framework, not a finalized learning-science calibration.
- Formal skill animation and final battle balance remain later review work.
