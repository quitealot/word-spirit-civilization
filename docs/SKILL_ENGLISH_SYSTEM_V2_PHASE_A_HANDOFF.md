# 《语灵》技能 × 英语系统 V2：Phase A 工程交接

状态：`IMPLEMENTED / WAITING FOR SOL PLAYTEST REVIEW`

独立入口：`/prototype/fusion-slice`

## 实现范围

- 仅迁移独立融合切片中的澜歌「水音 / 回潮」。
- 战斗取词固定为 `Used-or-Maintained + battleEligible`，不按技能或 actionTag 分池。
- 水音使用显式配置：`18` 伤害 + 敌方下一次伤害降低 `20%`。
- 回潮使用显式配置：`10` 伤害 + 恢复 `22` HP，且不超过 Max HP。
- 即时倍率固定为独立 `1.00`、轻支架 `0.70`、失败 `0.40`；`noCall = 0.40` 使用独立配置键。
- 无合格词时仍选择水音/回潮，不出现陌生英语、不生成薄弱词、不创建临时基础技能。
- 玩家技能整体结算后若击杀，敌人不行动；否则按削弱 → 减伤 → 最终取整 → 护盾 → HP 的顺序结算。

## 明确未修改

- 未修改 `app/page.tsx`、`bridge-config.ts`、`spirit-config.ts`、`app/narrative/**`。
- 未修改 EP01–EP03、主存档、成长系统、L2/L3。
- 未新增词、敌人、关卡、正式技能文案或另外七个技能。

## 自动验证

- `validate:skill-english-v2` 覆盖任务单要求的 14 项 V2 Phase A 规则。
- 保留原 `validate:fusion-slice` 兼容回归。
- `validate:skill-english-v2`、`validate:fusion-slice`、`validate:zero-base-teaching`、lint、build 与 `git diff --check` 均通过。

## 390×844 实机结果

- 两词合格时，连续选择水音稳定出现 `water → help`；重开后第一回合选择回潮仍从 `water` 开始。
- 水音独立/支架调用分别显示 `18伤害 + 20%削弱`、`13伤害 + 14%削弱`；回潮失败调用显示 `4伤害 + 实际恢复9生命`。
- 满血时技能按钮清楚显示水音偏压制、回潮偏回复；受伤后回潮实际恢复可见。
- 无合格词时只显示水音/回潮，不出现英语题或基础技能；水音按 `7伤害 + 8%削弱` 发动。
- 无合格词路径以真实回潮策略完成战斗，未生成薄弱词。
- 英语调用始终嵌在技能区域内；390px 视口无横向溢出，浏览器控制台无错误或警告。

## 停止线

Phase A 完成后停止，等待用户/Sol 实机 Review；不得继续迁移主线九技能或扩展系统。
