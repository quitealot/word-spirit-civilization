# 《语灵》教学 × Intent Combat × Repair 连续闭环 V1 工程任务单

状态：`FROZEN / AUTHORIZED FOR IMPLEMENTATION`

日期：2026-08-30

依据：

- `docs/TEACH_BATTLE_REPAIR_PHASE_B_SPEC.md`
- `docs/INTENT_COMBAT_PROTOTYPE_V1_SOL_REVIEW.md`
- `docs/INTENT_COMBAT_XSTATE_FOUNDATION_SOL_REVIEW.md`

## 1. 唯一目标

建立一个玩家可从首页明确进入的独立连续闭环：

> 语灵站世界教学 → 一次继续 → Intent Combat → 真实weakness → meaning/retrieve两步repair → 自动再战

本轮只把已通过的教学、Intent Combat和Phase B repair接通，不重新设计任何一段。

## 2. 主验收入口

- 首页新增明确的系统入口“新战斗闭环测试”，进入 `/prototype/zero-base?flow=intent-loop`；
- 完成教学后只保留一次“继续”，直接进入 `/prototype/learning-intent`；
- 不经过教学总结、fusion-slice菜单或Intent Combat debug模式菜单。

首页修改只能增加独立测试入口，不得修改主线存档、剧情、EP03战斗或“逼退”冻结内容。

## 3. 复用规则

- 教学内容、五词、释义和证据继续来自 `zero-base-teaching.ts`；不得复制或新造词义；
- 战斗结算继续唯一调用 `intent-combat-v1.ts`；不得改48/66、三技能、离散奖励或敌方意图；
- XState负责连续流程；不得用页面多组`useState`重新造流程；
- repair继续使用Phase B冻结语义：Step 1 `word → targetGloss`，Step 2收起答案独立确认；再错回同词Step 1；
- 战斗只调用教学后达到 `Used-or-Maintained + battleEligible` 的 `water(w1718)`、`help(w729)`；无证据时显示明确证据断链，不进入no-call；
- 第一次战斗第一次调用可显示一次“刚才用过”；再战不重复；
- failed只保留Intent Combat技能基础职责并记录真实weakness；supported不进入repair；
- 修复后的词必须在再战前2次调用内重新出现。

## 4. 状态流

完整machine至少覆盖：

```text
checking_evidence
  → skill_select
  → word_call
  → player_result
  → enemy_result
  → skill_select | battle_won | battle_lost
  → repair_meaning
  → repair_retrieve
  → rematch
  → skill_select
  → complete
```

若战斗结束没有真实weakness，直接进入 `complete`，不生成假repair。若有weakness，无论胜负都先清楚显示战斗结果，再进入repair。repair完成后自动建立全新48/66战斗，保留修复队列顺序用于前2次调用重现。

## 5. 允许修改

- `app/prototype/zero-base/page.tsx`：只识别新flow并改变完成后的去向；
- 新建 `app/prototype/learning-intent/page.tsx`；
- 新建 `app/game/learning-intent-machine.ts`；
- 必要时最小扩展 `app/game/intent-combat-v1.ts` 的可选合格词池参数，默认行为必须不变；
- `app/page.tsx`与现有样式：只增加独立测试入口及其最小样式；
- 原型专用CSS；
- 新validator、package script、handoff与Sol Review输入；
- 根/app/scripts AGENTS和项目记忆只在最终PASS后由Sol更新。

## 6. 禁止范围

- 不修改EP01–EP03剧情、对白、战斗或存档；
- 不删除旧“逼退”实现，本轮只避免新入口误入旧战斗；
- 不修改fusion-slice、Candidate A/B/C、V2正式倍率、FSRS、成长、等级、星级或共鸣；
- 不新增正式敌人、技能、词、释义、例句、剧情、对白、动画或资源系统；
- 不修改Intent Combat的数值和反馈文案；
- 不引入新依赖。

## 7. 自动验证

专项至少覆盖20项：

1. 首页入口和教学新flow去向；
2. 证据缺失明确失败；
3. 只取Used-or-Maintained + battleEligible；
4. 两词轮换且技能不绑定词；
5. independent/supported/failed领域输出与Intent Combat一致；
6. supported不进repair、failed进入真实weakness；
7. 胜利/战败先显示结果；
8. 无weakness直接complete；
9. meaning→retrieve；
10. retrieve错误回同词meaning；
11. 多weakness逐词推进；
12. 最后一个词正确后自动rematch；
13. rematch HP与瞬时状态重置；
14. 修复词前2次调用内出现；
15. 第一次“刚才用过”只出现一次；
16. 击杀后敌人不行动；
17. 非法阶段事件不改变状态；
18. 原Intent V1与XState validators继续通过；
19. Phase B、zero-base、fusion-slice回归继续通过；
20. lint、build、diff check和冻结文件审计通过。

## 8. 390×844实机

必须走：

- 完整教学→故意答错→战斗结果→两步repair→自动再战→修复词重新出现；
- 完整教学→全程无failed→无假repair；
- 证据断链；
- 首页入口；
- 原 `/prototype/intent-combat` debug回归。

检查无横向溢出、无运行错误、技能结果与敌方结果仍为两段确认。

## 9. 停止线

完成handoff、验证和Sol Review后停止。本轮不迁移主线，不修改EP03，不开展下一套数值或动画工作。
