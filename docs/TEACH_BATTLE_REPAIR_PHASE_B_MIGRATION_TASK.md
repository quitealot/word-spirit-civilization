# 《语灵》Phase B：教学 → 战斗 → 补弱 → 再战工程迁移任务单

状态：`READY FOR CODEX / PHASE-B ONLY`
日期：2026-08-27

依赖规格：

1. `docs/TEACH_BATTLE_REPAIR_PHASE_B_SPEC.md`
2. `docs/SKILL_ENGLISH_SYSTEM_V2.md`
3. `docs/SKILL_ENGLISH_SYSTEM_V2_ENGINEERING_LOCK.md`
4. `docs/SKILL_ENGLISH_SYSTEM_V2_PHASE_A_SOL_ACCEPTANCE.md`
5. 根目录 `AGENTS.md`
6. `app/AGENTS.md`

本任务只把已经存在的“零基础教学原型”和“V2 Phase A 战斗原型”连成一条连续体验。不得借机进入主线、扩九技能或增加新系统。

---

## 一、任务目标

只验证这一条闭环：

`语灵站日常完成 → 直接进入测试战斗 → 暴露真实薄弱词 → 针对训练 → 立即再战`

工程目标不是重做教学或战斗，而是消除当前的两层拼接：

- 教学结束后的“你刚刚读懂了三句英语”总结页；
- 战斗前的“世界教学证据 / 几个测试词可进入战斗 / 直接挑战”等开发菜单。

Phase B 连续路径中，玩家应自然感到自己只是把刚刚会的东西带进了下一段行动。

---

## 二、冻结入口与模式

### 2.1 Phase B 主验收入口

冻结使用：

`/prototype/zero-base?flow=phase-b`

该 query 只用于独立原型串联，不进入正式主线。

### 2.2 独立 debug 入口继续保留

以下入口继续保留原有调试能力：

- `/prototype/zero-base`
- `/prototype/fusion-slice`

不得为了 Phase B 删除现有开发调试信息或 Phase A 的 no-call 验证能力；只要求 `flow=phase-b` 的主验收路径隐藏这些开发层。

### 2.3 页面衔接

Phase B 不要求把两个页面重构成一个大型组件，也不要求新建总状态机。

允许最小实现：

1. 教学页完成后，通过客户端路由进入 `/prototype/fusion-slice?flow=phase-b`；
2. 战斗页识别 `flow=phase-b` 后，跳过自己的菜单，直接进入技能选择。

页面路由可以变化，但玩家路径中不得再出现“第二个原型首页”。

---

## 三、教学结束 → 战斗的冻结状态流

现有教学正文、词义、证据写入逻辑全部保留。

玩家完成最后一个真实动作 `help people` 后：

### 普通 debug 模式

继续保留现有教学总结页，方便独立调试。

### `flow=phase-b` 模式

禁止显示现有：

- `你刚刚读懂了三句英语。`
- 三句英语总结卡；
- `带着已学词进入测试战斗` 这类开发说明。

只允许一个很短的完成停顿，然后最多一次继续操作。

Phase B 冻结的最小玩家侧内容：

- `事情做完了。`
- 主按钮：`继续`

点击 `继续` 后直接进入 `/prototype/fusion-slice?flow=phase-b`。

不得新增角色对白；不得新增剧情理由。

---

## 四、Phase B 战斗入口

`/prototype/fusion-slice?flow=phase-b` 加载后：

1. 读取现有零基础教学证据；
2. 按 V2 现有规则得到合格词池；
3. **直接进入技能选择**；
4. 不显示融合切片菜单；
5. 不显示开发诊断卡。

连续路径中隐藏：

- `Learning × Adventure · V2 Phase A`
- `世界教学证据`
- `x/2 个测试词可进入战斗`
- `训练不是战斗硬门票`
- `直接挑战`
- `Used / Maintained / battleEligible / evidence / word pool` 等后台术语。

Phase B 进入点来自完整教学闭环，因此本验收路径应已有当前批准的 `water` 与 `help` 战斗资格。

如果 `flow=phase-b` 下意外没有任何合格词：

- **不得静默退化成 no-call 战斗**，以免掩盖教学证据断链；
- 立即停止该连续路径并显示开发故障标记：`PENDING_K3: phase-b evidence missing`；
- 不自行修复学习状态，不自动补写 Used。

独立 `/prototype/fusion-slice` debug 模式仍保留 Phase A no-call 路径。

---

## 五、第一次英语调用的因果提示

玩家仍然必须：

`先选技能 → 再展开英语调用`

在 Phase B 连续路径的**第一场战斗、第一次英语调用**中，允许且只允许增加一次轻量标签：

`刚才用过`

规则：

- 只出现一次；
- 不改变题目与技能结算；
- 再战不重复显示；
- 不显示任何学习状态术语；
- 刷新导致原型局部状态重置不要求新增持久化系统，本阶段不扩展跨刷新记忆。

---

## 六、第一场战斗：薄弱词来源

完全沿用 Phase A 战斗规则：

- independent = `1.00`
- supported = `0.70`
- failed = `0.40`
- 思考时间不改倍率
- 水音 / 回潮效果与结算顺序不变
- 战斗词池不按技能语义分词

Phase B 不修改 `app/game/fusion-slice.ts` 的 Phase A 核心结算，除非遇到无法通过 UI 编排解决的阻塞；若必须修改该文件，先停止并报告 Sol，不得自行扩范围。

薄弱词规则继续为：

- 只来自本场真实非 independent 调用；
- 同一个 `wordId` 一场只保留一次；
- 没有薄弱词就不进入针对训练；
- no-call 不生成薄弱词；
- `supported = 70%` 是否应强制补弱本阶段继续沿用现状，不自行修改。

Phase B 主验收必须人工故意制造至少一次 `failed = 40%`。

---

## 七、战后页：只显示刚才真实薄弱内容

`flow=phase-b` 下，战后不显示课程式错题本、总词表或学习总结。

只显示当前 `weaknesses` 中真实存在的 `wordId`。

每个薄弱词允许的最小信息：

- 单词本身；
- 刚才对应技能名；
- 当次发挥百分比。

冻结系统 UI 文案：

- 标题：`再确认一下`
- 主按钮：`处理刚才的问题`

禁止：

- `WRONG`
- `错误单词`
- `英语很差`
- 新角色对白
- 新解释文案

如果第一场战斗 `weaknesses.length === 0`：

- 不进入 targeted；
- 不进入现有课程式 `result` 总结页；
- 显示最小结束状态 `战斗结束`；
- Phase B 本次流程到此结束。

---

## 八、针对训练：冻结为两步

每个真实薄弱词只允许两步。

### Step 1：重新建立意义

复用正式源中已有：

- `word`
- `targetGloss`

界面只显示：

`{word} → {targetGloss}`

主按钮：

`再试一次`

禁止新增：

- 新例句；
- 新词义；
- 同义词辨析；
- 语法解释；
- 额外词；
- 新题型。

### Step 2：独立确认

收起 `targetGloss`，只显示：

- 当前 `word`；
- 当前切片已有的选择项。

玩家独立选择。

正确：

- 该词本次 repair 完成；
- 如果还有其他真实薄弱词，进入下一个词的 Step 1；
- 如果已经全部完成，短暂反馈后**自动进入再战**，不增加“训练完成”中转页。

错误：

- 回到同一个词 Step 1；
- 不换词；
- 不增加新提示层；
- 不增加新题型。

冻结中性反馈：

- 正确：`重新确认了`
- 错误：`再看一次`

Phase B 的 targeted 过程不得修改长期 Mastery、星级、成长，也不得新增学习状态枚举。

本阶段允许只用页面内 transient state 记录“这个词刚完成 repair”；不得为此修改主存档 schema。

---

## 九、补弱完成 → 自动再战

最后一个薄弱词独立确认正确后：

1. 保留 `300–600ms` 的短反馈；
2. 自动创建一场新的同配置测试战斗；
3. HP 正常重置；
4. 技能、敌人、V2 数值不变；
5. 不回教学页；
6. 不回融合切片菜单；
7. 不显示“针对训练完成”；
8. 不要求再点“立即再挑战”。

学习证据不回滚。

刚 repair 的词必须在再战前 **2 次英语调用以内**重新出现。

当前两词原型继续使用 Phase A 的确定性轮换即可满足：

- repair `water` → 第 1 次调用重新出现；
- repair `help` → 最迟第 2 次调用重新出现。

不得为 Phase B 新建长期正式抽词算法。

---

## 十、再战后的结束逻辑

再战继续使用正常 V2 战斗规则。

如果再战仍暴露真实薄弱词：

- 允许再次进入同样的两步 repair；
- 不增加新的系统。

如果再战没有薄弱词：

- 显示最小结束状态：`战斗结束`；
- 不弹“进步报告”；
- 不弹课程总结；
- 不自动追加新的学习页。

本阶段只验证玩家能否从技能 100% 的实际伤害 / 回复 / 削弱中感到“这次更顺”。

---

## 十一、允许修改文件

本轮优先只允许修改：

- `app/prototype/zero-base/page.tsx`
- `app/prototype/fusion-slice/page.tsx`
- `app/prototype.css`（仅原型连续体验确需的最小样式）
- `scripts/validate-phase-b-flow.ts`（新建）
- `package.json`（只新增 `validate:phase-b-flow`）
- `docs/TEACH_BATTLE_REPAIR_PHASE_B_HANDOFF.md`（完成后新建）

如确实需要把 query/mode/repair 队列逻辑抽成纯函数，可新增：

- `app/game/phase-b-flow.ts`

限制：

- 必须是原型专用的轻量纯函数/纯配置；
- 不得演化成新的正式状态机或学习系统；
- 不得被主线引用。

---

## 十二、明确禁止修改文件与范围

除非先停下重新 Review，否则不得修改：

- `app/page.tsx`
- `app/game/fusion-slice.ts` Phase A 核心战斗结算
- `app/game/bridge-config.ts`
- `app/game/spirit-config.ts`
- `app/game/zero-base-teaching.ts`
- `app/learning-engine.ts`
- `app/narrative/**`
- EP01 / EP02 / EP03 任何冻结内容
- 主存档 schema
- 正式 5505 词源
- L2 / L3
- 成长、等级、星级、共鸣
- 另外七个技能
- 正式技能动画
- 新敌人、新关卡、新剧情、新正式对白

如果实现发现必须修改这些内容才能继续，立即停止并报告，不得自行扩大范围。

---

## 十三、必须新增的 Phase B 自动验证

新增：

`npm run validate:phase-b-flow`

validator 至少覆盖以下 16 项：

1. `flow=phase-b` 是独立原型模式，不改变默认 debug 模式；
2. 教学完成状态仍能保留 `water/help` 的正式 Used/Maintained 证据；
3. Phase B 进入战斗时只使用 `Used-or-Maintained + battleEligible`；
4. Phase B 连续入口没有合格词时必须被视为证据断链，不允许自动走 no-call；
5. 独立 `/prototype/fusion-slice` 仍保留 Phase A no-call 能力；
6. Phase B 第一场第一次调用可标记 `刚才用过`，后续调用/再战不重复；
7. failed 调用只把真实 `wordId` 加入 weaknesses；
8. 同一个 `wordId` 一场只保留一次 weakness；
9. independent 全场结束时 weaknesses 为空，不产生假的 targeted；
10. repair 队列只来自 weaknesses，不引入其他词；
11. repair 必须经过 `meaning → retrieve` 两步；
12. repair retrieve 再次错误时回到同一个词 meaning，不前进到其他词；
13. repair retrieve 正确后不改变主学习状态枚举/不自动晋升长期 Mastery；
14. 最后一个 repair 成功后进入新战斗，不经过 menu/result/trained 中转；
15. 修复 `water/help` 后，当前确定性两词轮换保证被修词在再战前 2 次调用以内出现；
16. Phase B 不修改 100/70/40、no-call、技能配置或反应时间规则。

如果 React 页面行为无法全部通过纯函数 validator 验证，允许对 `flow=phase-b` 的关键 route/mode helper 做小型纯函数抽取；禁止为了写测试而新造正式系统。

---

## 十四、必须运行的回归

Codex 完成后必须运行：

- `npm run validate:phase-b-flow`
- `npm run validate:skill-english-v2`
- `npm run validate:fusion-slice`
- `npm run validate:zero-base-teaching`
- `npm run lint`
- `npm run build`
- `git diff --check`

并做冻结文件 diff 审计，明确确认以下无 diff：

- `app/page.tsx`
- `app/game/fusion-slice.ts`
- `app/game/bridge-config.ts`
- `app/game/spirit-config.ts`
- `app/game/zero-base-teaching.ts`
- `app/narrative/**`

---

## 十五、390×844 必走实机路径

### 路径 A：完整失败 → 补弱 → 再战

1. 从 `/prototype/zero-base?flow=phase-b` 开始；
2. 完整走完语灵站日常；
3. 最后 `help people` 行动结束；
4. 只经过一次 `继续`，直接进入技能选择；
5. 不看到教学总结页；
6. 不看到融合切片菜单/开发诊断卡；
7. 第一场第一次英语调用只出现一次 `刚才用过`；
8. 故意把 `water` 或 `help` 答错一次，看到对应技能 40% 发挥；
9. 战斗结束后只看到真实薄弱词；
10. 进入 repair Step 1，看到 `word → targetGloss`；
11. 点击 `再试一次`，进入 Step 2；
12. 在 Step 2 故意再错一次，确认回到同一个词 Step 1；
13. 再次进入 Step 2 并独立正确；
14. 最后一个 repair 完成后无需点“立即再挑战”，自动进入新战斗；
15. 被修词在前 2 次调用以内重新出现；
16. 该次独立正确时技能按 100% 实际效果结算；
17. 若再战无薄弱词，只显示最小 `战斗结束`，没有课程总结。

### 路径 B：第一战全 independent

1. 同样从 Phase B 教学入口开始；
2. 第一场所有英语调用均 independent；
3. 战斗结束后不出现针对训练；
4. 直接进入最小 `战斗结束`；
5. 不出现假的错词或进步报告。

### 路径 C：独立 debug 回归

1. `/prototype/zero-base` 原独立教学仍可单独玩；
2. `/prototype/fusion-slice` 原 Phase A debug 菜单仍存在；
3. no-call 真实技能路径仍可验证；
4. 不因 Phase B 串联破坏原调试入口。

通用：

- 390×844 无横向溢出；
- 控制台无错误或警告；
- 不新增正式技能动画。

---

## 十六、Phase B 实机 Review 需要人工回答的问题

工程完成不代表产品通过。交接时必须把以下问题留给用户/Sol 实机裁决：

1. 我有没有感觉自己从一个学习 Demo 跳进另一个战斗 Demo？
2. 第一次看到 `刚才用过` 时，我是否自然理解为什么这个词会进入战斗？
3. 战后只出现刚才卡住的词时，是否像“修刚才的问题”，而不是打开错题本？
4. repair 两步是否足够短？
5. 自动再战是否自然，还是太突然？
6. 被修词再次出现时，我是否感到更顺，而不是机械重考？
7. supported 70% 进入 repair 是否让人烦？
8. 整段是否像一条经历，而不是学习 → 考试 → 复习三个模块？

产品通过门：至少原 Phase B 五条体验问题中的前四条明显成立，才允许讨论主线迁移。

---

## 十七、停止线

Phase B 完成后立即停止，等待用户 / Sol 实机 Review。

不得继续：

- 接入主线 `app/page.tsx`；
- 迁移另外七技能或完整九技能；
- 修改 EP01–EP03；
- 做正式技能动画；
- 增词、加敌人、加关卡、加剧情；
- 扩成长、等级、星级、共鸣；
- 修改 FSRS / Mastery Layer；
- 修改长期正式抽词算法；
- 新增大系统；
- 顺手重构 Phase A 全局战斗。

---

## 十八、交付要求

Codex 完成后必须提交：

- 修改文件清单；
- 明确未修改文件清单；
- `validate:phase-b-flow` 16项结果；
- Phase A / zero-base / fusion-slice 回归结果；
- lint / build / `git diff --check`；
- 390×844 三条实机路径结果；
- 控制台状态；
- GitHub commit SHA；
- `docs/TEACH_BATTLE_REPAIR_PHASE_B_HANDOFF.md`。

完成后停止，不得自行进入主线。