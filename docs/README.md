# 《语灵》GitHub 协作索引

本仓库是用户、Sol、DeepSeek 与 Codex 的协作真源。进入项目后，Codex 必须先读根目录 [`AGENTS.md`](../AGENTS.md)，再读 [`CODEX_PROJECT_MEMORY.md`](./CODEX_PROJECT_MEMORY.md)。若历史文档或旧代码冲突，以较新的冻结裁决为准。

## 当前最高优先级

- [`AGENTS.md`](../AGENTS.md)：项目级常驻规则与当前停止线。
- [`CODEX_PROJECT_MEMORY.md`](./CODEX_PROJECT_MEMORY.md)：当前项目记忆。
- [`PHASE_B_COMBAT_FEEDBACK_CANDIDATE_C_SOL_REVIEW.md`](./PHASE_B_COMBAT_FEEDBACK_CANDIDATE_C_SOL_REVIEW.md)：Candidate C 当前 `ENGINEERING PASS / PRODUCT PLAYTEST HOLD`。
- [`PHASE_B_COMBAT_FEEDBACK_CANDIDATE_C_HANDOFF.md`](./PHASE_B_COMBAT_FEEDBACK_CANDIDATE_C_HANDOFF.md)：Candidate C 工程交接。
- [`PHASE_B_COMBAT_FEEDBACK_CANDIDATE_C_TASK.md`](./PHASE_B_COMBAT_FEEDBACK_CANDIDATE_C_TASK.md)：Candidate C 权威前置任务稿。
- [`PHASE_B_COMBAT_PRESSURE_CANDIDATE_B_SOL_VERDICT.md`](./PHASE_B_COMBAT_PRESSURE_CANDIDATE_B_SOL_VERDICT.md)：Candidate B `NOT PASS / FEEDBACK UNREADABLE / BALANCE HOLD`。
- [`PHASE_B_COMBAT_PRESSURE_CANDIDATE_A_SOL_VERDICT.md`](./PHASE_B_COMBAT_PRESSURE_CANDIDATE_A_SOL_VERDICT.md)：Candidate A `NOT PASS / PRESSURE TOO LOW / CLOSED`。
- [`TEACH_BATTLE_REPAIR_PHASE_B_HANDOFF.md`](./TEACH_BATTLE_REPAIR_PHASE_B_HANDOFF.md)：Phase B 连续体验工程交接。
- [`SKILL_ENGLISH_SYSTEM_V2.md`](./SKILL_ENGLISH_SYSTEM_V2.md)：技能 × 英语系统 V2 产品规格。
- [`SKILL_ENGLISH_SYSTEM_V2_ENGINEERING_LOCK.md`](./SKILL_ENGLISH_SYSTEM_V2_ENGINEERING_LOCK.md)：V2 工程语义锁定。
- [`SKILL_ENGLISH_SYSTEM_V2_PHASE_A_SOL_ACCEPTANCE.md`](./SKILL_ENGLISH_SYSTEM_V2_PHASE_A_SOL_ACCEPTANCE.md)：Phase A `PASS / CLOSED`。

## 当前状态摘要

1. 正式名称：《语灵》；“词灵”为废弃旧称。
2. 正式 5505 Excel 是词汇唯一真源。
3. EP01 v6、EP02 v1.1、EP03 v1.1 已 `FROZEN / APPROVED`。
4. Phase A 已 `PASS / CLOSED`；默认 debug：48/60/8 + failed40/no-call40。
5. Phase B “教学 → 战斗 → 补弱 → 再战”已实现，仍只属于独立原型。
6. Candidate A `48/80/12 + 40/40`：产品不通过，压力偏低。
7. Candidate B `48/80/14 + 40/40`：产品不通过，反馈不可读。
8. Candidate C 已实现：`48/80/14 + failed25/no-call25`，采用成熟顺序回合反馈，战败先明确显示再 repair。
9. Candidate C 实现 commit：`3665f6d11771163c307a799e4719b3def53a5c85`；最终交接：`e24756b328803859882dd14929a4c00861cbaf97`。
10. Candidate C 工程 Review 通过，但**产品仍等待用户/Sol实机体验裁决**；25/25尚未成为正式 V2 全局值。
11. 当前禁止 Candidate D、继续调倍率/敌伤、迁移主线九技能或修改 EP01–EP03。
12. 仓库另一份 `PHASE_B_FEEDBACK_PACING_CANDIDATE_C_TASK.md` 仅作历史前置稿，不得当成新任务重复执行。

## Candidate C 当前实机只需判断

- 是否能清楚区分“我的技能结果”和“敌方行动结果”；
- 回潮 failed 的 `3伤害 +6回复` 是否仍显得奖励过多；
- 一次 failed 是否仍有挽回空间；
- 约2.8秒非击杀反馈是否清楚而不拖沓；
- `战斗失利 → repair → 自动再战` 是否清楚但不中断动机。

## 历史/专项文档

- [`PHASE_B_FEEDBACK_PACING_CANDIDATE_C_TASK.md`](./PHASE_B_FEEDBACK_PACING_CANDIDATE_C_TASK.md)：Candidate C 历史前置稿，不再作为执行入口。
- [`PHASE_B_COMBAT_PRESSURE_CANDIDATE_B_TASK.md`](./PHASE_B_COMBAT_PRESSURE_CANDIDATE_B_TASK.md)：Candidate B 历史任务。
- [`PHASE_B_COMBAT_PRESSURE_CANDIDATE_A_TASK.md`](./PHASE_B_COMBAT_PRESSURE_CANDIDATE_A_TASK.md)：Candidate A 历史任务。
- [`TEACH_BATTLE_REPAIR_PHASE_B_MIGRATION_TASK.md`](./TEACH_BATTLE_REPAIR_PHASE_B_MIGRATION_TASK.md)：Phase B 已执行迁移任务。
- [`SKILL_ENGLISH_SYSTEM_V2_PHASE_A_MIGRATION_TASK.md`](./SKILL_ENGLISH_SYSTEM_V2_PHASE_A_MIGRATION_TASK.md)：Phase A 历史任务。
- [`current-project-status.md`](./current-project-status.md)：历史项目状态快照。
