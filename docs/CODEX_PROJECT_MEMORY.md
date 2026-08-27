# 《语灵》Codex 项目记忆

更新时间：2026-08-27
状态：`CURRENT / AUTHORITATIVE`

本文件只记录 Codex 每次进入项目都必须记得的**当前事实**。它不是完整 GDD。若历史文档、旧 Review 或旧代码与本文件、根目录 `AGENTS.md`、当前冻结规格冲突，以**较新的冻结裁决**为准。

---

## 1. 项目身份

《语灵》是一款面向**纯零基础 / 基础断层英语学习者**的移动端叙事养成 RPG。

最高目标：

- 用真实游戏行动把英语教会；
- 前面学会的词和结构成为后续学习脚手架；
- 让学习进步与语灵成长、战斗、故事体验连接。

有基础玩家可以游玩和维护英语，但不能为了他们提高难度而破坏零基础梯度。

产品形态固定为：移动端 Web、背景/立绘、节点交互、对话、技能战斗、轻量动画/特效。

明确不做：开放世界、摇杆自由走路、3D 大地图、实时自由探索。

---

## 2. 正式术语与团队权限

- 正式游戏名：**《语灵》**。
- 生物/伙伴统一称 **语灵**。
- `词灵` 为废弃旧称；旧仓库名/历史路径可保留，但新 UI、新文档、新对白不得继续使用。
- 用户：产品负责人，最终拍板与实机体验裁决。
- Sol：产品、玩法、学习融合、世界观与最终 Review。
- DeepSeek：只做正式剧情/对白/人物因果/AI味的第二意见。
- Codex：唯一工程执行者，只实现冻结任务，**不得自行创作正式剧情、技能、词表、成长或系统规则**。

正式内容缺口统一 `PENDING_K3`。

---

## 3. 冻结主线

- EP01《雾退了》v6：`FROZEN / APPROVED`
- EP02《港外旧路》v1.1：`FROZEN / APPROVED`
- EP03《第一次并肩》v1.1：`FROZEN / APPROVED`

除阻塞级 bug 或明确解冻外，不得修改 EP01–EP03 的对白、场景结论、关键因果或冻结战斗流程。

当前继续暂停 EP04。

第二伙伴正式名当前未定。旧文档中的“绒岚已冻结”是过时信息，不得恢复。

---

## 4. 词汇与教学底座

- 正式 5505 Excel 是词汇唯一真源。
- 禁止编造 `wordId`、正式中文释义、sense 或正式例句。
- `ts-fsrs` 是唯一时间调度底座，不新增第二套时间调度器。
- L2/L3 继续受 Review 门控制。
- 一个词的掌握属于玩家，不为不同语灵重复学习。

零基础教学原则：

- `Unknown Budget = 1`；
- 不用多个陌生英语解释另一个陌生英语；
- 中文是合法支架；
- 教学优先发生在世界行动中；
- 教学链：`世界需求发生 → 命名英语 → 马上使用 → 旧知识帮助新知识 → 逐步撤支架 → 英语驱动行动`。

学习证据至少区分：

`Introduced → Guided → Retrieved → Used → Maintained`

其中 `Maintained` 只能发生在词已经达到 `Used` 之后。

---

## 5. 技能 × 英语系统 V2

权威规格：

1. `docs/SKILL_ENGLISH_SYSTEM_V2.md`
2. `docs/SKILL_ENGLISH_SYSTEM_V2_ENGINEERING_LOCK.md`
3. `app/AGENTS.md`

核心契约：

> **技能决定这一回合做什么；英语决定这件事这次发挥多少。**

当前冻结：

- 战斗取词：`Used-or-Maintained + battleEligible`；
- 战斗层不再要求词义与技能语义匹配；
- 世界教学层仍要求语义自然；
- 技能不拥有专属词池；
- independent / supported / failed = `1.00 / 0.70 / 0.40`；
- 思考时间不影响即时战斗倍率；
- 完全无合格词时，用真实技能 `noCallMultiplier = 0.40`；
- no-call 不出陌生英语、不生薄弱词、不创造临时基础技能；
- 统一取整与战斗结算顺序以工程锁定文档为准。

---

## 6. Phase A：已通过并关闭

验收基线：`0351c80ef607204f71a83a3a613117efdd83206f`

状态：`PASS / CLOSED`

验收记录：

`docs/SKILL_ENGLISH_SYSTEM_V2_PHASE_A_SOL_ACCEPTANCE.md`

Phase A 只迁移独立 `/prototype/fusion-slice`：

- 水音：`18`伤害 + 敌方下一次伤害降低`20%`；
- 回潮：`10`伤害 + 恢复`22`HP；
- `water / help` 共用战斗词池；
- 100/70/40、no-call、统一取整、击杀不反击均已通过专项验证。

**Phase A 通过不等于批准主线迁移。**

正式技能动画已明确后移。

---

## 7. 当前阶段：Phase B 已批准工程执行

产品规格：

`docs/TEACH_BATTLE_REPAIR_PHASE_B_SPEC.md`

工程任务单：

`docs/TEACH_BATTLE_REPAIR_PHASE_B_MIGRATION_TASK.md`

状态：

`READY FOR CODEX / PHASE-B ONLY`

Phase B 只验证这一条连续闭环：

`语灵站日常完成 → 直接进入测试战斗 → 暴露真实薄弱词 → 针对训练 → 立即再战`

主验收入口冻结为：

`/prototype/zero-base?flow=phase-b`

Phase B 连续路径必须：

- 教学最后真实行动后，最多一次 `继续` 进入战斗；
- 不经过教学总结页和融合切片菜单；
- 不展示 `Used / Maintained / battleEligible / evidence` 等开发术语；
- 第一场第一次英语调用只允许一次性提示 `刚才用过`；
- 战后只处理本场真实薄弱词，同一 `wordId` 一场只一次；
- targeted 只做两步：`重新建立意义 → 再独立确认一次`；
- targeted 错误时回同一词，不换词、不加题型；
- 最后一个 repair 成功后自动再战，不回菜单、不加“训练完成”中转；
- 被修词必须在再战前 2 次英语调用以内重新出现；
- 再战独立正确时直接从技能 100% 实际效果感受改善；
- 第一战没有真实薄弱词时直接结束，不伪造针对训练。

Phase B 不修改 Phase A 技能数值、100/70/40、no-call、战斗结算或长期抽词规则。

---

## 8. Phase B 文件停止线

Codex 必须严格按迁移任务单执行。

优先允许：

- `app/prototype/zero-base/page.tsx`
- `app/prototype/fusion-slice/page.tsx`
- 原型专用最小 CSS
- Phase B validator / package script / handoff

若必须触碰下列内容，**立即停止并报告**：

- `app/page.tsx`
- `app/game/fusion-slice.ts` Phase A 核心结算
- `app/game/bridge-config.ts`
- `app/game/spirit-config.ts`
- `app/game/zero-base-teaching.ts`
- `app/learning-engine.ts`
- `app/narrative/**`
- EP01–EP03
- 主存档 schema
- 正式 5505 词源
- L2/L3
- 另外七个技能
- 成长、等级、星级、共鸣
- 正式技能动画
- 新词、新敌人、新关卡、新剧情

Phase B 完成后必须停止，等待用户 / Sol 实机 Review，不得进入主线。

---

## 9. 必须验证

按任务单至少运行：

- `validate:phase-b-flow`
- `validate:skill-english-v2`
- `validate:fusion-slice`
- `validate:zero-base-teaching`
- `lint`
- `build`
- `git diff --check`

390×844 必须走：

1. failed → repair两步 → 自动再战；
2. 第一战全 independent → 无 fake targeted；
3. 独立 debug 入口回归。

---

## 10. 新 Codex 会话启动检查

开始前必须确认：

1. 当前任务是否严格来自 Phase B 迁移任务单？
2. 是否会碰 EP01–EP03 / 主线 / Phase A 核心结算？若会，立即停。
3. 是否使用正式 Excel 真源？
4. 是否仍以零基础用户为第一优先？
5. 是否偷偷新增正式文案、技能、词、成长或系统？
6. 是否把 Phase B 做成了新状态机/新大型系统？
7. 是否准备在完成后继续主线？若是，停止。

不确定时先停下核对，不要猜。