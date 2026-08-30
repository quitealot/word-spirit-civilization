# 《语灵》Codex 项目记忆

更新时间：2026-08-28
状态：`CURRENT / AUTHORITATIVE`

若历史文档、旧 Review 或旧代码与本文件、根目录 `AGENTS.md`、当前冻结规格冲突，以较新的冻结裁决为准。

## 1. 项目身份

《语灵》面向纯零基础 / 基础断层英语学习者，形态为移动端 Web 叙事养成 RPG。用户负责最终体验裁决；Sol 负责产品/玩法/学习融合与最终 Review；DeepSeek 只做正式剧情/对白第二意见；Codex 只实现冻结任务。

## 2. 冻结主线

- EP01 v6：`FROZEN / APPROVED`
- EP02 v1.1：`FROZEN / APPROVED`
- EP03 v1.1：`FROZEN / APPROVED`

当前暂停 EP04。不得修改 EP01–EP03 的对白、关键因果或冻结战斗流程。第二伙伴正式名未定；旧“绒岚已冻结”为过时信息。

## 3. 词汇与教学

- 正式 5505 Excel 是词汇唯一真源。
- `ts-fsrs` 是唯一时间调度底座。
- L2/L3 继续受 Review 门控制。
- 学习证据：`Introduced → Guided → Retrieved → Used → Maintained`，Maintained 必须建立在 Used 之后。
- 零基础教学遵守 `Unknown Budget = 1`，中文可作支架，世界行动优先。

## 4. 技能 × 英语 V2 默认基线

- 战斗池：`Used-or-Maintained + battleEligible`；
- 战斗层不按技能语义分词；
- independent / supported / failed = `1.00 / 0.70 / 0.40`；
- 默认 no-call = `0.40`；
- 思考时间不影响即时倍率；
- 水音：18伤害 + 20%下一击削弱；
- 回潮：10伤害 + 22回复；
- 统一取整与结算顺序按 `SKILL_ENGLISH_SYSTEM_V2_ENGINEERING_LOCK.md`。

Candidate C 的25/25仍只是 Phase B 候选，不覆盖正式 V2 默认值。

## 5. Phase A / Phase B

### Phase A

- 基线：`0351c80ef607204f71a83a3a613117efdd83206f`
- 状态：`PASS / CLOSED`
- 默认 debug：48/60/8 + failed40/no-call40。

### Phase B

主入口：`/prototype/zero-base?flow=phase-b`

闭环：`语灵站日常 → 战斗 → 真实薄弱 → meaning/retrieve 两步 repair → 自动再战`

Phase B 仍只属于独立原型，不进入主线。

## 6. 候选历史

- Candidate A：48/80/12 + 40/40；`NOT PASS / PRESSURE TOO LOW / CLOSED`。
- Candidate B：48/80/14 + 40/40；`NOT PASS / FEEDBACK UNREADABLE / BALANCE HOLD`。

## 7. Candidate C 当前状态

实现 commit：

`3665f6d11771163c307a799e4719b3def53a5c85`

最终交接：

`e24756b328803859882dd14929a4c00861cbaf97`

Sol Review：

`docs/PHASE_B_COMBAT_FEEDBACK_CANDIDATE_C_SOL_REVIEW.md`

状态：

`ENGINEERING PASS / PRODUCT PLAYTEST HOLD`

Candidate C 只在 Phase B 原型中测试：

- 48 / 80 / 14；
- independent 1.00；
- supported 0.70；
- failed 0.25；
- no-call 0.25；
- 水音/回潮基础效果不变；
- 玩家技能结果 → 敌方行动提示 → 敌方伤害结果 → 下一回合；
- 回复绿色 +N HP；
- 敌伤红色 -N HP；
- HP=0 后先显示“战斗失利”，再进入真实 weakness repair；
- 思考时间仍不影响即时倍率。

工程验证：Candidate C 20/20 PASS；A/B、Phase B flow、V2、fusion-slice、zero-base、lint/build/diff 审计均通过；390×844 无横向溢出和运行错误。

## 8. 文档治理

仓库有两份 Candidate C 前置任务稿：

- 权威：`docs/PHASE_B_COMBAT_FEEDBACK_CANDIDATE_C_TASK.md`
- 历史：`docs/PHASE_B_FEEDBACK_PACING_CANDIDATE_C_TASK.md`

后者不得被当成新的并行任务再次执行。

## 9. 当前产品 Review 只看

1. 是否清楚区分“我的技能结果”和“敌方结果”；
2. 回潮 failed 的 `3伤害 +6回复` 是否还显得奖励过多；
3. 一次 failed 是否仍可挽回，不产生恐惧；
4. 约2.8秒非击杀反馈是否清楚而不拖沓；
5. “战斗失利 → repair → 自动再战”是否清楚但不中断动机。

## 10. 当前停止线

Candidate C 正在等待用户/Sol 产品实机裁决。Codex 不得自行：

- Candidate D；
- 再调倍率或敌伤；
- 把25/25写成正式 V2 全局值；
- 迁移主线九技能；
- 修改 EP01–EP03；
- 修改正式词源、成长或正式动画；
- 新增词、敌人、关卡、剧情或大型系统。

没有新的明确任务单就停下等待。

## 11. Intent Combat V1 新战斗基线

2026-08-30，用户授权Sol全盘规划、执行与Review。独立入口 `/prototype/intent-combat` 已完成并通过Sol Review：

- 状态：`PASS AS NEW COMBAT BASELINE / MAINLINE MIGRATION NOT AUTHORIZED`；
- 敌方意图公开；
- 水音/回潮/静波拥有基础职责；
- 英语只提供离散掌握奖励，不显示统一发挥百分比；
- 水音压制保留到下一次真正攻击；
- 纯战斗模式证明拿掉英语后仍有技能选择；
- 两段式回合反馈；
- 19/19专项、既有回归、lint/build/diff、390×844均通过。

权威Review：`docs/INTENT_COMBAT_PROTOTYPE_V1_SOL_REVIEW.md`。下一步只允许用新任务单做独立的教学/战斗/repair再融合，不得直接迁入主线或覆盖V2。

## 12. XState流程底座

2026-08-30，GitHub先验研究后采用XState v5只负责跨阶段流程编排，战斗领域结算继续使用纯TypeScript；boardgame.io只借鉴纯动作、阶段、日志和无界面模拟测试模式，不引入完整运行时。

Intent Combat独立等价迁移已通过Sol Review：`PASS AS ISOLATED FLOW FOUNDATION / FUSION NOT YET AUTHORIZED`。权威Review为 `docs/INTENT_COMBAT_XSTATE_FOUNDATION_SOL_REVIEW.md`。下一步须另立独立融合任务单，才能接“教学证据→战斗→weakness→repair→再战”；主线迁移仍未授权。

## 13. 教学—新战斗—补弱连续闭环

独立入口 `/prototype/zero-base?flow=intent-loop&restart=1` 已完成：世界教学后一次继续直达Intent Combat，failed产生真实weakness，meaning/retrieve两步repair后自动再战，修复词在前2次调用内出现；全independent无假repair。首页已有“新战斗闭环测试”入口。

状态：`PASS AS INDEPENDENT CONTINUOUS LOOP / MAINLINE MIGRATION NOT AUTHORIZED`。权威Review：`docs/LEARNING_INTENT_REPAIR_LOOP_V1_SOL_REVIEW.md`。下一步只能先做主线迁移影响清单与明确解冻任务，不得直接修改EP03。
