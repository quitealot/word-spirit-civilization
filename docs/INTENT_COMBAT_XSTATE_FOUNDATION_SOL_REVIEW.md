# 《语灵》Intent Combat XState Foundation Spike Sol Review

状态：`PASS AS ISOLATED FLOW FOUNDATION / FUSION NOT YET AUTHORIZED`

日期：2026-08-30

依据：`docs/INTENT_COMBAT_XSTATE_FOUNDATION_SPIKE_TASK.md`、`docs/GITHUB_TURN_BASED_FOUNDATION_REVIEW.md`

## 1. 裁决

XState v5通过独立 foundation spike，可作为《语灵》后续“教学证据—战斗—补弱—再战”的流程编排底座；纯 TypeScript 领域函数继续作为战斗结算唯一真源。

本裁决只确认工程底座，不授权主线迁移，也不自动授权接入 Phase B。Intent Combat V1 的数值、词源、奖励、压制、护盾、回复、weakness、两段反馈和胜负语义均保持不变。

## 2. 工程结果

### 通过项

- `app/game/intent-combat-machine.ts` 明确编排六个阶段，React 页面不再以多组 `useState` 保存流程真源。
- machine actor 的英语三档、battle-only、非法事件、击杀跳过敌方行动、蓄力后压制消费、护盾/回复与重开结果均与 `intent-combat-v1.ts` 纯函数逐项一致。
- machine context 没有加入 repair、FSRS、成长、存档或长期学习数据。
- V1 专项 `19/19`、XState 专项 `18/18`、全量既有 validator、lint、build、diff check 均通过。
- 依赖只新增任务单批准的 `xstate@5.32.6` 与 `@xstate/react@6.1.0`。

### Sol实机确认

- 390×844完成英语独立正确、使用支架后正确、错误基础执行、纯战斗、战败和重新挑战复位；
- 两段确认顺序、HP、护盾、压制和下一回合意图显示与迁移前一致；
- `scrollWidth = bodyScrollWidth = innerWidth = 390`，无横向溢出；
- 浏览器控制台无 warning / error；
- 当前 raw 构建增量总计 `+76,731 bytes`、client `+38,705 bytes`，在隔离样机中接受，后续完整融合仍须重新测量实际移动端产物。

## 3. 边界审计

本轮没有修改主入口、Phase A/B/C、fusion-slice、zero-base、V2规格、EP01–EP03、正式词源或正式剧情。没有把 XState 当作战斗结算层，也没有引入 boardgame.io、Robot3、RPG-JS、rot.js 或其他游戏框架。

## 4. 风险与处理

- `npm audit --omit=dev`报告3个high，来自既有 `next@16.2.6` 及其 `postcss/sharp` 链，并非本轮XState依赖；可用修复要求升级到当前声明范围之外，故本轮不使用 `--force` 越界升级，单独列入依赖治理。
- 当前machine没有事件日志、持久化、repair或长期证据，这是刻意边界，不是遗漏。
- XState成本在独立路由可接受，不代表应把每个简单组件都改成状态机；只用于跨阶段业务流程。

## 5. 下一步

下一步单独冻结“教学证据 → Intent Combat → 真实weakness → 两步repair → 自动再战”融合任务单。复用现有教学、词源和repair，只替换中间流程编排与战斗骨架；先做独立入口，不碰主线。

## 6. 停止线

在新融合任务单冻结前，不接主线、不修改EP01–EP03、不扩敌人/技能/成长/存档、不改变Intent Combat数值与正式词源。
