# 《语灵》GitHub 协作索引

本仓库是用户、Sol、DeepSeek 与 Codex 的协作真源。进入项目后，Codex 必须先读根目录 [`AGENTS.md`](../AGENTS.md)，再读 [`CODEX_PROJECT_MEMORY.md`](./CODEX_PROJECT_MEMORY.md)。

如果历史文档与这两份当前规则冲突，以 `AGENTS.md` + `CODEX_PROJECT_MEMORY.md` 的较新裁决为准；代码用于确认实际实现状态，不能反向覆盖冻结产品结论。

## 当前最高优先级文档

- [`AGENTS.md`](../AGENTS.md)：Codex 项目级常驻规则、权限边界、冻结范围、执行纪律。
- [`CODEX_PROJECT_MEMORY.md`](./CODEX_PROJECT_MEMORY.md)：截至 2026-08-27 的当前产品记忆与 Phase B 执行状态。
- [`TEACH_BATTLE_REPAIR_PHASE_B_SPEC.md`](./TEACH_BATTLE_REPAIR_PHASE_B_SPEC.md)：Phase B 产品规格，冻结“教学 → 战斗 → 补弱 → 再战”连续体验。
- [`TEACH_BATTLE_REPAIR_PHASE_B_MIGRATION_TASK.md`](./TEACH_BATTLE_REPAIR_PHASE_B_MIGRATION_TASK.md)：当前 Codex 唯一批准执行的 Phase B 工程任务单。
- [`SKILL_ENGLISH_SYSTEM_V2.md`](./SKILL_ENGLISH_SYSTEM_V2.md)：技能 × 英语系统 V2 产品/玩法权威规格。
- [`SKILL_ENGLISH_SYSTEM_V2_ENGINEERING_LOCK.md`](./SKILL_ENGLISH_SYSTEM_V2_ENGINEERING_LOCK.md)：V2 工程语义锁定。
- [`SKILL_ENGLISH_SYSTEM_V2_PHASE_A_SOL_ACCEPTANCE.md`](./SKILL_ENGLISH_SYSTEM_V2_PHASE_A_SOL_ACCEPTANCE.md)：Phase A `PASS / CLOSED` 验收记录。
- [`EP01_V6_INTEGRATION_REVIEW.md`](./EP01_V6_INTEGRATION_REVIEW.md)：EP01 v6 工程接入与回归记录。
- [`EP02_V1_1_INTEGRATION_REVIEW.md`](./EP02_V1_1_INTEGRATION_REVIEW.md)：EP02 v1.1 工程接入与回归记录。
- [`EP03_V1_1_INTEGRATION_REVIEW.md`](./EP03_V1_1_INTEGRATION_REVIEW.md)：EP03 v1.1 工程接入与回归记录。

## 历史/专项文档

以下文档仍可用于追溯设计与实现历史，但部分内容已被后续 Review 覆盖：

- [Phase A 迁移任务单](./SKILL_ENGLISH_SYSTEM_V2_PHASE_A_MIGRATION_TASK.md)
- [Phase A 工程交接](./SKILL_ENGLISH_SYSTEM_V2_PHASE_A_HANDOFF.md)
- [当前真实项目状态](./current-project-status.md)
- [10关试玩内容方案](./ten-episode-demo-plan.md)
- [10关试玩完整执行方案 v1.1](./ten-episode-demo-spec-v1.1.md)
- [试玩词汇方案](./demo-vocabulary-plan.md)
- [语灵成长相关历史方案](./spirit-growth-plan.md)
- [竞技场学习能力方案](./arena-learning-ability-plan.md)
- [Sol Review 交接单](./SOL_REVIEW_HANDOFF.md)
- [Content Production Sprint 01](./content-production-sprint-01/README.md)

## 当前协作纪律摘要

1. 正式名称统一为《语灵》，生物统一称“语灵”；“词灵”为废弃旧称。
2. 正式 5505 Excel 的 `wordId` 与源字段是词汇唯一真源，禁止编造 wordId、正式释义和正式例句。
3. EP01 v6、EP02 v1.1、EP03 v1.1 已 `FROZEN / APPROVED`，除阻塞级 bug 或明确解冻外不得修改。
4. Phase A 已 `PASS / CLOSED`；**当前唯一允许执行的是 Phase B 独立原型串联任务**。
5. Phase B 主入口：`/prototype/zero-base?flow=phase-b`；只验证“教学 → 战斗 → 补弱 → 再战”。
6. V2 战斗取词为 `Used-or-Maintained + battleEligible`；战斗层不按技能语义分词，世界教学仍要求语义自然。
7. Phase B 不得修改主线、九技能、EP01–EP03、Phase A 核心结算、正式词源、成长系统或正式动画。
8. 第二伙伴正式名当前未定；旧文档中的“绒岚已冻结”为过时信息。
9. 零基础用户是教学设计第一服务对象；不要默认学生已掌握 1000+ 词、简单句或基础语法。
10. 产品形态为移动端节点式叙事 RPG，不扩成开放世界、自由走路或 3D 大地图。
