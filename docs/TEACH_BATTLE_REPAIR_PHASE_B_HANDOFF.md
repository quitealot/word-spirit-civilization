# 《语灵》Phase B：教学 → 战斗 → 补弱 → 再战工程交接

状态：`IMPLEMENTED / WAITING FOR PHASE-B SOL REVIEW`

主验收入口：`/prototype/zero-base?flow=phase-b`

## 实现范围

- 教学完成后，Phase B 路径只显示“事情做完了。”与一次“继续”，随后进入战斗技能选择。
- `/prototype/fusion-slice?flow=phase-b` 跳过融合切片菜单和开发诊断信息。
- Phase B 入口只接受现有 `Used-or-Maintained + battleEligible` 证据；缺失时显示 `PENDING_K3: phase-b evidence missing`，不退化成 no-call。
- 第一场第一次英语调用只显示一次“刚才用过”，后续调用和再战不重复。
- 战后只显示本场真实 weaknesses；无 weakness 时直接显示“战斗结束”。
- Phase B repair 固定为 `meaning → retrieve` 两步；retrieve 再错回同词 meaning，最后一个词确认后 450ms 自动创建新战斗。
- 再战保留 Phase A 确定性两词轮换，修复词在前 2 次调用内重新出现。
- 默认 `/prototype/zero-base` 与 `/prototype/fusion-slice` 调试入口保持原能力，Phase A no-call 路径保留。

## 修改文件

- `app/prototype/zero-base/page.tsx`
- `app/prototype/fusion-slice/page.tsx`
- `app/prototype.css`
- `app/game/phase-b-flow.ts`
- `scripts/validate-phase-b-flow.ts`
- `package.json`
- `docs/TEACH_BATTLE_REPAIR_PHASE_B_HANDOFF.md`

## 明确未修改

- 未修改 `app/page.tsx`。
- 未修改 `app/game/fusion-slice.ts` Phase A 核心战斗结算。
- 未修改 `app/game/bridge-config.ts`、`app/game/spirit-config.ts`、`app/game/zero-base-teaching.ts`、`app/learning-engine.ts`。
- 未修改 `app/narrative/**`、EP01–EP03、正式 5505 词源、主存档、成长、L2/L3。
- 未新增词、敌人、关卡、剧情、正式对白、另外七个技能或正式技能动画。

## 自动验证

- `validate:phase-b-flow`：16/16 PASS。
- `validate:skill-english-v2`：PASS。
- `validate:fusion-slice`：PASS。
- `validate:zero-base-teaching`：PASS。
- TypeScript、lint、build、`git diff --check`：PASS。
- 冻结文件差异审计：PASS，无禁止文件 diff。

## 390×844 实机结果

### 路径 A：failed → repair → 自动再战

- 完整完成语灵站日常；总结卡与开发进度信息未出现在 Phase B 路径。
- 一次“继续”后直接出现水音/回潮技能选择，没有融合切片菜单。
- 第一次调用 `water` 只显示一次“刚才用过”；故意答错后水音按 40% 发挥并记录唯一真实 weakness。
- 战后只显示 `water / 水音 / 40%`。
- repair Step 1 显示 `water → 水`；Step 2 收起答案；再次答错回到同一个 `water` Step 1。
- 独立确认正确后显示“重新确认了”，无需按钮，自动进入 HP 重置的新战斗。
- 再战第一次调用即重新出现 `water`；独立正确时水音按 100% 发挥。
- 再战无 weakness 时只显示“战斗结束”。

### 路径 B：第一战全 independent

- 从 Phase B 教学完成入口进入，四次调用全部独立正确。
- 战后直接显示“战斗结束”，没有 targeted、假错词、进步报告或课程总结。

### 路径 C：独立 debug 回归

- `/prototype/zero-base` 继续显示独立教学总结、重开按钮与本地过程记录。
- `/prototype/fusion-slice` 继续显示 Phase A 菜单和教学证据诊断。
- 全新无词来源下，直接挑战仍使用真实「回潮」40% 路径，15 回合将敌方 HP 降为 0；未出现英语调用或 weakness。
- `flow=phase-b` 在同一无证据来源下明确显示证据断链标记，没有进入 no-call。

三条路径均无横向溢出；开发环境控制台无错误或警告；未新增正式动画。

## 留给用户 / Sol 的实机裁决

1. 是否仍感觉从一个学习 Demo 跳进另一个战斗 Demo？
2. “刚才用过”是否自然解释了词为什么进入战斗？
3. 战后只出现刚才卡住的词，是否像修刚才的问题而非打开错题本？
4. repair 两步是否足够短？
5. 自动再战是否自然，还是太突然？
6. 修复词再次出现时是否更顺，而不是机械重考？
7. supported 70% 进入 repair 是否令人烦躁？
8. 整段是否像一条经历，而非学习、考试、复习三个模块？

## 停止线

Phase B 工程完成后停止。未经下一次 Sol Review，不进入主线、不迁移九技能、不修改 EP01–EP03、不扩系统。
