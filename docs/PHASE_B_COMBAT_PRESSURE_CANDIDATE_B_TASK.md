# 《语灵》Phase B 战斗压力 Candidate B：工程测试任务单

状态：`READY FOR CODEX / CANDIDATE-B ONLY`
日期：2026-08-27

依赖：

1. `docs/PHASE_B_COMBAT_PRESSURE_CANDIDATE_A_SOL_VERDICT.md`
2. `docs/PHASE_B_COMBAT_PRESSURE_CANDIDATE_A_HANDOFF.md`
3. `docs/TEACH_BATTLE_REPAIR_PHASE_B_SPEC.md`
4. `docs/TEACH_BATTLE_REPAIR_PHASE_B_HANDOFF.md`
5. `docs/SKILL_ENGLISH_SYSTEM_V2.md`
6. `docs/SKILL_ENGLISH_SYSTEM_V2_ENGINEERING_LOCK.md`
7. 根目录 `AGENTS.md`
8. `app/AGENTS.md`

本任务只验证 **Phase B 独立连续切片 Candidate B**。Candidate A 已因压力偏低判定 `NOT PASS`。本轮只改一个变量：敌方基础伤害 `12 → 14`。

---

## 一、Candidate B 冻结参数

只作用于 `flow=phase-b`：

- 玩家 Max HP：`48`
- 敌人 Max HP：`80`
- 敌人基础伤害：`14`

与 Candidate A 相比，**唯一允许变化的是 enemyDamage：`12 → 14`**。

保持不变：

- 水音：`18`伤害 + 敌方下一击削弱`20%`
- 回潮：`10`伤害 + 回复`22`HP
- independent / supported / failed：`1.00 / 0.70 / 0.40`
- `noCallMultiplier = 0.40`
- 战斗取词
- teaching / repair
- 统一取整
- 战斗结算顺序
- HP 重置规则
- Phase B 自动再战逻辑

Candidate B 不是主线正式平衡。

---

## 二、保留 Candidate A 历史，不覆盖 Phase A debug

当前代码已经有：

`PHASE_B_COMBAT_CANDIDATE_A = { 48 / 80 / 12 }`

Candidate B 实现必须**保留 Candidate A 作为历史可验证配置**，新增：

```ts
PHASE_B_COMBAT_CANDIDATE_B = {
  playerMaxHp: 48,
  enemyMaxHp: 80,
  enemyDamage: 14,
}
```

Phase B 玩家主验收路径切换为 Candidate B。

默认 `/prototype/fusion-slice` 继续保持 Phase A debug 基线：

- 玩家 Max HP：`48`
- 敌人 Max HP：`60`
- 敌人基础伤害：`8`

不得修改 `FUSION_SLICE_RULES` 的默认 `60 / 8`。

---

## 三、允许修改文件

本轮只允许：

- `app/game/phase-b-flow.ts`
  - 只新增 Candidate B profile；Candidate A 保留
- `app/prototype/fusion-slice/page.tsx`
  - Phase B 路径从 Candidate A 切换为 Candidate B
- `scripts/validate-phase-b-combat-pressure-b.ts`（新建）
- `package.json`
  - 只新增 `validate:phase-b-combat-pressure-b`
- `docs/PHASE_B_COMBAT_PRESSURE_CANDIDATE_B_HANDOFF.md`（完成后新建）

Candidate A 原 validator `validate:phase-b-combat-pressure` 必须继续通过，用来证明 A 历史配置未被破坏。

本轮**不得再修改** `app/game/fusion-slice.ts`。Candidate A 已经完成 enemyDamage 可选注入，Candidate B 只使用既有接口。

---

## 四、明确禁止

不得修改：

- `app/page.tsx`
- `app/game/fusion-slice.ts`
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

不得因为 Candidate B 更难而补偿性增强回潮、降低敌人 HP 或调整其他变量。

---

## 五、Candidate B 代表曲线

使用当前冻结结算顺序与 `Math.round` 规则。

### A. 全 independent

技能顺序：

`水音 → 水音 → 回潮 → 水音 → 水音`

全部 independent。

期望：

- 第 `5` 个玩家行动胜利；
- 最终约 `23/48 HP`；
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
- 最终约 `10/48 HP`；
- 一次失误有明显代价，但仍能挽回。

### C. 连续两次 failed 后恢复

代表路径：

1. 水音 failed
2. 水音 failed
3. 水音 independent
4. 回潮 independent
5. 水音 independent
6. 水音 independent
7. 水音 independent

期望：

- 玩家应在击杀前进入 `lost`；
- 当前代表路径不再能像 Candidate A 那样以极低血量通关。

注意：**不要求穷举证明“任意出现两次 failed 的所有策略必败”。**本轮目标不是把“两错”写成机械死刑，而是确认连续不稳定已经形成真正过关风险。

### D. 持续 failed

必须确认持续 40% 发挥仍然无获胜路径，并且相较 Candidate A 更早/不更晚进入失败压力。

### E. repair 前后

至少比较：

- 一次 failed：`6回合 / 约10 HP`
- 全 independent：`5回合 / 约23 HP`

必须能看出 repair 后回到 100% 带来的真实回合和生存改善。

---

## 六、专项 validator

新增：

`npm run validate:phase-b-combat-pressure-b`

至少验证：

1. Candidate A 仍为 `48 / 80 / 12`；
2. Candidate B 为 `48 / 80 / 14`；
3. 默认 Phase A debug 仍为 `48 / 60 / 8`；
4. Candidate B 水音 independent 后敌方伤害：`14 × (1 - 20%) = 11.2 → 11`；
5. Candidate B 水音 failed 后敌方伤害：`14 × (1 - 8%) = 12.88 → 13`；
6. 全 independent 代表序列：5回合胜，`23 HP`；
7. 一次 failed：6回合胜，`10 HP`；
8. 连续两次 failed 代表路径：击杀前 `lost`；
9. 持续 failed 不存在获胜路径；
10. repair 前后至少改善 1 回合且剩余 HP 明显增加；
11. 回潮 independent 仍恢复 `22`，并能在一次 failed 后的代表路径中发挥真实救场作用；
12. 100/70/40 未变；
13. no-call 未变；
14. 水音/回潮配置未变；
15. Candidate A 原 validator 仍通过；
16. `resolveFusionBattleCall.length === 3`，不引入答题时间。

不得为了 validator 全绿调整目标曲线之外的参数。

---

## 七、必须回归

完成后运行：

- `npm run validate:phase-b-combat-pressure-b`
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
- `app/game/fusion-slice.ts`
- `app/game/bridge-config.ts`
- `app/game/spirit-config.ts`
- `app/game/zero-base-teaching.ts`
- `app/narrative/**`

---

## 八、390×844 实机路径

主入口：

`/prototype/zero-base?flow=phase-b`

至少走：

1. 全 independent：约 5 回合胜，观察是否仍顺畅而非过险；
2. 故意 failed 一次后恢复：确认能救回来，但血线明显紧张；
3. 连续 failed 两次走当前代表策略：确认真的可能战败；
4. 持续 failed：确认正常战败；
5. failed → repair → 自动再战 → independent：确认再战明显更快、更安全；
6. 一次正确回潮：确认 22 HP 回复仍有真实救场价值；
7. 重点观察是否出现“一错就开始害怕答题”的过度压力。

同时回归：

- 默认 `/prototype/fusion-slice` 仍为 `60 / 8`；
- Phase A no-call debug 不变；
- 390px 无横向溢出；
- 控制台无 error / warning。

---

## 九、产品通过门

Candidate B 不是以 validator 全绿自动通过。

用户 / Sol 必须判断：

- 全正确：是不是顺畅；
- 一错：是不是“疼但能救”；
- 连续两错：是不是形成真实失败风险；
- 持续低质量：是不是确定过不了；
- repair 后：是不是明显更顺；
- 回潮：是不是仍然有救场价值；
- 是否没有制造“怕错所以不敢思考”的压力。

如果 Candidate B 过重，下一步优先微调敌方伤害，不先改 failed/no-call，也不增加新系统。

---

## 十、停止线

Candidate B 完成后立即停止，等待用户 / Sol 实机 Review。

不得继续 Candidate C、不得修改倍率、不得修改 no-call、不得进入主线、不得迁移九技能、不得修改 EP01–EP03。

交付：

- 修改文件清单；
- 明确未修改文件；
- Candidate B validator 结果；
- Candidate A 与 Phase B 全部回归结果；
- 390×844 实机七条结果；
- 控制台状态；
- GitHub commit SHA；
- `docs/PHASE_B_COMBAT_PRESSURE_CANDIDATE_B_HANDOFF.md`。
