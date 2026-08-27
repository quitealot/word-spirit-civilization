# 《语灵》Codex 项目记忆

更新时间：2026-08-27
状态：`CURRENT / AUTHORITATIVE`

本文件记录 Codex 每次进入项目必须记得的当前事实。若历史文档、旧 Review 或旧代码与本文件、根目录 `AGENTS.md`、当前冻结规格冲突，以较新的冻结裁决为准。

## 1. 项目身份与团队

《语灵》是面向纯零基础 / 基础断层英语学习者的移动端叙事养成 RPG。

- 用户：产品负责人，最终拍板与实机体验裁决；
- Sol：产品、玩法、学习融合、世界观与最终 Review；
- DeepSeek：只做正式剧情/对白/人物因果/AI味第二意见；
- Codex：唯一工程执行者，不自行创作正式剧情、技能、词表、成长或系统规则。

产品形态：移动端 Web、背景/立绘、节点交互、对话、技能战斗、轻量动画/特效；不做开放世界、自由走路、3D 大地图。

## 2. 冻结主线

- EP01《雾退了》v6：`FROZEN / APPROVED`
- EP02《港外旧路》v1.1：`FROZEN / APPROVED`
- EP03《第一次并肩》v1.1：`FROZEN / APPROVED`

当前暂停 EP04。不得修改 EP01–EP03 的对白、场景结论、关键因果或冻结战斗流程。

第二伙伴正式名未定；旧“绒岚已冻结”为过时信息。

## 3. 词汇与教学底座

- 正式 5505 Excel 是词汇唯一真源；禁止编造 `wordId`、释义、sense、正式例句。
- `ts-fsrs` 是唯一时间调度底座。
- L2/L3 继续受 Review 门控制。
- 零基础教学遵守 `Unknown Budget = 1`；中文可作支架；教学优先发生在世界行动中。
- 学习证据：`Introduced → Guided → Retrieved → Used → Maintained`，其中 `Maintained` 必须建立在 Used 之后。

## 4. 技能 × 英语系统 V2

权威规格：

1. `docs/SKILL_ENGLISH_SYSTEM_V2.md`
2. `docs/SKILL_ENGLISH_SYSTEM_V2_ENGINEERING_LOCK.md`
3. `app/AGENTS.md`

核心契约：

> 技能决定这一回合做什么；英语决定这件事这次发挥多少。

冻结规则：

- 战斗取词：`Used-or-Maintained + battleEligible`；
- 战斗层不按技能语义分词；
- independent / supported / failed = `1.00 / 0.70 / 0.40`；
- 思考时间不影响即时倍率；
- 默认 no-call = 独立 `0.40`；
- 水音：`18伤害 + 20%下一击削弱`；
- 回潮：`10伤害 + 22回复`；
- 统一取整与战斗结算顺序按工程锁定文档。

## 5. Phase A

验收基线：`0351c80ef607204f71a83a3a613117efdd83206f`

状态：`PASS / CLOSED`

默认 `/prototype/fusion-slice` Phase A debug 基线继续保持：

- 玩家 Max HP `48`
- 敌人 Max HP `60`
- 敌人基础伤害 `8`

Phase A 通过不代表批准主线九技能迁移。

## 6. Phase B 连续体验

Phase B 已实现，工程交接：

`docs/TEACH_BATTLE_REPAIR_PHASE_B_HANDOFF.md`

主入口：

`/prototype/zero-base?flow=phase-b`

闭环：

`语灵站日常 → 战斗 → 真实薄弱 → meaning/retrieve 两步 repair → 自动再战`

Phase B 仍是独立原型，不进入主线。

## 7. 当前唯一新任务：Phase B Candidate A 战斗压力测试

用户已批准：

`docs/PHASE_B_COMBAT_PRESSURE_CANDIDATE_A_TASK.md`

状态：`READY FOR CODEX / CANDIDATE-A ONLY`

Candidate A 只用于 `flow=phase-b`：

- 玩家 Max HP：`48`
- 敌人 Max HP：`80`
- 敌人基础伤害：`12`

目的：验证“答错仍能行动，但低效率让敌人多行动；一次失误能救，持续低质量会输”。

目标曲线：

- 全 independent：约 5 回合，约剩 26 HP；
- 一次 failed 后恢复：约 6 回合，约剩 16 HP；
- 连续两次 failed 后恢复：约 7 回合，约剩 6 HP；
- 持续 failed：两个现有真实技能的任意全 failed 序列都不应获胜；
- repair 后恢复 100%：回合数与剩余 HP 明显改善。

### 隔离要求

- Candidate A 不得全局改 `FUSION_SLICE_RULES` 的 `60/8` debug 基线；
- 默认 `/prototype/fusion-slice` no-call 回归继续按 60/8；
- 100/70/40、no-call、水音/回潮、repair 不改；
- `app/game/fusion-slice.ts` 只允许按任务单增加带默认值的可选 `enemyDamage` 注入，其他核心结算不得改。

## 8. Candidate A 停止线

持续禁止：

- `app/page.tsx` 主线；
- 九技能全局迁移；
- EP01–EP03；
- 正式词源；
- 成长、等级、星级、共鸣；
- 正式技能动画；
- 新词、敌人、关卡、剧情；
- 回合上限、怒气、资源条、额外惩罚；
- 自行调整 failed/no-call；
- Candidate B。

Candidate A 完成后必须提交 handoff 与 commit SHA，然后立即停止等待用户 / Sol Review。

## 9. 新 Codex 会话启动检查

开始前确认：

1. 是否严格执行 `PHASE_B_COMBAT_PRESSURE_CANDIDATE_A_TASK.md`？
2. 是否把 80/12 限定在 `flow=phase-b`？
3. 是否保持默认 debug 60/8？
4. 是否只对 `fusion-slice.ts` 做任务单允许的窄接口注入？
5. 是否没有改倍率、技能、repair、主线或冻结剧情？
6. 完成后是否准备立即停止？

不确定就停下核对，不要猜。
