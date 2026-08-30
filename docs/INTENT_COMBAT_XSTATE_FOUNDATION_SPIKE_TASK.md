# 《语灵》Intent Combat XState Foundation Spike 工程任务单

状态：`FROZEN / AUTHORIZED FOR IMPLEMENTATION`

日期：2026-08-30

依据：`docs/GITHUB_TURN_BASED_FOUNDATION_REVIEW.md`

## 1. 唯一目标

将独立入口 `/prototype/intent-combat` 的临时 React 流程状态等价迁移到 XState v5，验证成熟状态机底座可用。

本轮不是玩法迭代。迁移前后，同一输入序列的技能结果、HP、护盾、敌方意图、压制、weakness、胜负、两段反馈和页面文案必须保持一致。

## 2. 允许修改

- `package.json` 与对应 lockfile：只增加 `xstate@5.32.6`、`@xstate/react@6.1.0`；
- 新建 `app/game/intent-combat-machine.ts`；
- 修改 `app/prototype/intent-combat/page.tsx`，只把流程交给 machine；
- 必要时最小调整 `app/game/intent-combat-v1.ts` 的纯函数导出，不得改公式；
- 新建 `scripts/validate-intent-combat-xstate.ts`；
- 必要时最小更新 `scripts/validate-intent-combat-v1.ts` 的页面结构断言，使其验证行为而不是旧实现细节；
- `package.json` 增加一个专项 validator script；
- 新建 handoff 与 Sol Review 文档。

## 3. 禁止范围

- 不改 `app/page.tsx`、Phase A/B/C、fusion-slice、zero-base、主线、EP01–EP03；
- 不改三技能数值、敌人HP、意图序列、词、释义、题目选项、正式文案；
- 不新增 repair、FSRS、成长、存档、敌人、技能、动画或视觉重做；
- 不引入 boardgame.io、Robot3、RPG-JS、rot.js 或其他新依赖；
- 不把长期学习数据放入 machine；
- 不使用 machine action 重新实现战斗公式。

## 4. Machine 边界

至少包含：

```text
skill_select
word_call
player_result
enemy_result
won
lost
```

纯战斗模式允许从 `skill_select` 直接结算。英语模式必须先选技能再进入 `word_call`。击杀后不得进入 `enemy_result`。`won/lost` 为明确终态或明确结果态，重开后返回 `skill_select`。

Machine context 只保存本场瞬时状态：battle、mode、selected call、support flag、outcome、counts。领域结算只调用 `intent-combat-v1.ts` 现有纯函数。

## 5. 必须验证

1. 原 Intent Combat V1 validator 全部通过；
2. 新 validator 无界面启动 actor，并覆盖英语三档与纯战斗模式；
3. 非法阶段事件不改变状态；
4. 击杀后不进入敌方结果；
5. 蓄力、水音压制、护盾、回复、weakness 与原领域函数输出完全一致；
6. 重开清空瞬时状态；
7. 页面不再以多个 React `useState` 维护流程真源；
8. `npm run lint`、`npm run build`、`git diff --check` 通过；
9. 比较迁移前后生产构建产物，记录依赖引入影响，不虚构 gzip 数字；
10. 390×844 实机走英语独立/支架/错误、纯战斗、胜利或战败、重开，无运行错误和横向溢出。

## 6. 停止线

完成验证、handoff 和 commit 后立即停止。不得接教学、repair或主线；这些必须另立任务单。
