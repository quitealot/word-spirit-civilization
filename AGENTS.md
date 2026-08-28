# AGENTS.md

本文件是《语灵》项目给 Codex 的项目级常驻规则。进入仓库后先读本文件，再读 `docs/CODEX_PROJECT_MEMORY.md`。若历史文档、旧 Review 或旧代码冲突，以较新的冻结裁决为准；代码只能说明“已实现什么”，不能反向覆盖产品结论。

## 1. 基础纪律

- 默认中文汇报。
- 只做明确授权任务，不顺手扩范围、不新增大型系统。
- 正式内容缺口使用 `PENDING_K3`，不得自行补剧情、对白、技能、词义、例句、成长或世界观。
- 完成后报告修改范围、未修改范围、验证、实机结果和 commit SHA。

## 2. 项目与团队

- 正式名称：《语灵》；“词灵”为废弃旧称。
- 第一服务对象：纯零基础 / 基础断层英语学习者。
- 形态：移动端 Web 叙事 RPG，背景/立绘/节点交互/对话/技能战斗/轻量动画；不做开放世界、自由走路或 3D 大地图。
- 用户：产品负责人、最终体验裁决。
- Sol：产品/玩法/学习融合/世界观与最终 Review。
- DeepSeek：只审正式剧情、对白、人物行为与因果。
- Codex：唯一工程执行者，不自行创作或冻结产品规则。

## 3. 冻结主线

- EP01《雾退了》v6：`FROZEN / APPROVED`
- EP02《港外旧路》v1.1：`FROZEN / APPROVED`
- EP03《第一次并肩》v1.1：`FROZEN / APPROVED`

除阻塞级 bug 或明确解冻外，不得修改 EP01–EP03 的正式对白、场景结论、关键因果与冻结战斗流程。当前暂停 EP04。第二伙伴正式名未定；旧“绒岚已冻结”为过时信息。

## 4. 词汇与教学

- 正式 5505 Excel 是词汇唯一真源，禁止编造 `wordId`、释义、sense、正式例句。
- `ts-fsrs` 是唯一时间调度底座。
- L2/L3 继续受 Review 门控制。
- 学习证据至少：`Introduced → Guided → Retrieved → Used → Maintained`，其中 `Maintained` 必须建立在 Used 之后。
- 零基础教学遵守 `Unknown Budget = 1`；中文可作为支架；世界行动优先于单纯学习卡。

## 5. 技能 × 英语系统 V2

修改战斗/技能/英语调用前必须读：

1. `docs/SKILL_ENGLISH_SYSTEM_V2.md`
2. `docs/SKILL_ENGLISH_SYSTEM_V2_ENGINEERING_LOCK.md`
3. `app/AGENTS.md`

正式 V2 基线仍是：

- 技能决定做什么；英语决定本次发挥多少；
- 战斗池：`Used-or-Maintained + battleEligible`；
- 战斗层不按技能语义分词；
- independent / supported / failed = `1.00 / 0.70 / 0.40`；
- 默认 no-call = `0.40`；
- 思考时间不影响即时倍率；
- 水音/回潮基础效果、统一取整与结算顺序按 V2 冻结规格。

Candidate C 的 `25%/25%` 仍只是 Phase B 独立候选，**尚未覆盖正式 V2 基线**。

## 6. Phase A / Phase B

### Phase A

- 基线：`0351c80ef607204f71a83a3a613117efdd83206f`
- 状态：`PASS / CLOSED`
- 默认 debug：玩家48 / 敌人60 / 敌伤8 / failed40 / no-call40。
- 不因此批准主线九技能迁移。

### Phase B 连续体验

- 已实现，仍只属于独立原型。
- 主入口：`/prototype/zero-base?flow=phase-b`
- 闭环：`语灵站日常 → 战斗 → 真实薄弱 → 两步 repair → 自动再战`
- 工程交接：`docs/TEACH_BATTLE_REPAIR_PHASE_B_HANDOFF.md`

## 7. 战斗压力/反馈候选

- Candidate A `48/80/12`：`NOT PASS / PRESSURE TOO LOW / CLOSED`。
- Candidate B `48/80/14 + failed40/no-call40`：`NOT PASS / FEEDBACK UNREADABLE / BALANCE HOLD`。
- Candidate C 实现：`3665f6d11771163c307a799e4719b3def53a5c85`
- Candidate C 交接：`e24756b328803859882dd14929a4c00861cbaf97`
- Candidate C Sol Review：`docs/PHASE_B_COMBAT_FEEDBACK_CANDIDATE_C_SOL_REVIEW.md`

Candidate C 当前状态：

`ENGINEERING PASS / PRODUCT PLAYTEST HOLD`

Candidate C 仅在 Phase B 原型中测试：

- 玩家48 / 敌人80 / 敌伤14；
- failed = 0.25；
- no-call = 0.25；
- 顺序反馈：玩家技能结果 → 敌方行动提示 → 敌方伤害结果 → 下一回合；
- HP=0 后先显示“战斗失利”，再 repair；
- independent 1.00、supported 0.70、水音/回潮基础效果、teaching/repair 不变；
- Candidate A/B 与默认 Phase A 历史基线保留。

仓库有两份 Candidate C 前置任务稿；当前以 `docs/PHASE_B_COMBAT_FEEDBACK_CANDIDATE_C_TASK.md` 为权威任务名，`docs/PHASE_B_FEEDBACK_PACING_CANDIDATE_C_TASK.md` 仅作历史前置稿，不得当成新任务再次执行。

## 8. 当前停止线

Candidate C 正在等待用户/Sol 产品实机裁决。Codex 现在不得自行：

- 启动 Candidate D；
- 继续调整 failed/no-call 或敌伤；
- 把25%/25%写成正式 V2 全局值；
- 接入 `app/page.tsx` 主线或迁移完整九技能；
- 修改 EP01–EP03；
- 修改正式词源、成长、等级、星级、共鸣；
- 新增正式技能动画、词、敌人、关卡、剧情或大型系统。

只有新的用户/Sol 明确任务单才能继续。

## 9. 完成标准

任何获授权工程任务都必须按任务单运行 validator，并至少保证：

- `npm run lint`
- `npm run build`
- `git diff --check`

不要为了全绿改写冻结内容。