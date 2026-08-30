# 《语灵》教学 × Intent Combat × Repair 连续闭环 V1 Sol Review

状态：`PASS AS INDEPENDENT CONTINUOUS LOOP / MAINLINE MIGRATION NOT AUTHORIZED`

日期：2026-08-30

依据：`docs/LEARNING_INTENT_REPAIR_LOOP_V1_TASK.md`、`docs/TEACH_BATTLE_REPAIR_PHASE_B_SPEC.md`

## 1. 裁决

“世界教学 → Intent Combat → 真实weakness → meaning/retrieve两步repair → 自动再战”已经在独立入口内连通并通过工程与390×844实机Review。

本轮确认的是连续体验与工程职责，不授权主线迁移。EP01–EP03、主线战斗、fusion-slice、V2正式规格、正式词源和现有存档均不在本轮修改范围内。

## 2. 工程结果

### 自动验证通过

- 首页入口明确指向 `/prototype/zero-base?flow=intent-loop`；教学完成后直接进入 `/prototype/learning-intent`。
- machine 有显式证据门、战斗两段结果、胜负结果、两步 repair、自动 rematch 和 complete。
- 合格词只来自教学后 `Used-or-Maintained + battleEligible`，没有 no-call 退化或新词创造。
- 战斗三档结果、真实 weakness、击杀不行动、共享词轮换和修复词前两次再现均与 Intent Combat V1 纯函数一致。
- 28/28 连续闭环专项、19/19 Intent V1、18/18 XState foundation、相关既有回归、lint、build、diff check 均通过。

### Sol实机通过

- 首页“新战斗闭环测试”入口可见，并通过一次性restart标记从世界教学起点开始；标记随即移除，刷新途中不会反复清空；
- 完整教学后只点一次“继续”，直接进入新意图战斗，无总结页和第二个原型菜单；
- 首次调用显示一次“刚才用过”；战斗仍保持技能结果、敌方结果两段确认；
- 故意连续failed后，先明确显示战斗失利，再只列真实 `help/water` weakness；
- repair严格执行meaning→retrieve，retrieve错误回同词meaning；最后正确后自动重置48/66并再战；
- 修复词按队列在再战前两次调用中出现，本次实机第一题即出现`help`；
- 完整教学后的全independent路径直接战斗胜利并进入完成页，没有假repair；
- 无repair时完成页只说世界行动与战斗完成，不声称发生了针对训练；
- 证据断链明确显示 `PENDING_K3: intent-loop evidence missing`，不进入no-call；
- 原 `/prototype/intent-combat` debug正常；390宽度无横向溢出，控制台无warning/error。

## 3. 边界审计

本轮只新增一个独立连续页面、machine、首页入口、教学新 flow、原型样式和 validator。没有改 `fusion-slice`、Intent Combat V1领域数值、XState foundation、Phase A/B/C既有实现、EP01–EP03、主线和依赖。

## 4. 保留风险

- 当前闭环仍使用独立原型的两词与测试敌人，不代表正式关卡内容。
- 自动再战优先词策略只验证当前两词，不是长期抽词算法。
- 当前不写FSRS、成长或主存档；这些职责后续必须另行设计，不能直接把临时machine context当长期数据。
- 首页入口只在主页面可操作状态可点击；主线模态界面打开时，玩家需先关闭当前模态。

## 5. 下一步裁决口径

下一步不再新造第三套战斗样机。应制作“主线战斗迁移影响清单”，逐项审查EP03冻结叙事目标与普通战斗HP胜负的冲突，然后只迁移一个明确解冻的主线战斗入口。

该结果不自动批准：

- 迁入主线或 EP03；
- 修改 V2 全局倍率或九技能；
- 把连续闭环状态写入正式存档；
- 接入 FSRS、成长、长期抽词、事件日志或正式动画。

这些都需要新的独立任务单和 Sol Review。

## 6. 当前停止线

未经新的主线迁移任务单，不修改EP01–EP03、不替换主线战斗、不改变Intent Combat数值、不接正式成长/FSRS/存档、不扩技能、敌人、剧情或动画。
