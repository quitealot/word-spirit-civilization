# 《语灵》Phase B 战斗压力 Candidate A：工程测试任务单

状态：`READY FOR CODEX / CANDIDATE-A ONLY`
日期：2026-08-27

依赖：

1. `docs/PHASE_B_COMBAT_PRESSURE_SOL_REVIEW.md`
2. `docs/TEACH_BATTLE_REPAIR_PHASE_B_SPEC.md`
3. `docs/TEACH_BATTLE_REPAIR_PHASE_B_HANDOFF.md`
4. `docs/SKILL_ENGLISH_SYSTEM_V2.md`
5. `docs/SKILL_ENGLISH_SYSTEM_V2_ENGINEERING_LOCK.md`
6. 根目录 `AGENTS.md`
7. `app/AGENTS.md`

本任务只验证 **Phase B 独立连续切片的战斗压力 Candidate A**。不是主线平衡，不迁移九技能，不修改英语倍率，不修改教学与 repair 设计。

---

## 一、测试目标

只验证以下体验曲线：

- 全部独立正确：约 `4–5` 回合顺畅胜利；
- 偶尔 failed 一次：通常多承受约一次敌方行动，血量明显下降但仍可挽回；
- 连续 failed 两次：进入危险血线；
- 持续 failed：应正常战败，不能靠 40% 效果长期磨死敌人；
- repair 后再战：恢复 independent 100% 后，回合数和剩余 HP 明显改善。

核心原则不变：

> **答错仍能行动，但低效率让敌人获得更多行动机会；一次失误能救，持续低质量调用最终会输。**

---

## 二、Candidate A 冻结参数

只在 `flow=phase-b` 连续验收路径启用：

- 玩家 Max HP：`48`
- 敌人 Max HP：`80`
- 敌人基础伤害：`12`

保持不变：

- 水音：`18`伤害 + 敌方下一击削弱`20%`
- 回潮：`10`伤害 + 回复`22`HP
- independent / supported / failed：`1.00 / 0.70 / 0.40`
- `noCallMultiplier = 0.40`
- 战斗取词、repair、结算顺序、统一取整全部不变

这些是 Phase B Candidate A 原型测试值，不是主线正式数值。

---

## 三、关键隔离：不得破坏 Phase A debug 基线

Candidate A **只作用于 `flow=phase-b`**。

默认独立 `/prototype/fusion-slice` 继续保留 Phase A debug 基线：

- 敌人 Max HP：`60`
- 敌人基础伤害：`8`
- no-call debug 路径继续保持原能力

因此禁止直接把：

`FUSION_SLICE_RULES.enemyMaxHp / enemyDamage`

全局改成 `80 / 12`。

这是为了避免把 Candidate A 的临时 Phase B 平衡试验，误写成 Phase A / no-call /未来主线的全局规则。

---

## 四、冻结工程实现方式

### 4.1 Phase B 专用配置

在 `app/game/phase-b-flow.ts` 增加且只增加一个原型专用配置：

```ts
PHASE_B_COMBAT_CANDIDATE_A = {
  playerMaxHp: 48,
  enemyMaxHp: 80,
  enemyDamage: 12,
}
```

名称可做最小 TypeScript 命名适配，但语义与数值不得改变。

不得把它放进主线配置、`bridge-config.ts` 或 `spirit-config.ts`。

### 4.2 敌人 HP

`flow=phase-b`：

- 初战创建 battle state 时使用 `enemyHp = 80`；
- repair 后自动再战同样重置为 `enemyHp = 80`；
- UI 敌人 HP 条的分母也必须使用 `80`。

默认 debug：仍使用 `60`。

### 4.3 敌人基础伤害

为了避免复制一套战斗结算，允许对 `app/game/fusion-slice.ts` 做**唯一一个窄接口扩展**：

给 `resolveFusionBattleCall` 增加可选 options 参数，允许传入本次 encounter 的 `enemyDamage`；未传时继续使用 `FUSION_SLICE_RULES.enemyDamage`。

推荐冻结形式：

```ts
type FusionBattleResolveOptions = {
  enemyDamage?: number;
};

resolveFusionBattleCall(state, call, quality, options = {})
```

内部只把原先读取：

`FUSION_SLICE_RULES.enemyDamage`

改成：

`options.enemyDamage ?? FUSION_SLICE_RULES.enemyDamage`

其他结算顺序、技能组件、倍率、weakness、护盾/减伤逻辑不得改。

第四个参数必须有默认值，使 `resolveFusionBattleCall.length` 仍保持 `3`，不得破坏“反应时间不进入即时结算”的既有验证语义。

`resolveFusionNoCallTurn` 本轮**不要求**接 Candidate A；默认 debug no-call 保持 Phase A 基线。

### 4.4 Phase B 页面调用

`app/prototype/fusion-slice/page.tsx` 在 `phaseB === true` 时：

- 初战/再战 HP 使用 Candidate A；
- 调用 `resolveFusionBattleCall` 时传入 `enemyDamage = 12`；
- HP bar 分母使用 Candidate A `enemyMaxHp = 80`。

`phaseB === false` 时完全保持当前 Phase A debug 行为。

禁止在页面外手工追加“额外扣 4 HP”等补丁式结算。

---

## 五、代表性确定性曲线

专项 validator 必须用现有 resolver 验证以下代表性路径。

### A. 全 independent

技能顺序：

`水音 → 水音 → 回潮 → 水音 → 水音`

全部 independent。

期望：

- 第 `5` 个玩家行动击杀；
- 最终玩家约 `26 HP`；
- 最后一击后敌人不行动。

### B. 一次 failed 后恢复

技能/质量顺序：

1. 水音 failed
2. 水音 independent
3. 回潮 independent
4. 水音 independent
5. 水音 independent
6. 水音 independent

期望：

- 第 `6` 个玩家行动胜利；
- 最终玩家约 `16 HP`；
- 相比全 independent，多暴露一个敌方行动周期的真实代价。

### C. 连续两次 failed 后恢复

技能/质量顺序：

1. 水音 failed
2. 水音 failed
3. 水音 independent
4. 回潮 independent
5. 水音 independent
6. 水音 independent
7. 水音 independent

期望：

- 第 `7` 个玩家行动胜利；
- 最终玩家约 `6 HP`；
- 明显进入危险血线，但仍能被后续正确调用救回来。

### D. 持续 failed

从 `48 HP / 80 enemy HP` 开始，每回合只允许在当前两个真实技能中选择，所有英语调用均 failed。

validator 必须确认：

- 不存在一条由「水音 / 回潮」组成的全 failed 技能序列可以赢下该战；
- 最终会先出现玩家 HP = 0，而不是靠 40% 效果无限续航获胜。

建议对有限状态进行 DFS/BFS 穷举，而不是只测一条“看起来会输”的固定序列。

### E. repair 前后差异

至少比较：

- 一次 failed 路径：`6回合 / 约16 HP`
- 全 independent 路径：`5回合 / 约26 HP`

证明从 40% 修复回 100% 后，改善体现在真实回合数和剩余 HP，而不只是 UI 百分比。

---

## 六、允许修改文件

本轮只允许：

- `app/game/phase-b-flow.ts`
- `app/prototype/fusion-slice/page.tsx`
- `app/game/fusion-slice.ts`：**仅允许第 4.3 节所述 enemyDamage 可选注入，不得改其他战斗公式**
- `scripts/validate-phase-b-combat-pressure.ts`（新建）
- `package.json`：只新增 `validate:phase-b-combat-pressure`
- `docs/PHASE_B_COMBAT_PRESSURE_CANDIDATE_A_HANDOFF.md`（完成后新建）

如果 UI 因 80 HP 显示确有问题，可最小修改原型专用 CSS；不得改主站样式。

---

## 七、明确禁止

不得修改：

- `app/page.tsx`
- `app/game/bridge-config.ts`
- `app/game/spirit-config.ts`
- `app/game/zero-base-teaching.ts`
- `app/learning-engine.ts`
- `app/narrative/**`
- EP01–EP03
- 正式 5505 词源
- 主存档 schema
- 成长、等级、星级、共鸣
- 另外七个技能
- Phase B teaching / repair 规则
- 100 / 70 / 40
- `noCallMultiplier`
- 水音 / 回潮效果
- 正式技能动画
- 新词、新敌人、新关卡、新剧情
- 回合上限、怒气、资源条、额外失败惩罚

不得把 Candidate A 写进主线或宣称为正式战斗平衡。

---

## 八、新增专项 validator

新增：

`npm run validate:phase-b-combat-pressure`

至少验证：

1. Candidate A = `48 / 80 / 12`；
2. 默认 `FUSION_SLICE_RULES` 仍为 `48 / 60 / 8`；
3. Phase A debug resolver 未传 options 时仍按敌伤 `8`；
4. Phase B 传入 Candidate A 时按敌伤 `12`；
5. 水音 independent 在 Candidate A 下敌方本次伤害：`12 × (1 - 20%) = 9.6 → 10`；
6. 全 independent 代表序列：5回合胜、约26 HP；
7. 一次 failed：6回合胜、约16 HP；
8. 连续两次 failed：7回合胜、约6 HP；
9. 全 failed 双技能状态空间不存在获胜路径；
10. repair 前后代表曲线至少改善 1 回合且多保留约 10 HP；
11. 100/70/40 未变；
12. no-call 未变；
13. 水音/回潮配置未变；
14. `resolveFusionBattleCall.length === 3`；
15. 默认 debug no-call 路径仍按 Phase A 60/8 运行并保持既有回归。

不得为了让 validator 通过改动目标曲线。

---

## 九、必须回归

完成后运行：

- `npm run validate:phase-b-combat-pressure`
- `npm run validate:phase-b-flow`
- `npm run validate:skill-english-v2`
- `npm run validate:fusion-slice`
- `npm run validate:zero-base-teaching`
- `npm run lint`
- `npm run build`
- `git diff --check`

并确认以下无 diff：

- `app/page.tsx`
- `app/game/bridge-config.ts`
- `app/game/spirit-config.ts`
- `app/game/zero-base-teaching.ts`
- `app/narrative/**`

对 `app/game/fusion-slice.ts` 的 diff 必须只有 Candidate A 所需的可选 enemyDamage 注入，不得出现其他公式变化。

---

## 十、390×844 实机路径

主入口：

`/prototype/zero-base?flow=phase-b`

至少走：

1. 全 independent：观察约 5 回合胜利，战斗仍“顺”；
2. 故意 failed 一次后恢复：确认战斗明显更险但可挽回；
3. 连续 failed 两次后恢复：确认进入危险血线；
4. 持续 failed：确认会正常战败；
5. failed → repair → 自动再战 → 同词 independent：确认再战明显更快、更安全；
6. 正确使用一次回潮，确认回复能成为救回来的真实战术选择；
7. 观察是否出现“一次答错就害怕”的过度压力。

同时回归：

- `/prototype/fusion-slice` 默认 debug 仍显示 `60` 敌 HP；
- 默认 no-call debug 仍保持原 Phase A 行为；
- 390px 无横向溢出；
- 控制台无错误/警告。

---

## 十一、产品通过条件

Candidate A 不以“代码与 validator 全绿”自动通过。

用户 / Sol 实机必须判断：

- 全正确是否顺畅；
- 一错是否有代价但不恐惧；
- 两错是否危险；
- 持续低质量是否真的会输；
- repair 后是否明显更顺；
- 回潮是否成为真实挽回选择。

若压力过大或过小，下一步只能调整 Phase B 敌人 HP / 敌人伤害候选值；**不得由 Codex自行修改 failed/no-call 或增加新惩罚系统。**

---

## 十二、停止线

Candidate A 完成后立即停止并提交：

- 修改文件清单；
- 明确未修改范围；
- 专项 validator 结果；
- 全部回归结果；
- 390×844 七项实机结果；
- debug 60/8 回归结果；
- GitHub commit SHA；
- `docs/PHASE_B_COMBAT_PRESSURE_CANDIDATE_A_HANDOFF.md`。

完成后不得继续调 Candidate B、不得改倍率、不得迁移主线，等待用户 / Sol Review。
