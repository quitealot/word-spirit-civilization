# 《语灵》GitHub 协作索引

本仓库是用户、Sol、DeepSeek 与 Codex 的协作真源。进入项目后，Codex 必须先读根目录 [`AGENTS.md`](../AGENTS.md)，再读 [`CODEX_PROJECT_MEMORY.md`](./CODEX_PROJECT_MEMORY.md)。若历史文档或旧代码冲突，以较新的冻结裁决为准。

## 当前最高优先级

- [`AGENTS.md`](../AGENTS.md)：项目级常驻规则与当前授权。
- [`CODEX_PROJECT_MEMORY.md`](./CODEX_PROJECT_MEMORY.md)：当前项目记忆与停止线。
- [`PHASE_B_COMBAT_PRESSURE_CANDIDATE_B_TASK.md`](./PHASE_B_COMBAT_PRESSURE_CANDIDATE_B_TASK.md)：**当前唯一新增工程任务**，只做 Phase B Candidate B 单变量压力测试。
- [`PHASE_B_COMBAT_PRESSURE_CANDIDATE_A_SOL_VERDICT.md`](./PHASE_B_COMBAT_PRESSURE_CANDIDATE_A_SOL_VERDICT.md)：Candidate A 最终 `NOT PASS / 压力偏低` 裁决。
- [`PHASE_B_COMBAT_PRESSURE_CANDIDATE_A_HANDOFF.md`](./PHASE_B_COMBAT_PRESSURE_CANDIDATE_A_HANDOFF.md)：Candidate A 已实现工程交接，保留作历史基线。
- [`TEACH_BATTLE_REPAIR_PHASE_B_HANDOFF.md`](./TEACH_BATTLE_REPAIR_PHASE_B_HANDOFF.md)：Phase B 连续体验已实现的工程交接。
- [`TEACH_BATTLE_REPAIR_PHASE_B_SPEC.md`](./TEACH_BATTLE_REPAIR_PHASE_B_SPEC.md)：Phase B 产品规格。
- [`SKILL_ENGLISH_SYSTEM_V2.md`](./SKILL_ENGLISH_SYSTEM_V2.md)：技能 × 英语系统 V2 产品规格。
- [`SKILL_ENGLISH_SYSTEM_V2_ENGINEERING_LOCK.md`](./SKILL_ENGLISH_SYSTEM_V2_ENGINEERING_LOCK.md)：V2 结算、取整、no-call 等工程锁定。
- [`SKILL_ENGLISH_SYSTEM_V2_PHASE_A_SOL_ACCEPTANCE.md`](./SKILL_ENGLISH_SYSTEM_V2_PHASE_A_SOL_ACCEPTANCE.md)：Phase A `PASS / CLOSED`。
- [`EP01_V6_INTEGRATION_REVIEW.md`](./EP01_V6_INTEGRATION_REVIEW.md)、[`EP02_V1_1_INTEGRATION_REVIEW.md`](./EP02_V1_1_INTEGRATION_REVIEW.md)、[`EP03_V1_1_INTEGRATION_REVIEW.md`](./EP03_V1_1_INTEGRATION_REVIEW.md)：冻结主线接入记录。

## 当前状态摘要

1. 正式名称：《语灵》；“词灵”为废弃旧称。
2. 正式 5505 Excel 是词汇唯一真源，禁止编造 `wordId`、释义和正式例句。
3. EP01 v6、EP02 v1.1、EP03 v1.1 `FROZEN / APPROVED`，不得修改。
4. Phase A 已 `PASS / CLOSED`；默认 debug 基线仍为玩家48 / 敌人60 / 敌伤8。
5. Phase B “教学 → 战斗 → 补弱 → 再战”已经实现，仍只属于独立原型。
6. Candidate A `48/80/12` 已实现，但最终判定 `NOT PASS / 压力仍偏低`；历史 profile 保留。
7. 当前只批准 Candidate B：**仅 `flow=phase-b` 使用玩家48 / 敌人80 / 敌伤14；相比 A 只改敌伤12→14。**
8. Candidate B 不修改 100/70/40、no-call、水音/回潮、repair、正式词源、成长或主线。
9. Candidate B 不得再修改 `app/game/fusion-slice.ts`；使用 Candidate A 已建立的可选 enemyDamage 注入。
10. Candidate B 完成后立即停止，等待用户 / Sol 实机 Review；不得自行继续 Candidate C 或主线迁移。
11. 零基础用户仍是第一服务对象；产品不扩成开放世界、自由走路或 3D 大地图。

## 历史/专项文档

- [`PHASE_B_COMBAT_PRESSURE_CANDIDATE_A_TASK.md`](./PHASE_B_COMBAT_PRESSURE_CANDIDATE_A_TASK.md)：Candidate A 历史任务单。
- [`PHASE_B_COMBAT_PRESSURE_SOL_REVIEW.md`](./PHASE_B_COMBAT_PRESSURE_SOL_REVIEW.md)：A 前置压力 Review。
- [`TEACH_BATTLE_REPAIR_PHASE_B_MIGRATION_TASK.md`](./TEACH_BATTLE_REPAIR_PHASE_B_MIGRATION_TASK.md)：Phase B 已执行的迁移任务单。
- [`SKILL_ENGLISH_SYSTEM_V2_PHASE_A_MIGRATION_TASK.md`](./SKILL_ENGLISH_SYSTEM_V2_PHASE_A_MIGRATION_TASK.md)：Phase A 历史迁移任务。
- [`SKILL_ENGLISH_SYSTEM_V2_PHASE_A_HANDOFF.md`](./SKILL_ENGLISH_SYSTEM_V2_PHASE_A_HANDOFF.md)：Phase A 工程交接。
- [`current-project-status.md`](./current-project-status.md)：历史项目状态快照。
- 其余方案文档仅作历史或专项参考，不能覆盖当前规则。
