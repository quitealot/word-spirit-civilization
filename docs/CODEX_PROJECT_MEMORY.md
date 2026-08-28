# 《语灵》Codex 项目记忆

更新时间：2026-08-28
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

当前默认冻结：

- 战斗取词：`Used-or-Maintained + battleEligible`；
- 战斗层不按技能语义分词；
- independent / supported / failed = `1.00 / 0.70 / 0.40`；
- 默认 no-call = `0.40`；
- 思考时间不影响即时倍率；
- 水音：`18伤害 + 20%下一击削弱`；
- 回潮：`10伤害 + 22回复`；
- 统一取整与战斗结算顺序按工程锁定文档。

注意：25%/25% 目前只属于下一原型候选，尚未覆盖默认 V2。

## 5. Phase A

- 验收基线：`0351c80ef607204f71a83a3a613117efdd83206f`
- 状态：`PASS / CLOSED`
- 默认 `/prototype/fusion-slice` 基线：玩家48 / 敌人60 / 敌伤8 / failed40 / no-call40。
- Phase A 通过不代表批准主线九技能迁移。

## 6. Phase B 连续体验

Phase B 已实现，仍是独立原型。

主入口：`/prototype/zero-base?flow=phase-b`

闭环：

`语灵站日常 → 战斗 → 真实薄弱 → meaning/retrieve 两步 repair → 自动再战`

工程交接：`docs/TEACH_BATTLE_REPAIR_PHASE_B_HANDOFF.md`

## 7. Candidate A

- 参数：`48 / 80 / 12 / failed40 / no-call40`
- 实现基线：`73e825a59fe8c8378c697002e79a138c2056b29a`
- 状态：`NOT PASS / PRESSURE TOO LOW / CLOSED`

## 8. Candidate B

- 参数：`48 / 80 / 14 / failed40 / no-call40`
- 实现基线：`7152d7af31ba886db621ba5565e373e3948897e4`
- 工程曲线：全正确约5回合23HP；一次 failed 约6回合10HP；连续两次 failed 代表路径战败；持续 failed 无胜路。
- 当前 Sol 裁决：`NOT PASS / FEEDBACK UNREADABLE / BALANCE HOLD`
- 裁决：`docs/PHASE_B_COMBAT_PRESSURE_CANDIDATE_B_SOL_VERDICT.md`

核心问题：

1. 玩家技能结果与敌方行动衔接过快，代价不可读；
2. 回潮 failed 40% 仍为 `4伤害 + 9回复`，主观上显得答错也奖励不少；
3. 因此不能继续只提高敌伤。

## 9. Candidate C：已冻结任务单，禁止直接执行

任务单：

`docs/PHASE_B_COMBAT_FEEDBACK_CANDIDATE_C_TASK.md`

状态：`FROZEN / NOT AUTHORIZED FOR CODE`

Candidate C 候选：

- 保持压力：玩家48 / 敌人80 / 敌伤14；
- 采用成熟顺序回合反馈：`玩家技能结果 → 敌方行动提示 → 敌方结果 → 下一回合`；
- 结算期间锁输入；
- 回复绿色 `+数值`，受伤红色 `-数值`，HP 条跟随变化；
- 原型关键结果可读停留以约1.2秒作为测试起点，但不是永久毫秒规范；
- failed 候选 `0.25`；
- no-call 候选 `0.25`；
- failed/no-call 必须成对调整；
- independent `1.00`、supported `0.70` 不变；
- 水音/回潮基础效果、teaching/repair 不变；
- 战败先明确显示 `战斗失利`，再进入 repair。

25%候选结果：

- 水音：`5伤害 + 5%削弱`；
- 回潮：`3伤害 + 6回复`。

默认 Phase A debug 和 Candidate A/B 历史 profile 必须保留。

## 10. 当前停止线

**用户尚未授权 Candidate C 工程实现。**

Codex 现在不得：

- 修改 Candidate C；
- 修改 failed/no-call；
- 调整战斗反馈节奏；
- 继续提高敌伤；
- 修改主线、九技能、EP01–EP03；
- 修改正式词源、成长、等级、星级、共鸣；
- 新增正式技能动画、词、敌人、关卡、剧情或大型系统。

只有用户明确说“执行 Candidate C”后，才允许按任务单开始工程修改。

## 11. 新 Codex 会话启动检查

开始前确认：

1. 当前是 Review/任务单，还是用户已明确授权 Candidate C？
2. 若没有“执行 Candidate C”的明确授权，是否保持运行代码不动？
3. 是否保持默认 V2 40/40 与 Phase A 48/60/8？
4. 是否没有碰主线、EP01–EP03、正式词源与成长？
5. 是否避免自造新战斗系统，只采用成熟顺序回合反馈？

不确定就停下核对，不要猜。