# 《语灵》Intent Combat XState Foundation Spike 工程交接

状态：`IMPLEMENTED / AUTOMATED PASS / WAITING SOL REVIEW`

日期：2026-08-30

依据：`docs/INTENT_COMBAT_XSTATE_FOUNDATION_SPIKE_TASK.md`

## 1. 完成范围

已将独立入口 `/prototype/intent-combat` 的临时 React 流程状态等价迁移到 XState v5。此轮只验证流程底座，不改变 Intent Combat V1 的技能数值、敌方意图、词源、英语奖励、压制、护盾、回复、weakness、胜负或两段反馈语义。

迁移后的页面只订阅 machine snapshot 并发送事件；领域结算仍由 `app/game/intent-combat-v1.ts` 的既有纯函数完成。没有接入主线、教学、repair、FSRS、成长、存档或长期学习数据。

## 2. Machine 行为证据

- 显式阶段为 `skill_select`、`word_call`、`player_result`、`enemy_result`、`won`、`lost`。
- 英语模式按“选技能 → 词义调用 → Step 1技能结果 → Step 2敌方结果”推进；纯战斗模式从 `skill_select` 直接进入 `player_result`，不产生调用、奖励或 weakness。
- `SELECT_SKILL`、`USE_SUPPORT`、`ANSWER`、`CONTINUE`、`SELECT_MODE`、`RESTART` 均由 machine 统一编排；错误阶段事件被忽略。
- 击杀在 `player_result` 后直接进入 `won`，不会产生敌方行动页；战败在敌方结果确认后进入 `lost`。
- 水音压制、蓄力保留、下一次真实攻击消费、护盾吸收与清除、回复上限和 weakness 均通过既有领域纯函数得到，machine 不复制战斗公式。
- `RESTART` 清空本场瞬时状态；context 只包含 `battle`、`mode`、`selectedCall`、`supportUsed`、`outcome`、`counts`。

## 3. 修改路径

- `app/game/intent-combat-machine.ts`：新增 XState v5 machine 与本场瞬时 context/event 类型。
- `app/prototype/intent-combat/page.tsx`：用 `useMachine` 替代页面内多组流程 `useState`/`useMemo`，保留既有展示和反馈文案。
- `scripts/validate-intent-combat-xstate.ts`：新增无界面 actor、阶段、非法事件、领域结果等价、终态与重开验证。
- `scripts/validate-intent-combat-v1.ts`：仅更新页面结构断言，使其验证 machine 边界，不再依赖已移除的页面内 resolver 名称。
- `package.json`：精确加入 `xstate@5.32.6`、`@xstate/react@6.1.0` 与专项 validator script。
- `package-lock.json`：记录上述依赖及其必要传递依赖。
- `docs/INTENT_COMBAT_XSTATE_FOUNDATION_HANDOFF.md`、`docs/INTENT_COMBAT_XSTATE_FOUNDATION_SOL_REVIEW.md`：本轮交接与 Sol Review 输入。

未修改 `app/page.tsx`、Phase A/B/C、fusion-slice、zero-base、主线、EP01–EP03、V2规格、5505词源或正式剧情文件。

## 4. 自动验证

- `npm run validate:intent-combat-v1`：`19/19 PASS`。
- `npm run validate:intent-combat-xstate`：`18/18 PASS`。
- 全量既有 `validate:*`：全部通过，包括 narrative、gameplay、dev-presets、learning-adventure、skill-guidance、initial-bond、EP01–EP03、zero-base、fusion、V2、Phase B flow、Candidate A/B/C 与 Intent V1。
- `npm run lint`：`PASS`。
- `npm run build`：`PASS`；独立路由 `/prototype/intent-combat` 成功构建。
- `git diff --check`：`PASS`。

专项 validator 覆盖 actor 初始 context、英语三档、纯战斗直达、非法事件、蓄力后的水音压制、下一次攻击消费、护盾/回复、领域函数逐项等价、击杀跳过敌方结果、重开复位、依赖锁定与 React 单一 machine 真源。

## 5. 构建影响

比较基线为迁移前 HEAD `3a70f51a5378eadb1d69b5ddd4254ffcd3033314` 的生产构建；两次均使用同一项目构建流程。以下是构建目录的原始未压缩文件系统字节数，不是 gzip 数字：

| 产物范围 | 迁移前 | 迁移后 | 变化 |
| --- | ---: | ---: | ---: |
| `dist` | 117 files / 15,063,158 bytes | 117 files / 15,139,889 bytes | +76,731 bytes |
| `dist/client` | 50 files / 13,905,473 bytes | 50 files / 13,944,178 bytes | +38,705 bytes |
| `dist/client` JS/CSS | 26 files / 787,071 bytes | 26 files / 825,776 bytes | +38,705 bytes |

文件数量未增加；新增运行时依赖为 XState 与官方 React 绑定，传递依赖为 `use-isomorphic-layout-effect` 与 `use-sync-external-store`。构建日志中的 gzip 计算未被当作本表数据，也未虚构 gzip 体积。

## 6. 390×844 实机状态

本执行代理未操作浏览器；英语独立/支架/错误、纯战斗、胜利或战败、重开及横向溢出检查仍由主代理完成。无界面 actor 已覆盖对应状态路径，不能替代主代理的实际点击与运行错误检查。

## 7. 停止线与风险

- 本轮不提交、不 push、不发布；等待主代理审查并统一提交。
- XState 已验证独立战斗底座可用，但尚未证明接回 Phase B 教学→战斗→repair→再战闭环。
- 当前 machine 不含事件日志、持久化或长期学习证据，后续若需要必须另立任务单。
- 构建增量是当前真实 raw artifact 比较结果；正式移动端性能仍需主代理结合 390×844 实机判断。
