# 《语灵》Phase B 战斗压力 Candidate A：Sol 最终裁决

状态：`NOT PASS / PRESSURE TOO LOW / CANDIDATE A CLOSED`
日期：2026-08-27
实现基线：`73e825a59fe8c8378c697002e79a138c2056b29a`
工程交接：`docs/PHASE_B_COMBAT_PRESSURE_CANDIDATE_A_HANDOFF.md`

## 1. 最终结论

Candidate A 工程实现与自动验证均成立，但**产品体验不通过**。

当前 Phase B Candidate A：

- 玩家 Max HP：`48`
- 敌人 Max HP：`80`
- 敌人基础伤害：`12`
- 水音 / 回潮：保持 V2 冻结效果
- independent / supported / failed：`1.00 / 0.70 / 0.40`
- no-call：`0.40`

工程层已经证明：全 independent、一次 failed、连续两次 failed、持续 failed 的确定性代表路径能够拉开差异；但实机主观判断仍是：**战斗压力偏低，40% 发挥的真实代价还不够强，学习质量与生存压力的因果不够明显。**

因此：

> Candidate A 不作为 Phase B 当前平衡候选继续使用。

这不是 V2 机制失败，也不是要求降低 failed 倍率；本轮只说明 `80 HP / 12伤害` 仍偏简单。

## 2. 保留的正确方向

以下继续冻结，不因 Candidate A 不通过而重开：

- 答错仍能行动，不改成 0 伤害；
- 一次失误应保留挽回空间；
- 战斗压力主要通过敌人多获得行动机会体现；
- `failed = 0.40` 暂不修改；
- `noCall = 0.40` 暂不修改；
- 不允许只降低 failed，避免出现 no-call 反而更强的规格冲突；
- 水音 / 回潮技能身份、伤害、回复、削弱不改；
- repair、教学、战斗取词、结算顺序不改。

## 3. 下一候选：Candidate B

Sol 批准进入一个**单变量**窄测试：

- 玩家 Max HP：`48`（不变）
- 敌人 Max HP：`80`（不变）
- 敌人基础伤害：`14`（唯一变化）

目的：只观察增加敌方单次压力后，是否更接近以下心智：

> 好好学习和稳定调用，才能顺利闯关；一次失误尚可补救，连续不稳定就可能真的过不了。

代表性预期：

- 全 independent：第 5 个玩家行动胜，约 `23/48 HP`；
- 一次 failed 后恢复：第 6 个玩家行动胜，约 `10/48 HP`；
- 连续两次 failed 的当前代表路径：在击杀前战败；
- 持续 failed：更早战败；
- 回潮仍必须保有真实救场价值。

注意：Candidate B **不要求所有“连续两次 failed”的所有策略都必败**。本轮只验证代表路径与整体压力是否合理，避免把一次或两次失误设计成机械死刑。

## 4. 当前停止线

Candidate B 任务单冻结前，Codex 不得自行修改代码。

即使 Candidate B 进入工程测试，也不得：

- 修改 100 / 70 / 40；
- 修改 no-call；
- 修改水音 / 回潮；
- 修改 Phase B teaching / repair；
- 增加回合上限、怒气、资源条或额外惩罚；
- 修改主线、九技能或 EP01–EP03；
- 把 `48 / 80 / 14` 宣称为主线正式平衡。
