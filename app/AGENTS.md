# app/AGENTS.md

本文件对 `app/` 下所有 Codex 工作生效，是根目录 `AGENTS.md` 的补充。

## 1. 战斗 / 技能 / 英语调用强制规则

涉及战斗结算、技能、英语调用、倍率、伤害/回复/护盾/减伤、战斗取词时，必须先读：

1. `docs/SKILL_ENGLISH_SYSTEM_V2.md`
2. `docs/SKILL_ENGLISH_SYSTEM_V2_ENGINEERING_LOCK.md`
3. 根目录 `AGENTS.md`

核心契约：

> 技能决定这一回合做什么；英语决定这件事这次发挥多少。

正式 V2 默认：

- 战斗池：`Used-or-Maintained + battleEligible`；
- 战斗层不按技能语义绑定词；
- independent / supported / failed = `1.00 / 0.70 / 0.40`；
- 默认 no-call = `0.40`；
- 思考时间不影响即时倍率。

不得自行调技能、倍率、词与技能关系、结算公式或正式文案。

## 2. Phase B 连续体验

涉及“教学 → 战斗 → 补弱 → 再战”时继续遵守：

- `docs/TEACH_BATTLE_REPAIR_PHASE_B_SPEC.md`
- `docs/TEACH_BATTLE_REPAIR_PHASE_B_HANDOFF.md`

Phase B 仍只属于独立原型，不进入主线。

## 3. Candidate C 当前状态

Candidate C 实现基线：

`3665f6d11771163c307a799e4719b3def53a5c85`

交接：

`docs/PHASE_B_COMBAT_FEEDBACK_CANDIDATE_C_HANDOFF.md`

Sol Review：

`docs/PHASE_B_COMBAT_FEEDBACK_CANDIDATE_C_SOL_REVIEW.md`

状态：

`ENGINEERING PASS / PRODUCT PLAYTEST HOLD`

Candidate C 只在 Phase B 原型中测试：

- 玩家48 / 敌人80 / 敌伤14；
- failed 25%；
- no-call 25%；
- 顺序反馈：skill result → enemy prepare → enemy damage → next turn；
- 战败先明确显示，再进入 repair。

Candidate C 的25/25不是正式 V2 全局值。默认 Phase A 与历史 Candidate A/B 必须继续保留原行为。

仓库存在两份 Candidate C 前置任务稿：以 `docs/PHASE_B_COMBAT_FEEDBACK_CANDIDATE_C_TASK.md` 为权威任务名；`docs/PHASE_B_FEEDBACK_PACING_CANDIDATE_C_TASK.md` 仅作历史参考，不得重复执行。

## 4. 当前停止线

在用户/Sol完成 Candidate C 产品实机裁决前，不得：

- 启动 Candidate D；
- 再调倍率或敌伤；
- 把25%/25%写入正式 V2；
- 修改 `app/page.tsx` 主线；
- 修改 `bridge-config.ts`、`spirit-config.ts`、`zero-base-teaching.ts`、`learning-engine.ts`；
- 修改 `app/narrative/**` 或 EP01–EP03；
- 扩九技能、成长、正式动画、新词、新敌人、新关卡、新剧情或大型系统。

若没有新的明确任务单，停下等待。

## 5. Intent Combat V1 独立例外

用户/Sol已授权 `docs/INTENT_COMBAT_PROTOTYPE_V1_TASK.md`。只可按任务单新增 `/prototype/intent-combat`、独立结算模块、对应验证与 `.intent-` 样式。不得借此修改既有Phase A/B/C、主线或V2正式基线。
