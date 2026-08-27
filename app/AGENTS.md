# app/AGENTS.md

本文件对 `app/` 下所有 Codex 工作生效，是根目录 `AGENTS.md` 的补充。

## 1. 战斗 / 技能 / 英语调用强制规则

只要任务涉及以下任一内容：

- 战斗结算；
- 语灵技能；
- 英语调用与技能效果；
- 战斗取词；
- 100% / 70% / 40% 发挥倍率；
- 技能伤害、回复、护盾、减伤、冷却；

开始修改前必须先读取：

1. `docs/SKILL_ENGLISH_SYSTEM_V2.md`
2. `docs/SKILL_ENGLISH_SYSTEM_V2_ENGINEERING_LOCK.md`

该两份文档是当前技能 × 英语系统的权威规格。若现有 `spirit-config.ts`、`bridge-config.ts`、`page.tsx` 或其他 V1 代码与 V2 规格冲突：

1. 不得以旧代码反向覆盖 V2；
2. 不得自行做游戏设计折中；
3. 不得自行调整技能数值、倍率或词与技能的关系；
4. 不得自行新增技能效果、正式文案或系统；
5. 规格缺口使用 `PENDING_K3` 或停下报告。

核心契约固定为：

> 技能决定这一回合做什么；英语决定这件事这次发挥多少。

战斗取词固定为：

`Used-or-Maintained + battleEligible`

其中 `Maintained` 必须建立在此前已经达到 `Used` 的证据之上。

战斗层不要求词义与技能语义绑定。世界教学层仍要求语义自然。

---

## 2. 当前 Phase B 强制规则

只要任务涉及“教学页 → 战斗页 → 补弱 → 再战”的连续体验，还必须先读取：

1. `docs/TEACH_BATTLE_REPAIR_PHASE_B_SPEC.md`
2. `docs/TEACH_BATTLE_REPAIR_PHASE_B_MIGRATION_TASK.md`

当前唯一批准的 Phase B 工程范围，以迁移任务单为准。

Phase B 只允许串联独立原型，不得：

- 修改 `app/page.tsx` 主线；
- 修改 `app/game/fusion-slice.ts` 的 Phase A 核心战斗结算；
- 修改 `app/game/bridge-config.ts`；
- 修改 `app/game/spirit-config.ts`；
- 修改 `app/game/zero-base-teaching.ts`；
- 修改 `app/narrative/**` 或 EP01–EP03；
- 新增正式技能动画、词、敌人、关卡、剧情、成长或长期抽词系统。

若实现发现必须触碰禁止范围才能继续，立即停止并报告，不得自行扩大范围。

正式实现前不得修改 EP01–EP03 冻结剧情或冻结战斗流程。