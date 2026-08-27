# 《语灵》GitHub 协作索引

本仓库是用户、Sol、DeepSeek 与 Codex 的协作真源。进入项目后，Codex 必须先读根目录 [`AGENTS.md`](../AGENTS.md)，再读 [`CODEX_PROJECT_MEMORY.md`](./CODEX_PROJECT_MEMORY.md)。

如果历史文档与这两份当前规则冲突，以 `AGENTS.md` + `CODEX_PROJECT_MEMORY.md` 的较新裁决为准；代码用于确认实际实现状态，不能反向覆盖冻结产品结论。

## 当前最高优先级文档

- [`AGENTS.md`](../AGENTS.md)：Codex 项目级常驻规则、权限边界、冻结范围、执行纪律。
- [`CODEX_PROJECT_MEMORY.md`](./CODEX_PROJECT_MEMORY.md)：截至 2026-08-27 的当前产品记忆、EP01–EP03 冻结状态、零基础教学原则、Review A 停止线与旧文档污染提醒。
- [`EP01_V6_INTEGRATION_REVIEW.md`](./EP01_V6_INTEGRATION_REVIEW.md)：EP01 v6 工程接入与回归记录。
- [`EP02_V1_1_INTEGRATION_REVIEW.md`](./EP02_V1_1_INTEGRATION_REVIEW.md)：EP02 v1.1 工程接入与回归记录。
- [`EP03_V1_1_INTEGRATION_REVIEW.md`](./EP03_V1_1_INTEGRATION_REVIEW.md)：EP03 v1.1 工程接入与回归记录。

## 历史/专项文档

以下文档仍可用于追溯设计与实现历史，但部分内容可能已被后续 Review 覆盖：

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
3. EP01 v6、EP02 v1.1、EP03 v1.1 已 `FROZEN / APPROVED` 并完成工程接入，除阻塞级 bug 或明确解冻外不得修改。
4. 当前暂停 EP04；零基础最小融合切片 V1 已实现，正在等待实机体验验收，不得据此扩系统。
5. 第二伙伴正式名当前未定；旧文档中的“绒岚已冻结”为过时信息，不得恢复到新内容。
6. 零基础用户是教学设计的第一服务对象；不要默认学生已掌握 1000+ 词、简单句或基础语法。
7. 产品形态为移动端节点式叙事 RPG，不扩成开放世界、自由走路或 3D 大地图。
8. 不把本地测试快照、CSS 剪影或按钮骨架包装成真实后端、正式美术或完成玩法。
