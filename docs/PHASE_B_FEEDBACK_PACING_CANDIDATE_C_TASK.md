# 《语灵》Phase B Candidate C：反馈节奏修复 + 25%/25% 候选测试任务单

状态：`FROZEN / NOT AUTHORIZED FOR CODE`
日期：2026-08-28

依赖：

1. `docs/PHASE_B_COMBAT_PRESSURE_CANDIDATE_B_SOL_REVIEW.md`
2. `docs/PHASE_B_COMBAT_PRESSURE_CANDIDATE_B_HANDOFF.md`
3. `docs/TEACH_BATTLE_REPAIR_PHASE_B_SPEC.md`
4. `docs/TEACH_BATTLE_REPAIR_PHASE_B_HANDOFF.md`
5. `docs/SKILL_ENGLISH_SYSTEM_V2.md`
6. `docs/SKILL_ENGLISH_SYSTEM_V2_ENGINEERING_LOCK.md`
7. 根目录 `AGENTS.md`
8. `app/AGENTS.md`

本任务已经冻结，但**尚未授权 Codex 执行**。只有用户明确回复批准执行后，才允许进入工程阶段。

---

## 一、目标

只验证两个问题：

1. 玩家能否清楚读懂“我的技能先发生 → 敌人再行动 → 我付出什么代价”；
2. 在敌人压力已经接近目标的情况下，`failed/no-call = 25%/25%` 是否比 40%/40% 更能体现学习前后的技能差距，同时不让一次失误变成恐惧。

本轮不是主线正式平衡，不进入主线，不扩九技能。

---

## 二、Candidate C 冻结测试参数

战斗压力继续沿用 Candidate B：

- 玩家 Max HP：`48`
- 敌人 Max HP：`80`
- 敌人基础伤害：`14`

技能基础值继续不变：

- 水音：`18伤害 + 20%下一击削弱`
- 回潮：`10伤害 + 22回复`

Candidate C 只测试低质量倍率：

- independent：`1.00`
- supported：`0.70`
- failed：`0.25`
- no-call：`0.25`

必须保留 Candidate A、Candidate B 历史配置，不得覆盖历史测试记录。

默认 Phase A debug 继续保持：

- 玩家48
- 敌人60
- 敌伤8
- failed/no-call 仍按当前正式 V2 基线 40%/40%

Candidate C 只作用于 Phase B Candidate C 测试路径，不能全局改写 V2。

---

## 三、反馈节奏冻结

### 3.1 非击杀回合

必须按以下阶段顺序运行：

#### Stage 1：玩家技能结果

- 立即结算玩家技能；
- UI 显示技能名、发挥百分比、伤害、回复/削弱；
- 若有实际回复，必须单独以绿色显示 `+N HP`；
- 玩家 HP 条同步体现技能后的回复；
- 该状态稳定保持 **1200ms**；
- 此期间技能按钮与英语调用不可继续操作。

#### Stage 2：敌方行动预备

- 显示中性提示：`敌方行动`；
- 持续 **400ms**；
- 此阶段不扣 HP，不改变技能结果；
- 不新增角色对白或正式动画。

#### Stage 3：敌方伤害结果

- 敌方伤害正式结算；
- 使用红色显示 `-N HP`；
- 玩家 HP 条同步下降；
- 该状态稳定保持 **1200ms**；
- 信息保持结束后才进入下一回合技能选择。

### 3.2 击杀回合

- 玩家技能结果仍稳定保持 **1200ms**；
- 显示敌方已被击败/敌人未行动的既有中性结果即可；
- 不进入 `敌方行动` 预备；
- 不显示红色伤害；
- 之后再进入战后状态。

### 3.3 规则

- 不允许用玩家答题速度压缩上述阶段；
- 不新增“快速跳过”按钮；
- 不新增动画时间轴系统；
- 使用现有 React transient state + timeout 即可，但必须保证计时与阶段清楚可验证；
- 页面切后台/组件卸载时不得留下会错误执行的旧 timer；如现有实现需要清理，做最小 cleanup，不扩系统。

---

## 四、Candidate C 技能预期

按统一 Math.round 规则：

### 水音 failed / no-call 25%

- `18 × .25 = 4.5 → 5伤害`
- `20% × .25 = 5%削弱`

### 回潮 failed / no-call 25%

- `10 × .25 = 2.5 → 3伤害`
- `22 × .25 = 5.5 → 6回复`

independent / supported 继续使用现有 100% / 70% 结果。

---

## 五、工程隔离要求

Candidate C 不得把 25% 写进全局 `FUSION_SLICE_RULES`。

允许的冻结实现方向：

### 5.1 Phase B Candidate C profile

在 `app/game/phase-b-flow.ts` 保留：

- Candidate A：48/80/12
- Candidate B：48/80/14 + 当前40/40历史语义

新增 Candidate C profile，至少包含：

- playerMaxHp 48
- enemyMaxHp 80
- enemyDamage 14
- failedMultiplier .25
- noCallMultiplier .25

### 5.2 战斗 resolver 的极窄扩展

如当前 resolver 还不能按 encounter 注入质量倍率，允许在现有 options 上做最小扩展：

- 允许 Phase B Candidate C 为当前调用提供 `qualityMultiplier` override；
- 未提供 override 时继续使用 `FUSION_SLICE_RULES.effectMultipliers[quality]`；
- 默认 debug、Candidate A/B 历史 validator 行为必须完全不变；
- `resolveFusionBattleCall.length` 继续保持 `3`；
- 不得修改技能结算公式、取整、weakness、回复上限、削弱、击杀不反击等其他规则。

no-call Candidate C 的 25% 只需作为独立候选配置与纯结算验证存在；Phase B 主流程正常有合格词，不允许为了测试 no-call 改写 evidence_missing 规则。

### 5.3 UI

`flow=phase-b` Candidate C 验收路径：

- 使用 Candidate C 48/80/14 + 25%/25%；
- 使用本任务第3节反馈节奏；
- 不添加开发术语；
- repair 与连续体验不变。

默认 `/prototype/fusion-slice` debug 不应用 Candidate C 节奏/倍率要求，除非节奏修复被明确限定为 Phase B 连续路径的 UI 行为。

---

## 六、允许修改文件

若后续用户批准执行，本轮仅允许：

- `app/game/phase-b-flow.ts`
- `app/prototype/fusion-slice/page.tsx`
- `app/game/fusion-slice.ts`：仅在确有需要时增加第5.2节的可选 qualityMultiplier 注入；不得改其他战斗公式
- `app/prototype.css`：仅增加绿色回复/红色伤害/阶段提示所需的最小样式
- `scripts/validate-phase-b-feedback-candidate-c.ts`（新建）
- `package.json`：只新增对应 validator script
- `docs/PHASE_B_FEEDBACK_PACING_CANDIDATE_C_HANDOFF.md`（完成后新建）

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
- 正式5505词源
- 主存档 schema
- 九技能全局配置
- 成长、等级、星级、共鸣
- teaching / repair 规则
- independent 100%
- supported 70%
- 敌人80/14
- 水音 / 回潮基础效果
- 正式技能动画
- 新词、新敌人、新关卡、新剧情
- 回合上限、怒气、资源条、额外失败惩罚

不得把 Candidate C 25%/25% 宣称为正式 V2 结论。

---

## 八、专项自动验证

后续若批准执行，新增：

`npm run validate:phase-b-feedback-candidate-c`

至少验证：

1. Candidate C = 48/80/14；
2. independent = 1、supported = .7 不变；
3. Candidate C failed = .25；
4. Candidate C no-call = .25；
5. 默认 V2/Phase A failed/no-call 仍为 .40/.40；
6. Candidate A 仍保留 48/80/12；
7. Candidate B 仍保留 48/80/14 压力历史配置；
8. 水音25% = 5伤害 + 5%削弱；
9. 回潮25% = 3伤害 + 6回复；
10. Candidate C 水音 failed 后敌方伤害：`14 × .95 = 13.3 → 13`；
11. Candidate C 回潮 failed 的实际回复在有足够缺血时为6；
12. 全 independent 代表路径仍5回合约23HP；
13. 一次 failed 后恢复的代表路径仍可挽回；
14. 连续两次 failed 代表路径会战败；
15. 全 failed 不存在获胜路径；
16. repair 后 independent 与 repair 前 failed 的技能组件差距真实存在；
17. resolver 默认调用不受 Candidate C override 影响；
18. `resolveFusionBattleCall.length === 3`；
19. no-call Candidate C 25% 的纯结算结果与 failed 25%同倍率但配置键语义独立；
20. Phase B evidence_missing 仍不退化成 no-call。

反馈节奏的时间顺序若无法由纯逻辑 validator完整覆盖，允许抽取原型专用纯常量/阶段 helper，至少断言：

- skillResultHoldMs = 1200
- enemyPrepareMs = 400
- enemyDamageHoldMs = 1200
- 阶段顺序为 `skill_result → enemy_prepare → enemy_damage → next_turn`
- kill 路径跳过 enemy_prepare/enemy_damage

不得为了写 validator 新建正式动画系统。

---

## 九、必须回归

批准执行后必须运行：

- `validate:phase-b-feedback-candidate-c`
- `validate:phase-b-combat-pressure-b`
- `validate:phase-b-combat-pressure`
- `validate:phase-b-flow`
- `validate:skill-english-v2`
- `validate:fusion-slice`
- `validate:zero-base-teaching`
- `lint`
- `build`
- `git diff --check`

Candidate A/B 历史 validator 必须继续通过。

---

## 十、390×844 实机验收路径

批准执行后至少走：

1. independent 回潮：清楚看到绿色 `+22`，1200ms 后才进入敌方预备与红色伤害；
2. failed 回潮：清楚看到绿色 `+6`，再看到敌方预备，随后红色约 `-14`，能感受到净损失；
3. independent 水音：技能结果停留足够，随后看到敌方伤害约11；
4. failed 水音：看到5伤害+5%削弱，随后约13敌伤；
5. 一次 failed 后恢复：仍可通过合理技能选择救回；
6. 连续两次 failed：进入战败/极危险结果，不形成“错了也无所谓”；
7. failed → repair → 自动再战 → independent：明显感到伤害/回复和生存改善；
8. 全 independent：仍不觉得战斗拖沓或被节奏阻塞；
9. 等待英语作答3秒以上不影响100%判定；
10. 390×844无横向溢出，控制台无error/warning。

---

## 十一、产品验收问题

Candidate C 工程全绿不等于通过。用户/Sol必须判断：

1. 我现在能不能清楚看懂“技能结果”和“敌方代价”是两个阶段？
2. 回潮 failed 的 `+6` 是否仍让人觉得奖励过多？
3. 一次失误是否仍有挽回空间？
4. 连续低质量调用是否真的让人认真起来，但不是害怕作答？
5. repair 后回到100%时，是否明显感觉“这次技能真的更完整”？
6. 2.8秒左右的非击杀回合节奏是否太慢？如果太慢，只调展示时间，不动学习倍率。

---

## 十二、停止线

当前状态仍为：`FROZEN / NOT AUTHORIZED FOR CODE`。

只有用户明确批准执行后，Codex才可按本任务单修改。

批准执行后完成即停止，等待用户/Sol实机Review；不得自行继续 Candidate D 或主线迁移。
