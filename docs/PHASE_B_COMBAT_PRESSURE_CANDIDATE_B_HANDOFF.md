# 《语灵》Phase B 战斗压力 Candidate B 工程交接

状态：`IMPLEMENTED / READY FOR SOL REAL-DEVICE REVIEW`

日期：2026-08-27

本轮只实现 Phase B 独立连续切片的 Candidate B 压力配置，不代表正式战斗平衡通过，也没有提交、推送或部署。

## Candidate B 实现

`flow=phase-b` 专用配置为：

- 玩家 Max HP：`48`
- 敌人 Max HP：`80`
- 敌人基础伤害：`14`

Candidate A 历史配置继续保留：

- 玩家 Max HP：`48`
- 敌人 Max HP：`80`
- 敌人基础伤害：`12`

默认 `/prototype/fusion-slice` Phase A debug 基线继续为：

- 玩家 Max HP：`48`
- 敌人 Max HP：`60`
- 敌人基础伤害：`8`

本轮未修改 `app/game/fusion-slice.ts`；Candidate B 只使用既有 `enemyDamage` 可选注入。100/70/40、no-call、水音、回潮、教学、repair、取词和结算顺序均未改变。

## 修改文件

- `app/game/phase-b-flow.ts`：新增 `PHASE_B_COMBAT_CANDIDATE_B`，保留 Candidate A。
- `app/prototype/fusion-slice/page.tsx`：Phase B 初始化、战斗结算和显示切换到 Candidate B。
- `scripts/validate-phase-b-combat-pressure-b.ts`：新增 16 项 Candidate B 专项验证。
- `package.json`：新增 `validate:phase-b-combat-pressure-b`。
- `docs/PHASE_B_COMBAT_PRESSURE_CANDIDATE_B_HANDOFF.md`：本交接文档。

## 明确未修改

- 未修改 `app/page.tsx`、`app/game/fusion-slice.ts`、`app/game/bridge-config.ts`、`app/game/spirit-config.ts`、`app/game/zero-base-teaching.ts`、`app/learning-engine.ts`。
- 未修改 `app/narrative/**`、EP01–EP03、正式 5505 词源、主存档、成长、等级、星级、共鸣。
- 未修改 100/70/40、`noCallMultiplier`、水音/回潮效果、teaching/repair、正式技能动画。
- 未新增词、敌人、关卡、剧情、资源条、回合上限或额外失败惩罚。

## 自动验证

- `npm run validate:phase-b-combat-pressure-b`：PASS（16/16；全 failed 状态探索 29 个；全 failed 最大动作 A=`14`、B=`8`）。
- `npm run validate:phase-b-combat-pressure`：PASS（Candidate A 15/15；探索 57 个状态）。
- `npm run validate:phase-b-flow`：PASS（16/16）。
- `npm run validate:skill-english-v2`：PASS。
- `npm run validate:fusion-slice`：PASS。
- `npm run validate:zero-base-teaching`：PASS。
- `npm run lint`：PASS。
- `npm run build`：PASS。
- `git diff --check`：PASS。
- 冻结文件差异审计：PASS。

专项数值证据：

- 水音 independent：`14 × (1 - 20%) = 11.2 → 11`。
- 水音 failed：`14 × (1 - 8%) = 12.88 → 13`。
- 全 independent：第 5 回合胜，`23/48 HP`。
- 一次 failed：第 6 回合胜，`10/48 HP`。
- 连续两次 failed 代表路径：第 6 回合 `lost`，敌方剩 `2/80 HP`。
- 全程 failed：无获胜路径；Candidate B 最长全 failed 生存动作 `8`，Candidate A 为 `14`。
- 回潮 independent：回复仍为 `22`。
- `resolveFusionBattleCall.length === 3`，没有引入答题时间参数。

## 390×844 本地实机结果

实机入口：`http://localhost:3000/prototype/zero-base?flow=phase-b`。使用完整教学证据后，通过一次“继续”进入战斗。

1. 全 independent：逐回合可见血线 `37/48·62/80`、`26/48·44/80`、`34/48·34/80`、`23/48·16/80`；最终 `23/48·0/80`，反馈显示敌人未行动。
2. 故意 failed 一次后恢复：逐回合 `35/48·73/80`、`24/48·55/80`、`32/48·45/80`、`21/48·27/80`、`10/48·9/80`；最终 `10/48·0/80`，进入真实薄弱词复盘。
3. 连续 failed 两次后按代表策略恢复：逐回合 `35/48·73/80`、`22/48·66/80`、`11/48·48/80`、`19/48·38/80`、`8/48·20/80`、`0/48·2/80`，进入战后复盘，确认击杀前战败。
4. 持续 failed：第 4 回合 `0/48·52/80` 战败，进入战后复盘。
5. failed → 两步 repair → 自动再战：复盘只列出 `water · 水音 · 40%`；第一步显示 `water → 水`，收起后独立确认；确认后自动再战，无额外“立即挑战”；首个调用重新出现 `water`，独立反馈显示 `100%发挥 · 18伤害`。
6. 回潮救场：先用两次 independent 水音降至 `26/48`，再调用回潮；反馈显示 `100%发挥 · 10伤害 · 实际恢复22生命`，敌方行动后为 `34/48·34/80`。
7. 过度压力观察：在首个 `water` 调用界面等待约 3 秒后再答对；界面明确显示“思考时间不限”，仍反馈 `100%发挥 · 18伤害`，没有即时反应时间惩罚。

实机布局与控制台：

- `innerWidth=390`、`innerHeight=844`。
- `document.scrollWidth=390`、`body.scrollWidth=390`，无横向溢出。
- 控制台 error/warning：无。

## 默认 Phase A 回归

在独立的 `127.0.0.1` 浏览器源上使用无教学证据的默认 `/prototype/fusion-slice`：

- 入口显示 `48/48` 玩家、`60/60` 敌人。
- 直接挑战仍显示两个真实技能的 `本次40%发挥`，没有陌生英语。
- 无词回潮后显示 `40/48` 玩家、`56/60` 敌人，并显示敌方行动承受 `8` 伤害。

## 未解决问题与风险

- Candidate B 是否通过仍由用户 / Sol 进行产品体验裁决；validator 全绿不等于平衡通过。
- 本轮未部署，外部演示站不会自动显示 B；待上层 Codex 提交并按发布流程部署后再做线上验收。
- 本轮未显示新的“战败”专用文案，继续沿用 Phase B 已有“再确认一下”复盘入口；是否需要产品层明确提示留给 Sol Review，不在本任务中扩展。

本轮工程执行到此停止，等待用户 / Sol 对 Candidate B 实机体验裁决。当前工作树尚未提交，commit SHA 待上层统一提交后补记。
