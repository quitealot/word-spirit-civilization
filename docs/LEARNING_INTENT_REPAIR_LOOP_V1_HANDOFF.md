# 《语灵》教学 × Intent Combat × Repair 连续闭环 V1 工程交接

状态：`IMPLEMENTED / AUTOMATED PASS / WAITING SOL 390×844 REVIEW`

日期：2026-08-30

依据：`docs/LEARNING_INTENT_REPAIR_LOOP_V1_TASK.md`

## 1. 完成范围

新增独立首页入口“新战斗闭环测试”，进入 `/prototype/zero-base?flow=intent-loop&restart=1`。`restart=1` 是一次性入口标记：首次进入时只清空零基础原型进度并从 `arrival` 开始，随后用 `replaceState` 移除标记；刷新或教学途中不会再次清空。该路径保留既有语灵站教学，完成后只保留一次“继续”，直接进入新的 `/prototype/learning-intent` 连续流程。默认 `/prototype/zero-base` 与 `flow=phase-b` 不受影响，主线存档不被清除。

连续流程为：

`checking_evidence → skill_select → word_call → player_result → enemy_result → battle_won/battle_lost → repair_review → repair_meaning → repair_retrieve → rematch → skill_select → complete`

本轮只连接已通过的教学证据、Intent Combat V1 领域结算和 Phase B 两步 repair；未接入主线、EP03、fusion-slice、Candidate A/B/C、V2全局、FSRS、成长、存档或正式剧情。

## 2. 实现证据

- `getLearningIntentEligibleWords` 只从已有 `Used-or-Maintained + battleEligible` 证据派生 `water(w1718)`、`help(w729)`，释义继续来自正式词源链路。
- 英语模式先选技能，再从共享合格词池调用；同一技能不会绑定单一单词，不同技能可以调用同一词。
- independent、supported、failed 均直接调用 `intent-combat-v1.ts` 既有纯函数；failed只保留技能基础结果并产生真实 weakness。
- 第一次战斗第一次调用显示一次“刚才用过”；再战不重复显示。
- 战斗结果先进入 `battle_won`/`battle_lost`，再根据真实 weakness 进入 repair；无 weakness 直接进入 `complete`，不生成假 repair。
- repair 固定为 `meaning → retrieve`；retrieve 错误回同一词的 meaning；多词按 weakness 队列推进。
- 最后一个词确认正确后通过 `rematch` 自动创建全新 `48/66` 战斗，清空 HP、护盾、回合和本场计数；修复词按队列顺序在再战前两次调用内优先出现。
- complete 页根据 `battleNumber` 区分路径：干净首战只显示世界行动与战斗完成；实际发生 repair 并完成再战后，才显示针对训练与再战完成。
- 新页面由 `useMachine` 订阅连续 machine；没有用多组 React state 重新维护流程真源。
- 证据断链进入明确 `PENDING_K3: intent-loop evidence missing`，不退化到 no-call。

## 3. 修改路径

- `app/game/learning-intent-machine.ts`：新增连续闭环 XState machine、证据池派生、repair队列和再战优先词逻辑。
- `app/prototype/learning-intent/page.tsx`：新增独立连续流程页面，复用 Intent Combat V1 技能/反馈语义；complete 文案按是否发生 repair/rematch 准确显示。
- `app/prototype/zero-base/page.tsx`：只增加 `flow=intent-loop` 识别、一次性 `restart=1` 入口重置/去标记和完成后的直接去向；旧默认教学与 `flow=phase-b` 保持不变。
- `app/page.tsx`：只增加首页“新战斗闭环测试”入口。
- `app/globals.css`、`app/prototype.css`：只增加入口与独立原型页面的最小样式。
- `scripts/validate-learning-intent-loop.ts`：新增 28 项无界面 machine/页面/来源验证。
- `package.json`：只增加 `validate:learning-intent-loop` script；未新增依赖。
- `docs/LEARNING_INTENT_REPAIR_LOOP_V1_HANDOFF.md`、`docs/LEARNING_INTENT_REPAIR_LOOP_V1_SOL_REVIEW.md`：本轮交接与 Sol Review 输入。

## 4. 自动验证

- `npm run validate:learning-intent-loop`：`28/28 PASS`。
- `npm run validate:intent-combat-v1`：`19/19 PASS`。
- `npm run validate:intent-combat-xstate`：`18/18 PASS`。
- `validate:phase-b-flow`、`validate:zero-base-teaching`、`validate:fusion-slice`、V2 validator：PASS。
- 全量既有 `validate:*`：PASS。
- `npm run lint`：PASS。
- `npm run build`：PASS；成功生成 `/prototype/learning-intent` 路由。
- `git diff --check`：PASS。

专项 28 项覆盖首页入口（含一次性 `restart=1` 重置、`replaceState` 去标记和默认/Phase B 隔离）、flow 去向、证据断链、合格词池、词源释义、共享词轮换、技能不绑定词、三档领域等价、真实 weakness、战斗结果先显示、meaning/retrieve、retrieve 重错回同词、多 weakness、自动 rematch、HP/瞬时状态重置、前两次调用重现、一次性提示、击杀跳过敌方行动、非法事件、准确的干净/repair 完成文案、干净完成和 React machine 边界。

## 5. 明确未修改

- 未修改 `app/prototype/fusion-slice/page.tsx` 或 `app/game/fusion-slice.ts`。
- 未修改 `app/game/intent-combat-v1.ts` 的数值或反馈语义。
- 未修改 `app/game/intent-combat-machine.ts`、XState依赖或既有 XState 独立 debug 页面。
- 未修改 EP01–EP03、主线战斗、主存档、FSRS、成长、等级、星级、共鸣、正式词源和正式剧情/对白。
- 未新增依赖、正式敌人、技能、词、释义、例句、动画或资源。

## 6. 390×844 实机状态

本执行代理未操作浏览器。主代理仍需实机完成：完整教学→故意答错→战斗结果→两步 repair→自动再战→修复词前两次出现；全程独立正确无假 repair；证据断链；首页入口；原 `/prototype/intent-combat` debug 回归，并检查无横向溢出、无运行错误和两段战斗反馈。

## 7. 停止线与风险

- 本轮不提交、不 push、不发布，等待 Sol 完成实机与最终审阅后统一提交。
- 当前连续 machine 没有长期学习写入、FSRS更新、事件日志或主存档同步；这是本任务的明确边界。
- 自动再战优先词逻辑只服务当前两词独立原型，不代表未来正式抽词算法。
- `supported` 是否应进入 repair、跨模块连续感和自动再战节奏仍需实机裁决，不由本轮 Codex 自行扩展。
