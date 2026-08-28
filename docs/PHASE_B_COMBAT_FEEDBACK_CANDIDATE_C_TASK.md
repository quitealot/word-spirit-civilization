# 《语灵》Phase B Candidate C：战斗反馈 + 25%/25% 候选任务单

状态：`FROZEN / NOT AUTHORIZED FOR CODE`
日期：2026-08-28

依赖：

1. `docs/PHASE_B_COMBAT_PRESSURE_CANDIDATE_B_SOL_VERDICT.md`
2. `docs/PHASE_B_COMBAT_PRESSURE_CANDIDATE_B_HANDOFF.md`
3. `docs/TEACH_BATTLE_REPAIR_PHASE_B_SPEC.md`
4. `docs/TEACH_BATTLE_REPAIR_PHASE_B_HANDOFF.md`
5. `docs/SKILL_ENGLISH_SYSTEM_V2.md`
6. `docs/SKILL_ENGLISH_SYSTEM_V2_ENGINEERING_LOCK.md`
7. 根目录 `AGENTS.md`
8. `app/AGENTS.md`

本任务单已经冻结产品与工程边界，但**当前不授权 Codex 执行**。只有用户明确说“执行 Candidate C”后才能开始改代码。

---

## 一、Candidate C 目标

只解决 Candidate B 暴露的两个问题：

1. 玩家看不清“自己的技能结果”和“敌方行动结果”；
2. failed / no-call 的低质量回复主观上仍显得过强。

不增加新战斗系统，不改敌人 HP / 敌伤，不改技能本体。

Candidate C：

- 玩家 Max HP：`48`
- 敌人 Max HP：`80`
- 敌人基础伤害：`14`
- independent：`1.00`
- supported：`0.70`
- failed：候选 `0.25`
- no-call：候选 `0.25`
- 水音 / 回潮基础效果不变
- Phase B teaching / repair 不变

Candidate A `48/80/12`、Candidate B `48/80/14 + 40/40` 作为历史 profile 保留。

默认 `/prototype/fusion-slice` Phase A debug 继续保持 `48/60/8 + 40/40`。

---

## 二、采用成熟顺序回合制反馈，不自造大系统

冻结阶段顺序：

`技能选择 → 英语调用 → 玩家技能结果 → 敌方行动提示 → 敌方结果 → 下一回合技能选择`

### 2.1 玩家技能结果

结算后先完整呈现玩家这次技能：

- 技能名；
- 本次发挥百分比；
- 对敌伤害；
- 回复时显示绿色 `+回复数值`；
- 削弱时显示削弱百分比；
- 玩家/敌方 HP 条随本次结果平滑变化。

该阶段输入锁定，不显示下一轮可点技能。

原型测试的可读停留目标：约 `1.2s`。

这只是 Candidate C 的原型起点，不作为未来正式动画永久毫秒规范。

### 2.2 敌方行动提示

玩家技能结果稳定后，再明确进入敌方阶段。

最小允许表达：

`敌方行动`

可配现有轻量位移/闪烁，不新增正式动画系统。

### 2.3 敌方结果

敌伤结算后：

- 使用红色 `-伤害数值`；
- 玩家 HP 条平滑变化；
- 结果保持可读，原型目标约 `1.2s`；
- 玩家 HP = 0 时明确进入战败状态，不抢先跳 repair；
- 敌方行动结果稳定后才开放下一次技能选择。

### 2.4 输入规则

- 从玩家确认英语调用开始，到敌方结果稳定结束，技能区保持锁定；
- 不允许靠连续点击跳过结果；
- 思考英语仍不限时；
- 不新增 QTE、反应速度奖励或惩罚。

---

## 三、Candidate C 低质量倍率

只在 Candidate C / Phase B 独立测试中使用：

- failed = `0.25`
- no-call = `0.25`

必须成对变化。

默认 Phase A debug、Candidate A/B 历史验证继续保留原来的 `0.40 / 0.40`。

### 3.1 低质量技能结果

水音 25%：

- `18 × .25 = 4.5 → 5` 伤害；
- `20% × .25 = 5%` 下一击削弱。

回潮 25%：

- `10 × .25 = 2.5 → 3` 伤害；
- `22 × .25 = 5.5 → 6` 回复。

在 Candidate C 敌伤14下，回潮 failed 的视觉与实际顺序必须清楚表达：

`+6 回复 → 敌方行动 → -14 伤害`

不能只显示最终净 HP 变化。

---

## 四、战败反馈

Candidate B 已暴露一个既有问题：玩家 HP 归零后直接进入“再确认一下”，战败本身不够清楚。

Candidate C 必须采用成熟回合制常规：

1. HP 归零；
2. 明确显示最小战败状态：`战斗失利`；
3. 结果稳定后，再提供 `处理刚才的问题`；
4. repair 完成后仍按 Phase B 规则自动再战。

不新增角色对白、不新增失败剧情、不新增惩罚资源。

---

## 五、工程隔离原则

不得全局修改 V2 默认倍率。

建议把 Candidate C 的 encounter 参数扩展为原型专用 profile，例如：

```ts
PHASE_B_COMBAT_CANDIDATE_C = {
  playerMaxHp: 48,
  enemyMaxHp: 80,
  enemyDamage: 14,
  failedMultiplier: 0.25,
  noCallMultiplier: 0.25,
}
```

名称可最小适配，但参数语义不得改变。

### 5.1 resolver

允许对 `app/game/fusion-slice.ts` 做最小配置注入扩展，但默认行为必须完全保持：

- `resolveFusionBattleCall` 默认仍使用 V2 40% failed；
- Candidate C 页面可显式注入本 encounter 的 failed multiplier；
- `resolveFusionNoCallTurn` 默认仍使用 Phase A no-call 40%；
- Candidate C 专项 validator 可显式注入 no-call 25%。

不得复制一套新 resolver，不得为 Candidate C 新建第二套战斗系统。

如果无法通过两个可选 multiplier 注入完成，必须停下报告，不得自行重构核心战斗。

---

## 六、允许修改范围（仅未来获授权后）

优先允许：

- `app/game/phase-b-flow.ts`
- `app/prototype/fusion-slice/page.tsx`
- `app/prototype.css`：仅浮字、HP条过渡、阶段锁定等原型样式
- `app/game/fusion-slice.ts`：仅 Candidate C multiplier 可选注入
- `scripts/validate-phase-b-combat-feedback-c.ts`（新建）
- `package.json`：只新增对应 validator
- `docs/PHASE_B_COMBAT_FEEDBACK_CANDIDATE_C_HANDOFF.md`（完成后新建）

明确禁止：

- `app/page.tsx`
- `bridge-config.ts`
- `spirit-config.ts`
- `zero-base-teaching.ts`
- `learning-engine.ts`
- `app/narrative/**`
- EP01–EP03
- 正式 5505 词源
- 主存档 schema
- 成长/等级/星级/共鸣
- 另外七技能
- 新敌人、新关卡、新剧情
- 正式技能动画系统
- 回合上限、怒气、资源条、额外失败惩罚

---

## 七、必须验证的数值与隔离

Candidate C validator 至少验证：

1. C profile = `48 / 80 / 14 / failed .25 / noCall .25`；
2. Candidate B profile 仍保留 `48 / 80 / 14 / 40/40`；
3. Candidate A 仍保留 `48 / 80 / 12 / 40/40`；
4. 默认 Phase A debug 仍为 `48 / 60 / 8 / 40/40`；
5. independent / supported 仍为 `1.00 / 0.70`；
6. C failed 水音 = `5伤害 + 5%削弱`；
7. C failed 回潮 = `3伤害 + 6回复`；
8. C no-call 水音/回潮使用 25%，但默认 no-call debug 仍为40%；
9. 技能基础配置完全未变；
10. 思考时间仍不进入 battle resolver；
11. 击杀后敌人仍不行动；
12. HP=0 时结果先是 `lost`，再由 UI进入 repair。

---

## 八、必须验证的反馈顺序

390×844 实机至少验证：

### 路径1：回潮 failed

玩家应能清楚看到：

1. 回潮 25% 发动；
2. 敌人扣 `3`；
3. 自己绿色 `+6`；
4. 本次玩家技能结果稳定停留；
5. 出现 `敌方行动`；
6. 自己红色 `-14`；
7. HP条变化稳定；
8. 然后才重新出现技能选择。

验收重点：用户不需要心算，也能理解“虽然回了一点，但这一回合总体付出了明显代价”。

### 路径2：回潮 independent

清楚看到：

- `10伤害 +22回复`；
- 再承受敌方行动；
- 与 failed 的视觉和实际恢复差距非常明显。

### 路径3：水音 failed vs independent

清楚比较：

- 25%：`5伤害 +5%削弱`；
- 100%：`18伤害 +20%削弱`。

### 路径4：战败

持续低质量调用时：

- HP 归零；
- 明确出现 `战斗失利`；
- 再进入 `处理刚才的问题`；
- repair 后自动再战。

---

## 九、Candidate C 产品通过问题

代码全绿不代表通过。实机必须回答：

1. 我能不能清楚区分“我的技能结果”和“敌人的行动结果”？
2. 回潮 failed 时，我还会不会觉得“答错也奖励很多”？
3. 一次 failed 是否仍有挽回空间，而不是立即恐惧？
4. independent 回潮是否明显像一个真正的强力救场技能？
5. 战败是否清楚，但不会产生羞辱/考试失败感？
6. 反馈节奏是否清楚而不拖沓？
7. repair → 再战是否仍保持 Phase B 的连续感？

---

## 十、当前停止线

**当前任务单已冻结，但未授权工程执行。**

Codex 现在不得：

- 修改 Candidate C；
- 修改 25%/25%；
- 调整反馈节奏；
- 继续提高敌伤；
- 进入主线。

等用户明确批准“执行 Candidate C”后，再把本任务状态改为 `READY FOR CODEX / CANDIDATE-C ONLY`。