# 《语灵》Phase B 战斗压力 Candidate A 工程交接

状态：`IMPLEMENTED / READY FOR SOL REAL-DEVICE REVIEW`
日期：2026-08-27

本轮只实现并验证 Phase B 独立连续切片的 Candidate A 压力配置，不代表正式战斗平衡通过。

## Candidate A 实现

`flow=phase-b` 专用配置为：

- 玩家 Max HP：`48`
- 敌人 Max HP：`80`
- 敌人基础伤害：`12`

默认 `/prototype/fusion-slice` 仍使用 Phase A 基线：

- 玩家 Max HP：`48`
- 敌人 Max HP：`60`
- 敌人基础伤害：`8`

`resolveFusionBattleCall` 仅增加了带默认值的可选 `enemyDamage` 注入；未传入时仍读取默认 `8`，函数 `.length` 仍为 `3`。水音、回潮、100/70/40、no-call、repair、结算顺序均未改变。

## 修改文件

- `app/game/phase-b-flow.ts`
- `app/prototype/fusion-slice/page.tsx`
- `app/game/fusion-slice.ts`：仅增加 Candidate A 所需的可选 `enemyDamage` 注入
- `scripts/validate-phase-b-combat-pressure.ts`
- `package.json`：仅新增 `validate:phase-b-combat-pressure`
- `docs/PHASE_B_COMBAT_PRESSURE_CANDIDATE_A_HANDOFF.md`

## 明确未修改

- 未修改 `app/page.tsx`。
- 未修改 `app/game/bridge-config.ts`、`app/game/spirit-config.ts`、`app/game/zero-base-teaching.ts`、`app/learning-engine.ts`。
- 未修改 `app/narrative/**`、EP01–EP03、正式 5505 词源、主存档、成长、等级、星级、共鸣。
- 未修改 100/70/40、no-call、技能效果、教学、repair、正式技能动画。
- 未新增词、敌人、关卡、剧情、资源条、回合上限或额外失败惩罚。

## 自动验证

- `npm run validate:phase-b-combat-pressure`：PASS（15/15；全 failed 状态空间探索 57 个状态）
- `npm run validate:phase-b-flow`：PASS（16/16）
- `npm run validate:skill-english-v2`：PASS
- `npm run validate:fusion-slice`：PASS
- `npm run validate:zero-base-teaching`：PASS
- `npm run lint`：PASS
- `npm run build`：PASS
- `git diff --check`：PASS
- 冻结文件差异审计：PASS
- `app/game/fusion-slice.ts` diff：仅 Candidate A 可选 `enemyDamage` 注入

专项代表曲线：

| 路径 | 结果 |
|---|---|
| 全 independent：水音→水音→回潮→水音→水音 | 第 5 回合胜，`26/48 HP` |
| 一次 failed 后恢复 | 第 6 回合胜，`16/48 HP` |
| 连续两次 failed 后恢复 | 第 7 回合胜，`6/48 HP` |
| 全程 failed，水音/回潮任意组合 | 无获胜路径，最终战败 |

## 390×844 本地实机结果

入口：`/prototype/zero-base?flow=phase-b`；使用完整教学证据后通过一次“继续”进入战斗。

1. 全 independent：5 回合胜利，最终 `26/48`；敌人 `0/80`。
2. 故意 failed 一次后恢复：6 回合胜利，最终 `16/48`；一次错误没有立即结束战斗。
3. 连续 failed 两次后恢复：7 回合胜利，最终 `6/48`；进入危险血线但仍可挽回。
4. 持续 failed：第 5 回合玩家 HP 归零，进入战后状态；专项 resolver 同时确认结果为 `lost`。
5. failed → 两步 repair → 自动再战：只修复 `water`；自动再战首个调用重新出现 `water`，独立正确显示 `100%` 与 `18` 伤害。
6. 回潮战术：先承受一次敌方行动后使用独立回潮，显示实际恢复生命，证明回复能成为真实挽回选择。
7. 过度压力观察：一次错误仍可继续并最终获胜，没有即时 0 伤害或跳过行动；是否产生主观压力仍留给用户 / Sol 体验裁决。

额外回归：

- 默认 `/prototype/fusion-slice` 显示 `60/60` 敌人 HP。
- 默认 no-call 60/8 路径由自动 validator 保持通过。
- Phase B 390px 页面显示 `80/80`，文档宽度等于视口宽度，无横向溢出。
- 实机控制台无 error / warning。

## 当前风险与停止线

持续 failed 的 Phase B 战后界面当前沿用连续切片的“再确认一下”界面，不额外显示“战败”字样；战败状态已由 resolver 和实际 HP 归零验证。是否需要在产品层明确提示，留给 Sol Review，不在本轮自行扩展。

本轮未提交、未推送、未部署；按任务要求等待用户 / Sol 对 Candidate A 的实机判断。不得继续 Candidate B、不得修改倍率或 no-call、不得迁移主线。
