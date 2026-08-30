# 《语灵》GitHub 回合制工程底座先验 Review

状态：`RESEARCH COMPLETE / FOUNDATION DECISION / NO RUNTIME CHANGE`

日期：2026-08-30

## 1. 结论

《语灵》不应自行继续堆叠页面状态、计时器和条件跳转，也不应为了一场移动端单角色战斗引入完整 RPG 或多人桌游引擎。

工程底座采用以下组合：

> **XState v5 负责流程编排；现有纯 TypeScript 领域函数负责战斗结算；借鉴 boardgame.io 的纯动作、显式阶段、追加式日志和无界面模拟测试。**

第一轮只做隔离式 foundation spike，不接主线、不改数值、不改教学内容、不改词源，也不同时重做界面。

## 2. GitHub 候选审查

### XState：采用为流程编排底座

仓库：https://github.com/statelyai/xstate

选择理由：

- 核心定位就是事件驱动状态机、状态图与 actor，适合约束多阶段交互；
- TypeScript / JavaScript 原生，核心零依赖，并有官方 React 集成；
- 支持 guard、action、显式最终状态，能阻止非法跳转；
- 官方项目包含图遍历和模型化测试工具，可覆盖正常、失败、补弱、再战等路径；
- MIT 许可，维护活跃，适合当前 Next / React 技术栈。

它在《语灵》中只负责回答“现在处于哪个阶段、允许接收什么事件、下一步去哪”，不负责推断伤害、词义、FSRS、学习证据或正式内容。

### boardgame.io：不直接采用，只借成熟模式

仓库：https://github.com/boardgameio/boardgame.io

值得借鉴：

- move 是纯函数；
- phase / turn 顺序明确；
- `onBegin`、`onEnd`、`endIf` 等生命周期钩子集中管理；
- 对局日志、撤销/重做和无界面模拟属于一等能力。

不直接采用的原因：

- 它面向多人桌游，包含网络、服务端、房间、存储、Redux、Koa、Socket.IO 等完整运行时；
- 当前项目是单机移动端 Web 叙事 RPG，引入后大部分能力不会使用；
- 会扩大部署面、依赖面和调试面，却不能替代《语灵》自己的学习证据与战斗领域规则。

因此只吸收设计方法，不引入依赖，也不复制实现代码。

### Robot3：保留为轻量备选，不作为首选

仓库：https://github.com/matthewp/robot

优点是体积小、函数式、不可变状态、有 React 集成。它足以完成简单状态机，但生态、可视化和模型化路径测试能力弱于 XState。当前连续闭环已经包含证据检查、战斗、战败、补弱和再战，选择 XState 的长期可验证性收益更高。

只有在隔离 spike 证明 XState 对移动端构建产生不可接受的实际影响时，才回退测试 Robot3；不能凭包体印象提前重复实现两套。

### RPG-JS：拒绝

仓库：https://github.com/RSamaium/RPG-JS

它覆盖地图、移动、多人同步、服务端权威、预测、GUI、物品栏和存档等整套浏览器 RPG 架构。功能成熟，但与《语灵》当前“背景/立绘/节点交互/移动端页面式战斗”的产品形态不匹配。采用它等同于重搭游戏运行时，风险和迁移成本远高于收益。

### rot.js：拒绝

仓库：https://github.com/ondras/rot.js

它擅长 roguelike 地图生成、视野、路径和调度。《语灵》当前不做自由走格、地牢地图或 FOV，核心能力用不上，不应为了“回合制”标签引入。

## 3. 目标架构

### A. 领域结算层：纯 TypeScript

职责：

- 技能基础效果；
- mastery 奖励；
- 敌方意图；
- 护盾、回复、伤害与胜负；
- weakness 事件；
- 确定性取整与结算顺序。

要求：给定相同输入必须得到相同输出；不得读取 React 状态、DOM、计时器或页面路由。

### B. 流程层：XState machine

第一版状态边界：

```text
checking_evidence
  → skill_select
  → word_call
  → player_result
  → enemy_result
  → skill_select | victory | defeat
  → repair_meaning
  → repair_retrieve
  → rematch
```

纯战斗 debug 可从 `skill_select` 开始；完整 Phase B 必须先经过 `checking_evidence`，证据断链必须进入明确错误状态，不能偷偷退化为 no-call。

关键 guard：

- 教学后存在 `Used-or-Maintained + battleEligible` 词；
- 当前战斗未结束；
- 当前事件属于当前阶段；
- 敌人存活时才执行敌方行动；
- 战败后存在真实 weakness 才进入 repair；
- 当前词完成 meaning + retrieve 后才允许推进；
- 全部 weakness 修复后才允许 rematch。

### C. 事件日志：追加式领域事件

借鉴 boardgame.io，但只实现本项目需要的最小事件：

- `EVIDENCE_READY`
- `SKILL_SELECTED`
- `SUPPORT_USED`
- `WORD_ANSWERED`
- `PLAYER_EFFECT_RESOLVED`
- `ENEMY_EFFECT_RESOLVED`
- `WEAKNESS_RECORDED`
- `REPAIR_MEANING_COMPLETED`
- `REPAIR_RETRIEVED`
- `REMATCH_STARTED`

日志用于验证、复盘和未来成长证据，不把页面提示文案当作业务状态。

### D. React 表现层

页面只订阅 machine snapshot、展示当前阶段并发送事件。动画和延时只能延迟“何时允许继续”，不能偷偷承担伤害计算或改变学习证据。

## 4. 隔离 spike 的工程门槛

下一步不是直接重写 Phase B，而是先对已通过的 `/prototype/intent-combat` 做等价迁移验证：

1. 固定当前 Intent Combat 的输入与期望输出；
2. 抽出或复用纯结算函数；
3. 用 XState 替代页面内的流程分支和计时推进；
4. 旧版与 machine 版对同一行动序列产生完全一致的 HP、护盾、意图、weakness 和胜负；
5. 覆盖击杀后敌人不行动、压制保留到真正攻击、战败进入 repair、修完才能再战等非法路径；
6. 实测生产构建和移动端加载影响，再决定是否正式保留依赖；
7. spike 通过后，才另立任务单接回“教学 → 战斗 → repair → 再战”。

失败条件：

- 为适配状态机而改动战斗数值或产品规则；
- 把 FSRS、5505词源或长期成长数据塞进临时战斗 machine；
- 引入 boardgame.io、RPG-JS、rot.js 或第二套状态机；
- 同时改页面视觉、正式文案、主线或冻结剧情；
- 只能靠浏览器点击测试，无法无界面重放代表战斗。

## 5. 依赖策略

若进入 spike，初始只允许精确锁定：

- `xstate@5.32.6`
- `@xstate/react@6.1.0`

版本来自本次研究时的 npm / GitHub 当前信息；安装前仍需重新核验。不得同时安装可视化编辑器、多人服务端或其他游戏框架。

## 6. 对现有项目的边界

本裁决不改变：

- EP01–EP03冻结；
- 正式5505词源唯一性；
- `ts-fsrs` 调度职责；
- Intent Combat V1 产品骨架；
- 教学证据、battleEligible、真实 weakness、两步 repair；
- 主线迁移仍未授权。

本文件只确定后续工程不再闭门手写流程底座。运行代码和依赖均尚未修改。

## 7. 最终裁决

> **采用 XState 作为《语灵》学习—战斗连续流程的编排底座；保留纯 TypeScript 战斗领域层；借鉴 boardgame.io 的成熟测试与日志模式；拒绝整套 RPG/桌游/roguelike 引擎。**

下一张任务单必须是独立 foundation spike，而不是主线迁移或功能扩建。
