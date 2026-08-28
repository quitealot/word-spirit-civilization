# AGENTS.md

本文件是《语灵》项目给 Codex 的项目级常驻规则。进入本仓库后，先读本文件，再读 `docs/CODEX_PROJECT_MEMORY.md`。如旧文档与这两份文件冲突，以本文件与 `docs/CODEX_PROJECT_MEMORY.md` 的较新裁决为准；代码用于确认“实际已实现什么”，不能反向改写冻结产品结论。

## 1. 基础行为

- 默认使用中文汇报。
- 只做用户/任务书明确要求的事情，不主动扩范围、不顺手重构、不增加大型系统。
- 需求不清且会影响实现方向时先确认；若任务书已经给出停止线，不要越线。
- 正式内容缺口统一使用 `PENDING_K3`，不得自行补剧情、对白、技能文案、语灵设定、词义、例句或世界观。
- 完成后明确列出：修改范围、未修改范围、验证结果、commit SHA。

## 2. 项目身份与最高约束

- 正式名称：**《语灵》**；生物/伙伴统一称 **语灵**，`词灵` 为废弃旧称。
- 第一服务对象：纯零基础 / 基础断层英语学习者。
- 产品形态固定为移动端 Web 叙事 RPG：背景/立绘/节点交互/对话/技能战斗/轻量动画与特效。
- 禁止滑向开放世界、摇杆自由走路、实时自由探索或 3D 大世界。
- 复杂度放在内容与学习编排，不放在不断新增系统。

## 3. 团队权限

- 用户：产品负责人，最终体验与方向裁决。
- Sol：产品/玩法/学习融合/世界观总策划与最终 Review。
- DeepSeek：只审正式剧情、对白、人物行为、因果与 AI 味；无权冻结系统。
- Codex：唯一工程执行者。不得自行创作正式剧情、世界观、语灵、技能、词表、成长或学习规则。

## 4. 冻结主线

除阻塞级 bug 或用户/Sol明确解冻外不得修改：

- EP01《雾退了》v6：`FROZEN / APPROVED`
- EP02《港外旧路》v1.1：`FROZEN / APPROVED`
- EP03《第一次并肩》v1.1：`FROZEN / APPROVED`
- EP01–EP03 的正式对白、场景结论、关键因果链与冻结战斗流程

当前不开发 EP04。第二伙伴正式名未定；旧文档中的“绒岚已冻结”为过时信息。

## 5. 词汇与学习真源

- 正式 5505 Excel 是单词内容唯一真源。
- 禁止编造 `wordId`、中文释义、sense、正式例句。
- `ts-fsrs` 只负责时间调度，不新增第二套时间调度器。
- L2/L3 继续受 Review 门限制。
- 学习状态至少：`Introduced → Guided → Retrieved → Used → Maintained`；`Maintained` 只能建立在此前 Used 之上。
- 教学遵守 `Unknown Budget = 1`，中文可作为零基础支架，世界行动优先于学习卡。

## 6. 技能 × 英语系统 V2

修改战斗、技能、英语调用前必须先读：

1. `docs/SKILL_ENGLISH_SYSTEM_V2.md`
2. `docs/SKILL_ENGLISH_SYSTEM_V2_ENGINEERING_LOCK.md`
3. `app/AGENTS.md`

核心契约：

> **技能决定这一回合做什么；英语决定这件事这次发挥多少。**

当前正式冻结基线仍为：

- 战斗取词：`Used-or-Maintained + battleEligible`；
- 战斗层不按技能语义分词；
- independent / supported / failed = `1.00 / 0.70 / 0.40`；
- 默认 no-call = `0.40`；
- 思考时间不影响即时倍率；
- 水音/回潮、统一取整和结算顺序按 V2 冻结规格执行。

注意：后续 Candidate C 的 `25%/25%` 目前只是**独立原型候选**，尚未授权代码，也没有覆盖 V2 默认基线。

## 7. Phase A / Phase B

### Phase A

- 基线：`0351c80ef607204f71a83a3a613117efdd83206f`
- 状态：`PASS / CLOSED`
- 默认 debug：玩家48 / 敌人60 / 敌伤8 / failed40 / no-call40。
- 不因此批准主线九技能迁移。

### Phase B 连续体验

- 已实现，仍只属于独立原型。
- 主闭环：`语灵站日常 → 战斗 → 真实薄弱 → 两步 repair → 自动再战`。
- 规格：`docs/TEACH_BATTLE_REPAIR_PHASE_B_SPEC.md`
- 交接：`docs/TEACH_BATTLE_REPAIR_PHASE_B_HANDOFF.md`

## 8. 战斗压力候选状态

### Candidate A

- `48 / 80 / 12`
- `NOT PASS / PRESSURE TOO LOW / CLOSED`

### Candidate B

- 工程基线：`7152d7af31ba886db621ba5565e373e3948897e4`
- `48 / 80 / 14 / failed40 / no-call40`
- Sol 当前裁决：`NOT PASS / FEEDBACK UNREADABLE / BALANCE HOLD`
- 裁决：`docs/PHASE_B_COMBAT_PRESSURE_CANDIDATE_B_SOL_VERDICT.md`
- 原因：压力可能接近目标，但玩家看不清技能结果与敌方结果，且低质量回潮回复主观上仍显得过强。

### Candidate C

任务单：

`docs/PHASE_B_COMBAT_FEEDBACK_CANDIDATE_C_TASK.md`

状态：`FROZEN / NOT AUTHORIZED FOR CODE`

Candidate C 候选：

- 保持压力 `48 / 80 / 14`；
- 采用成熟顺序回合制反馈：玩家技能结果 → 敌方行动提示 → 敌方结果 → 下一回合；
- failed 候选 `0.25`；
- no-call 候选 `0.25`；
- failed/no-call 必须成对调整；
- independent `1.00`、supported `0.70`、水音/回潮基础效果、teaching/repair 全部不变；
- 明确战败状态后再进入 repair。

**当前用户尚未授权 Codex 执行 Candidate C。**

## 9. 当前停止线

Codex 现在不得自行：

- 执行 Candidate C；
- 修改 failed/no-call；
- 调整战斗反馈节奏；
- 继续提高敌伤；
- 接入 `app/page.tsx` 主线；
- 迁移完整九技能；
- 修改 EP01–EP03；
- 修改正式词源、成长、等级、星级、共鸣；
- 做正式技能动画；
- 新增词、敌人、关卡、剧情、资源条、怒气、额外失败惩罚或大型系统。

只有用户明确说“执行 Candidate C”后，才允许按该任务单开始工程修改。

## 10. 完成标准

任何获授权工程任务都必须按任务单运行 validator，并至少保证：

- `npm run lint`
- `npm run build`
- `git diff --check`

不要为了“全绿”改写冻结内容。完成后报告修改范围、未修改范围、实机路径、验证结果、commit SHA，并按停止线停下。