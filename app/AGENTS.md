# app/AGENTS.md

本文件对 `app/` 下所有 Codex 工作生效，是根目录 `AGENTS.md` 的补充。

## 1. 战斗 / 技能 / 英语调用强制规则

涉及战斗结算、技能、英语调用、倍率、战斗取词前必须先读：

1. `docs/SKILL_ENGLISH_SYSTEM_V2.md`
2. `docs/SKILL_ENGLISH_SYSTEM_V2_ENGINEERING_LOCK.md`
3. 根目录 `AGENTS.md`

核心契约：

> 技能决定这一回合做什么；英语决定这件事这次发挥多少。

默认 V2 冻结基线仍为：

- `Used-or-Maintained + battleEligible`；
- 战斗层不按技能语义分词；
- independent / supported / failed = `1.00 / 0.70 / 0.40`；
- 默认 no-call = `0.40`；
- 思考时间不影响即时倍率。

不得自行调整技能数值、倍率、词与技能关系或新增正式系统/文案。

---

## 2. Phase B 连续体验

涉及“教学页 → 战斗页 → 补弱 → 再战”继续遵守：

1. `docs/TEACH_BATTLE_REPAIR_PHASE_B_SPEC.md`
2. `docs/TEACH_BATTLE_REPAIR_PHASE_B_HANDOFF.md`

Phase B 已实现，仍只属于独立原型；不得进入主线。

---

## 3. Candidate A / B 状态

- Candidate A `48/80/12`：`NOT PASS / PRESSURE TOO LOW / CLOSED`。
- Candidate B `48/80/14 + 40/40`：`NOT PASS / FEEDBACK UNREADABLE / BALANCE HOLD`。
- Candidate B 裁决：`docs/PHASE_B_COMBAT_PRESSURE_CANDIDATE_B_SOL_VERDICT.md`。

Candidate B 的问题不是只靠继续提高敌伤能解决，而是玩家无法清楚读懂：

`自己的技能结果 → 敌方行动 → 自己受伤结果`。

---

## 4. Candidate C：已冻结任务单，但当前禁止执行

任务单：

`docs/PHASE_B_COMBAT_FEEDBACK_CANDIDATE_C_TASK.md`

状态：`FROZEN / NOT AUTHORIZED FOR CODE`

候选方向：

- 压力仍为 `48 / 80 / 14`；
- 成熟顺序回合反馈；
- failed 候选 `0.25`；
- no-call 候选 `0.25`；
- independent `1.00`、supported `0.70` 不变；
- 水音/回潮基础效果、teaching/repair 不变；
- 战败先明确显示，再进入 repair。

**当前不得修改任何 Candidate C 代码。**

只有用户明确说“执行 Candidate C”后，才允许重新读取该任务单并按其范围执行。

---

## 5. 持续禁止

当前不得：

- 修改 `app/page.tsx` 主线；
- 修改 EP01–EP03；
- 迁移完整九技能；
- 修改正式 5505 词源；
- 修改成长、等级、星级、共鸣；
- 新增正式技能动画、词、敌人、关卡、剧情或大型系统；
- 自行调整 failed/no-call；
- 自行继续提高敌伤；
- 未授权先改 Candidate C。

如用户未明确授权 Candidate C，遇到相关请求只做 Review/任务单，不写运行代码。