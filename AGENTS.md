# AGENTS.md

本文件是《语灵》项目给 Codex 的项目级常驻规则。进入本仓库后，先读本文件，再读 `docs/CODEX_PROJECT_MEMORY.md`。如旧文档与这两份文件冲突，以本文件与 `docs/CODEX_PROJECT_MEMORY.md` 的较新裁决为准；代码用于确认“实际已实现什么”，不能反向改写冻结产品结论。

## 1. 基础行为

- 默认使用中文汇报。
- 只做用户/任务书明确要求的事情，不主动扩范围、不顺手重构、不增加大型系统。
- 需求不清且会影响实现方向时先确认；若任务书已经给出停止线，不要越线。
- 正式内容缺口统一使用 `PENDING_K3`，不得自行补剧情、对白、技能文案、语灵设定、词义、例句或世界观。
- 完成后明确列出：修改范围、未修改范围、验证结果、commit SHA。

## 2. 项目身份与最高产品约束

- 项目正式名称：**《语灵》**。
- 生物/伙伴统一称：**语灵**。`词灵` 为废弃旧称；新代码、新文档、新 UI、新对白禁止继续使用旧称。
- 核心用户优先级：**纯零基础/基础断层的英语学习者优先**。
- 产品形态固定为移动端 Web 叙事 RPG：背景/立绘/节点交互/对话/技能战斗/轻量动画与特效。
- 禁止滑向开放世界、摇杆自由走路、实时自由探索或 3D 大世界。
- 复杂度放在内容与学习编排，不放在不断新增系统。

## 3. 团队与权限边界

- 用户：产品负责人，最终体验与方向裁决。
- Sol：产品/玩法/学习融合/世界观总策划与最终 Review。
- DeepSeek：只审正式剧情、对白、人物行为、因果与 AI 味；无权冻结系统。
- Codex：唯一工程执行者。**不得自行创作正式剧情、世界观、语灵、技能、词表、成长或学习规则。**

## 4. 冻结主线

除阻塞级 bug 或用户/Sol明确解冻外不得修改：

- EP01《雾退了》v6：`FROZEN / APPROVED`
- EP02《港外旧路》v1.1：`FROZEN / APPROVED`
- EP03《第一次并肩》v1.1：`FROZEN / APPROVED`
- EP01–EP03 的正式对白、场景结论、关键因果链与冻结战斗流程

当前不开发 EP04。

第二伙伴正式名未定；旧文档中的“绒岚已冻结”为过时信息。

## 5. 词汇与学习真源

- 正式 5505 Excel 是单词内容唯一真源。
- 禁止编造 `wordId`、中文释义、sense、正式例句。
- `ts-fsrs` 只负责时间调度，不新增第二套时间调度器。
- L2/L3 继续受 Review 门限制。
- 学习状态至少：`Introduced → Guided → Retrieved → Used → Maintained`；`Maintained` 只能建立在此前 Used 之上。

教学目标是把不会的真正教会。遵守 `Unknown Budget = 1`，中文可作为零基础支架，世界行动优先于学习卡。

## 6. 技能 × 英语系统 V2

修改战斗、技能、英语调用前必须先读：

1. `docs/SKILL_ENGLISH_SYSTEM_V2.md`
2. `docs/SKILL_ENGLISH_SYSTEM_V2_ENGINEERING_LOCK.md`
3. `app/AGENTS.md`

核心契约：

> **技能决定这一回合做什么；英语决定这件事这次发挥多少。**

当前冻结：

- 战斗取词：`Used-or-Maintained + battleEligible`；
- 战斗层不按技能语义分词；
- independent / supported / failed = `1.00 / 0.70 / 0.40`；
- 思考时间不影响即时倍率；
- 默认 no-call 使用独立 `0.40`；
- 水音/回潮、统一取整和结算顺序按 V2 冻结规格执行。

## 7. Phase A / Phase B 状态

### Phase A

- 基线 commit：`0351c80ef607204f71a83a3a613117efdd83206f`
- 状态：`PASS / CLOSED`
- 不因此批准主线九技能迁移。

### Phase B 连续体验

- 产品规格：`docs/TEACH_BATTLE_REPAIR_PHASE_B_SPEC.md`
- 工程任务：`docs/TEACH_BATTLE_REPAIR_PHASE_B_MIGRATION_TASK.md`
- 工程交接：`docs/TEACH_BATTLE_REPAIR_PHASE_B_HANDOFF.md`
- Phase B 已实现，仍只属于独立原型。
- 主闭环：`语灵站日常 → 战斗 → 真实薄弱 → 两步 repair → 自动再战`。

## 8. 当前唯一新授权：Phase B Candidate A

用户已批准执行：

`docs/PHASE_B_COMBAT_PRESSURE_CANDIDATE_A_TASK.md`

只验证 Phase B 独立连续切片战斗压力：

- 玩家 Max HP `48`
- Phase B 敌人 Max HP `80`
- Phase B 敌人基础伤害 `12`

**必须隔离：**

- Candidate A 只作用于 `flow=phase-b`；
- 默认 `/prototype/fusion-slice` 继续保持 Phase A debug `60 HP / 8伤害`；
- 不得全局改写 `FUSION_SLICE_RULES.enemyMaxHp / enemyDamage`；
- 100/70/40、no-call、水音/回潮、repair 规则均不改。

Candidate A 对 `app/game/fusion-slice.ts` 的唯一授权例外：按任务单给 `resolveFusionBattleCall` 增加带默认值的可选 enemyDamage 注入；除此之外核心结算仍冻结。

完成 Candidate A 后立即停止，提交 handoff，等待用户/Sol实机 Review；不得自行继续 Candidate B 或主线。

## 9. 持续禁止

- 接入或修改 `app/page.tsx` 主线；
- 迁移完整九技能；
- 修改 EP01–EP03；
- 修改正式 5505 词源；
- 修改成长、等级、星级、共鸣；
- 做正式技能动画；
- 新增词、敌人、关卡、剧情、资源条、怒气、额外失败惩罚或大型系统；
- 修改 FSRS / Mastery Layer 核心规则；
- 自行调整 failed/no-call。

## 10. 验证与完成标准

每次工程任务至少执行任务单要求的 validator，并保证：

- `npm run lint`
- `npm run build`
- `git diff --check`

不要为了“全绿”改写冻结内容。

完成后报告：修改范围、未修改范围、实机路径、验证结果、GitHub commit SHA，并按停止线停下。
